import re
import os

file_path = 'dt_library/index.html'

if not os.path.exists(file_path):
    print("index.html not found!")
else:
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    # Look for the last chunk of library links and append our new link
    # Just looking for an easy insertion point: maybe right before </ul> or maybe inside a section
    # If we don't know, let's just create a new group or append to an existing list
    
    # Let's see if we can find '<ul class="dt-comp-list">' or similar
    match = re.search(r'</ul>\s*</section>', text)
    if match:
        new_link = """
                        <li class="dt-comp-item">
                            <span class="dt-comp-id">TOOL</span>
                            <div class="dt-comp-info">
                                <span class="dt-comp-name">Safari Costing Engine</span>
                                <span class="dt-comp-desc">Premium internal pricing & configuration</span>
                            </div>
                            <div class="dt-comp-actions">
                                <a href="costing_engine.html" target="_blank" class="dt-comp-btn">View Tool</a>
                            </div>
                        </li>
"""
        insert_idx = match.start()
        text = text[:insert_idx] + new_link + text[insert_idx:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(text)
        print("Updated index.html to include Costing Engine.")
    else:
        print("Could not find insertion point. Trying alternative.")
        # Alternatively, just inject a whole new section before </body>
        body_end = text.rfind('</body>')
        if body_end != -1:
            new_sec = """
            <section class="dt-library-section">
                <h2>Tools</h2>
                <ul class="dt-comp-list">
                    <li class="dt-comp-item">
                        <span class="dt-comp-id">TOOL</span>
                        <div class="dt-comp-info">
                            <span class="dt-comp-name">Safari Costing Engine</span>
                            <span class="dt-comp-desc">Premium internal pricing configuration tool</span>
                        </div>
                        <div class="dt-comp-actions">
                            <a href="costing_engine.html" target="_blank" class="dt-comp-btn">View Tool</a>
                        </div>
                    </li>
                </ul>
            </section>
            """
            text = text[:body_end] + new_sec + text[body_end:]
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(text)
            print("Injected via structural section.")
