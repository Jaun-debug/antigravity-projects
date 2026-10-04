#!/usr/bin/env python3
"""Ongava renames per Ongava's 2026/2027 STO20 price lists (4 Oct 2026):
Ongava Tented Camp -> Encounter, Little Ongava -> Horizon. Slugs/URLs unchanged.
Name-keyed lookups (lodges-info, lodge-info, nightsbridge-bbids, __nrBBIDS) get the new key added beside the old."""
import io, json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
OLD = {'Ongava Tented Camp': 'Encounter', 'Little Ongava': 'Horizon'}
NK = {'ongavatentedcamp': 'encounter', 'littleongava': 'horizon'}
def rd(f): return io.open(f, encoding='utf-8').read()
def wr(f, s):
    t = f + ('.tmp.js' if f.endswith('.js') else '.tmp'); io.open(t, 'w', encoding='utf-8').write(s)
    if f.endswith('.js'): subprocess.check_call(['node', '--check', t])
    if f.endswith('.json'): json.loads(s)
    os.replace(t, f)
files = subprocess.check_output(['git', 'ls-files'], text=True).split('\n')
files = [f for f in files if f and not re.search(r'\.bak|/originals/|^tools/|\.pdf$|\.png$|\.jpe?g$|\.webp$', f) and os.path.isfile(f)]
changed = []
for f in files:
    try: s = rd(f)
    except Exception: continue
    if not any(o in s for o in OLD) and not any(k in s for k in NK): continue
    s0 = s
    # loader notes / sheet sentence: say what it used to be called
    s = s.replace(' The camp now trades as Encounter by Ongava.', ' @@F1@@')
    s = s.replace(' The camp now trades as Horizon by Ongava.', ' @@F2@@')
    s = s.replace(' Ongava Tented Camp now trades as Encounter by Ongava.', ' @@F1@@')
    s = s.replace(' Little Ongava now trades as Horizon by Ongava.', ' @@F2@@')
    s = s.replace('(Ongava Lodge, Ongava Tented Camp = Encounter,', '(Ongava Lodge, Encounter = ex Ongava Tented Camp,')
    s = s.replace('Anderssons at Ongava, Little Ongava = Horizon)', 'Anderssons at Ongava, Horizon = ex Little Ongava)')
    if f == 'assets/nightsbridge-bbids.json':
        pass  # bbname is NightsBridge's own name; keys added below
    else:
        for o, n in OLD.items(): s = s.replace(o, n)
    s = s.replace('@@F1@@', 'Formerly Ongava Tented Camp.').replace('@@F2@@', 'Formerly Little Ongava.')
    # name-normalised id maps inside sheets: add the new key beside the old
    for o, n in NK.items():
        s = re.sub(r'"%s":"(\d+)"' % o, lambda m: '"%s":"%s","%s":"%s"' % (o, m.group(1), n, m.group(1)) if '"%s":' % n not in s else m.group(0), s)
    if s != s0: wr(f, s); changed.append(f)
# JSON maps keyed by normalised / lower-cased name
for f, keys in (('assets/lodges-info.json', NK), ('assets/lodge-info.json', {'ongava tented camp': 'encounter', 'little ongava': 'horizon'}),
                ('assets/nightsbridge-bbids.json', NK)):
    if not os.path.exists(f): continue
    d = json.loads(rd(f)); hit = 0
    tgt = d.get('lodges', d) if isinstance(d, dict) else d
    if isinstance(tgt, dict):
        for o, n in keys.items():
            if o in tgt and n not in tgt: tgt[n] = tgt[o]; hit += 1
    if hit:
        s = rd(f); indent = 0 if True else 2 if s.startswith('{\n  ') else (1 if s.startswith('{\n ') else None)
        wr(f, json.dumps(d, ensure_ascii=False, indent=indent) + ('\n' if s.endswith('\n') else ''))
        if f not in changed: changed.append(f)
    print(f, 'keys added:', hit)
print('\n'.join(sorted(changed)))
left = subprocess.run(['git', 'grep', '-l', '-e', 'Ongava Tented Camp', '-e', 'Little Ongava', '--', '.', ':!*.bak*', ':!tools/*', ':!ratesheets/originals/*'], capture_output=True, text=True).stdout
print('old names still in:', left or 'none')
