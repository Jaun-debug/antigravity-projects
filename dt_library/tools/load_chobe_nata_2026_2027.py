#!/usr/bin/env python3
"""Load The Chobe Safari Lodge (2026/27 + corrected 2027/28) and Nata Lodge (new, 2026/27 + 2027/28).

    cd dt_library && python3 tools/load_chobe_nata_2026_2027.py

Sources (The Chobe Safari Lodge Agent Zone, Google Drive, transcribed in the Price List Vault 6 Oct 2026,
every figure re-checked here against the page renders of the PDFs):
  The Chobe Safari Lodge 2026- Rack & STO Agents.pdf          (sheet dated 24 Jun 2025) - rack + nett, packages nett only
  1. Rates 2027-28 - The Chobe Safari Lodge.pdf                ("Reference" = rack)
  2. Nett Rates 2027-28 - The Chobe Safari Lodge.pdf
  Nata Lodge - 2026 Rack USD.pdf / Nata Lodge - 2026 STO 20 USD.pdf
  Nata Lodge - 2027 Rack USD.pdf / Nata Lodge - 2027 STO 20% USD.pdf

Rules applied
  * Rack and nett loaded as printed. Nothing derived.
  * A row the sheet prints at one price (experiences, transfers, meals, Nata activities, levies, guide rates)
    carries rack = nett.
  * Rows printed as nett only with no rack (Chobe 2026/27 packages, Nata Makgadikgadi Special) go in the STO
    feed only, so a nett figure is never published as rack.
  * The Chobe Safari Lodge 2027 is REPLACED (same season, published rack instead of nett / 0.8); 2026 is added.
  * Every label carries the season dates and is unique once flattened. Text values carry no digits.
"""
import io, json, os, re, subprocess, sys

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

MARK = 'CHOBE-NATA-2026-2027-LOAD'
V26 = '01 Apr 2026 – 31 Mar 2027'
V27 = '01 Apr 2027 – 31 Mar 2028'
CSL, NATA = 'chobe-safari-lodge', 'nata-lodge'
CSL_NAME, NATA_NAME = 'The Chobe Safari Lodge', 'Nata Lodge'
MAK = 'makgadikgadi-accommodation'

def fmt(v):
    if isinstance(v, str):
        assert not re.search(r'\d', v), v
        return v
    if isinstance(v, float) and v != int(v):
        return '{:,.2f}'.format(v)
    return '{:,}'.format(int(v))

# Each row: (label, rack, nett).  rack None -> STO feed only.
def sec(title, rows):
    return (title, rows)

# ------------------------------------------------------------------ The Chobe Safari Lodge 2026/27
OCC26 = [('Adult sharing', 'Adult sharing (max two adults)'), ('Single adult', 'Single adult (with or without children)'),
         ('Child 6–11', 'Child 6–11 (0–5 free)')]
B26 = ['Half board + one activity', 'Full board + two activities', 'Fully inclusive + two activities']
ACC26 = {
    'Luxury Room': {'Adult sharing': [(445, 367), (550, 460), (600, 509)],
                    'Single adult': [(625, 510), (750, 618), (800, 668)],
                    'Child 6–11': [(240, 203), (310, 267), (360, 317)]},
    'Suite (River or Bush Suite)': {'Adult sharing': [(545, 467), (650, 559), (700, 609)],
                                    'Single adult': [(745, 627), (850, 719), (900, 769)],
                                    'Child 6–11': [(300, 263), (370, 327), (420, 377)]},
    'Explorer Suite': {'Adult sharing': [(595, 517), (700, 609), (750, 659)],
                       'Single adult': [(794, 677), (900, 769), (950, 819)],
                       'Child 6–11': [(330, 293), (400, 357), (450, 407)]},
}
csl26 = []
for room, occs in ACC26.items():
    for bi, board in enumerate(B26):
        rows = []
        for key, occ in OCC26:
            if room == 'Explorer Suite' and key == 'Adult sharing':
                occ = 'Adult sharing (max four adults)'
            if room.startswith('Suite') and key == 'Adult sharing':
                occ = 'Adult sharing'
            r, n = occs[key][bi]
            rows.append(('%s · %s · %s — %s' % (room, occ, board, V26), r, n))
        csl26.append(sec('%s · %s' % (room, board), rows))
csl26.append(sec('Campsite · per person per night', [
    ('Campsite · Adult · one activity, bed levy included — %s' % V26, 80, 70),
    ('Campsite · Child 6–11 · one activity, bed levy included — %s' % V26, 50, 45)]))
PK = [('Two-night Luxury Room package', ['Half board + two activities', 'Full board + four activities', 'Fully inclusive + four activities'],
       {'Adult sharing': (675, 866, 966), 'Single adult': (977, 1168, 1268), 'Child 6–11': (391, 498, 578)}, V26),
      ('Three-night Luxury Room package incl. Cattle Post dinner', ['Half board + three activities', 'Full board + six activities', 'Fully inclusive + six activities'],
       {'Adult sharing': (1059, 1290, 1440), 'Single adult': (1465, 1742, 1892), 'Child 6–11': (586, 737, 857)}, V26),
      ('Secret Season stay four pay three, Luxury Room', ['Half board + four activities', 'Full board + eight activities', 'Fully inclusive + eight activities'],
       {'Adult sharing': (1105, 1335, 1455), 'Single adult': (1530, 1815, 1935), 'Child 6–11': (610, 760, 880)},
       '01 Dec 2026 – 30 Apr 2027 excl. 23 Dec 2026 – 05 Jan 2027 and 26–30 Mar 2027')]
pkrows = []
for name, boards, occs, val in PK:
    for key, vals in occs.items():
        for b, v in zip(boards, vals):
            pkrows.append(('%s · %s · %s · nett per person for the whole package — %s' % (name, key, b, val), None, v))
csl26.append(sec('Packages · nett per person per package (no rack published)', pkrows))
EX26 = [('Enhanced · private boat safari, two to six guests · surcharge per person', 55),
        ('Enhanced · private boat safari, seven to fifteen guests · surcharge per person', 10),
        ('Enhanced · photographic boat safari excl. equipment · surcharge per person', 85),
        ('Enhanced · photographic boat safari incl. equipment, three to six guests · surcharge per person', 140),
        ('Enhanced · private game drive · per open seat (based on eight seats)', 55),
        ('Enhanced · scenic flight thirty minutes, min three guests · per person, excl. departure tax', 65),
        ('Dining · dinner cruise, three courses and drinks · per person', 35),
        ('Dining · Cattle Post Steakhouse, three courses and drinks · per person', 35),
        ('Excursion · Kasai fishing half day, max two guests · surcharge per person', 165),
        ('Excursion · Kasai fishing full day, max two guests · surcharge per person', 380),
        ('Excursion · private game drive half day, four to eight guests', 'no charge'),
        ('Excursion · private game drive full day, four to eight guests · surcharge per person', 55),
        ('Excursion · Victoria Falls day trip guided, min two guests · surcharge per person', 160),
        ('Excursion · Victoria Falls day trip unguided, min two guests', 'no charge')]
csl26.append(sec('Activities, dining & excursions · one price (rack = nett)', [('%s — %s' % (l, V26), v, v) for l, v in EX26]))
TR26 = [('Transfer · Victoria Falls town · one way per person', 95), ('Transfer · Victoria Falls town · return per person', 125),
        ('Transfer · Victoria Falls airport · one way per person', 105), ('Transfer · Victoria Falls airport · return per person', 130),
        ('Transfer · Livingstone town or airport · one way per person', 110), ('Transfer · Livingstone town or airport · return per person', 220),
        ('Transfer · Kazungula border · one way per person', 30), ('Transfer · Kasane airport · return', 'free')]
csl26.append(sec('Transfers · one price (rack = nett)', [('%s — %s' % (l, V26), v, v) for l, v in TR26]))
csl26.append(sec('Extras · one price (rack = nett)', [
    ('Impact levy · per person per night, not in room rates — %s' % V26, 5, 5),
    ('Guide, groups under ten rooms · per person per night DBB, excl. park fees — %s' % V26, 185, 185)]))

# ------------------------------------------------------------------ The Chobe Safari Lodge 2027/28
B27 = ['Half board + two experiences', 'Full board + two experiences', 'All inclusive + two experiences']
L27 = {'2+ nights': {'Adult sharing': [(475, 395), (550, 460), (600, 510)], 'Single adult': [(670, 555), (750, 620), (800, 670)],
                     'Child 6–11': [(260, 220), (310, 270), (360, 320)]},
       '1 night': {'Adult sharing': [(500, 415), (575, 485), (625, 535)], 'Single adult': [(705, 575), (785, 650), (835, 700)],
                   'Child 6–11': [(270, 230), (325, 280), (375, 335)]}}
OCC27 = {'Luxury Room': {'Adult sharing': 'Adult sharing', 'Single adult': 'Single adult (with or without children)', 'Child 6–11': 'Child 6–11 (max one child)'},
         'Suite (River or Bush Suite)': {'Adult sharing': 'Adult sharing', 'Single adult': 'Single adult (with or without children)', 'Child 6–11': 'Child 6–11 (max two children)'},
         'Explorer Suite': {'Adult sharing': 'Adult sharing', 'Single adult': 'Single adult (with or without children)', 'Child 6–11': 'Child 6–11 (max three children)'}}
csl27 = []
for bi, board in enumerate(B27):
    rows = []
    for band in ('2+ nights', '1 night'):
        for key in ('Adult sharing', 'Single adult', 'Child 6–11'):
            r, n = L27[band][key][bi]
            rows.append(('Luxury Room · %s · %s · %s — %s' % (OCC27['Luxury Room'][key], board, band, V27), r, n))
    csl27.append(sec('Luxury Room · %s' % board, rows))
SU27 = {'Suite (River or Bush Suite)': {'2+ nights': [(750, 625), (965, 800), (450, 375)], '1 night': [(850, 740), (1095, 935), (510, 460)]},
        'Explorer Suite': {'2+ nights': [(900, 750), (1140, 950), (540, 450)], '1 night': [(1000, 880), (1270, 1095), (600, 545)]}}
for room, bands in SU27.items():
    rows = []
    for band, vals in bands.items():
        for key, (r, n) in zip(('Adult sharing', 'Single adult', 'Child 6–11'), vals):
            rows.append(('%s · %s · All inclusive only · %s — %s' % (room, OCC27[room][key], band, V27), r, n))
    csl27.append(sec('%s · All inclusive only' % room, rows))
EX27 = [('Private boat safari · per boat', 150), ('Private game drive · per vehicle', 200), ('Scenic flight · per person', 90),
        ('Photographic boat safari excl. photo equipment · per person', 100), ('Photographic boat safari incl. photo equipment · per person', 150),
        ('Kasai fishing half day · per boat', 200), ('Kasai fishing full day · per boat', 300),
        ('Extended private game drive half day · per vehicle', 250), ('Extended private game drive full day · per vehicle', 400),
        ('Victoria Falls tour, guided · per person', 150), ('Victoria Falls tour, unguided · per person', 20),
        ('Helicopter, twelve minute Flight of Angels · per person', 175), ('Helicopter, twenty-five minute Zambezi Spectacular · per person', 330),
        ('White water rafting · per person', 185), ('Bungee jumping · per person', 195), ("Devil's Pool / Angel Pool · per person", 175)]
csl27.append(sec('Private experiences & Victoria Falls excursions · one price (rack = nett)', [('%s — %s' % (l, V27), v, v) for l, v in EX27]))
TR27 = [('Transfer · Victoria Falls town · one way per person', 100), ('Transfer · Victoria Falls town · return per person', 130),
        ('Transfer · Victoria Falls airport · one way per person', 110), ('Transfer · Victoria Falls airport · return per person', 135),
        ('Transfer · Livingstone town or airport · one way per person', 115), ('Transfer · Livingstone town or airport · return per person', 230),
        ('Transfer · Kazungula · one way per person', 32), ('Transfer · Kasane airport · return', 'free')]
csl27.append(sec('Transfers · one price (rack = nett)', [('%s — %s' % (l, V27), v, v) for l, v in TR27]))
csl27.append(sec('Extras · one price (rack = nett)', [
    ('Chobe dinner cruise · per person — %s' % V27, 35, 35),
    ('Impact levy · per person per night, not in room rates — %s' % V27, 5, 5),
    ('Guide, groups under ten rooms · per person per night DBB, excl. park fees — %s' % V27, 195, 195)]))

# ------------------------------------------------------------------ Nata Lodge
def nata(yr):
    V = V26 if yr == '2026' else V27
    rooms = {'2026': [(168, 134), (184, 147), (131, 105)], '2027': [(176, 141), (193, 154), (138, 110)]}[yr]
    camp = {'2026': [(17, 13), (11, 8)], '2027': [(18, 14), (11, 8)]}[yr]
    pkg = {'2026': (176, 244, 93), '2027': (180, 250, 95)}[yr]
    guide = {'2026': 95, '2027': 105}[yr]
    s = [sec('Accommodation · per room per night, room only', [
        ('Luxury Wooden Chalet · per room per night, room only — %s' % V, *rooms[0]),
        ('Luxury Family Chalet (two adults + two children) · per room per night, room only — %s' % V, *rooms[1]),
        ('Luxury En-suite Safari Tent · per room per night, room only — %s' % V, *rooms[2])]),
        sec('Campsite · per person per night', [
        ('Campsite · Adult 12+ · per person per night — %s' % V, *camp[0]),
        ('Campsite · Child 6–11 · per person per night — %s' % V, *camp[1])]),
        sec('Meals · per person, one price (rack = nett)', [('%s — %s' % (l, V), v, v) for l, v in [
            ('Breakfast · Adult · per person', 21), ('Breakfast · Child 6–11 · per person', 10),
            ('Packed breakfast · Adult · per person', 16), ('Packed breakfast · Child 6–11 · per person', 7),
            ('Lunch · per person', 'à la carte'),
            ('Dinner · Adult · per person', 37), ('Dinner · Child 6–11 · per person', 18)]]),
        sec('Activities · per person, one price (rack = nett)', [('%s — %s' % (l, V), v, v) for l, v in [
            ('Makgadikgadi salt pan drive AM/PM · Adult · per person', 40), ('Makgadikgadi salt pan drive AM/PM · Child 6–11 · per person', 20),
            ('Breakfast below the baobabs · Adult · per person', 68), ('Breakfast below the baobabs · Child 6–11 · per person', 37),
            ('Guided Nata village tour · Adult · per person', 29), ('Guided Nata village tour · Child 6–11 · per person', 15),
            ('Nata river paddle with Elsebe Camp · Adult · per person', 26), ('Nata river paddle with Elsebe Camp · Child 6–11 · per person', 14),
            ('Nata Bird Sanctuary fee, excluded from the pan drive and baobab breakfast · per person', 15)]]),
        sec('Package · nett only (no rack published)', [
            ('One-night Makgadikgadi Special, half board (chalet, breakfast, dinner, pan drive) · Per person sharing — %s' % V, None, pkg[0]),
            ('One-night Makgadikgadi Special, half board (chalet, breakfast, dinner, pan drive) · Single occupancy — %s' % V, None, pkg[1]),
            ('One-night Makgadikgadi Special, half board (chalet, breakfast, dinner, pan drive) · Child 6–11 — %s' % V, None, pkg[2])])]
    ext = [('Guide, groups under ten rooms · per person per night DBB — %s' % V, guide, guide)]
    if yr == '2027':
        ext += [('Impact levy, rooms · per person per night, not in the rate — %s' % V, 2, 2),
                ('Impact levy, campsite · per person per night, not in the rate — %s' % V, 1, 1),
                ('Government bed levy · per person per night, not in the rate — %s' % V, 1.5, 1.5)]
    s.append(sec('Extras · one price (rack = nett)', ext))
    return s

NOTES = {
 (CSL, '2026'): "Supplier sheet 'The Chobe Safari Lodge 2026 - Rack & STO Agents' (dated 24 Jun 2025), valid %s, rack and nett as printed. US$ per person per night: half board + one activity, full board / fully inclusive + two; incl. 14%% VAT, bed levy, Chobe NP fees for the included activities and return Kasane airport transfers. Impact levy US$5 pppn extra. Children 0–5 free, 6–11 child rate, 12+ adult. Not a flat commission: park fees and activities inside the rate are not discounted. Packages are printed nett only (no rack) and appear in the agent rates only. Activities, dining, excursions and transfers print one price: rack = nett. Explorer Suite single HB rack prints 794 (probably 795) - loaded as printed." % V26,
 (CSL, '2027'): "Supplier sheets '1. Rates 2027-28' (printed 'Reference' = rack) and '2. Nett Rates 2027-28', valid %s, rack and nett as printed (replaces the earlier rack derived as nett / 0.8). US$ per person per night with two included experiences per night on every plan; Suites and Explorer Suites all inclusive only; separate 2+ night and 1 night rates. Luxury Rooms take max one child. Incl. 14%% VAT, bed levy, return Kasane airport transfers. Impact levy US$5 pppn extra. Experiences, excursions, transfers, impact levy and guide rate are printed identically on both sheets: rack = nett. Secret Season: stay three nights or more, one night free, 01 Dec 2027 – 30 Apr 2028, same board basis." % V27,
 (NATA, '2026'): "Supplier sheets 'Nata Lodge USD Rack Rates 2026' and 'USD STO 20%% Rates 2026', valid %s. Rooms US$ per ROOM per night, room only (STO 20%%); campsite per person (rounded, so 22–27%%). Meals and activities print identically on both sheets: rack = nett. Children 0–5 free. Family chalets: two adults + two children, children 11 and under share with parents. VAT 14%% included; impact levy and government bed levy extra. One-night Makgadikgadi Special printed nett only (agent rates only). Guide rate printed on the STO sheet only. Nata Lodge belongs to the same group as The Chobe Safari Lodge." % V26,
 (NATA, '2027'): "Supplier sheets 'Nata Lodge USD Rack Rates 2027' and 'USD STO 20%% Rates 2027', valid %s. Rooms US$ per ROOM per night, room only (STO 20%%); campsite per person. Meals and activities print identically on both sheets: rack = nett. VAT 14%% included; impact levy (rooms US$2, campsite US$1 pppn) and government bed levy US$1.50 pppn extra. One-night Makgadikgadi Special printed nett only (agent rates only). Guide rate printed on the STO sheet only. Nata Lodge belongs to the same group as The Chobe Safari Lodge." % V27,
}
DATA = {(CSL, '2026'): csl26, (CSL, '2027'): csl27, (NATA, '2026'): nata('2026'), (NATA, '2027'): nata('2027')}

def doc(slug, yr, kind):
    secs = []
    for title, rows in DATA[(slug, yr)]:
        out = []
        for l, r, n in rows:
            v = n if kind == 'sto' else r
            if v is None:
                continue
            out.append([l, fmt(v)])
        if out:
            secs.append({'title': title, 'rows': out})
    labels = [r[0] for s in secs for r in s['rows']]
    assert len(labels) == len(set(labels)), (slug, yr, kind)
    V = V26 if yr == '2026' else V27
    for l in labels:
        assert V.split(' – ')[0] in l or '01 Dec 2026' in l, l
    d = {'name': CSL_NAME if slug == CSL else NATA_NAME, 'region': 'Chobe' if slug == CSL else 'Makgadikgadi & Boteti',
         'currency': 'US$', 'validity': V, 'note': NOTES[(slug, yr)], 'sections': secs}
    if kind == 'sto' and slug == NATA:
        d['commission'] = 'STO20'
    return d

# rack = nett exactly on one-price rows, commissionable rows below rack
for (slug, yr), secs in DATA.items():
    for t, rows in secs:
        for l, r, n in rows:
            if r is None or isinstance(n, str):
                continue
            assert n <= r, l
            if 'rack = nett' in t:
                assert r == n, l
            if slug == NATA and t.startswith('Accommodation'):
                assert round(r * 0.8) == n, (l, r, n)   # Nata rooms: clean 20%

RACK = {CSL: {y: doc(CSL, y, 'rack') for y in ('2026', '2027')}, NATA: {y: doc(NATA, y, 'rack') for y in ('2026', '2027')}}
STO = {CSL: {y: doc(CSL, y, 'sto') for y in ('2026', '2027')}, NATA: {y: doc(NATA, y, 'sto') for y in ('2026', '2027')}}

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
state = lambda: json.loads(subprocess.check_output(['node', '-e', NODE, ROOT, CSL, NATA]))
before = state()
for fn in ('sto', 'rack'):
    assert MARK not in rd('api/%s.js' % fn), 'already loaded'
    assert NATA not in before[fn]['cov'], ('nata-lodge already exists', fn)
    assert list(before[fn]['cov'][CSL]) == ['2027'], (fn, before[fn]['cov'][CSL])
old_sto27 = before['sto']['dds'][CSL]['2027']

def block(kind, data):
    dds = 'DDS_STO_BY_YEAR' if kind == 'sto' else 'DDS_RACK_BY_YEAR'
    return '''
/* %s — The Chobe Safari Lodge 2026/27 + 2027/28 (published rack replaces nett / 0.8) and Nata Lodge 2026/27 + 2027/28, as printed. Sets these two slugs' years 2026 and 2027 only; never touches any other slug or year. Generated by tools/load_chobe_nata_2026_2027.py. */
(function loadChobeNata%s() {
  var V = %s;
  if (typeof %s === 'undefined') return;
  Object.keys(V).forEach(function (slug) {
    var e = %s[slug] || (%s[slug] = {});
    Object.keys(V[slug]).forEach(function (y) { e[y] = V[slug][y]; });
  });
})();
''' % (MARK, kind.capitalize(), json.dumps(data, ensure_ascii=False, indent=1), dds, dds, dds)
for kind, data in (('sto', STO), ('rack', RACK)):
    wr('api/%s.js' % kind, rd('api/%s.js' % kind) + block(kind, data), js=True)
after = state()
for fn in ('sto', 'rack'):
    lost = [(s, y) for s, ys in before[fn]['cov'].items() for y in ys if y not in after[fn]['cov'].get(s, {})]
    assert not lost, ('a year was lost', fn, lost)
    changed = [s for s in after[fn]['cov'] if after[fn]['cov'][s] != before[fn]['cov'].get(s)]
    assert sorted(changed) == sorted([CSL, NATA]), (fn, changed)
    for s in (CSL, NATA):
        assert sorted(after[fn]['dds'][s]) == ['2026', '2027'], (fn, s)
    print(fn, 'slugs %d -> %d; changed: %s' % (len(before[fn]['cov']), len(after[fn]['cov']), changed))

# The 2027 nett figures must be the same nett figures that were already loaded (same sheet), room rows at least
num = lambda d: sorted(float(v.replace(',', '')) for s in d['sections'] for l, v in s['rows'] if re.fullmatch(r'[\d,.]+', v))
old_n, new_n = num(old_sto27), num(STO[CSL]['2027'])
print('Chobe 2027 nett values: old %d, new %d; only in old: %s; only in new: %s' % (
    len(old_n), len(new_n), sorted(set(old_n) - set(new_n)), sorted(set(new_n) - set(old_n))))

# ====================================================================== index + lodges-info
def flat(d):
    out = []
    for s in d['sections']:
        for l, v in s['rows']:
            if not re.fullmatch(r'[\d,.]+', v):
                continue
            x = float(v.replace(',', ''))
            out.append({'n': l, 'p': int(x) if x == int(x) else x})
    return out
raw = rd('assets/rates-index.json'); data = json.loads(raw)
assert json.dumps(data, indent=0, ensure_ascii=False) == raw, 'index on-disk format changed'
snap_before = {x['name']: json.dumps(x, sort_keys=True, ensure_ascii=False) for x in data['lodges']}
assert NATA_NAME not in snap_before
csl_e = [x for x in data['lodges'] if x['name'] == CSL_NAME]
assert len(csl_e) == 1
e = csl_e[0]
e['rates'] = flat(after['sto']['dds'][CSL]['2026']); e['rack_2026'] = flat(after['rack']['dds'][CSL]['2026'])
e['rates_2027'] = flat(after['sto']['dds'][CSL]['2027']); e['rack_2027'] = flat(after['rack']['dds'][CSL]['2027'])
data['lodges'].append({'file': '', 'name': NATA_NAME, 'region': 'Makgadikgadi & Boteti', 'cur': 'USD',
                       'rates': flat(after['sto']['dds'][NATA]['2026']), 'rack_2026': flat(after['rack']['dds'][NATA]['2026']),
                       'rates_2027': flat(after['sto']['dds'][NATA]['2027']), 'rack_2027': flat(after['rack']['dds'][NATA]['2027'])})
data['count'] = len(data['lodges'])
snap_after = {x['name']: json.dumps(x, sort_keys=True, ensure_ascii=False) for x in data['lodges']}
diff = sorted(n for n in snap_after if snap_after[n] != snap_before.get(n))
assert diff == sorted([CSL_NAME, NATA_NAME]), diff
losing = [n for n in snap_before if n not in snap_after or
          sum(len(json.loads(snap_after[n]).get(k) or []) for k in ('rates', 'rates_2027')) <
          sum(len(json.loads(snap_before[n]).get(k) or []) for k in ('rates', 'rates_2027'))]
print('index: changed %s; lodges losing rates: %d; count %d' % (diff, len(losing), data['count']))
assert not losing
wr('assets/rates-index.json', json.dumps(data, indent=0, ensure_ascii=False))

CI = 'https://static.chobesafarilodge.com/images/'
NI = 'https://static.natalodge.com/images/'
CSL_IMGS = [CI + x for x in ['home/chobe1.jpg'] + ['safari-rooms/safari-room%d.jpg' % i for i in (1, 2, 3)] +
            ['2026/02/19/the-chobe-safari-lodge---river-rooms-%s-2.jpg' % i for i in ('1', '15', '9')] +
            ['bush-rooms/bush-room%d.jpg' % i for i in (1, 2, 3)] + ['family-suite/family-suite%d.jpg' % i for i in (1, 2, 3)] +
            ['rondavels/riverfront-rondavels.jpg', 'rondavels/riverfront-rondavels2.jpg', 'rondavels/riverfront-rondavels3.jpg'] +
            ['campsite/campsite%d.jpg' % i for i in (1, 2, 3)] + ['facilities/facilities%d.jpg' % i for i in (1, 2, 3)]]
# opened 6 Oct 2026: all 22 load. Nata: nata-accomodation1..2 and campsite-gallery1..3 return 404 and are dropped.
NATA_IMGS = [NI + x for x in ['1-overnight.jpg', '2-overnight.jpg'] + ['accomodation/wooden-chalet/wooden-chalet%d.jpg' % i for i in (1, 2, 3)] +
             ['accomodation/glamping-tents/tents%d.jpg' % i for i in (1, 2, 3)] +
             ['accomodation/wooden-luxury/wooden-family-room%d.jpg' % i for i in (1, 2, 3)]]
assert len(CSL_IMGS) == 22 and len(NATA_IMGS) == 11

raw = rd('assets/lodges-info.json'); info = json.loads(raw)
assert json.dumps(info, indent=0, ensure_ascii=False) == raw, 'lodges-info on-disk format changed'
assert info['thechobesafarilodge']['imgs'] == [] and 'natalodge' not in info
info['thechobesafarilodge']['imgs'] = CSL_IMGS
NATA_LEAD = ('Road-trip stop near Nata, about 10 km from the Nata Bird Sanctuary on the Makgadikgadi Pans — wooden chalets, '
             'family chalets, en-suite safari tents and a campsite. Rooms are priced per room, room only; rates in US$.')
info['natalodge'] = {'name': NATA_NAME, 'url': '/%s/%s/' % (MAK, NATA), 'lead': NATA_LEAD, 'imgs': NATA_IMGS, 'orig': '', 'cur': 'USD'}
wr('assets/lodges-info.json', json.dumps(info, indent=0, ensure_ascii=False))

# ====================================================================== lodge pages
CSL_PAGE = 'chobe-accommodation/%s/index.html' % CSL
D = rd(CSL_PAGE)
D_HERO = '<div class="hero" style="background:linear-gradient(135deg,#6b5844,#2f2519)">'
D_SE = '<span class="scroll-cue" aria-hidden="true"></span></a>'
assert D.count(D_HERO) == 1 and 'class="hero-thumbs"' not in D and 'static.chobesafarilodge.com' not in D

def photos(s, imgs, alt):
    s = once(s, D_HERO, '<div class="hero" style="background:#2b2b2b url(\'%s\') center/cover no-repeat">' % imgs[0])
    thumbs = ''.join('<img class="hero-thumb%s" src="%s" data-full="%s" alt="" loading="lazy" onerror="this.remove()">'
                     % (' active' if i == 0 else '', u, u) for i, u in enumerate(imgs[:6]))
    i = s.index(D_HERO.split(' style')[0] + ' style')
    j = s.index(D_SE, i) + len(D_SE)
    s = s[:j] + '<div class="hero-thumbs">' + thumbs + '</div>' + s[j:]
    gal = ('\n<section style="padding-top:0"><div class="wrap">\n  <h2>Photos</h2>\n  <div class="lodge-gallery">%s</div>\n</div></section>\n'
           % ''.join('<img src="%s" alt="%s" loading="lazy" onerror="this.remove()">' % (u, alt) for u in imgs))
    anchor = '\n<section style="padding-top:0"><div class="wrap">\n  <div class="rate-head">'
    s = once(s, anchor, gal + anchor)
    return s

# Nata page cloned from the photo-less Chobe page before its photos go in
D_DESC = 'Riverside lodge in Kasane on the Chobe River — Luxury Rooms, Suites and Explorer Suites, two included experiences per night.'
D_LEAD = re.search(r'<p class="lead">(.*?)</p>', D).group(1)
D_LOC = 'Kasane, on the Chobe River, Botswana'
assert D.count(D_DESC) == 2 and D.count(D_LOC) == 2
n = D.replace('The Chobe Safari Lodge | Chobe', 'Nata Lodge | Makgadikgadi &amp; Boteti')
n = n.replace(D_DESC, NATA_LEAD).replace(D_LOC, 'Nata, Makgadikgadi Pans, Botswana')
n = once(n, '<p class="lead">%s</p>' % D_LEAD,
         '<p class="lead">A convenient road-trip break near Nata, about 10 km from the Nata Bird Sanctuary and the Makgadikgadi salt pans — '
         'luxury wooden chalets, family chalets, en-suite safari tents and a campsite. Rooms are priced per room per night, room only; '
         'meals and activities are extra per person. All rates in US$.</p>')
n = n.replace('/chobe-accommodation/chobe-safari-lodge/', '/%s/%s/' % (MAK, NATA))
n = once(n, '<a class="hero-back" href="/chobe-accommodation/">&#8592; Back to Chobe Accommodation</a>',
         '<a class="hero-back" href="/%s/">&#8592; Back to Makgadikgadi &amp; Boteti Accommodation</a>' % MAK)
n = once(n, "var LODGE='chobe-safari-lodge'", "var LODGE='%s'" % NATA)
n = n.replace('The%20Chobe%20Safari%20Lodge', 'Nata%20Lodge').replace('The Chobe Safari Lodge', NATA_NAME)
n = photos(n, NATA_IMGS, NATA_NAME)
for bad in ('Chobe Safari', 'chobe-safari', 'Kasane', 'Luxury Room', 'Explorer Suite', 'chobesafarilodge'):
    assert bad not in n, bad
assert n.count("var LODGE='%s'" % NATA) == 1
os.makedirs(P('%s/%s' % (MAK, NATA)), exist_ok=True)
assert not os.path.exists(P('%s/%s/index.html' % (MAK, NATA)))
wr('%s/%s/index.html' % (MAK, NATA), n)

c = photos(D, CSL_IMGS, CSL_NAME)
assert 'natalodge' not in c
wr(CSL_PAGE, c)

# ====================================================================== region pages
mk = rd(MAK + '/index.html')
CARD = ('<a class="card has-rates" data-name="nata lodge" href="/%s/%s/"><div class="img" style="background-image:url(\'%s\')"><span class="rate-badge">'
        '<span class="rate-dot"></span>Rates</span><h3>Nata Lodge</h3></div><div class="body"><p>Makgadikgadi &amp; Boteti &middot; US$</p>'
        '<span class="go">View lodge &amp; rates &rarr;</span></div></a>' % (MAK, NATA, NATA_IMGS[0]))
assert 'nata-lodge' not in mk and '?lodge=Nata' not in mk
a = mk.index('<div class="area-sec" id="area-makgadikgadi">')
b = mk.index('\n  </div></div>', a)
mk = mk[:b] + '\n    ' + CARD + mk[b:]
wr(MAK + '/index.html', mk)

ch = rd('chobe-accommodation/index.html')
m = re.search(r'(<a class="card has-rates" data-name="the chobe safari lodge" href="/chobe-accommodation/chobe-safari-lodge/"><div class="img" style=")([^"]*)(")', ch)
assert m, 'chobe card'
ch = ch[:m.start(2)] + "background-image:url('%s')" % CSL_IMGS[0] + ch[m.end(2):]
wr('chobe-accommodation/index.html', ch)
print('pages: nata-lodge page created, Chobe page photos (22), region cards updated')
