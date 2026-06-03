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
            // 1. Inject Premium Login Overlay
            function injectLoginOverlay() {
                // Remove any existing login overlays to avoid conflicts
                const oldOverlay = document.getElementById('login-overlay');
                if (oldOverlay) oldOverlay.remove();

                const titleText = document.title ? document.title.replace('2026/2027', '').replace('STO Rates', '').replace('EXPERIENCES', '').replace('NAMIBIA', '').trim() : 'Lodge Experiences';

                const overlay = document.createElement('div');
                overlay.id = 'login-overlay';
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.background = "url('https://desert-tracks.com/wp-content/uploads/2026/03/solly_5112_4-3.jpg') center/cover no-repeat";
                overlay.style.zIndex = '99999';
                overlay.style.display = 'flex';
                overlay.style.alignItems = 'center';
                overlay.style.justifyContent = 'center';
                overlay.style.fontFamily = "'Jost', sans-serif";

                overlay.innerHTML = `
                    <div style="background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); padding: 45px; border-radius: 16px; box-shadow: 0 15px 45px rgba(0,0,0,0.25); max-width: 420px; width: 90%; text-align: center; border: 1px solid rgba(255,255,255,0.45); box-sizing: border-box;">
                        <h2 style="color: rgb(164, 130, 86); font-family: 'Cinzel', serif; font-size: 1.8rem; margin: 0 0 10px 0; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">\${titleText}</h2>
                        <p style="color: #666; margin: 0 0 15px 0; font-size: 0.9rem; font-family: 'Jost', sans-serif; letter-spacing: 0.5px;">Please sign in to access the booking engine.</p>
                        <p style="color: rgb(201, 108, 40); margin: 0 0 25px 0; font-size: 0.82rem; font-family: 'Jost', sans-serif; font-style: italic; font-weight: 500;">(For the moment, to enter just press Enter)</p>
                        
                        <input type="text" id="override-login-user" placeholder="Username" style="width: 100%; padding: 14px 20px; margin-bottom: 15px; border: 1px solid rgba(0,0,0,0.08); border-radius: 8px; box-sizing: border-box; font-family: 'Jost', sans-serif; font-size: 0.95rem; background: rgba(255,255,255,0.6); outline: none; transition: border-color 0.3s;" onfocus="this.style.borderColor='rgb(164, 130, 86)'" onblur="this.style.borderColor='rgba(0,0,0,0.08)'">
                        <input type="password" id="override-login-pass" placeholder="Password" style="width: 100%; padding: 14px 20px; margin-bottom: 25px; border: 1px solid rgba(0,0,0,0.08); border-radius: 8px; box-sizing: border-box; font-family: 'Jost', sans-serif; font-size: 0.95rem; background: rgba(255,255,255,0.6); outline: none; transition: border-color 0.3s;" onfocus="this.style.borderColor='rgb(164, 130, 86)'" onblur="this.style.borderColor='rgba(0,0,0,0.08)'">
                        
                        <button id="override-login-btn" style="width: 100%; padding: 16px; background: rgb(210, 180, 140); color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s; font-family: 'Cinzel', serif; box-shadow: 0 4px 15px rgba(210,180,140,0.3);">Access Portal</button>
                    </div>
                `;

                document.body.appendChild(overlay);

                // Add styling link for Google Fonts if not present
                if (!document.getElementById('premium-login-fonts')) {
                    const fontLink = document.createElement('link');
                    fontLink.id = 'premium-login-fonts';
                    fontLink.rel = 'stylesheet';
                    fontLink.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Jost:wght@300;400;500;600&display=swap';
                    document.head.appendChild(fontLink);
                }

                // Close overlay logic
                const dismissOverlay = () => {
                    overlay.style.transition = 'opacity 0.4s ease';
                    overlay.style.opacity = '0';
                    setTimeout(() => {
                        overlay.remove();
                    }, 400);
                };

                const uInput = document.getElementById('override-login-user');
                const pInput = document.getElementById('override-login-pass');
                const loginBtn = document.getElementById('override-login-btn');

                if (uInput) uInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') dismissOverlay(); });
                if (pInput) pInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') dismissOverlay(); });
                if (loginBtn) loginBtn.addEventListener('click', dismissOverlay);
            }

            // Call overlay injection on load
            injectLoginOverlay();

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

                // 3. Keep Tab navigation, dates selection, and booking bars visible and gorgeous!
                const tabsBar = document.querySelector('.tabs');
                if (tabsBar) {
                    tabsBar.style.display = 'flex';
                    tabsBar.style.justifyContent = 'center';
                    tabsBar.style.marginBottom = '25px';
                }

                const datesUi = document.getElementById('global-dates-ui');
                if (datesUi) {
                    datesUi.style.display = 'block';
                }

                const bookingBar = document.getElementById('booking-bar');
                if (bookingBar) {
                    bookingBar.style.display = 'flex';
                }

                // 4. Structure detail-header to side-by-side spec layout exactly like Screenshot 3!
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
                        <div class="spec-item" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(164, 130, 86, 0.15); font-size: 0.85rem;"><span class="spec-label" style="font-weight: 400; color: var(--brand-charcoal);">Location</span><span class="spec-value" id="spec-location" style="color: var(--text-muted); font-weight: 300;">\${locationText}</span></div>
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

                // 5. Style Section Titles
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

                // 6. Update Back Button to Portal close tab style
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
                    if (typeof openProperty === 'function') {
                        openProperty(currentHash);
                    } else {
                        applyPremiumDecorations(currentHash);
                    }
                }, 100);
            }
        })();
    </script>
"""

# Clean and overwrite old block or apply new block in files
for path in files_to_patch:
    if os.path.exists(path):
        print(f"Repatching {path}...")
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Check if old override exists and clean it out
        if "DYNAMIC PREMIUM RATESHEET LAYOUT OVERRIDE" in content:
            # We want to split content at the comment and keep only the part before it
            content = content.split("<!-- DYNAMIC PREMIUM RATESHEET LAYOUT OVERRIDE")[0].strip()
            # Append closing tags back
            content += "\n</body>\n</html>"
        
        # Now inject the new code cleanly right before </body>
        if "</body>" in content:
            patched_content = content.replace("</body>", injection_code + "\n</body>")
            with open(path, "w", encoding="utf-8") as f:
                f.write(patched_content)
            print(f"Successfully repatched {path}!")
        else:
            print(f"Warning: </body> not found in {path}")
    else:
        print(f"File {path} does not exist.")
