import sys

file_path = "/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/14-day-comfort.html"

with open(file_path, "r") as f:
    lines = f.readlines()

# find destinations block
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "<!-- Destinations 3x Grid Block -->" in line:
        start_idx = i
        break

if start_idx != -1:
    # find end of lux-acc-grid-container which is 2 divs deep actually
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
    
    # remove from original
    del lines[start_idx:end_idx+1]
    
    # find insertion point (just before <div class="lux-padding-wrapper"> and Includes / Excludes)
    incl_idx = -1
    for i, line in enumerate(lines):
        if "Includes / Excludes" in line:
            # backtrack to find lux-padding-wrapper
            for j in range(i, -1, -1):
                if '<div class="lux-padding-wrapper">' in lines[j]:
                    incl_idx = j
                    break
            break
            
    if incl_idx != -1:
        # insert block
        lines = lines[:incl_idx] + block_lines + lines[incl_idx:]
        
        with open(file_path, "w") as f:
            f.writelines(lines)
        print("Success: Block moved successfully.")
    else:
        print("Failed: Could not find Includes / Excludes")
else:
    print("Failed: Could not find Destinations block")
