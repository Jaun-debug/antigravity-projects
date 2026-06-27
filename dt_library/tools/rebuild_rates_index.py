#!/usr/bin/env python3
"""
rebuild_rates_index.py — regenerate ratesheet rates for assets/rates-index.json

WHY THIS EXISTS
---------------
The rate sheets in /ratesheets render their rate tables with runtime JavaScript
(parseRates() builds <input class="qty" data-name="'+label+'" ...>). Any index
generator that reads the STATIC html (without executing JS) captures the literal
template string  '+label+'  instead of real values — which is how 142/197 lodges
ended up with a single bogus rate {"n": "'+label+'", "p": 0}.

This script parses the rate data straight from each sheet's static <table> (room
name + STO/net price), the same way a browser would after parseRates runs, but
smarter: it picks the net column by header, strips "N$" prefixes, keeps one entry
per price column (so Single + Sharing and Low + High seasons all survive), and
skips fee / conservation / rack columns.

USAGE
-----
    cd "AG Projects/dt_library"
    python3 tools/rebuild_rates_index.py            # repair only broken lodges (safe default)
    python3 tools/rebuild_rates_index.py --all      # re-parse EVERY lodge from its sheet
    python3 tools/rebuild_rates_index.py --dry-run  # report what would change, write nothing

A timestamped backup of assets/rates-index.json is written before any change.
The lodge list and region mapping are preserved from the existing index — only
the rates[] arrays are rebuilt. NEW lodges/regions must still be added by hand.

Requires: beautifulsoup4  (pip install beautifulsoup4)
"""
import json, os, re, sys, datetime, argparse
from bs4 import BeautifulSoup

ROOT      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX     = os.path.join(ROOT, "assets", "rates-index.json")
SHEET_DIR = os.path.join(ROOT, "ratesheets")

# ---- table parsing -------------------------------------------------------
def clean_text(s): return re.sub(r'\s+', ' ', (s or '')).strip()

def to_number(raw):
    """float if the cell is essentially a price (strips N$, commas, parens), else None."""
    if raw is None: return None
    t = raw.strip()
    if t == '': return None
    if t.lower() in ('n/a','na','-','—','free','n.c.','nc','included','incl','on request','o/r'):
        return None
    t2 = re.sub(r'\([^)]*\)', '', t)
    t2 = t2.replace('N$','').replace('n$','').replace('NAD','').replace('ZAR','').replace('R ','')
    t2 = t2.replace(',', '').strip()
    return float(t2) if re.fullmatch(r'-?\d+(\.\d+)?', t2) else None

def cell_text(td):
    for inp in td.find_all('input'): inp.extract()
    return clean_text(td.get_text(' ', strip=True))

GENERIC_HDR = re.compile(r'rate|price|n\$|nad|per person|pp\b|p\.p|sto|net|amount|cost|tariff', re.I)
FEE_HDR     = re.compile(r'rack|gross|\bfee\b|conservation|levy|park|tourism|commission|deposit', re.I)
NET_HDR     = re.compile(r'\bsto\b|\bnet\b', re.I)

def parse_table(table):
    rates = []
    headers, hdr_row = [], None
    thead = table.find('thead')
    if thead:
        trs = thead.find_all('tr')
        if trs: hdr_row = trs[-1]
    if hdr_row is None:
        for tr in table.find_all('tr'):
            if tr.find('th'): hdr_row = tr; break
    if hdr_row is not None:
        headers = [clean_text(c.get_text(' ', strip=True)) for c in hdr_row.find_all(['th','td'])]

    body = []
    thead_trs = thead.find_all('tr') if thead else []
    for tr in table.find_all('tr'):
        if tr in thead_trs or tr is hdr_row: continue
        cells = tr.find_all(['td','th'])
        if len(cells) < 2: continue
        body.append(cells)
    if not body: return rates

    ncol = max(len(r) for r in body)
    col_vals = [[] for _ in range(ncol)]
    for cells in body:
        for ci in range(ncol):
            col_vals[ci].append(cell_text(cells[ci]) if ci < len(cells) else '')

    price_cols = []
    for ci in range(ncol):
        vals = [v for v in col_vals[ci] if v != '']
        if not vals: continue
        numc = sum(1 for v in vals if to_number(v) is not None)
        if numc >= max(1, len(vals)*0.5): price_cols.append(ci)
    if not price_cols: return rates

    first_price = min(price_cols)
    name_cols = [ci for ci in range(first_price) if ci not in price_cols] or [0]
    hdr = lambda ci: headers[ci] if ci < len(headers) else ''

    net_cols = [ci for ci in price_cols if NET_HDR.search(hdr(ci))]
    keep = net_cols or [ci for ci in price_cols if not FEE_HDR.search(hdr(ci))] or price_cols
    multi = len(keep) > 1

    for cells in body:
        gt = lambda ci: cell_text(cells[ci]) if ci < len(cells) else ''
        name_parts = [gt(ci) for ci in name_cols if gt(ci)]
        base = ' — '.join(name_parts).strip(' —')
        if not base: continue
        for ci in keep:
            val = to_number(gt(ci))
            if val is None: continue
            h = hdr(ci)
            if multi and h and not GENERIC_HDR.fullmatch(h or ''):
                label = f"{base} — {h}"
            elif multi:
                label = f"{base} — {h}" if h else base
            else:
                label = base
            rates.append({'n': label, 'p': val})
    return rates

def parse_sheet(path):
    soup = BeautifulSoup(open(path, encoding='utf-8', errors='ignore').read(), 'html.parser')
    out, seen = [], set()
    for table in soup.find_all('table'):
        for r in parse_table(table):
            key = (r['n'], r['p'])
            if key in seen: continue
            seen.add(key); out.append(r)
    return out

# ---- driver --------------------------------------------------------------
def is_broken(L):
    rs = L.get('rates') or []
    return (not rs) or any("+label+" in str(r.get('n','')) for r in rs) or all((r.get('p') or 0)==0 for r in rs)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--all', action='store_true', help='re-parse every lodge, not just broken ones')
    ap.add_argument('--dry-run', action='store_true', help='report only, write nothing')
    args = ap.parse_args()

    j = json.load(open(INDEX, encoding='utf-8'))
    fixed = kept = missing = zero = 0
    for L in j['lodges']:
        if not (args.all or is_broken(L)):
            kept += 1; continue
        path = os.path.join(SHEET_DIR, os.path.basename(L['file']))
        if not os.path.exists(path):
            missing += 1; print(f"  MISSING SHEET: {L['name']} ({os.path.basename(L['file'])})"); continue
        rs = parse_sheet(path)
        if rs: L['rates'] = rs; fixed += 1
        else:  zero += 1; print(f"  ZERO RATES:   {L['name']} ({os.path.basename(L['file'])})")

    print(f"\nlodges={len(j['lodges'])}  rebuilt={fixed}  untouched={kept}  missing={missing}  zero={zero}")
    if args.dry_run:
        print("dry-run: no file written."); return

    ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    bak = INDEX + f'.bak_{ts}'
    os.replace(INDEX, bak) if False else None  # keep original; write backup copy instead
    import shutil; shutil.copy2(INDEX, bak)
    j['generated'] = datetime.datetime.now().isoformat(timespec='seconds')
    j['count'] = len(j['lodges'])
    json.dump(j, open(INDEX, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f"wrote {INDEX}\nbackup {bak}")

if __name__ == '__main__':
    main()
