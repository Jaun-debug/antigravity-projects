#!/usr/bin/env python3
# Relabel 2026 rates[] with season + month prefixes (matching the 2027 style).
# SAFE: only replaces a lodge's rates when the parsed price multiset is identical
# to the existing one — so prices never change, only labels gain the season/months.
import json, os, re, datetime, shutil
from collections import Counter
from bs4 import BeautifulSoup
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX=os.path.join(ROOT,"assets","rates-index.json")
SHEET_DIR=os.path.join(ROOT,"ratesheets")
def clean(s): return re.sub(r'\s+',' ',(s or '')).strip()
def to_number(raw):
    if raw is None: return None
    t=raw.strip()
    if t=='' or t.lower() in ('n/a','na','-','—','free','n.c.','nc','included','incl','on request','o/r'): return None
    t2=re.sub(r'\([^)]*\)','',t).replace('N$','').replace('n$','').replace('NAD','').replace('ZAR','').replace('R ','').replace(',','').strip()
    return float(t2) if re.fullmatch(r'-?\d+(\.\d+)?',t2) else None
def cell_text(td):
    for inp in td.find_all('input'): inp.extract()
    return clean(td.get_text(' ',strip=True))
GEN=re.compile(r'rate|price|n\$|nad|per person|pp\b|p\.p|sto|net|amount|cost|tariff',re.I)
FEE=re.compile(r'rack|gross|\bfee\b|conservation|levy|park|tourism|commission|deposit',re.I)
NET=re.compile(r'\bsto\b|\bnet\b',re.I)
SEASON=re.compile(r'\b(low|high|shoulder|mid|green|peak|festive|value)\b|season',re.I)
def parse_table(table):
    rates=[];headers=[];hdr_row=None
    thead=table.find('thead')
    if thead:
        trs=thead.find_all('tr')
        if trs: hdr_row=trs[-1]
    if hdr_row is None:
        for tr in table.find_all('tr'):
            if tr.find('th'): hdr_row=tr;break
    if hdr_row is not None:
        headers=[clean(c.get_text(' ',strip=True)) for c in hdr_row.find_all(['th','td'])]
    body=[];thead_trs=thead.find_all('tr') if thead else []
    for tr in table.find_all('tr'):
        if tr in thead_trs or tr is hdr_row: continue
        cells=tr.find_all(['td','th'])
        if len(cells)<2: continue
        body.append(cells)
    if not body: return rates
    ncol=max(len(r) for r in body)
    col_vals=[[] for _ in range(ncol)]
    for cells in body:
        for ci in range(ncol):
            col_vals[ci].append(cell_text(cells[ci]) if ci<len(cells) else '')
    price_cols=[]
    for ci in range(ncol):
        vals=[v for v in col_vals[ci] if v!='']
        if not vals: continue
        numc=sum(1 for v in vals if to_number(v) is not None)
        if numc>=max(1,len(vals)*0.5): price_cols.append(ci)
    if not price_cols: return rates
    first=min(price_cols)
    name_cols=[ci for ci in range(first) if ci not in price_cols] or [0]
    hdr=lambda ci: headers[ci] if ci<len(headers) else ''
    net_cols=[ci for ci in price_cols if NET.search(hdr(ci))]
    keep=net_cols or [ci for ci in price_cols if not FEE.search(hdr(ci))] or price_cols
    multi=len(keep)>1
    for cells in body:
        gt=lambda ci: cell_text(cells[ci]) if ci<len(cells) else ''
        parts=[gt(ci) for ci in name_cols if gt(ci)]
        base=' — '.join(parts).strip(' —')
        if not base: continue
        for ci in keep:
            val=to_number(gt(ci))
            if val is None: continue
            h=hdr(ci)
            if multi and h and not GEN.fullmatch(h or ''): label=f"{base} — {h}"
            elif multi: label=f"{base} — {h}" if h else base
            else: label=base
            rates.append({'n':label,'p':val})
    return rates
def year_ancestor(node):
    p=node
    for _ in range(10):
        p=p.parent
        if p is None: return None
        dy=p.get('data-year') if hasattr(p,'get') else None
        if dy: return str(dy).strip()
    return None
def season_prefix(table):
    h=table.find_previous(['h4','h3','h2'])
    if not h or year_ancestor(h)=='2027': return ''
    raw=clean(h.get_text(' ',strip=True))
    m=re.search(r'(low|high|shoulder|mid|green|peak|festive|value)\s*season',raw,re.I)
    if not m:
        base=re.split(r'[(·]',raw)[0].strip(' -–—·'); return base if SEASON.search(base) else ''
    season=m.group(0).title()
    rest=re.sub(r'(low|high|shoulder|mid|green|peak|festive|value)\s*season','',raw,flags=re.I)
    rest=rest.replace('(','').replace(')','')
    rest=re.sub(r'\b20\d\d\b','',rest)
    rest=clean(rest.strip(' -–—·'))
    return f"{season} ({rest})" if rest else season
def parse_2026(path):
    soup=BeautifulSoup(open(path,encoding='utf-8',errors='ignore').read(),'html.parser')
    out,seen=[],set()
    for table in soup.find_all('table'):
        if year_ancestor(table)=='2027': continue
        pref=season_prefix(table)
        for r in parse_table(table):
            nm=r['n']
            if pref and pref.lower() not in nm.lower(): nm=pref+' · '+nm
            k=(nm,r['p'])
            if k in seen: continue
            seen.add(k); out.append({'n':nm,'p':r['p']})
    return out
def pmult(rs): return Counter(round(float(r['p']),2) for r in rs if r.get('p') is not None)
SEASONED=re.compile(r'^(low|high|shoulder|mid|green|peak|festive|value)\s*season',re.I)
j=json.load(open(INDEX,encoding='utf-8'))
relabeled=[]; skipped_mismatch=[]; noseason=0
for L in j['lodges']:
    path=os.path.join(SHEET_DIR,os.path.basename(L.get('file','')))
    if not L.get('file') or not os.path.exists(path): continue
    old=L.get('rates') or []
    new=parse_2026(path)
    has_season=any(SEASONED.match(r['n']) for r in new)
    if not has_season:
        noseason+=1; continue
    if new and not (pmult(old)-pmult(new)):
        L['rates']=new; relabeled.append(L['name'])
    else:
        skipped_mismatch.append(L['name'])
print('relabeled (season+months added):',len(relabeled))
print('skipped - had seasons but prices differ (left untouched):',len(skipped_mismatch))
for n in skipped_mismatch[:40]: print('   SKIP:',n)
print('no-season lodges (unchanged):',noseason)
ts=datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
shutil.copy2(INDEX,INDEX+f'.bak_{ts}')
j['generated']=datetime.datetime.now().isoformat(timespec='seconds')
json.dump(j,open(INDEX,'w',encoding='utf-8'),ensure_ascii=False,indent=0)
print('wrote index; backup .bak_'+ts)
