#!/usr/bin/env python3
"""
Gondwana Collection photographs -> namibiarates, from Gondwana's own website.

    python3 tools/gondwana_photos_update.py          (from dt_library/; --dry to only report)

Source: tools/source/gondwana_site_photos.json — for each Gondwana property, the
photographs on its page on gondwana-collection.com, taken only from that
property's own image folder (read 23 Sep 2026; every link checked to load).

Updates, for each property that has photographs there:
  1. its lodge page  <region>-accommodation/<slug>/index.html
       og:image, the .hero background, and the hero-thumbs strip
  2. its card on the region index page (<region>-accommodation/index.html)
  3. assets/lodges-info.json  (imgs)
  4. the Gondwana group sheet ratesheets/gondwana_ratesheet_v3.html  (cover, images)

Nothing else on the pages is touched. Every edit is an exact, counted replacement;
a page whose markup does not match is reported and left alone.
"""
import io, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRY = '--dry' in sys.argv
SITE = json.load(io.open(os.path.join(ROOT, 'tools', 'source', 'gondwana_site_photos.json'), encoding='utf-8'))['photos']

# app slug (as in the source file) -> (lodges-info key, group-sheet key)
PROPS = {
    'okapuka_safari_lodge': ('okapukasafarilodge', 'okapuka'),
    'the_weinberg_windhoek': ('theweinbergwindhoek', 'weinberg'),
    'weinberg_urban_pod': ('weinbergurbanpod', 'weinbergpod'),
    'canyon_lodge': ('canyonlodge', 'canyonlodge'),
    'canyon_village': ('canyonvillage', 'canyonvillage'),
    'canyon_roadhouse': ('canyonroadhouse', 'canyonroadhouse'),
    'kalahari_anib_lodge': ('kalaharianiblodge', 'kalaharianib'),
    'kalahari_camping2go': ('kalaharicamping2go', 'kalaharic2g'),
    'kalahari_farmhouse': ('kalaharifarmhouse', 'kalaharifarm'),
    'reverie_kalahari_pod': ('reveriekalaharipod', 'reveriekalahari'),
    'namib_desert_lodge': ('namibdesertlodge', 'namibdesertlodge'),
    'namib_desert_camping2go': ('namibdesertcamping2go', 'namibdesertc2g'),
    'the_desert_grace': ('thedesertgrace', 'desertgrace'),
    'namib_dune_star_camp': ('namibdunestarcamp', 'namibdunestar'),
    'desert_whisper': ('desertwhisper', 'desertwhisper'),
    'the_delight_swakopmund': ('thedelightswakopmund', 'thedelight'),
    'the_pearls_beach_pods': ('thepearlsbeachpods', 'pearls'),
    'damara_mopane_lodge': ('damaramopanelodge', 'damaramopane'),
    'palmwag_lodge': ('palmwaglodge', 'palmwag'),
    'palmwag_camping2go': ('palmwagcamping2go', 'palmwagc2g'),
    'omarunga_epupa_falls_camp': ('omarungaepupafallscamp', 'omarunga'),
    'etosha_safari_lodge': ('etoshasafarilodge', 'etoshasafarilodge'),
    'etosha_safari_camp': ('etoshasafaricamp', 'etoshasafaricamp'),
    'etosha_safari_camping2go': ('etoshasafaricamping2go', 'etoshac2g'),
    'the_ekipa_etosha_pod': ('theekipaetoshapod', 'ekipapod'),
    'etosha_king_nehale': ('etoshakingnehale', 'etoshakingnehale'),
    'hakusembe_river_lodge': ('hakusemberiverlodge', 'hakusembe'),
    'hakusembe_camping2go': ('hakusembecamping2go', 'hakusembec2g'),
    'namushasha_river_lodge': ('namushashariverlodge', 'namushasha'),
    'namushasha_camping2go': ('namushashacamping2go', 'namushasharvc2g'),
    'namushasha_river_villa': ('namushasharivervilla', 'namushasharv'),
    'zambezi_mubala_camp': ('zambezimubalacamp', 'zambezimubalac'),
    'zambezi_mubala_lodge': ('zambezimubalalodge', 'zambezimubalal'),
    'chobe_river_camp': ('choberivercamp', 'choberivercamp'),
}

def sized(u, w):
    """HubSpot serves a resized copy from /hs-fs/hubfs/...?width=N (checked 23 Sep 2026)."""
    return u.replace('gondwana-collection.com/hubfs/', 'gondwana-collection.com/hs-fs/hubfs/', 1) + '?width=%d' % w

def full(u):
    return sized(u, 1920)

def thumb(u):
    return sized(u, 400)

LOG = []
def log(*a):
    LOG.append(' '.join(str(x) for x in a))

def read(p):
    return io.open(os.path.join(ROOT, p), encoding='utf-8').read()

def write(p, s):
    if not DRY:
        tmp = os.path.join(ROOT, p) + '.tmp'
        io.open(tmp, 'w', encoding='utf-8').write(s)
        os.replace(tmp, os.path.join(ROOT, p))

info = json.loads(read('assets/lodges-info.json'))
group = read('ratesheets/gondwana_ratesheet_v3.html')
region_pages = {}

for slug, (ikey, gkey) in PROPS.items():
    photos = SITE.get(slug) or []
    if not photos:
        log(slug, ': no photographs on gondwana-collection.com — left as is')
        continue
    cover = photos[0]

    # 3. lodges-info.json
    ent = info.get(ikey)
    if ent is None:
        log(slug, ': not in lodges-info.json')
    else:
        ent['imgs'] = [full(u) for u in photos]

    # 4. group sheet
    m = re.search(r'(?<![A-Za-z0-9_])' + re.escape(gkey) + r':\{name:"', group)
    if not m:
        log(slug, ': group sheet key', gkey, 'not found')
    else:
        start = m.start()
        end = group.index('tab1:', start)
        entry = group[start:end]
        new = entry
        n1 = len(re.findall(r'cover:"[^"]*"', new))
        n2 = len(re.findall(r'images:\[[^\]]*\]', new))
        if n1 == 1 and n2 == 1:
            new = re.sub(r'cover:"[^"]*"', lambda _: 'cover:' + json.dumps(full(cover)), new)
            new = re.sub(r'images:\[[^\]]*\]', lambda _: 'images:' + json.dumps([full(u) for u in photos]), new)
            group = group[:start] + new + group[end:]
        else:
            log(slug, ': group sheet entry shape not recognised (cover %d, images %d) — left' % (n1, n2))

    # 1. lodge page
    url = (ent or {}).get('url', '')
    if not url.startswith('/') or not os.path.exists(os.path.join(ROOT, url.strip('/'), 'index.html')):
        log(slug, ': no lodge page on namibiarates (', url or '-', ') — lodges-info and group sheet only')
        continue
    page = url.strip('/') + '/index.html'
    s = read(page)
    ref = re.search(r'http-equiv="refresh" content="0; url=(/[^"]+/)"', s)
    if ref and os.path.exists(os.path.join(ROOT, ref.group(1).strip('/'), 'index.html')):   # a moved page: follow it
        url = ref.group(1)
        page = url.strip('/') + '/index.html'
        s = read(page)
    o = s
    s, a = re.subn(r'(<meta property="og:image" content=")[^"]*(")', lambda m: m.group(1) + full(cover) + m.group(2), s, count=1)
    s, b = re.subn(r"(\.hero\{[^}]*?url\(')[^']*('\))", lambda m: m.group(1) + full(cover) + m.group(2), s, count=1)
    s, _ = re.subn(r"(var photo=')[^']*(')", lambda m: m.group(1) + full(cover) + m.group(2), s, count=1)
    i = s.find('<div class="hero-thumbs">')
    c = 0
    if i >= 0:
        j = s.index('</div>', i)
        imgs = ''.join('<img class="hero-thumb%s" src="%s" data-full="%s" alt="" loading="lazy" onerror="this.remove()">'
                       % (' active' if k == 0 else '', thumb(u), full(u)) for k, u in enumerate(photos))
        s = s[:i] + '<div class="hero-thumbs">' + imgs + s[j:]
        c = 1
    if (a, b, c) != (1, 1, 1):
        log(slug, ': page', page, 'og %d hero %d thumbs %d — partial' % (a, b, c))
    left = len(re.findall(r'wetu\.com/imageHandler', s))
    if left:
        log(slug, ': page still has %d other wetu image links (not in the hero)' % left)
    if s != o:
        write(page, s)

    # 2. region index card
    region = url.strip('/').split('/')[0]
    rp = region + '/index.html'
    if rp not in region_pages:
        region_pages[rp] = read(rp)
    r = region_pages[rp]
    pat = r'(<a class="card[^"]*"[^>]*href="' + re.escape(url) + r'"><div class="img" style="background-image:url\(\')[^\']*(\'\))'
    r2, n = re.subn(pat, lambda m: m.group(1) + full(cover) + m.group(2), r, count=1)
    if n != 1:
        log(slug, ': no card on', rp)
    region_pages[rp] = r2

for rp, r in region_pages.items():
    if r != read(rp):
        write(rp, r)
write('ratesheets/gondwana_ratesheet_v3.html', group)
write('assets/lodges-info.json', json.dumps(info, indent=0, ensure_ascii=False))   # the file's own format

print(('DRY RUN — ' if DRY else '') + 'done')
print('\n'.join(LOG) or 'no notes')
