import fs from 'fs';
const htmlPath = '/Users/jaunhusselmann/.gemini/antigravity/scratch/dt_library/index.html';
let html = fs.readFileSync(htmlPath, 'utf-8');

// Replace the copyActiveCode logic
html = html.replace(/async function copyActiveCode\(\) \{[\s\S]*?function viewSource/m, 
`let preloadedCode = "";

        async function loadComponent(idx) {
            activeIndex = idx;
            const cmp = components[idx];
            
            document.getElementById('headerTitle').innerText = cmp.title;
            document.getElementById('headerDesc').innerText = cmp.desc;
            document.getElementById('urlBar').innerText = cmp.file;
            document.getElementById('loader').classList.add('active');
            
            renderNav();
            
            const frame = document.getElementById('previewFrame');
            frame.src = cmp.file;
            frame.onload = () => { setTimeout(() => { document.getElementById('loader').classList.remove('active'); }, 300); };
            
            try {
                const res = await fetch(cmp.file);
                preloadedCode = await res.text();
            } catch(e) {
                console.error("Failed to preload code");
            }
        }

        function copyActiveCode() {
            if (activeIndex < 0) return;
            
            try {
                // Fallback for older Safari: Hidden text area
                const textArea = document.createElement('textarea');
                textArea.value = preloadedCode;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (successful) {
                    const toast = document.getElementById('toast');
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 3000);
                    return;
                }
                
                // Modern API if fallback failed
                navigator.clipboard.writeText(preloadedCode).then(() => {
                    const toast = document.getElementById('toast');
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 3000);
                });
            } catch (err) {
                alert("Copy failed. Try opening the source file manually.");
            }
        }

        function viewSource`);

// we need to also remove the original loadComponent function since we redefine it above
html = html.replace(/function loadComponent\(idx\) \{[\s\S]*?renderNav\(\);[\s\S]*?frame\.src = cmp\.file;[\s\S]*?frame\.onload = \(\) => \{[\s\S]*?setTimeout\(\(\) => \{ document\.getElementById\('loader'\)\.classList\.remove\('active'\); \}, 300\);[\s\S]*?\};[\s\S]*?\}/m, '');

fs.writeFileSync(htmlPath, html, 'utf-8');
