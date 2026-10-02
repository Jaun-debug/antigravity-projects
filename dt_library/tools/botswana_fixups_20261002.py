#!/usr/bin/env python3
"""Botswana follow-ups to load_wilderness_b9.py (2 Oct 2026).

    cd dt_library && python3 tools/botswana_fixups_20261002.py

1. Camp Khwai and Delta Camp: both originals are headed "2026" (ratesheets/originals-img/camp_khwai.jpg,
   footsteps_in_africa.jpg) but the index carried their figures as rates_2027. Loaded into the APIs as 2026,
   index corrected (rates_2027 -> rates, rack_2026 added), lodge pages created, Delta region cards made live.
   Delta Camp publishes rack; Camp Khwai does not (rack = nett / 0.80).
2. Photos: Delta region hero (was a Chobe Game Lodge photo) -> Camp Moremi; Linyanti region hero, the 14
   Wilderness lodge pages, their region cards and lodges-info get each camp's own image (the og:image of its
   wildernessdestinations.com page); Botswana hub: Chobe Game Lodge card had a Camp Moremi photo.
3. Wilderness Air Botswana on flight_rates.html (seat rates, Helicopter Horizons transfers, airstrip areas,
   fees, luggage) + Flights menus. Not added to providers.json: the builder prices flights and activities in N$.
4. Wilderness Botswana scenic flights & excursions on activity_rates.html + Activities menus.
5. New group sheet ratesheets/wilderness_botswana_ratesheet_v3.html (US$, 2026, 14 camps) + Group Lodges menus;
   the existing Wilderness sheet is relabelled "Wilderness Namibia" and its wrong hero ("Etosha. Elevated.",
   "STO 20 Rates") corrected.
"""
import glob, io, json, os, re, subprocess, datetime

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
    assert s.count(old) == n, (old[:80], s.count(old))
    return s.replace(old, new)
MARK = 'BOTSWANA-FIXUPS-20261002'
assert MARK not in rd('api/sto.js'), 'already applied'
DELTA, LIN = 'okavango-delta-accommodation', 'linyanti-savuti-accommodation'
WM = 'https://www.wildernessdestinations.com/media/'
IMG = {  # og:image of each camp's own wildernessdestinations.com page
    'wilderness-linyanti-tented-camp': WM + 'ogreosat/wilderness-linyanti-tented-camp-hero.jpg?rmode=crop',
    'wilderness-savuti': WM + 'wzpnhlm3/tent-savuti-botswana-07-25_tc-22.jpg?rmode=crop',
    'wilderness-mokete': WM + 'owqh5tpj/mokete_2024_18.jpg?rmode=crop',
    'wilderness-chitabe': WM + 'ufjhthc1/chitabe-tented-suite-okavango-botswana-hero-1-edit.jpg?rmode=crop',
    'wilderness-chitabe-lediba': WM + 'nzod01u0/game-drive-chitabe-botswana.jpg?rmode=crop',
    'wilderness-little-vumbura': WM + 'yy2lpttk/littlevumbura_tents_standard_036_toned.jpg?rmode=crop',
    'wilderness-qorokwe': WM + '1jqf4xqu/qorokwe_dining_boma_080_toned.jpg?rmode=crop',
    'wilderness-dumatau': WM + 'zl4pj4j4/osprey-spa-and-retreat-at-dumatau.jpg?rmode=crop',
    'wilderness-kings-pool': WM + 'zsblrm12/wilderness-kings-pool-hero.jpg?rmode=crop',
    'wilderness-little-dumatau': WM + 'uzqhzi3i/wilderness-dumatau-hero-image.jpg?rmode=crop',
    'wilderness-little-mombo': WM + 'bj1ce0jy/wilderness-little-mombo-hero.jpg?rmode=crop',
    'wilderness-mombo': WM + 'fyylufgu/walk-into-the-ultimate-luxury-camp-wilderness-mombo.webp?rmode=crop',
    'wilderness-vumbura-plains-north': WM + '5eemp0ns/wilderness-vumbura-okavango-delta-botswana.jpg?rmode=crop',
    'wilderness-vumbura-plains-south': WM + '5eemp0ns/wilderness-vumbura-okavango-delta-botswana.jpg?rmode=crop',
}
CGL_IMG = 'https://wetu.com/imageHandler/c1920x1080/9828/cgl-jun18-decks-10.jpg?fmt=jpg'
MOREMI_IMG = 'https://wetu.com/imageHandler/c1920x1080/10082/camp_moremi_-_fire_deck2.jpg?fmt=jpg'
info = json.loads(rd('assets/lodges-info.json'))
KHWAI_IMG = info['campkhwai']['imgs'][0]
DCAMP_IMG = info['deltacampfootstepsinafrica']['imgs'][0]

def fmt(n):
    return '{:,.2f}'.format(n).replace('.00', '') if n % 1 == 0 else '{:,.2f}'.format(n)
r8 = lambda n: round(n / 0.8, 2)

# ====================================================================== 1. Camp Khwai + Delta Camp (2026)
KH = [('01 Dec 2025 – 31 Mar 2026 · Green', 388), ('01 Apr – 30 Jun & 01 – 30 Nov 2026 · Shoulder', 454),
      ('01 Jul – 31 Oct 2026 · High', 656)]
def kh_rows(rack):
    out = []
    for s, p in KH:
        v = r8(p) if rack else p
        out.append(['%s — per person sharing' % s, fmt(v)])
        out.append(['%s — single (sharing + 40%% supplement)' % s, fmt(round(v * 1.4, 2))])
    out.append(['Children 0–6 sharing', 'free'])
    out.append(['Pilot / guide — per night', 'to confirm' if rack else fmt(160)])
    return out
KH_NOTE = ("Camp Khwai '2026 STO Rates - 20%' (My African Safari Camps), seasons 01 Dec 2025 – 31 Oct 2026; "
           "December 2026 is not on this sheet. US$ per person per night. Includes accommodation, all meals, tea/coffee/soft "
           "drinks, local beers, wine and select spirits, two activities per day, laundry and Khwai airstrip transfers. "
           "Excludes the US$10 pppn conservation and community levy, premium drinks, air and inter-camp transfers, visas, "
           "gratuities. Children 7–11 pay half the adult rate. Single supplement 40%.")
DC = [('01 Jan – 31 Mar & 01 – 31 Dec 2026 · Green', 562, (450, 433, 416), 0),
      ('01 Apr – 30 Jun & 01 – 30 Nov 2026 · Shoulder', 818, (654, 630, 605), 0),
      ('01 Jul – 31 Oct 2026 · High', 946, (757, 728, 700), 30)]
def dc_rows(rack):
    out = []
    for s, rk, nets, sup in DC:
        if rack:
            out.append(['%s — per person sharing' % s, fmt(rk)])
            out.append(['%s — single' % s, fmt(round(rk * (1 + sup / 100.0))) if sup else fmt(rk)])
        else:
            for nn, lab in zip(nets, ('1–2 night stay', '3–5 night stay', '6+ night stay')):
                out.append(['%s · %s — per person sharing' % (s, lab), fmt(nn)])
                out.append(['%s · %s — single' % (s, lab), fmt(round(nn * (1 + sup / 100.0))) if sup else fmt(nn)])
    out.append(['Children 0–2', 'free'])
    out.append(['Pilot / guide — per night', 'to confirm' if rack else fmt(212)])
    return out
DC_NOTE = ("Footsteps in Africa '2026 Confidential STO Rates 20%', Delta Camp / Chief's Island Walking Trails. US$ per person "
           "per night sharing; nett by length of stay, rack as published. Single supplement nil in green and shoulder "
           "season, 30% in high season (rounded to the nearest US$). Includes accommodation, all meals, drinks (soft drinks, "
           "beers, select wines and spirits), laundry, activities, government taxes and park fees. Excludes light aircraft "
           "transfers, premium drinks, visas and the US$30 pppd wilderness fee on the Chief's Island walking trail. "
           "Children 2–11 half the adult rate.")
NEW = {
    'camp-khwai': ('Camp Khwai', KH_NOTE, '01 Dec 2025 – 31 Oct 2026', kh_rows),
    'delta-camp': ('Delta Camp (Footsteps in Africa)', DC_NOTE, '01 Jan – 31 Dec 2026', dc_rows),
}
STO = {k: {'2026': {'name': v[0], 'region': 'Okavango Delta', 'currency': 'US$', 'validity': v[2],
                    'commission': 'STO 20%', 'note': v[1], 'sections': [{'title': '2026 — net STO', 'rows': v[3](False)}]}}
       for k, v in NEW.items()}
RACK = {k: {'2026': {'name': v[0], 'region': 'Okavango Delta', 'currency': 'US$', 'validity': v[2],
                     'note': v[1] + (' Rack derived as nett ÷ 0.80 (no rack published).' if k == 'camp-khwai' else ' Rack as published.'),
                     'sections': [{'title': '2026 — rack', 'rows': v[3](True)}]}}
        for k, v in NEW.items()}
for d in list(STO.values()) + list(RACK.values()):
    for sec in d['2026']['sections']:
        for lab, val in sec['rows']:
            assert re.fullmatch(r'[\d,]+(\.\d+)?', val) or not re.search(r'\d', val), (lab, val)
        assert len({l for l, _ in sec['rows']}) == len(sec['rows'])
assert STO['delta-camp']['2026']['sections'][0]['rows'][0] == ['01 Jan – 31 Mar & 01 – 31 Dec 2026 · Green · 1–2 night stay — per person sharing', '450']

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
  out[f]=cov;
}
process.stdout.write(JSON.stringify(out));
'''
state = lambda: json.loads(subprocess.check_output(['node', '-e', NODE, ROOT]))
before = state()
for fn in ('sto', 'rack'):
    for s in NEW:
        assert s not in before[fn], (fn, s)
def block(kind, data):
    dds = 'DDS_STO_BY_YEAR' if kind == 'sto' else 'DDS_RACK_BY_YEAR'
    return '''
/* %s — Camp Khwai and Delta Camp 2026 (sheets headed 2026; previously mis-filed as 2027 in the index only). Adds 2026 for new slugs. Generated by tools/botswana_fixups_20261002.py. */
(function loadBotswanaFixups%s() {
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
    for s, ys in before[fn].items():
        for y in ys:
            assert y in after[fn].get(s, {}), ('year lost', fn, s, y)
    for s in NEW:
        assert '2026' in after[fn][s]
print('api: camp-khwai, delta-camp 2026 loaded; sto %d -> %d slugs' % (len(before['sto']), len(after['sto'])))

def flat(doc):
    out = []
    for sec in doc['sections']:
        for lab, v in sec['rows']:
            if re.fullmatch(r'[\d,]+(\.\d+)?', v):
                x = float(v.replace(',', ''))
                out.append({'n': lab, 'p': int(x) if x % 1 == 0 else x})
    return out
raw = rd('assets/rates-index.json'); data = json.loads(raw)
assert json.dumps(data, indent=0, ensure_ascii=False) == raw
names = {v[0]: k for k, v in NEW.items()}
hit = 0
for x in data['lodges']:
    k = names.get(x['name'])
    if not k:
        continue
    assert x.get('rates_2027') and not x.get('rates'), x['name']
    x.pop('rates_2027')
    x['rates'] = flat(STO[k]['2026']); x['rack_2026'] = flat(RACK[k]['2026']); x['file'] = ''; x['cur'] = 'USD'
    hit += 1
assert hit == 2
wr('assets/rates-index.json', json.dumps(data, indent=0, ensure_ascii=False))

# ---- pages (same donor as load_wilderness_b9.py) + photo heroes
DONOR = rd('chobe-accommodation/chobe-safari-lodge/index.html')
D_DESC = 'Riverside lodge in Kasane on the Chobe River — Luxury Rooms, Suites and Explorer Suites, two included experiences per night.'
D_LEAD = re.search(r'<p class="lead">(.*?)</p>', DONOR).group(1)
D_LOC = 'Kasane, on the Chobe River, Botswana'
D_HERO = '<div class="hero" style="background:linear-gradient(135deg,#6b5844,#2f2519)">'
assert DONOR.count(D_HERO) == 1
def hero(img):
    return '<div class="hero" style="background:#2b2b2b url(\'%s\') center/cover no-repeat">' % img
def page(slug, name, folder, rtitle, loc, desc, plead, img):
    h = name.replace("'", '&#39;')
    s = DONOR.replace('The Chobe Safari Lodge | Chobe', '%s | %s' % (h, rtitle))
    s = s.replace(D_DESC, desc).replace(D_LEAD, plead).replace(D_LOC, loc).replace(D_HERO, hero(img))
    s = s.replace('/chobe-accommodation/chobe-safari-lodge/', '/%s/%s/' % (folder, slug))
    s = s.replace('<a class="hero-back" href="/chobe-accommodation/">&#8592; Back to Chobe Accommodation</a>',
                  '<a class="hero-back" href="/%s/">&#8592; Back to %s Accommodation</a>' % (folder, rtitle))
    s = s.replace("var LODGE='chobe-safari-lodge'", "var LODGE='%s'" % slug)
    s = s.replace('The%20Chobe%20Safari%20Lodge', name.replace(' ', '%20').replace("'", '%27').replace('(', '%28').replace(')', '%29'))
    s = s.replace('The Chobe Safari Lodge', h)
    for bad in ('Chobe Safari', 'chobe-safari', 'Kasane', 'Luxury Room', 'Explorer Suite'):
        assert bad not in s, (slug, bad)
    return s
for slug, name, loc, plead, img in (
    ('camp-khwai', 'Camp Khwai', 'On the Khwai River, on the edge of Moremi, Okavango Delta, Botswana',
     'Classic tented camp on the Khwai River on the edge of Moremi (My African Safari Camps). Rates include all meals, local '
     'drinks, two activities a day, laundry and Khwai airstrip transfers. All rates in US$, per person per night.', KHWAI_IMG),
    ('delta-camp', 'Delta Camp (Footsteps in Africa)', "Xaxaba concession (NG27B), western edge of Chief's Island, Okavango Delta, Botswana",
     "Water-based camp on the western edge of Chief's Island, sold by Footsteps in Africa with its Chief's Island walking "
     'trails. Rates include all meals, drinks, laundry, activities, government taxes and park fees. All rates in US$, per '
     'person per night.', DCAMP_IMG)):
    d = P('%s/%s' % (DELTA, slug)); os.makedirs(d, exist_ok=True)
    assert not os.path.exists(d + '/index.html')
    wr('%s/%s/index.html' % (DELTA, slug), page(slug, name, DELTA, 'Okavango Delta', loc, plead.split('.')[0] + '.', plead, img))
info['campkhwai']['url'] = '/%s/camp-khwai/' % DELTA
info['deltacampfootstepsinafrica']['url'] = '/%s/delta-camp/' % DELTA

# 14 Wilderness pages: photo hero
for slug, img in IMG.items():
    folder = LIN if os.path.exists(P('%s/%s/index.html' % (LIN, slug))) else DELTA
    f = '%s/%s/index.html' % (folder, slug)
    wr(f, once(rd(f), D_HERO, hero(img)))
for k, v in info.items():
    for slug, img in IMG.items():
        if v.get('url') in ('/%s/%s/' % (DELTA, slug), '/%s/%s/' % (LIN, slug)):
            v['imgs'] = [img]
assert sum(1 for v in info.values() if v.get('imgs') and v['imgs'][0] in IMG.values()) == 14
wr('assets/lodges-info.json', json.dumps(info, indent=0, ensure_ascii=False))

# ====================================================================== 2. region pages + Botswana hub photos
GRAD = 'background-image:linear-gradient(160deg,#4a5a44,#243021)'
def photo_cards(s, folder):
    for slug, img in IMG.items():
        s = s.replace('href="/%s/%s/"><div class="img" style="%s">' % (folder, slug, GRAD),
                      'href="/%s/%s/"><div class="img" style="background-image:url(\'%s\')">' % (folder, slug, img))
    return s
dl = rd(DELTA + '/index.html')
dl = once(dl, "url('https://wetu.com/imageHandler/c1920x1080/9828/cgl-jun18-decks-10.jpg?fmt=jpg')", "url('%s')" % MOREMI_IMG)
for nm, slug, img in (('Delta Camp', 'delta-camp', DCAMP_IMG), ('Camp Khwai', 'camp-khwai', KHWAI_IMG)):
    old = ('<a class="card" data-name="%s" href="#"><div class="img" style="%s"><h3>%s</h3></div><div class="body">'
           '<p>Okavango Delta &middot; US$</p><span class="go">Page in progress</span></div></a>' % (nm.lower(), GRAD, nm))
    new = ('<a class="card has-rates" data-name="%s" href="/%s/%s/"><div class="img" style="background-image:url(\'%s\')">'
           '<span class="rate-badge"><span class="rate-dot"></span>Rates</span><h3>%s</h3></div><div class="body">'
           '<p>Okavango Delta &middot; US$</p><span class="go">View lodge &amp; rates &rarr;</span></div></a>' % (nm.lower(), DELTA, slug, img, nm))
    dl = once(dl, old, new)
dl = photo_cards(dl, DELTA)
assert dl.count("background-image:url('" + WM) == 9
wr(DELTA + '/index.html', dl)
ln = rd(LIN + '/index.html')
ln = once(ln, 'background:#2b2b2b linear-gradient(135deg,#4a5a44,#243021);',
          "background:#2b2b2b url('%s') center/cover no-repeat;" % IMG['wilderness-linyanti-tented-camp'])
ln = photo_cards(ln, LIN)
assert ln.count("background-image:url('" + WM) == 5
wr(LIN + '/index.html', ln)
bh = rd('botswana-accommodation/index.html')
bh = once(bh, ('<a class="card" href="#"><div class="img" style="background-image:url(\'%s\')"><h3>Chobe Game Lodge</h3></div>'
               '<div class="body"><p>Botswana</p><span class="go">Page in progress</span></div></a>' % MOREMI_IMG),
          ('<a class="card has-rates" data-name="chobe game lodge" href="/chobe-accommodation/chobe-game-lodge/"><div class="img" '
           'style="background-image:url(\'%s\')"><span class="rate-badge"><span class="rate-dot"></span>Rates</span><h3>Chobe Game Lodge</h3>'
           '</div><div class="body"><p>Chobe &middot; US$</p><span class="go">View lodge &amp; rates &rarr;</span></div></a>' % CGL_IMG))
bh = re.sub(r'<a class="card" href="#">(<div class="img" style="background-image:url\(\'https://wetu.com/imageHandler/c1920x1080/10099/[^\']*\'\)">)<h3>Camp Okavango</h3></div><div class="body"><p>Botswana</p><span class="go">Page in progress</span></div></a>',
            lambda m: '<a class="card has-rates" data-name="camp okavango" href="/%s/camp-okavango/">%s<span class="rate-badge"><span class="rate-dot"></span>Rates</span><h3>Camp Okavango</h3></div><div class="body"><p>Okavango Delta &middot; US$</p><span class="go">View lodge &amp; rates &rarr;</span></div></a>' % (DELTA, m.group(1)), bh, count=1)
assert 'Page in progress' not in bh
wr('botswana-accommodation/index.html', bh)
print('photos: Delta hero, Linyanti hero, 14 pages, 14 + 2 cards, Botswana hub fixed')

# ====================================================================== 3 + 4. flights and activities pages
PDF = P('ratesheets/originals/wilderness_botswana_b9_2026.pdf')
T = subprocess.check_output(['pdftotext', '-layout', PDF, '-']).decode('utf-8')
def seat(lbl):
    m = re.search(re.escape(lbl) + r'\s+Per person, per seat\s+US\$(\d+)', T)
    return int(m.group(1))
SEATS = [('Area 2 to Area 2 or vice versa', 'Within the Okavango Delta airstrips'), ('Area 2 to Area 3 or vice versa', 'Delta to Linyanti / Savuti / Selinda'),
         ('Area 2 to Kasane or vice versa', 'Delta to Kasane'), ('Area 3 to Area 3 or vice versa', 'Within the Linyanti / Savuti airstrips'),
         ('Area 3 to Kasane or vice versa', 'Linyanti / Savuti to Kasane'), ('Maun Airport to Area 2 or vice versa', 'Maun to the Delta'),
         ('Maun Airport to Area 3 or vice versa', 'Maun to Linyanti / Savuti')]
SV = [(a, b, seat(a)) for a, b in SEATS]
assert [x[2] for x in SV] == [301, 301, 482, 301, 482, 301, 310], [x[2] for x in SV]
for pat in (r'Linyanti to Mokete or vice versa\s+Per person, per seat\s+US\$672', r'Maun Airport to Mokete or vice versa\s+Per person, per seat\s+US\$672',
            r'Okavango to Mokete or vice versa\s+Per person, per seat\s+US\$672', r'Santawani Airstrip to Wilderness Mokete or vv\s+Per person, per seat\s+US\$262\s+US\$301',
            r'Area 2 - Jao Airstrip\s+Jacana, Jao, Kwetsani, Pelo', r'USD25\.00', r'USD35\.00', r'USD100 per party', r'USD 100\.00 - charged per 20 kg'):
    assert re.search(pat, T), pat
AREAS = [l.strip() for l in T.split('\n') if re.match(r'\s*Area\s?[23] - ', l)]
assert len(AREAS) == 31, len(AREAS)
def esc(s): return s.replace('&', '&amp;').replace("'", '&rsquo;')
area_rows = ''.join('<tr><td><strong>%s</strong></td><td>%s</td></tr>' % (esc(re.split(r'\s{2,}', a)[0]).replace('Area2', 'Area 2'), esc(re.split(r'\s{2,}', a)[1]))
                    for a in AREAS)
tr = lambda a, b, c: '<tr><td><strong>%s</strong></td><td class="info-col">%s</td><td class="price-highlight sto-col">US$ %s</td><td class="rack-col">Not published</td></tr>' % (a, b, c)
FL = '''
        <div class="rate-card" data-years="2026" id="supplier-wildernessairbw">
            <div class="supplier-info">
                <div class="supplier-details">
                    <h2>Wilderness Air Botswana</h2>
                    <p>Wilderness&rsquo;s scheduled seat-rate circuit linking Maun and Kasane with the Okavango Delta (Area 2) and Linyanti, Savuti and Selinda (Area 3) airstrips, plus Helicopter Horizons transfers to Wilderness Mokete. Seats may be booked on their own, without Wilderness accommodation.</p>
                </div>
                <div class="supplier-quick-spec">
                    <div class="spec-item"><span class="spec-label">Commission Model</span><span class="spec-value">Agent nett (no rack published)</span></div>
                    <div class="spec-item"><span class="spec-label">Coverage</span><span class="spec-value">Okavango Delta, Linyanti &amp; Savuti, Maun, Kasane</span></div>
                    <div class="spec-item"><span class="spec-label">Validity</span><span class="spec-value">06 Jan 2026 &ndash; 05 Jan 2027 (no 2027 sheet yet)</span></div>
                    <div class="spec-item"><span class="spec-label">Currency</span><span class="spec-value">US$</span></div>
                </div>
            </div>
            <div class="year-block" data-year="2026">
            <h3>Seat Rates &mdash; valid 06 Jan 2026 to 05 Jan 2027</h3>
            <div class="table-responsive"><table>
                <thead><tr><th>Route</th><th class="info-col">Basis</th><th class="sto-col">Agent Nett Rate</th><th class="rack-col">Rack Rate</th></tr></thead>
                <tbody>%s</tbody>
            </table></div>
            <h3>Helicopter Horizons transfers &mdash; Wilderness Mokete</h3>
            <div class="table-responsive"><table>
                <thead><tr><th>Route</th><th class="info-col">Basis</th><th class="sto-col">Agent Nett Rate</th><th class="rack-col">Rack Rate</th></tr></thead>
                <tbody>%s</tbody>
            </table></div>
            <h3>Which camps use which area</h3>
            <div class="table-responsive"><table>
                <thead><tr><th>Airstrip</th><th>Camps</th></tr></thead>
                <tbody>%s</tbody>
            </table></div>
            <h3>Departure taxes &amp; fees &mdash; not in the seat rates</h3>
            <ul>
                <li>Botswana domestic departure tax (Maun / Kasane) US$26 pp; international US$30 pp.</li>
                <li>Victoria Falls international departure tax plus AIDEF US$50 pp; Livingstone international US$40 pp, plus US$10 NACL safety tax and US$10 ZCAA charge per leg.</li>
                <li>Landing fees: US$25 pp at Kadizora, Xakanaxa, Gorokwe (Gomoti Plains and Gomoti Private only), Kiri Waka and Savute airstrips; US$35 pp at Khwai; US$100 per party per arrival and per departure at Piajo.</li>
            </ul>
            <h3>Notes</h3>
            <ul>
                <li>Rates per person per seat. No minimum and no single surcharge, except on the Victoria Falls / Livingstone / Kasane flights.</li>
                <li>Luggage: 20 kg per person including hand luggage, soft bags only, max 30 &times; 35 &times; 70 cm. Extra 20 kg costs US$100 per flight sector &mdash; pre-book it.</li>
                <li>Mombo airstrip is restricted to Wilderness Air, flying 11:00&ndash;16:00.</li>
                <li>The Santawani&ndash;Mokete helicopter is only booked with a Wilderness Air flight to or from Kasane.</li>
                <li>Rates may change with fuel, taxes, landing and navigation fees. Sheet B9, dated 25 Jun 2026.</li>
            </ul>
            </div>
        </div>
''' % (''.join(tr(esc(a), 'Per person, per seat &middot; ' + esc(b), c) for a, b, c in SV),
       tr('Linyanti to Mokete or vice versa', 'Per person, per seat', 672) + tr('Maun Airport to Mokete or vice versa', 'Per person, per seat', 672)
       + tr('Okavango to Mokete or vice versa', 'Per person, per seat', 672)
       + tr('Santawani Airstrip to Mokete or vice versa', 'Per person, per seat &middot; 01 Jan &ndash; 31 May 2026', 262)
       + tr('Santawani Airstrip to Mokete or vice versa', 'Per person, per seat &middot; 01 Jun &ndash; 31 Dec 2026', 301),
       area_rows)
fr = rd('flight_rates.html')
fr = once(fr, "<button class=\"tab-link\" onclick=\"switchSupplier('wildernessair', this)\">Wilderness Air Namibia</button>",
          "<button class=\"tab-link\" onclick=\"switchSupplier('wildernessair', this)\">Wilderness Air Namibia</button>\n            <button class=\"tab-link\" onclick=\"switchSupplier('wildernessairbw', this)\">Wilderness Air Botswana</button>")
fr = once(fr, "            wildernessair:'https://wetu.com/imageHandler/c1920x1080/28944/1741354188743_Final-Hoanib-40.jpg?fmt=jpg'\n",
          "            wildernessair:'https://wetu.com/imageHandler/c1920x1080/28944/1741354188743_Final-Hoanib-40.jpg?fmt=jpg',\n"
          "            wildernessairbw:'%s'\n" % IMG['wilderness-vumbura-plains-north'])
i = fr.index('<div class="rate-card" data-years="2026 2027" id="supplier-wildernessair">')
fr = fr[:i] + FL.lstrip('\n') + '\n        ' + fr[i:]
wr('flight_rates.html', fr)

# ---- activities
def sc(pat):
    m = re.search(pat, T); assert m, pat
    return [int(x.replace(',', '')) for x in m.groups()]
ACT = [
    ('30 min doors-off scenic flight', "King&rsquo;s Pool, Savuti, DumaTau &amp; Linyanti Tented", 'Full year', sc(r"30 min Doors off Scenic Fligh Kings P[^\n]*?US\$(\d+)")),
    ('30 min doors-off scenic flight', 'Jao concession, Mombo, Vumbura', 'Jan / Feb&ndash;Dec', sc(r"30 min Doors off Scenic Flight :Jao[^\n]*?US\$(\d+)\s+US\$(\d+)")),
    ('30 min doors-off scenic flight', 'Chitabe, Qorokwe &amp; Mokete', 'Jan / Feb&ndash;Dec', sc(r"30 min Doors off Scenic Flight Chitabe[^\n]*?US\$(\d+)\s+US\$(\d+)")),
    ('45 min scenic flight', "King&rsquo;s Pool, Savuti, DumaTau &amp; Linyanti Tented", 'Full year', sc(r"45 Min Scenic Flight ex Kings P[^\n]*?US\$(\d+)")),
    ('45 min scenic flight', 'Jao concession, Mombo, Vumbura', 'Jan / Feb&ndash;Dec', sc(r"45 Min Scenic Flight :Jao[^\n]*?US\$(\d+)\s+US\$(\d+)")),
    ('45 min scenic flight', 'Chitabe, Qorokwe &amp; Mokete', 'Jan / Feb&ndash;Dec', sc(r"45 Min Scenic Flight : Chitabe[^\n]*?US\$(\d+)\s+US\$(\d+)")),
    ('60 min scenic flight', "King&rsquo;s Pool, Savuti, DumaTau &amp; Linyanti Tented", 'Full year', sc(r"60 Min Scenic Flight ex Kings P[^\n]*?US\$(\d+)")),
    ('60 min scenic flight', 'Jao concession, Mombo, Vumbura', 'Jan / Feb&ndash;Dec', sc(r"60 Min Scenic Flight :Jao[^\n]*?US\$(\d+)\s+US\$(\d+)")),
    ('60 min scenic flight', 'Chitabe, Qorokwe &amp; Mokete', 'Jan / Feb&ndash;Dec', sc(r"60 Min Scenic Flight : Chitabe[^\n]*?US\$(\d+)\s+US\$(\d+)")),
    ('Conservation &amp; Co-Existence cultural experience', "Chitabe, Qorokwe, Mokete, King&rsquo;s Pool, DumaTau", 'Jan / Feb&ndash;Dec', sc(r"Cultural Experience\s+Per Person \(Chitabe[^\n]*?US\$([\d,]+)\s+US\$([\d,]+)")),
    ('Conservation &amp; Co-Existence cultural experience', 'Jao, Kwetsani, Jacana, Tubu, Pelo', 'Jan / Feb&ndash;Dec', sc(r"Per Person \(Jao, Kwetsani[^\n]*?US\$(\d+)\s+US\$(\d+)")),
    ('Conservation &amp; Co-Existence cultural experience', 'Vumbura, Little Vumbura, Mombo, Little Mombo', 'Jan / Feb&ndash;Dec', sc(r"Per Person \(Vumbura, Little[^\n]*?US\$(\d+)\s+US\$(\d+)")),
    ('Half-day Tsodilo Hills tour', 'All Wilderness Linyanti camps', 'Full year', sc(r"Tsodilo Hills Tour : ex all WS Linyanti[^\n]*?US\$([\d,]+)")),
    ('Half-day Tsodilo Hills tour', 'All Wilderness Okavango camps', 'Full year', sc(r"Tsodilo Hills Tour : ex all WS Okavango[^\n]*?US\$([\d,]+)")),
    ('Half-day Tsodilo Hills tour', 'Chitabe, Qorokwe, Santawani', 'Full year', sc(r"Tsodilo Hills Tour ex Chitabe[^\n]*?US\$([\d,]+)")),
]
ex = [a[3] for a in ACT]
assert ex == [[377], [379, 378], [379, 378], [561], [563, 561], [563, 561], [736], [739, 737], [737, 737], [1126, 1270], [851, 962], [621, 702], [1596], [907], [1083]], ex
def cell(v):
    return 'US$ ' + ' / '.join('{:,}'.format(x) for x in v)
rows = ''.join('<tr><td><strong>%s</strong><br><small>Per person, minimum 2 guests</small></td><td class="info-col">%s &middot; %s</td><td class="price-highlight sto-col">%s</td><td class="rack-col">Not published</td></tr>'
               % (a, b, c, cell(v)) for a, b, c, v in ACT)
AC = '''
        <!-- ============================================== -->
        <!-- WILDERNESS BOTSWANA - SCENIC FLIGHTS & EXCURSIONS -->
        <!-- ============================================== -->
        <div class="rate-card" data-years="2026" id="supplier-wildernessbw">
            <div class="supplier-info">
                <div class="supplier-details">
                    <h2>Wilderness Botswana &mdash; scenic flights &amp; excursions</h2>
                    <p>Helicopter Horizons scenic flights from the Wilderness Delta and Linyanti camps (30, 45 or 60 minutes, doors off, flown during siesta), the Conservation &amp; Co-Existence cultural experience, and half-day helicopter excursions to the Tsodilo Hills.</p>
                </div>
                <div class="supplier-quick-spec">
                    <div class="spec-item"><span class="spec-label">Commission Model</span><span class="spec-value">Agent nett (no rack published)</span></div>
                    <div class="spec-item"><span class="spec-label">Location</span><span class="spec-value">Okavango Delta &amp; Linyanti, Botswana</span></div>
                    <div class="spec-item"><span class="spec-label">Validity</span><span class="spec-value">2026 &mdash; Wilderness Botswana sheet B9</span></div>
                    <div class="spec-item"><span class="spec-label">Currency</span><span class="spec-value">US$</span></div>
                </div>
            </div>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>Excursion</th><th class="info-col">From &middot; period</th><th class="sto-col">Agent Nett Rate</th><th class="rack-col">Rack Rate</th></tr></thead>
                    <tbody>%s</tbody>
                </table>
            </div>
            <h3>Notes</h3>
            <ul>
                <li>Where two figures are shown, the first applies 1&ndash;31 January 2026 and the second 1 February &ndash; 31 December 2026, as printed.</li>
                <li>Scenic flights are possible from Chitabe, Chitabe Lediba, Qorokwe; Jao, Kwetsani, Jacana, Tubu Tree, Little Tubu, Pelo; Mombo and Little Mombo; Vumbura Plains and Little Vumbura; King&rsquo;s Pool, Savuti, DumaTau and Linyanti Tented Camp; and Mokete.</li>
                <li>Tsodilo Hills: half day, morning or afternoon, with a professional guide at Tsodilo; entry fees, light lunch and refreshments included; doors stay on.</li>
                <li>Book through your Wilderness Travel Designer.</li>
            </ul>
        </div>
''' % rows
ar = rd('activity_rates.html')
ar = once(ar, "<button class=\"tab-link\" onclick=\"switchSupplier('namcharters', this)\">Namibian Charters</button>",
          "<button class=\"tab-link\" onclick=\"switchSupplier('namcharters', this)\">Namibian Charters</button>\n            <button class=\"tab-link\" onclick=\"switchSupplier('wildernessbw', this)\">Wilderness Botswana</button>")
ar = once(ar, '          var HERO_IMG={\n', "          var HERO_IMG={\n            wildernessbw:'%s',\n" % IMG['wilderness-mombo'])
i = ar.index('        <!-- ============================================== -->\n        <!-- SOLITAIRE ACTIVITY CENTRE -->')
ar = ar[:i] + AC.lstrip('\n') + '\n' + ar[i:]
assert ar.count('id="supplier-wildernessbw"') == 1 and "wildernessbw:'" in ar
wr('activity_rates.html', ar)
print('flight_rates.html + activity_rates.html: Wilderness Botswana cards added')

# ====================================================================== 5. Wilderness Botswana group sheet
B9 = io.open(P('tools/load_wilderness_b9.py'), encoding='utf-8').read()
ns = {}
exec(compile(B9.split('# ------------------------------------------------------------------ API state probe')[0], 'b9', 'exec'), ns)
CAMPS, R, SEASL = ns['CAMPS'], ns['R'], ns['SEAS']
GUIDE, GUIDE_M, PRIV, TOP4, MOMBOS = ns['GUIDE'], ns['GUIDE_MOMBO'], ns['PRIV'], ns['TOP4'], ns['MOMBOS']
def money(n): return '{:,.2f}'.format(n)
def tab1(c):
    rows = R[c[2][0]]
    t = ''.join('<tr><td><strong>PP Sharing — %s</strong></td><td style="text-align:right">%s</td></tr>' % (s, money(p)) for s, p, _ in rows)
    t += ''.join('<tr><td><strong>Single Supplement — %s</strong></td><td style="text-align:right">%s</td></tr>' % (s, money(u)) for s, _, u in rows)
    return ('<div class="year-pane" data-year="2026"><div class="block"><h3>Rates</h3><p class="raw">Wilderness Botswana agent nett rates, '
            'valid 06 Jan 2026 – 05 Jan 2027. US$ per person per night, fully inclusive. A single pays the sharing rate plus the supplement.</p>'
            '<div class="sub-block"><h4>Fully Inclusive</h4><div class="table-wrap"><table><thead><tr><th>Rate</th><th style="text-align:right">US$ pp / night</th></tr></thead>'
            '<tbody>%s</tbody></table></div></div></div></div>' % t)
def tab2(c):
    g = GUIDE_M if c[0] in MOMBOS else GUIDE
    pv = PRIV['Top'] if c[0] in TOP4 else PRIV[c[3]]
    note = ' At Chitabe a higher private-vehicle rate may apply — confirm before quoting.' if c[0].startswith('wilderness-chitabe') else ''
    return ('<div class="year-pane" data-year="2026"><div class="block"><h3>Extras</h3><p class="raw">FI includes twice-daily scheduled activities.%s</p>'
            '<div class="table-wrap"><table><thead><tr><th>Rate</th><th style="text-align:right">US$</th></tr></thead><tbody>'
            '<tr><td><strong>Private activities — per party per night, max 6</strong></td><td style="text-align:right">%s</td></tr>'
            '<tr><td><strong>Pilot / guide — per bed per night</strong></td><td style="text-align:right">%s</td></tr>'
            '</tbody></table></div></div></div>' % (note, money(pv), money(g)))
def tab3(c):
    extra = ''
    if c[0] in MOMBOS:
        extra = '<li>Mombo and Little Mombo must be booked with another Wilderness camp for standard rates; booked alone, RSP less 10% applies.</li>'
    if c[0] == 'wilderness-linyanti-tented-camp':
        extra = '<li>East and West are sold as Linyanti Tented Camp; East or West is confirmed only on sole use.</li>'
    if c[0] == 'wilderness-mokete':
        extra = '<li>Children 6 and older are welcome at Mokete.</li>'
    return ('<div class="block"><h3>Policies &amp; Information</h3><div class="sub-block"><h4>Basis</h4><ul class="t-list"><li><strong>Fully Inclusive (FI):</strong> '
            'accommodation, all meals, twice-daily scheduled camp activities, park fees, laundry and local drinks (excl. premium imported brands and champagne).</li></ul></div>'
            '<div class="sub-block"><h4>Wilderness Child Policy</h4><ul class="t-list"><li>0–2 free. 3–16 sharing with adults in a family room: 65%% off the adult rate '
            '06 Jan–31 May and 01 Nov–19 Dec, 35%% off 01 Jun–31 Oct and 20 Dec–05 Jan.</li><li>Parties with children 12 and under must book private activities '
            'at Classic and Premier camps unless they fill a vehicle (6) or book the camp exclusively.</li></ul></div><div class="sub-block"><h4>Notes</h4><ul class="t-list">'
            '<li>5%% long-stay discount on 6+ nights, low season only.</li>%s<li>Flights: see Wilderness Air Botswana under Flights.</li></ul></div>'
            '<div class="sub-block"><h4>Contact</h4><ul class="t-list"><li>Wilderness — book via your Travel Designer / Wilderness Window. Sheet B9, dated 25 Jun 2026.</li></ul></div></div>' % extra)
db = []
for c in CAMPS:
    key = re.sub(r'[^a-z0-9]', '', c[1].lower())
    lead = 'Wilderness %s camp — %s. Fully inclusive.' % (c[3], c[7].replace(', Botswana', ''))
    db.append('    %s: {\n        name: `%s`, location: `%s`,\n        cover: "%s",\n        images: ["%s"],\n        shortDesc: `%s`,\n        intro: `%s`,\n'
              '        tab1: `%s`,\n        tab2: `%s`,\n        tab3: `%s`\n    }' % (key, c[1], c[7].replace(', Botswana', ''), IMG[c[0]], IMG[c[0]], lead, lead, tab1(c), tab2(c), tab3(c)))
src = rd('ratesheets/wilderness_ratesheet_v3.html')
a = src.index('const DB = {\n'); b = src.index('\n};\n\nconst grid')
gb = src[:a] + 'const DB = {\n' + ',\n'.join(db) + src[b:]
gb = gb.replace('N$', 'US$').replace('US$ pp / night', 'US$ pp / night')
gb = once(gb, '<title>Wilderness — Rates &amp; Booking 2026', '<title>Wilderness Botswana — Rates &amp; Booking 2026')
gb = once(gb, '<span class="hero-display">Collection</span>', '<span class="hero-display">Botswana</span>')
gb = once(gb, '<p class="hero-tagline">Etosha. Elevated.</p>', '<p class="hero-tagline">Okavango Delta &amp; Linyanti.</p>')
gb = once(gb, '<p class="hero-sub">STO 20 Rates &middot; Season 2026</p>', '<p class="hero-sub">Agent nett rates &middot; Season 2026</p>')
old_sry = "    document.querySelectorAll('.year-pane[data-year]').forEach(function(p){ p.style.display = (p.getAttribute('data-year')===y) ? '' : 'none'; });\n"
new_sry = ("    var has=false; document.querySelectorAll('.year-pane[data-year]').forEach(function(p){ if(p.getAttribute('data-year')===y) has=true; });\n"
           "    var eff = has ? y : '2026';\n"
           "    document.querySelectorAll('.year-pane[data-year]').forEach(function(p){ p.style.display = (p.getAttribute('data-year')===eff) ? '' : 'none'; });\n"
           "    document.querySelectorAll('.yr-fallback').forEach(function(n){ n.style.display = has ? 'none' : ''; n.textContent = 'Wilderness has not published ' + y + ' Botswana rates yet — the 2026 rates are shown.'; });\n")
gb = once(gb, old_sry, new_sry)
gb = gb.replace('<div class="year-pane" data-year="2026"><div class="block"><h3>Rates</h3>',
                '<p class="raw yr-fallback" style="display:none;color:#a0522d"></p><div class="year-pane" data-year="2026"><div class="block"><h3>Rates</h3>')
assert gb.count('class="raw yr-fallback"') == 14 and 'Etosha. Elevated' not in gb
wr('ratesheets/wilderness_botswana_ratesheet_v3.html', gb)
ns_src = once(src, '<span class="hero-display">Collection</span>', '<span class="hero-display">Namibia</span>')
ns_src = once(ns_src, '<p class="hero-tagline">Etosha. Elevated.</p>', '<p class="hero-tagline">Wilderness Namibia.</p>')
ns_src = once(ns_src, '<p class="hero-sub">STO 20 Rates &middot; Season 2026</p>', '<p class="hero-sub">Agent nett rates &middot; Seasons 2026 &amp; 2027</p>')
wr('ratesheets/wilderness_ratesheet_v3.html', ns_src)

# ====================================================================== menus
def menus(s, js):
    q = '\\"' if js else '"'
    g_old = '<a href=%s/ratesheets/wilderness_ratesheet_v3.html%s>Wilderness</a>' % (q, q)
    g_new = ('<a href=%s/ratesheets/wilderness_ratesheet_v3.html%s>Wilderness Namibia</a><a href=%s/ratesheets/wilderness_botswana_ratesheet_v3.html%s>Wilderness Botswana</a>' % (q, q, q, q))
    f_old = '<a href=%s/flight_rates.html#wildernessair%s>Wilderness Air Namibia</a>' % (q, q)
    f_new = f_old + '<a href=%s/flight_rates.html#wildernessairbw%s>Wilderness Air Botswana</a>' % (q, q)
    n = s.count(g_old) + s.count(f_old)
    if 'wilderness_botswana_ratesheet' not in s:
        s = s.replace(g_old, g_new)
    if 'wildernessairbw' not in s:
        s = s.replace(f_old, f_new)
    return s, n
sc_js = rd('assets/site-chrome.js')
sc_js, n = menus(sc_js, True)
assert n >= 2, n
sc_js = once(sc_js, ' {region:"L\\u00fcderitz",name:"Bogenfels Tours",id:"bogenfels"}\n];',
             ' {region:"L\\u00fcderitz",name:"Bogenfels Tours",id:"bogenfels"},\n {region:"Botswana",name:"Wilderness Botswana",id:"wildernessbw"}\n];')
wr('assets/site-chrome.js', sc_js, js=True)
cnt = 0
for f in glob.glob('**/*.html', recursive=True):
    if 'node_modules' in f or '.bak' in f:
        continue
    s = rd(f); s2, n = menus(s, False)
    if s2 != s:
        wr(f, s2); cnt += 1
print('static headers updated in %d files' % cnt)
pt = rd('namibia_agent_portal.html')
pt = once(pt, """                        <a href="#" onclick="openFlightRates('mackair'); return false;">Mack Air</a>\n""",
          """                        <a href="#" onclick="openFlightRates('mackair'); return false;">Mack Air</a>\n                        <a href="#" onclick="openFlightRates('wildernessairbw'); return false;">Wilderness Air Botswana</a>\n""")
pt = once(pt, """                        <a href="#" onclick="openActivityRates('bogenfels'); return false;">Bogenfels Tours</a>\n""",
          """                        <a href="#" onclick="openActivityRates('bogenfels'); return false;">Bogenfels Tours</a>\n                        <div style="font-family:'Jost',sans-serif;font-size:.58rem;letter-spacing:1.5px;text-transform:uppercase;color:#a48256;margin:10px 14px 4px;opacity:.95;margin-top:12px;">Botswana</div>\n                        <a href="#" onclick="openActivityRates('wildernessbw'); return false;">Wilderness Botswana</a>\n""")
lud = pt.index("toggleRegionAccordion('act-luderitz')")
start = pt.rindex('                <div class="activity-region-card"', 0, lud)
end = pt.index('                <!-- OTHER REGIONS NOTE -->', lud)
card = pt[start:end]
bw = card.replace('act-luderitz', 'act-botswana').replace('Lüderitz Restricted Area Excursions', 'Botswana &mdash; Okavango Delta &amp; Linyanti')
bw = bw.replace("openActivityRates('bogenfels')", "openActivityRates('wildernessbw')").replace('Bogenfels & Diamond Tours', 'Wilderness Botswana &mdash; scenic flights &amp; excursions')
bw = bw.replace('Guided day safaris into restricted diamond ghost towns and sea arches.',
                'Helicopter Horizons scenic flights from the Wilderness camps, the Conservation &amp; Co-Existence cultural experience and half-day Tsodilo Hills trips. 2026 agent nett, US$.')
assert 'bogenfels' not in bw.lower() and 'diamond' not in bw.lower()
pt = pt[:end] + bw + pt[end:]
wr('namibia_agent_portal.html', pt)
print('agent portal: flights, activities menu + Botswana activity region added')
print('done')
# Applied by hand after the run (2 Oct 2026): both Wilderness group sheets' Quick Specs read "20% Built-in STO / Jan – Dec 2026";
# now "Agent nett (no rack published)" and 06 Jan 2026 – 05 Jan 2027 (Botswana) / 06 Jan 2026 – 05 Jan 2028 (Namibia, 2026 + 2027).
