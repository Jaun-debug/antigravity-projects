import re

with open("11-day-wildlife-FINAL.html", "r") as f:
    content = f.read()

departure_html = """
        <!-- DAY 08 Departure -->
        <div class="lux-day-block" id="day-08" data-bg="">
            <div class="lux-day-block-header">
                <div class="lux-day-number-row">
                    <span class="lux-day-numeral">08</span>
                    <div class="lux-day-line"></div>
                </div>
                <span class="lux-day-location">Windhoek — Hosea Kutako Airport</span>
                <h2 class="lux-day-title">Departure Bound</h2>
                <p class="lux-day-desc">After a breathtaking final morning, make your way back down to the capital for your departure. Journey safely and take home an eternity of memories.</p>
            </div>
        </div>
"""

if "Departure Bound" not in content:
    content = content.replace("<!-- Accommodations Grid Block -->", departure_html + "        <!-- Accommodations Grid Block -->")

with open("11-day-wildlife-FINAL.html", "w") as f:
    f.write(content)
print("Done patching.")
