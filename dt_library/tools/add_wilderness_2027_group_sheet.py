#!/usr/bin/env python3
"""Give the signed-in Wilderness group sheet (ratesheets/wilderness_ratesheet_v3.html) its 2027 season.

    cd dt_library && python3 tools/add_wilderness_2027_group_sheet.py

The sheet is static and held 2026 only, with no year panes, so the agent area's Wilderness group view never
showed 2027 (the lodge pages read the API and did). This wraps each camp's existing rates and extras in a 2026
pane, adds a 2027 pane read off ratesheets/originals/wilderness_namibia_n9_2027.pdf, and declares
window.setRateYear (same pattern as the Gondwana sheet) so the season pills switch panes instead of blanking.
2026 content is left exactly as it was. Idempotent: refuses to run twice.
"""
import datetime, io, os, re, subprocess

ROOT = os.getcwd()
P = lambda f: os.path.join(ROOT, f)
F = P('ratesheets/wilderness_ratesheet_v3.html')
PDF = P('ratesheets/originals/wilderness_namibia_n9_2027.pdf')
FIG = r'R\s?((?:\d{1,3}(?:[ ,]\d{3})+|\d+)(?:\.\d\d)?)(?![\d])'
KEYS = {'wildernessdoronawas': ('Wilderness Doro Nawas', 'Adventures'),
        'wildernesskulaladesertlodge': ('Wilderness Kulala Desert Lodge', 'Adventures'),
        'wildernessdamaralandcamp': ('Wilderness Damaraland', 'Classic'),
        'wildernessdesertrhinocamp': ('Wilderness Desert Rhino', 'Classic'),
        'wildernessserracafema': ('Wilderness Serra Cafema', 'Classic'),
        'wildernesshoanibskeletoncoastcamp': ('Wilderness Hoanib Skeleton Coast', 'Classic'),
        'wildernesslittlekulala': ('Wilderness Little Kulala', 'Classic')}
BALLOON = ('Wilderness Kulala Desert Lodge', 'Wilderness Little Kulala')


def num(s):
    return float(s.replace(' ', '').replace(',', ''))


def seasons(lines, i):
    for k in range(i, i + 6):
        a = re.findall(r'(\d{1,2}-[A-Z][a-z]{2}-\d\d) to', lines[k])
        if a:
            b = re.findall(r'(\d{1,2}-[A-Z][a-z]{2}-\d\d)', lines[k + 1])
            f = lambda s: datetime.datetime.strptime(s, '%d-%b-%y').strftime('%d %b')
            return ['%s – %s' % (f(x), f(y)) for x, y in zip(a, b)], k + 2


def accommodation(lines, title, basis):
    i = next(n for n, l in enumerate(lines) if l.strip().startswith(title))
    seas, k = seasons(lines, i)
    out = {}
    while not lines[k].strip().startswith('Notes'):
        for camp, _ in KEYS.values():
            if re.search(re.escape(camp) + r'\s+' + basis + r'\s+Per person, sharing', lines[k]):
                pps = [num(x) for x in re.findall(FIG, lines[k])]
                sup = [num(x) for x in re.findall(FIG, lines[k + 1])]
                assert 'Single supplement' in lines[k + 1] and len(pps) == len(sup) == len(seas), camp
                out[camp] = (seas, pps, sup)
        k += 1
    return out


def one(t, pat):
    m = re.findall(pat, t)
    assert len(m) == 1, pat
    return num(m[0])


t = subprocess.check_output(['pdftotext', '-layout', PDF, '-']).decode('utf-8')
L = t.split('\n')
valid = re.search(r'VALIDITY: (\S+) to (\S+)', t).groups()
assert valid == ('06-Jan-2027', '05-Jan-2028'), valid
FI, DBB = accommodation(L, 'ACCOMMODATION ON FI BASIS', 'FI'), accommodation(L, 'ACCOMMODATION ON DBB BASIS', 'DBB')
X = {'lunch': one(t, r'Lunch at camp\s+' + FIG), 'packed': one(t, r'Packed lunch\s+' + FIG),
     'private': one(t, r'Private activities at Classic camps\s+' + FIG),
     'guide': one(t, r'Pilot / guide accommodation is ' + FIG),
     'pm': one(t, r'Scheduled afternoon drive\s+per person\s+' + FIG),
     'am': one(t, r'Scheduled morning drive\s+per person\s+' + FIG)}
i = next(n for n, l in enumerate(L) if 'SOSSUSVLEI BALLOONING EXCURSION' in l)
bs, k = seasons(L, i)
brow = next(l for l in L[k:k + 6] if 'Ballooning Safari' in l)
BAL = list(zip(bs, [num(x) for x in re.findall(FIG, brow)]))
assert len(FI) == 7 and len(DBB) == 3 and len(BAL) == len(bs)

money = lambda n: '{:,.2f}'.format(n)
ROW = '<tr><td><strong>%s</strong></td><td style="text-align:right">%s</td></tr>'
HEAD = '<div class="table-wrap"><table><thead><tr><th>Rate</th><th style="text-align:right">%s</th></tr></thead><tbody>%s</tbody></table></div>'


def acc_table(seas, pps, sup):
    rows = [ROW % ('PP Sharing — %s' % s, money(p)) for s, p in zip(seas, pps)]
    rows += [ROW % ('Single Supplement — %s' % s, money(v)) for s, v in zip(seas, sup)]
    return HEAD % ('N$ pp / night', ''.join(rows))


def tab1_2027(camp):
    h = ('<div class="block"><h3>2027 Rates</h3><p class="raw">Per person per night. Wilderness Namibia agent nett '
         'rates, valid 06 Jan 2027 – 05 Jan 2028 (Rand = N$ 1:1).</p>')
    h += '<div class="sub-block"><h4>Fully Inclusive</h4>%s</div>' % acc_table(*FI[camp])
    if camp in DBB:
        h += '<div class="sub-block"><h4>Dinner, Bed &amp; Breakfast</h4>%s</div>' % acc_table(*DBB[camp])
    return h + '</div>'


def tab2_2027(camp, cat):
    rows = []
    if camp == 'Wilderness Damaraland':
        rows += [ROW % ('Scheduled Morning Drive — pp', money(X['am'])), ROW % ('Scheduled Afternoon Drive — pp', money(X['pm']))]
    if camp in DBB:
        rows += [ROW % ('Lunch at camp (DBB) — pp', money(X['lunch'])), ROW % ('Packed lunch (DBB) — pp', money(X['packed']))]
    if camp in BALLOON:
        rows += [ROW % ('Sossusvlei Ballooning Safari %s — pp (min 2)' % s, money(v)) for s, v in BAL]
    if cat == 'Classic':
        rows.append(ROW % ('Private activities — per party per night (max 6)', money(X['private'])))
    rows.append(ROW % ('Pilot / guide accommodation — per night', money(X['guide'])))
    note = ''
    if camp in BALLOON:
        note = '<p class="raw" style="font-size:.85rem">The 2027 sheet lists ballooning up to 30 June 2027 only.</p>'
    return ('<div class="block"><h3>2027 Activities &amp; Extras</h3><p class="raw">Camp activities and lunches are nett '
            'and non-commissionable.</p>%s%s</div>' % (HEAD % ('N$', ''.join(rows)), note))


s = io.open(F, encoding='utf-8').read()
assert 'data-year="2027"' not in s, 'already added'
for key, (camp, cat) in KEYS.items():
    a = s.index('    %s: {' % key)
    b = s.index('\n    }', a)
    blk = blk0 = s[a:b]
    for tab, new in (('tab1', tab1_2027(camp)), ('tab2', tab2_2027(camp, cat))):
        m = re.search(tab + r': `(.*?)`', blk, re.S)
        assert m and '`' not in new and '${' not in new
        wrapped = ('<div class="year-pane" data-year="2026">%s</div><div class="year-pane" data-year="2027" '
                   'style="display:none">%s</div>' % (m.group(1), new))
        blk = blk[:m.start(1)] + wrapped + blk[m.end(1):]
    s = s[:a] + blk + s[b:]

JS = '''/* site-chrome's season pills hide every table on a page that does not declare a year. Declaring
   setRateYear makes hasNative() true, so site-chrome calls this and the sheet drives its own panes. */
window.NR_YEAR = window.NR_YEAR || '2026';
window.setRateYear = function(y){
  y = String(y||'2026');
  window.NR_YEAR = y;
  try{
    document.querySelectorAll('.year-pane[data-year]').forEach(function(p){ p.style.display = (p.getAttribute('data-year')===y) ? '' : 'none'; });
    document.querySelectorAll('table').forEach(function(t){
      var w=(t.closest&&t.closest('.table-responsive, .table-wrap'))||t;
      if(w.getAttribute('data-nr-open')!=null){w.style.display=w.getAttribute('data-nr-open');w.removeAttribute('data-nr-open');}
    });
  }catch(e){}
};
'''
anchor = 'function parseTab1(htmlString) {'
assert s.count(anchor) == 1
s = s.replace(anchor, JS + anchor)
call = "t6.innerHTML=d.tab1;})();switchTab(6);"
assert s.count(call) == 1, s.count(call)
s = s.replace(call, "t6.innerHTML=d.tab1;})();try{window.setRateYear(window.NR_YEAR||'2026');}catch(e){}switchTab(6);")

# every 2027 figure written is on the 2027 sheet
figs = {p for v in FI.values() for p in v[1] + v[2]} | {p for v in DBB.values() for p in v[1] + v[2]} | set(X.values()) | {v for _, v in BAL}
for pane in re.findall(r'data-year="2027" style="display:none">(.*?)</div></div>(?=`)', s, re.S):
    for v in re.findall(r'text-align:right">([\d,]+\.\d\d)<', pane):
        assert num(v) in figs, v
assert s.count('data-year="2027"') == 14 and s.count('data-year="2026"') == 14

io.open(F + '.tmp', 'w', encoding='utf-8').write(s)
os.replace(F + '.tmp', F)
print('Wilderness group sheet: 2027 panes added for %d camps; setRateYear declared' % len(KEYS))
