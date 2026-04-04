import re

html_path = 'Desert_Tracks_App/14-day-comfort.html'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. New CSS for the features
new_css = """
        /* ==================================================
           NEW ITINERARY FEATURES (Inclusions, Trust, Overview)
        ================================================== */
        .lux-features-container {
            margin-top: 3rem;
            margin-bottom: 5rem;
            display: flex;
            flex-direction: column;
            gap: 4rem;
        }

        /* Destinations at a Glance */
        .lux-glance-wrap {
            width: 100%;
        }
        .lux-glance-title {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            font-weight: 600;
            color: #888888;
            margin-bottom: 1.5rem;
        }
        .lux-glance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 15px;
        }
        .lux-glance-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 10px;
        }
        .lux-glance-img {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #FAF9F6;
            box-shadow: 0 10px 20px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
        }
        .lux-glance-item:hover .lux-glance-img {
            transform: scale(1.08);
        }
        .lux-glance-name {
            font-size: 0.85rem;
            font-weight: 600;
            color: #333;
            font-family: 'Playfair Display', serif;
        }

        /* Inclusions & Exclusions */
        .lux-inclusions-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            background: #FAF9F6;
            padding: 2.5rem;
            border-radius: 12px;
        }
        @media (min-width: 768px) {
            .lux-inclusions-grid { grid-template-columns: 1fr 1fr; }
        }
        .lux-inc-col h4 {
            font-family: 'Playfair Display', serif;
            font-size: 1.4rem;
            color: #111;
            margin: 0 0 1.5rem 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .lux-inc-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .lux-inc-list li {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            font-size: 0.95rem;
            color: #555;
            line-height: 1.4;
        }
        .lux-inc-list svg {
            flex-shrink: 0;
            width: 18px;
            height: 18px;
            margin-top: 2px;
        }
        .svg-check { color: #d87a4d; }
        .svg-cross { color: #999; }

        /* Trust & Reviews Block (Bottom) */
        .lux-trust-block {
            margin-top: 6rem;
            padding-top: 4rem;
            border-top: 1px solid #eee;
            text-align: center;
        }
        .lux-trust-eyebrow {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            font-weight: 600;
            color: #888888;
            margin-bottom: 1rem;
            display: block;
        }
        .lux-trust-title {
            font-family: 'Playfair Display', serif;
            font-size: clamp(2rem, 3vw, 2.8rem);
            color: #111;
            margin: 0 0 1rem 0;
        }
        .lux-trust-subtitle {
            font-size: 1.05rem;
            color: #666;
            max-width: 600px;
            margin: 0 auto 3rem auto;
            line-height: 1.6;
        }
        .lux-shortcode-wrap {
            margin: 0 auto;
            max-width: 800px;
            background: #FAF9F6;
            padding: 3rem;
            border-radius: 12px;
            border: 1px dashed #ccc;
        }

        /* Local Guarantee Block */
        .lux-guarantee {
            background-color: #111;
            color: #fff;
            padding: 4rem 3rem;
            border-radius: 12px;
            margin-top: 4rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
        }
        .lux-guarantee img {
            width: 60px;
            height: 60px;
        }
        .lux-guarantee h3 {
            font-family: 'Playfair Display', serif;
            font-size: 2rem;
            margin: 0;
            font-weight: 300;
        }
        .lux-guarantee p {
            font-size: 1rem;
            line-height: 1.6;
            color: #ccc;
            max-width: 600px;
            margin: 0;
        }
</style>"""

html = html.replace('</style>', new_css)

welcome_div = '</div>\n\n\n        <!-- DAY 01 -->'
new_features_html = """
        <div class="lux-features-container">
            <!-- Destinations at a Glance -->
            <div class="lux-glance-wrap">
                <div class="lux-glance-title">DESTINATIONS AT A GLANCE</div>
                <div class="lux-glance-grid">
                    <div class="lux-glance-item">
                        <img class="lux-glance-img" src="https://desert-tracks.com/wp-content/uploads/2024/04/Solly-Levi-Sossusvlei-1.jpg" alt="Windhoek">
                        <div class="lux-glance-name">Windhoek</div>
                    </div>
                    <div class="lux-glance-item">
                        <img class="lux-glance-img" src="https://wetu.com/imageHandler/c1920x1080/468/Namib%201%201.jpg?fmt=jpg" alt="Sossusvlei">
                        <div class="lux-glance-name">Sossusvlei</div>
                    </div>
                    <div class="lux-glance-item">
                        <img class="lux-glance-img" src="https://wetu.com/imageHandler/c1920x1080/471/Swakop_3.jpg?fmt=jpg" alt="Swakopmund">
                        <div class="lux-glance-name">Swakopmund</div>
                    </div>
                    <div class="lux-glance-item">
                        <img class="lux-glance-img" src="https://wetu.com/imageHandler/c1920x1080/312689/wozde81901.jpg?fmt=jpg" alt="Damaraland">
                        <div class="lux-glance-name">Damaraland</div>
                    </div>
                    <div class="lux-glance-item">
                        <img class="lux-glance-img" src="https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg" alt="Etosha NP">
                        <div class="lux-glance-name">Etosha NP</div>
                    </div>
                </div>
            </div>

            <!-- Inclusions Block -->
            <div class="lux-inclusions-grid">
                <div class="lux-inc-col">
                    <h4>Fully Inclusive</h4>
                    <ul class="lux-inc-list">
                        <li><svg class="svg-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Premium 4x4 Vehicle Rental</li>
                        <li><svg class="svg-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Luxury Accommodation exactly as indicated</li>
                        <li><svg class="svg-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Meals & Beverages as per itinerary specifications</li>
                        <li><svg class="svg-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> VIP Airport Meet & Greet and Private Transfers</li>
                        <li><svg class="svg-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> 24/7 Dedicated In-Country Support Concierge</li>
                        <li><svg class="svg-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Comprehensive Custom Digital Tour File & App</li>
                    </ul>
                </div>
                <div class="lux-inc-col">
                    <h4>Excluded</h4>
                    <ul class="lux-inc-list">
                        <li><svg class="svg-cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> International Flights</li>
                        <li><svg class="svg-cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Personal Travel Insurance (Highly Recommended)</li>
                        <li><svg class="svg-cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Visas & Visa Applications</li>
                        <li><svg class="svg-cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Optional Excursions not listed in the plan</li>
                        <li><svg class="svg-cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Vehicle Fuel (Self-Drive segment)</li>
                        <li><svg class="svg-cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Gratuities for guides and lodge staff</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- DAY 01 -->"""

html = html.replace(welcome_div, new_features_html, 1)

day_14_end_idx = html.find('</div>\n    </div>\n</div>\n\n<script>')
if day_14_end_idx != -1:
    trust_html = """
        <!-- The Desert Tracks Local Guarantee -->
        <div class="lux-guarantee">
            <h3>Plan with Peace of Mind</h3>
            <p>Desert Tracks was born from a simple idea: travelers deserve authentic, expertly crafted safari experiences designed by locals who know Namibia best. We are a locally based safari architect company driven by passion, expertise, and a deep love for Africa. Avoid the inflated prices of overseas operators and experience true Namibian hospitality from the moment you arrive.</p>
        </div>

        <!-- Verified Trust/Reviews Block -->
        <div class="lux-trust-block">
            <span class="lux-trust-eyebrow">WHAT OUR CLIENTS SAY</span>
            <h2 class="lux-trust-title">Every journey leaves a story behind.</h2>
            <p class="lux-trust-subtitle">Discover the raw, unfiltered voices of our guests as they share their Desert Tracks adventures across Namibia and Botswana. Their words capture the magic better than we ever could.</p>
            
            <div class="lux-shortcode-wrap">
                <!-- IMPORTANT: WordPress Shortcode triggers here -->
                [trustindex no-registration=google]
            </div>
        </div>
"""
    html = html[:day_14_end_idx] + trust_html + html[day_14_end_idx:]

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Features deployed.")
