import re

file_path = "Desert_Tracks_App/14-day-comfort.html"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Define the precise start and end lines for the pricing block
start_marker = "        <!-- Premium Pricing Block -->"
end_marker = "        <!-- CTA Block -->"

start_idx = text.find(start_marker)
end_idx = text.find(end_marker)

if start_idx != -1 and end_idx != -1:
    # Completely remove the block, including whatever lies between these indices
    # We add 2 blank lines instead to keep the spacing neat
    new_text = text[:start_idx] + "\n\n" + text[end_idx:]
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_text)
    print("Pricing block removed successfully.")
else:
    print("Error: Could not find pricing block boundaries.")
