#!/usr/bin/env python3
"""Chobe region page: map of the lodges above the cards (same style as the Okavango Delta map).

    cd dt_library && python3 tools/chobe_area_map.py

Pins from Google Places (places_search, 7 Oct 2026); place ids kept in tools/chobe_lodge_coords.json.
Small gold pins that pulse on hover and show the lodge name; click opens 'View lodge & rates'.
"""
import html, io, json, os, re

P = 'chobe-accommodation/index.html'
MARK = 'CHOBE-AREA-MAP'
COORDS = {
    'Chobe Game Lodge': (-17.84083, 25.076058, 'Chobe Game Lodge', 'ChIJhVko-aOCWhkR2xsJuGihQO8'),
    'Chobe Savanna Lodge': (-17.8306483, 25.0533611, 'Chobe Savanna Lodge', 'ChIJjTLAYoyCWhkRkEsf0wC6Qmw'),
    'The Chobe Safari Lodge': (-17.8056984, 25.1466809, 'The Chobe Safari Lodge', 'ChIJv50fH7SdWhkRj-HfdIofZe0'),
    'Savute Safari Lodge': (-18.564308, 24.057397, 'Savute Safari Lodge desert and delta', 'ChIJ544JMiwsVxkRKYeUlS8h4Fg'),
    'Muchenje Safari Lodge': (-17.9433756, 24.7034169, 'Muchenje Safari Lodge', 'ChIJZ9r4gtecUBkRVDOik_MUsNM'),
}
s = io.open(P, encoding='utf-8').read()
assert MARK not in s, 'already applied'
pins, missing = [], []
for href, h3 in re.findall(r'<a class="card[^"]*" data-name="[^"]*" href="([^"]+)">.*?<h3>(.*?)</h3>', s, re.S):
    n = html.unescape(h3)
    if n in COORDS:
        pins.append({'n': n, 'u': href, 'lat': COORDS[n][0], 'lng': COORDS[n][1]})
    else:
        missing.append((n, href))
assert len(pins) == len(COORDS), pins
nopin = ('<p class="area-map-note">Not on the map yet: %s.</p>' % ', '.join('<a href="%s">%s</a>' % (u, html.escape(n)) for n, u in missing)) if missing else ''
block = '''<!-- %(mark)s -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
<style>
.area-map-wrap{margin:0 0 30px}
#area-map{height:460px;border-radius:12px;overflow:hidden;border:1px solid rgba(164,130,86,.25);background:#e9e6df;isolation:isolate;-webkit-mask-image:-webkit-radial-gradient(white,black);transform:translateZ(0);clip-path:inset(0 round 12px);-webkit-clip-path:inset(0 round 12px)}#area-map .leaflet-pane,#area-map .leaflet-control-container{border-radius:12px}.wrap>h2{margin-bottom:30px}
@media (max-width:700px){#area-map{height:340px}}
.area-map-note{font-size:.8rem;color:#7d756e;margin:10px 0 0}
.area-map-note a{color:#5f7f72}
.dt-pin{background:none;border:0}
.dt-pin span{display:block;position:relative;width:11px;height:11px;margin:1.5px;border-radius:50%%;background:#d4a94e;border:1.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45);box-sizing:border-box}
.dt-pin span::after{content:'';position:absolute;inset:-2px;border-radius:50%%;border:2px solid #e2bd66;opacity:0;pointer-events:none}
.dt-pin:hover span::after{animation:dtpulse 1.1s ease-out infinite}
@keyframes dtpulse{0%%{transform:scale(1);opacity:.95}100%%{transform:scale(3);opacity:0}}
.leaflet-tooltip.dt-tip{background:#fff;color:#3c3530;border:0;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.25);font-size:.78rem;padding:4px 9px}
.area-pop b{display:block;font-size:.95rem;margin:0 0 6px}
.area-pop a{color:#5f7f72;font-weight:600;text-decoration:none}
</style>
<div class="area-map-wrap"><div id="area-map" aria-label="Map of the Chobe lodges"></div>%(nopin)s</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script>
(function(){
  var PINS=%(pins)s;
  if(typeof L==='undefined')return;
  var map=L.map('area-map',{scrollWheelZoom:false});
  var topo=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:18,attribution:'&copy; Esri'}).addTo(map);
  var sat=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:18,attribution:'Tiles &copy; Esri'});
  L.control.layers({'Terrain':topo,'Satellite':sat},null,{position:'topright'}).addTo(map);
  var b=[];
  PINS.forEach(function(p){
    b.push([p.lat,p.lng]);
    L.marker([p.lat,p.lng],{icon:L.divIcon({className:'dt-pin',html:'<span></span>',iconSize:[14,14],iconAnchor:[7,7]})}).addTo(map)
      .bindTooltip(p.n,{direction:'top',offset:[0,-8],className:'dt-tip'})
      .bindPopup('<div class="area-pop"><b>'+p.n+'</b><a href="'+p.u+'">View lodge &amp; rates &rarr;</a></div>');
  });
  map.fitBounds(b,{padding:[40,40]});
})();
</script>
<!-- /%(mark)s -->''' % {'mark': MARK, 'nopin': nopin, 'pins': json.dumps(pins, ensure_ascii=False)}
anchor = '  <div class="grid" id="lodge-grid">'
assert s.count(anchor) == 1, s.count(anchor)
s = s.replace(anchor, '  ' + block + '\n' + anchor)
io.open(P + '.tmp', 'w', encoding='utf-8').write(s)
os.replace(P + '.tmp', P)
json.dump({'source': 'Google Places via places_search, 7 Oct 2026', 'lodges': {k: {'lat': v[0], 'lng': v[1], 'places_name': v[2], 'place_id': v[3]} for k, v in COORDS.items()}},
          io.open('tools/chobe_lodge_coords.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('pins', len(pins), 'no pin', missing)
