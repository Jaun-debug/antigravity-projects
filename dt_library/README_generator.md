# Desert Tracks Safari Generator

This script (`generator_10_day_north_focus.py`) is the master logic used to inject Wetu itinerary JSON into the high-end, cinematic `11_day_namibia_wildlife_safari.html` master template.

## How it Works
Instead of manually copying and pasting 5,000+ lines of code, the script automates the process using Python's regular expressions:

1. **Title & SEO**: It hunts down the default `<title>` and visual `<h1>` tags and replaces them with your new Safari name.
2. **Hero Images**: Replaces the main cinematic `data-bg` background images using standard string replacement.
3. **Intro Copy**: Automatically swaps the old introductory paragraph with the custom text for your new Safari.
4. **"At a Glance" Carousel**: It reads the `bottom_carousel` data from your Wetu JSON and injects a completely new, swipeable top carousel linking to the respective days (`href="#day-X"`).
5. **Map Waypoints**: Locates the `const waypoints = [...]` JavaScript array and swaps it out so the animated map route connects the correct points.
6. **Day-by-Day Cinematic Blocks**: Uses `re.sub()` to perfectly excise all the old day blocks (from `DAY 01` down to the next section) and seamlessly injects the newly generated blocks, preserving the `lux-day-block` structure, cinematic film rolls (`dt-film-section`), and scroll-fade metadata.
7. **Bottom Lodge Selection**: Rewrites the bottom accommodation profile slider to pull the exact lodges used in the new itinerary.

## Creating New Itineraries
If you want to create a brand new safari (e.g. a 12-Day Botswana Safari), you don't need to start from scratch:
1. Export the Wetu JSON and save it.
2. Make a copy of `generator_10_day_north_focus.py` and name it appropriately.
3. Update the `json_path`, `output_path`, and the simple text replacement strings at the top of the file to match your new JSON and desired text copy.
4. Run the script! It will magically produce the new 5,000+ line component, flawlessly retaining all complex CSS styles, hover states, and scroll triggers.
