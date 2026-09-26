#!/usr/bin/env python3
"""Add Wilderness Air Namibia to namibiarates' Flights page and the agent portal's Flights menu.

Source: Wilderness's own "Namibia Agent Nett Rates" (N9) sheets, kept in ratesheets/originals/:
  wilderness_namibia_n9_2026.pdf  (valid 06-Jan-2026 to 05-Jan-2027)
  wilderness_namibia_n9_2027.pdf  (valid 06-Jan-2027 to 05-Jan-2028)
Read with pdftotext: seat rates (per person, per seat), lodge hops (per plane) and departure taxes.
The builder feed (assets/providers.json -> flights "Wilderness Air Namibia") already holds the same 36 seat
rates for both years; this script checks them against the sheets and stops on any difference.
Run from dt_library/. Idempotent: refuses to run twice.
"""
import io, json, os, re, subprocess

ROOT = os.getcwd()
P = lambda f: os.path.join(ROOT, f)
KEY = 'wildernessair'
PDFS = {'2026': 'ratesheets/originals/wilderness_namibia_n9_2026.pdf',
        '2027': 'ratesheets/originals/wilderness_namibia_n9_2027.pdf'}


def text(f):
    return subprocess.check_output(['pdftotext', '-layout', P(f), '-']).decode('utf-8')


def num(s):
    return float(s.replace(',', '').replace(' ', ''))


def read(t):
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
            cur = m.group(1).strip()
            hops.append((cur, m.group(2), num(m.group(3))))
            continue
        m = re.match(r'\s+(\d Guests)\s+R\s?([\d, ]+?)\s*$', l)
        if m and cur:
            hops.append((cur, m.group(1), num(m.group(2))))
    taxes = [(re.sub(r'\s+', ' ', m.group(1)).strip(), float(m.group(2)))
             for m in re.finditer(r'\n\s*((?:Windhoek|Swakopmund)[^\n]*?departure tax)\s+R([\d.]+)', t)]
    valid = re.search(r'VALIDITY: (\S+) to (\S+)', t).groups()
    assert len(seats) == 36 and taxes, (len(seats), taxes)
    return {'seats': seats, 'hops': hops, 'taxes': taxes, 'valid': valid}


D = {y: read(text(f)) for y, f in PDFS.items()}

# ---- check the builder feed against the sheets
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower().replace('sosussvlei', 'sossusvlei').replace('doron,', 'doronawas,'))
prov = json.load(io.open(P('assets/providers.json'), encoding='utf-8'))
wa = [f for f in prov['flights'] if f['name'] == 'Wilderness Air Namibia']
assert len(wa) == 1
sheet = {y: {norm(n): v for n, v in D[y]['seats']} for y in D}
for it in wa[0]['items']:
    k = norm(it['n'])
    assert sheet['2026'].get(k) == it['p'] and sheet['2027'].get(k) == it['p27'], ('feed differs from sheet', it)


def money(n):
    return 'N$ {:,.2f}'.format(n) if n % 1 else 'N$ {:,.0f}'.format(n)


def E(s):
    return s.replace('&', '&amp;').replace('<', '&lt;')


def block(y):
    d = D[y]
    seats = '\n'.join('                        <tr><td><strong>%s</strong></td><td class="info-col">Per person, per seat</td>'
                      '<td class="price-highlight sto-col">%s</td><td class="rack-col">Not published</td></tr>' % (E(n), money(v))
                      for n, v in d['seats'])
    hops = '\n'.join('                        <tr><td><strong>%s</strong></td><td class="info-col">%s &middot; per plane, max 4</td>'
                     '<td class="price-highlight sto-col">%s</td><td class="rack-col">Not published</td></tr>' % (E(r), g, money(v))
                     for r, g, v in d['hops'])
    taxes = '\n'.join('                        <tr><td><strong>%s</strong></td><td class="info-col">Per person, prepaid to Wilderness</td>'
                      '<td class="price-highlight sto-col">%s</td><td class="rack-col">%s</td></tr>' % (E(n), money(v), money(v))
                      for n, v in d['taxes'])
    return '''            <div class="year-block" data-year="%s">
            <h3>Seat Rates &mdash; valid %s to %s</h3>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr><th>Route</th><th class="info-col">Basis</th><th class="sto-col">Agent Nett Rate</th><th class="rack-col">Rack Rate</th></tr>
                    </thead>
                    <tbody>
%s
                    </tbody>
                </table>
            </div>

            <h3>Lodge Hops &mdash; per plane per flight</h3>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr><th>Route</th><th class="info-col">Guests</th><th class="sto-col">Agent Nett Rate</th><th class="rack-col">Rack Rate</th></tr>
                    </thead>
                    <tbody>
%s
                    </tbody>
                </table>
            </div>

            <h3>Departure Taxes &mdash; added to every seat rate where applicable</h3>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr><th>Airport</th><th class="info-col">Basis</th><th class="sto-col">Rate</th><th class="rack-col">Rate</th></tr>
                    </thead>
                    <tbody>
%s
                    </tbody>
                </table>
            </div>
            </div>
''' % (y, d['valid'][0], d['valid'][1], seats, hops, taxes)


card = '''
        <!-- ============================================== -->
        <!-- WILDERNESS AIR NAMIBIA -->
        <!-- ============================================== -->
        <div class="rate-card" data-years="2026 2027" id="supplier-%s">
            <div class="supplier-info">
                <div class="supplier-details">
                    <h2>Wilderness Air Namibia</h2>
                    <p>Wilderness&rsquo;s scheduled light-aircraft circuit through Doro Nawas, linking Windhoek (Hosea Kutako and Eros), Sossusvlei (Geluk), Swakopmund/Arandis, Damaraland, Hoanib, Purros, Serra Cafema and Ongava &mdash; plus per-plane lodge hops to third-party areas.</p>
                </div>
                <div class="supplier-quick-spec">
                    <div class="spec-item"><span class="spec-label">Commission Model</span><span class="spec-value">Agent nett (no rack published)</span></div>
                    <div class="spec-item"><span class="spec-label">Coverage</span><span class="spec-value">Namibia</span></div>
                    <div class="spec-item"><span class="spec-label">Validity</span><span class="spec-value">06 Jan 2026 &ndash; 05 Jan 2027 &middot; 06 Jan 2027 &ndash; 05 Jan 2028</span></div>
                    <div class="spec-item"><span class="spec-label">Currency</span><span class="spec-value">Rand = N$ (1:1)</span></div>
                </div>
            </div>

%s
%s
            <h3>Conditions</h3>
            <ul>
                <li>Rates are agent nett, quoted in South African Rand (1 Rand = 1 Namibian Dollar), per person per seat, and can be used vice versa. Wilderness publishes no rack rate for these flights.</li>
                <li>Seat rates may be booked on their own &mdash; they no longer have to be booked with Wilderness accommodation. The Desert Rhino Camp to Kulala flight is part of a circuit and carries no charge.</li>
                <li>Departure taxes are excluded from all seat rates (R50 of the Windhoek International and Eros tax is the Namibia Airports Company security tax).</li>
                <li>Routes not on the circuit are sole-use charters &mdash; ask your Wilderness Travel Designer. Some flights have 2 or 3 stops and guests may change aircraft.</li>
                <li>Lodge hops: no set times (guests are told in camp the night before); maximum 4 guests, extra seats on request. The 2027 sheet lists no Ongava&ndash;Mokuti hop.</li>
                <li>Swakopmund is often closed by fog; the aircraft then uses Arandis and guests are transferred by road.</li>
                <li>Luggage: soft bags only, max 20 kg per person including hand luggage, max 30 &times; 35 &times; 70 cm. Extra 20 kg: NAD 2,500 per sector if pre-booked. Weights of guests over 100 kg are needed in advance.</li>
                <li>Rates may change with taxes, navigation and landing fees, fuel prices or other costs outside Wilderness&rsquo;s control.</li>
            </ul>
        </div>
''' % (KEY, block('2026'), block('2027'))

# ---------------------------------------------------------------- flight_rates.html
ff = P('flight_rates.html')
s = io.open(ff, encoding='utf-8').read()
assert 'supplier-%s' % KEY not in s, 'already added'
a = "            mackair:'https://wetu.com/imageHandler/c1920x1080/126088/hoanib_valley_camp_-_aerial_view.jpg?fmt=jpg'\n"
assert s.count(a) == 1
s = s.replace(a, a.rstrip('\n') + ",\n            %s:'https://wetu.com/imageHandler/c1920x1080/28944/1741354188743_Final-Hoanib-40.jpg?fmt=jpg'\n" % KEY)
b = """            <button class="tab-link active" onclick="switchSupplier('mackair', this)">Mack Air</button>\n"""
assert s.count(b) == 1
s = s.replace(b, b + """            <button class="tab-link" onclick="switchSupplier('%s', this)">Wilderness Air Namibia</button>\n""" % KEY)
c = '\n        <!-- ACTIONS BAR -->'
assert s.count(c) == 1
s = s.replace(c, card + c)
for y in D:
    for n, v in D[y]['seats']:
        assert money(v) in s
io.open(ff + '.tmp', 'w', encoding='utf-8').write(s)
os.replace(ff + '.tmp', ff)

# ---------------------------------------------------------------- namibia_agent_portal.html (Flights menu)
nf = P('namibia_agent_portal.html')
s = io.open(nf, encoding='utf-8').read()
assert "openFlightRates('%s')" % KEY not in s
d = """                        <a href="#" onclick="openFlightRates('mackair'); return false;">Mack Air</a>\n                    </div>\n"""
assert s.count(d) == 1, s.count(d)
s = s.replace(d, d + """                    <div class="dropdown-column">
                        <div style="font-family:'Jost',sans-serif;font-size:.58rem;letter-spacing:1.5px;text-transform:uppercase;color:#a48256;margin:10px 14px 4px;opacity:.95;">Namibia</div>
                        <a href="#" onclick="openFlightRates('%s'); return false;">Wilderness Air Namibia</a>
                    </div>
""" % KEY)
io.open(nf + '.tmp', 'w', encoding='utf-8').write(s)
os.replace(nf + '.tmp', nf)
print('Wilderness Air added: %d seat rates x 2 years, %d + %d lodge-hop lines, %d taxes; feed checked'
      % (len(D['2026']['seats']), len(D['2026']['hops']), len(D['2027']['hops']), len(D['2026']['taxes'])))
