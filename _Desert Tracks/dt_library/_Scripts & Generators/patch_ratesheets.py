import os

files_to_patch = [
    "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/individual_rates.html",
    "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/mushara_rates.html",
    "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/logufa_rates.html",
    "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/journeys_namibia_rates.html",
    "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/ondili_rates_booking.html",
    "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/o_and_l_ratesheet.html",
    "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/o_and_l_ratesheet_v2.html"
]

injection_code = """
    <!-- DYNAMIC PREMIUM RATESHEET LAYOUT OVERRIDE (MATCHING SCREENSHOT 3 / ACTIVITY_RATES.HTML) -->
    <script>
        (function() {
            function applyPremiumDecorations(id) {
                if (!window.location.hash) return;
                
                // 1. Center header title
                const pageHeader = document.querySelector('.header');
                if (pageHeader) {
                    pageHeader.innerHTML = `
                        <h1>Lodge Experiences</h1>
                        <p>PRE-NEGOTIATED STO CONTRACT RATES 2026/2027</p>
                    `;
                }

                // 2. Hide Swiper Carousel
                const swiperContainer = document.querySelector('.swiper-container-wrapper');
                if (swiperContainer) swiperContainer.style.display = 'none';
                
                // Hide main download group pdf buttons
                const downloadBtns = document.querySelectorAll('.header + div, #main-view button');
                downloadBtns.forEach(btn => {
                    if (btn.textContent.includes('Download') || btn.textContent.includes('PDF')) {
                        btn.style.display = 'none';
                    }
                });

                // 3. Hide Tabs Navigation & Booking UI elements
                const tabsBar = document.querySelector('.tabs');
                if (tabsBar) tabsBar.style.display = 'none';

                const datesUi = document.getElementById('global-dates-ui');
                if (datesUi) datesUi.style.display = 'none';

                const bookingBar = document.getElementById('booking-bar');
                if (bookingBar) bookingBar.style.display = 'none';

                // 4. Force display all content tabs consecutively (Accommodation, Activities, Policies)
                const tab1 = document.getElementById('tab-1');
                const tab2 = document.getElementById('tab-2');
                const tab3 = document.getElementById('tab-3');
                
                if (tab1) { tab1.style.display = 'block'; tab1.style.opacity = '1'; }
                if (tab2) { tab2.style.display = 'block'; tab2.style.opacity = '1'; }
                if (tab3) { tab3.style.display = 'block'; tab3.style.opacity = '1'; }

                // 5. Structure detail-header to side-by-side spec layout exactly like Screenshot 3!
                const detailHeader = document.querySelector('.detail-header');
                if (detailHeader && !document.getElementById('spec-location')) {
                    detailHeader.style.display = 'grid';
                    detailHeader.style.gridTemplateColumns = '2fr 1fr';
                    detailHeader.style.gap = '30px';
                    detailHeader.style.marginBottom = '40px';
                    detailHeader.style.textAlign = 'left';
                    
                    // Style intro
                    const introTextEl = document.getElementById('d-intro');
                    if (introTextEl) {
                        introTextEl.style.background = 'rgba(255,255,255,0.85)';
                        introTextEl.style.backdropFilter = 'blur(10px)';
                        introTextEl.style.padding = '25px';
                        introTextEl.style.borderRadius = '12px';
                        introTextEl.style.border = '1px solid rgba(164, 130, 86, 0.15)';
                    }
                    
                    const detailsWrapper = document.createElement('div');
                    detailsWrapper.className = 'supplier-details';
                    
                    const titleEl = document.getElementById('d-title');
                    const locEl = document.getElementById('d-location');
                    const data = typeof DB !== 'undefined' ? DB[id] : null;
                    const locationText = data ? data.location : (locEl ? locEl.textContent : '');
                    
                    if (titleEl) {
                        titleEl.style.fontSize = '2.8rem';
                        titleEl.style.color = 'var(--brand-charcoal)';
                        titleEl.style.lineHeight = '1.1';
                        titleEl.style.margin = '0 0 15px 0';
                        titleEl.style.textTransform = 'uppercase';
                        titleEl.style.fontFamily = 'var(--font-head)';
                    }
                    
                    if (locEl) {
                        locEl.style.color = 'var(--brand-accent)';
                        locEl.style.marginBottom = '15px';
                        locEl.style.fontWeight = '600';
                        locEl.style.letterSpacing = '2px';
                        locEl.style.textTransform = 'uppercase';
                        locEl.style.fontSize = '0.9rem';
                    }
                    
                    // Create spec box
                    const specBox = document.createElement('div');
                    specBox.className = 'supplier-quick-spec';
                    specBox.style.background = 'rgba(164, 130, 86, 0.05)';
                    specBox.style.borderRadius = '12px';
                    specBox.style.padding = '25px';
                    specBox.style.border = '1px dashed rgba(164, 130, 86, 0.25)';
                    specBox.style.height = 'fit-content';
                    specBox.style.alignSelf = 'start';
                    specBox.style.boxSizing = 'border-box';
                    
                    specBox.innerHTML = `
                        <h3 style="font-family: var(--font-head); font-size: 1.1rem; color: var(--brand-charcoal); margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 400; border-bottom: 1px solid rgba(164,130,86,0.15); padding-bottom: 10px;">Quick Specs</h3>
                        <div class="spec-item" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(164, 130, 86, 0.15); font-size: 0.85rem;"><span class="spec-label" style="font-weight: 400; color: var(--brand-charcoal);">Commission Model</span><span class="spec-value" style="color: var(--text-muted); font-weight: 300;">20% Built-in STO</span></div>
                        <div class="spec-item" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(164, 130, 86, 0.15); font-size: 0.85rem;"><span class="spec-label" style="font-weight: 400; color: var(--brand-charcoal);">Location</span><span class="spec-value" id="spec-location" style="color: var(--text-muted); font-weight: 300;">${locationText}</span></div>
                        <div class="spec-item" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: none; font-size: 0.85rem;"><span class="spec-label" style="font-weight: 400; color: var(--brand-charcoal);">Rates Basis</span><span class="spec-value" style="color: var(--text-muted); font-weight: 300;">Dinner, Bed & Breakfast</span></div>
                    `;
                    
                    // Reassemble elements safely
                    if (titleEl) detailsWrapper.appendChild(titleEl);
                    if (locEl) detailsWrapper.appendChild(locEl);
                    if (introTextEl) detailsWrapper.appendChild(introTextEl);
                    
                    detailHeader.innerHTML = '';
                    detailHeader.appendChild(detailsWrapper);
                    detailHeader.appendChild(specBox);
                }

                // 6. Style Section Titles
                const h3Els = document.querySelectorAll('.tab-content h3');
                h3Els.forEach(el => {
                    el.style.fontSize = '1.3rem';
                    el.style.color = 'var(--brand-charcoal)';
                    el.style.borderBottom = '2px solid var(--brand-accent)';
                    el.style.paddingBottom = '8px';
                    el.style.textTransform = 'uppercase';
                    el.style.fontFamily = 'var(--font-head)';
                    el.style.fontWeight = '400';
                    el.style.marginTop = '35px';
                });

                // 7. Update Back Button to Portal close tab style
                const backBtn = document.querySelector('.back-btn');
                if (backBtn) {
                    backBtn.innerText = '← Close & Return to Portal';
                    backBtn.style.fontFamily = 'var(--font-head)';
                    backBtn.style.textTransform = 'uppercase';
                    backBtn.style.letterSpacing = '1px';
                    backBtn.style.fontSize = '0.8rem';
                    backBtn.style.fontWeight = '400';
                    
                    backBtn.onclick = function() {
                        if (window.opener || window.history.length <= 2) {
                            window.close();
                        } else {
                            window.location.href = 'namibia_agent_portal.html';
                        }
                    };
                }
            }

            // Decorate existing openProperty
            if (typeof openProperty === 'function') {
                const originalOpen = openProperty;
                openProperty = function(id) {
                    originalOpen(id);
                    applyPremiumDecorations(id);
                };
            }
            
            // Re-apply in case hash DOMContentLoaded loaded it directly
            const currentHash = window.location.hash.substring(1);
            if (currentHash) {
                setTimeout(function() {
                    applyPremiumDecorations(currentHash);
                }, 100);
            }
        })();
    </script>
"""

for path in files_to_patch:
    if os.path.exists(path):
        print(f"Patching {path}...")
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Check if already patched to avoid duplicate injection
        if "DYNAMIC PREMIUM RATESHEET LAYOUT OVERRIDE" not in content:
            patched_content = content.replace("</body>", injection_code + "</body>")
            with open(path, "w", encoding="utf-8") as f:
                f.write(patched_content)
            print(f"Successfully patched {path}!")
        else:
            print(f"{path} is already patched.")
    else:
        print(f"File {path} does not exist.")
