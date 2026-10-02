#!/usr/bin/env python3
"""Load Wilderness Botswana 2026 (B9) and split the Okavango Delta region into area sections.

    cd dt_library && python3 tools/load_wilderness_b9.py

Source
  ratesheets/originals/wilderness_botswana_b9_2026.pdf  Wilderness "Botswana Agent Nett Rates" (B9),
  valid 06-Jan-2026 to 05-Jan-2027, printed 25-Jun-26. US$, FI (fully inclusive), nett only.

What it does
  * NET (api/sto.js) and RACK (api/rack.js): one idempotent block each, year 2026 only, 14 new slugs
    (Linyanti Tented Camp East and West carry identical rates and Wilderness confirms only "Linyanti
    Tented Camp", so they are one slug). Rack = nett / 0.80 (house rule); guide rooms and private
    activities state no basis and are "to confirm" on rack. Never touches another slug or year.
  * INDEX (assets/rates-index.json) and assets/lodges-info.json: one new entry per slug.
  * PAGES: a lodge page per slug (cloned from chobe-accommodation/chobe-safari-lodge, which has no
    photos), the Okavango Delta region page rebuilt in area sections, a new Linyanti & Savuti region
    page, and the Accommodation menus in assets/site-chrome.js.
  * Checks: every nett figure is on the PDF; before/after coverage of both APIs (no slug loses a year);
    cloned pages carry no trace of the donor.
Area placement was checked per lodge against the operators' own sites (see the commit message).
"""
import io, json, os, re, subprocess, datetime

ROOT = os.getcwd()
P = lambda f: os.path.join(ROOT, f)
MARK = 'WILDERNESS-B9-2026-LOAD'
PDF = 'ratesheets/originals/wilderness_botswana_b9_2026.pdf'
DELTA, LIN = 'okavango-delta-accommodation', 'linyanti-savuti-accommodation'

# sheet order of the 'Per person, sharing' rows: (fragment on the rate line, fragment on the next line)
SHEET = [('Wilderness Linyanti', 'Tented Camp (East)'), ('Wilderness Linyanti', 'Tented Camp (West)'),
         ('Wilderness Savuti', None), ('Wilderness Mokete', None), ('Wilderness Chitabe', None),
         ('Wilderness Chitabe', 'Lediba'), ('Wilderness Little', 'Vumbura'), ('Wilderness Qorokwe', None),
         ('Wilderness DumaTau', None), ("Wilderness King's Pool", None), ('Wilderness Little', 'DumaTau'),
         ('Wilderness Little Mombo', None), ('Wilderness Mombo', None),
         ('Wilderness Vumbura', 'Plains North'), ('Wilderness Vumbura', 'Plains South')]
# slug, display name, sheet rows (indexes into SHEET), tier, region folder, region label, area, location line
CAMPS = [
    ('wilderness-linyanti-tented-camp', 'Wilderness Linyanti Tented Camp', (0, 1), 'Classic', LIN, 'Linyanti & Savuti', None,
     'Linyanti Wildlife Reserve, Botswana'),
    ('wilderness-savuti', 'Wilderness Savuti', (2,), 'Classic', LIN, 'Linyanti & Savuti', None,
     'On the Savuti Channel, Linyanti Wildlife Reserve, Botswana'),
    ('wilderness-mokete', 'Wilderness Mokete', (3,), 'Classic', DELTA, 'Okavango Delta', 'khwai',
     'Mababe Depression, east of Moremi, Botswana'),
    ('wilderness-chitabe', 'Wilderness Chitabe', (4,), 'Classic', DELTA, 'Okavango Delta', 'southeast',
     'Chitabe concession (NG31), southeastern Okavango Delta, Botswana'),
    ('wilderness-chitabe-lediba', 'Wilderness Chitabe Lediba', (5,), 'Classic', DELTA, 'Okavango Delta', 'southeast',
     'Chitabe concession (NG31), southeastern Okavango Delta, Botswana'),
    ('wilderness-little-vumbura', 'Wilderness Little Vumbura', (6,), 'Classic', DELTA, 'Okavango Delta', 'north',
     'Vumbura concession (NG22), northern Okavango Delta, Botswana'),
    ('wilderness-qorokwe', 'Wilderness Qorokwe', (7,), 'Classic', DELTA, 'Okavango Delta', 'southeast',
     'Private concession on the southeastern edge of Moremi, Okavango Delta, Botswana'),
    ('wilderness-dumatau', 'Wilderness DumaTau', (8,), 'Premier', LIN, 'Linyanti & Savuti', None,
     'Linyanti Wildlife Reserve, Botswana'),
    ('wilderness-kings-pool', "Wilderness King's Pool", (9,), 'Premier', LIN, 'Linyanti & Savuti', None,
     'Linyanti Wildlife Reserve, Botswana'),
    ('wilderness-little-dumatau', 'Wilderness Little DumaTau', (10,), 'Premier', LIN, 'Linyanti & Savuti', None,
     'Linyanti Wildlife Reserve, Botswana'),
    ('wilderness-little-mombo', 'Wilderness Little Mombo', (11,), 'Premier', DELTA, 'Okavango Delta', 'moremi',
     "Chief's Island, Moremi Game Reserve, Okavango Delta, Botswana"),
    ('wilderness-mombo', 'Wilderness Mombo', (12,), 'Premier', DELTA, 'Okavango Delta', 'moremi',
     "Chief's Island, Moremi Game Reserve, Okavango Delta, Botswana"),
    ('wilderness-vumbura-plains-north', 'Wilderness Vumbura Plains North', (13,), 'Premier', DELTA, 'Okavango Delta', 'north',
     'Vumbura concession (NG22), northern Okavango Delta, Botswana'),
    ('wilderness-vumbura-plains-south', 'Wilderness Vumbura Plains South', (14,), 'Premier', DELTA, 'Okavango Delta', 'north',
     'Vumbura concession (NG22), northern Okavango Delta, Botswana'),
]
TOP4 = ('wilderness-dumatau', 'wilderness-little-dumatau', 'wilderness-little-mombo', 'wilderness-mombo')
MOMBOS = ('wilderness-little-mombo', 'wilderness-mombo')

# ------------------------------------------------------------------ read the sheet
FIG = r'US\$\s?(\d{1,3}(?: \d{3})*)(?!\d)'
num = lambda s: int(s.replace(' ', ''))
T = subprocess.check_output(['pdftotext', '-layout', P(PDF), '-']).decode('utf-8')
L = T.split('\n')
valid = re.search(r'VALIDITY: (\S+) to (\S+)', T).groups()
assert valid == ('06-Jan-2026', '05-Jan-2027'), valid
hdr = next(i for i, l in enumerate(L) if re.search(r'6-Jan-26 to\s+1-Apr-26 to', l))
a = re.findall(r'(\d{1,2}-[A-Z][a-z]{2}-\d\d) to', L[hdr])
b = re.findall(r'(\d{1,2}-[A-Z][a-z]{2}-\d\d)', L[hdr + 1])
assert len(a) == len(b) == 6
f = lambda s: datetime.datetime.strptime(s, '%d-%b-%y').strftime('%d %b')
SEAS = ['%s – %s' % (f(x), f(y)) for x, y in zip(a, b)]
rows = [i for i, l in enumerate(L) if 'Per person, sharing' in l]
assert len(rows) == len(SHEET), len(rows)
R = []
for (frag1, frag2), i in zip(SHEET, rows):
    assert frag1 in L[i], (frag1, L[i])
    nxt = L[i + 1]
    if frag2:
        assert frag2 in nxt, (frag2, nxt)
    assert 'Single supplement' in nxt
    pps = [num(x) for x in re.findall(FIG, L[i])]
    sup = [num(x) for x in re.findall(FIG, nxt)]
    assert len(pps) == len(sup) == 6, (frag1, pps, sup)
    for p, s in zip(pps, sup):
        assert abs(s / p - 0.30) < 0.002, (frag1, p, s)          # every supplement is 30% of sharing
    R.append(list(zip(SEAS, pps, sup)))
assert R[0] == R[1], 'Linyanti Tented East and West differ'
one = lambda pat: num(re.search(pat, T).group(1))
GUIDE = int(float(re.search(r'Pilot / guide accommodation is US\$(\d+)\.00', T).group(1)))
GUIDE_MOMBO = int(float(re.search(r'Little Mombo, where the rate is US\$ ?(\d+)\.00', T).group(1)))
PRIV = {'Classic': one(r'Private activities at Classic camps\s+' + FIG),
        'Premier': one(r'Private activities at Premier camps\s+' + FIG),
        'Top': num(re.search(r'Little Mombo and Mombo\s+US\$(\d+)', T).group(1))}
assert (GUIDE, GUIDE_MOMBO, PRIV['Classic'], PRIV['Premier'], PRIV['Top']) == (149, 369, 871, 970, 1147)

def fmt(n):
    return '{:,.2f}'.format(n).replace('.00', '') if n % 1 == 0 else '{:,.2f}'.format(n)
rack_of = lambda n: round(n / 0.8, 2)

def acc_rows(camp, rack):
    out = []
    for s, pps, sup in R[camp[2][0]]:
        x, y = (rack_of(pps), rack_of(pps + sup)) if rack else (pps, pps + sup)
        out.append(['%s · Fully Inclusive — per person sharing' % s, fmt(x)])
        out.append(['%s · Fully Inclusive — single' % s, fmt(y)])
    return out

def extra_rows(camp, rack):
    slug, tier = camp[0], camp[3]
    tc = 'to confirm'
    g = GUIDE_MOMBO if slug in MOMBOS else GUIDE
    priv = PRIV['Top'] if slug in TOP4 else PRIV[tier]
    plab = 'Extras · Private activities — per party per night, max 6 guests'
    if slug.startswith('wilderness-chitabe'):
        plab = 'Extras · Private activities — per party per night, max 6 guests (Chitabe: a higher rate may apply, confirm before quoting)'
    return [['Extras · Pilot / guide accommodation — per pilot or guide per night (per bed)', tc if rack else fmt(g)],
            [plab, tc if rack else fmt(priv)]]

SRC = 'Wilderness Botswana Agent Nett Rates (B9), valid 06 Jan 2026 to 05 Jan 2027, sheet dated 25 Jun 2026'
CHILD = ('Children 3–16 sharing with adults in a family room: 65% off the adult rate 06 Jan–31 May and 01 Nov–19 Dec, '
         '35% off 01 Jun–31 Oct and 20 Dec–05 Jan; 0–2 free; parties with children 12 and under must book private activities '
         'at Classic and Premier camps.')
def extras_note(camp):
    s = []
    if camp[0] in MOMBOS:
        s.append('Mombo and Little Mombo must be booked with another Wilderness camp for standard rates; booked alone, RSP less 10% applies.')
    if camp[0] == 'wilderness-linyanti-tented-camp':
        s.append('East and West are sold as Linyanti Tented Camp; Wilderness confirms East or West only when sole use is booked.')
    if camp[0] == 'wilderness-mokete':
        s.append('Children 6 and older are welcome.')
    return ' '.join(s)

def sto_doc(c):
    return {'name': c[1], 'region': c[5], 'currency': 'US$', 'validity': '06 Jan 2026 – 05 Jan 2027',
            'commission': 'Agent nett (no commission stated)',
            'note': ('%s. FI: accommodation, all meals, twice-daily scheduled camp activities, park fees, laundry and local drinks. '
                     '"Single" is the per person sharing rate plus the single supplement. %s camp. 5%% long-stay discount on 6+ '
                     'nights in low season only. %s %s' % (SRC, c[3], CHILD, extras_note(c))).strip(),
            'sections': [{'title': '2026 — net STO', 'rows': acc_rows(c, False)},
                         {'title': '2026 — Wilderness extras (nett)', 'rows': extra_rows(c, False)}]}

def rack_doc(c):
    return {'name': c[1], 'region': c[5], 'currency': 'US$', 'validity': '06 Jan 2026 – 05 Jan 2027',
            'note': ('Public rack derived from %s: Wilderness publishes nett only, so accommodation rack = nett ÷ 0.80 '
                     '(house rule). Guide rooms and private activities state no basis and are to confirm. FI basis; '
                     '"single" is sharing plus the single supplement.' % SRC),
            'sections': [{'title': '2026 — rack', 'rows': acc_rows(c, True)},
                         {'title': '2026 — Wilderness extras (rack)', 'rows': extra_rows(c, True)}]}

STO = {c[0]: {'2026': sto_doc(c)} for c in CAMPS}
RACK = {c[0]: {'2026': rack_doc(c)} for c in CAMPS}

# every nett figure written is on the sheet
figs = {GUIDE, GUIDE_MOMBO} | set(PRIV.values())
for r in R:
    for _, p, s in r:
        figs |= {p, p + s}
for slug, d in STO.items():
    for sec in d['2026']['sections']:
        for lab, v in sec['rows']:
            assert not re.search(r'\d', v) or float(v.replace(',', '')) in figs, (slug, lab, v)
        assert len({lab for lab, _ in sec['rows']}) == len(sec['rows'])

# ------------------------------------------------------------------ API state probe (as in load_wilderness_n9.py)
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
    assert MARK not in io.open(P('api/%s.js' % fn), encoding='utf-8').read(), 'already loaded'
    for s in SLUGS:
        assert s not in before[fn]['cov'], ('slug already exists', fn, s)

def block(kind, data):
    dds = 'DDS_STO_BY_YEAR' if kind == 'sto' else 'DDS_RACK_BY_YEAR'
    return '''
/* %s — Wilderness Botswana (B9) 2026, 14 camps. Adds year 2026 for new slugs only. Generated by tools/load_wilderness_b9.py. */
(function loadWildernessB9%s() {
  var V = %s;
  if (typeof %s === 'undefined') return;
  Object.keys(V).forEach(function (slug) {
    var e = %s[slug] || (%s[slug] = {});
    Object.keys(V[slug]).forEach(function (y) { if (!e[y]) e[y] = V[slug][y]; });
  });
})();
''' % (MARK, kind.capitalize(), json.dumps(data, ensure_ascii=False, indent=1), dds, dds, dds)

for kind, data in (('sto', STO), ('rack', RACK)):
    fp = P('api/%s.js' % kind)
    s = io.open(fp, encoding='utf-8').read()
    io.open(fp + '.tmp.js', 'w', encoding='utf-8').write(s + block(kind, data))
    subprocess.check_call(['node', '--check', fp + '.tmp.js'])
    os.replace(fp + '.tmp.js', fp)

after = state()
for fn in ('sto', 'rack'):
    for s, ys in before[fn]['cov'].items():
        for y in ys:
            assert y in after[fn]['cov'].get(s, {}), ('a year was lost', fn, s, y)
    for s in SLUGS:
        assert after[fn]['dds'][s]['2026']['sections'], (fn, s)
    print(fn, 'slugs %d -> %d' % (len(before[fn]['cov']), len(after[fn]['cov'])))

# ------------------------------------------------------------------ index + lodges-info
def flat(doc):
    out = []
    for sec in doc['sections']:
        for lab, v in sec['rows']:
            if re.fullmatch(r'[\d,]+(\.\d+)?', v):
                x = float(v.replace(',', ''))
                out.append({'n': lab, 'p': int(x) if x % 1 == 0 else x})
    return out
ix = P('assets/rates-index.json')
raw = io.open(ix, encoding='utf-8').read()
data = json.loads(raw)
assert json.dumps(data, indent=0, ensure_ascii=False) == raw, 'index on-disk format changed'
LL = data['lodges']
have = {x['name'] for x in LL}
for c in CAMPS:
    assert c[1] not in have, c[1]
    LL.append({'file': '', 'name': c[1], 'region': c[5], 'cur': 'USD',
               'rates': flat(STO[c[0]]['2026']), 'rack_2026': flat(RACK[c[0]]['2026'])})
data['count'] = len(LL)
io.open(ix + '.tmp', 'w', encoding='utf-8').write(json.dumps(data, indent=0, ensure_ascii=False))
json.load(io.open(ix + '.tmp', encoding='utf-8'))
os.replace(ix + '.tmp', ix)

li = P('assets/lodges-info.json')
raw = io.open(li, encoding='utf-8').read()
info = json.loads(raw)
assert json.dumps(info, indent=0, ensure_ascii=False) == raw, 'lodges-info on-disk format changed'
def lead(c):
    return 'Wilderness %s camp — %s. Fully inclusive. Rates in US$.' % (c[3], c[7].replace(', Botswana', ''))
for c in CAMPS:
    k = re.sub(r'[^a-z0-9]', '', c[1].lower())
    assert k not in info, k
    info[k] = {'name': c[1], 'url': '/%s/%s/' % (c[4], c[0]), 'lead': lead(c), 'imgs': [], 'orig': '', 'cur': 'USD'}
io.open(li + '.tmp', 'w', encoding='utf-8').write(json.dumps(info, indent=0, ensure_ascii=False))
os.replace(li + '.tmp', li)
print('index +%d (count %d), lodges-info +%d' % (len(CAMPS), data['count'], len(CAMPS)))

# ------------------------------------------------------------------ lodge pages (clone the photo-less Chobe Safari Lodge page)
DONOR = io.open(P('chobe-accommodation/chobe-safari-lodge/index.html'), encoding='utf-8').read()
D_DESC = 'Riverside lodge in Kasane on the Chobe River — Luxury Rooms, Suites and Explorer Suites, two included experiences per night.'
D_LEAD = re.search(r'<p class="lead">(.*?)</p>', DONOR).group(1)
D_LOC = 'Kasane, on the Chobe River, Botswana'
assert DONOR.count(D_DESC) == 2 and DONOR.count(D_LOC) == 2 and 'imageHandler' not in DONOR
REGION_TITLE = {DELTA: 'Okavango Delta', LIN: 'Linyanti &amp; Savuti'}
def page(c):
    slug, name, _, tier, folder, rlabel, _, loc = c
    h = name.replace("'", '&#39;')
    desc = 'Wilderness %s camp — %s. Fully inclusive; rates in US$.' % (tier, loc.replace(', Botswana', ''))
    plead = ('Wilderness %s camp — %s. Fully inclusive: accommodation, all meals, twice-daily scheduled camp activities, '
             'park fees, laundry and local drinks. All rates in US$, per person per night.' % (tier, loc.replace(', Botswana', '')))
    if slug in MOMBOS:
        plead += ' Must be combined with another Wilderness camp for standard rates.'
    s = DONOR
    s = s.replace('The Chobe Safari Lodge | Chobe', '%s | %s' % (h, REGION_TITLE[folder]))
    s = s.replace(D_DESC, desc).replace(D_LEAD, plead).replace(D_LOC, loc)
    s = s.replace('/chobe-accommodation/chobe-safari-lodge/', '/%s/%s/' % (folder, slug))
    s = s.replace('<a class="hero-back" href="/chobe-accommodation/">&#8592; Back to Chobe Accommodation</a>',
                  '<a class="hero-back" href="/%s/">&#8592; Back to %s Accommodation</a>' % (folder, REGION_TITLE[folder]))
    s = s.replace("var LODGE='chobe-safari-lodge'", "var LODGE='%s'" % slug)
    s = s.replace('The%20Chobe%20Safari%20Lodge', name.replace(' ', '%20').replace("'", '%27'))
    s = s.replace('The Chobe Safari Lodge', h)
    for bad in ('Chobe Safari', 'chobe-safari', 'Kasane', 'Luxury Room', 'Explorer Suite'):
        assert bad not in s, (slug, bad)
    assert s.count("var LODGE='%s'" % slug) == 1
    return s
for c in CAMPS:
    d = P('%s/%s' % (c[4], c[0]))
    os.makedirs(d, exist_ok=True)
    assert not os.path.exists(os.path.join(d, 'index.html')), d
    io.open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(page(c))

# ------------------------------------------------------------------ region pages
DEL = io.open(P(DELTA + '/index.html'), encoding='utf-8').read()
GRID = re.search(r'  <div class="grid" id="lodge-grid">\n(.*?)\n  </div>\n', DEL, re.S)
OLD = {re.search(r'data-name="([^"]+)"', l).group(1): l.strip() for l in GRID.group(1).split('\n') if 'class="card' in l}
assert sorted(OLD) == sorted(['camp okavango', 'xugana island lodge', 'nxamaseri island lodge', 'camp moremi', 'camp xakanaxa', 'sediba sa rona']), sorted(OLD)
GRAD = 'background-image:linear-gradient(160deg,#4a5a44,#243021)'
def card(c):
    h = c[1].replace("'", '&#39;')
    return ('<a class="card has-rates" data-name="%s" href="/%s/%s/"><div class="img" style="%s"><span class="rate-badge">'
            '<span class="rate-dot"></span>Rates</span><h3>%s</h3></div><div class="body"><p>%s &middot; US$</p>'
            '<span class="go">View lodge &amp; rates &rarr;</span></div></a>' % (c[1].lower().replace("'", ''), c[4], c[0], GRAD, h, REGION_TITLE[c[4]]))
def pending(name):
    return ('<a class="card" data-name="%s" href="#"><div class="img" style="%s"><h3>%s</h3></div><div class="body">'
            '<p>Okavango Delta &middot; US$</p><span class="go">Page in progress</span></div></a>' % (name.lower(), GRAD, name))
C = {c[0]: c for c in CAMPS}
SECTIONS = [
    ('moremi', "Moremi Game Reserve &amp; Chief&#39;s Island",
     [card(C['wilderness-mombo']), card(C['wilderness-little-mombo']), OLD['camp moremi'], OLD['camp xakanaxa']]),
    ('north', 'Northern Delta concessions',
     [card(C['wilderness-vumbura-plains-north']), card(C['wilderness-vumbura-plains-south']), card(C['wilderness-little-vumbura']),
      OLD['xugana island lodge'], OLD['camp okavango'], pending('Delta Camp')]),
    ('southeast', 'Southeastern Delta',
     [card(C['wilderness-chitabe']), card(C['wilderness-chitabe-lediba']), card(C['wilderness-qorokwe'])]),
    ('khwai', 'Khwai &amp; Mababe',
     [OLD['sediba sa rona'], card(C['wilderness-mokete']), pending('Camp Khwai')]),
    ('panhandle', 'Panhandle', [OLD['nxamaseri island lodge']]),
]
assert sum(len(x[2]) for x in SECTIONS) == 6 + 9 + 2
SEC_CSS = ('<style>.area-sec{margin:0 0 38px}.area-sec h3.area-h{font-family:var(--font-head,serif);color:var(--brand-accent,#a48256);'
           'font-weight:500;font-size:1.15rem;letter-spacing:.5px;margin:0 0 14px;padding-bottom:8px;border-bottom:1px solid rgba(164,130,86,.2)}'
           '.area-jump{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 26px}.area-jump a{font-size:.74rem;letter-spacing:.5px;padding:6px 13px;'
           'border-radius:4px;border:1px solid rgba(135,169,150,.7);background:rgba(135,169,150,.10);color:#5f7f72;text-decoration:none}'
           '.area-jump a:hover{background:rgba(135,169,150,.88);color:#fff}</style>')
FILTER = ('<script>function filterLodges(q){q=(q||"").trim().toLowerCase();var n=0;document.querySelectorAll(".area-sec").forEach(function(s){'
          'var k=0;s.querySelectorAll(".lodge-grid .card").forEach(function(c){var m=c.getAttribute("data-name").indexOf(q)>-1;'
          'c.style.display=m?"":"none";if(m)k++;});s.style.display=k?"":"none";n+=k;});var nr=document.getElementById("lodge-noresult");'
          'if(nr)nr.style.display=n?"none":"block";}</script>')
OTHER = ('  <div class="more">\n    <h3>More Botswana &amp; Zimbabwe regions</h3>\n    <ul>%s</ul>\n  </div>\n')
def others(skip):
    regs = [(DELTA, 'Okavango Delta'), (LIN, 'Linyanti &amp; Savuti'), ('chobe-accommodation', 'Chobe'), ('victoria-falls-accommodation', 'Victoria Falls')]
    return OTHER % ''.join('<li><a href="/%s/">%s</a></li>' % (f, t) for f, t in regs if f != skip)
def sections_html(secs, jump):
    out = [SEC_CSS]
    if jump:
        out.append('  <div class="area-jump">%s</div>' % ''.join('<a href="#area-%s">%s</a>' % (k, t) for k, t, _ in secs))
    for k, t, cards in secs:
        out.append('  <div class="area-sec" id="area-%s"><h3 class="area-h">%s</h3>\n  <div class="grid lodge-grid">\n    %s\n  </div></div>'
                   % (k, t, '\n    '.join(cards)))
    return '\n'.join(out) + '\n'
def rebuild(src, secs, jump, folder, title, desc, lead_txt, placeholder):
    s = src
    s = s.replace(GRID.group(0), sections_html(secs, jump))
    s = re.sub(r'<script>function filterLodges\(q\).*?</script>', lambda m: FILTER, s, count=1, flags=re.S)
    s = re.sub(r'  <div class="more">\n    <h3>More East Etosha lodges</h3>.*?\n  </div>\n', lambda m: others(folder), s, count=1, flags=re.S)
    s = re.sub(r'<title>.*?</title>', '<title>%s Accommodation | Namibia Rates</title>' % title, s, count=1)
    s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="%s">' % desc, s, count=1)
    s = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="https://namibiarates.com/%s/">' % folder, s, count=1)
    s = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="%s Accommodation — Namibia Rates">' % title, s, count=1)
    s = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="%s">' % desc, s, count=1)
    s = re.sub(r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="https://namibiarates.com/%s/">' % folder, s, count=1)
    s = re.sub(r'<p class="lead">.*?</p>', '<p class="lead">%s</p>' % lead_txt, s, count=1)
    s = s.replace('placeholder="Search Okavango Delta lodges…"', 'placeholder="%s"' % placeholder)
    assert 'id="lodge-grid"' not in s and 'More East Etosha' not in s and s.count('class="area-sec"') == len(secs)
    return s
delta = rebuild(DEL, SECTIONS, True, DELTA, 'Okavango Delta',
                'Camps and lodges in the Okavango Delta, Botswana, grouped by area. Rates are in US$.',
                'Camps and lodges in the Okavango Delta, Botswana, grouped by area: Moremi and Chief&#39;s Island, the northern '
                'concessions, the southeastern Delta, Khwai and Mababe, and the Panhandle. Rates are in US$. Linyanti and Savuti '
                'have <a href="/%s/">their own page</a>.' % LIN, 'Search Okavango Delta lodges…')
lin = rebuild(DEL, [('linyanti', 'Linyanti Wildlife Reserve',
                     [card(C[s]) for s in ('wilderness-dumatau', 'wilderness-little-dumatau', 'wilderness-kings-pool',
                                           'wilderness-linyanti-tented-camp', 'wilderness-savuti')])],
              False, LIN, 'Linyanti &amp; Savuti',
              'Camps in the Linyanti Wildlife Reserve and on the Savuti Channel, northern Botswana. Rates are in US$.',
              'Camps in the Linyanti Wildlife Reserve and on the Savuti Channel, northern Botswana. Rates are in US$.',
              'Search Linyanti &amp; Savuti lodges…')
lin = lin.replace('<h1>Okavango Delta Accommodation</h1>', '<h1>Linyanti &amp; Savuti Accommodation</h1>')
lin = re.sub(r"(\.hero\{[^}]*?background:#2b2b2b) url\('[^']*'\) center/cover no-repeat;", r'\1 linear-gradient(135deg,#4a5a44,#243021);', lin, count=1)
assert 'cgl-jun18' not in lin and '<h1>Linyanti &amp; Savuti Accommodation</h1>' in lin
io.open(P(DELTA + '/index.html'), 'w', encoding='utf-8').write(delta)
os.makedirs(P(LIN), exist_ok=True)
assert not os.path.exists(P(LIN + '/index.html'))
io.open(P(LIN + '/index.html'), 'w', encoding='utf-8').write(lin)

# ------------------------------------------------------------------ menus (site-chrome rewrites every page's header)
sc = P('assets/site-chrome.js')
s = io.open(sc, encoding='utf-8').read()
old = '<a href=\\"/okavango-delta-accommodation/\\">Okavango Delta</a>'
new = old + '<a href=\\"/linyanti-savuti-accommodation/\\">Linyanti &amp; Savuti</a>'
assert s.count(old) == 2 and 'linyanti-savuti' not in s, s.count(old)
s = s.replace(old, new)
io.open(sc + '.tmp.js', 'w', encoding='utf-8').write(s)
subprocess.check_call(['node', '--check', sc + '.tmp.js'])
os.replace(sc + '.tmp.js', sc)
print('pages: %d lodge pages, Delta page sectioned, %s created, menus updated' % (len(CAMPS), LIN))
