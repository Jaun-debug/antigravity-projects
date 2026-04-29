import sys
import re

file_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/itinerary_master_full_width.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# The script block I accidentally put at the top of LION CTA:
script_block = """<!-- END LION CTA -->
        <script data-no-optimize="1">
        document.addEventListener("DOMContentLoaded", function() {
            if(typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                gsap.to('.dt-glass-card', {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '.dt-glassmorphism-block',
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                });
            }
        });
        </script>
        <!-- ============================================== -->"""

# Remove the incorrectly placed script block
if script_block in content:
    content = content.replace(script_block, "<!-- LION CTA -->\n        <!-- ============================================== -->")
else:
    print("Could not find the script block to remove.")

# Insert the script block at the end of LION CTA
target_insert = """            </div>
        </div>
        <!-- ============================================== -->"""

replacement = """            </div>
        </div>
        <!-- ============================================== -->
        <!-- END LION CTA -->
        <script data-no-optimize="1">
        document.addEventListener("DOMContentLoaded", function() {
            if(typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                gsap.to('.dt-glass-card', {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '.dt-glassmorphism-block',
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                });
            }
        });
        </script>"""

if target_insert in content:
    content = content.replace(target_insert, replacement)
else:
    print("Could not find target insert.")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
