import json
from bs4 import BeautifulSoup
import re

with open('wetu_data_raw.json', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

parsed_days = []

# Find the Leg sections (Day 1 - 2, Day 2 - 4) from the navigation
nav_legs = soup.select('.nav-bar-dropdown-leg')
print(f"Found {len(nav_legs)} nav legs")

leg_data = []
for leg in nav_legs:
    day_range = leg.select_one('.days').get_text(strip=True) if leg.select_one('.days') else ""
    
    dest_el = leg.select_one('.destination-section .nav-bar-dropdown-leg-section-item p')
    location = dest_el.get_text(strip=True) if dest_el else ""
    
    acc_el = leg.select_one('.accommodation-section .nav-bar-dropdown-leg-section-item p')
    accommodation = acc_el.get_text(strip=True) if acc_el else ""
    
    leg_data.append({
        "day_range": day_range,
        "location": location,
        "accommodation": accommodation
    })
    
# Now find descriptions and images for each step.
# In the itinerary details view, there are sections usually with a class like 'itinerary-leg' or we can find descriptions under the days.
# Let's see if we can find the detailed layout sections.
# Wetu often uses something like ID "itinerary" or ".day-by-day"
day_sections = soup.select('.itinerary-leg, .day-by-day-item, .day-by-day .day, .itinerary-day')
daily_info = {}

# If we can't find clear day sections, let's look for accommodation names to find their descriptions.
# Instead of complex matching, let's see what '.day-by-day' matches.
for i in range(1, 20):
    day_el = soup.select_one(f'#day-{i}')
    if day_el:
        print(f"Found #day-{i}")

# Alternatively, extract all text that looks like a day description.
# Given time constraints, I will dump a simplified version of the script to inspect the classes used by Wetu.
print(f"leg_data = {leg_data}")

# Let's inspect all h2/h3/h4 in the document to see how days are titled.
headers = soup.find_all(['h2', 'h3', 'h4', 'h5', 'h6'])
for h in headers[:20]:
    print(f"{h.name}: {h.get_text(strip=True)[:50]}")

# Let's also find all image URLs to see if we can just scrape everything.
images = []
for img in soup.find_all('img'):
    src = img.get('src') or img.get('data-src') or img.get('srcset')
    if src:
        images.append(src)
print(f"Total images found: {len(images)}")
