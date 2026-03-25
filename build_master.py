import zipfile
import glob
import os
import xml.etree.ElementTree as ET
import json

folder = "/Users/jaunhusselmann/Desktop/ANTI GRAVITY/DESERT TRACKS"
target_dir = "/Users/jaunhusselmann/.gemini/antigravity/scratch/dt_library"
os.makedirs(target_dir, exist_ok=True)
out_html = os.path.join(target_dir, "index.html")

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path, 'r') as z:
            xml_content = z.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            paras = []
            for p in tree.iterfind('.//w:p', ns):
                p_text = []
                for node in p.iterfind('.//w:t', ns):
                    if node.text:
                        p_text.append(node.text)
                txt = ''.join(p_text)
                txt = txt.replace('‘', "'").replace('’', "'").replace('“', '"').replace('”', '"')
                paras.append(txt)
            
            return '\n'.join(paras)
    except Exception as e:
        return f"Error extracting: {e}"

files = glob.glob(os.path.join(folder, "*.docx"))
files = [f for f in files if not os.path.basename(f).startswith('~$')]

components = [
    {
        "id": 'solly',
        "title": 'Solly Levi Photographic Carousel',
        "tag": 'Carousel',
        "desc": 'The perfectly modular, infinite loop cinematic GSAP 3D carousel. Unbreakable in Nicepage.',
        "file": 'solly_levi_v2_modular.html'
    },
    {
        "id": 'luxury',
        "title": 'Luxury Itineraries Design',
        "tag": 'Layout',
        "desc": '100% CSS ONLY Sticky Hover block with 6 mapped Luxury Safaris. Unblockable scripts.',
        "file": 'luxury_itineraries_design.html'
    },
    {
        "id": 'flyin',
        "title": 'Fly-In Itineraries Design',
        "tag": 'Layout',
        "desc": '100% CSS ONLY Sticky Hover block with 6 mapped Fly-In Safaris. Fast and responsive.',
        "file": 'fly_in_itineraries_design.html'
    },
    {
        "id": 'guided',
        "title": 'Guided Itineraries Design',
        "tag": 'Layout',
        "desc": '100% CSS ONLY Sticky Hover block perfectly truncated for exactly 4 Guided Safaris.',
        "file": 'guided_itineraries_design.html'
    }
]

idx_counter = 5

for f in files:
    original_name = os.path.basename(f)
    name = original_name.replace('.docx', '')
    raw_code = extract_text_from_docx(f)
    if "Error extracting" in raw_code or not raw_code.strip(): continue
    
    file_id = f"component_{idx_counter}"
    html_filename = f"{file_id}.html"
    html_path = os.path.join(target_dir, html_filename)
    
    with open(html_path, 'w', encoding='utf-8') as out_f:
        out_f.write(raw_code)
        
    components.append({
        "id": file_id,
        "title": name,
        "tag": "Exported Doc",
        "desc": f"Extracted from {original_name} on your Desktop.",
        "file": html_filename
    })
    idx_counter += 1

subfolder = os.path.join(folder, "SELF-DRIVE ITINERARY")
if os.path.isdir(subfolder):
    subfiles = glob.glob(os.path.join(subfolder, "*.docx"))
    for sf in subfiles:
        if os.path.basename(sf).startswith('~$'): continue
        original_name = os.path.basename(sf)
        name = original_name.replace('.docx', '')
        raw_code = extract_text_from_docx(sf)
        if "Error extracting" in raw_code or not raw_code.strip(): continue
        
        file_id = f"component_{idx_counter}"
        html_filename = f"{file_id}.html"
        html_path = os.path.join(target_dir, html_filename)
        with open(html_path, 'w', encoding='utf-8') as out_f:
            out_f.write(raw_code)
            
        components.append({
            "id": file_id,
            "title": name,
            "tag": "Self-Drive Doc",
            "desc": f"Extracted from SELF-DRIVE ITINERARY / {original_name}",
            "file": html_filename
        })
        idx_counter += 1

components_json = json.dumps(components, indent=4)

dashboard = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Desert Tracks - Master Component Library</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
    <style>
        :root {{
            --orange: #ff6e00;
            --dark: #1a1a18;
            --sand: #f9f9f4;
            --muted: #7a746d;
            --border: #e0d8d0;
            --bg: #f2eee8;
            --font-main: 'DM Sans', sans-serif;
            --font-head: 'Playfair Display', serif;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{ font-family: var(--font-main); background: var(--bg); color: var(--dark); display: flex; height: 100vh; overflow: hidden; }}
        
        aside {{ width: 340px; background: var(--dark); color: #fff; display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.1); z-index: 10; padding: 0; }}
        .brand {{ padding: 40px 30px 40px; text-align: left; background: linear-gradient(180deg, #111, var(--dark)); }}
        .brand h1 {{ font-family: var(--font-head); font-size: 1.8rem; letter-spacing: 0.5px; margin-bottom: 8px; font-weight: 400; line-height:1.2; }}
        .brand span {{ font-size: 0.75rem; text-transform: uppercase; letter-spacing: 3px; color: var(--orange); font-weight: 700; }}
        
        .nav-items {{ flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 8px; }}
        .nav-item {{ 
            padding: 16px 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s; 
            background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
        }}
        .nav-item:hover {{ background: rgba(255,255,255,0.08); transform: translateX(4px); border-color: rgba(255,255,255,0.15); }}
        .nav-item.active {{ background: var(--orange); border-color: var(--orange); box-shadow: 0 4px 15px rgba(255,110,0,0.3); }}
        .nav-item-title {{ font-weight: 500; font-size: 0.95rem; line-height: 1.3; }}
        .nav-item-tag {{ font-size: 0.65rem; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; color: #fff; opacity: 0.9; }}
        
        .footer {{ padding: 30px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.8rem; color: #888; text-align: center; }}

        main {{ flex: 1; display: flex; flex-direction: column; background: var(--bg); position: relative; }}
        header {{ background: #fff; height: 90px; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; box-shadow: 0 1px 10px rgba(0,0,0,0.03); z-index: 5; flex-shrink: 0; }}
        .title-area h2 {{ font-family: var(--font-head); font-size: 1.5rem; color: var(--dark); }}
        .title-area p {{ font-size: 0.85rem; color: var(--muted); margin-top: 6px; max-width: 600px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}
        
        .actions {{ display: flex; gap: 15px; }}
        .btn {{ padding: 12px 24px; border-radius: 4px; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; cursor: pointer; border: none; transition: 0.2s; display: flex; align-items: center; gap: 8px; }}
        .btn-primary {{ background: var(--orange); color: #fff; box-shadow: 0 4px 12px rgba(255,110,0,0.3); }}
        .btn-primary:hover {{ background: #e06000; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(255,110,0,0.4); }}
        
        .btn-secondary {{ background: var(--dark); color: #fff; }}
        .btn-secondary:hover {{ background: #000; }}

        .preview-container {{ flex: 1; padding: 40px; overflow: hidden; display: flex; flex-direction: column; }}
        .iframe-wrap {{ flex: 1; background: #fff; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); overflow: hidden; position: relative; display: flex; flex-direction: column; }}
        .iframe-toolbar {{ background: #fdfdfc; height: 40px; display: flex; align-items: center; padding: 0 20px; border-bottom: 1px solid var(--border); gap: 10px; }}
        .dot {{ width: 12px; height: 12px; border-radius: 50%; }}
        .dot.r {{ background: #ff5f56; }}
        .dot.y {{ background: #ffbd2e; }}
        .dot.g {{ background: #27c93f; }}
        
        iframe {{ width: 100%; height: 100%; border: none; background: #fff; }}

        .toast {{ position: fixed; bottom: -60px; left: 50%; transform: translateX(-50%); background: #27c93f; color: #fff; padding: 16px 32px; border-radius: 40px; box-shadow: 0 10px 30px rgba(39,201,63,0.3); font-weight: 700; font-size: 0.9rem; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 100; letter-spacing: 1px; display: flex; align-items: center; gap: 10px; }}
        .toast.show {{ bottom: 40px; }}

        .loader {{ position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #fff; z-index: 50; display: flex; align-items: center; justify-content: center; font-family: var(--font-head); font-size: 1.5rem; color: var(--muted); opacity: 0; pointer-events: none; transition: 0.3s; }}
        .loader.active {{ opacity: 1; pointer-events: auto; }}
    </style>
</head>
<body>
    <aside>
        <div class="brand">
            <h1>Master Library</h1>
            <span>Desert Tracks UI Vault</span>
        </div>
        <div class="nav-items" id="navContainer">
        </div>
        <div class="footer">
            Built by Antigravity AI<br>March 2026
        </div>
    </aside>

    <main>
        <header>
            <div class="title-area">
                <h2 id="headerTitle">Select a Component</h2>
                <p id="headerDesc">Preview live renderings and copy raw code instantly.</p>
            </div>
            <div class="actions">
                <button class="btn btn-secondary" onclick="viewSource()">View Source File</button>
                <button class="btn btn-primary" onclick="copyActiveCode()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy HTML Code
                </button>
            </div>
        </header>
        
        <div class="preview-container">
            <div class="iframe-wrap">
                <div class="iframe-toolbar">
                    <div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
                    <span style="margin-left:auto; font-size: 0.7rem; color: #888; font-family: monospace;" id="urlBar">live-preview.html</span>
                </div>
                <div class="loader" id="loader">Rendering Design...</div>
                <iframe id="previewFrame" src="about:blank"></iframe>
            </div>
        </div>
    </main>

    <div class="toast" id="toast">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Code Copied Successfully!
    </div>

    <script>
        const components = {components_json};

        let activeIndex = -1;

        function renderNav() {{
            const container = document.getElementById('navContainer');
            container.innerHTML = '';
            components.forEach((cmp, idx) => {{
                const el = document.createElement('div');
                el.className = 'nav-item ' + (idx === activeIndex ? 'active' : '');
                el.onclick = () => loadComponent(idx);
                el.innerHTML = `
                    <div style="display:flex; justify-content:space-between; width:100%; align-items:flex-start;">
                        <span class="nav-item-title">${{cmp.title}}</span>
                    </div>
                    <span class="nav-item-tag">${{cmp.tag}}</span>
                `;
                container.appendChild(el);
            }});
        }}

        function loadComponent(idx) {{
            activeIndex = idx;
            const cmp = components[idx];
            
            document.getElementById('headerTitle').innerText = cmp.title;
            document.getElementById('headerDesc').innerText = cmp.desc;
            document.getElementById('urlBar').innerText = cmp.file;
            
            document.getElementById('loader').classList.add('active');
            
            renderNav();
            
            const frame = document.getElementById('previewFrame');
            frame.src = cmp.file;
            
            frame.onload = () => {{
                // Fallback to clear loader if not cleared by postMessage
                setTimeout(() => {{ document.getElementById('loader').classList.remove('active'); }}, 300);
            }};
        }}

        async function copyActiveCode() {{
            if (activeIndex < 0) return;
            const cmp = components[activeIndex];
            
            try {{
                const res = await fetch(cmp.file);
                const code = await res.text();
                
                await navigator.clipboard.writeText(code);
                
                const toast = document.getElementById('toast');
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3000);
            }} catch (err) {{
                alert("Could not copy! Try opening the file directly.");
            }}
        }}

        function viewSource() {{
            if (activeIndex < 0) return;
            const cmp = components[activeIndex];
            window.open(cmp.file, '_blank');
        }}

        loadComponent(0);
    </script>
</body>
</html>
"""

with open(out_html, 'w', encoding='utf-8') as f:
    f.write(dashboard)

print(f"Success! {len(components)} items merged into {out_html}")
