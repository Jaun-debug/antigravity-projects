/* Quantity steppers site-wide: every number box that counts something (rooms, guests, nights, pax,
   quantities) becomes [-] n [+]. Money boxes (amounts, rates, prices, costs) are left as typed fields.
   The buttons fire the same input/change events typing does, so the page's own totals recalculate as
   before. Loaded by site-chrome.js and enquiry-wizard.js; the builder carries its own copy. */
;(function(){"use strict";
  if(window.__nrStepper)return; window.__nrStepper=1;
  var css=".nr-step{display:inline-flex;align-items:stretch;border:1px solid #dcdcdc;border-radius:6px;overflow:hidden;background:#fff;vertical-align:middle;height:42px;flex:0 0 auto}"
   +".nr-step button{flex:0 0 38px;width:38px;border:0;background:transparent;color:#444;font:inherit;font-size:18px;line-height:1;cursor:pointer;padding:0;margin:0;transition:background .15s;box-shadow:none}"
   +".nr-step button:hover{background:rgba(135,169,150,.14)}.nr-step button:active{background:rgba(135,169,150,.28)}"
   +".nr-step input{width:52px!important;min-width:0!important;max-width:none!important;height:auto!important;text-align:center!important;border:0!important;border-left:1px solid #cfcfcf!important;border-right:1px solid #cfcfcf!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;margin:0!important;padding:0 4px!important;font-size:1rem!important;color:#444!important;-moz-appearance:textfield;outline:none}"
   +".nr-step input::-webkit-outer-spin-button,.nr-step input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}"
   +"td .nr-step,.nr-step.sm{height:36px}td .nr-step button,.nr-step.sm button{flex-basis:30px;width:30px;font-size:16px}td .nr-step input{width:40px!important}";
  var MONEY=/amount|rate|price|cost|fee|tariff|value|budget|deposit|total|n\$|usd|zar/i;
  function isQty(el){
    if(el.type!=='number'||el.disabled||el.readOnly||el.closest('.nr-step'))return false;
    if(el.getAttribute('data-nostep')!=null)return false;
    if(el.getAttribute('data-f')==='amount')return false;
    var ph=el.getAttribute('placeholder')||''; if(/\d\.\d/.test(ph))return false;
    var st=el.getAttribute('step'); if(st&&/\.0*[1-9]/.test(st)&&parseFloat(st)<0.5)return false;   // 0.01 = money
    var id=(el.id||'')+' '+(el.name||'')+' '+(el.className||'');
    if(el.classList.contains('qty')||el.classList.contains('rate-qty')||el.classList.contains('qbox'))return true;
    if(MONEY.test(id))return false;
    var lab=el.closest('label,.form-group,.fld,.fld2'); if(lab&&MONEY.test((lab.textContent||'').slice(0,60)))return false;
    return true;
  }
  function bump(el,dir){
    var st=parseFloat(el.step); if(!(st>0))st=1;
    var v=parseFloat(el.value); if(isNaN(v))v=0;
    v=Math.round((v+dir*st)*100)/100;
    var mn=parseFloat(el.min); if(!isNaN(mn)&&v<mn)v=mn;
    var mx=parseFloat(el.max); if(!isNaN(mx)&&v>mx)v=mx;
    el.value=v;
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
  }
  /* Take the look of the box being replaced (height, border, corners, fill), so the stepper is the same
     thickness as the fields beside it on that page. */
  function look(el,w){try{var c=getComputedStyle(el),h=parseFloat(c.height);
    var bw=parseFloat(c.borderTopWidth)||0,bc=c.borderTopColor,st=c.borderTopStyle;
    if(el.offsetParent===null){ /* hidden right now (closed tab or season pane): measure a copy */
      try{var k=el.cloneNode(false);k.style.position='absolute';k.style.visibility='hidden';k.style.left='-9999px';k.style.top='0';
        var host=el.parentNode&&el.parentNode.cloneNode(false);if(host){host.style.cssText+=';display:block!important;position:absolute;left:-9999px;top:0;visibility:hidden';host.appendChild(k);document.body.appendChild(host);}else document.body.appendChild(k);
        h=k.getBoundingClientRect().height;(host||k).remove();}catch(e){}
    }
    if(h>=26){w.style.height=Math.round(h)+'px';}
    if(bw>0&&st!=='none'&&bc&&!/rgba\(0, 0, 0, 0\)/.test(bc)){w.style.border=bw+'px solid '+bc;w.setAttribute('data-bc',bc);}
    var r=c.borderTopLeftRadius; if(r&&r!=='0px')w.style.borderRadius=r;
    var bg=c.backgroundColor; if(bg&&!/rgba\(0, 0, 0, 0\)/.test(bg))w.style.background=bg;
  }catch(e){}}
  function wrap(el){
    var w=document.createElement('span');w.className='nr-step';look(el,w);
    var m=document.createElement('button');m.type='button';m.textContent='-';m.setAttribute('aria-label','Decrease');m.tabIndex=-1;
    var p=document.createElement('button');p.type='button';p.textContent='+';p.setAttribute('aria-label','Increase');p.tabIndex=-1;
    el.parentNode.insertBefore(w,el);w.appendChild(m);w.appendChild(el);w.appendChild(p);
    var bc=w.getAttribute('data-bc'); if(bc){el.style.setProperty('border-left','1px solid '+bc,'important');el.style.setProperty('border-right','1px solid '+bc,'important');}
    m.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();bump(el,-1);});
    p.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();bump(el,1);});
  }
  var queued=false;
  function scan(){queued=false;try{document.querySelectorAll('input[type="number"]').forEach(function(el){if(isQty(el))wrap(el);});}catch(e){}}
  function later(){if(!queued){queued=true;(window.requestAnimationFrame||setTimeout)(scan);}}
  function go(){
    if(!document.getElementById('nr-step-css')){var s=document.createElement('style');s.id='nr-step-css';s.textContent=css;(document.head||document.documentElement).appendChild(s);}
    scan();
    try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true});}catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
