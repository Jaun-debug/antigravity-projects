import zipfile
import glob
import os
import xml.etree.ElementTree as ET

folder = "/Users/jaunhusselmann/Desktop/ANTI GRAVITY/DESERT TRACKS"
out_html = "/Users/jaunhusselmann/.gemini/antigravity/scratch/Desert_Tracks_Component_Library.html"

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path, 'r') as z:
            xml_content = z.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            # The XML namespace for Word
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            text = []
            for node in tree.iterfind('.//w:t', ns):
                if node.text:
                    text.append(node.text)
            # Try to reconstruct basic line breaks by joining appropriately
            # It's not perfect but for raw HTML/CSS it's often good enough
            # A better way is to iterate over w:p and join text inside them
            
            paras = []
            for p in tree.iterfind('.//w:p', ns):
                p_text = []
                for node in p.iterfind('.//w:t', ns):
                    if node.text:
                        p_text.append(node.text)
                paras.append(''.join(p_text))
            
            return '\n'.join(paras)
    except Exception as e:
        return f"Error extracting: {e}"

files = glob.glob(os.path.join(folder, "*.docx"))
files = [f for f in files if not os.path.basename(f).startswith('~$')]

html_pieces = []

for f in files:
    name = os.path.basename(f).replace('.docx', '')
    raw_code = extract_text_from_docx(f)
    if "Error extracting" in raw_code:
        continue
    
    # We escape HTML entities in the code
    code_escaped = raw_code.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    
    html_pieces.append(f"""
    <div class="component-card">
        <h2>{name}</h2>
        <div class="code-container">
            <button class="copy-btn" onclick="navigator.clipboard.writeText(this.nextElementSibling.innerText); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy Code', 2000);">Copy Code</button>
            <pre><code>{code_escaped}</code></pre>
        </div>
    </div>
    """)

dashboard = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Desert Tracks - Component Library</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f5f7; padding: 40px; color: #333; }}
        h1 {{ text-align: center; color: #1a1a18; margin-bottom: 40px; font-size: 2.5rem; }}
        .grid {{ display: grid; grid-template-columns: 1fr; gap: 40px; max-width: 1200px; margin: 0 auto; }}
        .component-card {{ background: #fff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }}
        .component-card h2 {{ margin-top: 0; color: #ff6e00; font-size: 1.5rem; margin-bottom: 20px; text-transform: uppercase; font-weight: 700; }}
        .code-container {{ position: relative; background: #1a1a18; border-radius: 8px; padding: 20px; overflow: hidden; }}
        .copy-btn {{ position: absolute; top: 15px; right: 15px; background: #ff6e00; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.2s; }}
        .copy-btn:hover {{ background: #e06000; }}
        pre {{ margin: 0; max-height: 400px; overflow-y: auto; }}
        code {{ color: #a4fc8f; font-family: "Fira Code", monospace; font-size: 0.85rem; line-height: 1.5; white-space: pre-wrap; }}
        code.escaped {{ color: #e0d8d0; }}
    </style>
</head>
<body>
    <h1>Desert Tracks Component Library</h1>
    <p style="text-align:center; margin-bottom: 40px;">Your private vault of perfectly styled HTML/CSS blocks. Click to copy directly to your website.</p>
    <div class="grid">
        {"".join(html_pieces)}
    </div>
</body>
</html>
"""

with open(out_html, 'w') as f:
    f.write(dashboard)

print(f"Generated successfully: {out_html}")
