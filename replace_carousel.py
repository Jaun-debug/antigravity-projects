with open('dt_library/11_day_namibia_wildlife_safari.html', 'r') as f:
    src_lines = f.readlines()

# Find the start and end of the coverflow in source
start_src = -1
end_src = -1
for i, line in enumerate(src_lines):
    if '<!-- Swiper CSS -->' in line and 'MORE SAFARIS' in src_lines[i-2]:
        start_src = i
    if start_src != -1 and 'initSafariCoverflow();' in line:
        end_src = i + 3  # Include the </script> tag
        break

coverflow_html = "".join(src_lines[start_src:end_src])

with open('🔴 11_day_preview.html', 'r') as f:
    target_lines = f.readlines()

# Find the start and end in target
start_tgt = -1
end_tgt = -1
for i, line in enumerate(target_lines):
    if '<!-- Swiper CSS -->' in line and 'MORE SAFARIS' in target_lines[i-2]:
        start_tgt = i
    if start_tgt != -1 and 'initSafariAppSlider();' in line:
        end_tgt = i + 3
        break

if start_src != -1 and end_src != -1 and start_tgt != -1 and end_tgt != -1:
    new_target = "".join(target_lines[:start_tgt]) + coverflow_html + "".join(target_lines[end_tgt:])
    with open('🔴 11_day_preview.html', 'w') as f:
        f.write(new_target)
    print("Replacement successful.")
else:
    print(f"Failed to find blocks: src({start_src}, {end_src}), tgt({start_tgt}, {end_tgt})")
