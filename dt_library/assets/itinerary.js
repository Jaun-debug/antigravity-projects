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
    if (a.some(function (x) { return x.url === item.url; })) {
      toast(item.name + ' is already in your itinerary'); return false;
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

  /* ---- add the lodge of the current sheet (auto-detected) ---- */
  window.nrAddCurrentLodge = function (btn) {
    var name = (document.title || '').split(' — ')[0].split(' | ')[0].split(' STO')[0].trim() || 'This lodge';
    var link = document.querySelector('#main-view a.back-btn[href*="-accommodation"]')
            || document.querySelector('a[href*="-accommodation/"]');
    var regionUrl = link ? link.getAttribute('href') : '';
    var ok = add({
      name: name,
      region: regionLabel(regionUrl),
      regionUrl: regionUrl,
      url: location.pathname
    });
    if (ok && btn) {
      var orig = btn.getAttribute('data-label') || btn.textContent;
      btn.setAttribute('data-label', orig);
      btn.textContent = '✓ Added';
      btn.disabled = true;
      setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 2200);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else { render(); }
})();
