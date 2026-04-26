import os
import json

base_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Desert Tracks - Itinerary Carousel</title>
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet">
    <!-- Swiper CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"/>
    
    <style data-no-optimize="1">
        :root {
            --primary-bg: #F5F5F3; /* Luxury Ivory Background */
            --dt-orange: #C9A24A; /* Luxury Gold */
            --dt-dark: #123631; /* Deep Typography Green */
            --font-head: 'Cinzel', serif;
            --font-body: 'Open Sans', Arial, sans-serif;
            --transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        body {
            margin: 0;
            padding: 0;
            background-color: var(--primary-bg);
            font-family: var(--font-body);
            -webkit-font-smoothing: antialiased;
        }

        .itinerary-carousel-section {
            width: 100vw;
            max-width: 100vw;
            position: relative;
            left: 50%;
            transform: translateX(-50%);
            padding: 80px 0 100px 0;
            background-color: var(--primary-bg);
            overflow: hidden;
        }

        /* SWIPER CONTAINER */
        .swiper-container-wrapper {
            position: relative;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
        }

        .itinerary-swiper {
            width: 100%;
            padding-top: 50px;
            padding-bottom: 50px;
        }

        .swiper-slide {
            width: 320px;
            height: 480px;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
            cursor: pointer;
            background-size: cover;
            background-position: center;
            transition: var(--transition);
        }

        @media (min-width: 768px) {
            .swiper-slide {
                width: 380px;
                height: 560px;
            }
        }

        /* Dark Gradient Overlay */
        .swiper-slide::after {
            content: '';
            position: absolute;
            bottom: 0; left: 0; width: 100%; height: 65%;
            background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
            z-index: 1;
            transition: var(--transition);
        }

        .swiper-slide:hover::after {
            height: 75%;
            background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%);
        }

        /* CARD CONTENT */
        .swiper-card-content {
            position: absolute;
            bottom: 30px;
            left: 30px;
            right: 30px;
            z-index: 2;
            color: #fff;
            text-align: left;
            transition: var(--transition);
        }

        .itinerary-pill {
            display: inline-block;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--dt-orange);
            border: 1px solid rgba(201, 162, 74, 0.5);
            padding: 6px 12px;
            border-radius: 30px;
            margin-bottom: 15px;
            font-weight: 600;
            backdrop-filter: blur(4px);
        }

        .itinerary-title {
            font-size: 1.6rem;
            font-family: var(--font-head);
            font-weight: 400;
            margin: 0;
            line-height: 1.2;
            text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        @media (min-width: 768px) {
            .itinerary-title {
                font-size: 2rem;
            }
        }

        /* NAVIGATION CONTROLS */
        .carousel-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-top: 20px;
            position: relative;
            z-index: 10;
        }

        .swiper-button-prev-custom,
        .swiper-button-next-custom {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 1px solid rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: var(--transition);
            background: transparent;
            color: var(--dt-dark);
        }

        .swiper-button-prev-custom:hover,
        .swiper-button-next-custom:hover {
            border-color: var(--dt-orange);
            color: var(--dt-orange);
            background: rgba(201, 162, 74, 0.05);
        }

        .swiper-button-prev-custom svg,
        .swiper-button-next-custom svg {
            width: 20px;
            height: 20px;
            stroke: currentColor;
            fill: none;
            stroke-width: 1.5;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        /* PAGINATION DOTS */
        .swiper-pagination-custom {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .swiper-pagination-bullet {
            width: 6px;
            height: 6px;
            background: rgba(0,0,0,0.2);
            opacity: 1;
            margin: 0 !important;
            transition: var(--transition);
        }

        .swiper-pagination-bullet-active {
            width: 20px;
            border-radius: 10px;
            background: var(--dt-orange);
        }
    </style>
</head>
<body>

<section class="itinerary-carousel-section">
    <div class="swiper-container-wrapper">
        <div class="swiper itinerary-swiper">
            <div class="swiper-wrapper">
{slides}
            </div>
        </div>

        <!-- CONTROLS -->
        <div class="carousel-controls">
            <div class="swiper-button-prev-custom">
                <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"></path></svg>
            </div>
            <div class="swiper-pagination-custom"></div>
            <div class="swiper-button-next-custom">
                <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
            </div>
        </div>

    </div>
</section>

<!-- Swiper JS -->
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>

<script data-no-optimize="1">
(function() {
    function initCarousel() {
        if (typeof Swiper !== 'undefined') {
            const itinerarySwiper = new Swiper('.itinerary-swiper', {
                effect: 'coverflow',
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: 'auto',
                loop: true,
                initialSlide: 1, // Start on the second slide usually
                speed: 800,
                coverflowEffect: {
                    rotate: 0,
                    stretch: 0,
                    depth: 100,
                    modifier: 2,
                    slideShadows: false, // We use custom CSS gradients instead
                },
                navigation: {
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                },
                pagination: {
                    el: '.swiper-pagination-custom',
                    clickable: true,
                },
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    320: {
                        coverflowEffect: { depth: 50, modifier: 1 }
                    },
                    768: {
                        coverflowEffect: { depth: 100, modifier: 2 }
                    }
                }
            });
        } else {
            setTimeout(initCarousel, 100);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", initCarousel);
    } else {
        initCarousel();
    }
})();
</script>

</body>
</html>
"""

def make_slide(img, url, days, title):
    return f'''                <div class="swiper-slide" style="background-image: url('{img}');" onclick="window.open('{url}', '_blank')">
                    <div class="swiper-card-content">
                        <span class="itinerary-pill">{days}</span>
                        <h3 class="itinerary-title">{title}</h3>
                    </div>
                </div>'''

data = {
    'carousel_self_drive.html': [
        ("https://desert-tracks.com/wp-content/uploads/2026/03/donkey-cart-solly-damaraland-large.jpeg", "https://desert-tracks.com/18-days-hidden-treasures-of-namibia-safari/", "18 Days", "Hidden Treasures Of Namibia"),
        ("https://desert-tracks.com/wp-content/uploads/2025/10/sossuvlei_221kb.jpg", "https://desert-tracks.com/11-days-south-of-namibia-safari/", "11 Days", "South of Namibia"),
        ("https://desert-tracks.com/wp-content/uploads/2025/10/29c1a07ebd3fcf987a8cbfce29564ecda4c8c2cb01656ab89e940f236d2c438275cdee4f5a503b6939a5008af8e8e5445682ea5a966bd418fb17bd_1280-2.jpg", "https://desert-tracks.com/18-days-namibia-delta-chobe-vic-falls-safari/", "18 Days", "Namibia, Delta &amp; Chobe"),
        ("https://desert-tracks.com/wp-content/uploads/2026/03/solly_5112_4.jpg", "https://desert-tracks.com/14-days-namibia-comfort-safari/", "14 Days", "Best of Namibia"),
        ("https://desert-tracks.com/wp-content/uploads/2026/03/solly-lion-and-cub-large.jpeg", "https://desert-tracks.com/11-days-wildlife-of-namibia-safari/", "11 Days", "Namibia Wildlife"),
        ("https://desert-tracks.com/wp-content/uploads/2025/10/divava-1.jpg", "https://desert-tracks.com/17-days-namibia-chobe-vic-falls-safari/", "16 Days", "Namibia, Chobe &amp; Vic Falls")
    ],
    'carousel_luxury.html': [
        ("https://desert-tracks.com/wp-content/uploads/2025/10/savuti-lion-in-the-road.jpeg", "https://wetu.com/ItineraryOutputs/Discovery/d957f35f-76c0-4276-899d-ba04411b5e9e?_gl=1*1abd97m*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "14 Days", "14-Day Luxury Namibia Drive &amp; Fly Photo Safari"),
        ("https://desert-tracks.com/wp-content/uploads/2025/11/29c1a07ebd3fcf987a8cbfce29564ecda4c8c2cb01656ab89e940f236d2c438275cdee4f5a503b6939a5008af8e8e5445682ea5a966bd418fb17bd_1280-1.jpg", "https://wetu.com/ItineraryOutputs/Discovery/b02e8a98-0fe9-4d6b-9a85-8fcc81355557?_gl=1*1abd97m*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "14 Days", "14-Day Luxury Namibia Highlights Self-Drive Safari"),
        ("https://desert-tracks.com/wp-content/uploads/2025/11/wilderness-desert-rhino-camp_3-scaled-3.jpg", "https://wetu.com/Itinerary/Landing/8d67bdc1-417a-411c-ac60-e312537c8730?_gl=1*269is8*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "12 Days", "12-Day Namibia Self-Drive Luxury Safari Circuit"),
        ("https://desert-tracks.com/wp-content/uploads/2025/11/divava-1.jpg", "https://wetu.com/ItineraryOutputs/Discovery/f959961b-5ea6-43dc-b713-5a2fb0928eb1?_gl=1*269is8*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "10 Days", "10-Day Namibia Honeymoon Luxury Fly-In Safari"),
        ("https://desert-tracks.com/wp-content/uploads/2025/11/bc95b679-56fc-4800-b602-5d040fe0cced-png-1.webp", "https://wetu.com/ItineraryOutputs/Discovery/487e81b5-4faf-4bdc-88f7-d28a3b229cdf?_gl=1*269is8*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "10 Days", "10-Day Ultra-Luxury Namibia Safari - North Focus"),
        ("https://desert-tracks.com/wp-content/uploads/2025/11/bagatelle-lodge-kalahari-game-ranch-namibia-chalte-on-dune2-1.jpg", "https://wetu.com/ItineraryOutputs/Discovery/e3ab6f95-cd77-4d07-943b-45d8257dda6c", "10 Days", "10-Day Ultra-Luxury Namibia Safari - South Focus")
    ],
    'carousel_fly_in.html': [
        ("https://desert-tracks.com/wp-content/uploads/2024/08/Shipwreck-Lodge.jpg", "https://wetu.com/ItineraryOutputs/Discovery/de75c783-8643-4e46-b0d6-114fbcd3f137", "7 Days", "7-Day Namibia Desert, Dune &amp; Wildlife Fly-In Safari"),
        ("https://desert-tracks.com/wp-content/uploads/2025/04/Onguma-Camp-Kala-_1-scaled.jpg", "https://wetu.com/ItineraryOutputs/Discovery/4db02e36-a80a-4486-987a-251d707016c0", "12 Days", "12-Day Namibia in Style – Luxury Fly-In Safari"),
        ("https://desert-tracks.com/wp-content/uploads/2025/09/01hoanibvalley-tentexterior.jpg", "https://wetu.com/ItineraryOutputs/Discovery/cf8f5ef9-4740-4976-90d5-e644b2e25b4b", "10 Days", "10-Day Highlights of Namibia – Luxury Fly-In & Road Safari"),
        ("https://desert-tracks.com/wp-content/uploads/2025/04/Wilderness-Little-Kulala_3-scaled.jpg", "https://wetu.com/ItineraryOutputs/Discovery/F959961B-5EA6-43DC-B713-5A2FB0928EB1", "10 Days", "10-Day Namibia Honeymoon Luxury Fly-In Safari"),
        ("https://desert-tracks.com/wp-content/uploads/2025/09/wildernessserracafema_6.jpg", "https://wetu.com/ItineraryOutputs/Discovery/d957f35f-76c0-4276-899d-ba04411b5e9e", "14 Days", "14-Day Luxury Namibia Drive &amp; Fly Photographic Safari"),
        ("https://desert-tracks.com/wp-content/uploads/2025/09/kipwe1.jpg", "https://wetu.com/ItineraryOutputs/Discovery/2084D921-60AB-4B0F-8832-E857FD4D0E35", "8 Days", "8-Day Namibia in Style – Luxury Fly-In Safari")
    ],
    'carousel_guided.html': [
        ("https://desert-tracks.com/wp-content/uploads/2025/10/sossuvlei_221kb.jpg", "https://wetu.com/ItineraryOutputs/Discovery/59FB464A-B4D1-4FD0-9CD2-6586C62865B3", "11 Days", "11-Day Namibia Just a Quick Visit Guided Safari"),
        ("https://desert-tracks.com/wp-content/uploads/2025/10/29c1a07ebd3fcf987a8cbfce29564ecda4c8c2cb01656ab89e940f236d2c438275cdee4f5a503b6939a5008af8e8e5445682ea5a966bd418fb17bd_1280-2.jpg", "https://wetu.com/ItineraryOutputs/Discovery/ff94535b-8db4-47c5-bf38-c9799a759365", "16 Days", "16-Day Namibia, Chobe &amp; Victoria Falls Guided Safari"),
        ("https://desert-tracks.com/wp-content/uploads/2025/10/wilderness-desert-rhino-camp_3-scaled-2.jpg", "https://wetu.com/ItineraryOutputs/Discovery/66984053-E334-4AC3-8CA0-368744AA5D5B", "16 Days", "16-Day Namibia at a Glance Guided Safari"),
        ("https://desert-tracks.com/wp-content/uploads/2025/10/divava-1.jpg", "https://wetu.com/ItineraryOutputs/Discovery/3F614703-5290-4855-A519-10E536378339", "16 Days", "16-Day Nam, Delta, Chobe &amp; Vic Falls Guided Safari")
    ]
}

for filename, items in data.items():
    slides_str = '\n\n'.join([make_slide(img, url, days, title) for img, url, days, title in items])
    final_html = base_html.replace('{slides}', slides_str)
    
    with open('/Users/jaunhusselmann/Desktop/AG Projects/dt_library/' + filename, 'w') as f:
        f.write(final_html)
