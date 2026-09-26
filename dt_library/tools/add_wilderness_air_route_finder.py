#!/usr/bin/env python3
"""Wilderness Air route finder on flight_rates.html: pick From, then To (only places actually flown from there),
and see the 2026 and 2027 agent nett rate.

    cd dt_library && python3 tools/add_wilderness_air_route_finder.py

Every figure is read off Wilderness's own N9 sheets (ratesheets/originals/wilderness_namibia_n9_2026.pdf and
_2027.pdf) and then checked three ways before anything is written: against the same route's row in the
Wilderness Air card already on the page, against the builder feed (assets/providers.json), and 2026 vs 2027 route
lists. Routes the sheet marks "or vice versa" are offered both ways; nothing else is reversed or combined.
Nett rates show only when signed in (Wilderness publishes no rack). Idempotent: refuses to run twice.
"""
import io, json, os, re, subprocess

ROOT = os.getcwd()
P = lambda f: os.path.join(ROOT, f)
PDFS = {'2026': 'ratesheets/originals/wilderness_namibia_n9_2026.pdf',
        '2027': 'ratesheets/originals/wilderness_namibia_n9_2027.pdf'}


def num(s):
    return float(s.replace(',', '').replace(' ', ''))


def read(t):  # same reader as tools/add_wilderness_air.py
    s, e = t.index('WILDERNESS FLYING RATES'), t.index('Wilderness Air Namibia - Lodge Hops')
    seats = []
    for l in t[s:e].split('\n'):
        m = re.match(r'\s*(.+?)\s{2,}Per person, per seat\s+R\s?([\d,]+)\s*$', l)
        if m:
            seats.append((re.sub(r'\s+', ' ', m.group(1)).strip(), num(m.group(2))))
    s, e = e, t.index('Departure Taxes')
    hops, cur = [], None
    for l in t[s:e].split('\n'):
        m = re.search(r'Lodge hop: (.+?)\s{2,}Per plane per flight - Maximum 4\s+(1 - 4 Guests|1 Guest)\s+R\s?([\d, ]+?)\s*$', l)
        if m:
            cur = m.group(1).strip(); hops.append((cur, m.group(2), num(m.group(3)))); continue
        m = re.match(r'\s+(\d Guests)\s+R\s?([\d, ]+?)\s*$', l)
        if m and cur:
            hops.append((cur, m.group(1), num(m.group(2))))
    taxes = [(re.sub(r'\s+', ' ', m.group(1)).strip(), float(m.group(2)))
             for m in re.finditer(r'\n\s*((?:Windhoek|Swakopmund)[^\n]*?departure tax)\s+R([\d.]+)', t)]
    assert len(seats) == 36 and taxes
    return {'seats': seats, 'hops': hops, 'taxes': taxes}


D = {y: read(subprocess.check_output(['pdftotext', '-layout', P(f), '-']).decode('utf-8')) for y, f in PDFS.items()}

PLACES = [('Windhoek Int. Airport', r'Windhoek Int(?:ernational)?\.? ?(?:Airport)?'), ('Eros Airport', r'Eros Airport'),
          ('Doro Nawas', r'Doro!? ?Nawas|DoroN'), ('Desert Rhino', r'Desert Rhino(?: Camp)?|DRC'),
          ('Hoanib', r'Hoanib'), ('Serra Cafema', r'Serra Cafema'), ('Ongava', r'Ongava'), ('Mokuti', r'Mokuti'),
          ('Kulala (Geluk)', r'Kulala ?\(Geluk\)|Geluk'), ('Sossusvlei Desert Lodge', r'Sos+us+vlei Desert(?: Lodge)?'),
          ('Swakopmund / Arandis', r'Swakopmund/Arandis'), ('Purros / Orutjanda', r'Purros/ ?Orutjanda')]


def place(s):
    s = s.strip()
    hit = [n for n, pat in PLACES if re.fullmatch(pat, s)]
    assert len(hit) == 1, (s, hit)
    return hit[0]


def split(route):
    both = bool(re.search(r'\s+or vice versa$', route))
    r = re.sub(r'\s+or vice versa$', '', route)
    a, b = r.split(' to ', 1)
    m = re.match(r'(.+?)\s*\(?\s*via\s*(.+?)\)?$', b)
    via = ''
    if m:
        b, via = m.group(1), m.group(2)
    return place(a), place(b), via.strip(), both


routes = {}
for y in D:
    for label, v in D[y]['seats']:
        a, b, via, both = split(label)
        for f, t in ([(a, b), (b, a)] if both else [(a, b)]):
            k = ('seat', f, t, '')
            r = routes.setdefault(k, {'kind': 'seat', 'from': f, 'to': t, 'via': via, 'label': label, 'p': {}})
            r['p'][y] = v
    for label, g, v in D[y]['hops']:
        a, b, via, both = split(label)
        for f, t in ([(a, b), (b, a)] if both else [(a, b)]):
            k = ('hop', f, t, g)
            r = routes.setdefault(k, {'kind': 'hop', 'from': f, 'to': t, 'via': via, 'label': label, 'guests': g, 'p': {}})
            r['p'][y] = v

# ---- checks
page = io.open(P('flight_rates.html'), encoding='utf-8').read()
a = page.index('id="supplier-wildernessair"'); card = page[a:page.index('<!-- ACTIONS BAR -->', a)]
assert 'wa-finder' not in card, 'already added'
money = lambda n: 'N$ {:,.2f}'.format(n) if n % 1 else 'N$ {:,.0f}'.format(n)
E = lambda s: s.replace('&', '&amp;').replace('<', '&lt;')
for y in D:
    i26, i27 = card.index('data-year="2026"'), card.index('data-year="2027"')
    blk = card[i26:i27] if y == '2026' else card[i27:]
    for label, v in D[y]['seats']:
        assert re.search(r'<strong>%s</strong></td><td class="info-col">Per person, per seat</td><td class="price-highlight sto-col">%s</td>'
                         % (re.escape(E(label)), re.escape(money(v))), blk), ('page differs', y, label)
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower().replace('sosussvlei', 'sossusvlei').replace('doron,', 'doronawas,'))
prov = json.load(io.open(P('assets/providers.json'), encoding='utf-8'))
feed = {norm(i['n']): i for f in prov['flights'] if f['name'] == 'Wilderness Air Namibia' for i in f['items']}
for label, v in D['2026']['seats']:
    assert feed[norm(label)]['p'] == v, label
for label, v in D['2027']['seats']:
    assert feed[norm(label)]['p27'] == v, label
seat = [r for r in routes.values() if r['kind'] == 'seat']
assert all(set(r['p']) == {'2026', '2027'} for r in seat), 'a seat route is on one sheet only'

data = {'routes': sorted(routes.values(), key=lambda r: (r['from'], r['to'], r['kind'], r.get('guests', ''))),
        'taxes': {y: D[y]['taxes'] for y in D}}
places_from = sorted({r['from'] for r in routes.values()})

HTML = '''
            <div class="wa-finder" id="wa-finder">
                <h3>Route finder</h3>
                <p class="wa-f-intro">Choose where the guests fly from, then where to. Only routes on Wilderness&rsquo;s own sheet are offered.</p>
                <div class="wa-f-row">
                    <label>From<select id="wa-from"><option value="">Select&hellip;</option>%s</select></label>
                    <label>To<select id="wa-to" disabled><option value="">Choose From first</option></select></label>
                </div>
                <div id="wa-result" class="wa-f-result" aria-live="polite"></div>
            </div>
<style>
.wa-finder{border:1px solid rgba(135,169,150,.45);background:rgba(135,169,150,.08);border-radius:6px;padding:18px 20px;margin:6px 0 26px}
.wa-finder h3{margin:0 0 4px}
.wa-f-intro{font-size:.85rem;color:#7A7269;margin:0 0 12px}
.wa-f-row{display:flex;gap:14px;flex-wrap:wrap}
.wa-f-row label{display:flex;flex-direction:column;gap:5px;font-size:.68rem;letter-spacing:1.5px;text-transform:uppercase;color:#5f7f72;flex:1 1 240px}
.wa-f-row select{font:inherit;font-size:.95rem;letter-spacing:0;text-transform:none;color:#2C2824;padding:10px 12px;border:1px solid rgba(135,169,150,.6);border-radius:4px;background:#fff}
.wa-f-result{margin-top:14px}
.wa-f-result table{width:100%%;border-collapse:collapse;font-size:.92rem}
.wa-f-result th,.wa-f-result td{text-align:left;padding:8px 10px;border-bottom:1px solid rgba(184,149,106,.2)}
.wa-f-result th{font-size:.66rem;letter-spacing:1.5px;text-transform:uppercase;color:#7A7269;font-weight:500}
.wa-f-result .pr{font-weight:600;color:#2C2824;white-space:nowrap}
.wa-f-note{font-size:.8rem;color:#7A7269;margin:10px 0 0}
</style>
<script>
(function(){
  var WA=%s;
  var agent=false; try{agent=!!sessionStorage.getItem('nr_agent_token');}catch(e){}
  var f=document.getElementById('wa-from'), t=document.getElementById('wa-to'), out=document.getElementById('wa-result');
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function money(n){return 'N$ '+Number(n).toLocaleString('en-US',{minimumFractionDigits:(n%%1?2:0),maximumFractionDigits:2});}
  function price(r,y){ if(r.p[y]==null) return '<span style="color:#8a8175;font-style:italic">not on the '+y+' sheet</span>';
    return agent? '<span class="pr">'+money(r.p[y])+'</span>' : '<span style="color:#8a8175;font-style:italic">sign in to see</span>'; }
  f.addEventListener('change',function(){
    out.innerHTML=''; var seen={}, opts=[];
    WA.routes.forEach(function(r){ if(r.from===f.value && !seen[r.to]){ seen[r.to]=1; opts.push(r.to); } });
    opts.sort();
    t.innerHTML = f.value ? '<option value="">Select&hellip;</option>'+opts.map(function(o){return '<option>'+esc(o)+'</option>';}).join('') : '<option value="">Choose From first</option>';
    t.disabled=!f.value;
  });
  t.addEventListener('change',function(){
    if(!t.value){out.innerHTML='';return;}
    var rs=WA.routes.filter(function(r){return r.from===f.value && r.to===t.value;});
    var h='<table><thead><tr><th>Route on the sheet</th><th>Basis</th><th>2026</th><th>2027</th></tr></thead><tbody>';
    rs.forEach(function(r){
      var basis = r.kind==='seat' ? 'Per person, per seat' : ('Lodge hop &middot; per plane &middot; '+esc(r.guests));
      h+='<tr><td>'+esc(r.label)+(r.via?'<br><span style="font-size:.8rem;color:#7A7269">via '+esc(r.via)+'</span>':'')+'</td><td>'+basis+'</td><td>'+price(r,'2026')+'</td><td>'+price(r,'2027')+'</td></tr>';
    });
    h+='</tbody></table>';
    var tx=WA.taxes['2026'].map(function(x,i){var x7=(WA.taxes['2027']||[])[i];return esc(x[0])+' '+money(x[1])+(x7&&x7[1]!==x[1]?' (2027: '+money(x7[1])+')':'');});
    h+='<p class="wa-f-note">Seat rates exclude departure taxes, charged per person where they apply: '+tx.join('; ')+'.'
      +(agent?'':' Wilderness publishes agent nett rates only.')+'</p>';
    out.innerHTML=h;
  });
})();
</script>
''' % (''.join('<option>%s</option>' % E(p) for p in places_from), json.dumps(data, ensure_ascii=False))

anchor = '\n            <div class="year-block" data-year="2026">'
assert card.count(anchor) == 1
card2 = card.replace(anchor, HTML + anchor, 1)
page = page[:a] + card2 + page[a + len(card):]
io.open(P('flight_rates.html') + '.tmp', 'w', encoding='utf-8').write(page)
os.replace(P('flight_rates.html') + '.tmp', P('flight_rates.html'))
print('route finder added: %d From places, %d seat routes, %d hop lines; page + feed checked'
      % (len(places_from), len(seat), len(routes) - len(seat)))
