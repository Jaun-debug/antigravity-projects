#!/usr/bin/env python3
"""Every region page without a map yet: Leaflet map of the lodges above the cards (same look as the Delta / Chobe maps).

    cd dt_library && python3 tools/region_area_map.py

Pins: tools/region_lodge_coords.json (Google Places via places_search, 7 Oct 2026, place ids kept).
- Lodges with no Places match get no pin and are listed under the map ("Not on the map yet").
- Lodges more than FAR km from the page's median point are left off too (listed), so one stray listing
  does not zoom the whole map out.
- Lodges within ~200 m of each other share one pin; the tooltip/popup lists them all.
- Pages with area sections (.area-sec) get the area buttons under the map in place of the old tab row.
Rollback: <page>.bak_areamap
"""
import html, io, json, math, os, re, shutil, statistics

MARK = 'REGION-AREA-MAP'
FAR = 700
DATA = json.load(io.open('tools/region_lodge_coords.json', encoding='utf-8'))['regions']

def unesc(t):
    while True:
        u = html.unescape(t)
        if u == t: return t
        t = u
norm = lambda n: re.sub(r'[^a-z0-9]', '', unesc(n).lower())
def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))

CSS = '''<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
<style>
.area-map-wrap{margin:0 0 30px}
#area-map{height:460px;border-radius:12px;overflow:hidden;border:1px solid rgba(164,130,86,.25);background:#2b2b2b}
@media (max-width:700px){#area-map{height:340px}}
.area-legend{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 0}
.area-legend button{font:inherit;font-size:.74rem;letter-spacing:.5px;padding:6px 13px;border-radius:4px;border:1px solid rgba(135,169,150,.7);background:rgba(135,169,150,.10);color:#5f7f72;cursor:pointer}
.area-legend button:hover{background:rgba(135,169,150,.88);color:#fff}
.dt-pin{background:none;border:0}
.dt-pin span{display:block;position:relative;width:11px;height:11px;margin:1.5px;border-radius:50%;background:#d4a94e;border:1.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45);box-sizing:border-box}
.dt-pin span::after{content:'';position:absolute;inset:-2px;border-radius:50%;border:2px solid #e2bd66;opacity:0;pointer-events:none}
.dt-pin:hover span::after{animation:dtpulse 1.1s ease-out infinite}
@keyframes dtpulse{0%{transform:scale(1);opacity:.95}100%{transform:scale(3);opacity:0}}
.leaflet-tooltip.dt-tip{background:#fff;color:#3c3530;border:0;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.25);font-size:.78rem;padding:4px 9px}
.area-map-note{font-size:.8rem;color:#7d756e;margin:10px 0 0}
.area-map-note a{color:#5f7f72}
.area-pop b{display:block;font-size:.95rem;margin:0 0 6px}
.area-pop a{color:#5f7f72;font-weight:600;text-decoration:none}
.area-pop hr{border:0;border-top:1px solid #eee;margin:8px 0}
</style>'''
JS = '''<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script>
(function(){
  var GROUPS=__GROUPS__;
  function go(a){var el=document.getElementById(a);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}
  document.querySelectorAll('.area-legend button').forEach(function(b){b.addEventListener('click',function(){go(b.getAttribute('data-a'));});});
  if(typeof L==='undefined')return;
  var map=L.map('area-map',{scrollWheelZoom:false});
  var topo=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:18,attribution:'&copy; Esri'}).addTo(map);
  var sat=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:18,attribution:'Tiles &copy; Esri'});
  L.control.layers({'Terrain':topo,'Satellite':sat},null,{position:'topright'}).addTo(map);
  var b=[];
  GROUPS.forEach(function(g){
    b.push([g.lat,g.lng]);
    L.marker([g.lat,g.lng],{icon:L.divIcon({className:'dt-pin',html:'<span></span>',iconSize:[14,14],iconAnchor:[7,7]})}).addTo(map)
      .bindTooltip(g.l.map(function(x){return x.n;}).join(' / '),{direction:'top',offset:[0,-8],className:'dt-tip'})
      .bindPopup('<div class="area-pop">'+g.l.map(function(x){return '<b>'+x.n+'</b><a href="'+x.u+'">View lodge &amp; rates &rarr;</a>';}).join('<hr>')+'</div>');
  });
  if(b.length>1)map.fitBounds(b,{padding:[40,40],maxZoom:13});else map.setView(b[0],12);
})();
</script>'''

report = {}
for region, coords in sorted(DATA.items()):
    P = region + '/index.html'
    s = io.open(P, encoding='utf-8').read()
    if MARK in s or 'AREA-MAP' in s: report[region] = 'skipped (has a map)'; continue
    C = {norm(k): v for k, v in coords.items()}
    cards = [(href, unesc(h3)) for href, h3 in re.findall(r'<a class="card[^"]*" data-name="[^"]*" href="([^"]+)">.*?<h3>(.*?)</h3>', s, re.S)]
    pins, missing = [], []
    for href, name in cards:
        c = C.get(norm(name))
        if c and c.get('lat') is not None and not c.get('off_map'): pins.append({'n': name, 'u': href, 'lat': c['lat'], 'lng': c['lng']})
        else: missing.append((name, href))
    med = (statistics.median(p['lat'] for p in pins), statistics.median(p['lng'] for p in pins))
    far = [p for p in pins if km(med, (p['lat'], p['lng'])) > FAR]
    pins = [p for p in pins if p not in far]
    missing += [(p['n'], p['u']) for p in far]
    groups = []
    for p in pins:
        for g in groups:
            if km((g['lat'], g['lng']), (p['lat'], p['lng'])) < 0.2: g['l'].append({'n': p['n'], 'u': p['u']}); break
        else: groups.append({'lat': p['lat'], 'lng': p['lng'], 'l': [{'n': p['n'], 'u': p['u']}]})
    areas = re.findall(r'<div class="area-sec" id="([^"]+)"><h3 class="area-h">([^<]+)</h3>', s)
    legend = '<div class="area-legend">%s</div>' % ''.join('<button type="button" data-a="%s">%s</button>' % a for a in areas) if areas else ''
    nopin = ('<p class="area-map-note">Not on the map yet: %s.</p>' % ', '.join('<a href="%s">%s</a>' % (u, html.escape(n)) for n, u in missing)) if missing else ''
    label = html.escape(re.sub(r'\s+', ' ', re.search(r'<title>(.*?)</title>', s, re.S).group(1)).split('|')[0].strip())
    block = '<!-- %s -->\n%s\n<div class="area-map-wrap"><div id="area-map" aria-label="Map: %s"></div>%s%s</div>\n%s\n<!-- /%s -->' % (
        MARK, CSS, label, legend, nopin, JS.replace('__GROUPS__', json.dumps(groups, ensure_ascii=False)), MARK)
    jump = re.search(r'  <div class="area-jump[^"]*">.*?</div>\n', s, re.S)
    if areas and jump:
        s2 = s.replace(jump.group(0), '  ' + block + '\n', 1)
    elif s.count('<h2>Lodges</h2>') == 1:
        s2 = s.replace('<h2>Lodges</h2>', '<h2>Lodges</h2>\n  ' + block + '\n  ', 1)
    else:
        m = re.search(r'\n(\s*)<div class="grid[ "]', s)
        assert m, region
        s2 = s[:m.start()] + '\n' + m.group(1) + block + s[m.start():]
    shutil.copy(P, P + '.bak_areamap')
    io.open(P + '.tmp', 'w', encoding='utf-8').write(s2); os.replace(P + '.tmp', P)
    report[region] = '%d pins (%d lodges), off map: %s' % (len(groups), len(pins), ', '.join(n for n, _ in missing) or '-')
for k, v in report.items(): print(k, '|', v)
