/* Rate sheets (signed-in lodge pages and a lodge opened inside a group sheet): photo hero in the
   style of the public lodge pages - big title bottom-left over the lodge's first photo, with
   "Lodge rates" and "Availability" buttons - and the sheet's own tab bar restyled as the sticky
   section bar under the header. Built from what is on the page; nothing is invented. */
(function(){
  if(!/^\/ratesheets\//.test(location.pathname))return;
  var CSS=
   "#nr-rhero{position:relative;width:100vw;margin-left:calc(50% - 50vw);margin-top:0;height:calc(100vh - 79px - 64px);height:calc(100svh - 79px - 64px);min-height:380px;background:#2b2b2b center/cover no-repeat;display:flex;align-items:flex-end;margin-bottom:0;box-sizing:border-box}"
  +"#nr-rhero::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.22) 55%,rgba(0,0,0,.08) 100%),linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.4))}"
  +"#nr-rhero .in{position:relative;z-index:2;padding:0 160px 9vh max(28px,11vw);color:#fff;text-align:left}"
  +"#nr-rhero .eb{font-family:var(--font-body,'Jost',sans-serif);text-transform:uppercase;letter-spacing:5px;font-size:.8rem;color:#fff}"
  +"#nr-rhero h1{font-family:var(--font-head,'Cinzel',serif)!important;font-size:clamp(1.9rem,3.8vw,3.1rem)!important;font-weight:400!important;line-height:1.12!important;letter-spacing:2px!important;margin:14px 0 26px!important;max-width:18em;color:rgba(255,255,255,.9)!important;text-shadow:0 2px 14px rgba(0,0,0,.25)}"
  +"#nr-rhero button{font-family:var(--font-body,'Jost',sans-serif);text-transform:uppercase;letter-spacing:4px;font-size:.74rem;padding:15px 30px;margin:0 14px 10px 0;border-radius:2px;cursor:pointer;color:#fff;background:transparent;border:1px solid rgba(255,255,255,.85);transition:.2s}"
  +"#nr-rhero button.solid{background:rgba(138,109,69,.92);border-color:rgba(164,130,86,.95)}#nr-rhero button:hover{filter:brightness(1.08)}"
  +".nr-rh-hide{display:none!important}"+"#nr-rhero .bk{position:absolute;top:16px;left:28px;z-index:4;color:#fff;background:none;border:0;padding:0;margin:0;font-size:.76rem;letter-spacing:1.5px;text-transform:uppercase;text-shadow:0 1px 10px rgba(0,0,0,.6)}"+"#nr-rhero .th{position:absolute;right:26px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:10px;z-index:4;max-height:calc(100% - 48px);overflow:hidden}"+"#nr-rhero .th img{width:96px;height:62px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid rgba(255,255,255,.45);box-shadow:0 6px 18px rgba(0,0,0,.4);opacity:.85;transition:.25s}#nr-rhero .th img.on,#nr-rhero .th img:hover{border-color:#fff;opacity:1}"+"#detail-view>.tabs.tabs{width:100vw;margin:0 0 36px calc(50% - 50vw)!important;padding:0 max(28px,11vw)!important;box-sizing:border-box}"+"@media(max-width:760px){#nr-rhero .th img{width:54px;height:36px}#nr-rhero .th{right:10px;gap:7px}#nr-rhero .in{padding-right:72px}#detail-view>.tabs{padding:0 20px!important}}"
  +"#detail-view .tabs{position:sticky!important;top:var(--nr-hdr,76px)!important;z-index:900!important;background:#fff!important;border-radius:0!important;box-shadow:none!important;border:0!important;border-bottom:1px solid rgba(0,0,0,.08)!important;gap:clamp(16px,2.4vw,44px)!important;padding:0 22px!important;overflow-x:auto!important;scrollbar-width:none}"
  +"#detail-view .tab-btn{flex:none;background:none!important;border:0!important;border-bottom:2px solid transparent!important;border-radius:0!important;padding:22px 0 20px!important;font-size:.72rem!important;letter-spacing:3px!important;color:#3c3530!important;box-shadow:none!important}"
  +"#detail-view .tab-btn:hover,#detail-view .tab-btn.active{color:var(--gold,#a48256)!important;border-bottom-color:var(--gold,#a48256)!important}"
  +"@media(max-width:760px){#nr-rhero{height:calc(100vh - 72px - 52px);height:calc(100svh - 72px - 52px)}#nr-rhero .in{padding:0 24px 48px}#nr-rhero button{padding:12px 18px;letter-spacing:2.5px}#detail-view .tab-btn{padding:16px 0 14px!important;letter-spacing:2.5px!important;font-size:.68rem!important}}";
  CSS+="#nr-addtab,#nr-backbuilder,#nr-cart{display:none!important}"
  +"#detail-view .tabs .nr-tab-add{margin-left:auto;flex:none;background:none;border:0;border-bottom:2px solid transparent;padding:22px 0 20px;font-family:var(--font-body,'Jost',sans-serif);font-size:.72rem;letter-spacing:3px;text-transform:uppercase;color:var(--gold,#a48256);cursor:pointer;white-space:nowrap}"
  +"#detail-view .tabs .nr-tab-add:hover{border-bottom-color:var(--gold,#a48256)}"
  +"#nr-navit .nr-cnt{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;margin-left:6px;padding:0 5px;border-radius:9px;background:var(--gold,#a48256);color:#fff;font-size:.62rem;letter-spacing:0;vertical-align:middle}"
  +"@media(max-width:760px){#detail-view .tabs .nr-tab-add{padding:16px 0 14px;letter-spacing:2.5px;font-size:.68rem}}";
  function css(){if(document.getElementById("nr-rhero-css"))return;var s=document.createElement("style");s.id="nr-rhero-css";s.textContent=CSS;(document.head||document.documentElement).appendChild(s);}
  function txt(el){return el?(el.textContent||"").replace(/\s+/g," ").trim():"";}
  function photo(dv,name){
    var im=dv.querySelector("#nr-photo-strip img[src],#d-gallery-full img[src],.lodge-gallery img[src],.detail-gallery img[src]");
    if(im&&im.getAttribute("src"))return im.getAttribute("src");
    var cards=document.querySelectorAll(".lodge-card");
    for(var i=0;i<cards.length;i++){var n=cards[i].querySelector(".lodge-card-name"),c=cards[i].querySelector(".lodge-card-img");if(c&&(!name||txt(n)===name))return c.getAttribute("src");}
    return "";
  }
  function tab(re){var bs=document.querySelectorAll("#detail-view .tab-btn");for(var i=0;i<bs.length;i++)if(re.test(txt(bs[i])))return bs[i];return bs[0]||null;}
  function go(b){if(!b)return;b.click();var t=document.querySelector("#detail-view .tabs");if(t){var hd=document.querySelector(".main-header");var h=hd?hd.getBoundingClientRect().bottom:76;window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-h-2,behavior:"smooth"});}}
  function add(btn){try{if(typeof window.nrAddCurrentLodge==="function"){window.nrAddCurrentLodge(btn);setTimeout(navCount,300);}}catch(e){}}
  function cnt(){try{return window.NRItinerary?window.NRItinerary.count():0;}catch(e){return 0;}}
  function navCount(){var b=document.querySelector("#nr-navit .nr-cnt");if(!b)return;var n=cnt();b.textContent=n;b.style.display=n?"":"none";}
  function nav(){
    if(document.getElementById("nr-navit"))return navCount();
    var nl=document.querySelector(".main-header .nav-links");if(!nl)return;
    var d=document.createElement("div");d.className="nav-item-dropdown";d.id="nr-navit";
    d.innerHTML='<a class="nav-link" href="/itinerary/">My itinerary<span class="nr-cnt"></span> &#9662;</a><div class="dropdown-menu single-column"><a href="/itinerary/">View itinerary</a><a href="/builder/">Back to builder</a></div>';
    var b=nl.querySelector(".enquire-now-btn,#hdr-agent-btn");if(b)nl.insertBefore(d,b);else nl.appendChild(d);
    var mm=document.querySelector("#mobile-menu .mm-section, #mobile-menu nav");
    navCount();window.addEventListener("storage",navCount);
  }
  function tabAdd(dv){var t=dv.querySelector(".tabs");if(!t||t.querySelector(".nr-tab-add"))return;var b=document.createElement("button");b.type="button";b.className="nr-tab-add";b.textContent="+ Add to itinerary";b.onclick=function(){add(b);};t.appendChild(b);}
  function build(){try{nav();
    var dv=document.getElementById("detail-view");if(!dv)return;
    var hd=document.querySelector(".main-header");document.documentElement.style.setProperty("--nr-hdr",(hd?Math.round(hd.getBoundingClientRect().bottom):76)+"px");
    var h1=dv.querySelector(".intro-block h1,.detail-title");var loc=dv.querySelector(".intro-loc,.detail-location");
    var name=txt(h1);if(!name)return;
    css();
    var hero=document.getElementById("nr-rhero");
    if(!hero){hero=document.createElement("div");hero.id="nr-rhero";
      hero.innerHTML='<div class="in"><div class="eb"></div><h1></h1><button type="button" class="solid">Lodge rates</button><button type="button">Availability</button><button type="button" class="nr-add">+ Add to itinerary</button></div>';
      var bs=hero.querySelectorAll("button");bs[0].onclick=function(){go(tab(/rate/i));};bs[1].onclick=function(){go(tab(/book|availab/i));};bs[2].onclick=function(){add(bs[2]);};
      dv.insertBefore(hero,dv.firstChild);
      var back=dv.querySelector(".back-btn");if(back){var bk=document.createElement("button");bk.type="button";bk.className="bk";bk.innerHTML="&#8592; "+(txt(back).replace(/^[^A-Za-z]+/,"")||"Back");bk.onclick=function(){back.click();};hero.appendChild(bk);back.classList.add("nr-rh-hide");}
      var th=document.createElement("div");th.className="th";hero.appendChild(th);}
    tabAdd(dv);
    var tabs=dv.querySelector(".tabs");if(tabs&&tabs.previousElementSibling!==hero)dv.insertBefore(tabs,hero.nextSibling);
    var pt=parseFloat(getComputedStyle(dv).paddingTop)||0;var mt=pt?(-pt)+"px":"";if(hero.style.marginTop!==mt)hero.style.marginTop=mt;
    if(hero.getAttribute("data-n")===name&&hero.style.backgroundImage)return;
    hero.setAttribute("data-n",name);
    hero.querySelector(".eb").textContent=txt(loc);hero.querySelector("h1").textContent=name;
    var p=photo(dv,name);hero.style.backgroundImage=p?"url('"+p.replace(/'/g,"%27")+"')":"";
    var srcs=[];[].forEach.call(dv.querySelectorAll("#nr-photo-strip img[src],#d-gallery-full img[src],.lodge-gallery img[src]"),function(i){var u=i.getAttribute("src");if(u&&srcs.indexOf(u)<0)srcs.push(u);});
    var th=hero.querySelector(".th");th.innerHTML="";srcs.slice(0,6).forEach(function(u,k){var i=document.createElement("img");i.src=u;i.alt="";i.loading="lazy";if(k===0)i.className="on";i.onerror=function(){i.remove();};
      i.onclick=function(){hero.style.backgroundImage="url('"+u.replace(/'/g,"%27")+"')";[].forEach.call(th.children,function(x){x.classList.toggle("on",x===i);});};th.appendChild(i);});
    th.style.display=srcs.length>1?"":"none";
    var strip=document.getElementById("nr-photo-strip");if(strip&&srcs.length>1)strip.classList.add("nr-rh-hide");
    h1.classList.add("nr-rh-hide");if(loc)loc.classList.add("nr-rh-hide");
  }catch(e){}}
  function init(){build();try{var t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(build,150);}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["style"]});}catch(e){}}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
