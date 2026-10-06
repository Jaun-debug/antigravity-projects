#!/usr/bin/env python3
"""Kwando camp photos: each camp's own photos from the Kwando Agent Zone Drive (5. Images & Videos -> 1. Kwando Camps),
fetched 6 Oct 2026 as 1920-px renditions (archive kwando_photos_2027.tar, manifest.tsv maps each file to its Drive id and path).

    cd dt_library && python3 tools/kwando_photos_2027.py <extracted-archive-dir>

Writes media/kwando/<slug>/NN.jpg (1920x1080 crop) and NN-t.jpg (400x260 crop), then puts them in both places the site reads:
the inline lodge page (hero + hero-thumbs) and assets/lodges-info.json; also the region cards, the Kwando group sheet and
the Moremi Air hero on flight_rates.html. Portrait shots, close-ups and one failed download are left out (DROP).
"""
import io, json, os, re, sys
from PIL import Image

SRC = sys.argv[1]
ROOT = os.getcwd()
P = lambda f: os.path.join(ROOT, f)
rd = lambda f: io.open(P(f), encoding='utf-8').read()
def wr(f, s):
    t = P(f) + '.tmp'; io.open(t, 'w', encoding='utf-8').write(s); os.replace(t, P(f))
def once(s, old, new):
    assert s.count(old) == 1, (old[:80], s.count(old)); return s.replace(old, new)

FOLDER = {'kwando-kwara': 'okavango-delta-accommodation', 'kwando-splash': 'okavango-delta-accommodation', 'kwando-4-rivers': 'okavango-delta-accommodation',
          'kwando-mma-dinare': 'okavango-delta-accommodation', 'kwando-rra-dinare': 'okavango-delta-accommodation', 'kwando-pom-pom': 'okavango-delta-accommodation',
          'kwando-moremi-crossing': 'okavango-delta-accommodation', 'kwando-lagoon': 'linyanti-savuti-accommodation', 'kwando-lebala': 'linyanti-savuti-accommodation',
          'kwando-nxai-pan': 'makgadikgadi-accommodation', 'kwando-tau-pan': 'botswana-accommodation'}
NAME = {'kwando-kwara': 'Kwara Camp', 'kwando-splash': 'Splash Camp', 'kwando-4-rivers': '4 Rivers Camp', 'kwando-mma-dinare': 'Mma Dinare',
        'kwando-rra-dinare': 'Rra Dinare', 'kwando-pom-pom': 'Pom Pom Camp', 'kwando-moremi-crossing': 'Moremi Crossing', 'kwando-lagoon': 'Lagoon Camp',
        'kwando-lebala': 'Lebala Camp', 'kwando-nxai-pan': 'Nxai Pan Camp', 'kwando-tau-pan': 'Tau Pan Camp'}
DROP = {'kwando-4-rivers': ['03', '07'], 'kwando-lebala': ['03', '07'], 'kwando-lagoon': ['08'],
        'kwando-moremi-crossing': ['03', '04'], 'kwando-nxai-pan': ['04']}   # portrait / close-up / one HTTP 429 instead of an image
ORIG = '/ratesheets/originals/kwando/kwando_2027_sto.pdf'

man = {}
for line in io.open(os.path.join(SRC, 'manifest.tsv'), encoding='utf-8'):
    nm, fid, path = line.rstrip('\n').split('\t'); man[nm] = (fid, path)

def crop(im, w, h):
    im = im.convert('RGB'); r = w / h; W, H = im.size
    if W / H > r:
        nw = int(H * r); im = im.crop(((W - nw) // 2, 0, (W - nw) // 2 + nw, H))
    else:
        nh = int(W / r); im = im.crop((0, (H - nh) // 2, W, (H - nh) // 2 + nh))
    return im.resize((w, h), Image.LANCZOS)

IMGS = {}
for slug in FOLDER:
    out = 'media/kwando/%s' % slug
    os.makedirs(P(out), exist_ok=True)
    keep = []
    for n in range(1, 9):
        nn = '%02d' % n
        if nn in DROP.get(slug, []):
            continue
        src = os.path.join(SRC, slug, nn + '.jpg')
        im = Image.open(src); im.load()
        assert im.format == 'JPEG' and im.size[0] >= 1500, (src, im.format, im.size)
        assert ('%s/%s.jpg' % (slug, nn)) in man
        crop(im, 1920, 1080).save(P('%s/%s.jpg' % (out, nn)), 'JPEG', quality=78, optimize=True, progressive=True)
        crop(im, 400, 260).save(P('%s/%s-t.jpg' % (out, nn)), 'JPEG', quality=78, optimize=True)
        keep.append(nn)
    IMGS[slug] = keep
    print(slug, len(keep), 'photos')

full = lambda s, n: '/media/kwando/%s/%s.jpg' % (s, n)
thumb = lambda s, n: '/media/kwando/%s/%s-t.jpg' % (s, n)

# lodge pages: hero image + thumbnails
GRAD = '<div class="hero" style="background:linear-gradient(135deg,#6b5844,#2f2519)">'
for slug, keep in IMGS.items():
    f = '%s/%s/index.html' % (FOLDER[slug], slug)
    s = rd(f)
    s = once(s, GRAD, '<div class="hero" style="background:#2b2b2b url(\'%s\') center/cover no-repeat">' % full(slug, keep[0]))
    th = ''.join('<img class="hero-thumb%s" src="%s" data-full="%s" alt="" loading="lazy" onerror="this.remove()">'
                 % (' active' if i == 0 else '', thumb(slug, n), full(slug, n)) for i, n in enumerate(keep))
    s = once(s, '<span class="scroll-cue" aria-hidden="true"></span></a><a class="hero-back"',
             '<span class="scroll-cue" aria-hidden="true"></span></a><div class="hero-thumbs">%s</div><a class="hero-back"' % th)
    wr(f, s)

# lodges-info.json (indent=0)
raw = rd('assets/lodges-info.json'); info = json.loads(raw)
assert json.dumps(info, indent=0, ensure_ascii=False) == raw
for slug, keep in IMGS.items():
    k = re.sub(r'[^a-z0-9]', '', NAME[slug].lower())
    assert info[k]['url'] == '/%s/%s/' % (FOLDER[slug], slug)
    info[k]['imgs'] = [full(slug, n) for n in keep]
    info[k]['orig'] = ORIG
wr('assets/lodges-info.json', json.dumps(info, indent=0, ensure_ascii=False))

# region cards
CARD_GRAD = 'href="/%s/%s/"><div class="img" style="background-image:linear-gradient(160deg,#4a5a44,#243021)">'
for folder in sorted(set(FOLDER.values())):
    f = folder + '/index.html'; s = rd(f)
    for slug in [x for x in FOLDER if FOLDER[x] == folder]:
        s = once(s, CARD_GRAD % (folder, slug), 'href="/%s/%s/"><div class="img" style="background-image:url(\'%s\')">' % (folder, slug, full(slug, IMGS[slug][0])))
    wr(f, s)

# group sheet
G = 'ratesheets/kwando_ratesheet_v3.html'; s = rd(G)
for slug, keep in IMGS.items():
    k = re.sub(r'[^a-z0-9]', '', NAME[slug].lower())
    a = s.index('    "%s": {' % k) if ('    "%s": {' % k) in s else s.index('    %s: {' % k)
    b = s.index('shortDesc:', a)
    seg = s[a:b]
    new = seg.replace('cover: "",', 'cover: "%s",' % full(slug, keep[0])).replace('images: [],', 'images: [%s],' % ', '.join('"%s"' % full(slug, n) for n in keep))
    assert new != seg
    s = s[:a] + new + s[b:]
s = once(s, 'background:linear-gradient(135deg,#6b5844,#2f2519)!important', "background:#2b2b2b url('%s') center/cover no-repeat!important" % full('kwando-kwara', IMGS['kwando-kwara'][0]))
wr(G, s)

# Moremi Air hero on the Flights page
fr = rd('flight_rates.html')
fr = once(fr, '          var HERO_IMG={\n', "          var HERO_IMG={\n            moremiair:'%s',\n" % full('kwando-kwara', IMGS['kwando-kwara'][0]))
wr('flight_rates.html', fr)
print('photos: %d camps, %d photos; pages, lodges-info, region cards, group sheet, flight hero' % (len(IMGS), sum(len(v) for v in IMGS.values())))
