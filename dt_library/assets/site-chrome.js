/* site-chrome.js — shared header + footer */
(function(){if(window.__siteChrome)return;window.__siteChrome=1;

// ── Activity providers by region ──────────────────────────────────────────
// The Activities menu is generated from this list, so a region heading only
// exists once at least one activity sits under it. Add a provider here and its
// region appears automatically (creating the heading if the region is new).
var ACTIVITY_PROVIDERS=[
 {region:"Sossusvlei & Namib",name:"Namib Sky Ballooning",id:"namibsky"},
 {region:"Swakopmund",name:"Alter Action Sandboarding",id:"alteraction"},
 {region:"Swakopmund",name:"Desert Explorers",id:"desert"},
 {region:"Swakopmund",name:"Infinite African Safaris",id:"infinite"},
 {region:"Swakopmund",name:"Living Desert Adventures",id:"livingdesert"},
 {region:"Swakopmund",name:"Sand Waves",id:"sandwaves"},
 {region:"Walvis Bay",name:"Mola Mola Safaris",id:"molamola"},
 {region:"L\u00fcderitz",name:"Bogenfels Tours",id:"bogenfels"}
];
function activityMenuHTML(){
 var order=[],by={};
 ACTIVITY_PROVIDERS.forEach(function(p){if(!by[p.region]){by[p.region]=[];order.push(p.region);}by[p.region].push(p);});
 var half=Math.ceil(order.length/2),cols=[order.slice(0,half),order.slice(half)];
 return '<div class="dropdown-menu">'+cols.map(function(rs){
   return '<div class="dropdown-column">'+rs.map(function(r,ri){
     return '<div class="xborder-head"'+(ri?' style="margin-top:14px"':'')+'>'+r+'</div>'+
       by[r].map(function(p){return '<a href="/activity_rates.html#'+p.id+'">'+p.name+'</a>';}).join('');
   }).join('')+'</div>';
 }).join('')+'</div>';
}

// ── Vehicle rental suppliers ──────────────────────────────────────────────
// Listed alphabetically by name; add a supplier here and it slots into place.
var VEHICLE_PROVIDERS=[
 {name:"Namib Roos Car Rentals",id:"nrcr"},
 {name:"Namibia Car Rental",id:"ncr"},
 {name:"Namibia Tours & Safaris",id:"nts"},
 {name:"Sanga Group Travel",id:"sanga"},
 {name:"Suricate Safaris",id:"suricate"},
 {name:"Swakopmund Car Hire",id:"sch"},
 {name:"Warthog Car Rental",id:"warthog"},
 {name:"Zaris Safaris",id:"zaris"}
];
function vehicleMenuHTML(){
 var list=VEHICLE_PROVIDERS.slice().sort(function(a,b){return a.name.localeCompare(b.name);});
 return '<div class="dropdown-menu single-column">'+list.map(function(v){
   return '<a href="/vehicle_rates.html#'+v.id+'">'+v.name.replace(/&/g,'&amp;')+'</a>';
 }).join('')+'</div>';
}
var CSS="\n.role-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:8px 0 4px}\n.role-card{display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;padding:16px 14px;border:1px solid rgba(164,130,86,.3);border-radius:10px;background:#f6f5f2;cursor:pointer;transition:.2s}\n.role-card:hover{border-color:#a48256;background:#fff;box-shadow:0 6px 18px rgba(0,0,0,.08)}\n.role-card strong{font-family:'Cinzel',serif;color:#a48256;font-size:1rem}\n.role-card span{font-size:.72rem;color:#7d756e;line-height:1.3}\n.role-cancel{margin-top:14px;width:100%;background:none;border:none;color:#7d756e;cursor:pointer;font-size:.78rem;text-transform:uppercase;letter-spacing:1px}\n.hdr-agent{cursor:pointer;font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:1.5px;font-size:.7rem;padding:8px 16px;border-radius:5px;border:1px solid #a48256;background:transparent;color:#a48256;white-space:nowrap;transition:.25s;}\n\n.hdr-agent:hover{background:#a48256;color:#fff;}\n\n/* modal */\n.modal{display:none;position:fixed;inset:0;z-index:200;background:rgba(30,28,26,.55);backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:20px;}\n\n.modal.open{display:flex;}\n\n.modal-box{background:#fff;border-radius:12px;max-width:380px;width:100%;padding:32px;box-shadow:0 25px 60px rgba(0,0,0,.3);}\n\n.modal-box h3{font-family:'Cinzel',serif;color:#a48256;font-weight:500;margin-bottom:4px;}\n\n.modal-box p{font-size:.85rem;color:#7d756e;margin-bottom:18px;}\n\n.modal-box label{display:block;font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:#7d756e;margin:12px 0 5px;}\n\n.modal-box input{width:100%;padding:11px 14px;border:1px solid rgba(0,0,0,.15);border-radius:6px;font-family:'Jost',sans-serif;font-size:.95rem;outline:none;}\n\n.modal-box input:focus{border-color:#a48256;}\n\n.modal-err{color:#c0392b;font-size:.82rem;margin-top:12px;min-height:1em;}\n\n.modal-actions{display:flex;gap:10px;margin-top:22px;}\n\n\n\n.main-header{position:fixed;top:0;left:0;width:100%;padding:14px 30px;display:flex;justify-content:space-between;align-items:center;gap:14px;z-index:9999;background:rgba(234,233,230,.97);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(164,130,86,.15);box-shadow:0 4px 25px rgba(0,0,0,.04);}\n\n.header-logo-block{display:flex;flex-direction:column;align-items:flex-start;text-decoration:none;}\n\n.logo-main{font-family:'Cinzel',serif;font-size:1.5rem;color:#a48256;text-transform:uppercase;letter-spacing:3px;line-height:1.1;font-weight:500;}\n\n.logo-sub{font-family:'Jost',sans-serif;font-size:.6rem;color:#7d756e;text-transform:uppercase;letter-spacing:4px;margin-top:5px;}\n\n.nav-links{display:flex;align-items:baseline;gap:18px;flex-wrap:nowrap;}\n\n.nav-link{color:#3c3530;text-decoration:none;font-size:.8rem;font-weight:400;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;transition:color .3s;cursor:pointer;position:relative;padding-bottom:4px;}\n.nav-link.active{color:#a48256;}\n.nav-link.active::after{content:\"\";position:absolute;bottom:0;left:0;width:100%;height:2px;background:#a48256;}\n.enquire-now-btn.hdr-outline{background:transparent;border:1px solid #a48256;color:#a48256;}\n.enquire-now-btn.hdr-outline:hover{background:#a48256;border-color:#a48256;color:#fff;}\n.search-icon-btn{background:none;border:none;cursor:pointer;color:#a48256;padding:5px;display:flex;align-items:center;transition:color .3s;}\n.search-icon-btn:hover{color:#3c3530;}\n\n.nav-link:hover{color:#a48256;}\n\n.enquire-now-btn{background:#87a996;border:1px solid #87a996;color:#fff;padding:9px 22px;border-radius:5px;cursor:pointer;font-family:'Cinzel',serif;font-size:.8rem;letter-spacing:1px;text-transform:uppercase;transition:all .3s;}\n\n.enquire-now-btn:hover{background:#a48256;border-color:#a48256;}\n\n.nav-item-dropdown{position:relative;display:inline-block;}\n\n.dropdown-menu{display:none;position:absolute;top:100%;left:50%;transform:translateX(-50%) translateY(8px);background:#f6f5f2;border:1px solid rgba(164,130,86,.18);box-shadow:0 14px 44px rgba(0,0,0,.14);border-radius:8px;padding:18px;z-index:10000;gap:18px;min-width:240px;}\n\n.nav-item-dropdown:hover .dropdown-menu{display:flex;}\n\n.dropdown-column{display:flex;flex-direction:column;gap:6px;min-width:200px;}\n\n.dropdown-menu.single-column{flex-direction:column;min-width:240px;gap:6px;}\n.dropdown-column.xborder{border-left:1px solid rgba(164,130,86,.3);padding-left:16px;margin-left:4px;}\n.xborder-head{font-family:'Jost',sans-serif;font-size:.58rem;letter-spacing:1.5px;text-transform:uppercase;color:#a48256;margin:2px 0 8px;opacity:.95;}\n\n.dropdown-menu a{color:#3c3530;text-decoration:none;font-size:.82rem;padding:7px 11px;border-radius:5px;transition:.2s;}\n\n.dropdown-menu a:hover{background:rgba(164,130,86,.1);color:#a48256;}\n\n.nav-item-dropdown::after{content:'';position:absolute;top:100%;left:0;right:0;height:16px;}\n\n.dropdown-menu::before{content:'';position:absolute;top:-16px;left:0;right:0;height:16px;}\n\n\n\n.nav-links>.nav-item-dropdown:first-child{order:-2}\n#nav-grouplodges{order:-1}\n\n#uc-belt{position:fixed;top:0;left:0;right:0;z-index:2147483600;background:#e7ddca;color:#6c5c39;border-bottom:1px solid #d6c9ad;font-family:Arial,Helvetica,sans-serif;font-size:11.5px;font-weight:600;letter-spacing:.2px;line-height:1.4;text-align:center;padding:7px 16px;}\n\n\n.burger-menu-btn{display:none;flex-direction:column;gap:5px;width:26px;padding:6px 0;background:none;border:none;cursor:pointer;}\n\n.burger-menu-btn span{display:block;width:100%;height:2px;background:#a48256;transition:transform .3s,opacity .2s;}\n\n.burger-menu-btn.active span:nth-child(1){transform:translateY(7px) rotate(45deg);}\n\n.burger-menu-btn.active span:nth-child(2){opacity:0;}\n\n.burger-menu-btn.active span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}\n\n\n\n#mobile-menu{position:fixed;top:0;left:0;height:100%;width:100%;background:#F5F5F3;transform:translateX(-100%);transition:transform 1.25s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;padding:18px 26px 40px;overflow-y:auto;z-index:2147483647;}\n\n#mobile-menu.open{transform:translateX(0);}\n\n#mobile-menu .mm-top{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(174,130,69,.2);padding-bottom:16px;}\n\n#mobile-menu .mm-logo{font-family:'Cinzel',serif;color:#AE8245;letter-spacing:3px;text-transform:uppercase;font-size:1.15rem;}\n\n#mobile-menu .mm-close{background:none;border:none;font-size:2rem;color:#AE8245;cursor:pointer;}\n\n#mobile-menu .mm-section{border-bottom:1px solid rgba(174,130,69,.12);}\n\n#mobile-menu .mm-head{display:flex;align-items:center;justify-content:space-between;width:100%;background:none;border:none;text-align:left;font-family:'Cinzel',serif;color:#AE8245;font-weight:500;font-size:16px;padding:16px 2px 12px;cursor:pointer;}\n\n#mobile-menu .mm-arrow{color:#8CB5A3;font-size:28px;transition:transform .3s;}\n\n#mobile-menu .mm-section.collapsed .mm-arrow{transform:rotate(-90deg);}\n\n#mobile-menu .mm-body{overflow:hidden;max-height:1400px;opacity:1;transition:max-height 10.8s cubic-bezier(.22,1,.36,1),opacity 6.3s ease;}\n\n#mobile-menu .mm-section.collapsed .mm-body{max-height:0;opacity:0;}\n\n#mobile-menu a{display:block;padding:10px 2px;color:rgba(174,130,69,.9);text-decoration:none;font-size:14px;border-bottom:1px solid rgba(0,0,0,.05);}\n\n#mobile-menu .mm-regions{columns:2;column-gap:18px;}\n\n#mobile-menu .mm-listprop{width:100%;margin-top:24px;background:transparent;color:#AE8245;border:1px solid #AE8245;padding:14px;border-radius:6px;font-family:'Cinzel',serif;text-transform:uppercase;font-size:.9rem;cursor:pointer;}\n\n#mobile-menu .mm-signin{width:100%;margin-top:12px;background:#87a996;color:#fff;border:none;padding:14px;border-radius:6px;font-family:'Cinzel',serif;text-transform:uppercase;font-size:.9rem;cursor:pointer;}\n@media(max-width:900px){.main-header{padding:12px 20px;}.nav-links{gap:14px;}.nav-link,.nav-item-dropdown{display:none;}}\n@media(max-width:600px){#uc-belt{font-size:10px;padding:6px 12px;}}\n@media(max-width:900px){.main-header .nav-links{display:none!important;}.burger-menu-btn{display:flex;}}\n@media(min-width:901px){#mobile-menu{display:none!important;}}\n.site-footer {\n                background: #3c3530;\n                color: rgba(255, 255, 255, 0.75);\n                padding: 60px 50px 30px;\n                font-family: 'Jost',sans-serif;\n                font-weight: 300;\n            }\n.footer-inner {\n                max-width: 1200px;\n                margin: 0 auto;\n                display: grid;\n                grid-template-columns: 1.4fr 1fr 1fr;\n                gap: 40px;\n                padding-bottom: 40px;\n                border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n            }\n.footer-brand .footer-logo {\n                font-family: 'Cinzel',serif;\n                font-size: 1.4rem;\n                color: #a48256;\n                text-transform: uppercase;\n                letter-spacing: 3px;\n                font-weight: 500;\n                display: block;\n                margin-bottom: 6px;\n            }\n.footer-brand .footer-sub {\n                font-size: 0.65rem;\n                text-transform: uppercase;\n                letter-spacing: 4px;\n                color: rgba(255, 255, 255, 0.5);\n                display: block;\n                margin-bottom: 18px;\n            }\n.footer-brand p {\n                font-size: 0.9rem;\n                line-height: 1.7;\n                max-width: 360px;\n                color: rgba(255, 255, 255, 0.6);\n            }\n.footer-col h4 {\n                font-family: 'Cinzel',serif;\n                font-size: 0.8rem;\n                text-transform: uppercase;\n                letter-spacing: 2px;\n                color: #fff;\n                font-weight: 400;\n                margin-bottom: 18px;\n            }\n.footer-col a, .footer-col button.footer-line, .footer-col span.footer-line {\n                display: block;\n                width: 100%;\n                color: rgba(255, 255, 255, 0.65);\n                text-decoration: none;\n                font-size: 0.88rem;\n                margin-bottom: 12px;\n                transition: color 0.3s ease;\n                cursor: pointer;\n                background: none;\n                border: none;\n                border-radius: 0;\n                padding: 0;\n                text-align: left;\n                font-family: 'Jost',sans-serif;\n                font-weight: 300;\n                letter-spacing: 0.3px;\n                -webkit-appearance: none;\n                appearance: none;\n                box-shadow: none;\n            }\n.footer-col a:hover, .footer-col button.footer-line:hover {\n                color: #a48256;\n            }\n.footer-bottom {\n                max-width: 1200px;\n                margin: 0 auto;\n                padding-top: 25px;\n                display: flex;\n                justify-content: space-between;\n                align-items: center;\n                flex-wrap: wrap;\n                gap: 12px;\n                font-size: 0.78rem;\n                color: rgba(255, 255, 255, 0.45);\n                letter-spacing: 0.5px;\n            }\n.footer-bottom .footer-credit { color: rgba(255, 255, 255, 0.6); }\n.footer-bottom .footer-credit strong { color: #a48256; font-weight: 500; }\n.site-footer { padding: 45px 30px 25px; }\n.footer-inner { grid-template-columns: 1fr; gap: 32px; }\n.footer-bottom { flex-direction: column; align-items: flex-start; }\n.sc-footer{background:#3c3530;color:rgba(255,255,255,.75);padding:60px 50px 30px;font-family:'Jost',sans-serif;font-weight:300}\n.sc-footer{text-align:left}\n.sc-footer .footer-inner{grid-template-columns:1.4fr 1fr 1fr;gap:40px;max-width:1200px;margin:0 auto}\n.sc-footer .footer-bottom{flex-direction:row;align-items:center}\n@media(max-width:768px){.sc-footer .footer-inner{grid-template-columns:1fr;gap:32px}.sc-footer .footer-bottom{flex-direction:column;align-items:flex-start}}\n@media(max-width:768px){.sc-footer{padding:45px 30px 25px}}\nbody{padding-top:74px}\n.site-hero{min-height:calc(100vh - 102px)!important}\n.main-header .nav-links>.nav-item-dropdown:not([style*=\"none\"]){display:inline-flex!important}\n.main-header .nav-links>.nav-link:not([style*=\"none\"]){display:inline-flex!important}\n.main-header .nav-item-dropdown>.nav-link{display:inline-flex!important}\n.burger-menu-btn{display:none!important}\n@media(max-width:900px){.main-header .nav-links{display:none!important}.burger-menu-btn{display:flex!important}}\n#nr-addtab{top:114px!important;bottom:auto!important;right:0!important;left:auto!important;width:170px!important;box-sizing:border-box!important;min-height:44px!important;padding:0 14px!important;font-size:10.5px!important;letter-spacing:.5px!important;white-space:nowrap!important;border-radius:5px 0 0 5px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important}\n#nr-backbuilder{top:158px!important;bottom:auto!important;right:0!important;left:auto!important;width:170px!important;box-sizing:border-box!important;min-height:44px!important;padding:0 14px!important;font-size:10.5px!important;letter-spacing:.5px!important;white-space:nowrap!important;border-radius:5px 0 0 5px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;background:rgba(200,90,23,.6)!important;box-shadow:0 4px 16px rgba(60,53,48,.22)!important}\n#nr-cart{top:202px!important;bottom:auto!important;right:0!important;left:auto!important;width:170px!important;box-sizing:border-box!important;min-height:44px!important;border-radius:5px 0 0 5px!important;padding:0 14px!important;font-size:10.5px!important;letter-spacing:.5px!important;white-space:nowrap!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;background:rgba(200,90,23,.6)!important;box-shadow:0 4px 16px rgba(60,53,48,.22)!important}\n#nr-cart .nr-ic{font-size:0!important}\n#nr-cart .nr-ic::before{content:'→';font-size:15px;color:#fff;line-height:1}\n#nr-addtab,#nr-backbuilder,#nr-cart{background:rgba(200,90,23,.6)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;border:1px solid rgba(255,255,255,.35)!important;box-shadow:0 4px 16px rgba(60,53,48,.22)!important}\n",BELT="<div id=\"uc-belt\">&#9888; Development Version. Rates displayed on this site are illustrative examples only and do not represent actual lodge rates, availability, or bookable inventory. Please contact the property directly for current pricing and availability.</div>",HEADER="<header class=\"main-header\">\n  <a href=\"/\" class=\"header-logo-block\"><span class=\"logo-main\">Namibia Rates</span><span class=\"logo-sub\">Trade Rates Portal</span></a>\n  <button class=\"burger-menu-btn\" type=\"button\" aria-label=\"Open menu\" onclick=\"toggleMobileMenu()\"><span></span><span></span><span></span></button>\n  <nav class=\"nav-links\">\n    <div class=\"nav-item-dropdown\"><a class=\"nav-link\">Accommodation &#9662;</a><div class=\"dropdown-menu\"><div class=\"dropdown-column\"><div class=\"xborder-head\">Namibia</div><a href=\"/sossusvlei-accommodation/\">Sossusvlei &amp; Namib</a><a href=\"/swakopmund-accommodation/\">Swakopmund</a><a href=\"/skeleton-coast-accommodation/\">Skeleton Coast</a><a href=\"/damaraland-accommodation/\">Damaraland</a><a href=\"/kaokoland-accommodation/\">Kaokoland</a><a href=\"/epupa-accommodation/\">Epupa</a><a href=\"/opuwo-accommodation/\">Opuwo</a><a href=\"/west-etosha-accommodation/\">West Etosha</a><a href=\"/south-etosha-accommodation/\">South Etosha</a></div><div class=\"dropdown-column\"><div class=\"xborder-head\" aria-hidden=\"true\">&nbsp;</div><a href=\"/east-etosha-accommodation/\">East Etosha</a><a href=\"/central-namibia-accommodation/\">Central Namibia</a><a href=\"/windhoek-accommodation/\">Windhoek</a><a href=\"/kalahari-accommodation/\">Kalahari</a><a href=\"/fish-river-canyon-accommodation/\">Fish River Canyon</a><a href=\"/luderitz-accommodation/\">Luderitz</a><a href=\"/caprivi-accommodation/\">Zambezi &amp; Caprivi</a></div><div class=\"dropdown-column xborder\"><div class=\"xborder-head\">Botswana &amp; Zimbabwe</div><a href=\"/okavango-delta-accommodation/\">Okavango Delta</a><a href=\"/chobe-accommodation/\">Chobe</a><a href=\"/victoria-falls-accommodation/\">Victoria Falls</a></div></div></div>\n    <div class=\"nav-item-dropdown\"><a class=\"nav-link\" href=\"/vehicle_rates.html\">Vehicles &#9662;</a>"+vehicleMenuHTML()+"</div>\n    <div class=\"nav-item-dropdown\"><a class=\"nav-link\" href=\"/activity_rates.html\">Activities &#9662;</a>"+activityMenuHTML()+"</div>\n    <div class=\"nav-item-dropdown\" id=\"nav-builder\" style=\"display:none\"><a class=\"nav-link\" href=\"/builder/\" style=\"cursor:pointer\">Itinerary Builder</a></div><div class=\"nav-item-dropdown\" id=\"nav-progress\" style=\"display:none\"><a class=\"nav-link\" href=\"/tools/rate-progress.html\">Progress Report</a></div><div class=\"nav-item-dropdown\" id=\"nav-grouplodges\" style=\"display:none\"><a class=\"nav-link\">Group Lodges &#9662;</a><div class=\"dropdown-menu\"><div class=\"dropdown-column\"><a href=\"/ratesheets/exclusive_reservations_ratesheet_v3.html\">Exclusive Reservations</a><a href=\"/ratesheets/o_and_l_ratesheet_v3.html\">O&amp;L Collection</a><a href=\"/ratesheets/ondili_ratesheet_v3_final_1.html\">Ondili</a><a href=\"/ratesheets/natural_selection_ratesheet_v1_4.html\">Natural Selection</a><a href=\"/ratesheets/wilderness_ratesheet_v3.html\">Wilderness</a><a href=\"/ratesheets/ongava_ratesheet_v3.html\">Ongava</a><a href=\"/ratesheets/onguma_ratesheet_v3.html\">Onguma</a><a href=\"/ratesheets/gondwana_ratesheet_v3.html\">Gondwana Collection</a><a href=\"/ratesheets/nwr_ratesheet_v1.html\">NWR</a><a href=\"/ratesheets/wolwedans_ratesheet_v3.html\">Wolwedans</a><a href=\"/ratesheets/mushara_ratesheet_v3.html\">Mushara Collection</a><a href=\"/ratesheets/okonjima_ratesheet_v3.html\">Okonjima / AfriCat</a><a href=\"/ratesheets/journeys_namibia_ratesheet_v3_3.html\">Journeys Namibia</a></div><div class=\"dropdown-column\"><a href=\"/ratesheets/logufa_ratesheet_v3.html\">Logufa</a><a href=\"/ratesheets/chiwani_ratesheet_v3.html\">Chiwani</a><a href=\"/ratesheets/big_sky_lodges_ratesheet_v3.html\">Big Sky Lodges</a><a href=\"/ratesheets/hammerstein_africa_ratesheet_v3.html\">Hammerstein Africa</a><a href=\"/ratesheets/namibia_country_lodges_ratesheet_v3.html\">Namibia Country Lodges</a><a href=\"/ratesheets/quiver_and_co_ratesheet_v3.html\">Quiver &amp; Co</a><a href=\"/ratesheets/sun_karros_ratesheet_v3.html\">Sun Karros</a><a href=\"/ratesheets/taleni_africa_ratesheet_v3.html\">Taleni Africa</a><a href=\"/ratesheets/ultimate_safaris_ratesheet_v3.html\">Ultimate Safaris</a><a href=\"/ratesheets/zambezi_queen_ratesheet_v3.html\">Zambezi Queen Collection</a></div></div></div><div class=\"nav-item-dropdown\" id=\"nav-map\"><a class=\"nav-link\" href=\"/map/\">Map Your Itinerary</a></div><button class=\"enquire-now-btn hdr-outline\" id=\"hdr-signup-btn\" onclick=\"scSignUp()\">Sign Up</button>\n    <button class=\"enquire-now-btn\" id=\"hdr-agent-btn\" onclick=\"scSignIn()\">Sign In</button>\n    <button class=\"search-icon-btn\" aria-label=\"Search\" onclick=\"location.href='/'\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"11\" r=\"8\"></circle><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"></line></svg></button>\n  </nav>\n</header>",MM="<div id=\"mobile-menu\" role=\"dialog\" aria-label=\"Menu\"><div class=\"mm-top\"><span class=\"mm-logo\">Namibia Rates</span><button class=\"mm-close\" type=\"button\" aria-label=\"Close menu\" onclick=\"closeMobileMenu()\">&times;</button></div><div class=\"mm-section collapsed\"><button class=\"mm-head\" type=\"button\" onclick=\"toggleSection(this)\">Accommodation <span class=\"mm-arrow\">&#9662;</span></button><div class=\"mm-body\"><div class=\"mm-regions\"><a href=\"/sossusvlei-accommodation/\">Sossusvlei &amp; Namib</a><a href=\"/swakopmund-accommodation/\">Swakopmund</a><a href=\"/skeleton-coast-accommodation/\">Skeleton Coast</a><a href=\"/damaraland-accommodation/\">Damaraland</a><a href=\"/kaokoland-accommodation/\">Kaokoland</a><a href=\"/epupa-accommodation/\">Epupa</a><a href=\"/opuwo-accommodation/\">Opuwo</a><a href=\"/west-etosha-accommodation/\">West Etosha</a><a href=\"/south-etosha-accommodation/\">South Etosha</a><a href=\"/east-etosha-accommodation/\">East Etosha</a><a href=\"/central-namibia-accommodation/\">Central Namibia</a><a href=\"/windhoek-accommodation/\">Windhoek</a><a href=\"/kalahari-accommodation/\">Kalahari</a><a href=\"/fish-river-canyon-accommodation/\">Fish River Canyon</a><a href=\"/luderitz-accommodation/\">Luderitz</a><a href=\"/caprivi-accommodation/\">Zambezi &amp; Caprivi</a></div><div class=\"dropdown-column xborder\"><div class=\"xborder-head\">Botswana &amp; Zimbabwe</div><a href=\"/okavango-delta-accommodation/\">Okavango Delta</a><a href=\"/chobe-accommodation/\">Chobe</a><a href=\"/victoria-falls-accommodation/\">Victoria Falls</a></div></div></div><div class=\"mm-section collapsed\"><button class=\"mm-head\" type=\"button\" onclick=\"toggleSection(this)\">Vehicles <span class=\"mm-arrow\">&#9662;</span></button><div class=\"mm-body\"><a href=\"/vehicle_rates.html#nrcr\">Namib Roos Car Rentals</a><a href=\"/vehicle_rates.html#ncr\">Namibia Car Rental</a><a href=\"/vehicle_rates.html#nts\">Namibia Tours &amp; Safaris</a><a href=\"/vehicle_rates.html#sanga\">Sanga Group Travel</a><a href=\"/vehicle_rates.html#suricate\">Suricate Safaris</a><a href=\"/vehicle_rates.html#sch\">Swakopmund Car Hire</a><a href=\"/vehicle_rates.html#warthog\">Warthog Car Rental</a><a href=\"/vehicle_rates.html#zaris\">Zaris Safaris</a></div></div><div class=\"mm-section collapsed\"><button class=\"mm-head\" type=\"button\" onclick=\"toggleSection(this)\">Activities <span class=\"mm-arrow\">&#9662;</span></button><div class=\"mm-body\"><div class=\"xborder-head\">Sossusvlei &amp; Namib</div><a href=\"/activity_rates.html#namibsky\">Namib Sky Ballooning</a><div class=\"xborder-head\">Swakopmund</div><a href=\"/activity_rates.html#alteraction\">Alter Action Sandboarding</a><a href=\"/activity_rates.html#desert\">Desert Explorers</a><a href=\"/activity_rates.html#infinite\">Infinite African Safaris</a><a href=\"/activity_rates.html#livingdesert\">Living Desert Adventures</a><div class=\"xborder-head\">Walvis Bay</div><a href=\"/activity_rates.html#molamola\">Mola Mola Safaris</a><div class=\"xborder-head\">L&uuml;deritz</div><a href=\"/activity_rates.html#bogenfels\">Bogenfels Tours</a></div></div><div class=\"mm-section collapsed\"><button class=\"mm-head\" type=\"button\" onclick=\"toggleSection(this)\">More <span class=\"mm-arrow\">&#9662;</span></button><div class=\"mm-body\"><a href=\"/\">Search lodges</a></div></div><button class=\"mm-listprop\" type=\"button\" onclick=\"location.href='/supplier-portal/'\">Supplier Portal</button><button class=\"mm-signin\" id=\"mm-agent\" type=\"button\">Agent Sign In</button></div><script>function toggleMobileMenu(){var m=document.getElementById(\"mobile-menu\"),b=document.querySelector(\".burger-menu-btn\");if(m){var o=m.classList.toggle(\"open\");if(o){var ss=m.querySelectorAll('.mm-section');ss.forEach(function(s){s.classList.add('collapsed');});ss.forEach(function(s,i){setTimeout(function(){s.classList.remove('collapsed');},3120+i*3360);});}if(b)b.classList.toggle(\"active\",o);document.body.style.overflow=o?\"hidden\":\"\";}}function closeMobileMenu(){var m=document.getElementById(\"mobile-menu\"),b=document.querySelector(\".burger-menu-btn\");if(m){m.classList.remove(\"open\");if(b)b.classList.remove(\"active\");document.body.style.overflow=\"\";}}function toggleSection(btn){var s=btn.closest(\".mm-section\");if(s)s.classList.toggle(\"collapsed\");}(function(){var a=document.getElementById(\"mm-agent\");if(!a)return;if(sessionStorage.getItem(\"nr_agent_token\")){a.textContent=\"Sign Out\";a.onclick=function(){sessionStorage.removeItem(\"nr_agent_token\");document.cookie=\"nr_session=; path=/; max-age=0; SameSite=Lax\";location.reload();};}else{a.onclick=function(){location.href=\"/#agent\";};}})();</script>\n<script src=\"/assets/enquiry-wizard.js\" defer></script><link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css\">\n<style>\n  .nr-mapbtn{display:inline-flex;align-items:center;gap:7px;margin-top:22px;cursor:pointer;font-family:var(--font-body);text-transform:uppercase;letter-spacing:1.5px;font-size:.72rem;padding:10px 18px;border-radius:6px;border:1px solid rgba(255,255,255,.85);background:rgba(0,0,0,.28);color:#fff;backdrop-filter:blur(4px);transition:.2s}\n  .nr-mapbtn:hover{background:#fff;color:#3c3530}\n  .nr-mapbtn svg{width:15px;height:15px}\n  .nr-map-overlay{display:none;position:fixed;inset:0;z-index:2147483647;background:rgba(20,18,16,.72);align-items:center;justify-content:center;padding:26px}\n  .nr-map-overlay.open{display:flex}\n  .nr-map-panel{background:#fff;border-radius:14px;overflow:hidden;width:100%;max-width:960px;height:80vh;max-height:760px;display:flex;flex-direction:column;box-shadow:0 30px 80px rgba(0,0,0,.45)}\n  .nr-map-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:#3c3530;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:14px}\n  .nr-map-bar .nr-map-x{cursor:pointer;background:none;border:0;color:#fff;font-size:24px;line-height:1;padding:0 8px;border-radius:6px}\n  .nr-map-bar .nr-map-x:hover{background:rgba(255,255,255,.18)}\n  .nr-avail-frame{flex:1 1 auto;width:100%;border:0;background:#fff;min-height:0}\n  .nr-map-bar .nr-avail-newtab{margin-left:auto;color:#fff;font-size:12px;text-decoration:underline;white-space:nowrap}\n  @media(max-width:600px){.nr-map-overlay{padding:0}.nr-map-panel{max-width:none;height:100dvh;max-height:none;border-radius:0}}\n</style>\n<style>\n  .nr-map-panel #lodge-map{flex:1;width:100%;background:#e7ddca}\n  .nr-pin{background:none;border:0}\n  .nr-pulse{width:16px;height:16px;border-radius:50%;background:#1c1c1c;border:2px solid #fff;box-sizing:border-box;box-shadow:0 0 0 0 rgba(0,0,0,.5);animation:nrpulse 1.5s ease-out infinite}\n  @keyframes nrpulse{0%{box-shadow:0 0 0 0 rgba(0,0,0,.6)}70%{box-shadow:0 0 0 22px rgba(0,0,0,0)}100%{box-shadow:0 0 0 0 rgba(0,0,0,0)}}\n  #lodge-map .leaflet-popup-content-wrapper{border-radius:10px}\n  #lodge-map .leaflet-popup-content{margin:0;width:230px!important}\n  .nr-pop img{width:230px;height:120px;object-fit:cover;display:block;border-radius:10px 10px 0 0}\n  .nr-pop .nr-pop-body{padding:8px 12px 10px;font-family:Arial,Helvetica,sans-serif}\n  .nr-pop .nr-pop-name{font-weight:700;color:#3a3427;font-size:15px}\n  .nr-pop .nr-pop-sub{color:#8a8175;font-size:12px;margin-top:2px}\n</style>\n\n<div id=\"nr-map-overlay\" class=\"nr-map-overlay\" onclick=\"if(event.target===this)nrCloseMap()\">\n  <div class=\"nr-map-panel\">\n    <div class=\"nr-map-bar\"><span>Desert Quiver Camp &middot; Sossusvlei &amp; Namib</span><button type=\"button\" class=\"nr-map-x\" aria-label=\"Close map\" onclick=\"nrCloseMap()\">&times;</button></div>\n    <div id=\"lodge-map\"></div>\n  </div>\n</div>\n",MODAL="<div class=\"modal\" id=\"login-modal\">\n  <div class=\"modal-box\">\n    <h3>Agent Sign In</h3>\n    <p>Trade partners only \u2014 sign in to view your contracted rates.</p>\n    <label>Username</label>\n    <input id=\"login-user\" type=\"text\" autocomplete=\"username\" onkeydown=\"if(event.key==='Enter')submitLogin()\">\n    <label>Password</label>\n    <input id=\"login-pass\" type=\"password\" autocomplete=\"current-password\" onkeydown=\"if(event.key==='Enter')submitLogin()\">\n    <div class=\"modal-err\" id=\"login-err\"></div>\n    <div class=\"modal-actions\">\n      <button class=\"btn\" style=\"flex:1\" onclick=\"closeLoginModal()\">Cancel</button>\n      <button class=\"btn solid\" style=\"flex:1\" onclick=\"submitLogin()\">Sign In</button>\n    </div>\n  </div>\n</div><div class=\"modal\" id=\"role-signin\"><div class=\"modal-box\"><h3>Sign In</h3><p>Who are you signing in as?</p><div class=\"role-grid\"><button class=\"role-card\" onclick=\"scPick('agent')\"><strong>Agent</strong><span>View your contracted STO rates</span></button><button class=\"role-card\" onclick=\"scPick('supplier')\"><strong>Supplier</strong><span>Manage your property &amp; rates</span></button></div><button class=\"role-cancel\" onclick=\"scCloseRole()\">Cancel</button></div></div><div class=\"modal\" id=\"role-signup\"><div class=\"modal-box\"><h3>Sign Up</h3><p>Create your account as…</p><div class=\"role-grid\"><button class=\"role-card\" onclick=\"scPickUp('agent')\"><strong>Agent</strong><span>Travel trade partner</span></button><button class=\"role-card\" onclick=\"scPickUp('supplier')\"><strong>Supplier</strong><span>Lodge / property owner</span></button></div><button class=\"role-cancel\" onclick=\"scCloseRole()\">Cancel</button></div></div>",FOOTER="<footer class=\"sc-footer\" class=\"site-footer\">\n        <style data-no-optimize=\"1\">\n            .site-footer {\n                background: var(--text-main);\n                color: rgba(255, 255, 255, 0.75);\n                padding: 60px 50px 30px;\n                font-family: var(--font-body);\n                font-weight: 300;\n            }\n            .footer-inner {\n                max-width: 1200px;\n                margin: 0 auto;\n                display: grid;\n                grid-template-columns: 1.4fr 1fr 1fr;\n                gap: 40px;\n                padding-bottom: 40px;\n                border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n            }\n            .footer-brand .footer-logo {\n                font-family: var(--font-head);\n                font-size: 1.4rem;\n                color: var(--brand-accent);\n                text-transform: uppercase;\n                letter-spacing: 3px;\n                font-weight: 500;\n                display: block;\n                margin-bottom: 6px;\n            }\n            .footer-brand .footer-sub {\n                font-size: 0.65rem;\n                text-transform: uppercase;\n                letter-spacing: 4px;\n                color: rgba(255, 255, 255, 0.5);\n                display: block;\n                margin-bottom: 18px;\n            }\n            .footer-brand p {\n                font-size: 0.9rem;\n                line-height: 1.7;\n                max-width: 360px;\n                color: rgba(255, 255, 255, 0.6);\n            }\n            .footer-col h4 {\n                font-family: var(--font-head);\n                font-size: 0.8rem;\n                text-transform: uppercase;\n                letter-spacing: 2px;\n                color: #fff;\n                font-weight: 400;\n                margin-bottom: 18px;\n            }\n            .footer-col a, .footer-col button.footer-line, .footer-col span.footer-line {\n                display: block;\n                width: 100%;\n                color: rgba(255, 255, 255, 0.65);\n                text-decoration: none;\n                font-size: 0.88rem;\n                margin-bottom: 12px;\n                transition: color 0.3s ease;\n                cursor: pointer;\n                background: none;\n                border: none;\n                border-radius: 0;\n                padding: 0;\n                text-align: left;\n                font-family: var(--font-body);\n                font-weight: 300;\n                letter-spacing: 0.3px;\n                -webkit-appearance: none;\n                appearance: none;\n                box-shadow: none;\n            }\n            .footer-col a:hover, .footer-col button.footer-line:hover {\n                color: var(--brand-accent);\n            }\n            .footer-bottom {\n                max-width: 1200px;\n                margin: 0 auto;\n                padding-top: 25px;\n                display: flex;\n                justify-content: space-between;\n                align-items: center;\n                flex-wrap: wrap;\n                gap: 12px;\n                font-size: 0.78rem;\n                color: rgba(255, 255, 255, 0.45);\n                letter-spacing: 0.5px;\n            }\n            .footer-bottom .footer-credit { color: rgba(255, 255, 255, 0.6); }\n            .footer-bottom .footer-credit strong { color: var(--brand-accent); font-weight: 500; }\n            @media (max-width: 768px) {\n                .site-footer { padding: 45px 30px 25px; }\n                .footer-inner { grid-template-columns: 1fr; gap: 32px; }\n                .footer-bottom { flex-direction: column; align-items: flex-start; }\n            }\n        </style>\n        <div class=\"footer-inner\">\n            <div class=\"footer-brand\">\n                <span class=\"footer-logo\">Namibia Rates</span>\n                <span class=\"footer-sub\">Trade Rates Portal</span>\n                <p>The centralized trade hub for luxury Namibian lodges, vehicles and activities \u2014 pre-negotiated STO rates for authorized travel partners.</p>\n            </div>\n            <nav class=\"footer-col\" aria-label=\"Explore\">\n                <h4>Explore</h4>\n                <button type=\"button\" class=\"footer-line\" onclick=\"switchTab('accommodation', document.getElementById('nav-accommodation'))\">Accommodation</button>\n                <button type=\"button\" class=\"footer-line\" onclick=\"switchTab('vehicle', document.getElementById('nav-vehicle'))\">Vehicles</button>\n                <button type=\"button\" class=\"footer-line\" onclick=\"switchTab('activities', document.getElementById('nav-activities'))\">Activities</button>\n                <button type=\"button\" class=\"footer-line\" onclick=\"location.href='/supplier-portal/'\">Supplier Portal</button>\n            </nav>\n            <nav class=\"footer-col\" aria-label=\"Trade Access\">\n                <h4>Trade Access</h4>\n                <button type=\"button\" class=\"footer-line\" onclick=\"openLogin('Agent Portal')\">Agent Sign In</button>\n                <a href=\"mailto:info@namibiarates.com\">info@namibiarates.com</a>\n                <span class=\"footer-line\" style=\"cursor:default;\">Pre-negotiated STO rates</span>\n            </nav>\n        </div>\n        <div class=\"footer-bottom\">\n            <span>&copy; <span id=\"footer-year\">2026</span> Namibia Rates. All rights reserved.</span>\n            <span class=\"footer-credit\">Trade Rates Portal &mdash; Authorized Partners &middot; <a href=\"/portal/\" style=\"color:inherit;text-decoration:underline\">Partner Portal</a></span>\n        </div>\n        <script>document.getElementById('footer-year').textContent = new Date().getFullYear();</script>\n    </footer>";
var st=document.createElement("style");st.textContent=CSS;(document.head||document.documentElement).appendChild(st);
var TOKEN_KEY="nr_agent_token";
window.toggleMobileMenu=function(){var m=document.getElementById("mobile-menu"),b=document.querySelector(".burger-menu-btn");if(m){var o=m.classList.toggle("open");if(o){var ss=m.querySelectorAll('.mm-section');ss.forEach(function(s){s.classList.add('collapsed');});ss.forEach(function(s,i){setTimeout(function(){s.classList.remove('collapsed');},3120+i*3360);});}if(b)b.classList.toggle("active",o);document.body.style.overflow=o?"hidden":"";}}
window.closeMobileMenu=function(){var m=document.getElementById("mobile-menu"),b=document.querySelector(".burger-menu-btn");if(m){m.classList.remove("open");if(b)b.classList.remove("active");document.body.style.overflow="";}}
window.toggleSection=function(btn){var s=btn.closest(".mm-section");if(s)s.classList.toggle("collapsed");}
window.openLoginModal=function(){
  document.getElementById('login-err').textContent='';
  document.getElementById('login-user').value='';
  document.getElementById('login-pass').value='';
  document.getElementById('login-modal').classList.add('open');
  document.getElementById('login-user').focus();
}
window.closeLoginModal=function(){ document.getElementById('login-modal').classList.remove('open'); }
window.submitLogin=function(){
  var u=document.getElementById('login-user').value.trim();
  var p=document.getElementById('login-pass').value;
  var err=document.getElementById('login-err'); err.textContent='Signing in…';
  fetch('/api/sto',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username:u,password:p})})
  .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
  .then(function(res){
    if(res.ok && res.j && res.j.token){
      
      closeLoginModal();
      sessionStorage.setItem(TOKEN_KEY,res.j.token); location.reload();
    } else {
      err.textContent=(res.j && res.j.error) ? res.j.error : 'Sign in failed.';
    }
  })
  .catch(function(){ err.textContent='Network error — please try again.'; });
}
window.agentBtn=function(){
  if(sessionStorage.getItem(TOKEN_KEY)){ sessionStorage.removeItem(TOKEN_KEY); location.reload(); }
  else { openLoginModal(); }
}



window.scOpenRole=function(id){var m=document.getElementById(id);if(m)m.classList.add("open");};
window.scCloseRole=function(){["role-signin","role-signup"].forEach(function(id){var m=document.getElementById(id);if(m)m.classList.remove("open");});};
window.scSignIn=function(){if(sessionStorage.getItem("nr_agent_token")){sessionStorage.removeItem("nr_agent_token");location.reload();}else{if(window.openAuthWizard){openAuthWizard("signin");}else{scOpenRole("role-signin");}}};
window.scSignUp=function(){if(window.openAuthWizard){openAuthWizard("signup");}else{scOpenRole("role-signup");}};
window.scPick=function(role){scCloseRole();if(role==="agent"){openLoginModal();}else{location.href="/supplier-portal/";}};
window.scPickUp=function(role){scCloseRole();location.href="/signup/?role="+role;};
(function(){var w=document.createElement("script");w.src="/assets/auth-wizard.js?v="+Date.now();w.defer=true;(document.head||document.documentElement).appendChild(w);})();
/* Underline the nav item matching the page you're on, the way the home page does. */
function markActiveNav(){try{
  var p=(location.pathname||"/").toLowerCase();
  var want=null;
  if(/^\/vehicle_rates/.test(p)) want="vehicles";
  else if(/^\/activity_rates/.test(p)) want="activities";
  else if(/^\/map\//.test(p)) want="map your itinerary";
  else if(/^\/builder\//.test(p)) want="itinerary builder";
  else if(/^\/tools\/rate-progress/.test(p)) want="progress report";
  else if(/-accommodation(\/|$)/.test(p)||/^\/ratesheets\//.test(p)) want="accommodation";
  document.querySelectorAll(".main-header .nav-link").forEach(function(a){
    var t=(a.textContent||"").replace(/[\u25be\u25bc\u2039\u203a?]/g,"").trim().toLowerCase();
    a.classList.toggle("active", !!want && t===want);
  });
}catch(e){}}
function updateAgentState(){var inn=!!sessionStorage.getItem("nr_agent_token");
if(inn){document.cookie="nr_session="+encodeURIComponent(sessionStorage.getItem("nr_agent_token"))+"; path=/; SameSite=Lax";}
var sup=document.getElementById("nav-supplier");if(sup)sup.style.display=inn?"none":"";
var gl=document.getElementById("nav-grouplodges");if(gl)gl.style.display=inn?"":"none";
var ib=document.getElementById("nav-builder");if(ib)ib.style.display=inn?"":"none";var pr=document.getElementById("nav-progress");if(pr)pr.style.display=inn?"":"none";
var b=document.getElementById("hdr-agent-btn");if(b)b.textContent=inn?"Sign Out":"Sign In";var su=document.getElementById("hdr-signup-btn");if(su)su.style.display=inn?"none":"";
var mp=document.getElementById("nav-map");if(mp)mp.style.display=inn?"none":"";}
window.agentBtn=function(){if(sessionStorage.getItem("nr_agent_token")){sessionStorage.removeItem("nr_agent_token");document.cookie="nr_session=; path=/; max-age=0; SameSite=Lax";location.reload();}else{openLoginModal();}};

function build(){
 ["#uc-belt",".main-header","#mobile-menu","#mm-backdrop","#login-modal"].forEach(function(s){var e=document.querySelector(s);if(e)e.remove();});
 var of=document.querySelector("footer:not(.sc-footer)");if(of)of.remove();
 var of2=document.querySelector("footer.sc-footer");if(of2)of2.remove();
 var gb=document.querySelector(".grp-back");if(gb)gb.remove();
 document.body.insertAdjacentHTML("afterbegin",HEADER+MM+MODAL);
 document.body.insertAdjacentHTML("beforeend",FOOTER);
 var yr=document.getElementById("yr");if(yr)yr.textContent=new Date().getFullYear();
 updateAgentState();
 markActiveNav();
 var mh=document.querySelector(".main-header");var belt=document.getElementById("uc-belt");
 function scFit(){var bb=belt?belt.offsetHeight:0;if(mh)mh.style.top=bb+"px";if(mh){var h=Math.ceil(mh.getBoundingClientRect().bottom);document.body.style.paddingTop=h+"px";var sh=document.querySelector(".site-hero");if(sh)sh.style.minHeight="calc(100vh - "+h+"px)";}}
 scFit();window.addEventListener("resize",scFit);window.addEventListener("load",scFit);
 wireExplore();
}
/* Define exploreDown() globally so the .scroll-explore hint (onclick="exploreDown()")
   works on every page, not just the welcome page. Mirrors the welcome-page logic. */
if(!window.exploreDown){
 window.exploreDown=function(){
  var h=document.querySelector(".hero")||document.querySelector(".site-hero");
  var t=(h&&h.nextElementSibling)||document.querySelector("section");
  if(!t){t=window.innerHeight;window.scrollTo({top:window.innerHeight,behavior:"smooth"});return;}
  var header=document.querySelector(".main-header");
  var hoff=header?Math.ceil(header.getBoundingClientRect().height):0;
  var y=t.getBoundingClientRect().top+window.pageYOffset-hoff-4;
  var s=window.pageYOffset,d=y-s,dur=1100,t0=null;
  function st(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/dur,1);var e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;window.scrollTo(0,s+d*e);if(p<1)requestAnimationFrame(st);}
  requestAnimationFrame(st);
 };
}
function wireExplore(){
 try{
  var els=document.querySelectorAll(".scroll-explore");
  for(var i=0;i<els.length;i++){(function(box){box.style.cursor="pointer";box.addEventListener("click",function(ev){ev.preventDefault();window.exploreDown();});})(els[i]);}
 }catch(err){}
}
if(document.readyState!=="loading")build();else document.addEventListener("DOMContentLoaded",build);
})();

/* ── Namibia Rates visitor tracker ─────────────────────────────────────────────
   Emails on page exit (≥30s dwell), once per page/day, to the address configured
   in the vault function. Self-contained + additive: fires on every page that loads
   this shared script (all region / group / activities / ratesheet pages).
   Payload keys mirror the Desert Tracks track-visit.js contract so the cloned
   nr-track-visit.js parses them unchanged. text/plain body avoids a CORS preflight. */
(function(){
  var TRACKER_URL="https://desert-tracks-itinerary-vault.vercel.app/api/nr-track-visit";
  var MIN_TIME_MS=30000;
  var host=location.hostname;
  // Production only — skip Vercel preview deploys and local dev.
  if(/\.vercel\.app$/i.test(host)||host==="localhost"||host==="127.0.0.1")return;
  function trafficSource(){
    try{
      var p=new URLSearchParams(location.search);
      var gAds=p.get("gclid")||p.get("gbraid")||p.get("wbraid");
      var msclkid=p.get("msclkid"),fbclid=p.get("fbclid");
      var src=(p.get("utm_source")||"").trim();
      var med=(p.get("utm_medium")||"").trim().toLowerCase();
      var camp=(p.get("utm_campaign")||"").trim();
      var paid=/^(cpc|ppc|paid|paidsearch|paid_social|display|banner)/.test(med);
      var label="";
      if(gAds)label="Google Ads (paid)";
      else if(msclkid)label="Microsoft Ads (paid)";
      else if(src&&paid)label=src+" (paid)";
      else if(src)label=src+(med?" / "+med:"");
      else if(paid)label="Paid";
      else if(fbclid)label="Social (Meta)";
      else{
        var ref=document.referrer||"";
        if(!ref)label="Direct";
        else{
          var h="";try{h=new URL(ref).hostname.replace(/^www\./,"");}catch(e){h="";}
          var self=location.hostname.replace(/^www\./,"");
          if(h===self)label="Internal";
          else if(/(^|\.)google\./.test(h))label="Organic (Google)";
          else if(/(^|\.)(bing|yahoo|duckduckgo|ecosia|yandex)\./.test(h))label="Organic (search)";
          else if(/(^|\.)(facebook|instagram|linkedin|pinterest|youtube)\.|^t\.co$|^lnkd\.in$/.test(h))label="Social";
          else label="Referral"+(h?" ("+h+")":"");
        }
      }
      if(camp)label+=" · "+camp;
      return label||"Unknown";
    }catch(e){return "Unknown";}
  }
  var start=Date.now(),sent=false,clientLocation="Unknown Location",clientCountry="Unknown Country";
  function pageName(){var t=(document.title||"").trim();t=t.split("|")[0].split(" – ")[0].split(" — ")[0].trim();return t||"Namibia Rates";}
  function fmtTime(ms){var s=Math.round(ms/1000);if(s<60)return s+"s";var m=Math.floor(s/60),r=s%60;return m+"m "+r+"s";}
  function send(reason){
    if(sent)return;
    var elapsed=Date.now()-start;
    if(elapsed<MIN_TIME_MS)return;
    try{var k="nr_tracked_"+pageName()+"_"+new Date().toISOString().slice(0,10);if(sessionStorage.getItem(k)){sent=true;return;}sessionStorage.setItem(k,"1");}catch(e){}
    sent=true;
    var payload=JSON.stringify({
      safari_name:pageName(),
      time_spent:fmtTime(elapsed),
      seconds:Math.round(elapsed/1000),
      visitor_location:clientLocation,
      country:clientCountry,
      source:trafficSource(),
      page_link:location.href,
      timestamp:new Date().toLocaleString(),
      reason:reason
    });
    try{var blob=new Blob([payload],{type:"text/plain"});if(navigator.sendBeacon&&navigator.sendBeacon(TRACKER_URL,blob))return;}catch(e){}
    try{fetch(TRACKER_URL,{method:"POST",headers:{"Content-Type":"text/plain"},body:payload,keepalive:true}).catch(function(){});}catch(e){}
  }
  fetch("https://get.geojs.io/v1/ip/geo.json").then(function(r){return r.json();}).then(function(d){if(d){clientCountry=d.country||clientCountry;clientLocation=(d.city?d.city+", ":"")+(d.region?d.region+", ":"")+(d.country||"");}}).catch(function(){});
  document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")send("hidden");});
  window.addEventListener("pagehide",function(){send("pagehide");});
  window.addEventListener("beforeunload",function(){send("beforeunload");});
})();
/* ===== 26/27 rate-season switcher. Inline pills (same look as the lodge pages), shown to
   public visitors AND signed-in agents. Drives real 2027 rates where a page carries them,
   defers to a page's own native switcher, and otherwise shows a "rates to follow" note.
   Default 2026 leaves the page untouched. ===== */
;(function(){"use strict";try{
  var KEY="nr_sto_year";
  function isAgent(){try{var e=document.querySelectorAll("a,button,span");for(var i=0;i<e.length;i++){var t=(e[i].textContent||"").trim().toLowerCase();if(t==="sign out"||t==="signout")return true;}}catch(x){}return false;}
  function year(){return localStorage.getItem(KEY)==="2027"?"2027":"2026";}
  function hasNative(){try{return (typeof window.setRateYear==="function")||!!document.querySelector(".year-pane[data-year]");}catch(x){return false;}}
  function hideInline(){try{var nt=document.querySelector(".year-toggle");if(nt)nt.style.display="none";}catch(x){}}
  function driveNative(y){try{
    if(typeof window.setRateYear==="function"){window.setRateYear(y);}
    else{
      var any=false;
      document.querySelectorAll(".year-pane[data-year]").forEach(function(p){p.style.display=(p.getAttribute("data-year")===y)?"":"none";any=true;});
      document.querySelectorAll(".yr-btn").forEach(function(b){b.classList.toggle("active",b.getAttribute("data-y")===y);});
      if(any && typeof window.updateTotal==="function"){try{window.updateTotal();}catch(e){}}
    }
    hideInline();
  }catch(x){}}
  function rateTables(){
    var sel=["#detail-view table",".tab-content table",".rate-table","table.rates",".rates-table","#rates table",".rate-card table"];
    var out=[],seen=[];
    sel.forEach(function(s){try{document.querySelectorAll(s).forEach(function(el){if(seen.indexOf(el)<0){seen.push(el);out.push(el);}});}catch(x){}});
    return out;
  }
  function hideTables(on){rateTables().forEach(function(el){
    if(el.closest&&el.closest(".year-pane"))return; /* real dual-year sheets manage their own panes */
    if(on){if(el.getAttribute("data-nr-open")==null){el.setAttribute("data-nr-open",el.style.display||"");el.style.display="none";}}
    else{if(el.getAttribute("data-nr-open")!=null){el.style.display=el.getAttribute("data-nr-open");el.removeAttribute("data-nr-open");}}
  });}
  function noteText(){
    /* never say "STO" to a signed-out visitor */
    return isAgent()
      ? "2027 STO rates - to follow. We are loading these now; please continue to quote 2026 rates in the meantime."
      : "2027 rates - to follow. We are loading these now; please continue to use 2026 rates in the meantime.";
  }
  function showNote(on){
    var note=document.getElementById("nr-2027-note");
    if(on){
      if(!note){note=document.createElement("div");note.id="nr-2027-note";}
      note.textContent=noteText();
      var t=document.getElementById("nr-yrtoggle");
      if(t&&t.parentNode){ if(note.parentNode!==t.parentNode||note.previousSibling!==t){t.parentNode.insertBefore(note,t.nextSibling);} return; }
      var host=document.querySelector("#detail-view")||document.querySelector("main")||document.body;
      if(host&&note.parentNode!==host){host.insertBefore(note,host.firstChild);}
    }else if(note){note.remove();}
  }
  function injectCss(){
    if(document.getElementById("nr-yr-css"))return;
    var s=document.createElement("style");s.id="nr-yr-css";
    s.textContent=
      "#nr-yrtoggle{display:flex;gap:8px;margin:0 0 16px;flex-wrap:wrap}"
      +"#nr-yrtoggle button{cursor:pointer;font:inherit;font-size:.72rem;letter-spacing:.5px;padding:5px 13px;border-radius:4px;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(200,90,23,.6);background:rgba(200,90,23,.08);color:#c85a17;transition:background .18s,color .18s}"
      +"#nr-yrtoggle button.active{background:rgba(200,90,23,.6);color:#fff}"
      +".nr-card-note{margin:6px 0 2px;padding:15px 18px;border-radius:12px;background:rgba(200,90,23,.10);border:1px solid rgba(200,90,23,.4);color:#8a4a22;font-family:Inter,sans-serif;font-size:.86rem;text-align:center;letter-spacing:.2px;line-height:1.45}"
      +"#nr-2027-note{margin:0 0 18px;padding:15px 18px;border-radius:12px;background:rgba(200,90,23,.10);border:1px solid rgba(200,90,23,.4);color:#8a4a22;font-family:Inter,sans-serif;font-size:.86rem;text-align:center;letter-spacing:.2px;line-height:1.45}";
    document.head.appendChild(s);
  }
  /* Put the pills in the flow of the page, just above the rates. */
  function place(w){
    var dv=document.getElementById("detail-view");
    if(dv){ if(w.parentNode!==dv||dv.firstChild!==w) dv.insertBefore(w,dv.firstChild); return true; }
    var tc=document.querySelector(".tabs-container");
    if(tc&&tc.parentNode){ if(w.nextSibling!==tc) tc.parentNode.insertBefore(w,tc); return true; }
    var rc=document.querySelector(".rate-card");
    if(rc&&rc.parentNode){ if(w.nextSibling!==rc) rc.parentNode.insertBefore(w,rc); return true; }
    var mn=document.querySelector("main");
    if(mn){ if(w.parentNode!==mn||mn.firstChild!==w) mn.insertBefore(w,mn.firstChild); return true; }
    return false;
  }
  function reflect(){
    var y=year(),t=document.getElementById("nr-yrtoggle");
    if(t){t.querySelectorAll("button").forEach(function(b){b.classList.toggle("active",b.getAttribute("data-y")===y);});}
    if(hasNative())hideInline();
  }
  /* Supplier sheets tag each card with the year it actually carries (data-years).
     Show that card's tables only for the matching year; otherwise swap in a per-card note. */
  function perCard(){try{return document.querySelectorAll(".rate-card[data-years]").length>0;}catch(x){return false;}}
  function applyPerCard(y){
    document.querySelectorAll(".rate-card[data-years]").forEach(function(card){
      var have=(card.getAttribute("data-years")||"").split(/[,\s]+/).filter(Boolean);
      var ok=have.indexOf(y)>-1;
      /* a supplier that carries both years keeps one .year-block per year — show the
         matching block and hide the rest, rather than hiding the whole card */
      var blocks=card.querySelectorAll(".year-block[data-year]");
      if(blocks.length){
        blocks.forEach(function(b){ b.style.display=(b.getAttribute("data-year")===y)?"":"none"; });
        var cn=card.querySelector(".nr-card-note"); if(cn) cn.style.display=ok?"none":"";
        if(ok) return;
      }
      card.querySelectorAll("table").forEach(function(t){
        var wrap=(t.closest&&t.closest(".table-responsive"))||t;
        if(!ok){if(wrap.getAttribute("data-nr-open")==null){wrap.setAttribute("data-nr-open",wrap.style.display||"");wrap.style.display="none";}}
        else{if(wrap.getAttribute("data-nr-open")!=null){wrap.style.display=wrap.getAttribute("data-nr-open");wrap.removeAttribute("data-nr-open");}}
      });
      var n=card.querySelector(".nr-card-note");
      if(!ok){
        if(!n){n=document.createElement("div");n.className="nr-card-note";n.id="";card.appendChild(n);}
        n.textContent=y+" rates for this supplier are still to follow. Their published year is "+have.join(" / ")+".";
        n.style.display="";
      } else if(n){ n.style.display="none"; }
    });
  }
  function applyState(y){
    if(hasNative()){hideTables(false);showNote(false);driveNative(y);}
    else if(perCard()){hideTables(false);showNote(false);applyPerCard(y);}
    else{var on=(y==="2027");hideTables(on);showNote(on);}
    reflect();
  }
  function pick(y){localStorage.setItem(KEY,(y==="2027")?"2027":"2026");applyState(year());}
  /* group-collection sheets re-render a lodge's rates on open — re-apply the chosen year afterwards */
  function wrapOpen(){try{
    if(typeof window.openProperty==="function" && !window.openProperty.__nrYr){
      var _op=window.openProperty;
      window.openProperty=function(){var r=_op.apply(this,arguments);try{setTimeout(function(){applyState(year());},0);}catch(e){}return r;};
      window.openProperty.__nrYr=1;
    }
  }catch(x){}}
  function build(){
    /* property pages ship their own season pills (enquiry-wizard.js) — don't double up */
    if(document.getElementById("nr-lodge-yr")) return;
    var w=document.getElementById("nr-yrtoggle");
    if(!w){
      injectCss();
      w=document.createElement("div");w.id="nr-yrtoggle";
      w.innerHTML='<button type="button" data-y="2026">2026 season</button><button type="button" data-y="2027">2027 season</button>';
      w.addEventListener("click",function(e){var b=e.target&&e.target.closest?e.target.closest("button"):null;if(b)pick(b.getAttribute("data-y"));});
    }
    if(!place(w))return;
    wrapOpen();
    applyState(year());
  }
  function init(){build();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  try{var _nrt;var mo=new MutationObserver(function(){clearTimeout(_nrt);_nrt=setTimeout(function(){
    wrapOpen();
    if(!document.getElementById("nr-yrtoggle")){build();return;}
    reflect();
    if(!hasNative()){ if(perCard())applyPerCard(year()); else if(year()==="2027"){hideTables(true);showNote(true);} }
  },250);});mo.observe(document.body||document.documentElement,{childList:true,subtree:true});}catch(x){}
}catch(e){}})();
