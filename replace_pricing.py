import re

file_path = 'Desert_Tracks_App/14-day-comfort.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = '        <!-- Pricing Block -->'
end_marker = '        <!-- CTA Block -->'

start_idx = text.find(start_marker)
end_idx = text.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    new_pricing_html = """        <!-- Premium Pricing Block -->
        <div class="lux-premium-pricing-wrapper" style="margin-top: 5rem; margin-bottom: 5rem; display: flex; flex-wrap: wrap; gap: 40px;">
            <!-- Left Side Title -->
            <div style="flex: 1; min-width: 250px;">
                <div style="display:flex; align-items:center; gap:15px; margin-bottom: 1rem;">
                    <h2 style="font-size: 1.5rem; font-family: 'Playfair Display', serif; text-transform: uppercase; letter-spacing: 0.2em; margin: 0; color: #333;">Prices</h2>
                    <div style="width: 40px; height: 1px; background: #E67E22;"></div>
                </div>
            </div>

            <!-- Right Side Table -->
            <div class="lux-pricing-table" style="flex: 2; min-width: 300px; display: flex; flex-direction: column; font-family: 'Inter', sans-serif;">
                <!-- Table Header -->
                <div style="display: flex; width: 100%;">
                    <div style="flex: 1; background: #E67E22; color: #fff; text-align: center; padding: 15px; font-weight: 600; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase;">High Season</div>
                    <div style="flex: 1; background: #4d4c4a; color: #a1a1a1; text-align: center; padding: 15px; font-weight: 600; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase;">Low Season</div>
                </div>
                
                <!-- Table Body -->
                <div style="background: #F8F7F3; padding: 40px 30px; display: flex; flex-direction: column;">
                    <div style="font-size: 0.85rem; font-weight: 600; color: #666; letter-spacing: 0.1em; margin-bottom: 20px;">
                        MAY | JUNE | JULY | AUGUST | SEPTEMBER | OCTOBER
                    </div>
                    <hr style="border: none; border-top: 1px solid #ccc; margin-bottom: 40px;">

                    <!-- Pricing Columns -->
                    <div class="lux-pricing-cols" style="display: flex; flex-wrap: wrap; gap: 60px;">
                        <!-- Column 1 -->
                        <div style="flex: 1; min-width: 200px; display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
                            <div style="display: flex; flex-direction: column;">
                                <span style="font-size: 0.75rem; letter-spacing: 0.1em; font-weight: 600; color: #888; margin-bottom: 5px;">FROM</span>
                                <div style="display: flex; align-items: flex-start; color: #E67E22;">
                                    <span style="font-family: 'Playfair Display', serif; font-size: 2.5rem; line-height: 1;">N$ 85,500</span>
                                    <span style="font-size: 0.65rem; font-weight: 700; margin-top: 5px; margin-left: 5px;">P/P</span>
                                </div>
                            </div>
                            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; color: #888;">
                                <svg width="50" height="24" viewBox="0 0 50 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <circle cx="20" cy="8" r="3"></circle><path d="M16 18V12C16 11 24 11 24 12V18"></path>
                                    <circle cx="10" cy="8" r="3"></circle><path d="M6 18V12C6 11 14 11 14 12V18"></path>
                                    <path d="M28 14 L30 10 L38 10 L40 14 L44 14 L44 20 L28 20 Z"></path>
                                    <circle cx="32" cy="20" r="2"></circle><circle cx="40" cy="20" r="2"></circle>
                                </svg>
                                <span style="font-size: 0.75rem; color: #888; margin-top: 5px;">based on 2 in a vehicle</span>
                            </div>
                        </div>

                        <!-- Column 2 -->
                        <div style="flex: 1; min-width: 200px; display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
                            <div style="display: flex; flex-direction: column;">
                                <span style="font-size: 0.75rem; letter-spacing: 0.1em; font-weight: 600; color: #888; margin-bottom: 5px;">FROM</span>
                                <div style="display: flex; align-items: flex-start; color: #E67E22;">
                                    <span style="font-family: 'Playfair Display', serif; font-size: 2.5rem; line-height: 1;">N$ 64,500</span>
                                    <span style="font-size: 0.65rem; font-weight: 700; margin-top: 5px; margin-left: 5px;">P/P</span>
                                </div>
                            </div>
                            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; color: #888;">
                                <svg width="70" height="24" viewBox="0 0 70 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <circle cx="10" cy="8" r="3"></circle><path d="M6 18V12C6 11 14 11 14 12V18"></path>
                                    <circle cx="20" cy="8" r="3"></circle><path d="M16 18V12C16 11 24 11 24 12V18"></path>
                                    <circle cx="30" cy="8" r="3"></circle><path d="M26 18V12C26 11 34 11 34 12V18"></path>
                                    <circle cx="40" cy="8" r="3"></circle><path d="M36 18V12C36 11 44 11 44 12V18"></path>
                                    <path d="M48 14 L50 10 L58 10 L60 14 L64 14 L64 20 L48 20 Z"></path>
                                    <circle cx="52" cy="20" r="2"></circle><circle cx="60" cy="20" r="2"></circle>
                                </svg>
                                <span style="font-size: 0.75rem; color: #888; margin-top: 5px;">based on 4 in a vehicle</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>\n\n"""

    text = text[:start_idx] + new_pricing_html + text[end_idx:]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Pricing block explicitly upgraded to premium style.")
else:
    print("Could not find bounds.")
