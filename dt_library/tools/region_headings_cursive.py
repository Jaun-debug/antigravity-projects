#!/usr/bin/env python3
"""Region pages: bigger area headings and a script-font accent now and then.
- .area-h headings double size; '&' in them set in script; on every second heading without '&', the last word in script.
- A script kicker with the region name (from the page's h1, minus 'Accommodation') above the Lodges heading.
Font: Pinyon Script (Google Fonts). Rollback: <page>.bak_cursive"""
import glob, io, os, re, shutil
MARK = 'CURSIVE-ACCENTS'
HEAD = ('<!-- %s -->\n<link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap" rel="stylesheet">\n<style>\n'
        '.cur{font-family:"Pinyon Script",cursive;text-transform:none;letter-spacing:0;font-weight:400;font-size:1.3em;line-height:1;color:var(--brand-accent,#a48256)}\n'
        '.area-h{font-size:2.3rem!important;line-height:1.2;padding-bottom:12px!important;margin:0 0 22px!important}\n'
        '.cur-kicker{display:inline;font-family:"Pinyon Script",cursive;text-transform:none;letter-spacing:0;font-weight:400;font-size:1.15em;line-height:1;color:var(--brand-accent,#a48256);margin:0 0 0 .1em}\n'
        '@media(max-width:760px){.area-h{font-size:1.6rem!important}}\n</style>\n<!-- /%s -->\n') % (MARK, MARK)
n = 0
for p in sorted(glob.glob('*-accommodation/index.html')):
    s = io.open(p, encoding='utf-8').read()
    if MARK in s: continue
    shutil.copy(p, p + '.bak_cursive')
    s = s.replace('</head>', HEAD + '</head>', 1)
    k = [0]
    def area(m):
        t = m.group(1)
        if '&amp;' in t:
            t = t.replace(' &amp; ', ' <span class="cur">&amp;</span> ')
        else:
            k[0] += 1
            if k[0] % 2 == 0:
                w = t.rsplit(' ', 1)
                t = (w[0] + ' <span class="cur">%s</span>' % w[1]) if len(w) == 2 else '<span class="cur">%s</span>' % t
        return '<h3 class="area-h">%s</h3>' % t
    s = re.sub(r'<h3 class="area-h">(.*?)</h3>', area, s)
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S)
    region = re.sub(r'\s*Accommodation\s*$', '', h1.group(1).strip()) if h1 else ''
    for h in ('<h2>Lodges</h2>', '<h2>Featured lodges</h2>'):
        if region and s.count(h) == 1:
            s = s.replace(h, h[:-5] + ' <span class="cur-kicker">in %s</span>' % region + h[-5:], 1)
    io.open(p + '.tmp', 'w', encoding='utf-8').write(s); os.replace(p + '.tmp', p); n += 1
print('pages', n)
