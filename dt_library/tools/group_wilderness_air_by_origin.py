#!/usr/bin/env python3
"""Group Wilderness Air seat rates on flight_rates.html under "From <origin>" headings (both years).
Only reorders existing rows and adds heading rows; no figure changes. Idempotent."""
import io, os, re
F = 'flight_rates.html'
s = io.open(F, encoding='utf-8').read()
a = s.index('id="supplier-wildernessair"'); b = s.index('<!-- ACTIONS BAR -->', a)
card = s[a:b]
assert 'wa-from' not in card, 'already grouped'
ORIGINS = [('Windhoek Int. Airport', r'Windhoek Int'), ('Eros Airport', r'Eros Airport'), ('Doro Nawas', r'Doro Nawas'),
           ('Desert Rhino', r'Desert Rhino'), ('Hoanib', r'Hoanib'), ('Serra Cafema', r'Serra Cafema'), ('Ongava', r'Ongava'),
           ('Kulala (Geluk)', r'Kulala ?\(Geluk\)'), ('Sossusvlei Desert Lodge', r'Sos+us+vlei Desert Lodge'),
           ('Swakopmund / Arandis', r'Swakopmund/Arandis')]
HEAD = ('<tr class="wa-from"><td colspan="4" style="background:rgba(164,130,86,.12);font-family:\'Jost\',sans-serif;'
        'font-size:.72rem;letter-spacing:1.5px;text-transform:uppercase;color:#7a5f3c;padding:10px 14px">From %s</td></tr>')
n = 0
def regroup(m):
    global n
    rows = re.findall(r'\s*(<tr><td><strong>(.*?)</strong>.*?</tr>)', m.group(2), re.S)
    groups = {o: [] for o, _ in ORIGINS}
    for row, route in rows:
        origin = route.split(' to ')[0].strip()
        hit = [o for o, pat in ORIGINS if re.fullmatch(pat + r'.*', origin)]
        assert len(hit) == 1, route
        groups[hit[0]].append(row)
    assert sum(map(len, groups.values())) == len(rows) == 36
    ind = '                        '
    out = ''.join('\n' + ind + (HEAD % o) + ''.join('\n' + ind + r for r in groups[o]) for o, _ in ORIGINS if groups[o])
    n += 1
    return m.group(1) + out + '\n                    ' + m.group(3)
card2 = re.sub(r'(<h3>Seat Rates &mdash;.*?<tbody>)(.*?)(</tbody>)', regroup, card, flags=re.S)
assert n == 2
old = sorted(re.findall(r'<tr><td>.*?</tr>', card)); new = sorted(re.findall(r'<tr><td>.*?</tr>', card2))
assert old == new, 'rows changed'
s = s[:a] + card2 + s[b:]
io.open(F + '.tmp', 'w', encoding='utf-8').write(s); os.replace(F + '.tmp', F)
print('grouped seat rates by origin in 2 year blocks')
