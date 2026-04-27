import os
import json

base_html = """<!-- Swiper CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" data-no-optimize="1" />

<style data-no-optimize="1">
    /* Base Container Styling */
    .dt-coverflow-wrapper {
        position: relative;
        width: 100vw !important;
        margin-left: calc(-50vw + 50%) !important;
        background: #F5F5F3; /* Luxury Ivory Background */
        padding: 100px 0 40px 0;
        margin-bottom: 0 !important;
        overflow: hidden;
        font-family: 'Open Sans', sans-serif;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
    }

    .dt-coverflow-header {
        text-align: center;
        margin-bottom: 60px;
        padding: 0 20px;
    }

    .dt-coverflow-eyebrow {
        display: block;
        font-size: 11px;
        letter-spacing: 4px;
        color: #8b7a66; /* Muted brown */
        text-transform: uppercase;
        margin-bottom: 15px;
        font-weight: 500;
    }

    .dt-coverflow-title {
        font-family: 'Cinzel', serif;
        font-size: clamp(32px, 5vw, 48px);
        color: #123631; /* Deep Typography Green */
        font-weight: 400;
        margin: 0 0 20px 0;
        letter-spacing: 1px;
    }

    /* Swiper Container */
    .swiper.dt-safari-swiper {
        width: 100%;
        padding-top: 20px;
        padding-bottom: 60px;
    }

    .swiper-slide.dt-coverflow-slide {
        background-position: center;
        background-size: cover;
        width: 320px;
        height: 460px;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
        position: relative;
        text-decoration: none;
        display: block;
        /* Webkit fix for clipping */
        -webkit-mask-image: -webkit-radial-gradient(white, black);
    }

    /* Desktop specific slide size */
    @media (min-width: 768px) {
        .swiper-slide.dt-coverflow-slide {
            width: 380px;
            height: 520px;
        }
    }

    .dt-coverflow-slide img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
    }

    .dt-coverflow-slide:hover img {
        transform: scale(1.05);
    }

    /* Gradient Overlay for Text */
    .dt-slide-gradient {
        position: absolute;
        inset: auto 0 0 0;
        height: 60%;
        background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
        z-index: 1;
        pointer-events: none;
    }

    /* Slide Content Text */
    .dt-slide-content {
        position: absolute;
        bottom: 30px;
        left: 30px;
        right: 30px;
        z-index: 2;
        text-align: left;
        transition: transform 0.4s ease;
    }

    .dt-slide-days {
        display: inline-block;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 2px;
        color: #C9A24A;
        text-transform: uppercase;
        margin-bottom: 10px;
        border: 1px solid rgba(201, 162, 74, 0.4);
        padding: 4px 10px;
        border-radius: 40px;
        backdrop-filter: blur(4px);
    }

    .dt-slide-title {
        font-family: 'Cinzel', serif;
        font-size: 24px;
        color: #ffffff;
        margin: 0;
        font-weight: 300;
        line-height: 1.2;
    }

    /* Slide Active State Enhancements */
    .swiper-slide-active .dt-slide-content {
        transform: translateY(-10px);
    }

    /* Navigation Arrows & Pagination */
    .dt-coverflow-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 30px;
        margin-top: 20px;
        position: relative;
        z-index: 10;
    }

    .dt-prev-btn, .dt-next-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(18,54,49,0.05);
        border: 1px solid rgba(18,54,49,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }

    .dt-prev-btn:hover, .dt-next-btn:hover {
        background: rgba(201, 162, 74, 0.15);
        border-color: #C9A24A;
    }

    .dt-prev-btn svg, .dt-next-btn svg {
        width: 18px;
        height: 18px;
        stroke: #123631;
        fill: none;
        stroke-width: 1.5;
        transition: stroke 0.3s ease;
    }

    .dt-prev-btn:hover svg, .dt-next-btn:hover svg {
        stroke: #C9A24A;
    }

    /* Pagination Dots */
    .swiper-pagination.dt-swiper-pagination {
        position: static !important;
        width: auto !important;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 10px;
    }

    .swiper-pagination-bullet {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(18,54,49,0.2);
        opacity: 1;
        transition: all 0.3s ease;
        margin: 0 !important;
    }

    .swiper-pagination-bullet-active {
        background: #C9A24A;
        width: 24px;
        border-radius: 4px;
    }
</style>

<div class="dt-coverflow-wrapper">
    <div class="dt-coverflow-header">
        <span class="dt-coverflow-eyebrow">Continue Exploring</span>
        <h2 class="dt-coverflow-title">{title}</h2>
    </div>

    <!-- Swiper Container -->
    <div class="swiper dt-safari-swiper" data-no-optimize="1">
        <div class="swiper-wrapper">
{slides}
        </div>
    </div>
    
    <!-- Custom Controls Below Cards -->
    <div class="dt-coverflow-controls">
        <div class="dt-prev-btn">
            <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </div>
        <div class="swiper-pagination dt-swiper-pagination"></div>
        <div class="dt-next-btn">
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
    </div>
</div>

<!-- Swiper JS CDN -->
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js" data-no-optimize="1"></script>

<!-- Initialize Component -->
<script data-no-optimize="1">
    function initSafariCoverflow_{unique_id}() {
        if (typeof Swiper === 'undefined') {
            setTimeout(initSafariCoverflow_{unique_id}, 100);
            return;
        }
        
        var safariSwiper = new Swiper('.dt-safari-swiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            loop: true,
            speed: 800,
            slidesPerView: 'auto',
            slideToClickedSlide: true,
            initialSlide: 1,
            coverflowEffect: {
                rotate: 15,          // Slide rotate in degrees
                stretch: 0,          // Stretch space between slides
                depth: 250,          // Depth offset
                modifier: 1.5,       // Effect multiplier
                slideShadows: true,  // Enable slide shadows
            },
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '.dt-next-btn',
                prevEl: '.dt-prev-btn',
            },
            pagination: {
                el: '.dt-swiper-pagination',
                clickable: true,
            },
            keyboard: {
                enabled: true,
            },
            mousewheel: {
                forceToAxis: true,
                releaseOnEdges: true,
            }
        });
        
        // Pause Autoplay on Hover
        var swiperContainer = document.querySelector('.dt-safari-swiper');
        if(swiperContainer) {
            swiperContainer.addEventListener('mouseenter', function() {
                safariSwiper.autoplay.stop();
            });
            swiperContainer.addEventListener('mouseleave', function() {
                safariSwiper.autoplay.start();
            });
        }
        
        // Prevent clicks opening URL if the slide is not active in the center
        var slides = document.querySelectorAll('.dt-coverflow-slide');
        slides.forEach(function(slide) {
            slide.addEventListener('click', function(e) {
                if (!slide.classList.contains('swiper-slide-active')) {
                    e.preventDefault();
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", initSafariCoverflow_{unique_id});
    } else {
        initSafariCoverflow_{unique_id}();
    }
</script>
"""

def make_slide(img, url, days, title):
    # Shorten titles for cleaner pills
    short_title = title.replace('11-Day ', '').replace('16-Day ', '').replace('12-Day ', '').replace('10-Day ', '').replace('14-Day ', '').replace('7-Day ', '').replace('8-Day ', '').replace('Guided Safari', '').replace('Self-Drive Safari Circuit', 'Self-Drive').strip()
    return f'''            <a href="{url}" target="_blank" class="swiper-slide dt-coverflow-slide">
                <img src="{img}" alt="{short_title}" loading="lazy">
                <div class="dt-slide-gradient"></div>
                <div class="dt-slide-content">
                    <span class="dt-slide-days">{days}</span>
                    <h3 class="dt-slide-title">{short_title}</h3>
                </div>
            </a>'''

data = {
    'carousel_self_drive.html': {
        'title': 'More Self-Drive Safaris',
        'items': [
            ("https://desert-tracks.com/wp-content/uploads/2026/03/donkey-cart-solly-damaraland-large.jpeg", "https://desert-tracks.com/18-days-hidden-treasures-of-namibia-safari/", "18 Days", "Hidden Treasures Of Namibia"),
            ("https://desert-tracks.com/wp-content/uploads/2025/10/sossuvlei_221kb.jpg", "https://desert-tracks.com/11-days-south-of-namibia-safari/", "11 Days", "South of Namibia"),
            ("https://desert-tracks.com/wp-content/uploads/2025/10/29c1a07ebd3fcf987a8cbfce29564ecda4c8c2cb01656ab89e940f236d2c438275cdee4f5a503b6939a5008af8e8e5445682ea5a966bd418fb17bd_1280-2.jpg", "https://desert-tracks.com/18-days-namibia-delta-chobe-vic-falls-safari/", "18 Days", "Namibia, Delta &amp; Chobe"),
            ("https://desert-tracks.com/wp-content/uploads/2026/03/solly_5112_4.jpg", "https://desert-tracks.com/14-days-namibia-comfort-safari/", "14 Days", "Best of Namibia"),
            ("https://desert-tracks.com/wp-content/uploads/2026/03/solly-lion-and-cub-large.jpeg", "https://desert-tracks.com/11-days-wildlife-of-namibia-safari/", "11 Days", "Namibia Wildlife"),
            ("https://desert-tracks.com/wp-content/uploads/2025/10/divava-1.jpg", "https://desert-tracks.com/17-days-namibia-chobe-vic-falls-safari/", "16 Days", "Namibia, Chobe &amp; Vic Falls")
        ]
    },
    'carousel_luxury.html': {
        'title': 'More Luxury Safaris',
        'items': [
            ("https://desert-tracks.com/wp-content/uploads/2025/10/savuti-lion-in-the-road.jpeg", "https://wetu.com/ItineraryOutputs/Discovery/d957f35f-76c0-4276-899d-ba04411b5e9e?_gl=1*1abd97m*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "14 Days", "14-Day Luxury Namibia Drive &amp; Fly Photo Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/11/29c1a07ebd3fcf987a8cbfce29564ecda4c8c2cb01656ab89e940f236d2c438275cdee4f5a503b6939a5008af8e8e5445682ea5a966bd418fb17bd_1280-1.jpg", "https://wetu.com/ItineraryOutputs/Discovery/b02e8a98-0fe9-4d6b-9a85-8fcc81355557?_gl=1*1abd97m*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "14 Days", "14-Day Luxury Namibia Highlights Self-Drive Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/11/wilderness-desert-rhino-camp_3-scaled-3.jpg", "https://wetu.com/Itinerary/Landing/8d67bdc1-417a-411c-ac60-e312537c8730?_gl=1*269is8*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "12 Days", "12-Day Namibia Self-Drive Luxury Safari Circuit"),
            ("https://desert-tracks.com/wp-content/uploads/2025/11/divava-1.jpg", "https://wetu.com/ItineraryOutputs/Discovery/f959961b-5ea6-43dc-b713-5a2fb0928eb1?_gl=1*269is8*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "10 Days", "10-Day Namibia Honeymoon Luxury Fly-In Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/11/bc95b679-56fc-4800-b602-5d040fe0cced-png-1.webp", "https://wetu.com/ItineraryOutputs/Discovery/487e81b5-4faf-4bdc-88f7-d28a3b229cdf?_gl=1*269is8*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "10 Days", "10-Day Ultra-Luxury Namibia Safari - North Focus"),
            ("https://desert-tracks.com/wp-content/uploads/2025/11/bagatelle-lodge-kalahari-game-ranch-namibia-chalte-on-dune2-1.jpg", "https://wetu.com/ItineraryOutputs/Discovery/e3ab6f95-cd77-4d07-943b-45d8257dda6c", "10 Days", "10-Day Ultra-Luxury Namibia Safari - South Focus")
        ]
    },
    'carousel_fly_in.html': {
        'title': 'More Fly-In Safaris',
        'items': [
            ("https://desert-tracks.com/wp-content/uploads/2024/08/Shipwreck-Lodge.jpg", "https://wetu.com/ItineraryOutputs/Discovery/de75c783-8643-4e46-b0d6-114fbcd3f137", "7 Days", "7-Day Namibia Desert, Dune &amp; Wildlife Fly-In Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/04/Onguma-Camp-Kala-_1-scaled.jpg", "https://wetu.com/ItineraryOutputs/Discovery/4db02e36-a80a-4486-987a-251d707016c0", "12 Days", "12-Day Namibia in Style – Luxury Fly-In Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/09/01hoanibvalley-tentexterior.jpg", "https://wetu.com/ItineraryOutputs/Discovery/cf8f5ef9-4740-4976-90d5-e644b2e25b4b", "10 Days", "10-Day Highlights of Namibia – Luxury Fly-In & Road Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/04/Wilderness-Little-Kulala_3-scaled.jpg", "https://wetu.com/ItineraryOutputs/Discovery/F959961B-5EA6-43DC-B713-5A2FB0928EB1", "10 Days", "10-Day Namibia Honeymoon Luxury Fly-In Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/09/wildernessserracafema_6.jpg", "https://wetu.com/ItineraryOutputs/Discovery/d957f35f-76c0-4276-899d-ba04411b5e9e", "14 Days", "14-Day Luxury Namibia Drive &amp; Fly Photographic Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/09/kipwe1.jpg", "https://wetu.com/ItineraryOutputs/Discovery/2084D921-60AB-4B0F-8832-E857FD4D0E35", "8 Days", "8-Day Namibia in Style – Luxury Fly-In Safari")
        ]
    },
    'carousel_guided.html': {
        'title': 'More Guided Safaris',
        'items': [
            ("https://desert-tracks.com/wp-content/uploads/2025/10/sossuvlei_221kb.jpg", "https://wetu.com/ItineraryOutputs/Discovery/59FB464A-B4D1-4FD0-9CD2-6586C62865B3", "11 Days", "11-Day Namibia Just a Quick Visit Guided Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/10/29c1a07ebd3fcf987a8cbfce29564ecda4c8c2cb01656ab89e940f236d2c438275cdee4f5a503b6939a5008af8e8e5445682ea5a966bd418fb17bd_1280-2.jpg", "https://wetu.com/ItineraryOutputs/Discovery/ff94535b-8db4-47c5-bf38-c9799a759365", "16 Days", "16-Day Namibia, Chobe &amp; Victoria Falls Guided Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/10/wilderness-desert-rhino-camp_3-scaled-2.jpg", "https://wetu.com/ItineraryOutputs/Discovery/66984053-E334-4AC3-8CA0-368744AA5D5B", "16 Days", "16-Day Namibia at a Glance Guided Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/10/divava-1.jpg", "https://wetu.com/ItineraryOutputs/Discovery/3F614703-5290-4855-A519-10E536378339", "16 Days", "16-Day Nam, Delta, Chobe &amp; Vic Falls Guided Safari")
        ]
    }
}

for filename, config in data.items():
    slides_str = '\n'.join([make_slide(img, url, days, title) for img, url, days, title in config['items']])
    unique_id = filename.replace('.html', '').replace('_', '')
    final_html = base_html.replace('{slides}', slides_str).replace('{title}', config['title']).replace('{unique_id}', unique_id)
    
    with open('/Users/jaunhusselmann/Desktop/AG Projects/dt_library/' + filename, 'w') as f:
        f.write(final_html)

print("Successfully regenerated all carousels.")
