#!/usr/bin/env python3
"""Sandy Horizon 2026 rates (sheet dated 2 Sep 2025, rack + 20% STO, VAT incl).
Adds the 2026 season beside the 2027 season already loaded (commit 3d16eaf3).
Touches: assets/providers.json, activity_rates.html, assets/site-chrome.js (Activities menu).
Run from dt_library. Idempotent: refuses if the marker is already present.
site-chrome.js carries another session's uncommitted scroll-fx line, so this script
stages its own site-chrome change into the git index from HEAD (never the working copy).
"""
import json, os, re, shutil, subprocess, sys

MARK = 'SANDY-HORIZON-2026'
ROOT = os.getcwd()

# --- 2026 sheet, as printed (pdftotext of "Sandy Horizon rates 2026(20%).pdf") ---
R26 = {  # item label prefix in providers.json : (net STO, rack)
    'Half-day Sandwich Harbour': (2160.0, 2700.0),
    'Full-day Sandwich Harbour': (9280.0, 11600.0),
    'Marine & Sandwich Harbour Combo': (3320.0, 4150.0),
    'Kayak & Sandwich Harbour Combo': (3320.0, 4150.0),
    'Living Desert Combo': (2970.0, 3600.0),
}
SHEET_TXT = os.environ.get('SH26_TXT', '/tmp/sh26.txt')


def atomic_write(path, data):
    tmp = path + ('.tmp.js' if path.endswith('.js') else '.tmp')
    with open(tmp, 'w', encoding='utf-8') as f:
        f.write(data)
    os.replace(tmp, path)


def fmt(n):
    return 'N$ {:,.2f}'.format(n)


def main():
    # 0. every figure must appear verbatim on the sheet
    sheet = open(SHEET_TXT, encoding='utf-8').read()
    for k, (net, rack) in R26.items():
        for v in (net, rack):
            assert ('N$ %d.00' % v) in sheet or ('N$%d.00' % v) in sheet, (k, v)
    for k, (net, rack) in R26.items():
        print('ratio', k, round(net / rack, 4))

    # 1. providers.json
    pj = 'assets/providers.json'
    s = open(pj, encoding='utf-8').read()
    d = json.loads(s)
    assert json.dumps(d, ensure_ascii=False) == s, 'providers.json format changed'
    prov = [p for p in d['activities'] if p['name'] == 'Sandy Horizon']
    assert len(prov) == 1
    prov = prov[0]
    if prov["items"][0]["p"] is not None:
        sys.exit('already loaded')
    hit = 0
    for it in prov['items']:
        key = [k for k in R26 if it['n'].startswith(k)]
        assert len(key) == 1, it['n']
        net, rack = R26[key[0]]
        assert it['p'] is None and it['r'] is None, it  # 2026 was empty
        it['p'], it['r'] = net, rack
        it['d'] = it['d'].replace('Sandy Horizon, 2027 rack and 20% STO, VAT inclusive.',
                                  'Sandy Horizon, 2026 and 2027 rack and 20% STO, VAT inclusive.')
        hit += 1
    assert hit == 5
    prov['y27'] = ("Separate tariffs: 2026 sheet (2 Sep 2025) and 2027 sheet (16 Sep 2026), "
                   "rack and STO loaded as printed.")
    shutil.copy2(pj, pj + '.bak_sandy2026')
    atomic_write(pj, json.dumps(d, ensure_ascii=False))

    # 2. activity_rates.html
    ah = 'activity_rates.html'
    h = open(ah, encoding='utf-8').read()
    assert MARK not in h
    a = h.index('id="supplier-sandyhorizon"')
    card_start = h.rindex('<div class="rate-card"', 0, a)
    t0 = h.index('            <div class="table-responsive">', a)
    t1 = h.index('            </div>\n', h.index('</table>', t0)) + len('            </div>\n')
    old_tbl = h[t0:t1]
    assert 'N$ 2,520.00' in old_tbl and 'N$ 14,400.00' in old_tbl
    new26 = old_tbl
    pairs27 = [(2520, 3150), (11520, 14400), (3840, 4800), (3840, 4800), (3400, 4250)]
    pairs26 = [R26[k] for k in ['Half-day Sandwich Harbour', 'Full-day Sandwich Harbour',
                                 'Marine & Sandwich Harbour Combo', 'Kayak & Sandwich Harbour Combo',
                                 'Living Desert Combo']]
    rows = new26.split('<tr><td>')
    assert len(rows) == 6
    for i, ((n27, r27), (n26, r26)) in enumerate(zip(pairs27, pairs26), start=1):
        row = rows[i]
        assert fmt(n27) in row and fmt(r27) in row, row
        rows[i] = row.replace(fmt(n27), fmt(n26)).replace(fmt(r27), fmt(r26))
    new26 = '<tr><td>'.join(rows)
    block = ('            <!-- %s -->\n' % MARK +
             '            <div class="year-block" data-year="2026">\n' + new26 + '            </div>\n\n' +
             '            <div class="year-block" data-year="2027">\n' + old_tbl + '            </div>\n')
    h = h[:t0] + block + h[t1:]
    card_head = h[card_start:a + 40]
    assert 'data-years="2027" id="supplier-sandyhorizon"' in card_head
    h = h.replace('data-years="2027" id="supplier-sandyhorizon"',
                  'data-years="2026 2027" id="supplier-sandyhorizon"', 1)
    v_old = '<span class="spec-value">2027 (dates not stated on the sheet)</span>'
    assert h.count(v_old) == 1
    h = h.replace(v_old, '<span class="spec-value">2026 and 2027 (dates not stated on the sheets)</span>', 1)
    shutil.copy2(ah, ah + '.bak_sandy2026')
    atomic_write(ah, h)

    # 3. site-chrome.js Activities menu: working copy AND index (index from HEAD)
    sc = 'assets/site-chrome.js'
    anchor = ' {region:"Swakopmund",name:"Sand Waves",id:"sandwaves"},\n'
    line = ' {region:"Swakopmund",name:"Sandy Horizon",id:"sandyhorizon"},\n'
    w = open(sc, encoding='utf-8').read()
    assert w.count(anchor) == 1 and 'id:"sandyhorizon"' not in w
    shutil.copy2(sc, sc + '.bak_sandy2026')
    atomic_write(sc, w.replace(anchor, anchor + line, 1))
    head = subprocess.run(['git', 'show', 'HEAD:dt_library/' + sc], capture_output=True,
                          check=True).stdout.decode('utf-8')
    assert head.count(anchor) == 1
    staged = head.replace(anchor, anchor + line, 1)
    tmp = sc + '.index.tmp'
    open(tmp, 'w', encoding='utf-8').write(staged)
    blob = subprocess.run(['git', 'hash-object', '-w', tmp], capture_output=True, check=True,
                          text=True).stdout.strip()
    os.remove(tmp)
    mode = '100644'
    subprocess.run(['git', 'update-index', '--cacheinfo', '%s,%s,dt_library/%s' % (mode, blob, sc)],
                   check=True, cwd=os.path.dirname(ROOT))
    print('site-chrome staged blob', blob)
    print('OK')


if __name__ == '__main__':
    main()
