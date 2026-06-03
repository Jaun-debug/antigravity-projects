import re

with open('/Users/jaunhusselmann/Desktop/AG Projects/dt_library/specific_safari_wizard.html', 'r') as f:
    source_html = f.read()

with open('/Users/jaunhusselmann/Desktop/AG Projects/dt_library/itinerary_master_full_width.html', 'r') as f:
    target_html = f.read()

# Extract the script block from specific_safari_wizard.html
match = re.search(r'(<script data-no-optimize="1">\n\(function \(\) \{\n  \'use strict\';\n\n  var SUBMIT_ENDPOINT = \'https://wizard-inquiry\.replit\.app/submit\';.*?\n\}\)\(\);\n</script>)', source_html, re.DOTALL)
if match:
    script_content = match.group(1)
    
    # Replace the script block in itinerary_master_full_width.html
    target_html = re.sub(r'<script data-no-optimize="1">\n\(function \(\) \{\n  \'use strict\';\n\n  var SUBMIT_ENDPOINT = \'https://wizard-inquiry\.replit\.app/submit\';.*?\n\}\)\(\);\n</script>', script_content, target_html, flags=re.DOTALL)
    
    with open('/Users/jaunhusselmann/Desktop/AG Projects/dt_library/itinerary_master_full_width.html', 'w') as f:
        f.write(target_html)
    print("Successfully synchronized wizard script.")
else:
    print("Could not find script block in source.")
