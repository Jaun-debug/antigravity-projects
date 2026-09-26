#!/usr/bin/env python3
"""Load Wilderness Namibia 2026 + 2027 (and Koiimasis 2026) into namibiarates' rate APIs and the index.

    cd dt_library && python3 tools/load_wilderness_n9.py

Sources
  ratesheets/originals/wilderness_namibia_n9_2026.pdf  Wilderness "Namibia Agent Nett Rates", valid 06-Jan-2026 to 05-Jan-2027
  ratesheets/originals/wilderness_namibia_n9_2027.pdf  the same, valid 06-Jan-2027 to 05-Jan-2028
  ratesheets/logufa_ratesheet_v3.html                  namibiarates' Logufa sheet: Koiimasis, valid 1 Nov 2025 – 31 Oct 2026

What it does (the namibia-rates checklist)
  * NET (api/sto.js), appended as one idempotent block:
      - 2026 for all seven Wilderness camps, new from the 2026 sheet.
      - 2027 for Wilderness Hoanib Skeleton Coast Camp, new from the 2027 sheet (it had nothing).
      - 2027 for the other six camps is KEPT exactly as loaded (checked: every figure matches the 2027 sheet);
        a Wilderness extras section is added beside it. Their docs move from LEGACY_STO_BY_YEAR into
        DDS_STO_BY_YEAR, because a DDS entry hides every map below it.
      - Koiimasis (slug 'koiimasis') 2026, from namibiarates' own Logufa sheet — it had no API rates at all.
  * RACK (api/rack.js), same pattern. Wilderness publishes nett only, so accommodation rack = nett ÷ 0.80
    (the house rule: "add 20%" means divide). This REPLACES the six camps' 2027 rack, which was nett × 1.20.
    Lunches and camp activities are "nett and non-commissionable" on the sheet: rack = nett. Guide rooms,
    private activities and ballooning state no basis: rack "to confirm". Koiimasis gets no rack (none published).
  * INDEX (assets/rates-index.json): the eight entries get rates / rates_2027 / rack_2026 / rack_2027 from the
    same docs; the stale duplicate "Wilderness Hoanib Skeleton Coast" entry (its file does not exist) is removed
    and its 2027 carried by the real entry. No other lodge is touched.
  * Checks: every figure is read off its source; before/after coverage of both APIs — no slug may lose a year.
"""
import datetime, io, json, os, re, shutil, subprocess

ROOT = os.getcwd()
P = lambda f: os.path.join(ROOT, f)
MARK = 'WILDERNESS-N9-2026-2027-LOAD'
PDFS = {'2026': 'ratesheets/originals/wilderness_namibia_n9_2026.pdf',
        '2027': 'ratesheets/originals/wilderness_namibia_n9_2027.pdf'}
CAMPS = [  # sheet name, slug, index name, region, category
    ('Wilderness Doro Nawas',            'wilderness-doro-nawas',                 'Wilderness Doro Nawas',                 'Damaraland',     'Adventures'),
    ('Wilderness Kulala Desert Lodge',   'wilderness-kulala-desert-lodge',        'Wilderness Kulala Desert Lodge',        'Sossusvlei',     'Adventures'),
    ('Wilderness Damaraland',            'wilderness-damaraland-camp',            'Wilderness Damaraland Camp',            'Damaraland',     'Classic'),
    ('Wilderness Desert Rhino',          'wilderness-desert-rhino-camp',          'Wilderness Desert Rhino Camp',          'Damaraland',     'Classic'),
    ('Wilderness Serra Cafema',          'wilderness-serra-cafema',               'Wilderness Serra Cafema',               'Kaokoland',      'Classic'),
    ('Wilderness Hoanib Skeleton Coast', 'wilderness-hoanib-skeleton-coast-camp', 'Wilderness Hoanib Skeleton Coast Camp', 'Skeleton Coast', 'Classic'),
    ('Wilderness Little Kulala',         'wilderness-little-kulala',              'Wilderness Little Kulala',              'Sossusvlei',     'Classic'),
]
BALLOON = ('Wilderness Kulala Desert Lodge', 'Wilderness Little Kulala')
FIG = r'R\s?((?:\d{1,3}(?:[ ,]\d{3})+|\d+)(?:\.\d\d)?)(?![\d])'


# ------------------------------------------------------------------ read the Wilderness sheets
def num(s):
    return float(s.replace(' ', '').replace(',', ''))


def seasons(lines, i):
    for k in range(i, i + 6):
        a = re.findall(r'(\d{1,2}-[A-Z][a-z]{2}-\d\d) to', lines[k])
        if a:
            b = re.findall(r'(\d{1,2}-[A-Z][a-z]{2}-\d\d)', lines[k + 1])
            assert len(a) == len(b)
            f = lambda s: datetime.datetime.strptime(s, '%d-%b-%y').strftime('%d %b')
            return ['%s – %s' % (f(x), f(y)) for x, y in zip(a, b)], k + 2
    raise ValueError('no season header')


def accommodation(lines, title, basis):
    i = next(n for n, l in enumerate(lines) if l.strip().startswith(title))
    seas, k = seasons(lines, i)
    out = {}
    while not lines[k].strip().startswith('Notes'):
        for camp, *_ in CAMPS:
            if re.search(re.escape(camp) + r'\s+' + basis + r'\s+Per person, sharing', lines[k]):
                pps = [num(x) for x in re.findall(FIG, lines[k])]
                sup = [num(x) for x in re.findall(FIG, lines[k + 1])]
                assert 'Single supplement' in lines[k + 1] and len(pps) == len(sup) == len(seas), camp
                out[camp] = list(zip(seas, pps, sup))
        k += 1
    return out


def one(t, pat):
    m = re.findall(pat, t)
    assert len(m) == 1, (pat, m)
    return num(m[0])


def read(y):
    t = subprocess.check_output(['pdftotext', '-layout', P(PDFS[y]), '-']).decode('utf-8')
    lines = t.split('\n')
    d = {'valid': re.search(r'VALIDITY: (\S+) to (\S+)', t).groups(),
         'fi': accommodation(lines, 'ACCOMMODATION ON FI BASIS', 'FI'),
         'dbb': accommodation(lines, 'ACCOMMODATION ON DBB BASIS', 'DBB'),
         'lunch': one(t, r'Lunch at camp\s+' + FIG), 'packed': one(t, r'Packed lunch\s+' + FIG),
         'private': one(t, r'Private activities at Classic camps\s+' + FIG),
         'guide': one(t, r'Pilot / guide accommodation is ' + FIG),
         'pm': one(t, r'Scheduled afternoon drive\s+per person\s+' + FIG),
         'am': one(t, r'Scheduled morning drive\s+per person\s+' + FIG)}
    i = next(n for n, l in enumerate(lines) if 'SOSSUSVLEI BALLOONING EXCURSION' in l)
    seas, k = seasons(lines, i)
    row = next(l for l in lines[k:k + 6] if 'Ballooning Safari' in l)
    d['balloon'] = list(zip(seas, [num(x) for x in re.findall(FIG, row)]))
    assert len(d['balloon']) == len(seas) and len(d['fi']) == 7 and len(d['dbb']) == 3
    return d


W = {y: read(y) for y in PDFS}


def fmt(n):
    return '{:,.2f}'.format(n).replace('.00', '') if n % 1 == 0 else '{:,.2f}'.format(n)


def rack_of(n):
    return round(n / 0.8, 2)


# ------------------------------------------------------------------ build the docs
def accommodation_rows(y, camp, rack):
    rows = []
    for basis, word in (('fi', 'Fully Inclusive'), ('dbb', 'DBB')):
        for s, pps, sup in W[y][basis].get(camp, []):
            a, b = (rack_of(pps), rack_of(pps + sup)) if rack else (pps, pps + sup)
            rows.append(['%s · %s — per person sharing' % (s, word), fmt(a)])
            rows.append(['%s · %s — single' % (s, word), fmt(b)])
    return rows


def extras_rows(y, camp, cat, rack):
    d = W[y]
    tc = 'to confirm'
    rows = [['Extras · Pilot / guide accommodation — per pilot or guide per night', tc if rack else fmt(d['guide'])]]
    if cat == 'Classic':
        rows.append(['Extras · Private activities (Classic camps) — per party per night, max 6 guests', tc if rack else fmt(d['private'])])
    if camp in d['dbb']:
        rows.append(['Extras · Lunch at camp (DBB bookings, nett, non-commissionable) — per person', fmt(d['lunch'])])
        rows.append(['Extras · Packed lunch (DBB bookings, nett, non-commissionable) — per person', fmt(d['packed'])])
    if camp == 'Wilderness Damaraland':
        rows.append(['Extras · Scheduled afternoon drive (nett, non-commissionable) — per person', fmt(d['pm'])])
        rows.append(['Extras · Scheduled morning drive (nett, non-commissionable) — per person', fmt(d['am'])])
    if camp in BALLOON:
        for s, v in d['balloon']:
            rows.append(['Extras · Sossusvlei ballooning %s — per person, min 2 guests' % s, tc if rack else fmt(v)])
    return rows


def extras_section(y, camp, cat, rack):
    return {'title': '%s — Wilderness extras (%s)' % (y, 'rack' if rack else 'nett'), 'rows': extras_rows(y, camp, cat, rack)}


def src(y):
    return 'Wilderness Namibia Agent Nett Rates (N9), valid %s to %s' % W[y]['valid']


def sto_doc(y, camp, name, region, cat):
    return {'name': name, 'region': region, 'currency': 'N$', 'validity': '%s season' % y,
            'commission': 'Agent nett (no commission stated)',
            'note': ('%s. Rand at 1:1 with N$ (the sheet\'s own note). Seasons are in each label; "single" is the per '
                     'person sharing rate plus the single supplement. %s camp.' % (src(y), cat)),
            'sections': [{'title': '%s — net STO' % y, 'rows': accommodation_rows(y, camp, False)},
                         extras_section(y, camp, cat, False)]}


def rack_doc(y, camp, name, region, cat):
    return {'name': name, 'region': region, 'currency': 'N$', 'validity': '%s season' % y,
            'note': ('Public rack derived from %s: Wilderness publishes nett only, so accommodation rack = nett ÷ 0.80 '
                     '(house rule). Lunches and camp activities are nett and non-commissionable (rack = nett); guide '
                     'rooms, private activities and ballooning state no basis and are to confirm.' % src(y)),
            'sections': [{'title': '%s — rack' % y, 'rows': accommodation_rows(y, camp, True)},
                         extras_section(y, camp, cat, True)]}


# ---- current state of the APIs (node), to know what already exists and to check before/after
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
  out[f]={cov:cov,leg:{},dds:{}};
  for(const s of process.argv.slice(2)){if(M[names[0]][s])out[f].dds[s]=M[names[0]][s];const L=f==='sto'?M.LEGACY_STO_BY_YEAR:M.LEGACY_RACK_BY_YEAR;if(L[s])out[f].leg[s]=L[s];}
}
process.stdout.write(JSON.stringify(out));
'''
SLUGS = [c[1] for c in CAMPS] + ['koiimasis']


def state():
    return json.loads(subprocess.check_output(['node', '-e', NODE, ROOT] + SLUGS))


before = state()
assert not any(MARK in io.open(P('api/%s.js' % f), encoding='utf-8').read() for f in ('sto', 'rack')), 'already loaded'

# ---- the existing six camps' 2027 nett must equal the 2027 sheet before it is kept
for camp, slug, name, region, cat in CAMPS:
    leg = before['sto']['leg'].get(slug, {}).get('2027')
    if not leg:
        continue
    have = sorted(float(v.replace(',', '')) for s in leg['sections'] for _, v in s['rows'])
    want = sorted(float(v.replace(',', '')) for _, v in accommodation_rows('2027', camp, False))
    assert have == want, ('2027 on namibiarates differs from the 2027 sheet', slug)
    assert not before['sto']['dds'].get(slug), ('unexpected DDS entry', slug)

STO_NEW, STO_X, RACK_NEW = {}, {}, {}
for camp, slug, name, region, cat in CAMPS:
    STO_NEW[slug] = {'2026': sto_doc('2026', camp, name, region, cat)}
    if before['sto']['leg'].get(slug, {}).get('2027'):
        STO_X[slug] = extras_section('2027', camp, cat, False)        # added beside the kept 2027 doc
    else:
        STO_NEW[slug]['2027'] = sto_doc('2027', camp, name, region, cat)
    RACK_NEW[slug] = {y: rack_doc(y, camp, name, region, cat) for y in ('2026', '2027')}

# ---- Koiimasis 2026 from namibiarates' own Logufa sheet
g = io.open(P('ratesheets/logufa_ratesheet_v3.html'), encoding='utf-8').read()
blk = g[g.index('    koiimasis: {'):g.index('    kalahari: {')]
def rows_of(tab):
    frag = re.search(r'\b%s: `(.*?)`' % tab, blk, re.S).group(1)
    return [[re.sub(r'<[^>]+>', '', a).strip(), b] for a, b in re.findall(r'<tr><td>(.*?)</td><td>([\d,]+\.\d\d|Free)</td></tr>', frag)]
k1, k2 = rows_of('tab1'), rows_of('tab2')
assert len(k1) == 5 and len(k2) == 2, (k1, k2)
assert 'Valid Season:</strong> 1 November 2025 – 31 October 2026' in blk
STO_NEW['koiimasis'] = {'2026': {
    'name': 'Koiimasis Farmlodge', 'region': 'Fish River Canyon', 'currency': 'N$', 'validity': '2026',
    'commission': 'STO', 'note': "Net STO rates from namibiarates' Logufa sheet (valid 1 November 2025 – 31 October 2026); "
                                 "DBB incl. 15% VAT and 1% tourism levy. Booked through Logufa (reservations@logufa.com).",
    'sections': [{'title': 'Lodge Rates 2026', 'rows': [[a, b.replace('.00', '')] for a, b in k1]},
                 {'title': 'Extras & Activities', 'rows': [[a, b.replace('.00', '')] for a, b in k2]}]}}

# ---- every figure written must be on its source
pdf_figs = {y: set() for y in W}
for y in W:
    d = W[y]
    for b in ('fi', 'dbb'):
        for camp, rows in d[b].items():
            for s, p, sup in rows:
                pdf_figs[y] |= {p, sup, p + sup}
    pdf_figs[y] |= {d['lunch'], d['packed'], d['private'], d['guide'], d['pm'], d['am']} | {v for _, v in d['balloon']}
def figures(doc):
    return [float(v.replace(',', '')) for s in doc['sections'] for _, v in s['rows'] if re.fullmatch(r'[\d,]+(\.\d+)?', v)]
for slug, ys in STO_NEW.items():
    for y, doc in ys.items():
        ok = pdf_figs[y] if slug != 'koiimasis' else {float(b.replace(',', '')) for _, b in k1 + k2 if b != 'Free'}
        assert all(f in ok for f in figures(doc)), (slug, y)
for slug, doc in STO_X.items():
    assert all(f in pdf_figs['2027'] for f in figures({'sections': [doc]}))

# ------------------------------------------------------------------ write the two blocks (atomic)
def block(kind, new, extra):
    dds, leg = ('DDS_STO_BY_YEAR', 'LEGACY_STO_BY_YEAR') if kind == 'sto' else ('DDS_RACK_BY_YEAR', 'LEGACY_RACK_BY_YEAR')
    return '''
/* %s — Wilderness Namibia (N9) 2026 + 2027 and Koiimasis 2026. Generated by tools/load_wilderness_n9.py. */
(function loadWildernessN9%s() {
  var V = %s;
  var X = %s;
  if (typeof %s === 'undefined') return;
  Object.keys(V).forEach(function (slug) {
    var e = %s[slug] || (%s[slug] = {});
    var legacy = (typeof %s !== 'undefined') ? %s[slug] : null;
    if (legacy) {
      Object.keys(legacy).forEach(function (y) { if (!e[y]) e[y] = legacy[y]; });
      delete %s[slug];
    }
    Object.keys(V[slug]).forEach(function (y) { %s });
    if (X[slug] && e['2027']) {
      e['2027'] = Object.assign({}, e['2027'], { sections: (e['2027'].sections || []).concat([X[slug]]) });
    }
  });
})();
''' % (MARK, kind.capitalize(), json.dumps(new, ensure_ascii=False, indent=1), json.dumps(extra, ensure_ascii=False, indent=1),
       dds, dds, dds, leg, leg, leg,
       "if (!e[y]) e[y] = V[slug][y];" if kind == 'sto' else "e[y] = V[slug][y];   /* rack: replaces the net x 1.20 derivation */")


for kind, new, extra in (('sto', STO_NEW, STO_X), ('rack', RACK_NEW, {})):
    f = P('api/%s.js' % kind)
    s = io.open(f, encoding='utf-8').read()
    io.open(f + '.tmp.js', 'w', encoding='utf-8').write(s + block(kind, new, extra))
    subprocess.check_call(['node', '--check', f + '.tmp.js'])
    os.replace(f + '.tmp.js', f)

after = state()
for f in ('sto', 'rack'):
    for s, ys in before[f]['cov'].items():
        for y in ys:
            assert y in after[f]['cov'].get(s, {}), ('a year was lost', f, s, y)
    for s in SLUGS:
        print(f, s, sorted(after[f]['cov'].get(s, {})), '(was %s)' % sorted(before[f]['cov'].get(s, {})))
assert all(not after[f]['leg'].get(c[1]) for f in ('sto', 'rack') for c in CAMPS)

# ------------------------------------------------------------------ index: the eight entries only
NODE_DUMP = NODE.replace("process.stdout.write(JSON.stringify(out));", "process.stdout.write(JSON.stringify({sto:out.sto.dds,rack:out.rack.dds}));")
D = json.loads(subprocess.check_output(['node', '-e', NODE_DUMP, ROOT] + SLUGS))
def flat(doc):
    out = []
    for s in (doc or {}).get('sections', []):
        for lab, v in s['rows']:
            if re.fullmatch(r'[\d,]+(\.\d+)?', v):
                out.append({'n': lab, 'p': float(v.replace(',', '')) if '.' in v else int(v.replace(',', ''))})
    return out
ix = P('assets/rates-index.json')
shutil.copy(ix, ix + '.bak_' + datetime.datetime.now().strftime('%Y%m%d%H%M%S'))
data = json.load(io.open(ix, encoding='utf-8'))
L = data if isinstance(data, list) else data['lodges']
names = {c[2]: c[1] for c in CAMPS}
names['Koiimasis Farmlodge'] = 'koiimasis'
n_before = len(L)
L[:] = [x for x in L if not (x['name'] == 'Wilderness Hoanib Skeleton Coast' and not os.path.exists(P(x['file'].lstrip('/'))))]
removed = n_before - len(L)
touched = 0
for x in L:
    slug = names.get(x['name'])
    if not slug:
        continue
    st, rk = D['sto'].get(slug, {}), D['rack'].get(slug, {})
    new = {'rates': flat(st.get('2026')), 'rates_2027': flat(st.get('2027')),
           'rack_2026': flat(rk.get('2026')), 'rack_2027': flat(rk.get('2027'))}
    for k, v in new.items():
        if v:
            x[k] = v
        assert x.get(k) or k.startswith('rack') or slug == 'koiimasis' and k == 'rates_2027', (x['name'], k)
    touched += 1
assert touched == 8, touched
if isinstance(data, dict) and 'count' in data:
    data['count'] = len(L)
io.open(ix + '.tmp', 'w', encoding='utf-8').write(json.dumps(data, indent=0, ensure_ascii=False))
json.load(io.open(ix + '.tmp', encoding='utf-8'))
os.replace(ix + '.tmp', ix)
print('index: 8 entries refreshed, %d stale duplicate removed' % removed)
