import sys

file_path = "/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/14-day-comfort.html"

with open(file_path, "r") as f:
    lines = f.readlines()

# Extract Destinations Block block
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "<!-- Destinations 3x Grid Block -->" in line:
        start_idx = i
        break

if start_idx != -1:
    divs_open = 0
    in_block = False
    for i in range(start_idx, len(lines)):
        if '<div class="lux-acc-grid-container"' in lines[i]:
            divs_open += 1
            in_block = True
        elif '<div' in lines[i] and in_block:
            divs_open += lines[i].count('<div')
            
        if '</div' in lines[i] and in_block:
            divs_open -= lines[i].count('</div')
            if divs_open == 0:
                end_idx = i
                break

if start_idx != -1 and end_idx != -1:
    block_lines = lines[start_idx:end_idx+1]
    
    # Now find the place to insert it: <div class="lux-features-container">
    insert_idx = -1
    for i, line in enumerate(lines):
        if '<div class="lux-features-container"' in line and '{' not in line:
            insert_idx = i + 1
            break
            
    if insert_idx != -1:
        lines = lines[:insert_idx] + block_lines + lines[insert_idx:]
        with open(file_path, "w") as f:
            f.writelines(lines)
        print("Success: Block duplicated")
    else:
        print("Failed: Could not find lux-features-container")
else:
    print("Failed: Could not find Destinations block")
