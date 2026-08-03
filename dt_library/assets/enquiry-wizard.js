/* ===== Loader: pull in flatpickr + the wizard stylesheet ===== */
(function () {
  function addLink(href) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); }
  addLink('https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css');
  addLink('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Jost:wght@300;400;500&display=swap');
  addLink('/assets/enquiry-wizard.css');
  var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/flatpickr'; document.head.appendChild(s);
})();

/* ===== Specific enquiry wizard ===== */
(function () {
  'use strict';
  var SUBMIT_ENDPOINT = 'https://wizard-inquiry.replit.app/submit';
  var TOTAL_STEPS = 5;
  var state = {
    currentStep: 1,
    clientCountry: 'Unknown Location',
    answers: {
      travelTiming: null, travelCompanion: null, isTradeAgent: false, budget: null,
      tripDetails: '', adults: 2, children: 0, email: '', firstName: '', surname: '', phone: ''
    },
    stepHistory: [1]
  };
  var rootEl = null;
  var overlayEl = null;
  function goToStep(step) {
    state.currentStep = step;
    if (state.stepHistory[state.stepHistory.length - 1] !== step) state.stepHistory.push(step);
    render();
  }
  function goBack() {
    if (state.stepHistory.length > 1) {
      state.stepHistory.pop();
      state.currentStep = state.stepHistory[state.stepHistory.length - 1];
      render();
    }
  }
  function getNextStep(currentStep) { return currentStep + 1; }
  function handleNext() { var next = getNextStep(state.currentStep); if (next <= TOTAL_STEPS) goToStep(next); }
  var OVERLAY_BG = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;background:#eae9e6;flex-direction:column;align-items:center;justify-content:flex-start;overflow-y:auto;overflow-x:hidden;color:#3c3530;';
  var DARK_LAYER_CSS = 'position:fixed;top:0;left:0;width:100%;height:100%;background:transparent;z-index:0;pointer-events:none;';
  function closeWizard() {
    state._wizardOpen = false;
    document.body.classList.remove('dt-specific-open');
    if (overlayEl) { overlayEl.style.cssText = 'display:none;' + OVERLAY_BG; overlayEl.innerHTML = ''; }
    if (rootEl) rootEl.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
    document.body.style.overflow = '';
  }
  function openWizard() {
    state._wizardOpen = true;
    state.currentStep = 1;
    state.stepHistory = [1];
    state._submitted = false;
    document.body.classList.add('dt-specific-open');
    var rawTitle = document.title || "This Safari";
    var cleanTitle = rawTitle.split('|')[0].replace(' - Upgraded Film Structure', '').trim();
    state._sourceTitle = cleanTitle;
    if (overlayEl) {
      if (rootEl) rootEl.style.cssText = 'position:absolute;width:0;height:0;overflow:visible;pointer-events:auto;';
      document.body.style.overflow = 'hidden';
      overlayEl.style.cssText = 'display:flex;' + OVERLAY_BG;
      overlayEl.innerHTML = '';
      var darkLayer = document.createElement('div'); darkLayer.style.cssText = DARK_LAYER_CSS; overlayEl.appendChild(darkLayer);
      render();
    }
  }
  function createOptionButton(text, value, currentValue, onClick) {
    var btn = document.createElement('button'); btn.type = 'button';
    btn.className = 'dew-option-btn' + (currentValue === value ? ' dew-active' : '');
    btn.textContent = text; btn.addEventListener('click', function () { onClick(value); });
    return btn;
  }
  function renderStep1() {
    var wrapper = document.createElement('div'); wrapper.className = 'dew-step-content';
    var heading = document.createElement('h2'); heading.className = 'dew-heading';
    heading.innerHTML = '<span style="font-weight: 400 !important; font-size: 0.55em; color: #7d756e !important; letter-spacing: 2px;">ENQUIRING ABOUT:</span><br/><span style="color:#a48256 !important; font-size:clamp(18px, 5.5vw, 26px) !important; font-family: \'Cinzel\', serif !important; font-weight: 500 !important; letter-spacing: 0.5px !important; line-height: 1.25 !important; display: block; margin-top: 6px;">' + state._sourceTitle + '</span>';
    wrapper.appendChild(heading);
    var travelHeading = document.createElement('h2'); travelHeading.className = 'dew-heading';
    travelHeading.style.fontSize = '24px'; travelHeading.style.marginBottom = '30px';
    travelHeading.textContent = 'Who are you travelling with?'; wrapper.appendChild(travelHeading);
    var options = [ { label: 'COUPLE', value: 'couple' }, { label: 'SOLO', value: 'solo' }, { label: 'FAMILY', value: 'family' }, { label: 'FRIENDS', value: 'friends' } ];
    var grid = document.createElement('div'); grid.className = 'dew-options-row';
    options.forEach(function (opt) { grid.appendChild(createOptionButton(opt.label, opt.value, state.answers.travelCompanion, function (val) { state.answers.travelCompanion = val; render(); })); });
    wrapper.appendChild(grid);
    var counterRow = document.createElement('div'); counterRow.className = 'dew-options-row'; counterRow.style.marginTop = '4px';
    counterRow.appendChild(createCounter('ADULTS', state.answers.adults, 1, function(val) { state.answers.adults = val; }));
    counterRow.appendChild(createCounter('CHILDREN (<12)', state.answers.children, 0, function(val) { state.answers.children = val; }));
    wrapper.appendChild(counterRow);
    return { content: wrapper, navOptions: { showNext: true, nextDisabled: !state.answers.travelCompanion } };
  }
  function renderStep2() {
    var wrapper = document.createElement('div'); wrapper.className = 'dew-step-content';
    var heading = document.createElement('h2'); heading.className = 'dew-heading'; heading.textContent = 'When would you like to travel?'; wrapper.appendChild(heading);
    var timingGrid = document.createElement('div');
    timingGrid.style.display = 'flex'; timingGrid.style.flexDirection = 'column'; timingGrid.style.gap = '15px'; timingGrid.style.width = '100%'; timingGrid.style.maxWidth = '400px'; timingGrid.style.margin = '0 auto 30px auto';
    var timingOptions = [ { label: 'I KNOW EXACTLY WHEN', value: 'exact' }, { label: 'I HAVE A ROUGH IDEA', value: 'rough' }, { label: 'TELL ME WHEN IS BEST', value: 'best' } ];
    timingOptions.forEach(function(opt) {
      var btn = createOptionButton(opt.label, opt.value, state.answers.timingType, function(val) { state.answers.timingType = val; render(); });
      btn.style.width = '100%'; btn.style.padding = '18px'; btn.style.fontSize = '13px'; timingGrid.appendChild(btn);
    });
    wrapper.appendChild(timingGrid);
    return { content: wrapper, navOptions: { showNext: true, nextDisabled: !state.answers.timingType } };
  }
  function renderStep3() {
    var wrapper = document.createElement('div'); wrapper.className = 'dew-step-content';
    var heading = document.createElement('h2'); heading.className = 'dew-heading'; heading.textContent = 'When would you like to travel?'; wrapper.appendChild(heading);
    var nextDisabled = true;
    if (state.answers.timingType === 'exact') {
      var dateGroup = document.createElement('div'); dateGroup.className = 'dew-form-row'; dateGroup.style.marginBottom = '20px';
      var fromWrapper = document.createElement('div'); fromWrapper.style.width = '100%'; fromWrapper.style.gridColumn = '1 / span 2';
      var fromInput = document.createElement('input'); fromInput.type = 'text'; fromInput.className = 'dew-input'; fromInput.style.display = 'none';
      fromWrapper.appendChild(fromInput); dateGroup.appendChild(fromWrapper); wrapper.appendChild(dateGroup);
      var dayCountWrapper = document.createElement('div'); dayCountWrapper.style.textAlign = 'center'; dayCountWrapper.style.minHeight = '30px'; dayCountWrapper.style.marginBottom = '10px';
      function updateDayCount() {
        if (state.answers.fromDate && state.answers.toDate) {
          var d1 = new Date(state.answers.fromDate); var d2 = new Date(state.answers.toDate);
          var diffDays = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
          dayCountWrapper.innerHTML = '<span style="color:#a48256; font-weight:bold; font-size:18px;">' + diffDays + ' Days Selected</span>';
        } else { dayCountWrapper.innerHTML = ''; }
      }
      updateDayCount(); wrapper.appendChild(dayCountWrapper);
      setTimeout(function() {
        flatpickr(fromInput, {
          mode: "range", minDate: "today", dateFormat: "Y-m-d", inline: true, showMonths: window.innerWidth > 768 ? 2 : 1,
          defaultDate: (state.answers.fromDate && state.answers.toDate) ? [state.answers.fromDate, state.answers.toDate] : null,
          onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length === 2) {
              state.answers.fromDate = instance.formatDate(selectedDates[0], "Y-m-d");
              state.answers.toDate = instance.formatDate(selectedDates[1], "Y-m-d");
              updateDayCount(); var nextBtn = document.querySelector('.dew-next-btn'); if (nextBtn) nextBtn.disabled = false;
            } else {
              state.answers.fromDate = ''; state.answers.toDate = ''; updateDayCount();
              var nextBtn = document.querySelector('.dew-next-btn'); if (nextBtn) nextBtn.disabled = true;
            }
          }
        });
      }, 10);
      nextDisabled = !(state.answers.fromDate && state.answers.toDate);
    } else if (state.answers.timingType === 'rough') {
      var roughInput = document.createElement('input'); roughInput.type = 'text'; roughInput.className = 'dew-input';
      roughInput.placeholder = 'e.g. Sometime in October 2026'; roughInput.value = state.answers.roughTiming || '';
      roughInput.style.maxWidth = '400px'; roughInput.style.margin = '0 auto'; roughInput.style.display = 'block'; roughInput.style.textAlign = 'center';
      roughInput.addEventListener('input', function() { state.answers.roughTiming = this.value; var nextBtn = document.querySelector('.dew-next-btn'); if (nextBtn) nextBtn.disabled = !(state.answers.roughTiming && state.answers.roughTiming.trim() !== ''); });
      wrapper.appendChild(roughInput);
      nextDisabled = !(state.answers.roughTiming && state.answers.roughTiming.trim() !== '');
    } else if (state.answers.timingType === 'best') {
      var bestText = document.createElement('div'); bestText.style.color = '#7d756e'; bestText.style.textAlign = 'center'; bestText.style.fontSize = '14px'; bestText.style.lineHeight = '1.6'; bestText.style.maxWidth = '400px'; bestText.style.margin = '0 auto';
      bestText.innerText = 'Our safari experts will advise you on the best season based on your preferences.'; wrapper.appendChild(bestText);
      nextDisabled = false;
    }
    return { content: wrapper, navOptions: { showNext: true, nextDisabled: nextDisabled } };
  }
  function createCounter(label, value, min, onChange) {
    var wrapper = document.createElement('div');
    wrapper.style.display = 'flex'; wrapper.style.flexDirection = 'column'; wrapper.style.alignItems = 'center'; wrapper.style.justifyContent = 'center';
    wrapper.style.background = '#ffffff'; wrapper.style.border = '1.5px solid rgba(164, 130, 86, 0.30)'; wrapper.style.borderRadius = '6px'; wrapper.style.padding = '17px 20px'; wrapper.style.minHeight = '52px';
    var title = document.createElement('div'); title.innerText = label; title.style.color = '#7d756e'; title.style.fontSize = '12px'; title.style.fontWeight = '600'; title.style.marginBottom = '10px'; title.style.letterSpacing = '2.2px'; title.style.textTransform = 'uppercase';
    var btnWrap = document.createElement('div'); btnWrap.style.display = 'flex'; btnWrap.style.alignItems = 'center'; btnWrap.style.gap = '15px';
    var btnMinus = document.createElement('button'); btnMinus.innerText = '−';
    btnMinus.style.width = '30px'; btnMinus.style.height = '30px'; btnMinus.style.borderRadius = '50%'; btnMinus.style.border = '1.5px solid rgba(164, 130, 86, 0.45)'; btnMinus.style.background = 'transparent'; btnMinus.style.color = '#3c3530'; btnMinus.style.fontSize = '18px'; btnMinus.style.cursor = 'pointer'; btnMinus.style.display = 'flex'; btnMinus.style.alignItems = 'center'; btnMinus.style.justifyContent = 'center'; btnMinus.style.transition = 'all 0.2s ease';
    btnMinus.onmouseover = function() { this.style.borderColor = '#a48256'; this.style.color = '#a48256'; };
    btnMinus.onmouseout = function() { this.style.borderColor = 'rgba(164, 130, 86, 0.45)'; this.style.color = '#3c3530'; };
    btnMinus.onclick = function() { if (value > min) { value--; onChange(value); render(); } };
    var valDisp = document.createElement('div'); valDisp.innerText = value; valDisp.style.fontSize = '18px'; valDisp.style.fontWeight = 'bold'; valDisp.style.color = '#3c3530'; valDisp.style.minWidth = '20px'; valDisp.style.textAlign = 'center';
    var btnPlus = document.createElement('button'); btnPlus.innerText = '+'; btnPlus.style.cssText = btnMinus.style.cssText; btnPlus.onmouseover = btnMinus.onmouseover; btnPlus.onmouseout = btnMinus.onmouseout;
    btnPlus.onclick = function() { value++; onChange(value); render(); };
    btnWrap.appendChild(btnMinus); btnWrap.appendChild(valDisp); btnWrap.appendChild(btnPlus);
    wrapper.appendChild(title); wrapper.appendChild(btnWrap);
    return wrapper;
  }
  function renderStep4() {
    var wrapper = document.createElement('div'); wrapper.className = 'dew-step-content';
    var heading = document.createElement('h2'); heading.className = 'dew-heading'; heading.textContent = 'What is your travel budget per person?'; wrapper.appendChild(heading);
    var options = [ { label: 'EUR 3K - 7.5K', value: '3k-7.5k' }, { label: 'EUR 7.5K - 10K', value: '7.5k-10k' }, { label: 'EUR 10K - 20K', value: '10k-20k' }, { label: 'EUR 20K - 40K', value: '20k-40k' } ];
    var list = document.createElement('div'); list.className = 'dew-options-list';
    options.forEach(function (opt) { list.appendChild(createOptionButton(opt.label, opt.value, state.answers.budget, function (val) { state.answers.budget = val; render(); })); });
    wrapper.appendChild(list);
    return { content: wrapper, navOptions: { showNext: true, nextDisabled: !state.answers.budget } };
  }
  function renderStep5() {
    var wrapper = document.createElement('div'); wrapper.className = 'dew-step-content';
    var heading = document.createElement('h2'); heading.className = 'dew-heading'; heading.textContent = 'Tell us more about your trip (Optional)'; wrapper.appendChild(heading);
    var textarea = document.createElement('textarea'); textarea.className = 'dew-textarea'; textarea.placeholder = 'Would you like to customize this safari? Any specific experiences?'; textarea.value = state.answers.tripDetails;
    textarea.addEventListener('input', function () { state.answers.tripDetails = this.value; });
    wrapper.appendChild(textarea);
    return { content: wrapper, navOptions: { showNext: true } };
  }
  function renderStep6() {
    var wrapper = document.createElement('div'); wrapper.className = 'dew-step-content';
    var heading = document.createElement('h2'); heading.className = 'dew-heading'; heading.textContent = 'Where can we send your trip suggestions?'; heading.style.marginBottom = '10px'; wrapper.appendChild(heading);
    var subText = document.createElement('div'); subText.style.color = '#7d756e'; subText.style.fontSize = '15px'; subText.style.textAlign = 'center'; subText.style.marginBottom = '30px'; subText.style.fontFamily = 'var(--dew-font-body)';
    subText.textContent = 'Our team will contact you to help design your journey.'; wrapper.appendChild(subText);
    var nameRow = document.createElement('div'); nameRow.className = 'dew-form-row';
    var fnInput = document.createElement('input'); fnInput.type = 'text'; fnInput.className = 'dew-input'; fnInput.placeholder = 'FIRST NAME'; fnInput.value = state.answers.firstName;
    fnInput.addEventListener('input', function () { state.answers.firstName = this.value; updateSubmitState(); }); nameRow.appendChild(fnInput);
    var snInput = document.createElement('input'); snInput.type = 'text'; snInput.className = 'dew-input'; snInput.placeholder = 'SURNAME'; snInput.value = state.answers.surname;
    snInput.addEventListener('input', function () { state.answers.surname = this.value; updateSubmitState(); }); nameRow.appendChild(snInput); wrapper.appendChild(nameRow);
    var emailGroup = document.createElement('div'); emailGroup.className = 'dew-form-group';
    var emailInput = document.createElement('input'); emailInput.type = 'email'; emailInput.className = 'dew-input'; emailInput.placeholder = 'EMAIL ADDRESS'; emailInput.value = state.answers.email;
    emailInput.addEventListener('input', function () { state.answers.email = this.value; updateSubmitState(); }); emailGroup.appendChild(emailInput); wrapper.appendChild(emailGroup);
    var phoneGroup = document.createElement('div'); phoneGroup.className = 'dew-form-group';
    var phoneInput = document.createElement('input'); phoneInput.type = 'tel'; phoneInput.className = 'dew-input'; phoneInput.placeholder = 'TELEPHONE NUMBER'; phoneInput.value = state.answers.phone;
    phoneInput.addEventListener('input', function () { state.answers.phone = this.value; updateSubmitState(); }); phoneGroup.appendChild(phoneInput); wrapper.appendChild(phoneGroup);
    if (!state.answers.contactPreference) state.answers.contactPreference = 'email';
    var prefGroup = document.createElement('div'); prefGroup.style.display = 'flex'; prefGroup.style.alignItems = 'center'; prefGroup.style.justifyContent = 'flex-start'; prefGroup.style.width = '100%'; prefGroup.style.maxWidth = 'var(--dew-inner-w)'; prefGroup.style.marginTop = '15px'; prefGroup.style.marginBottom = '25px'; prefGroup.style.gap = '20px'; prefGroup.style.flexWrap = 'wrap';
    var prefLabel = document.createElement('div'); prefLabel.textContent = 'Preferred method of contact'; prefLabel.style.color = '#3c3530'; prefLabel.style.fontSize = '14px'; prefLabel.style.marginRight = '10px'; prefLabel.style.fontFamily = 'var(--dew-font-body)'; prefGroup.appendChild(prefLabel);
    var contactOptions = [ { label: 'Email', value: 'email' }, { label: 'Phone', value: 'phone' }, { label: 'WhatsApp', value: 'whatsapp' } ];
    contactOptions.forEach(function(opt) {
      var optWrap = document.createElement('div'); optWrap.style.display = 'flex'; optWrap.style.alignItems = 'center'; optWrap.style.gap = '10px'; optWrap.style.cursor = 'pointer'; optWrap.style.color = '#3c3530'; optWrap.style.fontSize = '14px'; optWrap.style.fontFamily = 'var(--dew-font-body)';
      var radioWrap = document.createElement('div'); radioWrap.style.width = '22px'; radioWrap.style.height = '22px'; radioWrap.style.borderRadius = '50%'; radioWrap.style.border = '2px solid ' + (state.answers.contactPreference === opt.value ? '#a48256' : 'rgba(0, 0, 0, 0.28)'); radioWrap.style.display = 'flex'; radioWrap.style.alignItems = 'center'; radioWrap.style.justifyContent = 'center';
      if (state.answers.contactPreference === opt.value) { var dot = document.createElement('div'); dot.style.width = '10px'; dot.style.height = '10px'; dot.style.borderRadius = '50%'; dot.style.backgroundColor = '#a48256'; radioWrap.appendChild(dot); }
      optWrap.onclick = function() { state.answers.contactPreference = opt.value; render(); };
      optWrap.appendChild(radioWrap); optWrap.appendChild(document.createTextNode(opt.label)); prefGroup.appendChild(optWrap);
    });
    wrapper.appendChild(prefGroup);
    if (typeof state.answers.newsletter === 'undefined') state.answers.newsletter = false;
    var newsGroup = document.createElement('label'); newsGroup.style.display = 'flex'; newsGroup.style.alignItems = 'center'; newsGroup.style.gap = '12px'; newsGroup.style.width = '100%'; newsGroup.style.maxWidth = 'var(--dew-inner-w)'; newsGroup.style.cursor = 'pointer'; newsGroup.style.marginBottom = '20px'; newsGroup.style.color = '#3c3530'; newsGroup.style.fontSize = '14px'; newsGroup.style.fontFamily = 'var(--dew-font-body)';
    var check = document.createElement('input'); check.type = 'checkbox'; check.className = 'dew-checkbox'; check.checked = state.answers.newsletter;
    check.addEventListener('change', function() { state.answers.newsletter = this.checked; }); newsGroup.appendChild(check);
    newsGroup.appendChild(document.createTextNode('I would like to receive the latest news from Namibia Rates')); wrapper.appendChild(newsGroup);
    var submitDisabled = !state.answers.email || !state.answers.firstName || !state.answers.surname || !state.answers.phone;
    return { content: wrapper, navOptions: { showSubmit: true, submitDisabled: submitDisabled, onSubmit: handleSubmit } };
  }
  var submitBtnEl = null;
  function updateSubmitState() { if (submitBtnEl) { submitBtnEl.disabled = !state.answers.email || !state.answers.firstName || !state.answers.surname || !state.answers.phone; } }
  function renderSuccess() {
    var wrapper = document.createElement('div'); wrapper.className = 'dew-step-content';
    wrapper.innerHTML = '<div style="text-align:center; padding:60px 20px;"><div style="font-size:64px; margin-bottom:24px; color:#87a996;">✓</div><h2 style="font-size:32px; color:#a48256; font-family:Cinzel, serif;">Thank you!</h2><p style="color:#7d756e;">We will contact you regarding this enquiry shortly.</p></div>';
    return { content: wrapper, navOptions: {} };
  }
  function handleSubmit() {
    if (!state.answers.email) return;
    var formattedTiming = "";
    if (state.answers.timingType === 'exact') {
      if (state.answers.fromDate && state.answers.toDate) {
        var d1 = new Date(state.answers.fromDate); var d2 = new Date(state.answers.toDate);
        var diffDays = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
        formattedTiming = "EXACT DATES: " + state.answers.fromDate + " to " + state.answers.toDate + " (" + diffDays + " Days)";
      }
    } else if (state.answers.timingType === 'rough') { formattedTiming = "ROUGH TIMING: " + (state.answers.roughTiming || "Not specified"); }
    else if (state.answers.timingType === 'best') { formattedTiming = "ADVISE ME ON BEST TIME"; }
    var payload = {
      sourceUrl: window.location.href, sourcePageTitle: document.title, country: 'Specific Safari Booking',
      enquiryCountry: state.clientCountry, safariType: state._sourceTitle || 'Specific Safari',
      travelTiming: formattedTiming || state.answers.travelTiming, travelCompanion: state.answers.travelCompanion,
      budget: state.answers.budget, tripDetails: state.answers.tripDetails, adults: state.answers.adults, children: state.answers.children,
      email: state.answers.email, firstName: state.answers.firstName, surname: state.answers.surname, phone: state.answers.phone,
      contactPreference: state.answers.contactPreference || 'email', newsletter: state.answers.newsletter || false,
      gclid: new URLSearchParams(window.location.search).get('gclid') || '',
      source: new URLSearchParams(window.location.search).get('gclid') ? 'Google Ads' : 'Direct / Organic'
    };
    state._submitted = true; render();
    function doSubmit(geoLocation) {
      if (geoLocation) payload._geoLocation = geoLocation;
      fetch(SUBMIT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(function(){});
    }
    fetch('https://get.geojs.io/v1/ip/geo.json').then(function(r) { return r.json(); }).then(function(geo) {
      var parts = []; if (geo.city && geo.city !== 'nil') parts.push(geo.city); if (geo.region && geo.region !== 'nil') parts.push(geo.region); if (geo.country) parts.push(geo.country);
      doSubmit(parts.join(', '));
    }).catch(function() { doSubmit(null); });
    var ecEmail = (state.answers.email || '').trim().toLowerCase();
    var ecPhone = (state.answers.phone || '').replace(/[\s\-()]/g, '');
    if (typeof gtag !== 'undefined') {
      var userData = {}; if (ecEmail) userData.email = ecEmail; if (/^\+\d{8,15}$/.test(ecPhone)) userData.phone_number = ecPhone;
      if (userData.email || userData.phone_number) { gtag('set', 'user_data', userData); }
      gtag('event', 'conversion', { 'send_to': 'AW-10780198601/BDFUCOz2zK0cEMmNs5Qo' });
    }
    if (window.dataLayer) {
      var ecd = {}; if (ecEmail) ecd.email = ecEmail; if (/^\+\d{8,15}$/.test(ecPhone)) ecd.phone_number = ecPhone;
      window.dataLayer.push({ 'event': 'specific_safari_enquiry', 'enhanced_conversion_data': ecd });
    }
  }
  function routeStep() {
    if (state._submitted) return renderSuccess();
    switch (state.currentStep) {
      case 1: return renderStep1(); case 2: return renderStep2(); case 3: return renderStep3();
      case 4: return renderStep5(); case 5: return renderStep6(); default: return renderStep1();
    }
  }
  function render() {
    if (!overlayEl) return;
    overlayEl.innerHTML = '';
    var darkLayer = document.createElement('div'); darkLayer.style.cssText = DARK_LAYER_CSS; overlayEl.appendChild(darkLayer);
    var closeBtn = document.createElement('button'); closeBtn.className = 'dew-close-btn'; closeBtn.innerHTML = '&#10005;'; closeBtn.addEventListener('click', closeWizard); overlayEl.appendChild(closeBtn);
    var backBtn = document.createElement('button'); backBtn.className = 'dew-back-btn' + (state.currentStep === 1 ? ' dew-hidden' : ''); backBtn.innerHTML = '&lsaquo; BACK'; backBtn.addEventListener('click', goBack); overlayEl.appendChild(backBtn);
    var container = document.createElement('div'); container.className = 'dew-step-container';
    var stepResult = routeStep(); container.appendChild(stepResult.content); overlayEl.appendChild(container);
    if (stepResult.navOptions && (stepResult.navOptions.showNext || stepResult.navOptions.showSubmit)) {
      var navArea = document.createElement('div'); navArea.className = 'dew-nav-area';
      var btnsWrap = document.createElement('div'); btnsWrap.className = 'dew-nav-buttons';
      if (stepResult.navOptions.showNext) {
        var nextBtn = document.createElement('button'); nextBtn.className = 'dew-next-btn'; nextBtn.textContent = 'NEXT >'; nextBtn.disabled = stepResult.navOptions.nextDisabled; nextBtn.addEventListener('click', handleNext); btnsWrap.appendChild(nextBtn);
      }
      if (stepResult.navOptions.showSubmit) {
        var subBtn = document.createElement('button'); subBtn.className = 'dew-submit-btn'; subBtn.textContent = 'SUBMIT'; subBtn.disabled = stepResult.navOptions.submitDisabled; subBtn.addEventListener('click', handleSubmit); btnsWrap.appendChild(subBtn); submitBtnEl = subBtn;
      }
      navArea.appendChild(btnsWrap);
      var barWrap = document.createElement('div'); barWrap.className = 'dew-progress-bar';
      var fill = document.createElement('div'); fill.className = 'dew-progress-fill'; fill.style.width = ((state.currentStep / TOTAL_STEPS) * 100) + '%'; barWrap.appendChild(fill); navArea.appendChild(barWrap);
      container.appendChild(navArea);
    }
  }
  function init() {
    rootEl = document.getElementById('specific-enquiry-wizard-root');
    if (!rootEl) { rootEl = document.createElement('div'); rootEl.id = 'specific-enquiry-wizard-root'; }
    document.body.appendChild(rootEl);
    rootEl.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
    overlayEl = document.createElement('div'); overlayEl.className = 'dew-overlay'; overlayEl.style.cssText = 'display:none;' + OVERLAY_BG; rootEl.appendChild(overlayEl);
    document.addEventListener('click', function(e) {
      if (state._wizardOpen) return;
      var trigger = e.target.closest('.dt-specific-enquiry-open');
      if (trigger) { e.preventDefault(); e.stopImmediatePropagation(); openWizard(); }
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* ===== Lodge-page 2026/2027 season pills =====================================
   Individual property pages render their rates from /api/rack (public) or
   /api/sto (signed in). They only ever drew a year bar when a lodge happened to
   carry BOTH years, so every single-year property showed no control at all.

   This adds one persistent bar to every property page, public and signed in.
   It lives OUTSIDE #rate-tables so the page's own re-render doesn't wipe it,
   and it drives the page's existing loaders (showRack / showStoYear) rather
   than duplicating any rate logic.
   ============================================================================ */
;(function(){"use strict";try{
  var YEARS=["2026","2027"], KEY="nr_sto_year", TOKEN="nr_agent_token";
  function want(){try{return localStorage.getItem(KEY)==="2027"?"2027":"2026";}catch(e){return "2026";}}
  function signedIn(){try{return !!sessionStorage.getItem(TOKEN);}catch(e){return false;}}
  function ready(){return document.getElementById("rate-tables") && typeof window.showRack==="function";}

  /* Which year did the page actually end up rendering? #rate-sub carries "· 2026 season". */
  function shown(){
    var sub=document.getElementById("rate-sub");
    var m=sub && (sub.textContent||"").match(/\b(20\d{2})\s+season\b/);
    return m?m[1]:null;
  }
  function hasRates(){
    var rt=document.getElementById("rate-tables");
    return !!(rt && rt.querySelector("table"));
  }
  function loading(){
    var rt=document.getElementById("rate-tables");
    return !!(rt && /Loading rates/i.test(rt.textContent||""));
  }

  function css(){
    if(document.getElementById("nr-lodge-yr-css"))return;
    var s=document.createElement("style");s.id="nr-lodge-yr-css";
    s.textContent=
      "#nr-lodge-yr{display:flex;gap:8px;margin:16px 2px 20px;flex-wrap:wrap;align-items:center}"
      +"#nr-lodge-yr button{cursor:pointer;font:inherit;font-size:.72rem;letter-spacing:.5px;padding:5px 13px;border-radius:4px;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(200,90,23,.6);background:rgba(200,90,23,.08);color:#c85a17;transition:background .18s,color .18s}"
      +"#nr-lodge-yr button.on{background:rgba(200,90,23,.6);color:#fff}"
      +"#nr-lodge-yr-note{margin:0 2px 16px;padding:12px 16px;border-radius:10px;background:rgba(200,90,23,.10);border:1px solid rgba(200,90,23,.35);color:#8a4a22;font-size:.84rem;line-height:1.45}";
    document.head.appendChild(s);
  }

  function load(y){
    try{localStorage.setItem(KEY,y);}catch(e){}
    if(signedIn() && typeof window.showStoYear==="function") window.showStoYear(y);
    else window.showRack(y);
    setTimeout(sync,60); setTimeout(sync,400); setTimeout(sync,1200);
  }

  function bar(){
    var rt=document.getElementById("rate-tables");
    if(!rt||!rt.parentNode) return null;
    var b=document.getElementById("nr-lodge-yr");
    if(!b){
      css();
      b=document.createElement("div"); b.id="nr-lodge-yr";
      YEARS.forEach(function(y){
        var bt=document.createElement("button");
        bt.type="button"; bt.setAttribute("data-y",y); bt.textContent=y+" season";
        bt.onclick=function(){ load(y); };
        b.appendChild(bt);
      });
    }
    if(b.nextSibling!==rt) rt.parentNode.insertBefore(b,rt);
    return b;
  }

  function note(msg){
    var n=document.getElementById("nr-lodge-yr-note");
    if(!msg){ if(n) n.remove(); return; }
    if(!n){ n=document.createElement("div"); n.id="nr-lodge-yr-note"; }
    n.textContent=msg;
    var b=document.getElementById("nr-lodge-yr");
    if(b&&b.parentNode&&n.previousSibling!==b) b.parentNode.insertBefore(n,b.nextSibling);
  }

  function sync(){
    var b=bar(); if(!b) return;
    /* the page draws its own inline bar inside #rate-tables when a lodge has both
       years — hide it so agents don't see two identical controls */
    try{
      var rt=document.getElementById("rate-tables");
      if(rt){
        var first=rt.firstElementChild;
        if(first && first.tagName==="DIV" && first!==b && first.querySelector("button") &&
           /season/i.test(first.textContent||"")) first.style.display="none";
      }
    }catch(e){}

    if(loading()) return;
    var w=want(), got=shown();
    b.querySelectorAll("button").forEach(function(bt){
      bt.classList.toggle("on", bt.getAttribute("data-y")===w);
    });
    /* No rates for the year the agent picked: say so in the year's own words,
       replacing the page's generic "Rate to follow." Guarded by a marker id so
       rewriting the message doesn't retrigger the observer forever. */
    if(!hasRates()){
      note(null);
      var rt2=document.getElementById("rate-tables");
      if(rt2){
        var msg=document.getElementById("nr-yr-empty");
        var txt=w+" rates to follow soon.";
        if(!msg||msg.parentNode!==rt2){
          rt2.innerHTML='<p id="nr-yr-empty" style="padding:22px 2px;color:#7d756e;font-style:italic;font-size:1.02rem"></p>';
          msg=document.getElementById("nr-yr-empty");
        }
        if(msg && msg.textContent!==txt) msg.textContent=txt;
      }
      var sub2=document.getElementById("rate-sub");
      if(sub2 && sub2.textContent!==w+" rates to follow") sub2.textContent=w+" rates to follow";
    }
    else if(got && got!==w) note(w+" rates for this property are still to follow — showing "+got+".");
    else note(null);
  }

  function init(){
    if(!ready()){ setTimeout(init,150); return; }
    bar();
    /* the page loads its default year on its own; only re-request if the agent
       previously chose the other one */
    if(want()!=="2026") load(want()); else setTimeout(sync,300);
    try{
      var t; var mo=new MutationObserver(function(){clearTimeout(t);t=setTimeout(sync,120);});
      var rt=document.getElementById("rate-tables");
      if(rt) mo.observe(rt,{childList:true,subtree:true});
      var sub=document.getElementById("rate-sub");
      if(sub) mo.observe(sub,{childList:true,characterData:true,subtree:true});
    }catch(e){}
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
}catch(e){}})();

/* ===== Shared site chrome on property pages ==================================
   Property pages were built with their own hand-rolled header, dropdown menus,
   footer and sign-in modal, so they drifted from the rest of the site: the
   Accommodation / Vehicles / Activities menus looked different and "Agent Sign
   In" opened a bare username box instead of the Agent / Supplier chooser.

   site-chrome.js already strips any existing .main-header / #mobile-menu /
   #login-modal / footer and injects the canonical ones, so simply loading it
   here brings every property page onto the same chrome as the home page.
   ============================================================================ */
;(function(){"use strict";try{
  if(document.querySelector('script[src*="site-chrome.js"]')) return;
  var s=document.createElement("script");
  s.src="/assets/site-chrome.js";
  document.head.appendChild(s);
}catch(e){}})();
