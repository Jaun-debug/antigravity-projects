import re

html = open('/tmp/weather_page.html').read()
match = re.search(r'<div class="u-blog-control u-post-content u-text u-text-grey-50 u-text-2">(.*?)</div></div></div></div>', html, re.DOTALL)
if match:
    open('parsed_weather.html', 'w').write(match.group(1))
