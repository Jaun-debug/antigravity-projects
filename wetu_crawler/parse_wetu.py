import re
with open("temp.html") as f:
    text = f.read()
matches = re.finditer(r'href="([^"]*wetu\.com[^"]*)"', text)
for m in matches:
    start = max(0, m.start() - 50)
    end = min(len(text), m.end() + 200)
    snippet = text[start:end]
    snippet_clean = re.sub(r'<[^>]+>', ' ', snippet)
    print(m.group(1))
    print(snippet_clean.replace('\n', ' ').strip()[:100])
    print("---")
