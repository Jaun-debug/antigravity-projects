with open("🔴 11_day_wildlife.html", "r") as f:
    text = f.read()

import re
match = re.search(r'function initAccordionLogic\(\) \{.*?\n\s*\}.*?\n\s*\}.*?\}', text, re.DOTALL)
if match:
    print(match.group(0)[:500])
else:
    # Just search for the event listener
    match2 = re.search(r'trigger\.addEventListener\(\'click\', \(\) => \{.*?\n\s*\}\);', text, re.DOTALL)
    if match2:
        print(match2.group(0))
