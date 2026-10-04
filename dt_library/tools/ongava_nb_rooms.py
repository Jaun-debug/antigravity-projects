#!/usr/bin/env python3
"""Ongava live availability (4 Oct 2026). NightsBridge 32926 is one account, "Ongava Game Reserve", for all four
camps; room names carry the camp ("Encounter - Luxury Tent", "Ongava Lodge - Family Chalet" ...). Each camp now
counts only its own rooms. Builder: nightsbridge.json entries + room filter. Rate sheets: nb-live.js room filter."""
import io, json, os, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
PFX = {'ongavalodge': 'Ongava Lodge - ', 'encounter': 'Encounter - ', 'ongavatentedcamp': 'Encounter - ',
       'anderssonsatongava': 'Anderssons at Ongava - ', 'horizon': 'Horizon - ', 'littleongava': 'Horizon - '}
JS_HELPERS = ('/* Ongava: one NightsBridge account (32926) for four camps - count only the camp\'s own rooms (room names start "<camp> - "). */\n'
  'var NB_ROOMPFX=' + json.dumps(PFX) + ';\n'
  'function nbPfx(nm){return NB_ROOMPFX[String(nm||\'\').toLowerCase().replace(/[^a-z0-9]/g,\'\')]||\'\';}\n'
  'function nbFilter(j,p){if(!p||!j||!j.ok)return j;var f=0;(j.rooms||[]).forEach(function(r){if(String(r.name||\'\').toLowerCase().indexOf(p.toLowerCase())===0)f+=(+r.free||0);});return Object.assign({},j,{free:f,available:f>0});}\n')
def rd(f): return io.open(f, encoding='utf-8').read()
def wr(f, s):
    io.open(f + '.tmp', 'w', encoding='utf-8').write(s); os.replace(f + '.tmp', f)

# --- builder
F = 'builder/index.html'; s = rd(F)
assert 'NB_ROOMPFX' not in s
a = "function nbKey(id,ci,n){return id+'|'+ci+'|'+n}"
assert s.count(a) == 1; s = s.replace(a, a + '\n' + JS_HELPERS)
old_chk = "  var key=nbKey(id,ci,n);\n  if(NBAVAIL[key]) return;"
assert s.count(old_chk) == 1; s = s.replace(old_chk, "  var pf=nbPfx(L&&L.name);\n  var key=nbKey(id+(pf?'#'+pf:''),ci,n);\n  if(NBAVAIL[key]) return;")
old_then = ".then(function(j){NBAVAIL[key]=(j&&j.ok)?{state:(j.available?'yes':'no'),free:j.free||0}:{state:'err'};nbPaint();})"
assert s.count(old_then) == 1; s = s.replace(old_then, ".then(function(j){j=nbFilter(j,pf);NBAVAIL[key]=(j&&j.ok)?{state:(j.available?'yes':'no'),free:j.free||0}:{state:'err'};nbPaint();})")
old_paint = "    var st=NBAVAIL[nbKey(id,ci,n)];"
assert s.count(old_paint) == 1; s = s.replace(old_paint, "    var pf=nbPfx(L&&L.name);var st=NBAVAIL[nbKey(id+(pf?'#'+pf:''),ci,n)];")
wr(F, s)

# --- builder feed of NightsBridge ids
N = 'assets/nightsbridge.json'; d = json.loads(rd(N)); raw = rd(N)
camps = [('ongava-lodge', 'ongavalodge', 'Ongava Lodge'), ('ongava-tented-camp', 'encounter', 'Encounter'),
         ('anderssons-at-ongava', 'anderssonsatongava', 'Anderssons at Ongava'), ('little-ongava', 'horizon', 'Horizon')]
for slug, key, name in camps:
    rec = {'nb': '32926', 'name': name, 'url': '/south-etosha-accommodation/%s/' % slug}
    for k in (slug, key): assert k not in d; d[k] = rec
ind = 1 if raw.startswith('{\n "') else (2 if raw.startswith('{\n  "') else None)
wr(N, json.dumps(d, ensure_ascii=False, indent=ind) + ('\n' if raw.endswith('\n') else ''))

# --- rate sheets (shared nb-live.js)
G = 'assets/nb-live.js'; s = rd(G)
assert 'NB_ROOMPFX' not in s
a = '  function bbid(){'
assert s.count(a) == 1
s = s.replace(a, '  ' + JS_HELPERS.replace('\n', '\n  ') +
  "function curName(){try{var id=window.__nrLodgeId||'';var d=(typeof DB!=='undefined'&&DB)?DB[id]:null;if(d&&d.name)return d.name;}catch(e){}"
  "try{var h=document.querySelector('h1');if(h&&h.textContent)return h.textContent.trim();}catch(e){}return String(document.title||'').split(' \\u2014 ')[0];}\n" + a)
o1 = "    var key=id+'|'+d.start+'|'+d.nights, info={start:d.start,nights:d.nights};"
assert s.count(o1) == 1; s = s.replace(o1, "    var pf=ns?'':nbPfx(curName());\n    var key=id+(pf?'#'+pf:'')+'|'+d.start+'|'+d.nights, info={start:d.start,nights:d.nights};")
o2 = ".then(function(j){CACHE[key]=(j&&j.ok)?{st:(j.available?'yes':'no'),free:j.free||0}:{st:'err'};"
assert s.count(o2) == 1; s = s.replace(o2, ".then(function(j){j=nbFilter(j,pf);CACHE[key]=(j&&j.ok)?{st:(j.available?'yes':'no'),free:j.free||0}:{st:'err'};")
wr(G, s)
subprocess.check_call(['node', '--check', G])
print('builder, nightsbridge.json and nb-live.js patched')
