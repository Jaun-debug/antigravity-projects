#!/usr/bin/env python3
"""Builder: public availability for The Chobe Safari Lodge and Nata Lodge from SiteMinder direct-book.com
via /api/smavail (ids 'sm:<property>'), in the same chip as NightsBridge / Natural Selection.
    cd dt_library && python3 tools/add_siteminder_avail.py
Rollback copy: builder/index.html.bak_smavail
"""
import io, os, re, shutil, subprocess, tempfile
P = lambda f: os.path.join(os.getcwd(), f)
F = 'builder/index.html'
s = io.open(P(F), encoding='utf-8').read()
assert 'SMSET' not in s, 'already applied'
def once(old, new, n=1):
    global s
    assert s.count(old) == n, (old[:80], s.count(old))
    s = s.replace(old, new)

NSURL = "var NS_URL='https://naturalselection.travel/check-availability/';"
once(NSURL, NSURL + """
/* SiteMinder direct-book (the lodges' public booking engine): The Chobe Safari Lodge and Nata Lodge via /api/smavail (ids 'sm:<property>').
   This is the PUBLIC allocation, not Kwando's trade allocation in CIMSO (agent login), and the chip says so. */
var SMSET={thechobesafarilodge:'chobesafarilodgedirect',natalodge:'NataLodgeDIRECT'};
function smUrl(prop,ci,n){return 'https://direct-book.com/properties/'+prop+'?locale=en&items[0][adults]=2&items[0][children]=0&items[0][infants]=0&currency=USD&checkInDate='+ci+'&checkOutDate='+addDays(ci,n);}
function availApi(id,ci,n){id=String(id);return id.indexOf('ns:')===0?('/api/nsavail?camp='+id.slice(3)+'&start='+ci+'&nights='+n):id.indexOf('sm:')===0?('/api/smavail?prop='+id.slice(3)+'&start='+ci+'&nights='+n):('/api/nbavail?bbid='+id+'&start='+ci+'&nights='+n);}""")
once("return NSSET[key]?'ns:'+key:'';", "return NSSET[key]?'ns:'+key:(SMSET[key]?'sm:'+SMSET[key]:'');")
once("fetch(String(id).indexOf('ns:')===0?('/api/nsavail?camp='+id.slice(3)+'&start='+ci+'&nights='+n):('/api/nbavail?bbid='+id+'&start='+ci+'&nights='+n))",
     "fetch(availApi(id,ci,n))")
once("var url=String(id).indexOf('ns:')===0?('/api/nsavail?camp='+id.slice(3)+'&start='+ci+'&nights='+n):('/api/nbavail?bbid='+id+'&start='+ci+'&nights='+n);",
     "var url=availApi(id,ci,n);")
NSOPEN = "if(String(id).indexOf('ns:')===0){window.open(NS_URL,'_blank','noopener');return;}"
once(NSOPEN, NSOPEN + "if(String(id).indexOf('sm:')===0){window.open(smUrl(id.slice(3),ci,n),'_blank','noopener');return;}", n=2)
once("title=\"'+esc(t+' — click to open the booking page')+'\"",
     "title=\"'+esc(t+(String(id).indexOf('sm:')===0?' (public availability on the lodge website, not the trade allocation)':'')+' — click to open the booking page')+'\"")

# syntax-check every inline script before writing
scripts = re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', s, flags=re.S)
for i, js in enumerate(scripts):
    if not js.strip():
        continue
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as t:
        t.write(js)
    try:
        subprocess.check_call(['node', '--check', t.name])
    finally:
        os.unlink(t.name)
if not os.path.exists(P(F + '.bak_smavail')):
    shutil.copy2(P(F), P(F + '.bak_smavail'))
tmp = P(F + '.tmp')
io.open(tmp, 'w', encoding='utf-8').write(s)
os.replace(tmp, P(F))
print('builder patched; %d inline scripts checked' % len(scripts))
