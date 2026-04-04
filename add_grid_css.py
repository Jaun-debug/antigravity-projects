import re

file_path = "/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/14-day-comfort.html"
with open(file_path, "r", encoding='utf-8') as f:
    text = f.read()

new_css = """
        /* OVERRIDES FOR DESTINATIONS & ACCOM LISTS */
        .lux-acc-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }
        @media (max-width: 900px) {
            .lux-acc-grid {
                grid-template-columns: 1fr 1fr;
            }
        }
        @media (max-width: 600px) {
            .lux-acc-grid {
                grid-template-columns: 1fr;
            }
        }
        .lux-acc-card {
            text-decoration: none;
            color: inherit;
            display: flex;
            flex-direction: column;
            transition: opacity 0.3s ease;
        }
        .lux-acc-card img {
            width: 100%;
            aspect-ratio: 1/1;
            object-fit: cover;
            border-radius: 10px;
            margin-bottom: 1rem;
        }
        .lux-acc-card:hover {
            opacity: 0.8;
        }
        .lux-acc-title {
            font-family: 'Playfair Display', serif;
            font-size: 1.3rem;
            margin: 0 0 5px 0;
            color: #111;
        }
"""

text = text.replace("/* OVERRIDES FOR DESTINATIONS & ACCOM LISTS */", new_css)

with open(file_path, "w", encoding='utf-8') as f:
    f.write(text)

print("CSS added")
