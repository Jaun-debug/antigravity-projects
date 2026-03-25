import json

data = [
    { 'name': 'January', 'season': 'Green Season', 'temp': '18—30°C', 'rain': '100mm', 'summary': 'Hot with dramatic afternoon thunderstorms. Landscapes turn vividly green causing spectacular contrast.', 'url': 'https://desert-tracks.com/namibia-weather/january/' },
    { 'name': 'February', 'season': 'Green Season', 'temp': '18—30°C', 'rain': '110mm', 'summary': 'Peak green season. Excellent for birdwatching and photography against moody, stormy skies.', 'url': 'https://desert-tracks.com/namibia-weather/february/' },
    { 'name': 'March', 'season': 'Shoulder Season', 'temp': '16—29°C', 'rain': '80mm', 'summary': 'Warm days with diminishing rains. Skies begin to clear beautifully, leaving dust-free air.', 'url': 'https://desert-tracks.com/namibia-weather/march/' },
    { 'name': 'April', 'season': 'Shoulder Season', 'temp': '14—27°C', 'rain': '40mm', 'summary': 'Comfortable temperatures, mostly dry, and exceptional light makes this a highly favored travel month.', 'url': 'https://desert-tracks.com/namibia-weather/april/' },
    { 'name': 'May', 'season': 'Dry Season', 'temp': '9—25°C', 'rain': '10mm', 'summary': 'Sunny, mild days and cooler nights. Fantastic overall travel conditions for exploring the country.', 'url': 'https://desert-tracks.com/namibia-weather/may/' },
    { 'name': 'June', 'season': 'Dry Season', 'temp': '6—22°C', 'rain': '3mm', 'summary': 'The chill of winter arrives. Vegetation thins, drawing wildlife to the remaining waterholes.', 'url': 'https://desert-tracks.com/namibia-weather/june/' },
    { 'name': 'July', 'season': 'Peak Season', 'temp': '6—21°C', 'rain': '1mm', 'summary': 'Very cold mornings but exceptional, highly concentrated game viewing in the national parks.', 'url': 'https://desert-tracks.com/namibia-weather/july/' },
    { 'name': 'August', 'season': 'Peak Season', 'temp': '8—24°C', 'rain': '1mm', 'summary': 'Bone-dry landscapes and warming days. Prime time for Etosha safaris and clear stargazing.', 'url': 'https://desert-tracks.com/namibia-weather/august/' },
    { 'name': 'September', 'season': 'Peak Season', 'temp': '12—28°C', 'rain': '2mm', 'summary': 'Warm, dry, and dusty. Predictable water sources guarantee superb, uninterrupted wildlife sightings.', 'url': 'https://desert-tracks.com/namibia-weather/september/' },
    { 'name': 'October', 'season': 'Shoulder Season', 'temp': '15—30°C', 'rain': '10mm', 'summary': 'Intense heat builds alongside highly concentrated wildlife action before the rains break.', 'url': 'https://desert-tracks.com/namibia-weather/october/' },
    { 'name': 'November', 'season': 'Shoulder Season', 'temp': '17—31°C', 'rain': '40mm', 'summary': 'The dramatic build-up to the rains. Warm, humid, dynamic skies, and brilliant for photography.', 'url': 'https://desert-tracks.com/namibia-weather/november/' },
    { 'name': 'December', 'season': 'Green Season', 'temp': '18—32°C', 'rain': '60mm', 'summary': 'Hot summer days accompanied by the very first green shoots of the new rainy season.', 'url': 'https://desert-tracks.com/namibia-weather/december/' }
]

html_cards = ""
for m in data:
    html_cards += f"""
                <a href="{m['url']}" class="dt-card">
                    <div class="dt-card-inner">
                        <h3 class="dt-card-month">{m['name']}</h3>
                        <span class="dt-card-season">{m['season']}</span>
                        <div class="dt-card-data">
                            <div class="dt-data-block">
                                <span class="dt-data-label">Avg Temp</span>
                                <span class="dt-data-value">{m['temp']}</span>
                            </div>
                            <div class="dt-data-divider"></div>
                            <div class="dt-data-block" style="text-align: right;">
                                <span class="dt-data-label">Rainfall</span>
                                <span class="dt-data-value">{m['rain']}</span>
                            </div>
                        </div>
                        <p class="dt-card-desc">{m['summary']}</p>
                        <div class="dt-card-link">
                            Explore Guide
                            <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </div>
                    </div>
                </a>"""

with open('/Users/jaunhusselmann/.gemini/antigravity/scratch/desert-tracks-dashboard/Premium_Weather_Carousel_Code_Plain.txt', 'r') as f:
    original = f.read()

# Replace the empty track and the javascript that follows it
import re

start_tag = '<div class="dt-carousel-track" id="weatherTrack">'
end_tag = '</div>\n\n            <button class="dt-nav-btn dt-nav-next"'
new_html = original.split(start_tag)[0] + start_tag + html_cards + "\n            " + end_tag + original.split(end_tag)[1]

# Now let's remove the script that generates the cards, but keep the button functionality
script_start = '<script data-no-optimize="1">'
script_end = '</script>'
script_replacement = """<script data-no-optimize="1">
document.addEventListener("DOMContentLoaded", function() {
    const track = document.getElementById('weatherTrack');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');

    if (track && btnNext && btnPrev) {
        btnNext.addEventListener('click', () => {
            const scrollAmount = track.clientWidth > 768 ? 345 : track.clientWidth;
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        btnPrev.addEventListener('click', () => {
            const scrollAmount = track.clientWidth > 768 ? 345 : track.clientWidth;
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }
});
</script>"""

new_html = new_html.split(script_start)[0] + script_replacement

with open('/Users/jaunhusselmann/.gemini/antigravity/scratch/desert-tracks-dashboard/Premium_Weather_Carousel_Code_Plain_Hardcoded.txt', 'w') as f:
    f.write(new_html)

