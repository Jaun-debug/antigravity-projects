#!/usr/bin/env python3
"""Okavango Delta region page: replace the area tab row with a map of the camps.

    cd dt_library && python3 tools/delta_area_map.py

Pins come from Google Places (place_search, 7 Oct 2026), stored with their place ids in
tools/delta_lodge_coords.json. A camp with no reliable Places match gets no pin and is listed under
the map instead of being placed by guesswork. Clicking a pin opens the camp; clicking an area in the
legend scrolls to that area's cards (the sections keep scroll-margin-top so the heading is not hidden).
"""
import html, io, json, os, re

P = 'okavango-delta-accommodation/index.html'
MARK = 'DELTA-AREA-MAP'
# name on the card -> (lat, lng, Google Places name, place_id)
COORDS = {
    'Wilderness Mombo': (-19.2268588, 22.7772348, 'Wilderness Mombo', 'ChIJM2u3w58iVhkRGkWUQ_77LHw'),
    'Wilderness Little Mombo': (-19.2283271, 22.7793497, 'Little Mombo Camp', 'ChIJZ4cyVXYYVhkRig_0vkaMD2s'),
    'Camp Moremi': (-19.188326, 23.408492, 'Camp Moremi', 'ChIJl9Y3t12KVhkRwRXtbZavVN8'),
    'Camp Xakanaxa': (-19.1823661, 23.4088182, 'Camp Xakanaxa', 'ChIJCWZXn1-KVhkRz9FM2nuQQEE'),
    'Tawana': (-19.4929375, 23.5098125, 'Tawana', 'ChIJmdt0iBwpVBkRaFV-DHzaHwI'),
    'Wilderness Vumbura Plains North': (-18.9795636, 22.8935874, 'Wilderness Vumbura Plains', 'ChIJpxOraBsyVhkR_2wBlcNhYis'),
    'Wilderness Vumbura Plains South': (-18.9795636, 22.8935874, 'Wilderness Vumbura Plains', 'ChIJpxOraBsyVhkR_2wBlcNhYis'),
    'Wilderness Little Vumbura': (-19.0016228, 22.8613895, 'Little Vumbura Camp', 'ChIJt5RKtVcwVhkRkS-hnd7eDaw'),
    'Xugana Island Lodge': (-19.0677757, 23.1003532, 'Xugana Island Lodge', 'ChIJt84wBR9EVhkRbDzlaD7Ynm4'),
    'Camp Okavango': (-19.1320797, 23.0978137, 'Camp Okavango', 'ChIJWW7BydRDVhkRKLVFW96uOp8'),
    'Delta Camp': (-19.532383, 23.105484, 'Delta Camp', 'ChIJUfCH-AJ2VhkRYpM5FylGC1g'),
    'North Island Okavango': (-18.9179054, 22.6137369, 'North Island Okavango', 'ChIJw_QU2AuB_RsR_6ng8QEXujQ'),
    "Duke's Camp": (-18.8740043, 22.6642811, "Duke's Camp", 'ChIJe7e_56AsVhkRd1znuWVRr6Y'),
    "Duke's East": (-18.873205, 22.6700772, 'Duke’s East', 'ChIJBe7dJgDVVxkRpMBl7g_O10k'),
    'Mbamba': (-18.8883936, 22.807404, 'Mbamba Camp', 'ChIJ-YLnBpYtVhkRToEWRnlpPtU'),
    'Kwara Camp': (-19.1093214, 23.2653618, 'Kwara Camp - Kwando Safaris', 'ChIJR0KlFzVcVhkR1rUfRecwdwY'),
    'Splash Camp': (-19.0736944, 23.3762646, 'Splash Camp - Kwando Safaris', 'ChIJ24FLfrJfVhkR0fZk-AuTIfg'),
    '4 Rivers Camp': (-19.0155316, 23.1225054, '4 Rivers Camp - Kwando Safaris', 'ChIJY8ZQgTJFVhkR9gG3fOzlcW4'),
    'Wilderness Chitabe': (-19.5270084, 23.377138, 'Wilderness Chitabe', 'ChIJxQlIXYHVVRkRJ_iiE2v648Q'),
    'Wilderness Chitabe Lediba': (-19.5284623, 23.3811247, 'Wilderness Chitabe Lediba', 'ChIJaSfLizPVVRkRmRXcM48PPKo'),
    'Wilderness Qorokwe': (-19.5774889, 23.3817758, 'Wilderness Qorokwe', 'ChIJb8tOMK3UVRkRPKrmgNXEEkk'),
    'Mma Dinare': (-19.5872475, 23.5734445, 'Mma Dinare Camp - Kwando Safaris', 'ChIJu99fd_YlVBkRJbV2lEruULc'),
    'Rra Dinare': (-19.5567559, 23.5690777, 'Rra Dinare Camp - Kwando Safaris', 'ChIJY1vEx6soVBkRQVSTLWbAa0k'),
    'Mokolwane': (-19.6578778, 22.8071027, 'Mokolwane Camp', 'ChIJD84hDwD9VRkRbNnMEpwjjkU'),
    'Pom Pom Camp': (-19.5845016, 22.8426783, 'Pom Pom Camp - Kwando Safaris', 'ChIJu2ec557iVRkRUJb4wpaAjfc'),
    'Moremi Crossing': (-19.5271181, 23.1495069, 'Moremi Crossing - Kwando Safaris', 'ChIJIU7l3NV3VhkRfRNAf6c6ep8'),
    'Sediba Sa Rona': (-19.1486905, 23.8002981, 'Sediba Sa Rona', 'ChIJ3zuBSwC_VhkR6Qm8YRQ4Etk'),
    'Wilderness Mokete': (-19.0998074, 24.1014642, 'Wilderness Mokete', 'ChIJ876tVgC1VhkRorv-Uj2l8no'),
    'Camp Khwai': (-19.1609141, 23.7645518, 'Camp Khwai', 'ChIJATQt4cy_VhkRSZZ5ApEMamc'),
    'Tuludi': (-19.1379194, 23.5675802, 'Tuludi Camp', 'ChIJSfCH-kKNVhkRM7_H1FcgzRk'),
    'Sable Alley': (-19.1280182, 23.6613429, 'Sable Alley', 'ChIJMUHcBWeTVhkRYApe9QL66sE'),
    'Little Sable': (-19.1517431, 23.6951156, 'Little Sable', 'ChIJ5cU5KgCVVhkRsyDtYOEd7HY'),
    'Elephant Pan': (-18.998605, 23.7689354, 'Hyena Pan (Now Elephant Pan) Botswana', 'ChIJ1Xki_gHCVhkReGeltMV7YJ8'),
    'Nxamaseri Island Lodge': (-18.6070214, 22.0877552, 'NXAMASERI LODGE', 'ChIJlZVONskX_RsRa7p_h0w5mA0'),
}
COLOR = {'area-moremi': '#d9a93f', 'area-north': '#4fb3a0', 'area-southeast': '#d9733f', 'area-south': '#a083d1',
         'area-central': '#e8d36a', 'area-khwai': '#5b93d9', 'area-panhandle': '#9ccf5a'}

s = io.open(P, encoding='utf-8').read()
assert MARK not in s, 'already applied'
areas = re.findall(r'<div class="area-sec" id="([^"]+)"><h3 class="area-h">([^<]+)</h3>(.*?)\n  </div></div>', s, re.S)
assert [a[0] for a in areas] == list(COLOR), [a[0] for a in areas]
pins, missing = [], []
for aid, aname, body in areas:
    for href, h3 in re.findall(r'<a class="card[^"]*" data-name="[^"]*" href="([^"]+)">.*?<h3>(.*?)</h3>', body, re.S):
        name = html.unescape(h3)
        if name in COORDS:
            lat, lng, _, _ = COORDS[name]
            pins.append({'n': name, 'u': href, 'a': aid, 'lat': lat, 'lng': lng})
        else:
            missing.append((name, href))
assert len(pins) == len(COORDS), (len(pins), sorted(set(COORDS) - {p['n'] for p in pins}))
print('pins', len(pins), 'no pin', [m[0] for m in missing])

legend = ''.join('<button type="button" data-a="%s">%s</button>' % (aid, aname) for aid, aname, _ in areas)
nopin = ''
if missing:
    nopin = ('<p class="area-map-note">Not on the map yet: %s.</p>'
             % ', '.join('<a href="%s">%s</a>' % (u, html.escape(n)) for n, u in missing))
block = '''<!-- %(mark)s -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
<style>
.area-map-wrap{margin:0 0 30px}
#area-map{height:460px;border-radius:12px;overflow:hidden;border:1px solid rgba(164,130,86,.25);background:#e9e6df;isolation:isolate;-webkit-mask-image:-webkit-radial-gradient(white,black);transform:translateZ(0)}.wrap>h2{margin-bottom:30px}
@media (max-width:700px){#area-map{height:340px}}
.area-legend{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 0}
.area-legend button{display:inline-flex;align-items:center;gap:8px;font:inherit;font-size:.74rem;letter-spacing:.5px;padding:6px 13px;border-radius:4px;border:1px solid rgba(135,169,150,.7);background:rgba(135,169,150,.10);color:#5f7f72;cursor:pointer}
.area-legend button:hover{background:rgba(135,169,150,.88);color:#fff}
.dt-pin{background:none;border:0}
.dt-pin span{display:block;position:relative;width:11px;height:11px;margin:1.5px;border-radius:50%%;background:#d4a94e;border:1.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45);box-sizing:border-box}
.dt-pin span::after{content:'';position:absolute;inset:-2px;border-radius:50%%;border:2px solid #e2bd66;opacity:0;pointer-events:none}
.dt-pin:hover span::after{animation:dtpulse 1.1s ease-out infinite}
@keyframes dtpulse{0%%{transform:scale(1);opacity:.95}100%%{transform:scale(3);opacity:0}}
.leaflet-tooltip.dt-tip{background:#fff;color:#3c3530;border:0;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.25);font-size:.78rem;padding:4px 9px}
.area-map-note{font-size:.8rem;color:#7d756e;margin:10px 0 0}
.area-map-note a{color:#5f7f72}
.area-pop b{display:block;font-size:.95rem;margin:0 0 2px}
.area-pop span{display:block;font-size:.75rem;color:#7d756e;margin:0 0 6px}
.area-pop a{color:#5f7f72;font-weight:600;text-decoration:none}
</style>
<div class="area-map-wrap"><div id="area-map" aria-label="Map of the Okavango Delta camps"></div>
<div class="area-legend">%(legend)s</div>%(nopin)s</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script>
(function(){
  var PINS=%(pins)s, COLOR=%(color)s, AREAS={};
  document.querySelectorAll('.area-sec').forEach(function(sec){var h=sec.querySelector('.area-h');AREAS[sec.id]=h?h.textContent:sec.id;});
  function go(a){var el=document.getElementById(a);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}
  document.querySelectorAll('.area-legend button').forEach(function(b){b.addEventListener('click',function(){go(b.getAttribute('data-a'));});});
  if(typeof L==='undefined')return;
  var map=L.map('area-map',{scrollWheelZoom:false,zoomControl:true});
  var topo=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:18,attribution:'&copy; Esri'}).addTo(map);
  var sat=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:18,attribution:'Tiles &copy; Esri'});
  L.control.layers({'Terrain':topo,'Satellite':sat},null,{position:'topright'}).addTo(map);
  var groups={};PINS.forEach(function(p){var k=p.lat+','+p.lng;(groups[k]=groups[k]||[]).push(p);});
  var bounds=[];
  Object.keys(groups).forEach(function(k){
    var g=groups[k],p=g[0];bounds.push([p.lat,p.lng]);
    var m=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'dt-pin',html:'<span></span>',iconSize:[14,14],iconAnchor:[7,7]}),title:''}).addTo(map);
    m.bindTooltip(g.map(function(x){return x.n;}).join(' / '),{direction:'top',offset:[0,-8],className:'dt-tip'});
    m.bindPopup('<div class="area-pop">'+g.map(function(x){return '<b>'+x.n+'</b><span>'+AREAS[x.a]+'</span><a href="'+x.u+'">View lodge &amp; rates &rarr;</a>';}).join('<hr style="border:0;border-top:1px solid #eee;margin:8px 0">')+'<div style="margin-top:8px"><a href="#'+p.a+'" data-go="'+p.a+'">See this area&rsquo;s camps &darr;</a></div></div>');
    m.on('popupopen',function(e){var a=e.popup.getElement().querySelector('[data-go]');if(a)a.addEventListener('click',function(ev){ev.preventDefault();map.closePopup();go(a.getAttribute('data-go'));});});
  });
  map.fitBounds(bounds,{padding:[30,30]});
})();
</script>
<!-- /%(mark)s -->''' % {'mark': MARK, 'legend': legend, 'nopin': nopin,
                         'pins': json.dumps(pins, ensure_ascii=False), 'color': json.dumps(COLOR)}

jump = re.search(r'  <div class="area-jump">.*?</div>\n', s).group(0)
assert s.count(jump) == 1
s = s.replace(jump, '  ' + block + '\n')
t = P + '.tmp'
io.open(t, 'w', encoding='utf-8').write(s)
os.replace(t, P)
json.dump({'source': 'Google Places via places_search, 7 Oct 2026', 'lodges': {k: {'lat': v[0], 'lng': v[1], 'places_name': v[2], 'place_id': v[3]} for k, v in COORDS.items()}},
          io.open('tools/delta_lodge_coords.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('done')
