import re

file_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/index.html"
with open(file_path, "r", encoding='utf-8') as f:
    text = f.read()

# 1. Remove the appended section
text = re.sub(r'<section class="dt-library-section">.*?<h2>Tools</h2>.*?</section>', '', text, flags=re.DOTALL)

# 2. Add it into the components array
costing_engine_node = """const components = [
    {
        "id": "costing_engine",
        "title": "Safari Costing Engine",
        "tag": "Premium UI Tools",
        "desc": "The complete Desert Tracks Safari Pricing and Quote Generation App in Vue 3.",
        "file": "costing_engine.html"
    },"""
text = text.replace('const components = [', costing_engine_node)

with open(file_path, "w", encoding='utf-8') as f:
    f.write(text)

print("Vault updated")
