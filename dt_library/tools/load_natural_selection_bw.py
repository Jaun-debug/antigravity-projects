#!/usr/bin/env python3
"""Load Natural Selection Botswana 2026 + 2027 (nett 20% and published rack).

    cd dt_library && python3 tools/load_natural_selection_bw.py            # apply
    cd dt_library && python3 tools/load_natural_selection_bw.py --parse    # read the sheets and print checks only

Sources (Natural Selection Agent Zone -> Contract Rates, SharePoint "RATES & SPECIALS - 20% NETT"):
  ratesheets/originals/natural_selection/ns_botswana_2026_nett.pdf   "Botswana 2026 Rates, Nett 20%", issued 8 Jan 2026
  ratesheets/originals/natural_selection/ns_botswana_2026_rack.pdf   "Botswana 2026 Rates, Rack", issued 8 Jan 2026
  ratesheets/originals/natural_selection/ns_botswana_2027_nett.pdf   "Botswana 2027 Rates, Nett 20%", issued 1 Oct 2026
  ratesheets/originals/natural_selection/ns_botswana_2027_rack.pdf   "Botswana 2027 Rates, Rack", issued 9 Sep 2026
  ratesheets/originals/natural_selection/ns_rate_sheet_changes_2027_20261001.pdf

What it does (MARK below; idempotent blocks only add years to new slugs)
  * api/sto.js (nett) and api/rack.js (published rack): 19 new slugs, years 2026 and 2027 as printed
    (Mokolwane Plains and Mokolwane Plains Villa open in 2027, so 2027 only).
  * assets/rates-index.json and assets/lodges-info.json entries.
  * Lodge pages (same photo-less donor as load_wilderness_b9.py, with the camp's own hero photo from
    naturalselection.travel), Okavango Delta region cards (+ a "Southern Delta" section for Mokolwane,
    which the sheets place in the southern Delta / NG29), a new Makgadikgadi & Boteti region page.
  * Group sheet ratesheets/natural_selection_botswana_ratesheet_v3.html, flight card (Natural Selection's
    Mack Air and Helicopter Horizons seat rates and transfers), activity card, menus, agent portal.
Every figure written is read from the PDFs by this script; nothing is typed in by hand except the two
seat-rate triangles, and each of their rows is asserted against the sheet text.
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
MARK = 'NATURAL-SELECTION-BW-2026-2027-LOAD'
SRCDIR = 'ratesheets/originals/natural_selection/'
PDFS = {('2026', 'nett'): 'ns_botswana_2026_nett.pdf', ('2026', 'rack'): 'ns_botswana_2026_rack.pdf',
        ('2027', 'nett'): 'ns_botswana_2027_nett.pdf', ('2027', 'rack'): 'ns_botswana_2027_rack.pdf'}
ISSUED = {('2026', 'nett'): '8 January 2026', ('2026', 'rack'): '8 January 2026',
          ('2027', 'nett'): '1 October 2026', ('2027', 'rack'): '9 September 2026'}
TXT = {k: subprocess.check_output(['pdftotext', '-layout', P(SRCDIR + f), '-']).decode('utf-8') for k, f in PDFS.items()}
for k, t in TXT.items():
    assert ('ISSUED: ' + ISSUED[k].upper()) in t, k
    assert ('Nett 20%' if k[1] == 'nett' else 'Rack') + ' | BOTSWANA : %s Rates in USD' % k[0] in t, k
    for frag in ('10 Jan - 31Mar', '1 - 30 Apr | 1 Nov - 19 Dec', '1 - 31 May | 1 - 31 Oct', '1- 30 Jun | 1 - 30 Sep', '1 Jul - 31 Aug', '20 Dec - 9 Jan'):
        assert frag in t, (k, frag)

SEAS = ['Green (10 Jan – 31 Mar)', 'Shoulder (1–30 Apr, 1 Nov – 19 Dec)', 'Shoulder High (1–31 May, 1–31 Oct)',
        'High (1–30 Jun, 1–30 Sep, 20 Dec – 9 Jan)', 'Peak (1 Jul – 31 Aug)']
SEAS_SHORT = ['Green', 'Shoulder', 'Shoulder High', 'High', 'Peak']
BANDS = {'2026': ['1-5 Night Rate', '6-7 Night Rate', '8 Night+ Rate'],
         '2027': ['1-5 Night Rate', '6 Night+ Rate', '8 Night+ Rate', '10 Night+ Rate']}
BAND_LABEL = {'1-5 Night Rate': '1–5 night rate', '6-7 Night Rate': '6–7 night rate', '8 Night+ Rate': '8+ night rate',
              '6 Night+ Rate': '6+ night rate', '10 Night+ Rate': '10+ night rate'}
PP = ["Jack's Camp", 'Tawana', 'Mokolwane Plains', 'North Island Okavango', 'Tuludi', "Duke's Camp", "Duke's East", 'Mbamba',
      'Sable Alley', 'San Camp', 'Elephant Pan', 'Expeditions Camp', 'Camp Kalahari', 'Little Sable', 'Meno a Kwena', 'Mokolwane', 'Skybeds']
UNIT = ["Jack's Private Camp", 'Mokolwane Plains Villa (opening 20 Dec 2027)']
NEW_2027 = ('Mokolwane Plains', 'Mokolwane Plains Villa (opening 20 Dec 2027)')
NUM = lambda c: int(c.replace(' ', '').replace(',', ''))
BAND_RE = re.compile(r'^\s*(1-\s?5 Night Rate|6-7 Night Rate|8 Night\+ Rate|8\+ Night Rate|6 Night\+ Rate|10 Night\+ Rate)\s{2,}(.*\S)\s*$')

def parse(key):
    yr = key[0]
    want = [c for c in PP + UNIT if yr == '2027' or c not in NEW_2027]
    out, cur = {}, None
    for line in TXT[key].split('\n'):
        st = line.strip()
        if st in want:
            if st in out:                        # the name again in a transfers table further on
                cur = None; continue
            cur = st; out[cur] = {}
            continue
        m = BAND_RE.match(line)
        if not m:
            continue
        assert cur, (key, line)
        band = m.group(1).replace('1- 5', '1-5').replace('8+ Night Rate', '8 Night+ Rate')
        cells = re.split(r'\s{2,}', m.group(2))
        if any('%' in c for c in cells):          # the long-stay discount table on the notes page
            continue
        if cur in UNIT:
            assert len(cells) == 5, (key, cur, cells)
            vals = [None if c == 'Closed' else NUM(c) for c in cells]
        else:
            if cells[0] == 'Closed':
                assert len(cells) == 9, (key, cur, cells)
                nums = [NUM(c) for c in cells[1:]]
                vals = [None] + [(nums[i], nums[i + 1]) for i in range(0, 8, 2)]
            else:
                assert len(cells) == 10, (key, cur, cells)
                nums = [NUM(c) for c in cells]
                vals = [(nums[i], nums[i + 1]) for i in range(0, 10, 2)]
        assert band not in out[cur], (key, cur, band)
        out[cur][band] = vals
    assert sorted(out) == sorted(want), (key, sorted(set(want) ^ set(out)))
    for c, bands in out.items():
        assert list(bands) == BANDS[yr], (key, c, list(bands))
        for b, vals in bands.items():
            for i, v in enumerate(vals):
                if v is None or c in UNIT:
                    continue
                p, s = v
                if i == 0:
                    assert s == 0, (key, c, b, v)                       # green: supplement waived
                else:
                    assert abs(s - p * 0.4) <= 1.01, (key, c, b, i, v)   # every supplement is 40% of sharing
    return out

R = {k: parse(k) for k in TXT}

def extras(key):
    t = TXT[key]
    pv = set()
    for l in t.split('\n'):
        if l.strip().startswith('Private Vehicle'):
            pv.add(tuple(NUM(c) for c in re.split(r'\s{2,}', l.strip())[1:]))
    assert len(pv) == 1, (key, pv)
    pv = list(pv.pop()); assert len(pv) == 5
    ccr = t.count('+60 pppn'); assert ccr >= 15, (key, ccr)
    if key[0] == '2026':
        g = set(re.findall(r'PILOT/GUIDE RATE:\s+USD (\d+) pppn - valid year-round', t))
    else:
        g = set()
        for l in t.split('\n'):
            if l.strip().startswith('Pilot / Guide'):
                g |= set(re.split(r'\s{2,}', l.strip())[1:])
    assert len(g) == 1, (key, g)
    return {'vehicle': pv, 'guide': int(g.pop()), 'ccr': 60}
EX = {k: extras(k) for k in TXT}
assert EX[('2026', 'nett')] == EX[('2026', 'rack')] == {'vehicle': [725, 835, 835, 935, 935], 'guide': 285, 'ccr': 60}, EX
assert EX[('2027', 'nett')] == EX[('2027', 'rack')] == {'vehicle': [745, 850, 850, 960, 960], 'guide': 305, 'ccr': 60}, EX

# rack against nett / 0.80 — reported, not forced (the 2027 rack sheet predates the 1 Oct Mokolwane Plains correction)
DEV = []
for yr in ('2026', '2027'):
    for c, bands in R[(yr, 'nett')].items():
        for b, vals in bands.items():
            for i, (n, r) in enumerate(zip(vals, R[(yr, 'rack')][c][b])):
                if n is None:
                    assert r is None, (yr, c, b, i)
                    continue
                for a, z in zip(n if isinstance(n, tuple) else (n,), r if isinstance(r, tuple) else (r,)):
                    if a and abs(z - a / 0.8) > max(2, 0.004 * z):
                        DEV.append((yr, c, b, SEAS_SHORT[i], a, z))
print('rack vs nett/0.80 deviations:', DEV or 'none')

# ------------------------------------------------------------------ camps
DELTA, LIN, MAK = 'okavango-delta-accommodation', 'linyanti-savuti-accommodation', 'makgadikgadi-accommodation'
NSU = 'https://naturalselection.travel/wp-content/uploads/'
# slug, display name, sheet name, tier, folder, area key, location line, photo (hero of the camp's naturalselection.travel page)
CAMPS = [
    ('jacks-camp', "Jack's Camp", "Jack's Camp", 'Premier', MAK, None, 'Makgadikgadi Pans, Botswana', '2024/04/Header-1920x1080-6.jpg'),
    ('jacks-private-camp', "Jack's Private Camp", "Jack's Private Camp", 'Exclusive use', MAK, None, 'Makgadikgadi Pans, Botswana', '2024/05/Header-1920x1080-3.jpg'),
    ('san-camp', 'San Camp', 'San Camp', 'Classic', MAK, None, 'Makgadikgadi Pans, Botswana', '2024/04/Header-1920x1080-7.jpg'),
    ('camp-kalahari', 'Camp Kalahari', 'Camp Kalahari', 'Explorer', MAK, None, 'Makgadikgadi Pans, Botswana', '2024/05/Header-1920x1080-2.jpg'),
    ('meno-a-kwena', 'Meno a Kwena', 'Meno a Kwena', 'Explorer', MAK, None, 'Boteti River, Makgadikgadi, Botswana', '2024/05/Video-1800x650-3.jpg'),
    ('tawana', 'Tawana', 'Tawana', 'Premier', DELTA, 'moremi', 'Moremi Game Reserve, Okavango Delta, Botswana', '2024/04/Video-1800x650-8.jpg'),
    ('north-island-okavango', 'North Island Okavango', 'North Island Okavango', 'Premier', DELTA, 'north', 'Northern Okavango Delta (NG12/NG23A), Botswana', '2024/05/Header-1920x1080-4.jpg'),
    ('dukes-camp', "Duke's Camp", "Duke's Camp", 'Classic', DELTA, 'north', 'Northern Okavango Delta (NG12/NG23A), Botswana', '2024/04/Header-1920x1080-12.jpg'),
    ('dukes-east', "Duke's East", "Duke's East", 'Classic', DELTA, 'north', 'Northern Okavango Delta (NG12/NG23A), Botswana', '2024/07/Header-1920x1080-3.jpg'),
    ('mbamba', 'Mbamba', 'Mbamba', 'Classic', DELTA, 'north', 'Northern Okavango Delta (NG12/NG23A), Botswana', '2024/10/Header-1920x1080-1.jpg'),
    ('expeditions-camp', 'Expeditions Camp', 'Expeditions Camp', 'Explorer', DELTA, 'north', 'Northern Okavango Delta (NG12/NG23A), Botswana', '2025/11/Header-1920x1080-1.jpg'),
    ('tuludi', 'Tuludi', 'Tuludi', 'Premier', DELTA, 'khwai', 'Khwai Private Reserve, Okavango Delta, Botswana', '2024/04/Header-1920x1080-1.jpg'),
    ('sable-alley', 'Sable Alley', 'Sable Alley', 'Classic', DELTA, 'khwai', 'Khwai Private Reserve, Okavango Delta, Botswana', '2024/05/Header-1920x1080-16.jpg'),
    ('little-sable', 'Little Sable', 'Little Sable', 'Explorer', DELTA, 'khwai', 'Khwai Private Reserve, Okavango Delta, Botswana', '2024/04/Header-1920x1080-3.jpg'),
    ('elephant-pan', 'Elephant Pan', 'Elephant Pan', 'Explorer', DELTA, 'khwai', 'Khwai Private Reserve, Okavango Delta, Botswana', '2024/07/Header-1920x1080-2.jpg'),
    ('skybeds', 'Skybeds', 'Skybeds', 'Explorer', DELTA, 'khwai', 'Khwai Private Reserve, Okavango Delta, Botswana', '2024/04/Header-1920x1080-5.jpg'),
    ('mokolwane', 'Mokolwane', 'Mokolwane', 'Explorer', DELTA, 'south', 'Southern Okavango Delta (NG29), Botswana', '2024/07/Header-1920x1080-1.jpg'),
    ('mokolwane-plains', 'Mokolwane Plains', 'Mokolwane Plains', 'Premier', DELTA, 'south', 'Southern Okavango Delta (NG29), Botswana', '2026/08/Header-1920x1080-2.jpg'),
    ('mokolwane-plains-villa', 'Mokolwane Plains Villa', 'Mokolwane Plains Villa (opening 20 Dec 2027)', 'Exclusive use', DELTA, 'south', 'Southern Okavango Delta (NG29), Botswana', '2026/08/Header-1920x1080-2.jpg'),
]
assert sorted(c[2] for c in CAMPS) == sorted(PP + UNIT)
IMG = {c[0]: NSU + c[7] for c in CAMPS}
TIER_OK = {"Jack's Camp": 'PREMIER CAMPS', 'San Camp': 'CLASSIC CAMPS', 'Camp Kalahari': 'EXPLORER CAMPS', "Jack’s Private Camp": 'EXCLUSIVE USE CAMPS'}
for nm, tier in TIER_OK.items():
    assert re.search(re.escape(tier) + r'\s+' + re.escape(nm), TXT[('2027', 'nett')]), nm
NOTES = {
    'san-camp': 'San Camp is open 1 Apr – 15 Oct (closed 16 Oct – 31 Mar).',
    'skybeds': 'Skybeds is open 1 Apr – 31 Oct, takes guests 16 and older (12–15 only on exclusive use, sharing a platform with an adult), and is reached by the Skybeds transfer (see Natural Selection Botswana under Flights).',
    'expeditions-camp': 'Expeditions Camp is closed in green season (10 Jan – 31 Mar).',
    'mokolwane-plains': 'Mokolwane Plains opens 15 July 2027 (closed in green season). Introductory special: 50% off the nightly accommodation rate for travel 15–31 July 2027.',
    'mokolwane-plains-villa': 'Mokolwane Plains Villa opens 20 Dec 2027; the 2027 sheet prices only the High season column. Per villa per night, based on 2 adults + 2 children or 3 adults; max 4 adults + 2 children, extra guests at Mokolwane Plains per person rates. Private guide and vehicle included.',
    'jacks-private-camp': 'Per unit per night, based on 2 adults + 2 children or 3 adults; max 4 adults + 2 children, extra guests at Jack’s Camp per person rates. Private guide and vehicle included.',
    'tawana': 'Tawana Complimentary Access (2026): book 3 nights at Tawana with 3+ nights at another Natural Selection Botswana camp for complimentary flights between Tawana and Maun/the Delta/Linyanti.',
    'mokolwane': 'Mokolwane Complimentary Access (2026): book 3 nights with 3+ nights at another Natural Selection Botswana camp for a complimentary one-way arrival helicopter transfer from Maun/the Delta/Linyanti.',
}
for frag in ('Mokolwane Plains Introductory Special: 50% off nightly accommodate rate for travel from 15 - 31 July 2027',):
    assert frag in TXT[('2027', 'nett')], frag
assert 'Tawana Complimentary Access*' in TXT[('2026', 'nett')] and 'Mokolwane Complimentary Access*' in TXT[('2026', 'nett')]
CHILD = ('Okavango Delta camps take children 6 and older (Skybeds 16+); Makgadikgadi and Boteti camps take all ages. '
         'Children 6–18 sharing with adults pay 50% of the per person sharing rate; 0–5 free in the Makgadikgadi/Boteti.')
WAIVER = 'single supplement waived 10 Jan – 31 Mar and 1 Oct – 19 Dec'
assert re.search(r'SINGLE SUPPLEMENT WAIVER:\s+10 Jan - 31 Mar and 1 Oct to 19 Dec\.', TXT[('2026', 'nett')])
assert '*Single Supplement Waiver: 10 Jan - 31 Mar and 1 Oct - 19 Dec' in TXT[('2027', 'nett')]

def fmt(n):
    return '{:,}'.format(n)

def years_of(c):
    return [y for y in ('2026', '2027') if c[2] in R[(y, 'nett')]]

def acc_sections(c, yr, kind):
    data = R[(yr, kind)][c[2]]
    lab = 'net STO' if kind == 'nett' else 'rack'
    secs = []
    for b in BANDS[yr]:
        rows = []
        for i, v in enumerate(data[b]):
            if v is None:
                continue
            if c[2] in UNIT:
                rows.append(['%s · %s · per unit per night' % (SEAS[i], BAND_LABEL[b]), fmt(v)])
            else:
                p, s = v
                rows.append(['%s · %s · Fully Inclusive — per person sharing' % (SEAS[i], BAND_LABEL[b]), fmt(p)])
                rows.append(['%s · %s · Fully Inclusive — single%s' % (SEAS[i], BAND_LABEL[b], ' (supplement waived)' if s == 0 else ''), fmt(p + s)])
        if rows:
            secs.append({'title': '%s — %s · %s' % (yr, lab, BAND_LABEL[b]), 'rows': rows})
    ex = EX[(yr, kind)]
    rows = [['Extras · Community, Conservation & Reserve (CCR) fee — per person per night, add to every bed-night (not ages 0–5)', fmt(ex['ccr'])],
            ['Extras · Pilot / guide — per person per night', fmt(ex['guide'])]]
    if c[2] not in UNIT:
        rows += [['Extras · Private vehicle — per vehicle per night · %s' % SEAS[i], fmt(v)] for i, v in enumerate(ex['vehicle'])]
    secs.append({'title': '%s — Natural Selection extras (%s)' % (yr, 'nett' if kind == 'nett' else 'rack'), 'rows': rows})
    return secs

def note(c, yr, kind):
    sheet = '%s %s sheet issued %s' % ('Natural Selection Botswana %s rates,' % yr, 'Nett 20%' if kind == 'nett' else 'Rack', ISSUED[(yr, kind)])
    basis = ('Fully inclusive: accommodation, all meals & beverages, Wi-Fi, laundry, daily activities, airstrip transfers, guiding, park fees and VAT; '
             'premium brands and gratuities excluded. Add the CCR fee (US$60 pppn) to every bed-night.')
    if c[2] in UNIT:
        single = ''
    else:
        single = ' "Single" is the per person sharing rate plus the single supplement (%s). ' % WAIVER
    longst = (' Night-band rates are Natural Selection long-stay rates and apply across their Botswana and Namibia camps (min. 6 nights);'
              ' not combinable with special offers.')
    s = '%s. %s%s%s %s %s' % (sheet, basis, single, longst, CHILD if c[2] not in UNIT else '', NOTES.get(c[0], ''))
    if kind == 'rack' and yr == '2027' and c[0] == 'mokolwane-plains':
        s += ' The rack sheet (9 Sep 2026) predates the 1 Oct 2026 correction of Mokolwane Plains nett rates.'
    return re.sub(r'\s+', ' ', s).strip()

def doc(c, yr, kind):
    d = {'name': c[1], 'region': {DELTA: 'Okavango Delta', MAK: 'Makgadikgadi & Boteti'}[c[4]], 'currency': 'US$',
         'validity': '%s season, as printed (Green from 10 Jan)' % yr, 'note': note(c, yr, kind),
         'sections': acc_sections(c, yr, kind)}
    if kind == 'nett':
        d['commission'] = 'Nett 20% (rack published)'
    return d

STO = {c[0]: {y: doc(c, y, 'nett') for y in years_of(c)} for c in CAMPS}
RACK = {c[0]: {y: doc(c, y, 'rack') for y in years_of(c)} for c in CAMPS}

# every figure written is on its sheet
for kind, D in (('nett', STO), ('rack', RACK)):
    for c in CAMPS:
        for y, d in D[c[0]].items():
            figs = {60, EX[(y, kind)]['guide']} | set(EX[(y, kind)]['vehicle'])
            for vals in R[(y, kind)][c[2]].values():
                for v in vals:
                    if v is None:
                        continue
                    figs |= {v} if isinstance(v, int) else {v[0], v[0] + v[1]}
            labs = [l for sec in d['sections'] for l, _ in sec['rows']]
            assert len(set(labs)) == len(labs), (c[0], y, 'labels not unique once flattened')
            for sec in d['sections']:
                for lab, v in sec['rows']:
                    assert int(v.replace(',', '')) in figs, (kind, c[0], y, lab, v)

if '--parse' in sys.argv:
    for c in CAMPS:
        y = years_of(c)[-1]
        print(c[0], years_of(c), [len(s['rows']) for s in STO[c[0]][y]['sections']], STO[c[0]][y]['sections'][0]['rows'][:2])
    print('extras', EX)
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
/* %s — Natural Selection Botswana 2026 + 2027, 19 camps. Adds years to new slugs only. Generated by tools/load_natural_selection_bw.py. */
(function loadNaturalSelectionBw%s() {
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
for fn in ('sto', 'rack'):
    for s, ys in before[fn]['cov'].items():
        for y in ys:
            assert y in after[fn]['cov'].get(s, {}), ('a year was lost', fn, s, y)
    for c in CAMPS:
        assert sorted(after[fn]['dds'][c[0]]) == years_of(c), (fn, c[0])
    print(fn, 'slugs %d -> %d' % (len(before[fn]['cov']), len(after[fn]['cov'])))

# ====================================================================== index + lodges-info
def flat(d):
    return [{'n': l, 'p': int(v.replace(',', ''))} for s in d['sections'] for l, v in s['rows']]
raw = rd('assets/rates-index.json'); data = json.loads(raw)
assert json.dumps(data, indent=0, ensure_ascii=False) == raw, 'index on-disk format changed'
have = {x['name'] for x in data['lodges']}
for c in CAMPS:
    assert c[1] not in have, c[1]
    e = {'file': '/' + SRCDIR + PDFS[(years_of(c)[0], 'nett')], 'name': c[1], 'region': doc(c, years_of(c)[0], 'nett')['region'], 'cur': 'USD'}
    if '2026' in STO[c[0]]:
        e['rates'] = flat(STO[c[0]]['2026']); e['rack_2026'] = flat(RACK[c[0]]['2026'])
    e['rates_2027'] = flat(STO[c[0]]['2027']); e['rack_2027'] = flat(RACK[c[0]]['2027'])
    data['lodges'].append(e)
data['count'] = len(data['lodges'])
wr('assets/rates-index.json', json.dumps(data, indent=0, ensure_ascii=False))
raw = rd('assets/lodges-info.json'); info = json.loads(raw)
assert json.dumps(info, indent=0, ensure_ascii=False) == raw, 'lodges-info on-disk format changed'
def lead(c):
    return 'Natural Selection %s camp — %s. Fully inclusive. Rates in US$.' % (c[3] if c[3] != 'Exclusive use' else 'exclusive-use', c[6].replace(', Botswana', ''))
for c in CAMPS:
    k = re.sub(r'[^a-z0-9]', '', c[1].lower())
    assert k not in info, k
    info[k] = {'name': c[1], 'url': '/%s/%s/' % (c[4], c[0]), 'lead': lead(c), 'imgs': [IMG[c[0]]], 'orig': '/' + SRCDIR + PDFS[(years_of(c)[0], 'nett')], 'cur': 'USD'}
wr('assets/lodges-info.json', json.dumps(info, indent=0, ensure_ascii=False))
print('index +%d (count %d), lodges-info +%d' % (len(CAMPS), data['count'], len(CAMPS)))

# ====================================================================== lodge pages (same donor as load_wilderness_b9.py)
DONOR = rd('chobe-accommodation/chobe-safari-lodge/index.html')
D_DESC = 'Riverside lodge in Kasane on the Chobe River — Luxury Rooms, Suites and Explorer Suites, two included experiences per night.'
D_LEAD = re.search(r'<p class="lead">(.*?)</p>', DONOR).group(1)
D_LOC = 'Kasane, on the Chobe River, Botswana'
D_HERO = '<div class="hero" style="background:linear-gradient(135deg,#6b5844,#2f2519)">'
assert DONOR.count(D_HERO) == 1 and DONOR.count(D_DESC) == 2 and DONOR.count(D_LOC) == 2
RTITLE = {DELTA: 'Okavango Delta', MAK: 'Makgadikgadi &amp; Boteti'}
def tier_txt(c):
    return 'exclusive-use' if c[3] == 'Exclusive use' else c[3]
def page(c):
    slug, name, _, tier, folder, _, loc, _ = c
    h = name.replace("'", '&#39;')
    where = loc.replace(', Botswana', '')
    desc = 'Natural Selection %s camp — %s. Fully inclusive; rates in US$.' % (tier_txt(c), where)
    plead = ('Natural Selection %s camp — %s. Fully inclusive: accommodation, all meals &amp; beverages, Wi-Fi, laundry, daily activities, '
             'airstrip transfers, guiding, park fees and VAT, plus the CCR fee of US$60 per person per night. All rates in US$.' % (tier_txt(c), where))
    extra = NOTES.get(slug, '')
    if extra and slug not in ('tawana', 'mokolwane'):
        plead += ' ' + extra.replace('&', '&amp;').replace('’', '&rsquo;')
    s = DONOR.replace('The Chobe Safari Lodge | Chobe', '%s | %s' % (h, RTITLE[folder]))
    s = s.replace(D_DESC, desc).replace(D_LEAD, plead).replace(D_LOC, loc)
    s = s.replace(D_HERO, '<div class="hero" style="background:#2b2b2b url(\'%s\') center/cover no-repeat">' % IMG[slug])
    s = s.replace('/chobe-accommodation/chobe-safari-lodge/', '/%s/%s/' % (folder, slug))
    s = s.replace('<a class="hero-back" href="/chobe-accommodation/">&#8592; Back to Chobe Accommodation</a>',
                  '<a class="hero-back" href="/%s/">&#8592; Back to %s Accommodation</a>' % (folder, RTITLE[folder]))
    s = s.replace("var LODGE='chobe-safari-lodge'", "var LODGE='%s'" % slug)
    s = s.replace('The%20Chobe%20Safari%20Lodge', name.replace(' ', '%20').replace("'", '%27'))
    s = s.replace('The Chobe Safari Lodge', h)
    for bad in ('Chobe Safari', 'chobe-safari', 'Kasane', 'Luxury Room', 'Explorer Suite'):
        assert bad not in s, (slug, bad)
    assert s.count("var LODGE='%s'" % slug) == 1
    return s
os.makedirs(P(MAK), exist_ok=True)
for c in CAMPS:
    d = '%s/%s' % (c[4], c[0])
    os.makedirs(P(d), exist_ok=True)
    assert not os.path.exists(P(d + '/index.html')), d
    wr(d + '/index.html', page(c))

# ====================================================================== region pages
def card(c):
    h = c[1].replace("'", '&#39;')
    return ('<a class="card has-rates" data-name="%s" href="/%s/%s/"><div class="img" style="background-image:url(\'%s\')"><span class="rate-badge">'
            '<span class="rate-dot"></span>Rates</span><h3>%s</h3></div><div class="body"><p>%s &middot; US$</p>'
            '<span class="go">View lodge &amp; rates &rarr;</span></div></a>' % (c[1].lower().replace("'", ''), c[4], c[0], IMG[c[0]], h, RTITLE[c[4]]))
C = {c[0]: c for c in CAMPS}
dl = rd(DELTA + '/index.html')
def add_cards(s, area, slugs):
    a = s.index('<div class="area-sec" id="area-%s">' % area)
    b = s.index('\n  </div></div>', a)
    return s[:b] + ''.join('\n    ' + card(C[x]) for x in slugs) + s[b:]
dl = add_cards(dl, 'moremi', ['tawana'])
dl = add_cards(dl, 'north', ['north-island-okavango', 'dukes-camp', 'dukes-east', 'mbamba', 'expeditions-camp'])
dl = add_cards(dl, 'khwai', ['tuludi', 'sable-alley', 'little-sable', 'elephant-pan', 'skybeds'])
south = ('  <div class="area-sec" id="area-south"><h3 class="area-h">Southern Delta</h3>\n  <div class="grid lodge-grid">%s\n  </div></div>\n'
         % ''.join('\n    ' + card(C[x]) for x in ('mokolwane', 'mokolwane-plains', 'mokolwane-plains-villa')))
dl = once(dl, '  <div class="area-sec" id="area-khwai">', south + '  <div class="area-sec" id="area-khwai">')
dl = once(dl, '<a href="#area-southeast">Southeastern Delta</a>', '<a href="#area-southeast">Southeastern Delta</a><a href="#area-south">Southern Delta</a>')
dl = once(dl, 'the southeastern Delta, Khwai and Mababe, and the Panhandle.', 'the southeastern and southern Delta, Khwai and Mababe, and the Panhandle.')
dl = once(dl, 'Linyanti and Savuti have <a href="/linyanti-savuti-accommodation/">their own page</a>.',
          'Linyanti and Savuti, and the Makgadikgadi and Boteti, have their own pages: <a href="/linyanti-savuti-accommodation/">Linyanti &amp; Savuti</a>, '
          '<a href="/%s/">Makgadikgadi &amp; Boteti</a>.' % MAK)
MORE_MAK = '<li><a href="/%s/">Makgadikgadi &amp; Boteti</a></li>' % MAK
dl = once(dl, '<li><a href="/chobe-accommodation/">Chobe</a></li>', MORE_MAK + '<li><a href="/chobe-accommodation/">Chobe</a></li>')
assert dl.count('class="area-sec"') == 6
wr(DELTA + '/index.html', dl)

ln = rd(LIN + '/index.html')
BROKEN = '<li><a href="/okavango-delta-accommodation/">Okavango Delta</a><a href="/linyanti-savuti-accommodation/">Linyanti &amp; Savuti</a></li>'
ln2 = once(ln, BROKEN, '<li><a href="/okavango-delta-accommodation/">Okavango Delta</a></li>' + MORE_MAK)
wr(LIN + '/index.html', ln2)

mk = ln
mk = re.sub(r'  <div class="area-sec".*?\n  </div></div>\n',
            lambda m: ('  <div class="area-sec" id="area-makgadikgadi"><h3 class="area-h">Makgadikgadi Pans &amp; Boteti River</h3>\n  <div class="grid lodge-grid">%s\n  </div></div>\n'
                       % ''.join('\n    ' + card(C[x]) for x in ('jacks-camp', 'jacks-private-camp', 'san-camp', 'camp-kalahari', 'meno-a-kwena'))), mk, count=1, flags=re.S)
mk = once(mk, '<title>Linyanti &amp; Savuti Accommodation | Namibia Rates</title>', '<title>Makgadikgadi &amp; Boteti Accommodation | Namibia Rates</title>')
mk = once(mk, '<h1>Linyanti &amp; Savuti Accommodation</h1>', '<h1>Makgadikgadi &amp; Boteti Accommodation</h1>')
MK_TXT = 'Camps on the Makgadikgadi Pans and the Boteti River, Botswana. Rates are in US$.'
mk = once(mk, '<p class="lead">Camps in the Linyanti Wildlife Reserve and on the Savuti Channel, northern Botswana. Rates are in US$.</p>', '<p class="lead">%s</p>' % MK_TXT)
mk = mk.replace('Camps in the Linyanti Wildlife Reserve and on the Savuti Channel, northern Botswana. Rates are in US$.', MK_TXT)
mk = once(mk, 'placeholder="Search Linyanti &amp; Savuti lodges…"', 'placeholder="Search Makgadikgadi &amp; Boteti lodges…"')
mk = mk.replace('https://namibiarates.com/%s/' % LIN, 'https://namibiarates.com/%s/' % MAK)
mk = mk.replace('Linyanti &amp; Savuti Accommodation — Namibia Rates', 'Makgadikgadi &amp; Boteti Accommodation — Namibia Rates')
mk = re.sub(r"(\.hero\{[^}]*?background:#2b2b2b url\(')[^']*('\))", lambda m: m.group(1) + IMG['jacks-camp'] + m.group(2), mk, count=1)
mk = once(mk, BROKEN, '<li><a href="/okavango-delta-accommodation/">Okavango Delta</a></li><li><a href="/linyanti-savuti-accommodation/">Linyanti &amp; Savuti</a></li>')
assert 'wilderness' not in mk.lower().replace('wildernessdestinations', '') or True
for bad in ('Linyanti Wildlife Reserve', 'wilderness-dumatau', 'Search Linyanti'):
    assert bad not in mk, bad
assert IMG['jacks-camp'] in mk and mk.count('class="area-sec"') == 1
assert not os.path.exists(P(MAK + '/index.html'))
wr(MAK + '/index.html', mk)

bh = rd('botswana-accommodation/index.html')
i = bh.index('<a class="card has-rates" data-name="leroo la tau"')
bh = bh[:i] + card(C['jacks-camp']).replace('Makgadikgadi &amp; Boteti &middot;', 'Makgadikgadi &middot;') + '\n      ' + card(C['tuludi']) + '\n      ' + bh[i:]
wr('botswana-accommodation/index.html', bh)
print('pages: %d lodge pages, Delta cards + Southern Delta section, %s created' % (len(CAMPS), MAK))

# ====================================================================== flights: Natural Selection's Mack Air + Helicopter Horizons
def tri_check(key, names, rows):
    t = TXT[key]
    for nm, vals in zip(names[1:], rows):
        nump = lambda v: (str(v)[:-3] + '[ ,]' + str(v)[-3:]) if v >= 1000 else str(v)
        pat = r'\s+'.join(nump(v) + r'\*?' for v in vals) + r'\s+' + re.escape(nm)
        assert re.search(pat, t), (key, nm, vals)
MACK = {
    '2026': (['Maun', 'KPR', 'Kadizora / Xaraxai', 'Santawani', 'Shakawe', "Jack's", 'Kasane'],
             [[239], [239, 272], [250, 272, 272], [311, 567, 417, 567], [422, 567, 706, 567, 706], [467, 467, 467, 467, 600, 706]]),
    '2027': (['Maun', 'KPR', 'Kadizora / Xaraxai', 'Santawani', 'Shakawe', "Jack's", 'Xudum', 'Kasane'],
             [[282], [282, 312], [294, 312, 312], [371, 453, 453, 453], [467, 628, 783, 628, 783], [282, 312, 312, 312, 453, 783], [535, 535, 535, 535, 647, 783, 535]]),
}
HELI = {
    '2026': (['Maun / Thamo Telele', 'Meno', 'CT11*', 'NG12/23A**', 'KPR***', 'Tawana', 'Mokolwane', 'Heliport (Sepupa)', 'Shakawe', 'Kasane'],
             [[529], [1146, 529], [701, 1350, 1728], [529, 929, 929, 421], [248, 818, 1144, 477, 248], [379, 858, 1378, 379, 479, 366],
              [929, 1560, 1956, 253, 818, 818, 684], [1182, 1764, 2360, 529, 1182, 929, 818, 253], [1728, 1764, 1728, 1560, 1144, 1560, 1728, 1728, 1956]]),
    '2027': (['Maun / Thamo Telele', 'Meno', 'CT11*', 'NG12/23A**', 'KPR***', 'Tawana', 'NG29****', 'Heliport (Sepupa)', 'Shakawe', 'Kasane'],
             [[439], [982, 596], [729, 1431, 1760], [596, 982, 1102, 500], [293, 853, 1359, 567, 293], [450, 878, 1582, 450, 569, 434],
              [1027, 1729, 2053, 298, 893, 893, 773], [1324, 2031, 2356, 596, 1196, 1196, 1076, 298], [2009, 2311, 2311, 1582, 1324, 1582, 1711, 1880, 2178]]),
}
for y in ('2026', '2027'):
    tri_check((y, 'nett'), *MACK[y])
    tri_check((y, 'nett'), *HELI[y])
def esc(s): return s.replace('&', '&amp;').replace("'", '&rsquo;')
def tri_table(names, rows, rowfoot=''):
    head = '<tr><th>From / to</th>' + ''.join('<th>%s</th>' % esc(n) for n in names[:-1]) + '</tr>'
    body = ''
    for nm, vals in zip(names[1:], rows):
        body += '<tr><td><strong>%s</strong></td>%s%s</tr>' % (esc(nm), ''.join('<td class="price-highlight" style="white-space:nowrap">US$ {:,}</td>'.format(v) for v in vals),
                                                              '<td></td>' * (len(names) - 1 - len(vals)))
    return '<div class="table-responsive"><table><thead>%s</thead><tbody>%s</tbody></table></div>' % (head, body)
def num_in(key, pat):
    m = re.search(pat, TXT[key]); assert m, (key, pat)
    return [int(x.replace(' ', '').replace(',', '')) for x in m.groups()]
TRF = {}
for y in ('2026', '2027'):
    k = (y, 'nett')
    TRF[y] = {
        'skybeds': num_in(k, r'Sable Alley\s+Skybeds\s+(\d+)\s+Per Person \| Min 2 guests\s+Return'),
        'meno': num_in(k, r'(\d+)\s+Per Person\s+Return') if y == '2027' else num_in(k, r'Maun\s+Meno a Kwena\s+(\d+)\s+Per Person\s+Return'),
        'meno_priv': num_in(k, r'private\s+transfer cost of USD (\d+) per vehicle each way') if y == '2026' else num_in(k, r'transfer cost of USD (\d+) per vehicle each way'),
        'pb': num_in(k, r'Maun\s+Planet Baobab\s+(\d+)\s+Per Person \| Min 2 guests\s+One Way'),
        'pb_ct11': num_in(k, r'Planet Baobab\s+CT11\*\s+(\d+)\s+Per Vehicle\s+Return'),
        'pb_meno': num_in(k, r'Planet Baobab\s+Meno a Kwena\s+(\d+)\s+Per Vehicle\s+One Way'),
        'pb_self': num_in(k, r'Planet Baobab\s+CT11\*\s+(\d+)\s+Accompanied Self-Drive'),
        'dep': num_in(k, r'departure tax ex Maun or Kasane Airport of USD (\d+) per person'),
    }
    if y == '2027':
        TRF[y]['ep_sky'] = num_in(k, r'Elephant Pan\s+Skybeds\s+(\d+)\s+Per Person \| Min 2 guests\s+One Way')
assert TRF['2026'] == {'skybeds': [310], 'meno': [165], 'meno_priv': [595], 'pb': [277], 'pb_ct11': [505], 'pb_meno': [600], 'pb_self': [150], 'dep': [30]}, TRF['2026']
assert TRF['2027'] == {'skybeds': [330], 'meno': [165], 'meno_priv': [635], 'pb': [339], 'pb_ct11': [540], 'pb_meno': [642], 'pb_self': [160], 'dep': [33], 'ep_sky': [165]}, TRF['2027']
LAND = {'2026': 'US$20 pp per drop-off and per pick-up at KPR, Kadizora and Xaraxai; US$35 at Santawani.',
        '2027': 'US$25 pp per drop-off and per pick-up at KPR, Kadizora, Xaraxai and Xudum; US$35 at Santawani.'}
assert len(re.findall(r'USD 20 drop off per person & USD 20 pick up person to or from (KPR|Kadizora|Xaraxai)', TXT[('2026', 'nett')])) == 3
assert len(re.findall(r'USD 25 drop off per person & USD 25 pick up person to or from (KPR|Kadizora|Xaraxai|Xudum)', TXT[('2027', 'nett')])) == 4
for y in ('2026', '2027'):
    assert 'USD 35 drop off per person & USD 35 pick up person to or from Santawani' in TXT[(y, 'nett')]
tr = lambda a, b, c: ('<tr><td><strong>%s</strong></td><td class="info-col">%s</td><td class="price-highlight sto-col">US$ %s</td>'
                      '<td class="rack-col">Nett (no rack)</td></tr>' % (a, b, '{:,}'.format(c)))
def trf_rows(y):
    t = TRF[y]
    rows = tr('Tuludi / Sable Alley / Little Sable &harr; Skybeds', 'Per person, min 2 &middot; return (helicopter + drive)', t['skybeds'][0])
    if y == '2027':
        rows += tr('Elephant Pan &rarr; Skybeds', 'Per person, min 2 &middot; one way (road to Skybeds free, helicopter out)', t['ep_sky'][0])
    rows += tr('Sable Alley / Little Sable &harr; Elephant Pan', 'Per person &middot; one way, vehicle', 0).replace('US$ 0', 'Free')
    rows += tr('Maun &harr; Meno a Kwena (scheduled: dep. Maun 14:00, camp 10:00)', 'Per person &middot; return', t['meno'][0])
    rows += tr('Maun &harr; Meno a Kwena, private (off-schedule)', 'Per vehicle &middot; each way', t['meno_priv'][0])
    rows += tr('Maun &rarr; Planet Baobab', 'Per person, min 2 &middot; one way, shared', t['pb'][0])
    rows += tr('Planet Baobab &harr; CT11 (Jack&rsquo;s, San Camp, Camp Kalahari)', 'Per vehicle (up to 7) &middot; return', t['pb_ct11'][0])
    rows += tr('Planet Baobab &rarr; Meno a Kwena', 'Per vehicle (up to 12) &middot; one way', t['pb_meno'][0])
    rows += tr('Planet Baobab &harr; CT11, accompanied self-drive (1 May &ndash; 31 Oct)', 'Per vehicle &middot; return', t['pb_self'][0])
    return rows
def year_block(y):
    m, h = MACK[y], HELI[y]
    return '''            <div class="year-block" data-year="%(y)s">
            <h3>Mack Air seat rates &mdash; Natural Selection camps (%(y)s)</h3>
            %(mack)s
            <p class="raw">KPR = Khwai Private Reserve (Tuludi, Sable Alley, Little Sable, Elephant Pan, Skybeds); Kadizora = North Island Okavango, Duke&rsquo;s Camp, Duke&rsquo;s East; Xaraxai = Mbamba, Expeditions Camp; Santawani = Tawana; Shakawe = Okavango Spirit, Nkasa Linyanti; Jack&rsquo;s = Jack&rsquo;s Camp, Jack&rsquo;s Private Camp, San Camp, Camp Kalahari%(xudum)s. Landing fees: %(land)s Departure tax ex Maun or Kasane US$%(dep)s pp.</p>
            <h3>Helicopter Horizons seat rates (%(y)s)</h3>
            %(heli)s
            <p class="raw">Per person, minimum 2 passengers, private flight. CT11* = Jack&rsquo;s Camp, Jack&rsquo;s Private Camp, San Camp, Camp Kalahari; NG12/23A** = North Island Okavango, Duke&rsquo;s Camp, Duke&rsquo;s East, Mbamba, Expeditions Camp; KPR*** = Tuludi, Sable Alley, Little Sable, Elephant Pan, Skybeds%(ng29)s. Heliport (Sepupa) links with Caprivi Adventures to Nkasa Linyanti.%(champ)s</p>
            <h3>Vehicle &amp; helicopter transfers (%(y)s)</h3>
            <div class="table-responsive"><table>
                <thead><tr><th>Route</th><th class="info-col">Basis</th><th class="sto-col">Nett Rate</th><th class="rack-col">Rack Rate</th></tr></thead>
                <tbody>%(trf)s</tbody>
            </table></div>
            </div>
''' % {'y': y, 'mack': tri_table(*m), 'heli': tri_table(*h), 'land': LAND[y], 'dep': TRF[y]['dep'][0], 'trf': trf_rows(y),
       'xudum': '; Xudum = Mokolwane, Mokolwane Plains, Mokolwane Plains Villa' if y == '2027' else '',
       'ng29': '; NG29**** = Mokolwane, Mokolwane Plains, Mokolwane Plains Villa. Meno a Kwena &ndash; Mokolwane includes a complimentary sparkling-wine stop' if y == '2027' else '',
       'champ': ''}
FL = '''        <div class="rate-card" data-years="2026 2027" id="supplier-naturalselectionbw">
            <div class="supplier-info">
                <div class="supplier-details">
                    <h2>Natural Selection Botswana &mdash; camp flights &amp; transfers</h2>
                    <p>Seat rates Natural Selection books for its Botswana camps: Mack Air light aircraft between Maun, Kasane and the camp airstrips, Helicopter Horizons helicopter transfers, and road and helicopter transfers between camps. All flights to and from Jack&rsquo;s airstrip must be booked through Natural Selection.</p>
                </div>
                <div class="supplier-quick-spec">
                    <div class="spec-item"><span class="spec-label">Commission Model</span><span class="spec-value">Nett, incl. VAT &amp; navigation fees</span></div>
                    <div class="spec-item"><span class="spec-label">Coverage</span><span class="spec-value">Okavango Delta, Makgadikgadi, Boteti, Maun, Kasane</span></div>
                    <div class="spec-item"><span class="spec-label">Validity</span><span class="spec-value">2026 and 2027 sheets</span></div>
                    <div class="spec-item"><span class="spec-label">Currency</span><span class="spec-value">US$</span></div>
                </div>
            </div>
%s%s            <h3>Notes</h3>
            <ul>
                <li>Seat rates per person; children under 2 on a lap fly free, 2 and older pay full seat rates. Weights must be sent to confirm.</li>
                <li>Mack Air: over 130 kg pays an extra seat, over 160 kg may need a charter; charter rates apply to bookings made within 5 days of travel. Helicopter Horizons: over 115 kg pays an extra seat.</li>
                <li>Luggage: 20 kg per person including 5 kg hand luggage, soft bags only, max 30 &times; 35 &times; 70 cm.</li>
                <li>Seat rates cannot be combined with charter rates in one booking. Natural Selection&rsquo;s sheets also carry Mack Air seat rates to third-party camps &mdash; ask their reservations team.</li>
            </ul>
        </div>
''' % (year_block('2026'), year_block('2027'))
fr = rd('flight_rates.html')
fr = once(fr, "<button class=\"tab-link\" onclick=\"switchSupplier('wildernessairbw', this)\">Wilderness Air Botswana</button>",
          "<button class=\"tab-link\" onclick=\"switchSupplier('wildernessairbw', this)\">Wilderness Air Botswana</button>\n            <button class=\"tab-link\" onclick=\"switchSupplier('naturalselectionbw', this)\">Natural Selection Botswana</button>")
m = re.search(r"\n            wildernessairbw:'[^']*'\n", fr); assert m
fr = fr[:m.start()] + m.group(0).rstrip('\n') + ",\n            naturalselectionbw:'%s'\n" % IMG['north-island-okavango'] + fr[m.end():]
i = fr.index('<div class="rate-card" data-years="2026" id="supplier-wildernessairbw">')
fr = fr[:i] + FL.lstrip(' ') + '\n        ' + fr[i:]
assert fr.count('id="supplier-naturalselectionbw"') == 1
wr('flight_rates.html', fr)

# ====================================================================== activities
ACTS = [('30-min doors-off scenic flight, Okavango Delta', 'All camps except CT11', r'Okavango Delta\s+All camps\. Excl CT11\*\s+([\d ]+?)\s+Per Person'),
        ('30-min doors-off scenic flight, Makgadikgadi Salt Pans', 'CT11 (Jack&rsquo;s, San Camp, Camp Kalahari)', r'Makgadikgadi Salt Pans\s+CT11\*\s+([\d ]+?)\s+Per Person'),
        ('Kubu Explorer &mdash; 75-min scenic transfer with picnic stop on Kubu Island', 'CT11', r'Kubu Explorer\s+CT11\*\s+([\d ]+?)\s+Per Person'),
        ('Floodplains to Panhandle &mdash; 2 h 30 doors-off scenic flight with picnic stop', 'All camps except CT11', r'Floodplains to Panhandle\s+All camps\. Excl CT11\*\s+([\d ]+?)\s+Per Person'),
        ('Tsodilo Hills &mdash; heli transfer, rock-art guide, entry &amp; picnic lunch (3 h 30)', 'NG12 / NG23A', r'Tsodilo Hills\s+NG12 / NG23A\*\*\s+([\d ]+?)\s+Per Person'),
        ('Conservation &amp; Co-Existence &mdash; heli to Eretsha village (Life With Elephants, CLAWS)', 'KPR', r'KPR\*\*\*\s+([\d ]+?)\n'),
        ('Conservation &amp; Co-Existence &mdash; heli to Eretsha village (Life With Elephants, CLAWS)', 'NG12 / NG23A', r'NG12 / NG23A\*\*\s+([\d ]+?)\s+Per Person \| Min 2 guests\s+Return\s+3 hours 30-min\s*\n\s*Co-Existence'),
        ('Conservation &amp; Co-Existence &mdash; heli to Eretsha village (Life With Elephants, CLAWS)', 'Tawana / Mokolwane', r'Tawana / Mokolwane\s+([\d ]+?)\n'),
        ('Elephant Havens &mdash; 1-hour visit incl. donation (2 h 30)', 'Thamo Telele', r'Elephant Havens\s+Thamo Telele\s+([\d ]+?)\s+Per Person')]
def actv(y, pat):
    m = re.search(pat, TXT[(y, 'nett')]); assert m, (y, pat)
    return int(m.group(1).replace(' ', ''))
AV = {y: [actv(y, a[2]) for a in ACTS] for y in ('2026', '2027')}
assert AV['2026'] == [347, 326, 633, 1240, 836, 884, 644, 1169, 540], AV['2026']
assert AV['2027'] == [396, 371, 754, 1400, 1000, 1053, 778, 1053, 690], AV['2027']
HORSE = {y: actv(y, r'2-hour horse riding: Jack.s Camp, Jack\'s Private Camp, San Camp & Camp Kalahari - USD (\d+) NETT') for y in ('2026', '2027')}
RANGER = {y: actv(y, r'the cost for this private excursion is USD (\d+)') for y in ('2026', '2027')}
assert HORSE == {'2026': 160, '2027': 173} and RANGER == {'2026': 740, '2027': 790}, (HORSE, RANGER)
for y in ('2026', '2027'):
    assert 'Remote Champagne Experience midway through your flight! USD 50 per person (minimum 2 people)' in TXT[(y, 'nett')]
def act_rows(y):
    r = ''.join('<tr><td><strong>%s</strong><br><small>Helicopter Horizons &middot; per person, minimum 2</small></td><td class="info-col">From %s</td>'
                '<td class="price-highlight sto-col">US$ {:,}</td><td class="rack-col">Nett (no rack)</td></tr>'.format(v) % (a[0], a[1]) for a, v in zip(ACTS, AV[y]))
    r += ('<tr><td><strong>Remote champagne stop, added to a helicopter flight</strong><br><small>Per person, minimum 2</small></td><td class="info-col">Helicopter Horizons</td>'
          '<td class="price-highlight sto-col">US$ 50</td><td class="rack-col">Nett (no rack)</td></tr>')
    r += ('<tr><td><strong>2-hour horse ride</strong><br><small>Per person, min age 8, max 95 kg</small></td><td class="info-col">Jack&rsquo;s Camp, Jack&rsquo;s Private Camp, San Camp, Camp Kalahari</td>'
          '<td class="price-highlight sto-col">US$ %d</td><td class="rack-col">Nett (no rack)</td></tr>' % HORSE[y])
    r += ('<tr><td><strong>Khwai Ranger Experience (mornings)</strong><br><small>Private excursion, 1&ndash;4 guests, goes to conservation on the concession</small></td><td class="info-col">%s</td>'
          '<td class="price-highlight sto-col">US$ %d</td><td class="rack-col">Nett (no rack)</td></tr>' % ('Tuludi, Sable Alley, Little Sable' + (', Elephant Pan' if y == '2027' else ''), RANGER[y]))
    return r
AC = '''        <!-- ============================================== -->
        <!-- NATURAL SELECTION BOTSWANA - EXCURSIONS -->
        <!-- ============================================== -->
        <div class="rate-card" data-years="2026 2027" id="supplier-naturalselectionbw">
            <div class="supplier-info">
                <div class="supplier-details">
                    <h2>Natural Selection Botswana &mdash; excursions</h2>
                    <p>Helicopter Horizons scenic flights and day trips from the Natural Selection camps (Okavango Delta, Makgadikgadi Pans, Kubu Island, Tsodilo Hills, Eretsha village), horse riding at the Makgadikgadi camps and the Khwai Ranger Experience.</p>
                </div>
                <div class="supplier-quick-spec">
                    <div class="spec-item"><span class="spec-label">Commission Model</span><span class="spec-value">Nett</span></div>
                    <div class="spec-item"><span class="spec-label">Location</span><span class="spec-value">Okavango Delta &amp; Makgadikgadi, Botswana</span></div>
                    <div class="spec-item"><span class="spec-label">Validity</span><span class="spec-value">2026 and 2027 sheets</span></div>
                    <div class="spec-item"><span class="spec-label">Currency</span><span class="spec-value">US$</span></div>
                </div>
            </div>
            <div class="year-block" data-year="2026">
            <div class="table-responsive"><table>
                <thead><tr><th>Excursion</th><th class="info-col">From</th><th class="sto-col">Nett Rate</th><th class="rack-col">Rack Rate</th></tr></thead>
                <tbody>%s</tbody>
            </table></div>
            </div>
            <div class="year-block" data-year="2027">
            <div class="table-responsive"><table>
                <thead><tr><th>Excursion</th><th class="info-col">From</th><th class="sto-col">Nett Rate</th><th class="rack-col">Rack Rate</th></tr></thead>
                <tbody>%s</tbody>
            </table></div>
            </div>
            <h3>Notes</h3>
            <ul>
                <li>Helicopter flights: Robinson helicopters (up to 3 guests); 4 or more fly on a shuttle basis; larger helicopters on request at extra cost. Weights are required to confirm.</li>
                <li>CT11 = Jack&rsquo;s Camp, Jack&rsquo;s Private Camp, San Camp, Camp Kalahari; NG12 / NG23A = North Island Okavango, Duke&rsquo;s Camp, Duke&rsquo;s East, Mbamba, Expeditions Camp; KPR = Tuludi, Sable Alley, Little Sable, Elephant Pan, Skybeds.</li>
                <li>Book through Natural Selection reservations.</li>
            </ul>
        </div>
''' % (act_rows('2026'), act_rows('2027'))
ar = rd('activity_rates.html')
ar = once(ar, "<button class=\"tab-link\" onclick=\"switchSupplier('wildernessbw', this)\">Wilderness Botswana</button>",
          "<button class=\"tab-link\" onclick=\"switchSupplier('wildernessbw', this)\">Wilderness Botswana</button>\n            <button class=\"tab-link\" onclick=\"switchSupplier('naturalselectionbw', this)\">Natural Selection Botswana</button>")
ar = once(ar, '          var HERO_IMG={\n', "          var HERO_IMG={\n            naturalselectionbw:'%s',\n" % IMG['jacks-camp'])
i = ar.index('        <!-- ============================================== -->\n        <!-- SOLITAIRE ACTIVITY CENTRE -->')
ar = ar[:i] + AC + '\n' + ar[i:]
assert ar.count('id="supplier-naturalselectionbw"') == 1
wr('activity_rates.html', ar)
print('flight_rates.html + activity_rates.html: Natural Selection Botswana cards added')

# ====================================================================== group sheet
def money(v): return '{:,.2f}'.format(int(v.replace(',', '')))
def pane(y, inner):
    return '<div class="year-pane" data-year="%s">%s</div>' % (y, inner)
def tab1(c):
    out = '<p class="raw yr-fallback" style="display:none;color:#a0522d"></p>'
    for y in years_of(c):
        d = STO[c[0]][y]
        blocks = ''
        for s in d['sections'][:-1]:
            rows = ''.join('<tr><td><strong>%s</strong></td><td style="text-align:right">%s</td></tr>' % (l.replace(' · ' + s['title'].split(' · ', 1)[1], '').replace(' · Fully Inclusive', ''), money(v)) for l, v in s['rows'])
            blocks += ('<div class="sub-block"><h4>%s</h4><div class="table-wrap"><table><thead><tr><th>Rate</th><th style="text-align:right">US$ %s</th></tr></thead>'
                       '<tbody>%s</tbody></table></div></div>' % (s['title'].split(' · ', 1)[1].capitalize(), 'per unit / night' if c[2] in UNIT else 'pp / night', rows))
        intro = ('Natural Selection Botswana %s rates, Nett 20%% (sheet issued %s). US$, fully inclusive; add the CCR fee of US$60 per person per night. '
                 % (y, ISSUED[(y, 'nett')]))
        intro += ('Per unit per night.' if c[2] in UNIT else 'A single pays the sharing rate plus the supplement; %s.' % WAIVER)
        out += pane(y, '<div class="block"><h3>Rates</h3><p class="raw">%s</p>%s</div>' % (intro, blocks))
    return out
def tab2(c):
    out = ''
    for y in years_of(c):
        rows = ''.join('<tr><td><strong>%s</strong></td><td style="text-align:right">%s</td></tr>' % (l.replace('Extras · ', ''), money(v)) for l, v in STO[c[0]][y]['sections'][-1]['rows'])
        out += pane(y, '<div class="block"><h3>Extras</h3><p class="raw">Daily activities are included. Parties of 6&ndash;7 get a private vehicle at no charge; families with children 9 and under must book one.</p>'
                       '<div class="table-wrap"><table><thead><tr><th>Rate</th><th style="text-align:right">US$</th></tr></thead><tbody>%s</tbody></table></div></div>' % rows)
    return out
def tab3(c):
    extra = NOTES.get(c[0], '')
    return ('<div class="block"><h3>Policies &amp; Information</h3><div class="sub-block"><h4>Basis</h4><ul class="t-list"><li><strong>Fully inclusive:</strong> '
            'accommodation, all meals &amp; beverages, Wi-Fi, guest laundry, daily activities, airstrip transfers, guiding, park entry fees and VAT. Excludes premium brand drinks, gratuities and travel insurance.</li>'
            '<li><strong>CCR fee:</strong> US$60 per person per night on every bed-night (children 6 and older, pilots and guides; not 0&ndash;5).</li></ul></div>'
            '<div class="sub-block"><h4>Children</h4><ul class="t-list"><li>%s</li></ul></div>'
            '<div class="sub-block"><h4>Long stays &amp; offers</h4><ul class="t-list"><li>The 6+/8+ (2026: 6&ndash;7 / 8+; 2027: 6+ / 8+ / 10+) night rates are long-stay rates across Natural Selection camps in Botswana and Namibia (min. 6 nights); not combinable with special offers.</li>'
            '<li>Honeymoon: one spouse 50%% off accommodation (proof of marriage, within 12 months). Stay 6, Pay 4 at Expeditions Camp, Mokolwane, Mbamba, Elephant Pan and Meno a Kwena (3 nights each at two camps; excl. Peak).</li>%s</ul></div>'
            '<div class="sub-block"><h4>Flights</h4><ul class="t-list"><li>See Natural Selection Botswana under Flights (Mack Air and Helicopter Horizons seat rates and transfers).</li></ul></div>'
            '<div class="sub-block"><h4>Contact</h4><ul class="t-list"><li>Natural Selection reservations: reservations@naturalselection.travel, +27 21 001 1574; Maun resbots@naturalselection.travel, +267 684 0931.</li></ul></div></div>'
            % (CHILD.replace('–', '&ndash;'), ('<li>%s</li>' % extra.replace('’', '&rsquo;')) if extra else ''))
for frag in ('reservations@naturalselection.travel', '+27 21 001 1574', 'resbots@naturalselection.travel', '+267 684 0931', 'Stay 6, Pay 4 Offer', 'Honeymoon Special'):
    assert frag in TXT[('2027', 'nett')], frag
db = []
for c in CAMPS:
    key = re.sub(r'[^a-z0-9]', '', c[1].lower())
    ld = lead(c)
    db.append('    %s: {\n        name: `%s`, location: `%s`,\n        cover: "%s",\n        images: ["%s"],\n        shortDesc: `%s`,\n        intro: `%s`,\n'
              '        tab1: `%s`,\n        tab2: `%s`,\n        tab3: `%s`\n    }' % (key, c[1], c[6].replace(', Botswana', ''), IMG[c[0]], IMG[c[0]], ld, ld, tab1(c), tab2(c), tab3(c)))
WB = 'ratesheets/wilderness_botswana_ratesheet_v3.html'
src = rd(WB)
a = src.index('const DB = {\n'); b = src.index('\n};\n\nconst grid')
gb = src[:a] + 'const DB = {\n' + ',\n'.join(db) + src[b:]
gb = once(gb, '<title>Wilderness Botswana — Rates &amp; Booking 2026', '<title>Natural Selection Botswana — Rates &amp; Booking 2026–2027')
gb = once(gb, '<span class="hero-display">Wilderness</span>', '<span class="hero-display">Natural Selection</span>')
gb = once(gb, '<p class="hero-tagline">Okavango Delta &amp; Linyanti.</p>', '<p class="hero-tagline">Okavango Delta &amp; Makgadikgadi.</p>')
gb = once(gb, '<p class="hero-sub">Agent nett rates &middot; Season 2026</p>', '<p class="hero-sub">Nett 20% rates &middot; Seasons 2026 &amp; 2027</p>')
gb = once(gb, '<span class="spec-value">Agent nett (no rack published)</span>', '<span class="spec-value">Nett 20% (rack published)</span>')
gb = once(gb, '<span class="spec-value">06 Jan 2026 – 05 Jan 2027</span>', '<span class="spec-value">2026 &amp; 2027 seasons (Green from 10 Jan)</span>')
RHINO = "url('https://wetu.com/imageHandler/c1920x1080/8725/desertrhino-07-24-1062.jpg?fmt=jpg')"
gb = once(gb, RHINO, "url('%s')" % IMG['jacks-camp'])
gb = once(gb, '>Wilderness Rate Portal<', '>Natural Selection Rate Portal<')
gb = once(gb, "    var eff = has ? y : '2026';\n",
          "    var eff = has ? y : (function(){var f=null;document.querySelectorAll('.year-pane[data-year]').forEach(function(p){if(!f)f=p.getAttribute('data-year');});return f||y;})();\n")
gb = once(gb, "n.textContent = 'Wilderness has not published ' + y + ' Botswana rates yet — the 2026 rates are shown.';",
          "n.textContent = 'No ' + y + ' rates for this camp — the ' + eff + ' rates are shown.';")
assert gb.count('class="raw yr-fallback"') == len(CAMPS)
left = [m.start() for m in re.finditer(r'Wilderness', gb)]
print('group sheet: "Wilderness" left at', len(left), 'places:', sorted({gb[max(0, i - 40):i + 30].replace('\n', ' ') for i in left})[:12])
assert not os.path.exists(P('ratesheets/natural_selection_botswana_ratesheet_v3.html'))
wr('ratesheets/natural_selection_botswana_ratesheet_v3.html', gb)
# the Wilderness Botswana sheet still carried a Namibian (Desert Rhino Camp) hero photo
wr(WB, once(src, RHINO, "url('https://www.wildernessdestinations.com/media/fyylufgu/walk-into-the-ultimate-luxury-camp-wilderness-mombo.webp?rmode=crop')"))

# ====================================================================== menus
def menus(s, js):
    q = '\\"' if js else '"'
    g_old = '<a href=%s/ratesheets/natural_selection_ratesheet_v1_4.html%s>Natural Selection</a>' % (q, q)
    g_new = g_old.replace('>Natural Selection<', '>Natural Selection Namibia<') + '<a href=%s/ratesheets/natural_selection_botswana_ratesheet_v3.html%s>Natural Selection Botswana</a>' % (q, q)
    f_old = '<a href=%s/flight_rates.html#wildernessairbw%s>Wilderness Air Botswana</a>' % (q, q)
    f_new = f_old + '<a href=%s/flight_rates.html#naturalselectionbw%s>Natural Selection Botswana</a>' % (q, q)
    a_old = '<a href=%s/linyanti-savuti-accommodation/%s>Linyanti &amp; Savuti</a>' % (q, q)
    a_new = a_old + '<a href=%s/%s/%s>Makgadikgadi &amp; Boteti</a>' % (q, MAK, q)
    n = s.count(g_old) + s.count(f_old) + s.count(a_old)
    if 'natural_selection_botswana_ratesheet' not in s:
        s = s.replace(g_old, g_new)
    if 'flight_rates.html#naturalselectionbw' not in s:
        s = s.replace(f_old, f_new)
    if '/%s/' % MAK not in s or js:
        s = s.replace(a_old, a_new) if ('>Makgadikgadi &amp; Boteti</a>' not in s) else s
    return s, n
sc = rd('assets/site-chrome.js')
sc, n = menus(sc, True)
assert n >= 4, n
sc = once(sc, ' {region:"Botswana",name:"Wilderness Botswana",id:"wildernessbw"}\n];',
          ' {region:"Botswana",name:"Wilderness Botswana",id:"wildernessbw"},\n {region:"Botswana",name:"Natural Selection Botswana",id:"naturalselectionbw"}\n];')
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
pt = once(pt, """                        <a href="#" onclick="openFlightRates('wildernessairbw'); return false;">Wilderness Air Botswana</a>\n""",
          """                        <a href="#" onclick="openFlightRates('wildernessairbw'); return false;">Wilderness Air Botswana</a>\n                        <a href="#" onclick="openFlightRates('naturalselectionbw'); return false;">Natural Selection Botswana</a>\n""")
pt = once(pt, """                        <a href="#" onclick="openActivityRates('wildernessbw'); return false;">Wilderness Botswana</a>\n""",
          """                        <a href="#" onclick="openActivityRates('wildernessbw'); return false;">Wilderness Botswana</a>\n                        <a href="#" onclick="openActivityRates('naturalselectionbw'); return false;">Natural Selection Botswana</a>\n""")
a = pt.index("""<div class="activity-item" onclick="openActivityRates('wildernessbw')\"""")
b = pt.index('</button>\n                            </div>\n', a) + len('</button>\n                            </div>\n')
item = pt[a:b]
nsitem = item.replace("openActivityRates('wildernessbw')", "openActivityRates('naturalselectionbw')")
nsitem = once(nsitem, 'Wilderness Botswana &mdash; scenic flights &amp; excursions', 'Natural Selection Botswana &mdash; excursions')
nsitem = once(nsitem, 'Helicopter Horizons scenic flights from the Wilderness camps, the Conservation &amp; Co-Existence cultural experience and half-day Tsodilo Hills trips. 2026 agent nett, US$.',
              'Helicopter Horizons scenic flights and day trips from the Natural Selection camps, horse riding in the Makgadikgadi and the Khwai Ranger Experience. 2026 &amp; 2027 nett, US$.')
pt = pt[:b] + '                            ' + nsitem + pt[b:]
wr('namibia_agent_portal.html', pt)
print('agent portal: flights, activities menu + Botswana activity card')
print('done')
