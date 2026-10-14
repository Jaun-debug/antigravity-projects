/* ROUTE-PLANNER — public route planner on the namibiarates.com homepage.
   Public = RACK ONLY. Reads rack_2026 / rack_2027 from /assets/rates-index.json
   (never `rates`, which is trade net), photos from /assets/lodges-info.json,
   live availability from /api/nbavail for lodges in /assets/nightsbridge.json.
   Region links (NEXT) and travel-style tags (STY) are a proposal for Jaun to confirm. */
(function(){
  if (window.__nrRoutePlanner) return; window.__nrRoutePlanner = 1;

  // ---- Sandbox badge (shows on any host that is not namibiarates.com) ----
  try{ if(!/(^|\.)namibiarates\.com$/.test(location.hostname) && !document.getElementById('nr-sandbox')){
    var sb=document.createElement('div'); sb.id='nr-sandbox'; sb.textContent='SANDBOX COPY · not the live site';
    sb.style.cssText='position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:2147483647;background:#B89A6A;color:#fff;font:600 11px/1 Jost,system-ui,sans-serif;letter-spacing:.16em;padding:8px 14px;border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.25);pointer-events:none';
    (document.body||document.documentElement).appendChild(sb);
  }}catch(e){}

  // ---- Region model ----
  var FOLD = {
    'Windhoek':'Windhoek','Central Namibia':'Windhoek',
    'Kalahari':'Kalahari',
    'Sossusvlei':'Sossusvlei','Sossusvlei/Namib':'Sossusvlei','Naukluft':'Sossusvlei','Namib (Maltahöhe)':'Sossusvlei','Namib-Naukluft (Duwisib)':'Sossusvlei',
    'Fish River Canyon':'Fish River Canyon','Luderitz':'Lüderitz',
    'Swakopmund':'Swakopmund','Walvis Bay':'Swakopmund',
    'Damaraland':'Damaraland','Skeleton Coast':'Skeleton Coast',
    'Kaokoland':'Kaokoland','Opuwo':'Kaokoland','Epupa':'Kaokoland',
    'South Etosha':'Etosha South','Etosha':'Etosha South','West Etosha':'Etosha West','East Etosha':'Etosha East',
    'Caprivi':'Zambezi & Kavango','Chobe':'Zambezi & Kavango','Okavango/Kavango':'Zambezi & Kavango','Kavango (Okavango River)':'Zambezi & Kavango'
  };
  var NEXT = {
    'Windhoek':['Sossusvlei','Kalahari','Swakopmund','Etosha South','Etosha East','Damaraland'],
    'Kalahari':['Sossusvlei','Fish River Canyon','Windhoek'],
    'Sossusvlei':['Swakopmund','Lüderitz','Fish River Canyon','Kalahari','Windhoek'],
    'Fish River Canyon':['Lüderitz','Kalahari','Sossusvlei'],
    'Lüderitz':['Fish River Canyon','Sossusvlei'],
    'Swakopmund':['Damaraland','Skeleton Coast','Sossusvlei','Windhoek'],
    'Damaraland':['Etosha South','Etosha West','Skeleton Coast','Kaokoland','Swakopmund'],
    'Skeleton Coast':['Damaraland','Kaokoland'],
    'Kaokoland':['Damaraland','Etosha West'],
    'Etosha West':['Etosha South','Damaraland','Kaokoland'],
    'Etosha South':['Etosha East','Etosha West','Damaraland','Windhoek'],
    'Etosha East':['Etosha South','Zambezi & Kavango','Windhoek'],
    'Zambezi & Kavango':['Etosha East','Windhoek']
  };
  var STY = {
    'Windhoek':['City'],'Kalahari':['Landscape'],'Sossusvlei':['Landscape'],'Fish River Canyon':['Landscape'],
    'Lüderitz':['Coast'],'Swakopmund':['Coast'],'Damaraland':['Landscape','Remote'],'Skeleton Coast':['Coast','Remote'],
    'Kaokoland':['Culture','Remote'],'Etosha West':['Game'],'Etosha South':['Game'],'Etosha East':['Game'],'Zambezi & Kavango':['Game','Rivers']
  };
  var STYLES = ['Game','Landscape','Coast','Remote','Culture','Rivers'];

  var S = { year:'2026', styles:{}, route:[], pick:null, sort:'low', arrive:null, avail:{} };
  var DATA = { lodges:[], ready:false };
  var $ = function(id){ return document.getElementById(id); };
  var esc = function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); };
  var norm = function(s){ return String(s||'').toLowerCase().replace(/&amp;/g,'&').replace(/[^a-z0-9]/g,''); };
  var fmt = function(v){ return 'N$ ' + Math.round(v).toLocaleString('en-ZA').replace(/[  ]/g,' '); };

  function store(){ try{ localStorage.setItem('nr_route_v1', JSON.stringify({route:S.route, arrive:S.arrive, styles:S.styles})); }catch(e){} }
  function restore(){ try{ var j=JSON.parse(localStorage.getItem('nr_route_v1')||'null'); if(j){ S.route=j.route||[]; S.arrive=j.arrive||null; S.styles=j.styles||{}; } }catch(e){} }

  // Lowest per-person-sharing rack row; levies, singles, children, guides, camping excluded.
  function fromPrice(rows){
    if(!rows||!rows.length) return null;
    var best=null;
    rows.forEach(function(r){
      var n=String(r.n||''), p=+r.p;
      if(!(p>=200)) return;
      if(!/shar|double|dbl|twin/i.test(n)) return;
      if(/child|single|guide|pilot|levy|fee|camp\s*site|camping|extra|transfer|activity|drive|lunch|dinner/i.test(n)) return;
      if(best===null||p<best) best=p;
    });
    return best;
  }
  function price(l){ return S.year==='2027' ? l.b : l.a; }

  function load(){
    Promise.all([
      fetch('/assets/rates-index.json').then(function(r){return r.json();}),
      fetch('/assets/lodges-info.json').then(function(r){return r.json();}).catch(function(){return {};}),
      fetch('/assets/nightsbridge.json').then(function(r){return r.json();}).catch(function(){return {};})
    ]).then(function(res){
      var idx=res[0], info=res[1], nb=res[2];
      var byName={}; Object.keys(info||{}).forEach(function(k){ var v=info[k]; if(v&&v.name) byName[norm(v.name)]=v; });
      var nbBy={}; Object.keys(nb||{}).forEach(function(k){ var v=nb[k]; if(v&&v.nb){ nbBy[norm(k)]=v.nb; if(v.name) nbBy[norm(v.name)]=v.nb; } });
      var seen={};
      (idx.lodges||idx).forEach(function(l){
        var reg=FOLD[l.region]; if(!reg) return;
        var key=norm(l.name); if(seen[key]) return; seen[key]=1;
        var i=byName[key]||{};
        var img=(i.imgs&&i.imgs[0])||'';
        DATA.lodges.push({ n:l.name, r:reg, a:fromPrice(l.rack_2026), b:fromPrice(l.rack_2027),
          nb:nbBy[key]||null, img:img, url:i.url||'', lead:i.lead||'' });
      });
      DATA.ready=true;
      S.route=S.route.filter(function(s){ return lodge(s.l); });
      render();
    }).catch(function(){ var a=$('rp-next'); if(a) a.innerHTML='<p class="rp-muted">The planner could not load lodge data. Please refresh the page.</p>'; });
  }
  function lodge(n){ for(var i=0;i<DATA.lodges.length;i++) if(DATA.lodges[i].n===n) return DATA.lodges[i]; return null; }

  // ---- Dates ----
  function arriveDate(){ var v=S.arrive||($('rp-arrive')&&$('rp-arrive').value)||''; var d=v?new Date(v+'T12:00:00'):null; return d&&!isNaN(d)?d:null; }
  function plus(d,n){ var x=new Date(d); x.setDate(x.getDate()+n); return x; }
  function iso(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function dfmt(d){ return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}); }
  function stopDates(){ var d=arriveDate(); if(!d) return []; var out=[]; S.route.forEach(function(s){ out.push(new Date(d)); d=plus(d,s.nights); }); return out; }
  function nextCheckin(){ var d=arriveDate(); if(!d) return null; S.route.forEach(function(s){ d=plus(d,s.nights); }); return d; }

  // ---- Availability ----
  function availKey(id,ci,n){ return id+'|'+ci+'|'+n; }
  function checkAvail(l,ci,n,cb){
    if(!l.nb||!ci) return;
    var k=availKey(l.nb,ci,n); if(S.avail[k]!==undefined){ return; }
    S.avail[k]='loading';
    fetch('/api/nbavail?bbid='+encodeURIComponent(l.nb)+'&start='+ci+'&nights='+n).then(function(r){return r.json();})
      .then(function(j){ S.avail[k]= j&&j.ok ? (j.available?'yes':'no') : 'err'; cb&&cb(); })
      .catch(function(){ S.avail[k]='err'; cb&&cb(); });
  }
  function availState(l,ci,n){ if(!l.nb) return 'none'; if(!ci) return 'nodate'; var v=S.avail[availKey(l.nb,ci,n)]; return v||'idle'; }
  function availBadge(st){
    if(st==='yes') return '<span class="rp-av ok"><i></i>Available</span>';
    if(st==='no') return '<span class="rp-av no"><i></i>Full on these dates</span>';
    if(st==='loading'||st==='idle') return '<span class="rp-av ld"><i></i>Checking…</span>';
    if(st==='nodate') return '<span class="rp-av"><i></i>Live availability</span>';
    return '';
  }

  // ---- Render ----
  function lastRegion(){ return S.route.length ? lodge(S.route[S.route.length-1].l).r : 'Windhoek'; }
  function styleOn(){ return Object.keys(S.styles).filter(function(k){return S.styles[k];}); }
  function matches(r){ var on=styleOn(); if(!on.length) return true; return (STY[r]||[]).some(function(t){ return on.indexOf(t)>=0; }); }

  function renderRoute(){
    var el=$('rp-route'); if(!el) return;
    var ds=stopDates(), d0=arriveDate();
    var h='<li class="rp-stop rp-start"><span class="rp-dot">W</span><div class="rp-card"><div><div class="rp-reg">Arrive</div><h3>Windhoek</h3><div class="rp-when">'+(d0?dfmt(d0):'Choose an arrival date above')+'</div></div></div></li>';
    S.route.forEach(function(s,i){
      var l=lodge(s.l); if(!l) return; var p=price(l); var din=ds[i], dout=din?plus(din,s.nights):null;
      var st=availState(l, din?iso(din):null, s.nights);
      h+='<li class="rp-stop"><span class="rp-dot">'+(i+1)+'</span><div class="rp-card">'+
        '<div class="rp-cmain"><div class="rp-reg">'+esc(l.r)+'</div><h3>'+(l.url?'<a href="'+esc(l.url)+'">'+esc(l.n)+'</a>':esc(l.n))+'</h3>'+
        '<div class="rp-when">'+(din?dfmt(din)+' – '+dfmt(dout):'')+' '+availBadge(st)+'</div></div>'+
        '<div class="rp-cside"><div class="rp-step" role="group" aria-label="Nights at '+esc(l.n)+'"><button type="button" data-i="'+i+'" data-d="-1" aria-label="One night less">−</button><span>'+s.nights+' night'+(s.nights>1?'s':'')+'</span><button type="button" data-i="'+i+'" data-d="1" aria-label="One night more">+</button></div>'+
        '<div class="rp-price">'+(p?'<b>'+fmt(p)+'</b><small>pp sharing / night</small>':'<span class="rp-muted">No '+S.year+' rate yet</span>')+'</div>'+
        '<button type="button" class="rp-x" data-rm="'+i+'">Remove</button></div></div></li>';
      if(din) checkAvail(l, iso(din), s.nights, renderRoute);
    });
    el.innerHTML=h;
  }

  function regionStats(r){ var ls=DATA.lodges.filter(function(x){return x.r===r;}); var ps=ls.map(price).filter(Boolean); return {n:ls.length, live:ls.filter(function(x){return x.nb;}).length, from:ps.length?Math.min.apply(null,ps):null}; }

  function renderNext(){
    var el=$('rp-next'); if(!el) return;
    if(!DATA.ready){ el.innerHTML='<p class="rp-muted">Loading lodges and rates…</p>'; return; }
    var from=lastRegion(); var opts=(NEXT[from]||[]).slice();
    opts.sort(function(a,b){ return matches(b)-matches(a); });
    if(S.pick&&opts.indexOf(S.pick)<0) S.pick=null;
    var h='<h3 class="rp-nh">Where next from <em>'+esc(from)+'</em>?</h3><p class="rp-muted">'+(styleOn().length?'Regions that match your travel style come first.':'Pick a region, then a lodge. Choose a travel style above to narrow it down.')+'</p><div class="rp-regs">';
    opts.forEach(function(r){ var st=regionStats(r);
      h+='<button type="button" class="rp-rc'+(matches(r)?'':' dim')+'" aria-pressed="'+(S.pick===r)+'" data-r="'+esc(r)+'"><span class="rp-rn">'+esc(r)+'</span><span class="rp-tags">'+(STY[r]||[]).map(function(t){return '<span>'+t+'</span>';}).join('')+'</span><span class="rp-meta">'+(st.from?'from <b>'+fmt(st.from)+'</b> · ':'')+st.n+' lodges · '+st.live+' live</span></button>'; });
    h+='</div><div id="rp-lodges"></div>';
    el.innerHTML=h; renderLodges();
  }

  function renderLodges(){
    var el=$('rp-lodges'); if(!el) return; if(!S.pick){ el.innerHTML=''; return; }
    var ci=nextCheckin(), ciIso=ci?iso(ci):null, n=2;
    var ls=DATA.lodges.filter(function(x){return x.r===S.pick;});
    var P=function(l){ var p=price(l); return p==null?Infinity:p; };
    var A=function(l){ var s=availState(l,ciIso,n); return s==='yes'?0:s==='nodate'||s==='idle'||s==='loading'?1:s==='none'?2:3; };
    if(S.sort==='low') ls.sort(function(x,y){return P(x)-P(y);});
    if(S.sort==='high') ls.sort(function(x,y){return (price(y)||-1)-(price(x)||-1);});
    if(S.sort==='live') ls.sort(function(x,y){return A(x)-A(y)||P(x)-P(y);});
    var h='<div class="rp-lbar"><strong>Lodges in '+esc(S.pick)+'</strong><div class="rp-seg" role="group" aria-label="Sort lodges">'+
      [['low','Lowest price'],['high','Highest price'],['live','Available first']].map(function(o){return '<button type="button" data-sort="'+o[0]+'" aria-pressed="'+(S.sort===o[0])+'">'+o[1]+'</button>';}).join('')+'</div></div>';
    if(S.sort==='live'&&!ci) h+='<p class="rp-muted">Choose an arrival date above to check live availability.</p>';
    h+='<div class="rp-lodgegrid">';
    ls.forEach(function(l){ var p=price(l); var st=availState(l,ciIso,n);
      h+='<article class="rp-lc"><div class="rp-ph"'+(l.img?' style="background-image:url(\''+esc(l.img)+'\')"':'')+'>'+availBadge(st)+'</div>'+
        '<div class="rp-lb"><h4>'+(l.url?'<a href="'+esc(l.url)+'">'+esc(l.n)+'</a>':esc(l.n))+'</h4>'+
        '<div class="rp-lrow"><div class="rp-price">'+(p?'<b>'+fmt(p)+'</b><small>from, pp sharing / night</small>':'<span class="rp-muted">No '+S.year+' rate yet</span>')+'</div>'+
        '<button type="button" class="rp-add" data-add="'+esc(l.n)+'"'+(p?'':' disabled')+'>Add · 2 nights</button></div></div></article>';
      if(ciIso&&(S.sort==='live'||l.nb)) checkAvail(l,ciIso,n,renderLodges);
    });
    el.innerHTML=h+'</div>';
  }

  function renderSum(){
    var el=$('rp-sum'); if(!el) return;
    var nights=S.route.reduce(function(t,s){return t+s.nights;},0), d=arriveDate();
    var tot=0, miss=0; S.route.forEach(function(s){ var l=lodge(s.l); var p=l&&price(l); if(p) tot+=p*s.nights; else miss++; });
    var regs=['Windhoek'].concat(S.route.map(function(s){var l=lodge(s.l);return l?l.r:'';})).filter(function(r,i,a){return r&&a.indexOf(r)===i;});
    el.innerHTML='<div class="rp-sh"><div class="rp-eb">Trip summary</div><h3>'+esc(regs.join(' → '))+'</h3></div><div class="rp-sb">'+
      '<div class="rp-kv"><span>Dates</span><span>'+(d?dfmt(d)+' – '+dfmt(plus(d,nights))+' '+plus(d,nights).getFullYear():'—')+'</span></div>'+
      '<div class="rp-kv"><span>Stops</span><span>'+S.route.length+'</span></div><div class="rp-kv"><span>Nights</span><span>'+nights+'</span></div>'+
      '<div class="rp-total"><span>Accommodation from</span><b>'+fmt(tot)+(miss?' +':'')+'</b></div>'+
      '<p class="rp-fine">Per person sharing, '+S.year+' rack rates, accommodation only. Lowest room on each lodge\'s sheet; meal plans and seasons vary.</p>'+
      '<a class="rp-cta" href="'+mailto()+'">Enquire about this route</a>'+
      (S.route.length?'<button type="button" class="rp-clear" id="rp-clear">Start again</button>':'')+'</div>';
  }
  function mailto(){
    var ds=stopDates(), lines=['Route enquiry from namibiarates.com',''];
    var d=arriveDate(); lines.push('Arrive Windhoek: '+(d?iso(d):'dates to confirm'));
    S.route.forEach(function(s,i){ var l=lodge(s.l); if(!l) return; lines.push((i+1)+'. '+l.n+' ('+l.r+') — '+s.nights+' night'+(s.nights>1?'s':'')+(ds[i]?', from '+iso(ds[i]):'')); });
    lines.push('','Rate year: '+S.year);
    return 'mailto:bookings@desert-tracks.com?subject='+encodeURIComponent('Route enquiry — namibiarates.com')+'&body='+encodeURIComponent(lines.join('\n'));
  }
  function render(){ renderRoute(); renderNext(); renderSum(); store(); }

  // ---- Wire up ----
  function syncYear(y){ S.year=y; if(DATA.ready) render(); }
  function init(){
    restore();
    var ar=$('rp-arrive');
    if(ar){ if(S.arrive) ar.value=S.arrive; ar.addEventListener('change',function(){ S.arrive=ar.value||null; var d=arriveDate(); if(d){ var y=String(d.getFullYear()); if((y==='2026'||y==='2027')&&y!==S.year&&typeof window.setYear==='function') window.setYear(y); } render(); }); }
    var sty=$('rp-styles');
    if(sty){ sty.innerHTML=STYLES.map(function(s){return '<button type="button" class="rp-chip" data-s="'+s+'" aria-pressed="'+(!!S.styles[s])+'">'+s+'</button>';}).join('');
      sty.addEventListener('click',function(e){ var b=e.target.closest('.rp-chip'); if(!b) return; var s=b.dataset.s; S.styles[s]=!S.styles[s]; b.setAttribute('aria-pressed',!!S.styles[s]); render(); }); }
    var go=$('rp-go'); if(go) go.addEventListener('click',function(){ var t=$('nr-route'); if(t) t.scrollIntoView({behavior:'smooth',block:'start'}); });
    document.addEventListener('click',function(e){
      var b=e.target.closest('#nr-route button'); if(!b) return;
      if(b.dataset.rm!=null){ S.route.splice(+b.dataset.rm,1); S.pick=null; render(); return; }
      if(b.dataset.i!=null&&b.dataset.d){ var i=+b.dataset.i; S.route[i].nights=Math.max(1,Math.min(14,S.route[i].nights+(+b.dataset.d))); render(); return; }
      if(b.dataset.r){ S.pick=b.dataset.r; renderNext(); return; }
      if(b.dataset.sort){ S.sort=b.dataset.sort; renderLodges(); return; }
      if(b.dataset.add){ S.route.push({l:b.dataset.add,nights:2}); S.pick=null; render(); return; }
      if(b.id==='rp-clear'){ S.route=[]; S.pick=null; render(); }
    });
    // Follow the site's own season toggle.
    var orig=window.setYear;
    if(typeof orig==='function'){ window.setYear=function(y){ var r=orig.apply(this,arguments); syncYear(String(y)); return r; }; }
    if(typeof window.currentYear!=='undefined'&&window.currentYear) S.year=String(window.currentYear);
    render(); load();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
