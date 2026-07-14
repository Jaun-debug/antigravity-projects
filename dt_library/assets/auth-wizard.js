(function(){
  if(window.__authWizard)return;window.__authWizard=1;
  var BG='https://wetu.com/imageHandler/c1920x1080/126088/hoanib_valley_camp_-_aerial_view.jpg?fmt=jpg';
  var CSS=`
  #aw-root *{box-sizing:border-box}
  #aw-ov{position:fixed;inset:0;z-index:2147483000;display:none;flex-direction:column;align-items:center;justify-content:flex-start;overflow-y:auto;background:#1f1b16 url('${BG}') center/cover no-repeat;font-family:'Jost',sans-serif;color:#fff}
  #aw-ov.open{display:flex}
  #aw-ov .aw-dark{position:fixed;inset:0;background:rgba(28,24,19,.62);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);z-index:0}
  #aw-ov .aw-close{position:fixed;top:20px;right:26px;width:42px;height:42px;border-radius:50%;border:1.5px solid rgba(255,255,255,.45);background:rgba(28,24,19,.25);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:5;transition:.2s}
  #aw-ov .aw-close:hover{background:rgba(255,255,255,.12);border-color:#fff}
  #aw-ov .aw-back{position:fixed;top:28px;left:28px;background:none;border:none;color:#fff;font-size:12px;font-weight:500;letter-spacing:2px;text-transform:uppercase;cursor:pointer;z-index:5;transition:opacity .2s}
  #aw-ov .aw-back:hover{opacity:.65}
  #aw-ov .aw-stage{position:relative;z-index:1;width:100%;max-width:720px;padding:110px 32px 60px;display:flex;flex-direction:column;align-items:center;min-height:100vh;justify-content:center}
  #aw-ov .aw-step{width:100%;display:flex;flex-direction:column;align-items:center;animation:awFade .35s ease}
  @keyframes awFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  #aw-ov .aw-eyebrow{font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#d9b98a;margin-bottom:10px}
  #aw-ov .aw-h{font-family:'Cinzel',serif;font-weight:500;font-size:clamp(26px,4.5vw,38px);color:#fff;text-align:center;line-height:1.25;margin:0 0 10px}
  #aw-ov .aw-sub{font-size:14px;color:rgba(255,255,255,.75);text-align:center;margin:0 0 34px;max-width:440px;line-height:1.6}
  #aw-ov .aw-opts{display:grid;grid-template-columns:1fr 1fr;gap:14px;width:100%;max-width:520px;margin-bottom:8px}
  #aw-ov .aw-opt{display:flex;flex-direction:column;align-items:flex-start;gap:6px;text-align:left;padding:22px 20px;background:rgba(28,24,19,.42);border:1.5px solid rgba(164,130,86,.5);border-radius:8px;color:#fff;cursor:pointer;transition:.2s}
  #aw-ov .aw-opt:hover{background:rgba(164,130,86,.28);border-color:#a48256}
  #aw-ov .aw-opt strong{font-family:'Cinzel',serif;font-weight:500;font-size:1.15rem;letter-spacing:1px}
  #aw-ov .aw-opt span{font-size:.78rem;color:rgba(255,255,255,.7);line-height:1.4;text-transform:none;letter-spacing:0}
  #aw-ov .aw-field{width:100%;max-width:420px;margin-bottom:16px}
  #aw-ov .aw-field label{display:block;font-size:.66rem;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:7px}
  #aw-ov .aw-input,#aw-ov select.aw-input{width:100%;padding:15px 16px;background:rgba(28,24,19,.30);border:1px solid rgba(164,130,86,.45);border-radius:8px;color:#fff;font-family:'Jost',sans-serif;font-size:.95rem;outline:none;transition:.2s}
  #aw-ov select.aw-input option{color:#222}
  #aw-ov .aw-input:focus{border-color:#a48256;background:rgba(28,24,19,.5)}
  #aw-ov .aw-input::placeholder{color:rgba(255,255,255,.45)}
  #aw-ov .aw-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;max-width:420px}
  #aw-ov .aw-row .aw-field{max-width:none}
  #aw-ov .aw-err{color:#e9a; font-size:.82rem;min-height:1em;margin:2px 0 14px;text-align:center}
  #aw-ov .aw-btn{width:280px;max-width:100%;padding:16px;background:#a48256;border:none;border-radius:8px;color:#fff;font-family:'Cinzel',serif;font-size:.85rem;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:.2s;margin-top:8px}
  #aw-ov .aw-btn:hover{background:#8f6f45}
  #aw-ov .aw-btn:disabled{opacity:.45;cursor:not-allowed}
  #aw-ov .aw-prog{width:200px;height:3px;background:rgba(255,255,255,.15);border-radius:2px;overflow:hidden;margin-top:26px}
  #aw-ov .aw-prog i{display:block;height:100%;background:#a48256;transition:width .4s ease}
  #aw-ov .aw-alt{margin-top:22px;font-size:.85rem;color:rgba(255,255,255,.7)}
  #aw-ov .aw-alt a{color:#d9b98a;cursor:pointer;text-decoration:none}
  #aw-ov .aw-tick{width:64px;height:64px;border-radius:50%;background:#a48256;color:#fff;display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 20px}
  @media(max-width:560px){#aw-ov .aw-opts,#aw-ov .aw-row{grid-template-columns:1fr}#aw-ov .aw-stage{padding-top:90px}}
  `;
  var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  var root=document.createElement('div');root.id='aw-root';
  root.innerHTML='<div class="aw-ov" id="aw-ov"><div class="aw-dark"></div><button class="aw-back" id="aw-back">&lsaquo; BACK</button><button class="aw-close" id="aw-close">&#10005;</button><div class="aw-stage" id="aw-stage"></div></div>';
  document.body.appendChild(root);
  var ov=root.querySelector('#aw-ov'), stage=root.querySelector('#aw-stage'), backBtn=root.querySelector('#aw-back');
  root.querySelector('#aw-close').onclick=close;
  backBtn.onclick=back;
  var S={mode:'signin',role:null,step:'role',hist:[],data:{}};

  window.openAuthWizard=function(mode,role){S.mode=mode||'signin';S.role=role||null;S.step='role';S.hist=['role'];S.data={};document.body.style.overflow='hidden';ov.classList.add('open');if(S.role){pickRole(S.role,true);}else render();};
  function close(){ov.classList.remove('open');document.body.style.overflow='';}
  function go(step){S.step=step;S.hist.push(step);render();}
  function back(){if(S.hist.length>1){S.hist.pop();S.step=S.hist[S.hist.length-1];render();}else close();}

  function pickRole(role,silent){
    S.role=role;
    if(S.mode==='signin'){
      if(role==='agent'){ if(!silent){} go('agentlogin'); }
      else { location.href='/supplier-portal/'; }
    } else { go('form'); }
  }

  function render(){
    backBtn.style.display=S.hist.length>1?'block':'none';
    if(S.step==='role')roleStep();
    else if(S.step==='agentlogin')agentStep();
    else if(S.step==='form')formStep();
    else if(S.step==='success')successStep();
  }

  function esc(s){return (s||'').replace(/</g,'&lt;');}

  function roleStep(){
    var isIn=S.mode==='signin';
    stage.innerHTML='<div class="aw-step">'+
      '<div class="aw-eyebrow">Trade Portal</div>'+
      '<h2 class="aw-h">'+(isIn?'Sign In':'Sign Up')+'</h2>'+
      '<p class="aw-sub">'+(isIn?'Who are you signing in as?':'Create your trade account as&hellip;')+'</p>'+
      '<div class="aw-opts">'+
        '<button class="aw-opt" data-r="agent"><strong>Agent</strong><span>'+(isIn?'View your contracted STO rates':'Travel trade partner')+'</span></button>'+
        '<button class="aw-opt" data-r="supplier"><strong>Supplier</strong><span>'+(isIn?'Manage your property &amp; rates':'Lodge / property owner')+'</span></button>'+
      '</div>'+
      '<div class="aw-alt">'+(isIn?'New here? <a id="aw-swap">Create an account</a>':'Already registered? <a id="aw-swap">Sign in</a>')+'</div>'+
    '</div>';
    [].forEach.call(stage.querySelectorAll('.aw-opt'),function(b){b.onclick=function(){pickRole(b.getAttribute('data-r'));};});
    var sw=stage.querySelector('#aw-swap');if(sw)sw.onclick=function(){S.mode=isIn?'signup':'signin';S.step='role';S.hist=['role'];render();};
  }

  function agentStep(){
    stage.innerHTML='<div class="aw-step">'+
      '<div class="aw-eyebrow">Agent Access</div>'+
      '<h2 class="aw-h">Agent Sign In</h2>'+
      '<p class="aw-sub">Trade partners only &mdash; sign in to view your contracted rates.</p>'+
      '<div class="aw-field"><label>Username</label><input class="aw-input" id="aw-u" type="text" autocomplete="username"></div>'+
      '<div class="aw-field"><label>Password</label><input class="aw-input" id="aw-p" type="password" autocomplete="current-password"></div>'+
      '<div class="aw-err" id="aw-e"></div>'+
      '<button class="aw-btn" id="aw-go">Sign In</button>'+
    '</div>';
    var u=stage.querySelector('#aw-u'),p=stage.querySelector('#aw-p'),e=stage.querySelector('#aw-e'),go2=stage.querySelector('#aw-go');
    function submit(){
      var uu=u.value.trim(),pp=p.value;if(!uu||!pp){e.textContent='Enter your username and password.';return;}
      e.textContent='Signing in…';go2.disabled=true;
      var lu=document.getElementById('login-user'),lp=document.getElementById('login-pass'),le=document.getElementById('login-err');
      if(lu&&lp&&window.submitLogin){
        lu.value=uu;lp.value=pp;window.submitLogin();
        var n=0,iv=setInterval(function(){n++;var t=le?le.textContent:'';if(t&&!/signing in/i.test(t)){clearInterval(iv);e.textContent=t;go2.disabled=false;}if(n>18)clearInterval(iv);},200);
      } else {
        fetch('/api/sto',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:uu,password:pp,lodge:(window.LODGE||'')})})
        .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
        .then(function(res){if(res.ok&&res.j&&res.j.token){sessionStorage.setItem('nr_agent_token',res.j.token);location.href='/';}else{e.textContent=(res.j&&res.j.error)||'Sign in failed.';go2.disabled=false;}})
        .catch(function(){e.textContent='Network error — please try again.';go2.disabled=false;});
      }
    }
    go2.onclick=submit;
    [u,p].forEach(function(x){x.addEventListener('keydown',function(ev){if(ev.key==='Enter')submit();});});
    u.focus();
  }

  function formStep(){
    var sup=S.role==='supplier';
    stage.innerHTML='<div class="aw-step">'+
      '<div class="aw-eyebrow">'+(sup?'Supplier':'Agent')+' Registration</div>'+
      '<h2 class="aw-h">Create your account</h2>'+
      '<p class="aw-sub">'+(sup?'Register your property to load rates and manage agents.':'Join as a travel trade partner to access contracted STO rates.')+'</p>'+
      '<div class="aw-field"><label>Full name</label><input class="aw-input" id="f-name"></div>'+
      '<div class="aw-field"><label>Email address</label><input class="aw-input" id="f-email" type="email"></div>'+
      '<div class="aw-field"><label>'+(sup?'Property / hotel name':'Agency / company name')+'</label><input class="aw-input" id="f-org"></div>'+
      (sup?'<div class="aw-field"><label>Property type</label><select class="aw-input" id="f-ptype"><option>Lodge</option><option>Tented Camp</option><option>Guesthouse</option><option>Hotel</option><option>Campsite</option><option>Collection / Group</option><option>Other</option></select></div>':'')+
      '<div class="aw-row"><div class="aw-field"><label>Phone</label><input class="aw-input" id="f-phone"></div><div class="aw-field"><label>Password</label><input class="aw-input" id="f-pass" type="password"></div></div>'+
      '<div class="aw-err" id="f-err"></div>'+
      '<button class="aw-btn" id="f-go">Create account</button>'+
      '<div class="aw-prog"><i style="width:100%"></i></div>'+
    '</div>';
    stage.querySelector('#f-go').onclick=function(){
      var name=stage.querySelector('#f-name').value.trim();
      var email=stage.querySelector('#f-email').value.trim();
      var org=stage.querySelector('#f-org').value.trim();
      if(!name||!email||!org){stage.querySelector('#f-err').textContent='Please fill in your name, email and '+(sup?'property':'company')+' name.';return;}
      S.data.name=name;go('success');
    };
  }

  function successStep(){
    var sup=S.role==='supplier';
    stage.innerHTML='<div class="aw-step">'+
      '<div class="aw-tick">&#10003;</div>'+
      '<h2 class="aw-h">Account created</h2>'+
      '<p class="aw-sub">Welcome, '+esc(S.data.name)+'. Your '+(sup?'supplier':'agent')+' account is ready &mdash; sign in to '+(sup?'load your rates.':'view your contracted rates.')+'</p>'+
      '<button class="aw-btn" id="s-go">'+(sup?'Continue to sign in':'Sign in now')+'</button>'+
    '</div>';
    stage.querySelector('#s-go').onclick=function(){S.mode='signin';S.role=null;S.step='role';S.hist=['role'];render();};
  }
})();
