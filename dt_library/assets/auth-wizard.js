(function(){
  if(window.__authWizard)return;window.__authWizard=1;
  var BG='https://wetu.com/imageHandler/c1920x1080/126088/hoanib_valley_camp_-_aerial_view.jpg?fmt=jpg';
  var AGENTS=['Wilderness Travel','andBeyond','Abercrombie & Kent','Jenman Safaris','Pulse Africa','Sense of Africa','Cedarberg Travel','Expert Africa','Rhino Africa','Go2Africa','Safari Bookings','Africa Odyssey'];
  var CSS=`
  #aw-root *{box-sizing:border-box}
  #aw-ov{position:fixed;inset:0;z-index:2147483000;display:none;flex-direction:column;align-items:center;justify-content:flex-start;overflow-y:auto;background:#1f1b16 url('${BG}') center/cover no-repeat fixed;font-family:'Jost',sans-serif;color:#fff}
  #aw-ov.open{display:flex}
  #aw-ov .aw-dark{position:fixed;inset:0;background:rgba(28,24,19,.62);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);z-index:0}
  #aw-ov .aw-close{position:fixed;top:20px;right:26px;width:42px;height:42px;border-radius:50%;border:1.5px solid rgba(255,255,255,.45);background:rgba(28,24,19,.25);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:5;transition:.2s}
  #aw-ov .aw-close:hover{background:rgba(255,255,255,.12);border-color:#fff}
  #aw-ov .aw-back{position:fixed;top:28px;left:28px;background:none;border:none;color:#fff;font-size:12px;font-weight:500;letter-spacing:2px;text-transform:uppercase;cursor:pointer;z-index:5;transition:opacity .2s}
  #aw-ov .aw-back:hover{opacity:.65}
  #aw-ov .aw-stage{position:relative;z-index:1;width:100%;max-width:820px;padding:110px 32px 70px;display:flex;flex-direction:column;align-items:center;min-height:100vh;justify-content:center}
  #aw-ov .aw-step{width:100%;display:flex;flex-direction:column;align-items:center;animation:awFade .35s ease}
  @keyframes awFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  #aw-ov .aw-eyebrow{font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#d9b98a;margin-bottom:10px}
  #aw-ov .aw-h{font-family:'Cinzel',serif;font-weight:500;font-size:clamp(24px,4.2vw,36px);color:#fff;text-align:center;line-height:1.25;margin:0 0 10px}
  #aw-ov .aw-sub{font-size:14px;color:rgba(255,255,255,.75);text-align:center;margin:0 0 34px;max-width:480px;line-height:1.6}
  #aw-ov .aw-opts{display:grid;grid-template-columns:1fr 1fr;gap:14px;width:100%;max-width:560px;margin-bottom:8px}
  #aw-ov .aw-opt{display:flex;flex-direction:column;align-items:flex-start;gap:6px;text-align:left;padding:22px 20px;background:rgba(28,24,19,.42);border:1.5px solid rgba(164,130,86,.5);border-radius:8px;color:#fff;cursor:pointer;transition:.2s}
  #aw-ov .aw-opt:hover{background:rgba(164,130,86,.28);border-color:#a48256}
  #aw-ov .aw-opt strong{font-family:'Cinzel',serif;font-weight:500;font-size:1.12rem;letter-spacing:1px}
  #aw-ov .aw-opt span{font-size:.78rem;color:rgba(255,255,255,.7);line-height:1.4;text-transform:none;letter-spacing:0}
  #aw-ov .aw-field{width:100%;max-width:440px;margin-bottom:16px}
  #aw-ov .aw-field label{display:block;font-size:.66rem;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:7px}
  #aw-ov .aw-input,#aw-ov select.aw-input{width:100%;padding:14px 16px;background:rgba(28,24,19,.30);border:1px solid rgba(164,130,86,.45);border-radius:8px;color:#fff;font-family:'Jost',sans-serif;font-size:.95rem;outline:none;transition:.2s}
  #aw-ov select.aw-input option{color:#222}
  #aw-ov .aw-input:focus{border-color:#a48256;background:rgba(28,24,19,.5)}
  #aw-ov .aw-input::placeholder{color:rgba(255,255,255,.45)}
  #aw-ov .aw-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;max-width:440px}
  #aw-ov .aw-row .aw-field{max-width:none}
  #aw-ov .aw-err{color:#e9a;font-size:.82rem;min-height:1em;margin:2px 0 14px;text-align:center}
  #aw-ov .aw-btn{width:280px;max-width:100%;padding:16px;background:#a48256;border:none;border-radius:8px;color:#fff;font-family:'Cinzel',serif;font-size:.85rem;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:.2s;margin-top:10px}
  #aw-ov .aw-btn:hover{background:#8f6f45}
  #aw-ov .aw-btn:disabled{opacity:.45;cursor:not-allowed}
  #aw-ov .aw-btn.ghost{background:transparent;border:1.5px solid rgba(255,255,255,.4);color:#fff;font-family:'Jost',sans-serif;font-size:.72rem;width:auto;padding:11px 20px;margin-top:0}
  #aw-ov .aw-btn.ghost:hover{border-color:#a48256;background:rgba(164,130,86,.2)}
  #aw-ov .aw-alt{margin-top:22px;font-size:.85rem;color:rgba(255,255,255,.7)}
  #aw-ov .aw-alt a{color:#d9b98a;cursor:pointer;text-decoration:none}
  #aw-ov .aw-tick{width:64px;height:64px;border-radius:50%;background:#a48256;color:#fff;display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 20px}
  #aw-ov .aw-panel{width:100%;max-width:680px;background:rgba(28,24,19,.35);border:1px solid rgba(164,130,86,.3);border-radius:12px;padding:24px;margin-bottom:18px}
  #aw-ov .aw-panel h4{font-family:'Cinzel',serif;font-weight:500;color:#d9b98a;font-size:.95rem;letter-spacing:1px;margin:0 0 14px;text-transform:uppercase}
  #aw-ov .rk-row{display:grid;grid-template-columns:1fr 150px 34px;gap:10px;align-items:center;margin-bottom:10px}
  #aw-ov .rk-row .aw-input{margin:0}
  #aw-ov .rk-del{width:34px;height:34px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:transparent;color:#e9a;cursor:pointer;font-size:16px}
  #aw-ov .aw-photos{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
  #aw-ov .aw-photo{width:84px;height:84px;border-radius:8px;object-fit:cover;border:1px solid rgba(164,130,86,.4)}
  #aw-ov .aw-drop{border:1.5px dashed rgba(164,130,86,.6);border-radius:10px;padding:22px;text-align:center;color:rgba(255,255,255,.7);cursor:pointer;font-size:.85rem;transition:.2s}
  #aw-ov .aw-drop:hover{border-color:#a48256;background:rgba(164,130,86,.12)}
  #aw-ov .aw-drop.over{border-color:#a48256;background:rgba(164,130,86,.15)}
  #aw-ov .tier-drop{padding:12px;font-size:.76rem;margin-top:12px}
  #aw-ov .sto-create{border:1.5px dashed rgba(164,130,86,.55);border-radius:10px;padding:18px;text-align:center;cursor:pointer;color:#d9b98a;font-family:'Cinzel',serif;letter-spacing:1px;font-size:.9rem;transition:.2s}
  #aw-ov .sto-create:hover{border-color:#a48256;background:rgba(164,130,86,.12)}
  #aw-ov #sto-tiers{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  #aw-ov #sto-tiers .sto-tier{aspect-ratio:1;display:flex;flex-direction:column;gap:8px;margin:0;padding:16px}
  #aw-ov #sto-tiers .sto-tier .aw-input{margin:0}
  #aw-ov #sto-tiers .tier-drop{flex:1;display:flex;align-items:center;justify-content:center;margin-top:0}
  #aw-ov #sto-tiers .sto-create{aspect-ratio:1;display:flex;align-items:center;justify-content:center;margin:0}
  @media(max-width:560px){#aw-ov #sto-tiers{grid-template-columns:1fr}#aw-ov #sto-tiers .sto-tier,#aw-ov #sto-tiers .sto-create{aspect-ratio:auto}}
  #aw-ov #sto-cats{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  #aw-ov #sto-cats .sto-tier{aspect-ratio:1;display:flex;flex-direction:column;gap:8px;margin:0;padding:16px}
  #aw-ov #sto-cats .sto-tier .aw-input{margin:0}
  #aw-ov #sto-cats .sto-zone{flex:1;margin-top:0}
  #aw-ov #sto-cats .sto-create{aspect-ratio:1;display:flex;align-items:center;justify-content:center;margin:0}
  @media(max-width:560px){#aw-ov #sto-cats{grid-template-columns:1fr}#aw-ov #sto-cats .sto-tier,#aw-ov #sto-cats .sto-create{aspect-ratio:auto}}
  #aw-ov .sto-tier{border:1px solid rgba(164,130,86,.3);border-radius:10px;padding:16px;margin-bottom:12px;background:rgba(28,24,19,.25)}
  #aw-ov .sto-tier-top{display:grid;grid-template-columns:1fr 130px;gap:10px;align-items:center;margin-bottom:12px}
  #aw-ov .sto-tier-top .aw-input{margin:0}
  #aw-ov .sto-zone{min-height:52px;border:1.5px dashed rgba(164,130,86,.5);border-radius:8px;padding:8px;display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start;transition:.15s}
  #aw-ov .sto-zone.over{border-color:#a48256;background:rgba(164,130,86,.18)}
  #aw-ov .sto-zone .zhint{color:rgba(255,255,255,.4);font-size:.75rem;padding:6px 4px}
  #aw-ov .chip{display:inline-flex;align-items:center;gap:6px;background:rgba(164,130,86,.9);color:#fff;border-radius:20px;padding:6px 12px;font-size:.76rem;cursor:grab;user-select:none}
  #aw-ov .chip .x{cursor:pointer;opacity:.8;font-weight:700}
  #aw-ov .pool{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:680px;margin:0 auto 20px}
  #aw-ov .pool .chip{background:rgba(28,24,19,.5);border:1px solid rgba(164,130,86,.5)}
  @media(max-width:560px){#aw-ov .aw-opts,#aw-ov .aw-row{grid-template-columns:1fr}#aw-ov .aw-stage{padding-top:90px}#aw-ov .rk-row{grid-template-columns:1fr 110px 30px}#aw-ov .sto-tier-top{grid-template-columns:1fr 100px}}
  `;
  var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  var root=document.createElement('div');root.id='aw-root';
  root.innerHTML='<div class="aw-ov" id="aw-ov"><div class="aw-dark"></div><button class="aw-back" id="aw-back">&lsaquo; BACK</button><button class="aw-close" id="aw-close">&#10005;</button><div class="aw-stage" id="aw-stage"></div></div>';
  document.body.appendChild(root);
  var ov=root.querySelector('#aw-ov'), stage=root.querySelector('#aw-stage'), backBtn=root.querySelector('#aw-back');
  root.querySelector('#aw-close').onclick=close;
  backBtn.onclick=back;
  var S={mode:'signin',role:null,step:'role',hist:[],data:{}};

  window.openAuthWizard=function(mode,role){S.mode=mode||'signin';S.role=role||null;S.step='role';S.hist=['role'];S.data={};document.body.style.overflow='hidden';ov.classList.add('open');ov.scrollTop=0;if(S.role){pickRole(S.role,true);}else render();};
  function close(){ov.classList.remove('open');document.body.style.overflow='';}
  function go(step){S.step=step;S.hist.push(step);ov.scrollTop=0;render();}
  function back(){if(S.hist.length>1){S.hist.pop();S.step=S.hist[S.hist.length-1];ov.scrollTop=0;render();}else close();}
  function esc(s){return (s||'').replace(/</g,'&lt;');}

  function pickRole(role){
    S.role=role;
    if(S.mode==='signin'){ if(role==='agent') go('agentlogin'); else go('suplogin'); }
    else go('form');
  }

  function render(){
    backBtn.style.display=S.hist.length>1?'block':'none';
    var m={role:roleStep,agentlogin:agentStep,form:formStep,success:successStep,suplogin:supLoginStep,supmenu:supMenuStep,season:seasonStep,rack:rackStep,stochoice:stoChoiceStep,storates:stoRatesStep,stoassign:stoAssignStep,stoagents:stoAgentsStep};
    (m[S.step]||roleStep)();
  }

  function roleStep(){
    var isIn=S.mode==='signin';
    stage.innerHTML='<div class="aw-step"><div class="aw-eyebrow">Trade Portal</div><h2 class="aw-h">'+(isIn?'Sign In':'Sign Up')+'</h2><p class="aw-sub">'+(isIn?'Who are you signing in as?':'Create your trade account as&hellip;')+'</p><div class="aw-opts"><button class="aw-opt" data-r="agent"><strong>Agent</strong><span>'+(isIn?'View your contracted STO rates':'Travel trade partner')+'</span></button><button class="aw-opt" data-r="supplier"><strong>Supplier</strong><span>'+(isIn?'Manage your property &amp; rates':'Lodge / property owner')+'</span></button></div><div class="aw-alt">'+(isIn?'New here? <a id="aw-swap">Create an account</a>':'Already registered? <a id="aw-swap">Sign in</a>')+'</div></div>';
    [].forEach.call(stage.querySelectorAll('.aw-opt'),function(b){b.onclick=function(){pickRole(b.getAttribute('data-r'));};});
    var sw=stage.querySelector('#aw-swap');if(sw)sw.onclick=function(){S.mode=isIn?'signup':'signin';S.step='role';S.hist=['role'];render();};
  }

  function loginForm(eyebrow,title,sub,onSubmit){
    stage.innerHTML='<div class="aw-step"><div class="aw-eyebrow">'+eyebrow+'</div><h2 class="aw-h">'+title+'</h2><p class="aw-sub">'+sub+'</p><div class="aw-field"><label>Username</label><input class="aw-input" id="aw-u" type="text" autocomplete="username"></div><div class="aw-field"><label>Password</label><input class="aw-input" id="aw-p" type="password" autocomplete="current-password"></div><div class="aw-err" id="aw-e"></div><button class="aw-btn" id="aw-go">Sign In</button></div>';
    var u=stage.querySelector('#aw-u'),p=stage.querySelector('#aw-p'),e=stage.querySelector('#aw-e'),g=stage.querySelector('#aw-go');
    function submit(){onSubmit(u.value.trim(),p.value,e,g);}
    g.onclick=submit;[u,p].forEach(function(x){x.addEventListener('keydown',function(ev){if(ev.key==='Enter')submit();});});u.focus();
  }

  function agentStep(){
    loginForm('Agent Access','Agent Sign In','Trade partners only &mdash; sign in to view your contracted rates.',function(uu,pp,e,g){
      if(!uu||!pp){e.textContent='Enter your username and password.';return;}
      e.textContent='Signing in…';g.disabled=true;
      var lu=document.getElementById('login-user'),lp=document.getElementById('login-pass'),le=document.getElementById('login-err');
      if(lu&&lp&&window.submitLogin){lu.value=uu;lp.value=pp;window.submitLogin();var n=0,iv=setInterval(function(){n++;var t=le?le.textContent:'';if(t&&!/signing in/i.test(t)){clearInterval(iv);e.textContent=t;g.disabled=false;}if(n>18)clearInterval(iv);},200);}
      else{fetch('/api/sto',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:uu,password:pp,lodge:(window.LODGE||'')})}).then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j};});}).then(function(res){if(res.ok&&res.j&&res.j.token){sessionStorage.setItem('nr_agent_token',res.j.token);location.href='/';}else{e.textContent=(res.j&&res.j.error)||'Sign in failed.';g.disabled=false;}}).catch(function(){e.textContent='Network error — please try again.';g.disabled=false;});}
    });
  }

  function supLoginStep(){
    loginForm('Supplier Access','Supplier Sign In','Sign in to manage your property, rates and agents.',function(uu,pp,e,g){
      if(!uu||!pp){e.textContent='Enter your username and password.';return;}
      go('supmenu');
    });
  }

  function supMenuStep(){
    stage.innerHTML='<div class="aw-step"><div class="aw-eyebrow">Supplier Portal</div><h2 class="aw-h">What would you like to do?</h2><p class="aw-sub">Choose how you want to load your rates.</p><div class="aw-opts"><button class="aw-opt" data-g="rack"><strong>Load Rack Rates</strong><span>Set your standard published rates &amp; upload property photos</span></button><button class="aw-opt" data-g="sto"><strong>Upload STO Rates</strong><span>Net rate tiers &amp; choose which agents qualify for each</span></button></div></div>';
    [].forEach.call(stage.querySelectorAll('.aw-opt'),function(b){b.onclick=function(){var g=b.getAttribute('data-g');if(g==='rack'){S.pendingForm='rack';go('season');}else{go('stochoice');}};});
  }

  function formStep(){
    var sup=S.role==='supplier';
    stage.innerHTML='<div class="aw-step"><div class="aw-eyebrow">'+(sup?'Supplier':'Agent')+' Registration</div><h2 class="aw-h">Create your account</h2><p class="aw-sub">'+(sup?'Register your property to load rates and manage agents.':'Join as a travel trade partner to access contracted STO rates.')+'</p><div class="aw-field"><label>Full name</label><input class="aw-input" id="f-name"></div><div class="aw-field"><label>Email address</label><input class="aw-input" id="f-email" type="email"></div><div class="aw-field"><label>'+(sup?'Property / hotel name':'Agency / company name')+'</label><input class="aw-input" id="f-org"></div>'+(sup?'<div class="aw-field"><label>Property type</label><select class="aw-input" id="f-ptype"><option>Lodge</option><option>Tented Camp</option><option>Guesthouse</option><option>Hotel</option><option>Campsite</option><option>Collection / Group</option><option>Other</option></select></div>':'')+'<div class="aw-row"><div class="aw-field"><label>Phone</label><input class="aw-input" id="f-phone"></div><div class="aw-field"><label>Password</label><input class="aw-input" id="f-pass" type="password"></div></div><div class="aw-err" id="f-err"></div><button class="aw-btn" id="f-go">Create account</button></div>';
    stage.querySelector('#f-go').onclick=function(){var name=stage.querySelector('#f-name').value.trim(),email=stage.querySelector('#f-email').value.trim(),org=stage.querySelector('#f-org').value.trim();if(!name||!email||!org){stage.querySelector('#f-err').textContent='Please fill in your name, email and '+(sup?'property':'company')+' name.';return;}S.data.name=name;go('success');};
  }

  function successStep(){
    var sup=S.role==='supplier';
    stage.innerHTML='<div class="aw-step"><div class="aw-tick">&#10003;</div><h2 class="aw-h">Account created</h2><p class="aw-sub">Welcome, '+esc(S.data.name)+'. Your '+(sup?'supplier':'agent')+' account is ready &mdash; sign in to '+(sup?'load your rates.':'view your contracted rates.')+'</p><button class="aw-btn" id="s-go">Sign in now</button></div>';
    stage.querySelector('#s-go').onclick=function(){S.mode='signin';S.role=null;S.step='role';S.hist=['role'];render();};
  }

  function seasonLabel(){return S.season==='low'?'Low Season':'High Season';}
  function seasonStep(){
    var isRack=S.pendingForm==='rack';
    stage.innerHTML='<div class="aw-step"><div class="aw-eyebrow">'+(isRack?'Rack Rates':'STO Rates')+'</div><h2 class="aw-h">Which season?</h2><p class="aw-sub">Choose the season you want to load rates for &mdash; you can come back and add the other.</p><div class="aw-opts"><button class="aw-opt" data-s="high"><strong>High Season</strong><span>Peak / premium-season rates</span></button><button class="aw-opt" data-s="low"><strong>Low Season</strong><span>Off-peak / value rates</span></button></div></div>';
    [].forEach.call(stage.querySelectorAll('.aw-opt'),function(b){b.onclick=function(){S.season=b.getAttribute('data-s');go(S.pendingForm);};});
  }

  /* ---------- RACK RATES ---------- */
  function wireSheet(dropId,fileId,thumbsId){
    var file=stage.querySelector('#'+fileId),drop=stage.querySelector('#'+dropId),thumbs=stage.querySelector('#'+thumbsId);
    if(!file||!drop)return;
    function add(list){[].forEach.call(list,function(f){if(/^image\//.test(f.type)){var img=document.createElement('img');img.className='aw-photo';img.src=URL.createObjectURL(f);thumbs.appendChild(img);}else{var c=document.createElement('span');c.className='chip';c.textContent='\uD83D\uDCC4 '+f.name.slice(0,22);thumbs.appendChild(c);}});}
    drop.onclick=function(){file.click();};
    file.onchange=function(){add(file.files);};
    drop.ondragover=function(e){e.preventDefault();drop.style.borderColor='#a48256';};
    drop.ondragleave=function(){drop.style.borderColor='';};
    drop.ondrop=function(e){e.preventDefault();drop.style.borderColor='';add(e.dataTransfer.files);};
  }
  function rackStep(){
    stage.innerHTML='<div class="aw-step"><div class="aw-eyebrow">Rack Rates &middot; '+seasonLabel()+'</div><h2 class="aw-h">Load your rack rates</h2><p class="aw-sub">Enter your rates manually below, or upload a screenshot / file of your rate sheet.</p>'+
      '<div class="aw-panel"><h4>Rates</h4><div id="rk-rows"></div><button class="aw-btn ghost" id="rk-add">+ Add rate</button></div>'+
      '<div class="aw-panel"><h4>Or upload a rate sheet</h4><div class="aw-drop" id="rk-sheet-drop">Take a screenshot or select a file (image / PDF) of your rate sheet</div><input type="file" id="rk-sheet-file" accept="image/*,application/pdf" multiple style="display:none"><div class="aw-photos" id="rk-sheet-thumbs"></div></div>'+
      '<div class="aw-panel"><h4>Property photos</h4><div class="aw-drop" id="rk-drop">Click to upload or drag photos here</div><input type="file" id="rk-file" accept="image/*" multiple style="display:none"><div class="aw-photos" id="rk-thumbs"></div></div>'+
      '<button class="aw-btn" id="rk-save">Save rack rates</button><div class="aw-err" id="rk-msg" style="color:#bcd0a0"></div></div>';
    var rows=stage.querySelector('#rk-rows');
    function addRow(){var d=document.createElement('div');d.className='rk-row';d.innerHTML='<input class="aw-input" placeholder="Room / unit type (e.g. Standard Double)"><input class="aw-input" placeholder="Rate / night"><button class="rk-del">&times;</button>';d.querySelector('.rk-del').onclick=function(){d.remove();};rows.appendChild(d);}
    addRow();addRow();
    stage.querySelector('#rk-add').onclick=addRow;
    var file=stage.querySelector('#rk-file'),drop=stage.querySelector('#rk-drop'),thumbs=stage.querySelector('#rk-thumbs');
    function addPhotos(list){[].forEach.call(list,function(f){if(!/^image\//.test(f.type))return;var img=document.createElement('img');img.className='aw-photo';img.src=URL.createObjectURL(f);thumbs.appendChild(img);});}
    drop.onclick=function(){file.click();};
    file.onchange=function(){addPhotos(file.files);};
    drop.ondragover=function(e){e.preventDefault();drop.style.borderColor='#a48256';};
    drop.ondragleave=function(){drop.style.borderColor='';};
    drop.ondrop=function(e){e.preventDefault();drop.style.borderColor='';addPhotos(e.dataTransfer.files);};
    wireSheet('rk-sheet-drop','rk-sheet-file','rk-sheet-thumbs');
    stage.querySelector('#rk-save').onclick=function(){stage.querySelector('#rk-msg').textContent='✓ Rack rates saved. Our team will review and publish them.';};
  }

  /* ---------- STO RATES + DRAG-DROP AGENTS ---------- */
  function stoChoiceStep(){
    stage.innerHTML='<div class="aw-step"><div class="aw-eyebrow">STO Rates</div><h2 class="aw-h">What would you like to upload?</h2><p class="aw-sub">Manage your rates and which agents can see them.</p><div class="aw-opts" style="grid-template-columns:1fr;max-width:460px"><button class="aw-opt" data-x="storates"><strong>Upload Rates</strong><span>Enter your net rate tiers or upload a rate sheet</span></button><button class="aw-opt" data-x="stoassign"><strong>Assign Agents</strong><span>Add &amp; manage your list of trade agents</span></button><button class="aw-opt" data-x="stoagents"><strong>Allocate Rates to Agents</strong><span>Drag agents into each rate category</span></button></div></div>';
    [].forEach.call(stage.querySelectorAll('.aw-opt'),function(b){b.onclick=function(){var x=b.getAttribute('data-x');if(x==='storates'){S.pendingForm='storates';go('season');}else{go(x);}};});
  }

  function stoRatesStep(){
    stage.innerHTML='<div class="aw-step"><div class="aw-eyebrow">STO Rates &middot; '+seasonLabel()+'</div><h2 class="aw-h">Upload your STO rates</h2><p class="aw-sub">Enter a net rate for each tier &mdash; and drag in, pick a file, or take a photo of the rate for each. Add your own tiers too.</p>'+
      '<div class="aw-panel"><h4>Rate tiers</h4><div id="sto-tiers"></div></div>'+
      '<button class="aw-btn" id="sto-save">Save STO rates</button><div class="aw-err" id="sto-msg" style="color:#bcd0a0"></div></div>';
    var tiers=stage.querySelector('#sto-tiers');
    var createBlk=document.createElement('div');createBlk.className='sto-create';createBlk.innerHTML='+ Create new tier';tiers.appendChild(createBlk);
    function wireDrop(drop,file,thumbs){function add(list){[].forEach.call(list,function(f){if(/^image\//.test(f.type)){var img=document.createElement('img');img.className='aw-photo';img.src=URL.createObjectURL(f);thumbs.appendChild(img);}else{var c=document.createElement('span');c.className='chip';c.textContent='📄 '+f.name.slice(0,16);thumbs.appendChild(c);}});}drop.onclick=function(){file.click();};file.onchange=function(){add(file.files);};drop.ondragover=function(e){e.preventDefault();drop.classList.add('over');};drop.ondragleave=function(){drop.classList.remove('over');};drop.ondrop=function(e){e.preventDefault();drop.classList.remove('over');add(e.dataTransfer.files);};}
    function addTier(label,rate){var t=document.createElement('div');t.className='sto-tier';t.innerHTML='<input class="aw-input" value="'+esc(label)+'"><input class="aw-input" placeholder="Net rate" value="'+(rate||'')+'"><div class="aw-drop tier-drop">Drag, pick a file, or take a photo</div><input type="file" accept="image/*,application/pdf" multiple style="display:none"><div class="aw-photos"></div>';var drop=t.querySelector('.tier-drop'),file=t.querySelector('input[type=file]'),thumbs=t.querySelector('.aw-photos');wireDrop(drop,file,thumbs);tiers.insertBefore(t,createBlk);}
    addTier('15% commission','');addTier('20% commission','');addTier('30% commission','');
    createBlk.onclick=function(){addTier('New tier','');};
    stage.querySelector('#sto-save').onclick=function(){stage.querySelector('#sto-msg').textContent='✓ STO rates saved. Our team will review and publish them.';};
  }

  function stoAssignStep(){
    if(!S.customAgents)S.customAgents=[];
    stage.innerHTML='<div class="aw-step"><div class="aw-eyebrow">STO Rates &middot; Agents</div><h2 class="aw-h">Assign your agents</h2><p class="aw-sub">Add the trade agents you work with, then allocate rates to them.</p>'+
      '<div class="aw-row" style="max-width:520px"><div class="aw-field"><label>Agent / agency name</label><input class="aw-input" id="ag-name"></div><div class="aw-field"><label>Email (optional)</label><input class="aw-input" id="ag-email"></div></div>'+
      '<button class="aw-btn ghost" id="ag-add">+ Add agent</button>'+
      '<div class="aw-panel" style="margin-top:18px"><h4>Your agents</h4><div class="pool" id="ag-list" style="margin:0"></div></div>'+
      '<button class="aw-btn" id="ag-save">Save agents</button><div class="aw-err" id="ag-msg" style="color:#bcd0a0"></div></div>';
    var list=stage.querySelector('#ag-list');
    function chip(name,removable){var c=document.createElement('span');c.className='chip';c.innerHTML=esc(name)+(removable?' <span class="x">&times;</span>':'');if(removable){c.querySelector('.x').onclick=function(){var i=S.customAgents.indexOf(name);if(i>-1)S.customAgents.splice(i,1);c.remove();};}list.appendChild(c);}
    AGENTS.forEach(function(a){chip(a,false);});
    S.customAgents.forEach(function(a){chip(a,true);});
    function addNew(){var n=stage.querySelector('#ag-name').value.trim();if(!n)return;if(S.customAgents.indexOf(n)<0&&AGENTS.indexOf(n)<0){S.customAgents.push(n);chip(n,true);}stage.querySelector('#ag-name').value='';stage.querySelector('#ag-email').value='';}
    stage.querySelector('#ag-add').onclick=addNew;
    stage.querySelector('#ag-name').addEventListener('keydown',function(e){if(e.key==='Enter')addNew();});
    stage.querySelector('#ag-save').onclick=function(){stage.querySelector('#ag-msg').textContent='✓ Agents saved. Now allocate rates to them.';};
  }

  function stoAgentsStep(){
    stage.innerHTML='<div class="aw-step"><div class="aw-eyebrow">STO Rates &middot; Agents</div><h2 class="aw-h">Assign agents to rate categories</h2><p class="aw-sub">Drag the agents who qualify into each rate category.</p>'+
      '<div class="pool" id="sto-pool"></div>'+
      '<div class="aw-panel"><h4>Rate categories</h4><div id="sto-cats"></div></div>'+
      '<button class="aw-btn" id="sto-asave">Save agent access</button><div class="aw-err" id="sto-amsg" style="color:#bcd0a0"></div></div>';
    var pool=stage.querySelector('#sto-pool');
    (AGENTS.concat(S.customAgents||[])).forEach(function(a){var c=document.createElement('span');c.className='chip';c.draggable=true;c.textContent=a;c.dataset.name=a;c.addEventListener('dragstart',function(e){e.dataTransfer.setData('text/plain',a);});pool.appendChild(c);});
    var cats=stage.querySelector('#sto-cats');var catCreate=document.createElement('div');catCreate.className='sto-create';catCreate.innerHTML='+ Create new category';cats.appendChild(catCreate);
    function makeZoneHint(z){if(!z.querySelector('.chip')&&!z.querySelector('.zhint')){var h=document.createElement('span');h.className='zhint';h.textContent='Drag qualifying agents here…';z.appendChild(h);}}
    function addAgent(z,name){var hint=z.querySelector('.zhint');if(hint)hint.remove();if([].some.call(z.querySelectorAll('.chip'),function(c){return c.dataset.name===name;}))return;var c=document.createElement('span');c.className='chip';c.dataset.name=name;c.innerHTML=esc(name)+' <span class="x">&times;</span>';c.querySelector('.x').onclick=function(){c.remove();makeZoneHint(z);};z.appendChild(c);}
    function addCat(label){var t=document.createElement('div');t.className='sto-tier';t.innerHTML='<input class="aw-input" value="'+esc(label)+'"><div class="sto-zone"></div>';var z=t.querySelector('.sto-zone');makeZoneHint(z);z.addEventListener('dragover',function(e){e.preventDefault();z.classList.add('over');});z.addEventListener('dragleave',function(){z.classList.remove('over');});z.addEventListener('drop',function(e){e.preventDefault();z.classList.remove('over');var name=e.dataTransfer.getData('text/plain');if(name)addAgent(z,name);});cats.insertBefore(t,catCreate);}
    addCat('15% commission');addCat('20% commission');addCat('30% commission');
    catCreate.onclick=function(){addCat('New category');};
    stage.querySelector('#sto-asave').onclick=function(){stage.querySelector('#sto-amsg').textContent='✓ Agent access saved for each rate category.';};
  }
})();
