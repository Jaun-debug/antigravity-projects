/* Lodge pages: section bar under the hero (Overview / Rates / Information / Location / Enquire),
   in the style of the Desert Tracks lodge pages. Sticks under the fixed header; highlights the
   section in view. Built from what is on the page; a tab is left out when its section is missing. */
(function(){
  function hdr(){var h=document.querySelector(".main-header");return h?Math.round(h.getBoundingClientRect().bottom):76;}
  function build(){
    if(document.getElementById("nr-ltabs"))return;
    var hero=document.querySelector(".hero");if(!hero||!document.querySelector(".hero-inner"))return;
    var secs=[].slice.call(document.querySelectorAll("section"));
    function find(fn){for(var i=0;i<secs.length;i++)if(fn(secs[i]))return secs[i];return null;}
    var items=[];
    var ov=hero.nextElementSibling;while(ov&&ov.tagName!=="SECTION")ov=ov.nextElementSibling;
    if(ov)items.push(["Overview",ov]);
    var rt=document.getElementById("rate-tables");var rs=rt&&rt.closest("section");if(rs)items.push(["Rates",rs]);
    var inf=find(function(s){var h=s.querySelector("h3");return h&&/good to know|experiences/i.test(h.textContent);});if(inf)items.push(["Information",inf]);
    if(typeof window.nrOpenMap==="function")items.push(["Location",null]);
    var enq=find(function(s){var h=s.querySelector("h2");return h&&/^\s*enquire/i.test(h.textContent);});if(enq)items.push(["Enquire",enq]);
    if(items.length<2)return;
    var bar=document.createElement("nav");bar.id="nr-ltabs";bar.setAttribute("aria-label","Sections");
    var inner=document.createElement("div");inner.className="nr-ltabs-in";bar.appendChild(inner);
    var links=[];
    items.forEach(function(it){
      var a=document.createElement("a");a.href="#";a.textContent=it[0];
      a.addEventListener("click",function(e){e.preventDefault();
        if(!it[1]){window.nrOpenMap();return;}
        var y=it[1].getBoundingClientRect().top+window.pageYOffset-hdr()-bar.offsetHeight-8;
        window.scrollTo({top:y,behavior:"smooth"});});
      inner.appendChild(a);if(it[1])links.push([a,it[1]]);
    });
    hero.parentNode.insertBefore(bar,hero.nextSibling);
    function spy(){bar.style.top=hdr()+"px";var mark=hdr()+bar.offsetHeight+40,cur=null;
      links.forEach(function(l){if(l[1].getBoundingClientRect().top<=mark)cur=l[0];});
      links.forEach(function(l){l[0].classList.toggle("on",l[0]===cur);});}
    window.addEventListener("scroll",spy,{passive:true});window.addEventListener("resize",spy);spy();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build);else build();
  window.addEventListener("load",build);
})();
