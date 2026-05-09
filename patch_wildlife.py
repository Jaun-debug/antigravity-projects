import re

with open("🔴 11_day_wildlife.html", "r") as f:
    content = f.read()

# 1. 100vh -> 100svh
content = content.replace("100vh", "100svh")

# 2. Map container style
old_map_style = 'style="position: relative; width: 100vw; margin-left: calc(-50vw + 50%); margin-top: -30px; height: calc(100svh + 30px); overflow: hidden; background: #0a0a0a; display: flex; align-items: center; justify-content: center;"'
new_map_style = 'style="position: relative; width: 100%; max-width: 1000px; margin: 0 auto; margin-top: -30px; height: 550px; overflow: hidden; background: #0a0a0a; display: flex; align-items: center; justify-content: center; border-radius: 16px;"'
content = content.replace(old_map_style, new_map_style)

# 3. Add mobile map media query
if "@media (max-width: 768px) {\n    #dt-interactive-map-container" not in content:
    mobile_map_css = """
@media (max-width: 768px) {
    #dt-interactive-map-container {
        max-width: 100% !important;
        max-height: 550px !important;
        width: 100% !important;
        border-radius: 16px !important;
        margin: 0 auto !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
}
"""
    content = content.replace("</style>", mobile_map_css + "\n</style>", 1)

# 4. lux-day-gallery-img hardware acceleration
old_gallery_img = """.lux-day-gallery-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}"""
new_gallery_img = """.lux-day-gallery-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
}"""
content = content.replace(old_gallery_img, new_gallery_img)

# 5. Accordion Icon CSS
old_acc_icon = """.lux-day-acc-icon {
    font-size: 36px;
    color: #1F4F4B;
    font-weight: 300;
    transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
    display: inline-block;
    line-height: 1;
    transform-origin: center;
}
.lux-day-block.is-open .lux-day-acc-icon {
    transform: rotate(135deg);
}"""
new_acc_icon = """.lux-day-acc-icon {
    width: 14px;
    height: 14px;
    position: relative;
    color: #1F4F4B;
    transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transform-origin: center;
    font-size: 0 !important;
}
@media (max-width: 768px) {
    .lux-day-acc-icon {
        width: 12px;
        height: 12px;
    }
}
.lux-day-acc-icon::before,
.lux-day-acc-icon::after {
    content: '';
    position: absolute;
    background-color: currentColor;
    border-radius: 2px;
    transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease;
}
.lux-day-acc-icon::before {
    width: 100%;
    height: 2px;
}
.lux-day-acc-icon::after {
    height: 100%;
    width: 2px;
}
.lux-day-block.is-open .lux-day-acc-icon {
    transform: rotate(180deg);
}
.lux-day-block.is-open .lux-day-acc-icon::after {
    transform: scaleY(0);
    opacity: 0;
}"""
content = content.replace(old_acc_icon, new_acc_icon)

# 6. Accordion speeds
old_body = """grid-template-rows: 0fr;
    transition: grid-template-rows 0.7s cubic-bezier(0.25, 1, 0.5, 1);"""
new_body = """grid-template-rows: 0fr;
    transition: grid-template-rows 2.1s cubic-bezier(0.25, 1, 0.5, 1);"""
content = content.replace(old_body, new_body)

old_inner = """padding: 0 1.5rem;
    opacity: 0;
    transition: opacity 0.7s ease, padding 0.7s ease;"""
new_inner = """padding: 0 1.5rem;
    opacity: 0;
    transition: opacity 2.1s ease, padding 0.7s ease;"""
content = content.replace(old_inner, new_inner)

# 7. Slow down Jump belt scroll
old_scroll = """                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });"""
new_scroll = """                // Custom Slow Smooth Scroll Function
                const startY = window.pageYOffset;
                const distanceY = offsetPosition - startY;
                let startTime = null;
                const duration = 1200; // 1.2 seconds, much slower and smoother

                function easeInOutQuad(time, start, distance, duration) {
                    time /= duration / 2;
                    if (time < 1) return distance / 2 * time * time + start;
                    time--;
                    return -distance / 2 * (time * (time - 2) - 1) + start;
                }

                function animation(currentTime) {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const run = easeInOutQuad(timeElapsed, startY, distanceY, duration);
                    window.scrollTo(0, run);
                    if (timeElapsed < duration) requestAnimationFrame(animation);
                }

                requestAnimationFrame(animation);"""
content = content.replace(old_scroll, new_scroll)

# Fix lowercase Day-by-Day
content = content.replace("el.textContent.includes('Day-by-Day')", "el.textContent.toLowerCase().includes('day-by-day')")

# 8. Remove auto play from swiper
content = re.sub(r'autoplay:\s*\{\s*delay:\s*3000,\s*disableOnInteraction:\s*false,\s*\},', '', content)
# Also remove the hover pause
content = content.replace("""        dtLodgeSwiper.el.addEventListener('mouseenter', function() {
            dtLodgeSwiper.autoplay.stop();
        });
        dtLodgeSwiper.el.addEventListener('mouseleave', function() {
            dtLodgeSwiper.autoplay.start();
        });""", "")

# 9. CTA Drop In 3x Slower
# It uses CSS transition for #dt-cta-sticky
old_cta_trans = "transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease;"
new_cta_trans = "transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.2s ease;"
content = content.replace(old_cta_trans, new_cta_trans)

# 10. Hide + text since CSS icon is used
content = content.replace('<div class="lux-day-acc-icon">+</div>', '<div class="lux-day-acc-icon"></div>')
# Wait, actually innerText replacement will still happen in JS, but font-size: 0 hides it, so the above is optional, but nice.

with open("🔴 11_day_wildlife.html", "w") as f:
    f.write(content)

print("Patch applied successfully.")
