#!/usr/bin/env python3
"""Load Kwando Safaris 2027/28 (STO 20% and Reference rack, both printed) — 11 camps, 2027 season only.

    cd dt_library && python3 tools/load_kwando_2027.py           # apply
    cd dt_library && python3 tools/load_kwando_2027.py --parse   # build the docs and run the checks only

Source: "Kwando 2027-2028 STO Rates.pdf" and "Kwando 2027-2028 Reference Rates.pdf", both "Updated August 2026",
valid 16 Apr 2027 - 15 Apr 2028, US$, Kwando Agent Zone Google Drive -> 1. Rates -> 2027. Transcribed into the Price List
Vault artifact (6 Oct 2026); the figures below are the Vault tables, checked again against the PDF text in the Drive viewer.

Both columns are printed, so STO and rack are loaded as printed and nothing is derived (Kwando rounds STO to a round 5).
Rows the two sheets print identically (levy, holiday surcharge, Enclave, Kwando Private Guide, group leader, agent
educational, transfers, Moremi Air) carry rack = net.

What it does (MARK below; refuses to run twice; only ever adds the 2027 year to 11 new slugs)
  * api/sto.js and api/rack.js: 11 new slugs, year 2027.
  * assets/rates-index.json and assets/lodges-info.json entries (no photos yet).
  * 11 lodge pages (donor: okavango-delta-accommodation/tuludi), region cards: Okavango Delta (north, southeast and a new
    Central Delta section), Linyanti & Savuti (new Kwando Private Concession section), Makgadikgadi & Boteti, Botswana.
  * Group sheet ratesheets/kwando_ratesheet_v3.html (2027 pane) + header group link.
  * Moremi Air: providers.json -> flights (cur USD, 2027 only), flight_rates.html card, agent portal and header Flights menus,
    and a builder patch so a US$ leg goes to the USD section and a leg with no rate for the year is disabled.
"""
import glob, io, json, os, re, subprocess, sys

ROOT = os.getcwd()
P = lambda f: os.path.join(ROOT, f)
rd = lambda f: io.open(P(f), encoding='utf-8').read()
def wr(f, s, js=False):
    t = P(f) + ('.tmp.js' if js else '.tmp')
    io.open(t, 'w', encoding='utf-8').write(s)
    if js:
        subprocess.check_call(['node', '--check', t])
    os.replace(t, P(f))
def once(s, old, new, n=1):
    assert s.count(old) == n, (old[:90], s.count(old))
    return s.replace(old, new)
MARK = 'KWANDO-2027-28-LOAD'
YR = '2027'

# ------------------------------------------------------------------ the sheets, as printed (Vault tables)
SEAS = ['Secret season (16–30 Apr, May, Nov 2027)', 'Shoulder season (Jun, Oct 2027)',
        'Flood season (Jul–Sep 2027)', 'Green season (Dec 2027 – 15 Apr 2028)']
SEAS_SHORT = ['Secret', 'Shoulder', 'Flood', 'Green']
# [rate, single supplement or None where the sheet prints none]; columns Secret, Shoulder, Flood, Green
GRID = json.loads(r'''{"sto": {"Kwara": {"8+ nights": [[1380, 485], [1380, 485], [1800, 630], [1120, null]], "6–7 nights": [[1465, 515], [1465, 515], [1905, 670], [1120, null]], "1–5 nights (3–5 on the Kwara page)": [[1600, 560], [2120, 745], [2120, 745], [1120, null]]}, "Splash · 4 Rivers · Lagoon · Lebala": {"8+ nights": [[1095, 385], [1095, 385], [1505, 530], [900, null]], "6–7 nights": [[1165, 410], [1165, 410], [1565, 550], [900, null]], "1–5 nights": [[1295, 455], [1720, 605], [1720, 605], [900, null]], "child 6–15, family tent or extra bed": [[650, null], [860, null], [860, null], [450, null]]}, "Mma Dinare · Rra Dinare · Pom Pom": {"8+ nights": [[900, 315], [900, 315], [1240, 435], [780, null]], "6–7 nights": [[980, 345], [980, 345], [1300, 455], [780, null]], "1–5 nights": [[1080, 380], [1440, 505], [1440, 505], [780, null]], "child 6–15, family tent or extra bed": [[540, null], [720, null], [720, null], [390, null]]}, "Moremi Crossing": {"8+ nights": [[560, null], [560, null], [705, 250], [560, null]], "6–7 nights": [[595, null], [595, null], [740, 260], [560, null]], "1–5 nights": [[640, null], [800, 280], [800, 280], [560, null]], "child 6–15, family tent or extra bed": [[320, null], [400, null], [400, null], [280, null]]}, "Nxai Pan · Tau Pan": {"8+ nights": [[695, null], [695, null], [695, null], [780, null]], "6–7 nights": [[720, null], [720, null], [720, null], [780, null]], "1–5 nights": [[780, null], [780, null], [780, null], [780, null]], "child 6–15, family tent or extra bed": [[390, null], [390, null], [390, null], [390, null]]}}, "rack": {"Kwara": {"8+ nights": [[1725, 605], [1725, 605], [2250, 790], [1400, null]], "6–7 nights": [[1830, 645], [1830, 645], [2380, 835], [1400, null]], "1–5 nights (3–5 on the Kwara page)": [[2000, 700], [2650, 930], [2650, 930], [1400, null]]}, "Splash · 4 Rivers · Lagoon · Lebala": {"8+ nights": [[1360, 480], [1360, 480], [1875, 660], [1120, null]], "6–7 nights": [[1450, 510], [1450, 510], [1950, 685], [1120, null]], "1–5 nights": [[1615, 570], [2145, 755], [2145, 755], [1120, null]], "child 6–15, family tent or extra bed": [[810, null], [1075, null], [1075, null], [560, null]]}, "Mma Dinare · Rra Dinare · Pom Pom": {"8+ nights": [[1125, 395], [1125, 395], [1550, 545], [970, null]], "6–7 nights": [[1225, 430], [1225, 430], [1625, 570], [970, null]], "1–5 nights": [[1350, 475], [1800, 630], [1800, 630], [970, null]], "child 6–15, family tent or extra bed": [[675, null], [900, null], [900, null], [485, null]]}, "Moremi Crossing": {"8+ nights": [[700, null], [700, null], [880, 310], [700, null]], "6–7 nights": [[740, null], [740, null], [920, 325], [700, null]], "1–5 nights": [[800, null], [1000, 350], [1000, 350], [700, null]], "child 6–15, family tent or extra bed": [[400, null], [500, null], [500, null], [350, null]]}, "Nxai Pan · Tau Pan": {"8+ nights": [[860, null], [860, null], [860, null], [970, null]], "6–7 nights": [[890, null], [890, null], [890, null], [970, null]], "1–5 nights": [[970, null], [970, null], [970, null], [970, null]], "child 6–15, family tent or extra bed": [[485, null], [485, null], [485, null], [485, null]]}}}''')
KWARA_15 = '1–5 nights (3–5 on the Kwara page)'
BANDS = ['8+ nights', '6–7 nights', '1–5 nights']
CHILD = 'child 6–15, family tent or extra bed'
GROUP = {'Kwara': 'Kwara', 'Splash': 'Splash · 4 Rivers · Lagoon · Lebala', '4 Rivers': 'Splash · 4 Rivers · Lagoon · Lebala',
         'Lagoon': 'Splash · 4 Rivers · Lagoon · Lebala', 'Lebala': 'Splash · 4 Rivers · Lagoon · Lebala',
         'Mma Dinare': 'Mma Dinare · Rra Dinare · Pom Pom', 'Rra Dinare': 'Mma Dinare · Rra Dinare · Pom Pom',
         'Pom Pom': 'Mma Dinare · Rra Dinare · Pom Pom', 'Moremi Crossing': 'Moremi Crossing',
         'Nxai Pan': 'Nxai Pan · Tau Pan', 'Tau Pan': 'Nxai Pan · Tau Pan'}

DELTA, LIN, MAK, BW = 'okavango-delta-accommodation', 'linyanti-savuti-accommodation', 'makgadikgadi-accommodation', 'botswana-accommodation'
REGION = {DELTA: 'Okavango Delta', LIN: 'Linyanti & Savuti', MAK: 'Makgadikgadi & Boteti', BW: 'Botswana'}
RTITLE = {DELTA: 'Okavango Delta', LIN: 'Linyanti &amp; Savuti', MAK: 'Makgadikgadi &amp; Boteti', BW: 'Botswana'}
# slug, display name, sheet name, folder, area, location as the sheet states it (Activities Overview, page 5)
CAMPS = [
    ('kwando-kwara', 'Kwara Camp', 'Kwara', DELTA, 'north', 'Kwara Private Concession, Northern Okavango Delta, Botswana'),
    ('kwando-splash', 'Splash Camp', 'Splash', DELTA, 'north', 'Kwara Private Concession, Northern Okavango Delta, Botswana'),
    ('kwando-4-rivers', '4 Rivers Camp', '4 Rivers', DELTA, 'north', 'Kwara Private Concession, Northern Okavango Delta, Botswana'),
    ('kwando-mma-dinare', 'Mma Dinare', 'Mma Dinare', DELTA, 'southeast', 'Dinare Private Reserve, Eastern Okavango Delta, Botswana'),
    ('kwando-rra-dinare', 'Rra Dinare', 'Rra Dinare', DELTA, 'southeast', 'Dinare Private Reserve, Eastern Okavango Delta, Botswana'),
    ('kwando-pom-pom', 'Pom Pom Camp', 'Pom Pom', DELTA, 'central', 'Pom Pom Private Concession, Central Okavango Delta, Botswana'),
    ('kwando-moremi-crossing', 'Moremi Crossing', 'Moremi Crossing', DELTA, 'central', 'Gunn’s Private Concession, Central Okavango Delta, Botswana'),
    ('kwando-lagoon', 'Lagoon Camp', 'Lagoon', LIN, 'kwando', 'Kwando Private Concession, Kwando–Linyanti–Chobe river system, Botswana'),
    ('kwando-lebala', 'Lebala Camp', 'Lebala', LIN, 'kwando', 'Kwando Private Concession, Kwando–Linyanti–Chobe river system, Botswana'),
    ('kwando-nxai-pan', 'Nxai Pan Camp', 'Nxai Pan', MAK, 'makgadikgadi', 'Nxai Pan National Park, Makgadikgadi Salt Pans, Botswana'),
    ('kwando-tau-pan', 'Tau Pan Camp', 'Tau Pan', BW, None, 'Central Kalahari Game Reserve, Kalahari Desert, Botswana'),
]
assert sorted(GROUP) == sorted(c[2] for c in CAMPS)
C = {c[0]: c for c in CAMPS}
SHEETS = {'sto': 'Kwando 2027-2028 STO Rates (STO 20%)', 'rack': 'Kwando 2027-2028 Reference Rates (rack)'}

# extras, (sto, rack) — every pair as printed on the two sheets
def extras(c):
    nm = c[2]
    ex = [('Extras · Kwando Community & Conservation Levy — per person per night, add to every rate (non-commissionable)', 20, 20),
          ('Extras · Holiday surcharge 20 Dec 2027 – 4 Jan 2028 and 14–17 Apr 2028 — per person per night, guides, group leaders & pilots included (non-commissionable)', 150, 150)]
    if nm == 'Kwara':
        ex += [('Extras · Private vehicle with camp guide, 1–2 guests — per group per night', 690, 860),
               ('Extras · Private vehicle, 3–4 guests (Kwara takes 4 per vehicle) — per group per night', 'free', 'free'),
               ('Extras · Kwando Private Guide, named guide, private vehicle needed on top — per group per night (non-commissionable)', 345, 345),
               ('Extras · Private vehicle + Kwando Private Guide, 1–2 guests — per group per night', 1035, 1205),
               ('Extras · Private vehicle + Kwando Private Guide, 3–4 guests — per group per night', 345, 345)]
    elif nm != 'Moremi Crossing':                       # Moremi Crossing has no private vehicles
        ex += [('Extras · Private vehicle with camp guide, 1–2 guests — per group per night', 560, 700),
               ('Extras · Private vehicle with camp guide, 3–4 guests — per group per night', 475, 590),
               ('Extras · Private vehicle, 5–6 guests — per group per night', 'free', 'free'),
               ('Extras · Kwando Private Guide, named guide, private vehicle needed on top — per group per night (non-commissionable)', 345, 345),
               ('Extras · Private vehicle + Kwando Private Guide, 1–2 guests — per group per night', 905, 1045),
               ('Extras · Private vehicle + Kwando Private Guide, 3–4 guests — per group per night', 820, 935),
               ('Extras · Private vehicle + Kwando Private Guide, 5–6 guests — per group per night', 345, 345)]
    if nm in ('Splash', 'Lebala'):
        ex.append(('Extras · %s Enclave supplement, 2–10 guests, private vehicle required — per group per night (non-commissionable)' % nm, 550, 550))
    ex += [('Extras · External guide / group leader / pilot — per person per night (non-commissionable)', 330, 330),
           ('Extras · Agent educational, one per company per fam trip — per person per night', 330, 330)]
    tr = {'Lebala': [('Transfers · Lebala ↔ Lagoon road transfer when staying at both, ±2.5 hrs — per person', 'free', 'free'),
                     ('Transfers · Lebala to Selinda main camp, min 2 guests, ±1 hr to the boundary — per person per way (non-commissionable)', 200, 200)],
          'Lagoon': [('Transfers · Lagoon ↔ Lebala road transfer when staying at both, ±2.5 hrs — per person', 'free', 'free')],
          'Nxai Pan': [('Transfers · Nxai Pan main gate ↔ camp, min 2 guests, ±2 hrs — per person per way (non-commissionable)', 110, 110)],
          'Mma Dinare': [('Transfers · Maun ↔ Mma Dinare, min 2 guests, ±2 hrs — per person per way (non-commissionable)', 150, 150)],
          'Rra Dinare': [('Transfers · Maun ↔ Rra Dinare, min 2 guests, ±2 hrs — per person per way (non-commissionable)', 150, 150)],
          '4 Rivers': [('Transfers · 4 Rivers ↔ Splash or Kwara by road, min 2 guests, ±2 hrs — per person per way (non-commissionable)', 150, 150)],
          'Splash': [('Transfers · Splash ↔ 4 Rivers by road, min 2 guests, ±2 hrs — per person per way (non-commissionable)', 150, 150),
                     ('Transfers · Boat, Splash ↔ Xakanaxa, Camp Moremi or Okuti, min 2 guests, ±1.5 hrs — per person per way (non-commissionable)', 130, 130)],
          'Kwara': [('Transfers · Kwara ↔ 4 Rivers by road, min 2 guests, ±2 hrs — per person per way (non-commissionable)', 150, 150),
                    ('Transfers · Boat, Kwara ↔ Xakanaxa, Camp Moremi or Okuti, min 2 guests, ±1.5 hrs — per person per way (non-commissionable)', 130, 130)]}
    return ex + tr.get(nm, [])
NONCOMM_OK = {20, 150, 345, 330, 550, 200, 110, 130, 'free'}

def room_sections(c, kind):
    g = GRID[kind][GROUP[c[2]]]
    lab = 'net STO' if kind == 'sto' else 'rack'
    secs = []
    for i, season in enumerate(SEAS):
        rows = []
        for b in BANDS:
            key = KWARA_15 if (c[2] == 'Kwara' and b == '1–5 nights') else b
            blab = '3–5 nights (Kwara minimum 3 nights)' if key == KWARA_15 else b
            rate, ss = g[key][i]
            rows.append(['%s · %s · fully inclusive — per person sharing%s' % (season, blab, ' · no single supplement' if ss is None else ''), '{:,}'.format(rate)])
            if ss is not None:
                rows.append(['%s · %s · single supplement — add to the sharing rate' % (season, blab), '{:,}'.format(ss)])
        if CHILD in g:
            rows.append(['%s · child 6–15 in a family tent or on the extra bed — per child per night' % season, '{:,}'.format(g[CHILD][i][0])])
        secs.append({'title': '2027/28 — %s · %s' % (lab, season), 'rows': rows})
    return secs

def note(c, kind):
    nm = c[2]
    parts = ['%s, "Updated August 2026"; valid 16 Apr 2027 – 15 Apr 2028; US$.' % SHEETS[kind],
             'Kwando prints both an STO 20% sheet and a Reference (rack) sheet; both are loaded as printed and nothing is derived — Kwando rounds STO to a round 5, so STO is not exactly rack × 0.8.',
             'Fully inclusive: all meals and local drinks, laundry, all game activities, park fees for Nxai Pan, CKGR and Moremi (Dinare camps), medical evacuation to Maun if insured. Excludes gratuities, premium drinks, helicopter activities, flights and the levy.',
             'Add the Kwando Community & Conservation Levy (US$20 pppn) to every rate; holiday surcharge US$150 pppn 20 Dec 2027 – 4 Jan 2028 and 14–17 Apr 2028. Levy, surcharge, Enclave, Kwando Private Guide, group leader, agent educational and transfers are printed the same on both sheets (non-commissionable, rack = net).',
             'Length-of-stay bands count total nights across Kwando camps (Chobe Safari Lodge, Chobe Bush Lodge and Nata Lodge do not count); Green season has one rate. Long-stay rates not valid with 5 Rivers rates (1 Dec – 15 Apr, on request).',
             'Location per the sheet: %s.' % c[5].replace(', Botswana', '')]
    if nm == 'Kwara':
        parts.append('Kwara takes guests 18 and older only (no child rate) and has a 3-night minimum; 4 guests per vehicle.')
    elif nm == 'Moremi Crossing':
        parts.append('Moremi Crossing has no private vehicles (9-seat shared vehicle); guests 6 and older.')
    else:
        parts.append('Children 6–15 pay the child rate in a family tent or on the extra bed with two full-paying adults; 16+ pay adult. Families with children 6–11 must book a private vehicle.')
    if nm in ('Nxai Pan', 'Tau Pan'):
        parts.append('No single supplement all year; no minimum age 1 Apr – 15 Nov.')
    if nm == 'Tau Pan':
        parts.append('Filed under the Botswana region for now: the site has no Central Kalahari region.')
    parts.append('Open queries with Kwando: the holiday surcharge 14–17 Apr 2028 runs past the 15 Apr 2028 validity; the vehicle reference rate on page 16 differs from page 17; two different luggage rules (page 7 vs page 23).')
    return ' '.join(parts)

def doc(c, kind):
    d = {'name': c[1], 'region': REGION[c[3]], 'currency': 'US$', 'validity': '16 Apr 2027 – 15 Apr 2028 (Kwando 2027/28 season), as printed',
         'note': note(c, kind), 'sections': room_sections(c, kind) + [{'title': '2027/28 — Kwando extras & transfers (%s)' % ('net' if kind == 'sto' else 'rack'),
                                                                        'rows': [[l, ('{:,}'.format(s if kind == 'sto' else r) if isinstance(s, int) else s)] for l, s, r in extras(c)]}]}
    if kind == 'sto':
        d['commission'] = 'STO 20% (reference rack published; Kwando rounds STO to a round 5)'
    return d
STO = {c[0]: {YR: doc(c, 'sto')} for c in CAMPS}
RACK = {c[0]: {YR: doc(c, 'rack')} for c in CAMPS}

# ------------------------------------------------------------------ checks
num = lambda v: int(v.replace(',', ''))
for c in CAMPS:
    for D in (STO, RACK):
        d = D[c[0]][YR]
        labs = [l for s in d['sections'] for l, _ in s['rows']]
        assert len(set(labs)) == len(labs), (c[0], 'labels not unique once flattened')
        for s in d['sections']:
            for l, v in s['rows']:
                assert v in ('free',) or re.fullmatch(r'[\d,]+', v), (c[0], l, v)       # text values carry no digits
                assert 'season (' in l or l.startswith(('Extras', 'Transfers')), l      # season dates on every rate row
    # row-by-row: same labels on both docs; ratio check
    s_rows = [r for s in STO[c[0]][YR]['sections'] for r in s['rows']]
    r_rows = [r for s in RACK[c[0]][YR]['sections'] for r in s['rows']]
    assert [l for l, _ in s_rows] == [l for l, _ in r_rows]
    for (l, sv), (_, rv) in zip(s_rows, r_rows):
        if sv == 'free':
            assert rv == 'free'; continue
        a, z = num(sv), num(rv)
        if 'non-commissionable' in l or l.startswith('Extras · Agent educational') or l.startswith('Extras · Kwando Community'):
            assert a == z, (c[0], l, a, z)
        elif l.startswith('Extras · Private vehicle + Kwando Private Guide'):
            assert (a == z == 345) or a < z, (c[0], l, a, z)                         # combined row: commissionable vehicle + non-comm guide
        else:
            assert 0.78 <= a / z <= 0.83, (c[0], l, a, z)
# every figure is one the Vault prints for that camp's group (or its extras)
for kind, D in (('sto', STO), ('rack', RACK)):
    for c in CAMPS:
        g = GRID[kind][GROUP[c[2]]]
        figs = {x for band in g.values() for pair in band for x in pair if x is not None}
        figs |= {(s if kind == 'sto' else r) for _, s, r in extras(c) if isinstance(s, int)}
        for sec in D[c[0]][YR]['sections']:
            for l, v in sec['rows']:
                assert v == 'free' or num(v) in figs, (kind, c[0], l, v)
print('docs built: %d camps, %d STO rows' % (len(CAMPS), sum(len(s['rows']) for c in CAMPS for s in STO[c[0]][YR]['sections'])))
json.dump({'sto': STO, 'rack': RACK}, io.open(P('tools/kwando_2027_docs.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
if '--parse' in sys.argv:
    sys.exit(0)

# ====================================================================== APIs
NODE = r'''
const path=require('path');process.chdir(process.argv[1]);
const Module=require('module');const orig=Module._load;
Module._load=function(r,p,i){if(/_ratesdb$/.test(r))return{dbConfigured:()=>false};return orig.apply(this,arguments);};
const fs=require('fs');const out={};
for(const [f,names] of [['sto',['DDS_STO_BY_YEAR','STO_DB','LEGACY_STO_BY_YEAR','SHEET_STO_BY_YEAR']],['rack',['DDS_RACK_BY_YEAR','LEGACY_RACK_BY_YEAR','SHEET_RACK_BY_YEAR']]]){
  const src=fs.readFileSync('api/'+f+'.js','utf8')+'\nmodule.exports.__m={'+names.map(n=>n+':typeof '+n+'==="undefined"?{}:'+n).join(',')+'};';
  const m=new Module('api/'+f+'_probe.js');m.filename=path.resolve('api/'+f+'_probe.js');m.paths=Module._nodeModulePaths(path.resolve('api'));
  m._compile(src,m.filename);const M=m.exports.__m;const cov={};
  for(const k in M)for(const s in M[k]){const v=M[k][s];const ys=(k==='STO_DB')?['db']:Object.keys(v);cov[s]=cov[s]||{};ys.forEach(y=>{(cov[s][y]=cov[s][y]||[]).push(k)});}
  out[f]={cov:cov,dds:{}};
  for(const s of process.argv.slice(2)){if(M[names[0]][s])out[f].dds[s]=M[names[0]][s];}
}
process.stdout.write(JSON.stringify(out));
'''
SLUGS = [c[0] for c in CAMPS]
state = lambda: json.loads(subprocess.check_output(['node', '-e', NODE, ROOT] + SLUGS))
before = state()
for fn in ('sto', 'rack'):
    assert MARK not in rd('api/%s.js' % fn), 'already loaded'
    for s in SLUGS:
        assert s not in before[fn]['cov'], ('slug already exists', fn, s)
def block(kind, data):
    dds = 'DDS_STO_BY_YEAR' if kind == 'sto' else 'DDS_RACK_BY_YEAR'
    return '''
/* %s — Kwando Safaris 2027/28 (16 Apr 2027 – 15 Apr 2028), 11 camps, STO and reference rack as printed. Adds the 2027 year to new slugs only. Generated by tools/load_kwando_2027.py. */
(function loadKwando2027%s() {
  var V = %s;
  if (typeof %s === 'undefined') return;
  Object.keys(V).forEach(function (slug) {
    var e = %s[slug] || (%s[slug] = {});
    Object.keys(V[slug]).forEach(function (y) { if (!e[y]) e[y] = V[slug][y]; });
  });
})();
''' % (MARK, kind.capitalize(), json.dumps(data, ensure_ascii=False, indent=1), dds, dds, dds)
for kind, data in (('sto', STO), ('rack', RACK)):
    wr('api/%s.js' % kind, rd('api/%s.js' % kind) + block(kind, data), js=True)
after = state()
lost = []
for fn in ('sto', 'rack'):
    for s, ys in before[fn]['cov'].items():
        for y in ys:
            if y not in after[fn]['cov'].get(s, {}):
                lost.append((fn, s, y))
    for c in CAMPS:
        assert sorted(after[fn]['dds'][c[0]]) == [YR], (fn, c[0])
        assert after[fn]['dds'][c[0]][YR] == (STO if fn == 'sto' else RACK)[c[0]][YR], (fn, c[0])
    print(fn, 'slugs %d -> %d' % (len(before[fn]['cov']), len(after[fn]['cov'])))
assert not lost, lost
print('slugs losing a year: 0')

# ====================================================================== index + lodges-info
def flat(d):
    return [{'n': l, 'p': num(v)} for s in d['sections'] for l, v in s['rows'] if v != 'free']
GROUP_SHEET = 'ratesheets/kwando_ratesheet_v3.html'
raw = rd('assets/rates-index.json'); data = json.loads(raw)
assert json.dumps(data, indent=0, ensure_ascii=False) == raw, 'index on-disk format changed'
has = lambda e: any(e.get(k) for k in ('rates', 'rates_2027', 'rack_2026', 'rack_2027'))
with_before = {e['name'] for e in data['lodges'] if has(e)}
have = {x['name'].lower() for x in data['lodges']}
for c in CAMPS:
    assert c[1].lower() not in have, c[1]
    data['lodges'].append({'file': '/' + GROUP_SHEET, 'name': c[1], 'region': REGION[c[3]], 'cur': 'USD',
                           'rates_2027': flat(STO[c[0]][YR]), 'rack_2027': flat(RACK[c[0]][YR])})
data['count'] = len(data['lodges'])
with_after = {e['name'] for e in data['lodges'] if has(e)}
print('lodges losing rates: %d' % len(with_before - with_after)); assert with_before <= with_after
wr('assets/rates-index.json', json.dumps(data, indent=0, ensure_ascii=False))
raw = rd('assets/lodges-info.json'); info = json.loads(raw)
assert json.dumps(info, indent=0, ensure_ascii=False) == raw, 'lodges-info on-disk format changed'
def lead(c):
    return 'Kwando Safaris camp — %s. Fully inclusive. Rates in US$.' % c[5].replace(', Botswana', '')
for c in CAMPS:
    k = re.sub(r'[^a-z0-9]', '', c[1].lower())
    assert k not in info, k
    info[k] = {'name': c[1], 'url': '/%s/%s/' % (c[3], c[0]), 'lead': lead(c), 'imgs': [], 'cur': 'USD'}
wr('assets/lodges-info.json', json.dumps(info, indent=0, ensure_ascii=False))
print('index +%d (count %d), lodges-info +%d' % (len(CAMPS), data['count'], len(CAMPS)))

# ====================================================================== lodge pages (donor: Tuludi, which has no gallery)
DONOR = rd(DELTA + '/tuludi/index.html')
D_HERO = re.search(r'<div class="hero" style="[^"]*">', DONOR).group(0)
D_LEAD = re.search(r'<p class="lead">.*?</p>', DONOR, re.S).group(0)
D_DESC = 'Natural Selection Premier camp — Khwai Private Reserve, Okavango Delta. Fully inclusive; rates in US$.'
D_LOC = 'Khwai Private Reserve, Okavango Delta, Botswana'
assert DONOR.count(D_HERO) == 1 and DONOR.count(D_LEAD) == 1 and DONOR.count(D_DESC) == 2 and DONOR.count(D_LOC) == 2
assert 'hero-thumbs"' not in DONOR.replace('.hero-thumbs{', '')
def page(c):
    slug, name, sheet, folder, _, loc = c
    h = name.replace("'", '&#39;').replace('’', '&rsquo;')
    where = loc.replace(', Botswana', '').replace('’', '&rsquo;')
    desc = 'Kwando Safaris camp — %s. Fully inclusive; rates in US$.' % where
    plead = ('<p class="lead">Kwando Safaris camp — %s. Fully inclusive: all meals and local drinks, laundry and all game activities, '
             'plus the Kwando Community &amp; Conservation Levy of US$20 per person per night. Rates for the 2027/28 season (16 Apr 2027 – 15 Apr 2028), in US$; '
             'the night bands count total nights across Kwando camps.</p>' % where)
    s = DONOR
    s = s.replace('Tuludi | Okavango Delta', '%s | %s' % (h, RTITLE[folder]))
    s = s.replace(D_DESC, desc).replace(D_LEAD, plead).replace(D_LOC, loc.replace('’', '&rsquo;'))
    s = s.replace(D_HERO, '<div class="hero" style="background:linear-gradient(135deg,#6b5844,#2f2519)">')
    s = s.replace('/okavango-delta-accommodation/tuludi/', '/%s/%s/' % (folder, slug))
    s = s.replace('<a class="hero-back" href="/okavango-delta-accommodation/">&#8592; Back to Okavango Delta Accommodation</a>',
                  '<a class="hero-back" href="/%s/">&#8592; Back to %s Accommodation</a>' % (folder, RTITLE[folder]))
    s = s.replace("var LODGE='tuludi'", "var LODGE='%s'" % slug)
    s = s.replace('Tuludi', h)
    body = re.sub(r'<header.*?</header>', '', s, flags=re.S)          # the shared header links to the Natural Selection sheets; that is fine
    for bad in ('Tuludi', 'tuludi', 'Khwai', 'Natural Selection', 'naturalselection'):
        assert bad not in body, (slug, bad)
    assert s.count("var LODGE='%s'" % slug) == 1
    return s
for c in CAMPS:
    d = '%s/%s' % (c[3], c[0])
    os.makedirs(P(d), exist_ok=True)
    assert not os.path.exists(P(d + '/index.html')), d
    wr(d + '/index.html', page(c))

# ====================================================================== region pages
def card(c):
    h = c[1].replace("'", '&#39;')
    return ('<a class="card has-rates" data-name="%s" href="/%s/%s/"><div class="img" style="background-image:linear-gradient(160deg,#4a5a44,#243021)"><span class="rate-badge">'
            '<span class="rate-dot"></span>Rates</span><h3>%s</h3></div><div class="body"><p>%s &middot; US$</p>'
            '<span class="go">View lodge &amp; rates &rarr;</span></div></a>' % (c[1].lower().replace("'", ''), c[3], c[0], h, RTITLE[c[3]]))
def add_cards(s, area, slugs):
    a = s.index('<div class="area-sec" id="area-%s">' % area)
    b = s.index('\n  </div></div>', a)
    return s[:b] + ''.join('\n    ' + card(C[x]) for x in slugs) + s[b:]
def section(area, title, slugs):
    return ('  <div class="area-sec" id="area-%s"><h3 class="area-h">%s</h3>\n  <div class="grid lodge-grid">%s\n  </div></div>\n'
            % (area, title, ''.join('\n    ' + card(C[x]) for x in slugs)))
dl = rd(DELTA + '/index.html')
n0 = dl.count('class="area-sec"')
dl = add_cards(dl, 'north', ['kwando-kwara', 'kwando-splash', 'kwando-4-rivers'])
dl = add_cards(dl, 'southeast', ['kwando-mma-dinare', 'kwando-rra-dinare'])
dl = once(dl, '  <div class="area-sec" id="area-khwai">', section('central', 'Central Delta', ['kwando-pom-pom', 'kwando-moremi-crossing']) + '  <div class="area-sec" id="area-khwai">')
dl = once(dl, '<a href="#area-south">Southern Delta</a>', '<a href="#area-south">Southern Delta</a><a href="#area-central">Central Delta</a>')
assert dl.count('class="area-sec"') == n0 + 1
wr(DELTA + '/index.html', dl)

ln = rd(LIN + '/index.html')
a = ln.index('<div class="area-sec" id="area-linyanti">'); b = ln.index('\n  </div></div>\n', a) + len('\n  </div></div>\n')
ln = ln[:b] + section('kwando', 'Kwando Private Concession', ['kwando-lagoon', 'kwando-lebala']) + ln[b:]
if '<div class="area-jump">' in ln:
    ln = ln.replace('<div class="area-jump">', '<div class="area-jump"><a href="#area-kwando">Kwando Private Concession</a>', 1)
wr(LIN + '/index.html', ln)

mk = rd(MAK + '/index.html')
wr(MAK + '/index.html', add_cards(mk, 'makgadikgadi', ['kwando-nxai-pan']))

bh = rd(BW + '/index.html')
i = bh.index('<a class="card has-rates" data-name="leroo la tau"')
wr(BW + '/index.html', bh[:i] + card(C['kwando-tau-pan']) + '\n      ' + bh[i:])
print('pages: %d lodge pages, region cards on 4 pages, Central Delta + Kwando Private Concession sections' % len(CAMPS))

# ====================================================================== Moremi Air
PLACES = ['Maun', 'Nxai Pan', 'Pom Pom', 'Kwara / Splash / 4 Rivers', 'Lebala / Lagoon', 'Kasane', 'Tau Pan', 'Dinare (Santawani)', 'Moremi Crossing (Ntswi)']
TRI = [[350], [350, 685], [350, 600, 455], [490, 730, 490, 490], [650, 855, 650, 650, 515],
       [435, 565, 770, 785, 915, 935], [350, 600, 350, 350, 490, 650, 730], [350, 685, 350, 455, 490, 650, 770, 350]]
items = []
for frm, vals in zip(PLACES[1:], TRI):
    for to, v in zip(PLACES, vals):
        items.append({'n': '%s to %s or vice versa' % (frm, to), 'p': None, 'p27': v})
items.append({'n': 'Kwara to 4 Rivers or vice versa (short flight)', 'p': None, 'p27': 220})
assert len(items) == 37
prov_raw = rd('assets/providers.json'); prov = json.loads(prov_raw)
assert json.dumps(prov, ensure_ascii=False, separators=(',', ':')) == prov_raw or json.dumps(prov, ensure_ascii=False) == prov_raw, 'providers.json on-disk format'
compact = json.dumps(prov, ensure_ascii=False, separators=(',', ':')) == prov_raw
assert not any(f['name'].startswith('Moremi Air') for f in prov['flights'])
prov['flights'].append({'name': 'Moremi Air (Kwando Safaris)', 'cur': 'USD', 'y27': 'Kwando 2027/28 sheet (16 Apr 2027 – 15 Apr 2028); no 2026 rate loaded',
                        'note': 'US$ per person per flight, seat rate, same on Kwando’s STO and reference sheets (non-commissionable) · excludes CAAB, security and departure taxes and third-party landing fees; Maun and Kasane taxes US$32 extra',
                        'items': items})
wr('assets/providers.json', json.dumps(prov, ensure_ascii=False, separators=(',', ':')) if compact else json.dumps(prov, ensure_ascii=False))

def tri_table(names, rows):
    head = '<tr><th>From / to</th>' + ''.join('<th>%s</th>' % n for n in names[:-1]) + '</tr>'
    body = ''
    for nm, vals in zip(names[1:], rows):
        body += '<tr><td><strong>%s</strong></td>%s%s</tr>' % (nm, ''.join('<td class="price-highlight" style="white-space:nowrap">US$ {:,}</td>'.format(v) for v in vals),
                                                              '<td></td>' * (len(names) - 1 - len(vals)))
    return '<div class="table-responsive"><table><thead>%s</thead><tbody>%s</tbody></table></div>' % (head, body)
FL = '''        <div class="rate-card" data-years="2027" id="supplier-moremiair">
            <div class="supplier-info">
                <div class="supplier-details">
                    <h2>Moremi Air &mdash; Kwando Safaris intercamp flights</h2>
                    <p>Moremi Air is Kwando&rsquo;s carrier for light-aircraft transfers into and between the Kwando camps (Kwara, Splash, 4 Rivers, Lagoon, Lebala, Pom Pom, Mma and Rra Dinare, Moremi Crossing, Nxai Pan, Tau Pan), Maun and Kasane. Book all flights through Kwando with the camp booking.</p>
                </div>
                <div class="supplier-quick-spec">
                    <div class="spec-item"><span class="spec-label">Commission Model</span><span class="spec-value">Nett (same on STO and reference sheets)</span></div>
                    <div class="spec-item"><span class="spec-label">Coverage</span><span class="spec-value">Okavango Delta, Kwando, Nxai Pan, CKGR, Maun, Kasane</span></div>
                    <div class="spec-item"><span class="spec-label">Validity</span><span class="spec-value">16 Apr 2027 &ndash; 15 Apr 2028</span></div>
                    <div class="spec-item"><span class="spec-label">Currency</span><span class="spec-value">US$</span></div>
                </div>
            </div>
            <div class="year-block" data-year="2027">
            <h3>Seat rates, per person per flight (2027/28)</h3>
            %s
            <p class="raw">Kwara &harr; 4 Rivers short flight US$ 220 per person. Dinare = Mma Dinare and Rra Dinare (Santawani airstrip); Moremi Crossing flies from Ntswi.</p>
            </div>
            <h3>Notes</h3>
            <ul>
                <li>Excludes CAAB, security and departure taxes and third-party landing fees; Maun and Kasane taxes US$32 per person extra.</li>
                <li>Book at least 48 hours ahead or a charter rate may apply. Flight times are released at 16:00 the day before; each leg may make up to three stops.</li>
                <li>Soft-sided bags only. Passengers over 100 kg must be declared and may pay a surcharge or an extra seat.</li>
                <li>Cancellation: 25% within 7 days, 50% within 48 hours, 100% within 24 hours of departure.</li>
                <li>Kwando&rsquo;s sheet gives two luggage rules (page 7 and page 23) &mdash; queried with Kwando; confirm the allowance with reservations.</li>
            </ul>
        </div>
'''.replace('%s', tri_table(PLACES, TRI), 1)
fr = rd('flight_rates.html')
fr = once(fr, "<button class=\"tab-link\" onclick=\"switchSupplier('naturalselectionbw', this)\">Natural Selection Botswana</button>",
          "<button class=\"tab-link\" onclick=\"switchSupplier('naturalselectionbw', this)\">Natural Selection Botswana</button>\n            <button class=\"tab-link\" onclick=\"switchSupplier('moremiair', this)\">Moremi Air (Kwando)</button>")
i = fr.index('<div class="rate-card" data-years="2026 2027" id="supplier-naturalselectionbw">')
fr = fr[:i] + FL.lstrip(' ') + '\n        ' + fr[i:]
assert fr.count('id="supplier-moremiair"') == 1
wr('flight_rates.html', fr)

# builder: US$ legs go to the USD section; a leg with no rate for the selected year is disabled
B = 'builder/index.html'
bs = rd(B)
OLD_OPT = """var it=x.it,p=(y27&&it.p27!=null)?it.p27:it.p;return '<option value="'+x.ii+'" data-p="'+p+'" data-name="'+esc(f.name+' · '+it.n)+'">→ '+esc(x.r.to)+(x.r.either?' (either way)':'')+(x.r.via?'  ·  via '+esc(x.r.via):'')+' — '+money(p)+' /seat</option>';"""
NEW_OPT = """var it=x.it,p=(y27&&it.p27!=null)?it.p27:it.p,na=(p==null),fc=(f.cur==='USD')?'USD':'NAD';return '<option value="'+x.ii+'" data-p="'+(na?'':p)+'" data-cur="'+fc+'" data-name="'+esc(f.name+' · '+it.n)+'"'+(na?' disabled':'')+'>→ '+esc(x.r.to)+(x.r.either?' (either way)':'')+(x.r.via?'  ·  via '+esc(x.r.via):'')+' — '+(na?'no '+(S.year||'2026')+' rate':money(p,fc)+' /seat'+(fc==='USD'?' (to USD section)':''))+'</option>';"""
bs = once(bs, OLD_OPT, NEW_OPT)
OLD_PICK = "var px=tripPax();var p=+o.dataset.p||0;S.flights.push({name:o.dataset.name+' — per seat × '+px,amount:p*px});renderPanel();"
NEW_PICK = "var px=tripPax();var p=+o.dataset.p||0;if(o.dataset.cur==='USD'){S.botswana.push({name:o.dataset.name+' — per seat × '+px,amount:p*px,cur:'USD'});}else{S.flights.push({name:o.dataset.name+' — per seat × '+px,amount:p*px});}renderPanel();"
bs = once(bs, OLD_PICK, NEW_PICK)
assert 'S.botswana' in bs
wr(B, bs)

# ====================================================================== group sheet (from the Natural Selection Botswana sheet)
def money2(v): return '{:,.2f}'.format(num(v))
def tab1(c):
    d = STO[c[0]][YR]
    blocks = ''
    for s in d['sections'][:-1]:
        season = s['title'].split(' · ', 1)[1]
        rows = ''.join('<tr><td><strong>%s</strong></td><td style="text-align:right">%s</td></tr>' % (l.replace(season + ' · ', ''), money2(v)) for l, v in s['rows'])
        blocks += ('<div class="sub-block"><h4>%s</h4><div class="table-wrap"><table><thead><tr><th>Rate</th><th style="text-align:right">US$ pp / night</th></tr></thead>'
                   '<tbody>%s</tbody></table></div></div>' % (season, rows))
    intro = ('Kwando 2027/28 STO 20% rates (sheet updated August 2026), valid 16 Apr 2027 &ndash; 15 Apr 2028. US$, fully inclusive; add the levy of US$20 per person per night. '
             'Night bands count total nights across Kwando camps; the single supplement is added to the sharing rate.')
    return ('<p class="raw yr-fallback" style="display:none;color:#a0522d"></p>' +
            '<div class="year-pane" data-year="2027"><div class="block"><h3>Rates</h3><p class="raw">%s</p>%s</div></div>' % (intro, blocks))
def tab2(c):
    rows = ''.join('<tr><td><strong>%s</strong></td><td style="text-align:right">%s</td></tr>' % (l.replace('Extras · ', '').replace('Transfers · ', 'Transfer: '), 'Free' if v == 'free' else money2(v))
                   for l, v in STO[c[0]][YR]['sections'][-1]['rows'])
    return ('<div class="year-pane" data-year="2027"><div class="block"><h3>Extras &amp; transfers</h3><p class="raw">Daily activities are included. Flights: see Moremi Air under Flights.</p>'
            '<div class="table-wrap"><table><thead><tr><th>Rate</th><th style="text-align:right">US$</th></tr></thead><tbody>%s</tbody></table></div></div></div>' % rows)
def tab3(c):
    return ('<div class="block"><h3>Policies &amp; Information</h3><div class="sub-block"><h4>Basis</h4><ul class="t-list"><li>%s</li></ul></div>'
            '<div class="sub-block"><h4>Payment &amp; cancellation</h4><ul class="t-list"><li>20%% non-refundable deposit on confirmation, due within 7 days; balance 60 days before arrival (same-month bookings pay in full).</li>'
            '<li>Cancellation: from confirmation to 61 days out the deposit; 60 days or less 100%%.</li><li>FIT provisional holds 14 days.</li></ul></div>'
            '<div class="sub-block"><h4>Contact</h4><ul class="t-list"><li>Kwando Safaris: info@kwando.co.bw, +267 686 1449 (emergency +267 7211 0506).</li></ul></div></div>'
            % note(c, 'sto').replace('&', '&amp;'))
db = []
for c in CAMPS:
    key = re.sub(r'[^a-z0-9]', '', c[1].lower())
    db.append('    "%s": {\n        name: `%s`, location: `%s`,\n        cover: "",\n        images: [],\n        shortDesc: `%s`,\n        intro: `%s`,\n'
              '        tab1: `%s`,\n        tab2: `%s`,\n        tab3: `%s`\n    }' % (key, c[1], c[5].replace(', Botswana', ''), lead(c), lead(c), tab1(c), tab2(c), tab3(c)))
NSB = 'ratesheets/natural_selection_botswana_ratesheet_v3.html'
src = rd(NSB)
a = src.index('const DB = {\n'); b = src.index('\n};\n\nconst grid')
gb = src[:a] + 'const DB = {\n' + ',\n'.join(db) + src[b:]
gb = once(gb, '<title>Natural Selection Botswana — Rates &amp; Booking 2026–2027', '<title>Kwando Safaris — Rates &amp; Booking 2027/28')
gb = once(gb, '<span class="hero-display">Natural Selection</span>', '<span class="hero-display">Kwando Safaris</span>')
gb = once(gb, '<p class="hero-tagline">Okavango Delta &amp; Makgadikgadi.</p>', '<p class="hero-tagline">Okavango Delta, Kwando, Nxai Pan &amp; the Central Kalahari.</p>')
gb = once(gb, '<p class="hero-sub">Nett 20% rates &middot; Seasons 2026 &amp; 2027</p>', '<p class="hero-sub">STO 20% rates &middot; Season 2027/28</p>')
gb = once(gb, '<span class="spec-value">Nett 20% (rack published)</span>', '<span class="spec-value">STO 20% (reference rack published)</span>')
gb = once(gb, '<span class="spec-value">2026 &amp; 2027 seasons (Green from 10 Jan)</span>', '<span class="spec-value">16 Apr 2027 – 15 Apr 2028</span>')
gb = re.sub(r"background:#2b2b2b url\('https://naturalselection\.travel/[^']*'\) center/cover no-repeat!important",
            'background:linear-gradient(135deg,#6b5844,#2f2519)!important', gb, count=1)
gb = once(gb, '>Natural Selection Rate Portal<', '>Kwando Safaris Rate Portal<')
gb = gb.replace('src="${d.cover}"', 'src="${d.cover}" onerror="this.style.visibility=\'hidden\'"')
assert gb.count('class="raw yr-fallback"') == len(CAMPS)
left = sorted({gb[max(0, m.start() - 40):m.start() + 30].replace('\n', ' ') for m in re.finditer(r'Natural Selection|naturalselection', gb)})
print('group sheet: "Natural Selection" left at %d places' % len(left), left[:8])
assert not os.path.exists(P(GROUP_SHEET))
wr(GROUP_SHEET, gb)

# ====================================================================== menus
def menus(s, js):
    q = '\\"' if js else '"'
    g_old = '<a href=%s/ratesheets/natural_selection_botswana_ratesheet_v3.html%s>Natural Selection Botswana</a>' % (q, q)
    g_new = g_old + '<a href=%s/%s%s>Kwando Safaris</a>' % (q, GROUP_SHEET, q)
    f_old = '<a href=%s/flight_rates.html#naturalselectionbw%s>Natural Selection Botswana</a>' % (q, q)
    f_new = f_old + '<a href=%s/flight_rates.html#moremiair%s>Moremi Air (Kwando)</a>' % (q, q)
    n = s.count(g_old) + s.count(f_old)
    if GROUP_SHEET not in s:
        s = s.replace(g_old, g_new)
    if 'flight_rates.html#moremiair' not in s:
        s = s.replace(f_old, f_new)
    return s, n
sc = rd('assets/site-chrome.js')
sc, n = menus(sc, True)
assert n >= 2 and 'flight_rates.html#moremiair' in sc and GROUP_SHEET in sc, n
wr('assets/site-chrome.js', sc, js=True)
cnt = 0
for f in glob.glob('**/*.html', recursive=True):
    if 'node_modules' in f or '.bak' in f:
        continue
    s = rd(f); s2, _ = menus(s, False)
    if s2 != s:
        wr(f, s2); cnt += 1
print('static headers updated in %d files' % cnt)
pt = rd('namibia_agent_portal.html')
pt = once(pt, """                        <a href="#" onclick="openFlightRates('naturalselectionbw'); return false;">Natural Selection Botswana</a>\n""",
          """                        <a href="#" onclick="openFlightRates('naturalselectionbw'); return false;">Natural Selection Botswana</a>\n                        <a href="#" onclick="openFlightRates('moremiair'); return false;">Moremi Air (Kwando)</a>\n""")
wr('namibia_agent_portal.html', pt)
print('done')
