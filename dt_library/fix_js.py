import os

base_dir = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library"
wizard_file = os.path.join(base_dir, "specific_safari_wizard.html")
target_fw = os.path.join(base_dir, "itinerary_master_full_width.html")
target_50 = os.path.join(base_dir, "itinerary_master_50_50.html")

with open(wizard_file, "r") as f:
    wizard_content = f.read()

for target in [target_fw, target_50]:
    if not os.path.exists(target):
        continue
    with open(target, "r") as f:
        content = f.read()
    
    start_marker = "<!-- SPECIFIC SAFARI WIZARD & FORMSPREE TRACKER"
    
    if start_marker in content:
        start_idx = content.find(start_marker)
        
        # Replace everything from the marker to the end of the file with the new wizard content
        new_content = content[:start_idx] + "<!-- ============================================== -->\n<!-- SPECIFIC SAFARI WIZARD & FORMSPREE TRACKER     -->\n<!-- ============================================== -->\n" + wizard_content
        
        with open(target, "w") as f:
            f.write(new_content)
        print(f"Updated {target}")
