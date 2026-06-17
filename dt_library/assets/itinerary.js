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
    return { items: items, total: total, dateIn: dateIn, dateOut: dateOut, dateInISO: dateInISO, dateOutISO: dateOutISO };
  }

  /* ---- add the lodge of the current sheet (auto-detected) ---- */
  window.nrAddCurrentLodge = function (btn) {
    var name = (document.title || '').split(' — ')[0].split(' | ')[0].split(' STO')[0].trim() || 'This lodge';
    var link = document.querySelector('#main-view a.back-btn[href*="-accommodation"]')
            || document.querySelector('a[href*="-accommodation/"]');
    var regionUrl = link ? link.getAttribute('href') : '';
    var r = currentRates();
    var ok = add({
      name: name,
      region: regionLabel(regionUrl),
      regionUrl: regionUrl,
      url: location.pathname,
      items: r.items,
      total: r.total,
      dateIn: r.dateIn,
      dateOut: r.dateOut,
      dateInISO: r.dateInISO,
      dateOutISO: r.dateOutISO
    });
    // remember the checkout so the NEXT lodge's calendar can carry on from it
    if (ok && r.dateOutISO) { try { sessionStorage.setItem('nr_cursor', r.dateOutISO); } catch (e) {} }
    if (ok && btn) {
      var orig = btn.getAttribute('data-label') || btn.textContent;
      btn.setAttribute('data-label', orig);
      btn.textContent = '✓ Added';
      btn.disabled = true;
      setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 2200);
    }
  };

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

  function init() { render(); applyCarryOver(); }
  if (document.readyState === 'loading') {
    window.addEventListener('load', init);
  } else { init(); }
})();
