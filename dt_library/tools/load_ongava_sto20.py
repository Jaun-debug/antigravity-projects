#!/usr/bin/env python3
"""Ongava Game Reserve — 2026 + 2027 STO20 load (4 Oct 2026).

Sources (ratesheets/originals/ongava/):
  ongava_2026_sto20.pdf  "2026 STO 20 RATES", issued 13 May 2026, valid 11 Jan 2026 – 10 Jan 2027
  ongava_2027_sto20.pdf  "2027 STO 20 RATES", issued 13 May 2026, valid 11 Jan 2027 – 10 Jan 2028
Both shared by Ongava sales via OneDrive.

Replaces the 2026 STO15 data (SHEET_* maps) with STO20 and adds 2027, for
ongava-lodge, ongava-tented-camp (now "Encounter by Ongava"), anderssons-at-ongava,
little-ongava (now "Horizon by Ongava"). Names on the site are left unchanged.

Rack: no rack sheet published. rack = net / 0.8 on every row except the Conservation
Fee, which the sheets call non-commissionable (rack = net). Proven for 2026 adult rows:
old STO15 / 0.85 == new STO20 / 0.8 on every one (asserted below).
"""
import io, json, os, re, shutil, subprocess, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda p: os.path.join(ROOT, p)
MARK = 'ONGAVA_STO20_2026_2027_LOAD_041026'

VALID = {'2026': '11 Jan 2026 – 10 Jan 2027', '2027': '11 Jan 2027 – 10 Jan 2028'}
SRC = {'2026': 'Ongava "2026 STO 20 RATES" (issued 13 May 2026, valid 11 January 2026 – 10 January 2027)',
       '2027': 'Ongava "2027 STO 20 RATES" (issued 13 May 2026, valid 11 January 2027 – 10 January 2028)'}
CONS = {'2026': (1200, 600), '2027': (1300, 650)}
GUIDE = {'2026': (1800, 'Guide / pilot — per single unit, all accommodation and meals, excluding beverages'),
         '2027': (2000, 'Guide / pilot — per single unit, Full Board, excludes bar')}
# (label, per, value, included-note)
MISC = {
 '2026': [('Lunch Pack', 'per person', 600, 'included in FI'),
          ('Etosha Game Drive (scheduled)', 'per person', 2600, None),
          ('Ongava Property Game Drive (scheduled)', 'per person', 1600, None),
          ('Nature Walk (scheduled)', 'per person', 700, None),
          ('Night Drive (scheduled)', 'per person', 1400, None),
          ('Ongava Airfield Passenger Fee', 'per person', 700, 'included in accommodation rate'),
          ('Airfield Transfer — Ongava camp to/from airfield, each way', 'per person', 600, 'included in FI'),
          ('Private Activities — Sole Use Guide & Vehicle (FI only)', 'per day', 18700, None)],
 '2027': [('Lunch Pack', 'per person', 630, None),
          ('Etosha Game Drive (scheduled)', 'per person', 2800, None),
          ('Ongava Property Game Drive (scheduled)', 'per person', 1700, None),
          ('Nature Walk (scheduled)', 'per person', 800, None),
          ('Night Drive (scheduled)', 'per person', 1400, None),
          ('Ongava Airfield Passenger Fee', 'per person', 800, 'included in accommodation rate'),
          ('Airfield Transfer — Ongava camp to/from airfield, each way', 'per person', 700, 'included in FI'),
          ('Private Activities — Sole Use Guide & Vehicle (FI only)', 'per day', 19500, None)]}
FB, FI = 'Full Board', 'Fully Inclusive'
# slug: name, new trading name, group key, single sheet, {year: (adult rows [(basis, config, net)], child rows [(basis, net)])}
CAMPS = {
 'ongava-lodge': ('Ongava Lodge', None, 'ongavalodge', 'ongava_lodge.html', {
    '2026': ([(FB, 'Per Person Sharing', 9440), (FB, 'Per Single Room', 12080), (FI, 'Per Person Sharing', 13840), (FI, 'Per Single Room', 17520)],
             [(FB, 9300), (FI, 14000)]),
    '2027': ([(FB, 'Per Adult Sharing', 9840), (FB, 'Per Single Room', 12560), (FI, 'Per Adult Sharing', 14400), (FI, 'Per Single Room', 18240)],
             [(FB, 7720), (FI, 11640)])}),
 'ongava-tented-camp': ('Ongava Tented Camp', 'Encounter by Ongava', 'tentedcamp', 'ongava_tented_camp.html', {
    '2026': ([(FI, 'Per Person Sharing', 13840), (FI, 'Per Single Room', 17520)], [(FI, 14000)]),
    '2027': ([(FI, 'Per Adult (no single supplement)', 15280)], [(FI, 11840)])}),
 'anderssons-at-ongava': ('Anderssons at Ongava', None, 'anderssons', 'anderssons_at_ongava.html', {
    '2026': ([(FI, 'Per Person Sharing', 18720), (FI, 'Per Single Room', 23680)], [(FI, 14000)]),
    '2027': ([(FI, 'Per Adult (no single supplement)', 19440)], [(FI, 11640)])}),
 'little-ongava': ('Little Ongava', 'Horizon by Ongava', 'littleongava', 'little_ongava.html', {
    '2026': ([(FI, 'Per Person Sharing', 40640), (FI, 'Per Single Room', 50752)], [(FI, 37000)]),
    '2027': ([(FI, 'Per Adult (no single supplement)', 40560)], [(FI, 29560)])}),
}
# every net figure printed on each sheet (checked against the PDFs below)
PDF = {'2026': {13840, 17520, 9440, 12080, 18720, 23680, 40640, 50752, 1200, 9300, 14000, 37000, 600, 1800,
                2600, 1600, 700, 1400, 18700},
       '2027': {9840, 12560, 7720, 14400, 18240, 11640, 15280, 11840, 19440, 40560, 29560, 1300, 650, 2000,
                630, 2800, 1700, 800, 1400, 700, 19500}}
# old STO15 2026 adult nets on the site — used to prove rack
STO15 = {'ongava-lodge': [10030, 12835, 14705, 18615], 'ongava-tented-camp': [14705, 18615],
         'anderssons-at-ongava': [19890, 25160], 'little-ongava': [43180, 53924]}


def fmt(n):
    n = round(n, 2)
    return '{:,.0f}'.format(n) if n == int(n) else '{:,.2f}'.format(n)


def rk(n):
    return n / 0.8


# ---- check the figures against the PDFs themselves
for y, f in (('2026', 'ongava_2026_sto20.pdf'), ('2027', 'ongava_2027_sto20.pdf')):
    t = subprocess.check_output(['pdftotext', '-layout', P('ratesheets/originals/ongava/' + f), '-']).decode()
    seen = {int(x.replace(',', '')) for x in re.findall(r'(?<![\d,.])\d{1,3}(?:,\d{3})+(?![\d,])|(?<![\d,.])\d{3}(?![\d,])', t)}
    missing = PDF[y] - seen
    assert not missing, (y, missing)

# ---- rack proof: STO15/0.85 == STO20/0.8 for every 2026 adult row
for slug, olds in STO15.items():
    news = [n for _, _, n in CAMPS[slug][4]['2026'][0]]
    assert len(olds) == len(news)
    for o, n in zip(olds, news):
        assert round(o / 0.85) == round(n / 0.8), (slug, o, n)


def lab(*parts):
    return ' — '.join(parts)


def doc(slug, y, rack):
    name, new, _, _, Y = CAMPS[slug]
    adults, kids = Y[y]
    v = VALID[y]
    r = (lambda n: fmt(rk(n))) if rack else (lambda n: fmt(n))
    ca, cc = CONS[y]
    sections = [
        {'title': 'Accommodation — %s STO20 — %s (per person per night)' % (y, v),
         'rows': [[lab(b, c, v), r(n)] for b, c, n in adults]},
        {'title': 'Children 16 and under sharing with adults — %s' % v,
         'rows': [[lab('Child sharing', b, v), r(n)] for b, n in kids]},
        {'title': 'Conservation Fee — non-commissionable, per person per day',
         'rows': [[lab('Conservation Fee', 'adult, per person per day', v), fmt(ca)],
                  [lab('Conservation Fee', 'child, per person per day', v), fmt(cc)]]},
        {'title': 'Guides & Pilots', 'rows': [[lab(GUIDE[y][1], v), r(GUIDE[y][0])]]},
        {'title': 'Activities & Extras',
         'rows': [[lab(a + (' (%s)' % inc if inc else ''), per, y), r(n)] for a, per, n, inc in MISC[y]]},
    ]
    if slug == 'little-ongava':
        sections[-1]['rows'] = [row for row in sections[-1]['rows'] if not row[0].startswith('Private Activities')] + \
            [[lab('Private Activities — Sole Use Guide & Vehicle', 'included with every reservation', y), 'included']]
    if rack:
        nm = ('Rack = STO20 net / 0.8 (Ongava publish no rack sheet); Conservation Fee rack = net (non-commissionable). '
              'Source: %s.' % SRC[y])
    else:
        nm = ('Net STO20 rates, 20%% commission. Source: %s. Conservation Fee is non-commissionable and charged '
              'per person per day.' % SRC[y])
    if new:
        nm += ' The camp now trades as %s.' % new
    labels = [a for s in sections for a, _ in s['rows']]
    assert len(labels) == len(set(labels)), slug
    d = {'name': name, 'region': 'South Etosha', 'currency': 'N$', 'validity': v, 'note': nm, 'sections': sections}
    if not rack:
        d['commission'] = 'STO20'
    return d


NEW = {'sto': {s: {y: doc(s, y, False) for y in ('2026', '2027')} for s in CAMPS},
       'rack': {s: {y: doc(s, y, True) for y in ('2026', '2027')} for s in CAMPS}}

# every net figure written is on its own sheet; rack = net x 1.25 except the Conservation Fee (x 1.00)
for s in CAMPS:
    for y in ('2026', '2027'):
        for sec in NEW['sto'][s][y]['sections']:
            for a, v in sec['rows']:
                if v != 'included':
                    assert int(v.replace(',', '')) in PDF[y], (s, y, a, v)
        for sn, sr in zip(NEW['sto'][s][y]['sections'], NEW['rack'][s][y]['sections']):
            for (a, n), (_, rr) in zip(sn['rows'], sr['rows']):
                if n == 'included':
                    continue
                ratio = float(rr.replace(',', '')) / float(n.replace(',', ''))
                assert abs(ratio - (1.0 if a.startswith('Conservation Fee') else 1.25)) < 1e-9, (s, y, a)

# ---- API state probe
NODE = r'''
const path=require('path');process.chdir(process.argv[1]);
const Module=require('module');const orig=Module._load;
Module._load=function(r,p,i){if(/_ratesdb$/.test(r))return{dbConfigured:()=>false};return orig.apply(this,arguments);};
const fs=require('fs');const out={};
for(const [f,names] of [['sto',['DDS_STO_BY_YEAR','STO_DB','LEGACY_STO_BY_YEAR','SHEET_STO_BY_YEAR']],['rack',['DDS_RACK_BY_YEAR','LEGACY_RACK_BY_YEAR','SHEET_RACK_BY_YEAR']]]){
  const src=fs.readFileSync('api/'+f+'.js','utf8')+'\nmodule.exports.__m={'+names.map(n=>n+':typeof '+n+'==="undefined"?{}:'+n).join(',')+'};';
  const m=new Module('x');m.filename=path.resolve('api/'+f+'_probe.js');m.paths=Module._nodeModulePaths(path.resolve('api'));
  m._compile(src,m.filename);const M=m.exports.__m;const cov={};
  for(const k in M)for(const s in M[k]){const v=M[k][s];const ys=(k==='STO_DB')?['db']:Object.keys(v);cov[s]=cov[s]||{};ys.forEach(y=>{(cov[s][y]=cov[s][y]||[]).push(k)});}
  const dds={};for(const s of process.argv.slice(2)){if(M[names[0]][s])dds[s]=M[names[0]][s];}
  out[f]={cov:cov,dds:dds};
}
process.stdout.write(JSON.stringify(out));
'''
SLUGS = list(CAMPS)


def state():
    return json.loads(subprocess.check_output(['node', '-e', NODE, ROOT] + SLUGS))


before = state()
for f in ('sto', 'rack'):
    assert MARK not in io.open(P('api/%s.js' % f), encoding='utf-8').read(), 'already loaded'
    for s in SLUGS:
        assert set(before[f]['cov'].get(s, {})) <= {'2026'}, ('unexpected year held', f, s, before[f]['cov'].get(s))
        assert not before[f]['dds'].get(s), ('unexpected DDS entry', f, s)


def block(kind):
    dds = 'DDS_STO_BY_YEAR' if kind == 'sto' else 'DDS_RACK_BY_YEAR'
    lower = ['STO_DB', 'LEGACY_STO_BY_YEAR', 'SHEET_STO_BY_YEAR'] if kind == 'sto' else ['LEGACY_RACK_BY_YEAR', 'SHEET_RACK_BY_YEAR']
    dels = ''.join("if (typeof %s !== 'undefined' && %s[slug]) delete %s[slug]; " % (m, m, m) for m in lower)
    return '''
// ---------------------------------------------------------------------------
// %s — Ongava Game Reserve STO20 2026 + 2027 (Ongava Lodge, Ongava Tented Camp = Encounter,
// Anderssons at Ongava, Little Ongava = Horizon). Replaces the 2026 STO15 sheet data.
// Generated by tools/load_ongava_sto20.py. Sources in ratesheets/originals/ongava/.
// ---------------------------------------------------------------------------
(function loadOngavaSto20%s() {
  if (typeof %s === 'undefined') return;
  var V = %s;
  Object.keys(V).forEach(function (slug) {
    var e = %s[slug] || (%s[slug] = {});
    Object.keys(V[slug]).forEach(function (y) { e[y] = V[slug][y]; });
    %s
  });
})();
''' % (MARK, kind.capitalize(), dds, json.dumps(NEW[kind], ensure_ascii=False, indent=1), dds, dds, dels)


for kind in ('sto', 'rack'):
    f = P('api/%s.js' % kind)
    s = io.open(f, encoding='utf-8').read()
    io.open(f + '.tmp.js', 'w', encoding='utf-8').write(s + block(kind))
    subprocess.check_call(['node', '--check', f + '.tmp.js'])
    os.replace(f + '.tmp.js', f)

after = state()
for f in ('sto', 'rack'):
    for s, ys in before[f]['cov'].items():
        for y in ys:
            assert y in after[f]['cov'].get(s, {}) or (s in SLUGS and y == 'db'), ('a year was lost', f, s, y)
    for s in SLUGS:
        assert after[f]['dds'][s] == NEW[f][s], (f, s)
        print(f, s, sorted(after[f]['cov'].get(s, {})), '(was %s)' % sorted(before[f]['cov'].get(s, {})))
    assert len(after[f]['cov']) == len(before[f]['cov']), ('slug count changed', f)


# ---- index: the four entries only
def flat(d):
    return [{'n': a, 'p': float(v.replace(',', '')) if '.' in v else int(v.replace(',', ''))}
            for sec in d['sections'] for a, v in sec['rows'] if re.fullmatch(r'[\d,]+(\.\d+)?', v)]


ix = P('assets/rates-index.json')
shutil.copy(ix, ix + '.bak_ongava_' + datetime.datetime.now().strftime('%Y%m%d%H%M%S'))
data = json.load(io.open(ix, encoding='utf-8'))
L = data if isinstance(data, list) else data['lodges']
n0 = len(L)
names = {CAMPS[s][0]: s for s in CAMPS}
touched = 0
for x in L:
    s = names.get(x['name'])
    if not s:
        continue
    x['rates'] = flat(NEW['sto'][s]['2026'])
    x['rates_2027'] = flat(NEW['sto'][s]['2027'])
    x['rack_2026'] = flat(NEW['rack'][s]['2026'])
    x['rack_2027'] = flat(NEW['rack'][s]['2027'])
    touched += 1
assert touched == 4 and len(L) == n0
if isinstance(data, dict) and 'count' in data:
    assert data['count'] == len(L)
io.open(ix + '.tmp', 'w', encoding='utf-8').write(json.dumps(data, indent=0, ensure_ascii=False))
json.load(io.open(ix + '.tmp', encoding='utf-8'))
os.replace(ix + '.tmp', ix)
print('index: 4 Ongava entries refreshed (2026 STO20 + 2027, rack both years)')


# ---- static sheets
def tables(slug, y, cls):
    blk, wrap, raw = cls
    name, new, _, _, Y = CAMPS[slug]
    adults, kids = Y[y]
    ca, cc = CONS[y]
    v = VALID[y]

    def T(head, rows):
        return '<div class="%s"><table><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (
            wrap, ''.join('<th>%s</th>' % h for h in head),
            ''.join('<tr>%s</tr>' % ''.join(('<td><strong>%s</strong></td>' % c) if i == 0 else '<td>%s</td>' % c
                                           for i, c in enumerate(r)) for r in rows))
    tab1 = ('<div class="%s"><h3>%s STO20 Rates — %s</h3><p class="%s">Namibian Dollars, per person per night, net of 20%% commission. '
            'The Conservation Fee is charged separately per person per day and is non-commissionable.%s</p>%s'
            '<div class="sub-block"><h4>Conservation Fee — per person per day</h4>%s</div>'
            '<div class="sub-block"><h4>Child Rates — 16 and under, sharing with adults</h4>%s</div>'
            '<div class="sub-block"><h4>Guide &amp; Pilot Rates</h4>%s</div></div>') % (
        blk, y, v, raw,
        (' %s now trades as %s.' % (name, new)) if new else '',
        T(['Basis', 'Configuration', 'Accommodation Rate (N$)'], [(b, c, fmt(n)) for b, c, n in adults]),
        T(['Guest', 'Rate (N$)'], [('Adult', fmt(ca)), ('Child', fmt(cc))]),
        T(['Basis', 'Configuration', 'Accommodation Rate (N$)'], [(b, 'Per Child Sharing', fmt(n)) for b, n in kids]),
        T(['Configuration', 'Rate (N$)'], [('Per single unit (%s)' % ('all meals, excl. beverages' if y == '2026' else 'Full Board, excl. bar'),
                                            fmt(GUIDE[y][0]))]))
    if slug == 'little-ongava':
        m = {a: (n, inc) for a, _, n, inc in MISC[y]}
        rows = [('Private Activities — Sole Use Guide &amp; Vehicle', 'Included', 'Included'),
                ('Etosha Game Drives (Scheduled)', 'per person', 'Included in FI'),
                ('Ongava Property Game Drives', 'per person', 'Included in FI'),
                ('Nature Walk (Scheduled)', 'per person', 'Included in FI'),
                ('Night Drives', 'per person', 'Included in FI'),
                ('Airfield Passenger Fee', 'per person', '%s (included in accommodation)' % fmt(m['Ongava Airfield Passenger Fee'][0])),
                ('Airfield Transfer — each way', 'per person',
                 '%s (included in FI)' % fmt(m['Airfield Transfer — Ongava camp to/from airfield, each way'][0]))]
        tab2 = ('<div class="%s"><h3>Included Private Activities — %s</h3><p class="%s">Private activities — sole use guide and vehicle — '
                'are included with every reservation. The service commences with the afternoon activity on arrival and ends with the '
                'morning activity on departure.</p>%s</div>') % (blk, y, raw, T(['Activity / Service', 'Per', 'Rate (N$)'], rows))
    else:
        rows = [(a.replace('&', '&amp;'), per, fmt(n) + (' (%s)' % inc if inc else '')) for a, per, n, inc in MISC[y]]
        tab2 = ('<div class="%s"><h3>Activities &amp; Miscellaneous — %s</h3><p class="%s">Scheduled activities are included in the '
                'Fully Inclusive rate. Extras below apply for Full Board guests or additional services.</p>%s</div>') % (
            blk, y, raw, T(['Activity / Service', 'Per', 'Rate (N$)'], rows))
    for t in (tab1, tab2):
        for fig in re.findall(r'<td>([\d,]+)(?: \(|</td>)', t):
            assert int(fig.replace(',', '')) in PDF[y], (slug, y, fig)
        assert '`' not in t and '${' not in t
    return tab1, tab2


def panes(a, b):
    return ('<div class="year-pane" data-year="2026">%s</div><div class="year-pane" data-year="2027" style="display:none">%s</div>'
            % (a, b))


CONS_OLD = 'N$ 1,200 per adult per night (N$ 600 per child)'
CONS_NEW = 'N$ 1,200 (2026) / N$ 1,300 (2027) per adult per day; N$ 600 / N$ 650 per child'
SETY = '''
<script>
/* Ongava STO20 2026 + 2027 (tools/load_ongava_sto20.py): the sheet declares its years so the season pills switch panes. */
window.NR_YEAR = window.NR_YEAR || '2026';
window.setRateYear = function (y) {
  y = String(y || '2026');
  var panes = document.querySelectorAll('.year-pane[data-year]'), hit = false;
  Array.prototype.forEach.call(panes, function (p) { var on = p.getAttribute('data-year') === y; if (on) hit = true; p.style.display = on ? '' : 'none'; });
  if (!hit) Array.prototype.forEach.call(panes, function (p) { if (p.getAttribute('data-year') === '2026') p.style.display = ''; });
  window.NR_YEAR = y;
};
window.setRateYear(window.NR_YEAR);
</script>
'''


def common(s):
    s = s.replace('STO15 Rates · 11 Jan 2026 – 10 Jan 2027', 'STO20 Rates · 2026 &amp; 2027')
    s = s.replace('STO15 Rates &middot; 11 Jan 2026 – 10 Jan 2027', 'STO20 Rates &middot; 2026 &amp; 2027')
    s = s.replace('STO15 (15% built-in)', 'STO20 (20% built-in)')
    s = s.replace('<span class="spec-value">11 Jan 2026 – 10 Jan 2027</span>', '<span class="spec-value">11 Jan 2026 – 10 Jan 2028</span>')
    return s.replace(CONS_OLD, CONS_NEW)


# group sheet
G = P('ratesheets/ongava_ratesheet_v3.html')
s = io.open(G, encoding='utf-8').read()
assert 'data-year' not in s and 'setRateYear' not in s
for slug, (name, new, key, single, _) in CAMPS.items():
    a = s.index('    %s: {' % key)
    b = s.index('\n    }', a)
    blk = s[a:b]
    c = ('content-block', 'table-responsive', 'raw-text')
    t26, t27 = tables(slug, '2026', c), tables(slug, '2027', c)
    for i, tab in enumerate(('tab1', 'tab2')):
        m = re.search(tab + r': `(.*?)`', blk, re.S)
        assert m
        blk = blk[:m.start(1)] + panes(t26[i], t27[i]) + blk[m.end(1):]
    s = s[:a] + blk + s[b:]
call = "t6.innerHTML=d.tab1;})();switchTab(6);"
assert s.count(call) == 1
s = s.replace(call, "t6.innerHTML=d.tab1;})();try{window.setRateYear(window.NR_YEAR||'2026');}catch(e){}switchTab(6);")
s = common(s)
assert s.count('</body>') == 1
s = s.replace('</body>', SETY + '</body>')
assert 'STO15' not in s, 'STO15 left on group sheet'
assert s.count('data-year="2027"') == 8, s.count('data-year="2027"')
io.open(G + '.tmp', 'w', encoding='utf-8').write(s)
os.replace(G + '.tmp', G)

# single sheets: tab-6, tab-1 (after the calendar block) and tab-2
for slug, (name, new, key, single, _) in CAMPS.items():
    F = P('ratesheets/' + single)
    s = io.open(F, encoding='utf-8').read()
    assert 'data-year' not in s and 'setRateYear' not in s
    c = ('block', 'table-wrap', 'raw')
    t26, t27 = tables(slug, '2026', c), tables(slug, '2027', c)
    rates, extras = panes(t26[0], t27[0]), panes(t26[1], t27[1])
    old = re.findall(r'<div class="block"><h3>STO15 Rates — 11\.01\.2026 to 10\.01\.2027</h3>.*?</div></div></div>(?=\s*\n)', s)
    assert len(old) == 2 and old[0] == old[1], (single, len(old))
    s = s.replace(old[0], rates)
    m = re.search(r'(<div id="tab-2" class="tab-content">)(.*?)(</div>\n)', s, re.S)
    assert m
    s = s[:m.start(2)] + extras + s[m.end(2):]
    s = common(s)
    assert s.count('</body>') == 1
    s = s.replace('</body>', SETY + '</body>')
    assert 'STO15' not in s, ('STO15 left', single)
    assert s.count('data-year="2027"') == 3, (single, s.count('data-year="2027"'))
    io.open(F + '.tmp', 'w', encoding='utf-8').write(s)
    os.replace(F + '.tmp', F)
print('sheets: group + 4 single sheets now carry 2026 STO20 and 2027 panes, setRateYear declared')
