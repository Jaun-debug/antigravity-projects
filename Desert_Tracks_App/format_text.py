import re

with open("14-day-comfort.html", "r") as f:
    content = f.read()

# 1. Change CTA on the left
content = content.replace(">Book this Safari</a>", ">Start Your Journey</a>")

# 2. Change "Premium Lodges" to "Lodge Selection"
content = content.replace("Premium Lodges", "Lodge Selection")

# 3. Change ALL CAPS text to Title Case (or Sentence Case)
def to_title_case(text):
    words = re.split(r'(\s+|—|-)', text)
    new_words = []
    for w in words:
        if w.strip() and w not in ('—', '-'):
            new_words.append(w.capitalize())
        else:
            new_words.append(w)
    return "".join(new_words)

# Find all text inside <span class="lux-day-location">...</span>
content = re.sub(r'(<span class="lux-day-location">)(.*?)(</span>)', 
                 lambda m: m.group(1) + to_title_case(m.group(2)) + m.group(3), 
                 content)

# Find all text inside <h2 class="dt-film-title">...</h3> or </h2>
content = re.sub(r'(<h2 class="dt-film-title">)(.*?)(</h[23]>)', 
                 lambda m: m.group(1) + to_title_case(m.group(2)) + m.group(3), 
                 content)

# Remove text-transform: uppercase from CSS where user doesn't want it.
content = content.replace("text-transform: uppercase;", "/* text-transform: uppercase; */")

with open("14-day-comfort.html", "w") as f:
    f.write(content)

print("Formatting applied successfully.")
