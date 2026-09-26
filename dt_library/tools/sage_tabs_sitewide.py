#!/usr/bin/env python3
"""Season buttons and side tabs: orange (rgba 200,90,23) -> the sage used by the header pills and side tabs
(rgba 135,169,150). Exact-snippet replacements only; other orange accents are left alone."""
import io, os, glob
SEASON_OLD = "border:1px solid rgba(200,90,23,.6);background:'+(on?'rgba(200,90,23,.6)':'rgba(200,90,23,.08)')+';color:'+(on?'#fff':'#c85a17')"
SEASON_NEW = "border:1px solid rgba(135,169,150,.7);background:'+(on?'rgba(135,169,150,.88)':'rgba(135,169,150,.10)')+';color:'+(on?'#fff':'#5f7f72')"
SIDE = [  # builder + itinerary side tabs
    ("{background:rgba(200,90,23,.6)!important;-webkit-backdrop-filter:blur(12px)!important", "{background:rgba(135,169,150,.88)!important;-webkit-backdrop-filter:blur(12px)!important"),
    ("{background:rgba(200,90,23,.82)!important;transform:translateX(-7px)!important}", "{background:rgba(115,152,131,.95)!important;transform:translateX(-7px)!important}"),
    ("{background:rgba(200,90,23,.82)!important;filter:none!important;transform:translateX(-7px)!important", "{background:rgba(115,152,131,.95)!important;filter:none!important;transform:translateX(-7px)!important"),
    (".top-actions>*:nth-child(5){background:rgba(200,90,23,.6)!important", ".top-actions>*:nth-child(5){background:rgba(135,169,150,.88)!important"),
]
YEAR_OLD = "border:1px solid rgba(200,90,23,.6);background:'+(on?'rgba(200,90,23,.85)'"
YEAR_NEW = "border:1px solid rgba(135,169,150,.7);background:'+(on?'rgba(135,169,150,.88)'"
files = [f for f in glob.glob('**/*.html', recursive=True) if '.bak' not in f and not f.startswith('node_modules')]
tot = {}
for f in files:
    s = io.open(f, encoding='utf-8').read(); o = s
    s = s.replace(SEASON_OLD, SEASON_NEW)
    if f in ('builder/index.html', 'itinerary/index.html'):
        for a, b in SIDE: s = s.replace(a, b)
        s = s.replace(YEAR_OLD, YEAR_NEW)
    if s != o:
        io.open(f + '.tmp', 'w', encoding='utf-8').write(s); os.replace(f + '.tmp', f); tot[f] = 1
print(len(tot), 'files changed')
