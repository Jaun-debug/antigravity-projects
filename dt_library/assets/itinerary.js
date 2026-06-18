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

  /* ---- right-edge vertical tabs: Add to Itinerary + Finalise Booking (rate sheets only) ---- */
  function injectVTabs() {
    if (typeof goFinalise !== 'function' && typeof openProperty !== 'function') return; // single OR group rate sheets
    if (document.getElementById('nr-vtabs')) return;
    var css = ''
      + '#booking-bar{display:none!important}'            // replaced by the floating Finalise tab
      + '.nr-vtabs{position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:9997;display:flex;flex-direction:column;gap:10px}'
      + '.nr-vtab{writing-mode:vertical-rl;border:none;cursor:pointer;padding:18px 11px;border-radius:12px 0 0 12px;'
      + 'font-family:Inter,sans-serif;font-size:.7rem;letter-spacing:2px;text-transform:uppercase;color:#fff;'
      + 'box-shadow:-5px 4px 18px rgba(44,40,36,.20);transition:filter .2s,padding .2s}'
      + '.nr-vtab:hover{filter:brightness(1.08);padding-right:15px}'
      + '.nr-vtab.add{background:#B8956A}.nr-vtab.fin{background:#2C2824}'
      + '@media print{.nr-vtabs{display:none!important}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var box = document.createElement('div'); box.id = 'nr-vtabs'; box.className = 'nr-vtabs';
    var add = document.createElement('button');
    add.type = 'button'; add.className = 'nr-vtab add'; add.textContent = '+ Add to Itinerary';
    add.onclick = function () { window.nrAddCurrentLodge(add); };
    var fin = document.createElement('button');
    fin.type = 'button'; fin.className = 'nr-vtab fin'; fin.textContent = 'Finalise Booking';
    fin.onclick = floatingFinalise;
    box.appendChild(add); box.appendChild(fin);
    document.body.appendChild(box);
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

  function init() { render(); hookOpenProperty(); applyCarryOver(); injectVTabs(); }
  if (document.readyState === 'loading') {
    window.addEventListener('load', init);
  } else { init(); }
})();
