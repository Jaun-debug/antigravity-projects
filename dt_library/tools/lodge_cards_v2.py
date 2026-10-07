#!/usr/bin/env python3
"""Region pages: lodge cards in the editorial layout (photo on top, area label, serif name, one-line description, text link).
    cd dt_library && python3 tools/lodge_cards_v2.py
Description = the lodge's `lead` from assets/lodges-info.json (omitted if none). Rollback: <page>.bak_cards.
"""
import glob, html, io, json, os, re, shutil
MARK = 'LODGE-CARDS-V2'
info = json.load(io.open('assets/lodges-info.json', encoding='utf-8'))
norm = lambda n: re.sub(r'[^a-z0-9]', '', n.lower())
CSS = '''<!-- %s -->
<style>
.grid a.card{background:#fff;border-radius:0;box-shadow:none;border:0;overflow:visible}
.grid a.card:hover{transform:none;box-shadow:none;border:0}
.grid a.card .img{height:auto;aspect-ratio:4/3;border-radius:2px;overflow:hidden}
.grid a.card .img::after{display:none}
.grid a.card:hover .img{transform:none;filter:brightness(1.04)}
.grid a.card .body{padding:18px 18px 20px;text-align:left;align-items:flex-start;gap:0}
.grid a.card .body p.area{font-family:var(--font-body);font-size:.7rem;letter-spacing:2px;text-transform:uppercase;color:var(--text-muted);margin:0 0 8px}
.grid a.card .body h3{position:static;display:block;margin:0 0 10px;padding:0;text-align:left;color:#2f2924;font-family:var(--font-head);font-size:1.45rem;font-weight:400;line-height:1.25;letter-spacing:.5px;text-shadow:none;transition:color .3s}
.grid a.card .body p.desc{font-family:var(--font-body);font-size:.92rem;line-height:1.6;color:#6f675f;margin:0 0 14px;text-transform:none;letter-spacing:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.grid a.card .go{padding:0;border:0;border-radius:0;background:none;color:#2f2924;font-family:var(--font-body);font-size:.88rem;text-transform:none;letter-spacing:.3px;transition:color .3s}
.grid a.card:hover h3,.grid a.card:hover .go{color:var(--brand-accent);background:none}
</style>
<!-- /%s -->
''' % (MARK, MARK)
tot = nodesc = 0
for p in sorted(glob.glob('*-accommodation/index.html')):
    s = io.open(p, encoding='utf-8').read()
    if MARK in s: continue
    def fix(m):
        global tot, nodesc
        c = m.group(0)
        h = re.search(r'<h3>(.*?)</h3>', c, re.S)
        assert h, c[:200]
        c = c.replace(h.group(0), '', 1)
        lead = (info.get(norm(html.unescape(h.group(1)))) or {}).get('lead') or ''
        if not lead: nodesc += 1
        desc = '<p class="desc">%s</p>' % html.escape(lead, quote=False) if lead else ''
        c, n = re.subn(r'<div class="body"><p>(.*?)</p>', lambda b: '<div class="body"><p class="area">%s</p>%s%s' % (b.group(1), h.group(0), desc), c, 1, re.S)
        assert n == 1, c[:300]
        tot += 1
        return c
    s2 = re.sub(r'<a class="card[^"]*"[^>]*>.*?</a>', fix, s, flags=re.S)
    assert s2.count('</head>') == 1
    s2 = s2.replace('</head>', CSS + '</head>')
    shutil.copy(p, p + '.bak_cards')
    io.open(p + '.tmp', 'w', encoding='utf-8').write(s2); os.replace(p + '.tmp', p)
print('cards', tot, 'without description', nodesc)
