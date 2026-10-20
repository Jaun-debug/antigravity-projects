#!/usr/bin/env python3
"""Load the 20 Oct 2026 rate sheets: &Beyond 2027 (Sossusvlei Desert Lodge + 6 Botswana camps), Okonjima 2027
(Plains Camp, Bush Camp, Villa), Batonka 2026+2027, Swakopmund Luxury Suites 2026+2027, The Windhoek Lux Suites 2027,
African Monarch Journeys 2026+2027 (Nambwa Tented Lodge, Kazile Island Lodge), Lapa Lange 2027, Okahirongo 2027+2028.

    cd dt_library && python3 tools/load_rates_20oct.py --parse   # checks only, writes nothing
    cd dt_library && python3 tools/load_rates_20oct.py           # apply

Docs: tools/rates_20oct_docs.json (extracted from the supplier PDFs with word coordinates; every figure checked against
the page text, whole printed rows rebuilt, STO/rack ratio checked). Photos: tools/rates_20oct_imgs.json (R2 library).
Never removes a year. For a slug whose years live in a lower map (windhoek-lux-suites: SHEET maps), those years are copied
into the DDS entry first, so the DDS short-circuit cannot hide them.
Files that carry another session's uncommitted edits are staged as HEAD + this change only (git update-index), so those
edits are never committed by this script; the working copy keeps both.
"""
import io, json, os, re, subprocess, sys

ROOT = os.getcwd()
P = lambda f: os.path.join(ROOT, f)
rd = lambda f: io.open(P(f), encoding='utf-8').read()
PARSE = '--parse' in sys.argv
def wr(f, s, js=False):
    t = P(f) + ('.tmp.js' if js else '.tmp')
    io.open(t, 'w', encoding='utf-8').write(s)
    if js:
        subprocess.check_call(['node', '--check', t])
    os.replace(t, P(f))
def git(*a):
    return subprocess.check_output(['git', '-c', 'gc.auto=0'] + list(a), cwd=ROOT).decode('utf-8')
def head(f):
    try:
        return subprocess.check_output(['git', 'show', 'HEAD:./' + f], cwd=ROOT).decode('utf-8')
    except subprocess.CalledProcessError:
        return None
MARK = 'RATES-20OCT2026-LOAD'
DOCS = json.load(io.open(P('tools/rates_20oct_docs.json'), encoding='utf-8'))
IMGS = json.load(io.open(P('tools/rates_20oct_imgs.json'), encoding='utf-8'))
STO, RACK = DOCS['sto'], DOCS['rack']
SLUGS = sorted(STO)
assert sorted(RACK) == SLUGS

# ------------------------------------------------------------------ checks on the docs
def num(v):
    return float(v.replace(',', ''))
for kind, D in (('sto', STO), ('rack', RACK)):
    for s in SLUGS:
        for y, d in D[s].items():
            assert sorted(d) == ['currency', 'name', 'note', 'region', 'sections', 'validity'], (kind, s, y)
            labels = [r[0] for sec in d['sections'] for r in sec['rows']]
            assert len(labels) == len(set(labels)), (kind, s, y, 'duplicate label')
            for sec in d['sections']:
                for l, v in sec['rows']:
                    if re.search(r'\d', v):
                        assert re.fullmatch(r'[\d,]+(\.\d+)?', v), (kind, s, y, l, v)
    assert all(sorted(STO[s]) == sorted(RACK[s]) for s in SLUGS)
print('docs ok: %d slugs' % len(SLUGS))

# lodges that get a new page, region card, index entry and lodges-info entry
# slug: (folder, region label on cards, currency, lead)
DELTA = 'okavango-delta-accommodation'
NEW = {
 'andbeyond-sossusvlei-desert-lodge': ('sossusvlei-accommodation', 'Sossusvlei &amp; Namib', 'N$', '&amp;Beyond lodge at Sossusvlei, Namibia. Three meals daily, house drinks and the guided activities listed on the rate sheet are included; rates in N$ for 11 Jan 2027 – 10 Jan 2028.'),
 'andbeyond-nxabega-okavango-tented-camp': (DELTA, 'Okavango Delta &middot; US$', 'US$', '&amp;Beyond tented camp in the Okavango Delta, Botswana. Rates in US$ for 11 Jan 2027 – 10 Jan 2028, with long-stay rates for 4–5, 6+ and 8+ nights.'),
 'andbeyond-nxabega-under-canvas': (DELTA, 'Okavango Delta &middot; US$', 'US$', '&amp;Beyond Under Canvas camp in the Okavango Delta, Botswana, for guests aged 12 and older. Rates in US$ for 11 Jan 2027 – 10 Jan 2028.'),
 'andbeyond-sandibe-okavango-safari-lodge': (DELTA, 'Okavango Delta &middot; US$', 'US$', '&amp;Beyond lodge in the Okavango Delta, Botswana. Rates in US$ for 11 Jan 2027 – 10 Jan 2028, with long-stay rates for 4–5, 6+ and 8+ nights.'),
 'andbeyond-sandibe-under-canvas': (DELTA, 'Okavango Delta &middot; US$', 'US$', '&amp;Beyond Under Canvas camp in the Okavango Delta, Botswana, for guests aged 12 and older. Rates in US$ for 11 Jan 2027 – 10 Jan 2028.'),
 'andbeyond-xaranna-okavango-delta-lodge': (DELTA, 'Okavango Delta &middot; US$', 'US$', '&amp;Beyond lodge in the Okavango Delta, Botswana, closed for refurbishment until 31 Jul 2027 and reopening 1 Aug 2027. Rates in US$ to 10 Jan 2028.'),
 'andbeyond-chobe-under-canvas': ('chobe-accommodation', 'Chobe &middot; US$', 'US$', '&amp;Beyond Under Canvas camp in Chobe National Park, Botswana, for guests aged 12 and older. Rates in US$ for 2027.'),
 'batonka-guest-lodge': ('victoria-falls-accommodation', 'Victoria Falls &middot; US$', 'US$', 'Guest lodge in Victoria Falls, Zimbabwe. Bed &amp; breakfast; rates in US$ for 2026 and 2027.'),
 'swakopmund-luxury-suites': ('swakopmund-accommodation', 'Swakopmund', 'N$', 'Apartment hotel in Swakopmund. Bed &amp; breakfast; rates in N$, valid Dec–Nov (2026 and 2027 seasons).'),
 'nambwa-tented-lodge': ('caprivi-accommodation', 'Zambezi Region', 'N$', 'Tented lodge in Bwabwata National Park, Zambezi Region. Dinner, bed &amp; breakfast or fully inclusive; rates in N$ for 2026 and 2027.'),
 'kazile-island-lodge': ('caprivi-accommodation', 'Zambezi Region', 'N$', 'Lodge in Bwabwata National Park, Zambezi Region, sister to Nambwa Tented Lodge. Dinner, bed &amp; breakfast; rates in N$ for 2026 and 2027.'),
 'lapa-lange-game-lodge': ('kalahari-accommodation', 'Kalahari', 'N$', 'Game lodge in the Kalahari. Rates in N$ for 1 Nov 2026 – 31 Oct 2027.'),
 'okahirongo-elephant-lodge': ('kaokoland-accommodation', 'Kaokoland', 'N$', 'A&amp;K Sanctuary lodge in Kaokoland, northwest Namibia. Rates in N$ for 2027 and 2028; the lodge closes every February.'),
}
# existing pages that only gain years: windhoek-lux-suites (2027), okonjima-villa (2027), okonjima-bush-camp, okonjima-plains-camp
for s in NEW:
    assert s in STO, s
    assert not os.path.exists(P('%s/%s/index.html' % (NEW[s][0], s))), ('page exists', s)
for s in ('windhoek-accommodation/windhoek-lux-suites', 'central-namibia-accommodation/okonjima-villa',
          'central-namibia-accommodation/okonjima-bush-camp', 'central-namibia-accommodation/okonjima-plains-camp'):
    assert os.path.exists(P(s + '/index.html')), s
assert set(SLUGS) == set(NEW) | {'windhoek-lux-suites', 'okonjima-villa', 'okonjima-bush-camp', 'okonjima-plains-camp'}

# ------------------------------------------------------------------ API state probe
NODE = r'''
const path=require('path');process.chdir(process.argv[1]);
const Module=require('module');const orig=Module._load;
Module._load=function(r,p,i){if(/_ratesdb$/.test(r))return{dbConfigured:()=>false};return orig.apply(this,arguments);};
const fs=require('fs');const out={};
for(const [f,names] of [['sto',['DDS_STO_BY_YEAR','STO_DB','LEGACY_STO_BY_YEAR','SHEET_STO_BY_YEAR']],['rack',['DDS_RACK_BY_YEAR','VF_RACK','LEGACY_RACK_BY_YEAR','SHEET_RACK_BY_YEAR']]]){
  const src=fs.readFileSync('api/'+f+'.js','utf8')+'\nmodule.exports.__m={'+names.map(n=>n+':typeof '+n+'==="undefined"?{}:'+n).join(',')+'};';
  const m=new Module('api/'+f+'_probe.js');m.filename=path.resolve('api/'+f+'_probe.js');m.paths=Module._nodeModulePaths(path.resolve('api'));
  m._compile(src,m.filename);const M=m.exports.__m;const cov={};const yrs={};
  for(const k in M)for(const s in M[k]){const v=M[k][s];const flat=(k==='STO_DB'||k==='VF_RACK');const ys=flat?['flat']:Object.keys(v);cov[s]=cov[s]||{};ys.forEach(y=>{(cov[s][y]=cov[s][y]||[]).push(k)});}
  out[f]={cov:cov,dds:{}};
  for(const s of process.argv.slice(2)){if(M[names[0]][s])out[f].dds[s]=M[names[0]][s];}
}
process.stdout.write(JSON.stringify(out));
'''
state = lambda: json.loads(subprocess.check_output(['node', '-e', NODE, ROOT] + SLUGS))
before = state()
for fn in ('sto', 'rack'):
    assert MARK not in rd('api/%s.js' % fn), 'already loaded'
    D = STO if fn == 'sto' else RACK
    for s in SLUGS:
        have = before[fn]['cov'].get(s, {})
        for y in D[s]:
            assert y not in have, ('year already on the site — not overwriting', fn, s, y, have[y])
        print(fn, s, 'before:', {y: v for y, v in have.items()}, '+', sorted(D[s]))

# ------------------------------------------------------------------ build what changes (in memory)
CH = {}   # path -> (new working content, new HEAD-based content or None if the file is clean / new)
def change(f, fn):
    cur = rd(f) if os.path.exists(P(f)) else None
    h = head(f)
    new_w = fn(cur)
    new_h = None
    if cur is not None and h is not None and h != cur:
        new_h = fn(h)            # another session has uncommitted edits here: stage HEAD + our change only
    CH[f] = (new_w, new_h)

def block(kind, data):
    dds = 'DDS_STO_BY_YEAR' if kind == 'sto' else 'DDS_RACK_BY_YEAR'
    lower = (['LEGACY_STO_BY_YEAR', 'SHEET_STO_BY_YEAR'] if kind == 'sto' else ['LEGACY_RACK_BY_YEAR', 'SHEET_RACK_BY_YEAR'])
    return '''
/* %s — rate sheets loaded 20 Oct 2026 (&Beyond 2027, Okonjima 2027, Batonka 2026/27, Swakopmund Luxury Suites 2026/27,
   The Windhoek Lux Suites 2027, African Monarch Journeys 2026/27, Lapa Lange 2027, Okahirongo 2027/28). Adds years only;
   years a slug already holds in a lower map are copied into its DDS entry first so none is hidden. tools/load_rates_20oct.py */
(function loadRates20Oct%s() {
  var V = %s;
  if (typeof %s === 'undefined') return;
  var LOWER = [%s];
  Object.keys(V).forEach(function (slug) {
    var e = %s[slug] || (%s[slug] = {});
    LOWER.forEach(function (m) { if (m && m[slug]) Object.keys(m[slug]).forEach(function (y) { if (!e[y]) e[y] = m[slug][y]; }); });
    Object.keys(V[slug]).forEach(function (y) { if (!e[y]) e[y] = V[slug][y]; });
  });
})();
''' % (MARK, kind.capitalize(), json.dumps(data, ensure_ascii=False, indent=1), dds,
       ', '.join("(typeof %s === 'undefined' ? null : %s)" % (m, m) for m in lower), dds, dds)

if not PARSE:
    for kind, data in (('sto', STO), ('rack', RACK)):
        f = 'api/%s.js' % kind
        assert head(f) == rd(f), f + ' has uncommitted edits — stop'
        wr(f, rd(f) + block(kind, data), js=True)
    after = state()
    lost = []
    for fn in ('sto', 'rack'):
        D = STO if fn == 'sto' else RACK
        for s, ys in before[fn]['cov'].items():
            for y in ys:
                if y not in after[fn]['cov'].get(s, {}):
                    lost.append((fn, s, y))
        for s in SLUGS:
            dds = after[fn]['dds'][s]
            want = set(D[s]) | {y for y in before[fn]['cov'].get(s, {}) if y != 'flat'}
            assert set(dds) == want, (fn, s, sorted(dds), sorted(want))       # DDS holds every year the slug has anywhere
            for y in D[s]:
                assert dds[y] == D[s][y], (fn, s, y)
        print(fn, 'slugs %d -> %d' % (len(before[fn]['cov']), len(after[fn]['cov'])))
    assert not lost, lost
    print('slugs losing a year: 0')

# ------------------------------------------------------------------ index + lodges-info
def flat(d):
    return [{'n': l, 'p': num(v)} for s in d['sections'] for l, v in s['rows'] if re.search(r'\d', v)]
def idx_fn(raw):
    data = json.loads(raw)
    assert json.dumps(data, indent=0, ensure_ascii=False) == raw, 'index on-disk format changed'
    has = lambda e: any(e.get(k) for k in ('rates', 'rates_2027', 'rack_2026', 'rack_2027'))
    with_before = {e['name'] for e in data['lodges'] if has(e)}
    names = {e['name'].lower(): e for e in data['lodges']}
    for s in NEW:
        nm = STO[s][sorted(STO[s])[0]]['name']
        assert nm.lower() not in names, nm
        e = {'file': '/%s/%s/' % (NEW[s][0], s), 'name': nm, 'region': STO[s][sorted(STO[s])[0]]['region']}
        if NEW[s][2] == 'US$':
            e['cur'] = 'USD'
        if '2026' in STO[s]:
            e['rates'] = flat(STO[s]['2026']); e['rack_2026'] = flat(RACK[s]['2026'])
        if '2027' in STO[s]:
            e['rates_2027'] = flat(STO[s]['2027']); e['rack_2027'] = flat(RACK[s]['2027'])
        data['lodges'].append(e)
    w = names['the windhoek lux suites']
    assert 'rates_2027' not in w and 'rack_2027' not in w
    w['rates_2027'] = flat(STO['windhoek-lux-suites']['2027']); w['rack_2027'] = flat(RACK['windhoek-lux-suites']['2027'])
    # Okonjima: "Okonjima Nature Reserve" already carries the 2027 sheet in the index; no duplicate entries added.
    data['count'] = len(data['lodges'])
    with_after = {e['name'] for e in data['lodges'] if has(e)}
    assert with_before <= with_after, 'lodges losing rates'
    print('index: +%d lodges, Windhoek Lux Suites +2027, count %d, lodges losing rates: 0' % (len(NEW), data['count']))
    return json.dumps(data, indent=0, ensure_ascii=False)
change('assets/rates-index.json', idx_fn)

def info_fn(raw):
    info = json.loads(raw)
    assert json.dumps(info, indent=0, ensure_ascii=False) == raw, 'lodges-info on-disk format changed'
    for s in NEW:
        nm = STO[s][sorted(STO[s])[0]]['name']
        k = re.sub(r'[^a-z0-9]', '', nm.lower())
        assert k not in info, k
        e = {'name': nm, 'url': '/%s/%s/' % (NEW[s][0], s), 'lead': re.sub(r'&amp;', '&', NEW[s][3]), 'imgs': IMGS.get(s, [])}
        if NEW[s][2] == 'US$':
            e['cur'] = 'USD'
        info[k] = e
    return json.dumps(info, indent=0, ensure_ascii=False)
change('assets/lodges-info.json', info_fn)

# ------------------------------------------------------------------ lodge pages (donor: Tuludi at HEAD — no gallery)
DONOR = head(DELTA + '/tuludi/index.html')
D_HERO = re.search(r'<div class="hero" style="[^"]*">', DONOR).group(0)
D_LEAD = re.search(r'<p class="lead">.*?</p>', DONOR, re.S).group(0)
D_DESC = 'Natural Selection Premier camp — Khwai Private Reserve, Okavango Delta. Fully inclusive; rates in US$.'
D_LOC = 'Khwai Private Reserve, Okavango Delta, Botswana'
assert DONOR.count(D_HERO) == 1 and DONOR.count(D_LEAD) == 1 and DONOR.count(D_DESC) == 2 and DONOR.count(D_LOC) == 2, (
    DONOR.count(D_HERO), DONOR.count(D_LEAD), DONOR.count(D_DESC), DONOR.count(D_LOC))
RTITLE = {}
for f in set(v[0] for v in NEW.values()):
    t = re.search(r'<title>([^<|]+)', rd(f + '/index.html')).group(1).strip()
    RTITLE[f] = t
def page(s):
    folder, area, cur, lead = NEW[s]
    nm = STO[s][sorted(STO[s])[0]]['name']
    h = nm.replace('&', '&amp;').replace("'", '&#39;')
    hplain = nm.replace("'", '&#39;')
    region = STO[s][sorted(STO[s])[0]]['region']
    x = DONOR
    x = x.replace('Tuludi | Okavango Delta', '%s | %s' % (h, region))
    x = x.replace(D_DESC, re.sub('<[^>]+>', '', lead)).replace(D_LEAD, '<p class="lead">%s</p>' % lead)
    x = x.replace(D_LOC, area.replace(' &middot; US$', '') + (', Botswana' if cur == 'US$' and 'Victoria' not in area else ''))
    img = IMGS.get(s, [])
    hero = ("<div class=\"hero\" style=\"background:#2b2b2b url('%s') center/cover no-repeat\">" % img[0]) if img else \
           '<div class="hero" style="background:linear-gradient(135deg,#6b5844,#2f2519)">'
    x = x.replace(D_HERO, hero)
    x = x.replace('/okavango-delta-accommodation/tuludi/', '/%s/%s/' % (folder, s))
    x = x.replace('<a class="hero-back" href="/okavango-delta-accommodation/">&#8592; Back to Okavango Delta Accommodation</a>',
                  '<a class="hero-back" href="/%s/">&#8592; Back to %s</a>' % (folder, RTITLE[folder]))
    x = x.replace("var LODGE='tuludi'", "var LODGE='%s'" % s)
    x = x.replace('Tuludi%20', nm.replace(' ', '%20').replace('&', '%26') + '%20')
    x = x.replace('Tuludi', h)
    body = re.sub(r'<header.*?</header>', '', x, flags=re.S)
    for bad in ('Tuludi', 'tuludi', 'Khwai', 'Natural Selection', 'naturalselection'):
        assert bad not in body, (s, bad)
    assert x.count("var LODGE='%s'" % s) == 1
    if cur == 'N$':
        x = x.replace('(US$)', '(N$)').replace('US$ ', 'N$ ')   # the donor's booking code prints US$
        assert 'US$' not in x, s
    return x
for s in NEW:
    CH['%s/%s/index.html' % (NEW[s][0], s)] = (page(s), None)

# ------------------------------------------------------------------ region cards (V2 editorial cards)
def card(s):
    folder, area, cur, lead = NEW[s]
    nm = STO[s][sorted(STO[s])[0]]['name']
    img = IMGS.get(s, [])
    bg = ("background-image:url('%s')" % img[0]) if img else 'background-image:linear-gradient(160deg,#4a5a44,#243021)'
    return ('<a class="card has-rates" data-name="%s" href="/%s/%s/"><div class="img" style="%s"><span class="rate-badge"><span class="rate-dot"></span>Rates</span></div>'
            '<div class="body"><p class="area">%s</p><h3>%s</h3><p class="desc">%s</p><span class="go">View lodge &#8594;</span></div></a>'
            % (nm.lower().replace("'", '').replace('&', '&amp;'), folder, s, bg, area, nm.replace('&', '&amp;'), lead))
def into_grid(slugs):
    def fn(src):
        a = src.index('id="lodge-grid">') + len('id="lodge-grid">')
        cards = list(re.finditer(r'<a class="card[^"]*" data-name="([^"]*)"', src[a:]))
        out = src
        for s in sorted(slugs, key=lambda z: -len(z)):
            nm = card(s)
            key = STO[s][sorted(STO[s])[0]]['name'].lower()
            pos = None
            for m in cards:
                if m.group(1) > key:
                    pos = a + m.start(); break
            if pos is None:
                last = cards[-1]
                endtag = out.index('</a>', a + last.start()) + 4
                pos = endtag
            out = out[:pos] + nm + out[pos:]
            a = out.index('id="lodge-grid">') + len('id="lodge-grid">')
            cards = list(re.finditer(r'<a class="card[^"]*" data-name="([^"]*)"', out[a:]))
        assert sum(out.count('href="/%s/%s/"' % (NEW[s][0], s)) for s in slugs) == len(slugs)
        return out
    return fn
by_folder = {}
for s in NEW:
    by_folder.setdefault(NEW[s][0], []).append(s)
for f, ss in by_folder.items():
    if f == DELTA:
        def delta_fn(src, ss=ss):
            sec = ('  <div class="area-sec" id="area-andbeyond"><h3 class="area-h"><span class="cur">&amp;</span>Beyond camps</h3>\n  <div class="grid lodge-grid">%s\n  </div></div>\n'
                   % ''.join('\n    ' + card(s) for s in sorted(ss)))
            anchor = '  <div class="area-sec" id="area-khwai">'
            assert src.count(anchor) == 1
            out = src.replace(anchor, sec + anchor)
            if '<a href="#area-khwai">' in out:
                out = out.replace('<a href="#area-khwai">', '<a href="#area-andbeyond">&amp;Beyond camps</a><a href="#area-khwai">', 1)
            return out
        change(f + '/index.html', delta_fn)
    else:
        change(f + '/index.html', into_grid(ss))
print('pages: %d new lodge pages; region cards on %d region pages' % (len(NEW), len(by_folder)))

if PARSE:
    for f, (w, h) in CH.items():
        print('would write', f, len(w), '(HEAD-based stage)' if h is not None else '')
    sys.exit(0)

# ------------------------------------------------------------------ write + stage
for f, (w, h) in CH.items():
    os.makedirs(os.path.dirname(P(f)), exist_ok=True)
    wr(f, w)
staged = ['api/sto.js', 'api/rack.js']
for f, (w, h) in CH.items():
    if h is None:
        staged.append(f)
    else:
        tmp = P(f) + '.stage.tmp'
        io.open(tmp, 'w', encoding='utf-8').write(h)
        sha = subprocess.check_output(['git', 'hash-object', '-w', tmp], cwd=ROOT).decode().strip()
        os.remove(tmp)
        mode = '100644'
        subprocess.check_call(['git', 'update-index', '--cacheinfo', '%s,%s,%s' % (mode, sha, os.path.relpath(P(f), git('rev-parse', '--show-toplevel').strip()))],
                              cwd=git('rev-parse', '--show-toplevel').strip())
        print('staged HEAD-based', f)
subprocess.check_call(['git', 'add', '--'] + staged + ['tools/load_rates_20oct.py', 'tools/rates_20oct_docs.json', 'tools/rates_20oct_imgs.json'], cwd=ROOT)
print('done — review `git diff --cached --stat`, then commit')
