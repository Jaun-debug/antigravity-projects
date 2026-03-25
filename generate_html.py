from bs4 import BeautifulSoup

with open('parsed_weather.html') as f:
    soup = BeautifulSoup(f, 'html.parser')

months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

output = []
for p in soup.find_all('p'):
    strong = p.find('strong')
    if strong:
        title = strong.text.strip()
        is_month_title = any(title.startswith(m) for m in months)
        if is_month_title:
            month_name = title.split(' ')[0].lower()
            output.append(f'\n    <a href="/namibia-weather/{month_name}/" class="cc-month-link">\n        <h2>{title}</h2>\n    </a>')
        else:
            output.append(f'\n    <h2>{title}</h2>')
    else:
        text = p.text.strip()
        if text:
            # Let's apply dropcap to the very first paragraph
            if len(output) == 0:
                output.append(f'    <p class="first-paragraph-dropcap">{text}</p>')
            else:
                output.append(f'    <p>{text}</p>')

html_content = "".join(output)

template = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Best Time to Visit Namibia</title>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style data-no-optimize="1">
/* Core Layout */
.cc-article-wrap { padding-top: 80px; font-family: 'Jost', sans-serif; background-color: #fbf9f6; padding-bottom: 6rem; }

/* Hide the old default WordPress/Elementor top image and headers */
.entry-header,
.page-header,
.post-thumbnail,
.wp-post-image,
.ast-single-post-header,
.ast-single-post-banner,
.elementor-location-header {
  display: none !important;
}

.cc-article-hero { position: relative; width: 100%; height: 70vh; min-height: 500px; background-size: cover; background-position: center; }
.cc-article-hero-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.2); }

/* Article Title Card (Overlaps the image) */
.cc-article-header { max-width: 900px; margin: -120px auto 0; position: relative; z-index: 10; background-color: #ffffff; padding: 4rem 3rem 3rem; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.05); }
.cc-article-category { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.25em; color: #d87a4d; margin-bottom: 1.5rem; font-weight: 600; }
.cc-article-title { font-family: 'Playfair Display', serif; font-size: clamp(2.5rem, 4vw, 3.5rem); color: #5d4f45; margin: 0 0 1.5rem 0; line-height: 1.15; }

/* Article Body Content */
.cc-article-body { max-width: 760px; margin: 4rem auto 0; padding: 0 2rem; font-size: 1.15rem; line-height: 1.8; color: #555; font-weight: 300; }
.cc-article-body > p:first-of-type::first-letter,  .first-paragraph-dropcap::first-letter { float: left; font-family: 'Playfair Display', serif; font-size: 4.5rem; line-height: 0.8; padding: 4px 12px 0 3px; color: #d87a4d; }

.cc-article-body h2 {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem;
    color: #5d4f45;
    margin-top: 4rem;
    margin-bottom: 1rem;
    font-weight: 700;
}

.cc-article-body p {
    margin-bottom: 1.5rem;
}


.cc-month-link {
    text-decoration: none;
    display: inline-block;
    transition: all 0.3s ease;
    border-bottom: 2px solid transparent;
}
.cc-month-link:hover h2 {
    color: #d87a4d;
}
.cc-month-link:hover {
    border-bottom: 2px solid #d87a4d;
}


/* Image classes that can be added through the WordPress editor */
.image-gallery { margin: 4rem 0; text-align: center; }
.image-gallery img { width: 100%; max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
</style>
</head>
<body>

<div class="cc-article-wrap">
  <!-- IMPORTANT: Update this URL to the actual Solly Levi photo URL when uploaded to WordPress -->
  <div class="cc-article-hero" style="background-image: url('file:///Users/jaunhusselmann/OneDrive/5.%20PHOTOS/01%20SOLLY%20LEVI/SOSSUSVLEI/Solly%20Dunes.JPG');">
    <div class="cc-article-hero-overlay"></div>
  </div>
  
  <div class="cc-article-header">
    <div class="cc-article-category">Namibia Weather Guide</div>
    <h1 class="cc-article-title">Best Time to Visit Namibia</h1>
  </div>
  
  <div class="cc-article-body">
REPLACE_ME
  </div>
</div>

</body>
</html>"""

final_html = template.replace('REPLACE_ME', html_content)
with open('namibia-weather-redesign.html', 'w') as f:
    f.write(final_html)

