#!/usr/bin/env python3
"""Add Sandy Horizon (Swakopmund / Walvis Bay excursions) to namibiarates' agent activities.

Source: Sandy Horizon's "2027 RATES 20%" PDF (Canva, created 16 Sep 2026), sent by Jaun 26 Sep 2026.
  Rack:  Half-day Sandwich Harbour AM & PM 3150.00 per seat · Full-day Sandwich Harbour 14400.00 per vehicle ·
         Marine & Sandwich Harbour Combo 4800.00 per seat · Kayak & Sandwich Harbour Combo 4800.00 per seat ·
         Living Desert Combo 4250.00 per seat
  STO:   2520.00 · 11520.00 · 3840.00 · 3840.00 · 3400.00   (every line STO/rack = 0.80, so 20% STO)
  "All above rates are VAT Inclusive". The sheet gives no 2026 rates and no dates beyond "2027".
Touches: assets/providers.json (builder), activity_rates.html (tab + rate card), namibia_agent_portal.html
         (Activities dropdown + Swakopmund card). Run from dt_library/. Idempotent: refuses to run twice.
"""
import io, json, os

ROOT = os.getcwd()
P = lambda f: os.path.join(ROOT, f)
KEY = 'sandyhorizon'

RATES = [  # label, rack, sto, unit, note — figures exactly as printed
    ('Half-day Sandwich Harbour (AM or PM)', 3150.00, 2520.00, 'per seat', 'AM or PM'),
    ('Full-day Sandwich Harbour', 14400.00, 11520.00, 'per vehicle', 'Private vehicle, up to 4 people'),
    ('Marine & Sandwich Harbour Combo', 4800.00, 3840.00, 'per seat', ''),
    ('Kayak & Sandwich Harbour Combo', 4800.00, 3840.00, 'per seat', ''),
    ('Living Desert Combo', 4250.00, 3400.00, 'per seat', ''),
]
for lab, rack, sto, unit, _ in RATES:
    assert round(sto / rack, 4) == 0.8, lab   # the sheet's 20% holds on every line

# ---------------------------------------------------------------- providers.json
pj = P('assets/providers.json')
prov = json.load(io.open(pj, encoding='utf-8'))
assert not any(p['name'] == 'Sandy Horizon' for p in prov['activities']), 'Sandy Horizon already loaded'
prov['activities'].append({
    'name': 'Sandy Horizon',
    'region': 'Swakopmund',
    'items': [{'n': '%s — %s' % (lab, unit),
               'd': ('Sandy Horizon, 2027 rack and 20% STO, VAT inclusive.' + (' ' + note + '.' if note else '')),
               'p': None, 'p27': sto, 'r': None, 'r27': rack} for lab, rack, sto, unit, note in RATES],
    'y27': "Sandy Horizon's own 2027 rate sheet (16 Sep 2026): rack and 20% STO. No 2026 rate loaded.",
})
tmp = pj + '.tmp'
io.open(tmp, 'w', encoding='utf-8').write(json.dumps(prov, ensure_ascii=False))
json.load(io.open(tmp, encoding='utf-8'))
os.replace(tmp, pj)

# ---------------------------------------------------------------- activity_rates.html
def money(n):
    return 'N$ {:,.2f}'.format(n)

af = P('activity_rates.html')
s = io.open(af, encoding='utf-8').read()
assert 'supplier-%s' % KEY not in s

a = "            sh4x4:'https://wetu.com/imageHandler/c1920x1080/91389/fvl_birdlife_mr0031.jpg?fmt=jpg',\n"
assert s.count(a) == 1
s = s.replace(a, a + "            %s:'https://wetu.com/imageHandler/c1920x1080/91389/fvl_birdlife_mr0031.jpg?fmt=jpg',\n" % KEY)

b = """            <button class="tab-link" onclick="switchSupplier('sh4x4', this)">Sandwich Harbour 4x4</button>\n"""
assert s.count(b) == 1
s = s.replace(b, b + """            <button class="tab-link" onclick="switchSupplier('%s', this)">Sandy Horizon</button>\n""" % KEY)

rows = '\n'.join(
    '                        <tr><td><strong>%s</strong><br><small>%s</small></td><td class="info-col">%s</td>'
    '<td class="price-highlight sto-col">%s</td><td class="rack-col">%s</td></tr>'
    % (lab.replace('&', '&amp;'), unit.capitalize(), note or '&mdash;', money(sto), money(rack))
    for lab, rack, sto, unit, note in RATES)

card = '''
        <!-- ============================================== -->
        <!-- SANDY HORIZON -->
        <!-- ============================================== -->
        <div class="rate-card" data-years="2027" id="supplier-%s">
            <div class="supplier-info">
                <div class="supplier-details">
                    <h2>Sandy Horizon</h2>
                    <p>Sandwich Harbour 4x4 excursions from Swakopmund and Walvis Bay &mdash; half-day morning or afternoon trips, a private full day, and combos with a marine cruise, kayaking or the Living Desert tour.</p>
                </div>
                <div class="supplier-quick-spec">
                    <div class="spec-item"><span class="spec-label">Commission Model</span><span class="spec-value">20%% STO</span></div>
                    <div class="spec-item"><span class="spec-label">Location</span><span class="spec-value">Swakopmund &amp; Walvis Bay</span></div>
                    <div class="spec-item"><span class="spec-label">Validity</span><span class="spec-value">2027 (dates not stated on the sheet)</span></div>
                    <div class="spec-item"><span class="spec-label">Contact</span><span class="spec-value">info@sandyhorizon.com &middot; 081 313 0640</span></div>
                </div>
            </div>

            <div class="table-responsive">
                <table>
                    <thead>
                        <tr><th>Excursion</th><th class="info-col">Departure</th><th class="sto-col">STO Nett Rate</th><th class="rack-col">Rack Rate</th></tr>
                    </thead>
                    <tbody>
%s
                    </tbody>
                </table>
            </div>

            <h3>Inclusions &amp; Transfers</h3>
            <ul>
                <li>All rates are VAT inclusive.</li>
                <li>Sandwich Harbour tours include free transfers from Swakopmund and Walvis Bay all year. Marine cruises and marine combos include free transfers from both towns.</li>
                <li>Living Desert tours include transfers from Swakopmund only.</li>
                <li>Kayak combos: free transfers in the off-season; in high season (June&ndash;September) guests make their own way to Walvis Bay (Sandy Horizon sends directions).</li>
                <li>Tours are shared. A private Sandwich Harbour tour is charged at the normal rate &times; 4; other private arrangements on request.</li>
                <li>Full-day excursions only as a private vehicle (up to 4 people).</li>
            </ul>

            <h3>Child Rates</h3>
            <ul>
                <li>Off-peak (October to June): 0&ndash;3 years free; under 10 years 50%% of the adult rate; 10 years and older full adult rate.</li>
                <li>Peak (July to September): all children pay full price.</li>
            </ul>

            <h3>Bookings &amp; Cancellations</h3>
            <ul>
                <li>A booking is confirmed only once Sandy Horizon sends a confirmation with the tour, guest names and pick-up time; they reconfirm in the week of the activity.</li>
                <li>Cancelled more than 24 hours before departure: no fee. Within 24 hours or no-show: 100%%.</li>
                <li>Emails are answered 08:00&ndash;17:00, Monday to Friday. After hours and weekends: duty phone +264 81 313 0640.</li>
                <li>info@sandyhorizon.com &middot; sandyhorizon.com</li>
            </ul>
        </div>
''' % (KEY, rows)

c = '''
        <!-- ============================================== -->
        <!-- SOLITAIRE ACTIVITY CENTRE -->'''
assert s.count(c) == 1
s = s.replace(c, card + c)
for lab, rack, sto, unit, note in RATES:
    assert money(rack) in s and money(sto) in s
io.open(af + '.tmp', 'w', encoding='utf-8').write(s)
os.replace(af + '.tmp', af)

# ---------------------------------------------------------------- namibia_agent_portal.html
nf = P('namibia_agent_portal.html')
s = io.open(nf, encoding='utf-8').read()
assert "openActivityRates('%s')" % KEY not in s
d = """                        <a href="#" onclick="openActivityRates('sandwaves'); return false;">Sand Waves</a>\n"""
assert s.count(d) == 1
s = s.replace(d, d + """                        <a href="#" onclick="openActivityRates('%s'); return false;">Sandy Horizon</a>\n""" % KEY)

anchor = """                            <div class="activity-item" onclick="openActivityRates('namcharters')\""""
assert s.count(anchor) == 1
item = ('''                            <div class="activity-item" onclick="openActivityRates('%s')" style="border: 1px solid rgba(0,0,0,0.05); padding: 15px; border-radius: 8px; cursor: pointer; position: relative;">
                                <div style="font-weight: 600; font-family: var(--font-head); color: var(--brand-charcoal);" class="activity-title">Sandy Horizon</div>
                                <p style="font-size: 0.75rem; color: var(--text-muted); margin: 5px 0 10px 0;">Half-day and private full-day Sandwich Harbour 4x4 trips, and combos with a marine cruise, kayaking or the Living Desert tour. 2027 rack and 20%% STO.</p>
                                <button class="lodge-btn" style="position: absolute; bottom: 10px; right: 10px; padding: 5px 12px; font-size: 0.75rem;">Rates</button>
                            </div>
''' % KEY)
s = s.replace(anchor, item + anchor)
io.open(nf + '.tmp', 'w', encoding='utf-8').write(s)
os.replace(nf + '.tmp', nf)
print('Sandy Horizon added: providers.json, activity_rates.html, namibia_agent_portal.html')
