#!/usr/bin/env python3
"""Region cards with no photo: use the lodge's first photo already on the site
(assets/lodges-info.json imgs, else the lodge page's hero / first gallery image). Nothing new is downloaded."""
import re, glob, json, html, io, os
info = json.load(io.open('assets/lodges-info.json', encoding='utf-8'))
def unesc(t):
    while html.unescape(t) != t: t = html.unescape(t)
    return t
norm = lambda n: re.sub(r'[^a-z0-9]', '', unesc(n).lower())
n = 0
for p in sorted(glob.glob('*-accommodation/index.html')):
    s = io.open(p, encoding='utf-8').read()
    def fix(m):
        global n
        href, img, rest = m.group(1), m.group(2) or '', m.group(3)
        if 'url(' in img: return m.group(0)
        name = re.search(r'<h3>(.*?)</h3>', rest, re.S).group(1)
        src = (info.get(norm(name), {}).get('imgs') or [None])[0]
        if not src:
            try: ps = io.open(href.strip('/') + '/index.html', encoding='utf-8').read()
            except OSError: ps = ''
            h = re.search(r'class="hero" style="[^"]*url\(\'?([^\')]+)', ps) or re.search(r'data-full="([^"]+)"', ps)
            src = h and h.group(1)
        if not src: return m.group(0)
        n += 1
        return '%s href="%s"><div class="img" style="background-image:url(\'%s\')">%s' % (m.group(0).split(' href=')[0], href, src, rest)
    s2 = re.sub(r'(?s)<a class="card[^"]*" data-name="[^"]*" href="([^"]+)"><div class="img"( style="[^"]*")?>(.*?</a>)', fix, s)
    if s2 != s:
        io.open(p + '.tmp', 'w', encoding='utf-8').write(s2); os.replace(p + '.tmp', p)
print('cards given a photo', n)
