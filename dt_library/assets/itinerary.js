/* Namibia Rates — Agent Itinerary (front-end, session-scoped)
   Stores added lodges in sessionStorage so they persist while the agent's
   browser is open and clear when it closes. No database required.
   Exposes:  window.NRItinerary  (load/add/remove/clear/count)
             window.nrAddCurrentLodge(btn)  — adds the lodge of the current sheet
   Also injects a floating "Itinerary" cart on any page that loads this file. */
(function () {
  var KEY = 'nr_itinerary';

  function load() {
    try { return JSON.parse(sessionStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function save(arr) {
    sessionStorage.setItem(KEY, JSON.stringify(arr));
    render();
  }
  function count() { return load().length; }
  function add(item) {
    var a = load();
    for (var i = 0; i < a.length; i++) {
      if (a[i].url === item.url) {
        // already there — refresh its rate data, keep any note the agent typed
        if (a[i].note && !item.note) item.note = a[i].note;
        a[i] = item; save(a);
        toast(item.name + ' updated in itinerary'); return true;
      }
    }
    a.push(item); save(a);
    toast(item.name + ' added to itinerary'); return true;
  }
  function remove(url) {
    save(load().filter(function (x) { return x.url !== url; }));
  }
  function clear() { save([]); }

  window.NRItinerary = { load: load, add: add, remove: remove, clear: clear, count: count, KEY: KEY };

  /* ---- styles ---- */
  var css = ''
    + '#nr-cart{position:fixed;right:18px;bottom:18px;z-index:9998;display:none;align-items:center;gap:9px;'
    + 'background:#2C2824;color:#fff;text-decoration:none;font-family:Inter,sans-serif;font-size:.72rem;'
    + 'letter-spacing:2px;text-transform:uppercase;padding:13px 20px;border-radius:34px;'
    + 'box-shadow:0 8px 26px rgba(0,0,0,.22);transition:transform .2s,box-shadow .2s}'
    + '#nr-cart:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,0,0,.28)}'
    + '#nr-cart .nr-ic{font-size:1rem}'
    + '#nr-cart .nr-badge{background:#B8956A;color:#fff;min-width:20px;height:20px;border-radius:11px;'
    + 'display:inline-flex;align-items:center;justify-content:center;font-size:.7rem;padding:0 6px;font-weight:600}'
    + '.nr-add-btn{cursor:pointer}'
    + '#nr-toast{position:fixed;left:50%;bottom:84px;transform:translateX(-50%) translateY(14px);z-index:9999;'
    + 'background:#2C2824;color:#fff;font-family:Inter,sans-serif;font-size:.8rem;padding:12px 22px;border-radius:30px;'
    + 'box-shadow:0 8px 26px rgba(0,0,0,.22);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;max-width:88vw;text-align:center}'
    + '#nr-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}';
  var st = document.createElement('style'); st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  /* ---- floating cart ---- */
  function ensureCart() {
    if (document.getElementById('nr-cart')) return;
    var c = document.createElement('a');
    c.id = 'nr-cart'; c.href = '/itinerary/';
    c.setAttribute('aria-label', 'View itinerary');
    document.body.appendChild(c);
  }
  function render() {
    if (!document.body) return;
    ensureCart();
    var c = document.getElementById('nr-cart'); if (!c) return;
    var n = count();
    if (n > 0) {
      c.style.display = 'inline-flex';
      c.innerHTML = '<span class="nr-ic">&#129523;</span> Itinerary <span class="nr-badge">' + n + '</span>';
    } else {
      c.style.display = 'none';
    }
  }

  /* ---- toast ---- */
  var toastTimer;
  function toast(msg) {
    if (!document.body) return;
    var t = document.getElementById('nr-toast');
    if (!t) { t = document.createElement('div'); t.id = 'nr-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }

  /* ---- region label from an /xxx-accommodation/ slug ---- */
  function regionLabel(url) {
    if (!url) return '';
    var s = url.replace(/\//g, '').replace('-accommodation', '').replace(/-/g, ' ').trim();
    return s.replace(/\b\w/g, function (m) { return m.toUpperCase(); });
  }

  function fmtDate(d) {
    try { return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch (e) { return ''; }
  }

  /* ---- read the rates the agent has selected on this sheet (if any) ---- */
  function currentRates() {
    var items = [], total = 0, dateIn = '', dateOut = '', dateInISO = '', dateOutISO = '';
    try {
      if (typeof selectedItems !== 'undefined' && Array.isArray(selectedItems)) {
        items = selectedItems.map(function (it) {
          return { qty: it.qty, name: it.name, nights: it.nights, price: it.price, total: it.total };
        });
        total = items.reduce(function (a, i) { return a + (i.total || 0); }, 0);
      }
    } catch (e) {}
    try { if (typeof checkIn !== 'undefined' && checkIn) dateIn = fmtDate(checkIn); } catch (e) {}
    try { if (typeof checkOut !== 'undefined' && checkOut) dateOut = fmtDate(checkOut); } catch (e) {}
    // ISO dates straight from the booking fields (set by the sheet's own calendar)
    try { var di = document.getElementById('b-date-in'); if (di) dateInISO = di.value || ''; } catch (e) {}
    try { var dou = document.getElementById('b-date-out'); if (dou) dateOutISO = dou.value || ''; } catch (e) {}
    // group sheets don't expose checkIn/checkOut — derive display dates from the ISO fields
    if (!dateIn && dateInISO) { var a1 = new Date(dateInISO + 'T00:00:00'); if (!isNaN(a1)) dateIn = fmtDate(a1); }
    if (!dateOut && dateOutISO) { var a2 = new Date(dateOutISO + 'T00:00:00'); if (!isNaN(a2)) dateOut = fmtDate(a2); }
    return { items: items, total: total, dateIn: dateIn, dateOut: dateOut, dateInISO: dateInISO, dateOutISO: dateOutISO };
  }

  /* ---- short description + up to 3 photos from the sheet ---- */
  function lodgeBlurb() {
    var el = document.querySelector('.intro-text') || document.querySelector('.hero-intro');
    var txt = el ? (el.textContent || '').trim() : '';
    if (txt.length > 320) txt = txt.slice(0, 317).replace(/\s+\S*$/, '') + '…';
    return txt;
  }
  function lodgePhotos() {
    var urls = [], seen = {};
    var g = document.querySelectorAll('.gallery-img, .lodge-card-img');
    for (var i = 0; i < g.length && urls.length < 3; i++) {
      var s = g[i].getAttribute('src');
      if (s && !seen[s]) { seen[s] = 1; urls.push(s); }
    }
    return urls;
  }

  function isGroupSheet() { return typeof openProperty === 'function' && !!document.getElementById('d-title'); }

  /* ---- details for a lodge open inside a group/collection sheet ---- */
  function groupLodge() {
    var dt = document.getElementById('d-title');
    var dv = document.getElementById('detail-view');
    var open = dv && getComputedStyle(dv).display !== 'none';
    var name = dt ? (dt.innerText || dt.textContent || '').trim() : '';
    if (!open || !name) return null;
    var loc = document.getElementById('d-location') || document.getElementById('spec-location');
    var region = loc ? (loc.innerText || loc.textContent || '').trim() : '';
    var photos = [], seen = {};
    document.querySelectorAll('#d-gallery img').forEach(function (im) {
      var s = im.getAttribute('src'); if (s && !seen[s] && photos.length < 3) { seen[s] = 1; photos.push(s); }
    });
    var intro = document.getElementById('d-intro');
    var desc = intro ? (intro.innerText || intro.textContent || '').trim() : '';
    if (desc.length > 320) desc = desc.slice(0, 317).replace(/\s+\S*$/, '') + '…';
    var url = location.pathname + (window.__nrLodgeKey ? '?lodge=' + encodeURIComponent(window.__nrLodgeKey) : '');
    return { name: name, region: region, regionUrl: '', url: url, desc: desc, photos: photos };
  }

  /* ---- add the lodge of the current sheet (auto-detected) ---- */
  window.nrAddCurrentLodge = function (btn) {
    var base;
    if (isGroupSheet()) {
      base = groupLodge();
      if (!base) { toast('Open a lodge in this collection first, then add it.'); return; }
    } else {
      var nm = (document.title || '').split(' — ')[0].split(' | ')[0].split(' STO')[0].trim() || 'This lodge';
      var link = document.querySelector('#main-view a.back-btn[href*="-accommodation"]')
              || document.querySelector('a[href*="-accommodation/"]');
      var regionUrl = link ? link.getAttribute('href') : '';
      base = { name: nm, region: regionLabel(regionUrl), regionUrl: regionUrl, url: location.pathname, desc: lodgeBlurb(), photos: lodgePhotos() };
    }
    var r = currentRates();
    var ok = add({
      name: base.name,
      region: base.region,
      regionUrl: base.regionUrl,
      url: base.url,
      items: r.items,
      total: r.total,
      dateIn: r.dateIn,
      dateOut: r.dateOut,
      dateInISO: r.dateInISO,
      dateOutISO: r.dateOutISO,
      desc: base.desc,
      photos: base.photos
    });
    // remember the checkout so the NEXT lodge's calendar can carry on from it
    if (ok && r.dateOutISO) { try { sessionStorage.setItem('nr_cursor', r.dateOutISO); } catch (e) {} }
    // best-effort geocode so the itinerary page can estimate drive distances
    geocodeAndStore(base.url, base.name, base.region);
    if (ok && btn) {
      var orig = btn.getAttribute('data-label') || btn.textContent;
      btn.setAttribute('data-label', orig);
      btn.textContent = '✓ Added';
      btn.disabled = true;
      setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 2200);
    }
  };

  /* ---- best-effort geocode (OpenStreetMap / Nominatim) ---- */
  function geocodeAndStore(url, name, region) {
    try {
      var q = encodeURIComponent(name + (region ? ', ' + region : '') + ', Namibia');
      fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + q, { headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && j[0]) {
            var lat = parseFloat(j[0].lat), lon = parseFloat(j[0].lon);
            var a = load();
            for (var i = 0; i < a.length; i++) { if (a[i].url === url) { a[i].lat = lat; a[i].lon = lon; break; } }
            sessionStorage.setItem(KEY, JSON.stringify(a));
          }
        })
        .catch(function () {});
    } catch (e) {}
  }

  /* ---- carry the previous lodge's check-out onto this sheet's calendar ---- */
  function applyCarryOver() {
    try {
      if (typeof selectDate !== 'function' || typeof checkIn === 'undefined') return; // not a rate sheet
      if (checkIn) return;                       // agent has already picked dates here
      var iso = sessionStorage.getItem('nr_cursor');
      if (!iso) return;
      var d = new Date(iso + 'T00:00:00');
      if (isNaN(d.getTime())) return;
      var today = new Date(); today.setHours(0, 0, 0, 0);
      if (d < today) return;                     // never pre-select a past date
      if (typeof calMonth !== 'undefined') { calMonth = d.getMonth(); calYear = d.getFullYear(); }
      selectDate(d);                             // sets check-in; agent picks check-out for nights
      flagCarry(iso);
    } catch (e) {}
  }
  function flagCarry(iso) {
    // gentle hint that the date was carried over from the previous lodge
    var disp = document.getElementById('b-dates-display');
    if (disp && /Select dates/i.test(disp.innerText || '')) { /* leave default */ }
    var host = document.getElementById('cal-root');
    if (host && !document.getElementById('nr-carry-note')) {
      var n = document.createElement('div');
      n.id = 'nr-carry-note';
      n.style.cssText = 'text-align:center;font-family:Inter,sans-serif;font-size:.78rem;color:#7A7269;margin:6px 0 0';
      n.innerHTML = 'Check-in carried over from your previous lodge. Pick a check-out date to set the nights.';
      host.parentNode.insertBefore(n, host.nextSibling);
    }
  }

  /* ---- horizontal left-side action bar (rate sheets only) ---- */
  function injectVTabs() {
    if (typeof goFinalise !== 'function' && typeof openProperty !== 'function') return; // single OR group rate sheets
    if (document.getElementById('nr-bar')) return;
    var css = ''
      + '#booking-bar{display:none!important}'            // replaced by the floating bar
      + '#nr-bar{position:fixed;left:14px;bottom:14px;z-index:9997;display:flex;flex-wrap:wrap;gap:8px;max-width:62vw}'
      + '.nr-b{border:none;cursor:pointer;padding:11px 16px;border-radius:30px;font-family:Inter,sans-serif;'
      + 'font-size:.68rem;letter-spacing:1.5px;text-transform:uppercase;color:#fff;background:#2C2824;'
      + 'box-shadow:0 6px 18px rgba(44,40,36,.20);transition:filter .2s,transform .15s;white-space:nowrap}'
      + '.nr-b:hover{filter:brightness(1.1);transform:translateY(-1px)}'
      + '.nr-b.gold{background:#B8956A}.nr-b.green{background:#87a996}'
      + '@media print{#nr-bar{display:none!important}}'
      + '@media(max-width:640px){#nr-bar{max-width:94vw}.nr-b{font-size:.62rem;padding:9px 12px}}'
      // saved-itineraries overlay
      + '#nr-saved-ov{position:fixed;inset:0;z-index:10000;background:rgba(20,18,16,.55);display:none;align-items:center;justify-content:center;padding:20px}'
      + '#nr-saved-ov.open{display:flex}'
      + '.nr-saved-card{background:#fff;border-radius:16px;max-width:520px;width:100%;max-height:80vh;overflow:auto;padding:26px;font-family:Inter,sans-serif}'
      + '.nr-saved-card h3{font-family:Georgia,serif;font-weight:400;font-size:1.4rem;margin:0 0 14px;color:#2C2824}'
      + '.nr-si{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid rgba(184,149,106,.25);border-radius:10px;padding:12px 14px;margin-bottom:9px}'
      + '.nr-si .meta{font-size:.78rem;color:#7A7269}.nr-si .nm{font-size:.95rem;color:#2C2824;font-weight:500}'
      + '.nr-si button{border:none;background:none;cursor:pointer;font-size:.72rem;letter-spacing:1px;text-transform:uppercase;padding:6px 8px}'
      + '.nr-si .ld{color:#B8956A}.nr-si .dl{color:#b46a6a}'
      + '.nr-saved-close{margin-top:8px;border:1px solid rgba(184,149,106,.4);background:none;color:#7A7269;border-radius:30px;padding:9px 18px;cursor:pointer;font-size:.7rem;letter-spacing:1.5px;text-transform:uppercase}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var bar = document.createElement('div'); bar.id = 'nr-bar';
    function mk(label, cls, fn) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'nr-b' + (cls ? ' ' + cls : '');
      b.textContent = label; b.onclick = fn; bar.appendChild(b); return b;
    }
    var addBtn = mk('+ Add to Itinerary', 'gold', function () { window.nrAddCurrentLodge(addBtn); });
    mk('Next Lodge', '', function () { location.href = '/'; });
    mk('Finalise Booking', '', floatingFinalise);
    mk('Itinerary Progress', '', function () { location.href = '/itinerary/'; });
    mk('Save Itinerary', 'green', saveCurrentItinerary);
    mk('Saved Itineraries', '', showSavedItineraries);
    document.body.appendChild(bar);
  }
  function floatingFinalise() {
    try {
      // single sheets can open their rates view; group sheets need a lodge already open
      if (typeof openRates === 'function') {
        var dv = document.getElementById('detail-view');
        if (dv && getComputedStyle(dv).display === 'none') openRates();
      }
      if (isGroupSheet() && !groupLodge()) {
        toast('Open a lodge in this collection first.');
        return;
      }
      var btn5 = document.getElementById('tab-btn-5');
      var ready = btn5 && btn5.classList.contains('ready');
      if (ready && typeof goFinalise === 'function') { goFinalise(); }
      else if (ready && typeof switchTab === 'function') { switchTab(5); }   // group sheets
      else {
        toast('Select your rooms and travel dates first to finalise.');
        var anchor = document.getElementById('cal-root') || document.querySelector('.tabs') || document.getElementById('detail-view');
        if (anchor && anchor.scrollIntoView) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (e) {}
  }
  /* ---- saved itineraries (this browser, localStorage) ---- */
  var SAVED_KEY = 'nr_saved_itineraries';
  function loadSaved() { try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; } catch (e) { return []; } }
  function persistSaved(a) { try { localStorage.setItem(SAVED_KEY, JSON.stringify(a)); } catch (e) {} }
  function saveCurrentItinerary() {
    var cur = load();
    if (!cur.length) { toast('Your itinerary is empty — add a lodge first.'); return; }
    var def = (cur[0] && cur[0].name ? cur[0].name : 'Itinerary') + ' (' + cur.length + ' lodge' + (cur.length > 1 ? 's' : '') + ')';
    var name = prompt('Name this itinerary:', def);
    if (!name) return;
    var saved = loadSaved();
    saved.unshift({ id: 'it' + Date.now(), name: name.trim(), savedAt: new Date().toISOString(), items: cur });
    persistSaved(saved);
    toast('Saved: ' + name.trim());
  }
  function showSavedItineraries() {
    var ov = document.getElementById('nr-saved-ov');
    if (!ov) {
      ov = document.createElement('div'); ov.id = 'nr-saved-ov';
      ov.addEventListener('click', function (e) { if (e.target === ov) ov.classList.remove('open'); });
      document.body.appendChild(ov);
    }
    var saved = loadSaved();
    var rows = saved.length ? saved.map(function (s) {
      var when = (s.savedAt || '').split('T')[0];
      return '<div class="nr-si" data-id="' + s.id + '"><div><div class="nm">' + (s.name || 'Itinerary').replace(/</g, '&lt;') + '</div>'
        + '<div class="meta">' + (s.items ? s.items.length : 0) + ' lodges · saved ' + when + '</div></div>'
        + '<div><button class="ld" data-id="' + s.id + '">Load</button><button class="dl" data-id="' + s.id + '">Delete</button></div></div>';
    }).join('') : '<p style="color:#7A7269;font-size:.9rem">No saved itineraries yet. Build one and tap “Save Itinerary”.</p>';
    ov.innerHTML = '<div class="nr-saved-card"><h3>Saved itineraries</h3>' + rows
      + '<button class="nr-saved-close">Close</button></div>';
    ov.classList.add('open');
    ov.querySelector('.nr-saved-close').onclick = function () { ov.classList.remove('open'); };
    ov.querySelectorAll('.ld').forEach(function (b) {
      b.onclick = function () {
        var s = loadSaved().filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
        if (s) { sessionStorage.setItem(KEY, JSON.stringify(s.items || [])); location.href = '/itinerary/'; }
      };
    });
    ov.querySelectorAll('.dl').forEach(function (b) {
      b.onclick = function () {
        persistSaved(loadSaved().filter(function (x) { return x.id !== b.getAttribute('data-id'); }));
        showSavedItineraries();
      };
    });
  }
  window.NRItinerary.save = saveCurrentItinerary;
  window.NRItinerary.showSaved = showSavedItineraries;

  /* ---- record which lodge is open inside a group sheet (for deep-link + add) ---- */
  function hookOpenProperty() {
    try {
      if (typeof openProperty === 'function' && !openProperty.__nrWrapped) {
        var orig = openProperty;
        window.openProperty = function (id) { try { window.__nrLodgeKey = id; } catch (e) {} return orig.apply(this, arguments); };
        window.openProperty.__nrWrapped = true;
      }
    } catch (e) {}
  }

  /* ---- on a group sheet, deep-link straight to a lodge via ?lodge=KEY ---- */
  function maybeOpenFromUrl() {
    try {
      if (typeof openProperty !== 'function') return;
      var m = location.search.match(/[?&]lodge=([^&]+)/);
      if (!m) return;
      var dv = document.getElementById('detail-view');
      var alreadyOpen = dv && getComputedStyle(dv).display !== 'none';
      if (!alreadyOpen) openProperty(decodeURIComponent(m[1]));
    } catch (e) {}
  }
  function init() { render(); hookOpenProperty(); maybeOpenFromUrl(); applyCarryOver(); injectVTabs(); }
  if (document.readyState === 'loading') {
    window.addEventListener('load', init);
  } else { init(); }
})();
