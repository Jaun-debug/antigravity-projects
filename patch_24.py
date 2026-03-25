import re

path = '/Users/jaunhusselmann/.gemini/antigravity/scratch/dt_library/component_24.html'
with open(path, 'r') as f:
    text = f.read()

# 1. Force lux-title to be white
text = text.replace('.lux-title {', '.lux-title {\n            color: #ffffff !important;')

# 2. Remove the interactive map HTML block completely
text = re.sub(r'<!-- Interactive Map Widget Overlay.*?</div>\s*<div class="lux-hero-content">', '<div class="lux-hero-content">', text, flags=re.DOTALL)

# 3. Remove all view-map buttons
text = re.sub(r'<button class="lux-view-map-btn">.*?</button>', '', text, flags=re.DOTALL)

# 4. Apply flawless WP JavaScript fading logic
js_fix = """<script>
    // --- SAFE WORDPRESS INITIALIZATION ---
    function initLuxHeroFade() {
        const dayBlocks = document.querySelectorAll('.lux-day-block');
        const bgBase = document.getElementById('lux-bg-base');
        const bgTop = document.getElementById('lux-bg-top');
        
        if (!dayBlocks.length || !bgBase || !bgTop) return;

        // Force clear sticky blockers
        let parentNode = document.querySelector('.lux-container');
        if (parentNode) parentNode = parentNode.parentElement;
        while (parentNode && parentNode.tagName !== 'BODY') {
            parentNode.style.setProperty('overflow', 'visible', 'important');
            parentNode.style.setProperty('overflow-x', 'visible', 'important');
            parentNode.style.setProperty('overflow-y', 'visible', 'important');
            parentNode = parentNode.parentElement;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bgUrl = entry.target.getAttribute('data-bg');
                    if (bgUrl && bgBase.style.backgroundImage !== `url("${bgUrl}")`) {
                        bgTop.style.backgroundImage = `url("${bgUrl}")`;
                        bgTop.style.opacity = 1;
                        
                        setTimeout(() => {
                            bgBase.style.backgroundImage = `url("${bgUrl}")`;
                            bgTop.style.opacity = 0;
                        }, 850);
                    }
                }
            });
        }, {
            root: null,
            rootMargin: "-20% 0px -60% 0px", 
            threshold: 0
        });

        // Ensure we don't double observe
        observer.disconnect();
        dayBlocks.forEach(block => observer.observe(block));
    }
    
    document.addEventListener("DOMContentLoaded", initLuxHeroFade);
    setTimeout(initLuxHeroFade, 500);
    setTimeout(initLuxHeroFade, 1500);
    setTimeout(initLuxHeroFade, 3000);
</script>"""

text = re.sub(r'<script>.*?</script>', js_fix, text, flags=re.DOTALL)

with open(path, 'w') as f:
    f.write(text)
