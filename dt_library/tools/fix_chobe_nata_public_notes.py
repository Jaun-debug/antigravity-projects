#!/usr/bin/env python3
"""Public rack docs for The Chobe Safari Lodge and Nata Lodge: replace the notes and section titles that
carried trade wording (STO, nett, commission) with public wording. Rates untouched; agent (STO) docs untouched.
    cd dt_library && python3 tools/fix_chobe_nata_public_notes.py
"""
import io, json, os, subprocess
P = lambda f: os.path.join(os.getcwd(), f)
MARK = 'CHOBE-NATA-PUBLIC-NOTES'
NOTES = {
 'chobe-safari-lodge': {
  '2026': 'Valid 01 Apr 2026 – 31 Mar 2027. US$ per person per night: half board with one activity, full board or fully inclusive with two. Includes 14% VAT, bed levy, Chobe National Park fees for the included activities and return Kasane airport transfers. Impact levy US$5 per person per night extra. Children 0–5 free, 6–11 child rate, 12 and over adult rate.',
  '2027': 'Valid 01 Apr 2027 – 31 Mar 2028. US$ per person per night with two included experiences per night on every plan. Suites and Explorer Suites are all inclusive only; separate rates for stays of 2+ nights and 1 night. Luxury Rooms take one child. Includes 14% VAT, bed levy and return Kasane airport transfers. Impact levy US$5 per person per night extra. Secret Season: stay three nights or more and get one night free, 01 Dec 2027 – 30 Apr 2028.'},
 'nata-lodge': {
  '2026': 'Valid 01 Apr 2026 – 31 Mar 2027. Rooms in US$ per room per night, room only; campsite per person per night. Meals and activities per person; children 0–5 free. Family chalets sleep two adults and two children. VAT 14% included; impact levy and government bed levy extra.',
  '2027': 'Valid 01 Apr 2027 – 31 Mar 2028. Rooms in US$ per room per night, room only; campsite per person per night. Meals and activities per person; children 0–5 free. Family chalets sleep two adults and two children. VAT 14% included; impact levy (rooms US$2, campsite US$1 per person per night) and government bed levy US$1.50 per person per night extra.'},
}
s = io.open(P('api/rack.js'), encoding='utf-8').read()
assert MARK not in s
block = '''
/* %s — public wording for The Chobe Safari Lodge and Nata Lodge rack notes and section titles (no trade terms on the public page). Rates unchanged. */
(function chobeNataPublicNotes() {
  var N = %s;
  if (typeof DDS_RACK_BY_YEAR === 'undefined') return;
  Object.keys(N).forEach(function (slug) {
    var e = DDS_RACK_BY_YEAR[slug]; if (!e) return;
    Object.keys(N[slug]).forEach(function (y) {
      var d = e[y]; if (!d) return;
      d.note = N[slug][y];
      (d.sections || []).forEach(function (sec) { sec.title = String(sec.title || '').replace(/[\\s·,]*one price \\(rack = nett\\)/, ''); });
    });
  });
})();
''' % (MARK, json.dumps(NOTES, ensure_ascii=False, indent=1))
t = P('api/rack.js') + '.tmp.js'
io.open(t, 'w', encoding='utf-8').write(s + block)
subprocess.check_call(['node', '--check', t])
os.replace(t, P('api/rack.js'))
NODE = r'''
const Module=require('module');const orig=Module._load;Module._load=function(r){if(/_ratesdb$/.test(r))return{dbConfigured:()=>false};return orig.apply(this,arguments);};
const path=require('path'),fs=require('fs');const src=fs.readFileSync('api/rack.js','utf8')+'\nmodule.exports.__D=DDS_RACK_BY_YEAR;';
const m=new Module('p');m.filename=path.resolve('api/p_rack.js');m.paths=Module._nodeModulePaths(path.resolve('api'));m._compile(src,m.filename);
const o={};for(const s of ['chobe-safari-lodge','nata-lodge'])for(const y of ['2026','2027']){const d=m.exports.__D[s][y];o[s+y]=JSON.stringify([d.note,d.sections.map(x=>x.title),d.sections.flatMap(x=>x.rows)]);}
console.log(JSON.stringify(o));'''
o = json.loads(subprocess.check_output(['node', '-e', NODE]))
bad = []
for k, v in o.items():
    low = v.lower()
    for w in ('sto', 'nett', 'commission', 'agent'):
        import re
        if re.search(r'\b%s\b' % w, low): bad.append((k, w))
assert not bad, bad
print('public rack docs clean:', list(o))
