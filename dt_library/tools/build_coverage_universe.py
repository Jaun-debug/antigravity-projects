#!/usr/bin/env python3
"""
Build assets/rate-coverage-universe.json — the CATALOG of every property the
site presents (what *should* have rates), by region and category.

This file is deliberately NOT a rate-status file. It carries no "has rack / has
sto" flags. Rate presence is derived LIVE from the rack + STO APIs by the
progress tracker (tools/rate-progress.html), so it can never go stale. The only
thing stored here is which properties exist and where they sit — catalog
structure that changes only when a page is added.

Regenerate on every deploy:  python3 tools/build_coverage_universe.py
Run from the dt_library/ root (or anywhere; paths are resolved from this file).
"""
import json, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # dt_library/

# Region label overrides where simple title-casing is wrong.
REGION_OVERRIDES = {
    "luderitz": "Lüderitz",
}

def region_label(prefix: str) -> str:
    key = prefix[:-len("-accommodation")] if prefix.endswith("-accommodation") else prefix
    if key in REGION_OVERRIDES:
        return REGION_OVERRIDES[key]
    return " ".join(w.capitalize() for w in key.split("-"))

def title_from_slug(slug: str) -> str:
    return " ".join(w.capitalize() for w in slug.replace("_", "-").split("-"))

CAMP_RE = re.compile(r"\b(camping|campsite|camp site|rest camp|caravan)\b", re.I)
def lodge_category(name: str, slug: str) -> str:
    hay = (name or "") + " " + (slug or "")
    return "Camping" if CAMP_RE.search(hay) else "Lodge"

def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (name or "").lower()).strip("-")
    return s

def load_lodge_names() -> dict:
    """slug (from url last segment) -> display name, from lodges-info.json."""
    path = os.path.join(ROOT, "assets", "lodges-info.json")
    out = {}
    try:
        info = json.load(open(path, encoding="utf-8"))
    except Exception:
        return out
    for _, v in info.items():
        url = (v or {}).get("url", "") or ""
        slug = url.rstrip("/").split("/")[-1]
        if slug and v.get("name"):
            out[slug] = v["name"]
    return out

def build():
    names = load_lodge_names()
    props = []
    seen = set()

    # --- Accommodation: every <region>-accommodation/<slug>/index.html page ---
    for idx in glob.glob(os.path.join(ROOT, "*-accommodation", "*", "index.html")):
        rel = os.path.relpath(idx, ROOT)
        parts = rel.split(os.sep)
        if len(parts) < 3:
            continue
        prefix, slug = parts[0], parts[1]
        if slug in seen:
            continue
        seen.add(slug)
        name = names.get(slug) or title_from_slug(slug)
        props.append({
            "slug": slug,
            "name": name,
            "region": region_label(prefix),
            "category": lodge_category(name, slug),
        })

    # --- Non-lodge suppliers from the builder feed (providers.json) ---
    prov_path = os.path.join(ROOT, "assets", "providers.json")
    try:
        prov = json.load(open(prov_path, encoding="utf-8"))
    except Exception:
        prov = {}
    for key, cat in (("activities", "Activity"), ("vehicles", "Vehicle"), ("flights", "Flight")):
        for entry in prov.get(key, []) or []:
            nm = (entry or {}).get("name", "")
            if not nm:
                continue
            slug = "prov-" + slugify(nm)
            if slug in seen:
                continue
            seen.add(slug)
            props.append({
                "slug": slug,
                "name": nm,
                "region": (entry or {}).get("region", "") or "",
                "category": cat,
            })

    props.sort(key=lambda p: (p["category"] != "Lodge", p["region"], p["name"].lower()))
    regions = sorted({p["region"] for p in props if p["category"] in ("Lodge", "Camping") and p["region"]})

    manifest = {
        "note": ("Catalog of properties the site presents (what should have rates), by region "
                 "and category. NO rate-status flags live here — the tracker derives rack/STO "
                 "presence live from /api/rack and /api/sto. Regenerate on deploy: "
                 "python3 tools/build_coverage_universe.py"),
        "counts": {
            "total": len(props),
            "lodges": sum(1 for p in props if p["category"] in ("Lodge", "Camping")),
            "activities": sum(1 for p in props if p["category"] == "Activity"),
            "vehicles": sum(1 for p in props if p["category"] == "Vehicle"),
            "flights": sum(1 for p in props if p["category"] == "Flight"),
        },
        "regions": regions,
        "properties": props,
    }
    out_path = os.path.join(ROOT, "assets", "rate-coverage-universe.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
    print("wrote", os.path.relpath(out_path, ROOT))
    print("counts:", manifest["counts"])
    print("regions:", len(regions))
    return manifest

if __name__ == "__main__":
    build()
