#!/usr/bin/env python3
"""Readable rate tables on The Chobe Safari Lodge and Nata Lodge pages (display only).

    cd dt_library && python3 tools/readable_rate_tables.py

Season heading once; one block per room with its common basis at the top (e.g. "per room per night, room only");
inside a room, one band per meal plan, and where a plan has night bands the rates form a grid:
        HALF BOARD + TWO EXPERIENCES   2+ NIGHTS   1 NIGHT
        Adult sharing                  US$ 475     US$ 500
Data, labels, prices and the booking form (data-name = full label) are unchanged.
Rollback copies: <page>.bak_readable
"""
import io, os, re, shutil, subprocess, tempfile
PAGES = ['chobe-accommodation/chobe-safari-lodge/index.html', 'makgadikgadi-accommodation/nata-lodge/index.html']
MARK = 'rt-season'
NEW_FN = r'''function renderRates(model, isSto){
  /* readable layout: season heading, room block with its basis at the top, meal-plan bands, night-band grid (labels/prices untouched) */
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
  function cell(r){var p=String(r[1]==null?'':r[1]),pnum=p.replace(/[^0-9.]/g,'');
    return '<td class="rt-p">'+(/\d/.test(p)?'US$ '+esc(p):esc(p))
      +(isSto&&pnum?' <input type="number" min="0" inputmode="numeric" class="qty" data-name="'+esc(r[0])+'" data-price="'+pnum+'" oninput="recalcBooking()">':'')+'</td>';}
  var html='',lastSeason=null,unit=isSto?'STO (US$)':'Rack (US$)';
  model.sections.forEach(function(s){
    var t=String(s.title||''),i=t.lastIndexOf(' — ');
    var season=i>0?t.slice(0,i):'',room=i>0?t.slice(i+3):t,pre=room+' — ';
    if(season&&season!==lastSeason){html+='<h3 class="rt-season">'+esc(season)+'</h3>';lastSeason=season;}
    var rows=(s.rows||[]).map(function(r){var l=String(r[0]);return {r:r,seg:(l.indexOf(pre)===0?l.slice(pre.length):l).split(' · ')};});
    var note='';
    if(rows.length>1){var last=rows[0].seg[rows[0].seg.length-1];
      if(rows.every(function(x){return x.seg.length>1&&x.seg[x.seg.length-1]===last;})){note=last;rows.forEach(function(x){x.seg=x.seg.slice(0,-1);});}}
    var cnt={};rows.forEach(function(x){if(x.seg.length>1)cnt[x.seg[0]]=(cnt[x.seg[0]]||0)+1;});
    var groups=[];
    rows.forEach(function(x){var b=(x.seg.length>1&&cnt[x.seg[0]]>1)?x.seg[0]:'';var g=groups[groups.length-1];
      if(!g||g.b!==b){g={b:b,items:[]};groups.push(g);}g.items.push({r:x.r,seg:b?x.seg.slice(1):x.seg});});
    html+='<div class="rt-room"><div class="rt-cap">'+esc(room)+(note?'<span class="rt-note">'+esc(note)+'</span>':'')+'</div>';
    var plain=0;
    groups.forEach(function(g){
      var cols=[],rk=[],m={},ok=!!g.b&&g.items.length>=4&&g.items.every(function(x){return x.seg.length===2;});
      if(ok){g.items.forEach(function(x){var c=x.seg[0],k=x.seg[1];if(cols.indexOf(c)<0)cols.push(c);if(rk.indexOf(k)<0)rk.push(k);if(m[k+'|'+c])ok=false;m[k+'|'+c]=x.r;});
        ok=ok&&cols.length>=2&&cols.length<=4&&rk.length*cols.length===g.items.length;}
      html+='<table class="rt"><thead><tr><th>'+esc(g.b||(plain++?'Other':'Type'))+'</th>';
      if(ok){html+=cols.map(function(c){return '<th class="rt-p">'+esc(c)+'</th>';}).join('')+'</tr></thead><tbody>';
        rk.forEach(function(k){html+='<tr><td>'+esc(k)+'</td>'+cols.map(function(c){return cell(m[k+'|'+c]);}).join('')+'</tr>';});}
      else{html+='<th class="rt-p">'+unit+'</th></tr></thead><tbody>';
        g.items.forEach(function(x){html+='<tr><td>'+esc(x.seg.join(' · '))+'</td>'+cell(x.r)+'</tr>';});}
      html+='</tbody></table>';
    });
    html+='</div>';
  });
  document.getElementById('rate-tables').innerHTML=html;
  if(isSto){ recalcBooking(); } else { hideBookingBar(); }
}'''
CSS = '''.rt-season{font-family:var(--font-head);font-weight:500;color:var(--brand-accent);font-size:1.25rem;margin:34px 0 4px;padding-bottom:8px;border-bottom:1px solid rgba(164,130,86,.25);}
.rt-room{margin:18px 0 26px;}
.rt-cap{font-family:var(--font-head);font-size:1.08rem;color:var(--text-main);padding:4px 2px 0;}
.rt-note{display:block;font-family:var(--font-body);font-size:.8rem;color:var(--text-muted);margin-top:2px;}
table.rt{margin:10px 0 0;}
table.rt th:first-child{color:var(--text-main);}
table.rt .rt-p{text-align:right;white-space:nowrap;min-width:110px;font-variant-numeric:tabular-nums;}
table.rt input.qty{margin-left:8px;width:58px;vertical-align:middle;}
@media(max-width:600px){table.rt th,table.rt td{padding:10px 8px;font-size:.85rem;}table.rt .rt-p{width:auto;}}
'''
for f in PAGES:
    s = io.open(f, encoding='utf-8').read()
    assert MARK not in s, f + ' already applied'
    m = re.search(r'function renderRates\(model, isSto\)\{.*?\n\}', s, flags=re.S)
    assert m and 'hideBookingBar' in m.group(0), f
    s = s[:m.start()] + NEW_FN + s[m.end():]
    anchor = 'input.qty{width:66px;'
    assert s.count(anchor) == 1, f
    i = s.index(anchor)
    i = s.index('\n', i) + 1
    s = s[:i] + CSS + s[i:]
    for js in re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', s, flags=re.S):
        if js.strip():
            with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as t:
                t.write(js)
            try:
                subprocess.check_call(['node', '--check', t.name])
            finally:
                os.unlink(t.name)
    if not os.path.exists(f + '.bak_readable'):
        shutil.copy2(f, f + '.bak_readable')
    tmp = f + '.tmp'
    io.open(tmp, 'w', encoding='utf-8').write(s)
    os.replace(tmp, f)
    print('patched', f)
