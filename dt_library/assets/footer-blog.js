/* footer-blog.js — FOOTER-BLOG: "From the Blog" row with the 5 latest lodge guides in the shared footer.
   Loaded by site-chrome.js. Posts come from /assets/blog-posts.json (written by tools/build_blog.py). 10 Oct 2026. */
(function(){
  if(window.__nrFooterBlog)return;window.__nrFooterBlog=1;
  var CSS=".nr-fblog{max-width:1200px;margin:0 auto;padding:34px 0 36px;border-bottom:1px solid rgba(255,255,255,.1)}"+
  ".nr-fblog-head{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:18px}"+
  ".nr-fblog-head h4{font-family:'Cinzel',serif;font-size:.8rem;text-transform:uppercase;letter-spacing:2px;color:#fff;font-weight:400;margin:0}"+
  ".nr-fblog-head a{font-size:.78rem;letter-spacing:1px;text-transform:uppercase;color:#a48256;text-decoration:none}"+
  ".nr-fblog-head a:hover{color:#fff}"+
  ".nr-fblog-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}"+
  ".nr-fblog-card{display:flex;flex-direction:column;text-decoration:none;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;overflow:hidden;transition:border-color .25s,transform .25s}"+
  ".nr-fblog-card:hover{border-color:#a48256;transform:translateY(-2px)}"+
  ".nr-fblog-card img{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:cover;background:#2c2723}"+
  ".nr-fblog-card span{display:block;padding:12px 14px 0;font-size:.62rem;letter-spacing:1.6px;text-transform:uppercase;color:#87a996;font-weight:500}"+
  ".nr-fblog-card strong{display:block;padding:5px 14px 15px;font-family:'Jost',sans-serif;font-weight:400;font-size:.86rem;line-height:1.4;color:rgba(255,255,255,.85)}"+
  "@media(max-width:1000px){.nr-fblog-grid{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:6px}.nr-fblog-card{flex:0 0 220px;scroll-snap-align:start}}";
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function thumb(u){return String(u).replace("/c1920x1080/","/c600x375/");}
  function render(posts){
    var f=document.querySelector("footer.sc-footer")||document.querySelector("footer.site-footer");if(!f||f.querySelector(".nr-fblog"))return !!f;
    if(!document.getElementById("nr-fblog-css")){var st=document.createElement("style");st.id="nr-fblog-css";st.textContent=CSS;document.head.appendChild(st);}
    var h='<div class="nr-fblog"><div class="nr-fblog-head"><h4>From the Blog</h4><a href="/blog/">All lodge guides &rarr;</a></div><div class="nr-fblog-grid">';
    posts.slice(0,5).forEach(function(p){h+='<a class="nr-fblog-card" href="'+esc(p.url)+'"><img src="'+esc(thumb(p.img))+'" alt="'+esc(p.lodge)+'" loading="lazy" width="600" height="375"><span>'+esc(p.lodge)+'</span><strong>'+esc(p.title)+'</strong></a>';});
    h+='</div></div>';
    var bottom=f.querySelector(".footer-bottom");
    if(bottom)bottom.insertAdjacentHTML("beforebegin",h);else f.insertAdjacentHTML("beforeend",h);
    return true;
  }
  fetch("/assets/blog-posts.json",{cache:"no-cache"}).then(function(r){return r.ok?r.json():[];}).then(function(posts){
    if(!posts||!posts.length)return;
    var n=0;(function tryIt(){if(render(posts)||++n>40)return;setTimeout(tryIt,150);})();
  }).catch(function(){});
})();
