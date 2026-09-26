/* Live NightsBridge availability on the rate sheets' booking calendar.
   On the calendar's "Night(s) selected" line a square block shows the result for the dates picked:
   green tick = rooms free, red cross = fully booked, spinner = checking, calendar = no dates yet.
   Hover gives the detail; clicking opens NightsBridge (the sheet's own nrAvail) as before.
   Works with both calendar versions on the site:
     group sheets  - property from window.__nrCurBbid(), dates from calendarState.rangeStart/rangeEnd
     single sheets - property from the NightsBridge id inside nrAvail, dates from checkIn/checkOut
   Uses /api/nbavail (edge-cached 5 min), the same probe the itinerary builder uses. */
;(function(){"use strict";
  if(window.__nrNbLive)return; window.__nrNbLive=1;
  var ICON={yes:'<svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    no:'<svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    checking:'<span class="nbl-spin"></span>',
    idle:'<svg viewBox="0 0 24 24" width="20" height="20"><rect x="4" y="5.5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'};
  var CSS='.nbl-row{display:inline-flex;align-items:stretch;gap:10px;justify-content:center}'
   +'.nbl-box{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border-radius:8px;'
   +'border:1px solid rgba(135,169,150,.55);background:rgba(135,169,150,.10);color:#5f7f72;transition:filter .15s}'
   +'.nbl-box:hover{filter:brightness(.96)}'
   +'.nbl-box.yes{border-color:rgba(63,157,85,.55);background:rgba(63,157,85,.12);color:#2f7a44}'
   +'.nbl-box.no{border-color:rgba(192,69,60,.5);background:rgba(192,69,60,.10);color:#b23a31}'
   +'.nbl-spin{width:16px;height:16px;border-radius:50%;border:2px solid rgba(95,127,114,.25);border-top-color:#5f7f72;animation:nblspin .8s linear infinite}'
   +'@keyframes nblspin{to{transform:rotate(360deg)}}';
  var CACHE={}, cur='';
  function loc(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function fmt(iso){try{return new Date(iso+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});}catch(e){return iso;}}
  function bbid(){
    try{if(typeof window.__nrCurBbid==='function'){var b=window.__nrCurBbid();if(b)return String(b);}}catch(e){}
    try{var m=String(window.nrAvail||'').match(/book\.nightsbridge\.com\/(\d+)/);if(m)return m[1];}catch(e){}
    return '';
  }
  function dates(){
    var a=null,b=null;
    try{if(typeof calendarState!=='undefined'&&calendarState){a=calendarState.rangeStart;b=calendarState.rangeEnd;}}catch(e){}
    if(!(a instanceof Date)){try{if(typeof checkIn!=='undefined'){a=checkIn;b=(typeof checkOut!=='undefined')?checkOut:null;}}catch(e){}}
    if(!(a instanceof Date))return null;
    var n=(b instanceof Date)?Math.max(1,Math.round((b-a)/86400000)):1;
    return {start:loc(a),nights:n};
  }
  function paint(box,st,info){
    box.className='nbl-box'+(st&&st!=='idle'?' '+st:'');
    box.innerHTML=ICON[st]||ICON.idle;
    var t = st==='yes' ? ('Available'+(info&&info.free>0?' · '+info.free+' room'+(info.free==1?'':'s'):'')+' from '+fmt(info.start)+' for '+info.nights+' night'+(info.nights==1?'':'s'))
          : st==='no' ? ('Fully booked from '+fmt(info.start)+' for '+info.nights+' night'+(info.nights==1?'':'s'))
          : st==='checking' ? 'Checking availability…'
          : st==='err' ? 'Could not check right now — click to open NightsBridge'
          : 'Pick your dates to check availability';
    box.title=t+(st==='yes'||st==='no'?' — click to open NightsBridge':'');
    box.setAttribute('aria-label',box.title);
  }
  /* The block sits on the "N Night(s) Selected" line of the booking calendar; the old
     "Check Live Availability" button and its note are hidden (the block opens NightsBridge). */
  function ensure(){
    var n=document.getElementById('nights-count')||document.getElementById('nights');
    var line=n&&n.parentNode; if(!line||!/night\(s\)\s*selected/i.test(line.textContent||''))return null;
    if(!document.getElementById('nbl-css')){var s=document.createElement('style');s.id='nbl-css';s.textContent=CSS+'#nr-cal-avail{display:none!important}';document.head.appendChild(s);}
    if(line.offsetParent===null||!bbid())return null;
    var box=line.querySelector('.nbl-box');
    if(!box){
      line.style.display='flex';line.style.alignItems='center';line.style.justifyContent='center';line.style.flexWrap='wrap';
      box=document.createElement('span');box.setAttribute('role','button');box.tabIndex=0;box.style.marginLeft='18px';
      box.style.width='40px';box.style.height='40px';line.appendChild(box);
      box.addEventListener('click',function(){try{window.nrAvail();}catch(e){}});
      box.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();try{window.nrAvail();}catch(x){}}});
      paint(box,'idle');
    }
    return box;
  }
  function tick(){
    var box=ensure(); if(!box)return;
    var id=bbid(), d=dates();
    if(!id||!d){ if(cur!==''){cur='';} paint(box,'idle'); return; }
    var key=id+'|'+d.start+'|'+d.nights, info={start:d.start,nights:d.nights};
    if(key===cur){ var c=CACHE[key]; if(c&&c.st!=='checking') paint(box,c.st,Object.assign({},info,c)); return; }
    cur=key;
    if(CACHE[key]&&CACHE[key].st!=='checking'){paint(box,CACHE[key].st,Object.assign({},info,CACHE[key]));return;}
    CACHE[key]={st:'checking'}; paint(box,'checking',info);
    fetch('/api/nbavail?bbid='+encodeURIComponent(id)+'&start='+d.start+'&nights='+d.nights)
      .then(function(r){return r.json();})
      .then(function(j){CACHE[key]=(j&&j.ok)?{st:(j.available?'yes':'no'),free:j.free||0}:{st:'err'};if(cur===key)paint(box,CACHE[key].st==='err'?'idle':CACHE[key].st,Object.assign({},info,CACHE[key]));if(CACHE[key].st==='err')box.title='Could not check right now — click to open NightsBridge';})
      .catch(function(){CACHE[key]={st:'err'};if(cur===key){paint(box,'idle');box.title='Could not check right now — click to open NightsBridge';}});
  }
  function go(){ tick(); setInterval(tick,700); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
