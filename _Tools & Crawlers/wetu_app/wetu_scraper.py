#!/usr/bin/env python3
"""
wetu_scraper.py  —  Wetu Discovery itinerary scraper
=====================================================
Calls Wetu's own JSON API directly (inside a browser session for auth),
so it is fast, reliable, and never breaks on React rendering.

Two public functions used by server.py:
  scrape_text(url)    → day-by-day text per destination
  scrape_photos(url)  → unique photo URLs per destination

Wetu API endpoints discovered:
  /API/Itinerary/Basic/v2/Get/{guid}             — text + structure
  /API/Itinerary/Basic/v2/GetExtendedContent/{guid} — descriptions + photos
"""

import asyncio
import hashlib
import json
import re
import random
import csv
import argparse
from pathlib import Path
from datetime import datetime

from playwright.async_api import async_playwright

# ─────────────────────────────────────────────────────────────────────────────
# PHOTO LIMITS  (tweak these numbers freely)
#   All lists are de-duplicated first, then capped to the limit.
#   Set a limit to 0 (or None) to mean "no cap".
# ─────────────────────────────────────────────────────────────────────────────
PHOTO_LIMIT_DESTINATION   = 10   # destination gallery photos (per stop)
PHOTO_LIMIT_ACCOMMODATION = 10   # accommodation gallery photos (per lodge/stop)
PHOTO_LIMIT_ROOM          = 6    # photos per room type / category
PHOTO_LIMIT_RESTAURANT    = 6    # photos per restaurant


def _cap_photos(urls, limit):
    """De-duplicate a list of photo URLs and cap it to `limit` (0/None = no cap)."""
    deduped = _dedup_photos(urls or [])
    if limit and limit > 0:
        return deduped[:limit]
    return deduped


# ─────────────────────────────────────────────────────────────────────────────
# STEALTH CONFIG
# ─────────────────────────────────────────────────────────────────────────────

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
]

STEALTH_JS = """
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', {
        get: () => { const a=[1,2,3,4,5]; a.item=()=>null; return a; }
    });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US','en'] });
    window.chrome = { runtime: { connect:()=>{}, sendMessage:()=>{} } };
"""

HTTP_HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "max-age=0",
}


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _extract_guid(url: str) -> str:
    """Pull the Wetu itinerary GUID out of any Wetu URL."""
    m = re.search(
        r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}",
        url,
    )
    return m.group(0) if m else ""


async def _human_pause(lo: int = 500, hi: int = 1500):
    await asyncio.sleep(random.uniform(lo, hi) / 1000)


async def _make_context(playwright):
    browser = await playwright.chromium.launch(
        headless=True,
        args=[
            "--no-sandbox",
            "--disable-blink-features=AutomationControlled",
            "--disable-dev-shm-usage",
        ],
    )
    context = await browser.new_context(
        user_agent=random.choice(USER_AGENTS),
        viewport={"width": random.randint(1366, 1920), "height": 900},
        locale="en-US",
        timezone_id="Africa/Johannesburg",
        extra_http_headers=HTTP_HEADERS,
    )
    await context.add_init_script(STEALTH_JS)
    return browser, context


async def _call_wetu_api(page, endpoint_url: str) -> dict:
    """
    Call a Wetu API endpoint from inside the browser page
    (inherits the session cookies set during page load).
    Returns the parsed JSON dict, or {} on failure.
    """
    print(f"  → Calling API: {endpoint_url}")
    try:
        result = await page.evaluate(
            """async (url) => {
                try {
                    const r = await fetch(url, {
                        headers: {
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });
                    if (!r.ok) return {__error: r.status};
                    return await r.json();
                } catch(e) {
                    return {__error: String(e)};
                }
            }""",
            endpoint_url,
        )
        if isinstance(result, dict) and "__error" in result:
            print(f"  ⚠ API error: {result['__error']}")
            return {}
        print(f"  ✓ Got {len(str(result)):,} chars from API")
        return result or {}
    except Exception as e:
        print(f"  ⚠ page.evaluate error: {e}")
        return {}


def _clean(val):
    """Strip HTML tags and excessive whitespace from a string."""
    if not val:
        return ""
    if isinstance(val, list):
        return [_clean(v) for v in val if v]
    s = str(val)
    s = re.sub(r"<[^>]+>", " ", s)       # strip HTML tags
    s = re.sub(r"&nbsp;", " ", s)
    s = re.sub(r"&amp;", "&", s)
    s = re.sub(r"&lt;", "<", s)
    s = re.sub(r"&gt;", ">", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _is_real_photo(url: str) -> bool:
    if not url or not url.startswith("http"):
        return False
    u = url.lower()
    skip = [".svg", "/icon", "/logo", "favicon", "spinner", "placeholder",
            "blank.gif", "1x1", "pixel", "tracking", "avatar", "sprite",
            ".woff", ".ttf", ".eot", "font-"]
    if any(p in u for p in skip):
        return False
    has_ext = any(e in u for e in [".jpg", ".jpeg", ".png", ".webp"])
    is_cdn  = "wetu" in u or "wetucontent" in u
    return has_ext or is_cdn


def _image_hash(url: str) -> str:
    clean = url.split("?")[0].split("#")[0].strip()
    return hashlib.md5(clean.encode()).hexdigest()


def _extract_photos_from_obj(obj, out: list, depth=0):
    """Recursively find image URLs anywhere in a JSON object."""
    if depth > 8:
        return
    if isinstance(obj, str) and _is_real_photo(obj):
        out.append(obj)
    elif isinstance(obj, list):
        for item in obj:
            _extract_photos_from_obj(item, out, depth + 1)
    elif isinstance(obj, dict):
        for v in obj.values():
            _extract_photos_from_obj(v, out, depth + 1)


# ─────────────────────────────────────────────────────────────────────────────
# PARSE WETU /Get API  →  text stops
# ─────────────────────────────────────────────────────────────────────────────

def _parse_basic(data: dict) -> tuple:
    """
    Parse /API/Itinerary/Basic/v2/Get/{guid} response.
    Returns (title, stops_list).

    ACTUAL Wetu structure (verified from live API):
      data.name            → itinerary title (string)
      data.destinations    → DICT keyed by destination ID string
      data.accommodations  → DICT keyed by accommodation ID string
      data.days            → INTEGER (total days), NOT an array
      data.trip_summary.legs → ARRAY of leg objects (the actual schedule)

    Each leg:
      leg.destination_id   → int, key into destinations dict
      leg.accommodation_id → int, key into accommodations dict
      leg.nights           → int
      leg.start_date       → "3 Sep 2026"
      leg.end_date         → "6 Sep 2026"
      leg.rooms            → [{"id":"...","name":"1x Luxury Safari Tent"}]
      leg.basis            → [{"room_basis_label":"Fully Inclusive...","room_basis_code":"FI",...}]
      leg.type             → "Standard" or "Flight" etc.

    Each destination (in the destinations dict):
      name, category, latitude, longitude, images, activities, restaurants, rooms, ...

    Each accommodation (in the accommodations dict):
      name, category, rating, room_count, spoken_languages, special_interests,
      activities, restaurants, rooms, images, ...
    """
    title = _clean(data.get("name") or "Untitled Itinerary")

    # destinations and accommodations are dicts keyed by ID string
    destinations_dict  = data.get("destinations")  or {}
    accommodations_dict = data.get("accommodations") or {}

    # Ensure they're dicts (guard against unexpected types)
    if not isinstance(destinations_dict, dict):
        destinations_dict = {}
    if not isinstance(accommodations_dict, dict):
        accommodations_dict = {}

    # Schedule lives in trip_summary.legs
    trip_summary = data.get("trip_summary") or {}
    if not isinstance(trip_summary, dict):
        trip_summary = {}
    legs = trip_summary.get("legs") or []
    if not isinstance(legs, list):
        legs = []

    stops = []
    for i, leg in enumerate(legs):
        if not isinstance(leg, dict):
            continue

        # Skip non-accommodation legs (flights, transfers, etc.)
        leg_type = (leg.get("type") or "").lower()
        if leg_type in ("flight", "transfer", "cruise") or not leg.get("accommodation_id"):
            continue

        dest_id  = str(leg.get("destination_id")  or "")
        accom_id = str(leg.get("accommodation_id") or "")

        dest  = destinations_dict.get(dest_id)  or {}
        accom = accommodations_dict.get(accom_id) or {}

        if not isinstance(dest,  dict): dest  = {}
        if not isinstance(accom, dict): accom = {}

        # Board basis — from the basis array in the leg
        basis_list = leg.get("basis") or []
        board_basis = ""
        drinks_basis = ""
        if isinstance(basis_list, list) and basis_list:
            b0 = basis_list[0] if isinstance(basis_list[0], dict) else {}
            board_basis  = _clean(b0.get("room_basis_label")   or b0.get("room_basis_code")   or "")
            drinks_basis = _clean(b0.get("drinks_basis_label") or b0.get("drinks_basis_code") or "")

        # Room type — from the rooms array in the leg
        leg_rooms = leg.get("rooms") or []
        room_type = ""
        if isinstance(leg_rooms, list) and leg_rooms:
            r0 = leg_rooms[0] if isinstance(leg_rooms[0], dict) else {}
            room_type = _clean(r0.get("name") or "")

        # Special interests / activities at accommodation level
        special_interests = accom.get("special_interests") or []
        if not isinstance(special_interests, list):
            special_interests = []

        spoken_languages = accom.get("spoken_languages") or []
        if not isinstance(spoken_languages, list):
            spoken_languages = []

        # Images (stored as relative paths — prefix with Wetu CDN base)
        dest_images  = _build_image_urls(dest.get("images")  or [])
        accom_images = _build_image_urls(accom.get("images") or [])

        stop = {
            "stop_index":        i + 1,
            # Internal IDs kept for _parse_extended to match by ID (stripped before output)
            "_dest_id":          dest_id,
            "_accom_id":         accom_id,
            "destination":       _clean(dest.get("name")  or f"Stop {i+1}"),
            "accommodation":     _clean(accom.get("name") or ""),
            "rating":            _clean(accom.get("rating") or ""),
            "room_count":        accom.get("room_count") or "",
            "category":          _clean(accom.get("category") or ""),
            "nights":            leg.get("nights") or "",
            "start_date":        _clean(leg.get("start_date") or ""),
            "end_date":          _clean(leg.get("end_date") or ""),
            "room_type":         room_type,
            "board_basis":       board_basis,
            "drinks_basis":      drinks_basis,
            "special_interests": special_interests,
            "spoken_languages":  spoken_languages,
            "destination_images":  dest_images,
            "accommodation_images": accom_images,
        }
        # Remove empty / zero values (but keep internal _ keys for now)
        stop = {k: v for k, v in stop.items()
                if k.startswith("_") or v not in (None, "", [], {}, 0)}
        stops.append(stop)

    return title, stops


# Verified working Wetu image URL format (browser-tested): lowercase
# "imageHandler", size prefix directly, NO "/Image/" segment, "?fmt=jpg" suffix.
# c1920x1080 is a reliably pre-cached size. The old
# "/ImageHandler/c/1024x768/Image/" format 404s for every image.
WETU_IMAGE_BASE   = "https://wetu.com/imageHandler/c1920x1080/"
WETU_IMAGE_SUFFIX = "?fmt=jpg"

def _build_image_urls(paths) -> list:
    """
    Convert Wetu image references to full URLs.
    Handles TWO formats found in the wild:
      • Plain string path:  "10082/photo.jpg"
      • Dict object:        {"url": "10082/photo.jpg", "description": "...", ...}
    Both can be relative paths (prefixed with WETU_IMAGE_BASE) or full https:// URLs.
    """
    if not isinstance(paths, list):
        return []
    urls = []
    for p in paths:
        raw = None
        if isinstance(p, str) and p:
            raw = p
        elif isinstance(p, dict):
            # Extended content wraps images as {"url":"...", "description":"...", ...}
            raw = (p.get("url") or p.get("path") or p.get("src") or
                   p.get("filename") or p.get("image") or "")
        if raw:
            if raw.startswith("http"):
                urls.append(raw)
            else:
                urls.append(WETU_IMAGE_BASE + raw.lstrip("/") + WETU_IMAGE_SUFFIX)
    return urls


def _collect_nested_images(obj: dict) -> list:
    """
    Collect ALL image paths from an accommodation/destination object,
    including images nested inside activities[], rooms[], and similar arrays.
    Returns a flat list of raw path values (strings or dicts).
    """
    all_paths = []

    # Top-level images array
    top_imgs = obj.get("images") or []
    if isinstance(top_imgs, list):
        all_paths.extend(top_imgs)

    # Activities — each activity can have its own images array
    for act in (obj.get("activities") or []):
        if isinstance(act, dict):
            act_imgs = act.get("images") or []
            if isinstance(act_imgs, list):
                all_paths.extend(act_imgs)

    # Rooms / room types — each room can have its own images array
    for room_key in ("rooms", "tents", "lodges", "suites", "units",
                     "villas", "apartments", "cabins", "domes",
                     "cabanas", "carriages", "chalets"):
        for room in (obj.get(room_key) or []):
            if isinstance(room, dict):
                room_imgs = room.get("images") or []
                if isinstance(room_imgs, list):
                    all_paths.extend(room_imgs)

    # Restaurants can also have images
    for rest in (obj.get("restaurants") or []):
        if isinstance(rest, dict):
            rest_imgs = rest.get("images") or []
            if isinstance(rest_imgs, list):
                all_paths.extend(rest_imgs)

    return all_paths


# ─────────────────────────────────────────────────────────────────────────────
# PARSE WETU /GetExtendedContent API  →  richer text + photos
# ─────────────────────────────────────────────────────────────────────────────

def _parse_extended(data: dict, stops: list) -> list:
    """
    Merge extended content from /GetExtendedContent into stops.

    IMPORTANT: Extended content structure varies by itinerary:
      - May have ONLY 'accommodations' key (no 'destinations')
      - Accommodation images are OBJECTS: {"url":"...","description":"...",...}
      - Activity images and room images are nested inside those sub-arrays
      - Matching is done by ID (_dest_id / _accom_id stored on each stop)
        with a name-based fallback.
    """
    ext_destinations   = data.get("destinations")  or {}
    ext_accommodations = data.get("accommodations") or {}

    if not isinstance(ext_destinations,   dict): ext_destinations   = {}
    if not isinstance(ext_accommodations, dict): ext_accommodations = {}

    # Also build name→data lookups as a fallback
    ext_dest_by_name  = {}
    for _id, d in ext_destinations.items():
        if isinstance(d, dict):
            name = _clean(d.get("name") or "").lower()
            if name: ext_dest_by_name[name] = d

    ext_accom_by_name = {}
    for _id, a in ext_accommodations.items():
        if isinstance(a, dict):
            name = _clean(a.get("name") or "").lower()
            if name: ext_accom_by_name[name] = a

    def _find_dest(stop):
        # Try ID first, then name
        d = ext_destinations.get(stop.get("_dest_id") or "")
        if d and isinstance(d, dict): return d
        key = (stop.get("destination") or "").lower()
        if key in ext_dest_by_name: return ext_dest_by_name[key]
        for k, v in ext_dest_by_name.items():
            if key and (key in k or k in key): return v
        return None

    def _find_accom(stop):
        # Try ID first, then name
        a = ext_accommodations.get(stop.get("_accom_id") or "")
        if a and isinstance(a, dict): return a
        key = (stop.get("accommodation") or "").lower()
        if key in ext_accom_by_name: return ext_accom_by_name[key]
        for k, v in ext_accom_by_name.items():
            if key and (key in k or k in key): return v
        return None

    for stop in stops:
        # ── Extended destination info ──────────────────────────────────────────
        ext_dest = _find_dest(stop)
        if ext_dest:
            if not stop.get("description"):
                desc = _clean(ext_dest.get("description") or ext_dest.get("overview") or "")
                if desc: stop["description"] = desc

            acts = ext_dest.get("activities") or []
            if isinstance(acts, list) and acts:
                stop["destination_activities"] = _parse_item_list(acts)

            rests = ext_dest.get("restaurants") or []
            if isinstance(rests, list) and rests:
                stop["destination_restaurants"] = _parse_item_list(rests)

            # Collect ALL destination images (top-level + nested)
            dest_all_paths = _collect_nested_images(ext_dest)
            dest_imgs = _cap_photos(_build_image_urls(dest_all_paths), PHOTO_LIMIT_DESTINATION)
            if dest_imgs:
                stop["destination_images"] = dest_imgs

        # ── Extended accommodation info ────────────────────────────────────────
        ext_accom = _find_accom(stop)
        if ext_accom:
            if not stop.get("accommodation_description"):
                desc = _clean(ext_accom.get("description") or ext_accom.get("overview") or "")
                if desc: stop["accommodation_description"] = desc

            gi = _clean(ext_accom.get("general_info") or ext_accom.get("info") or "")
            if gi: stop["general_info"] = gi

            acts = ext_accom.get("activities") or []
            if isinstance(acts, list) and acts:
                stop["activities"] = _parse_item_list(acts)

            rests = ext_accom.get("restaurants") or []
            if isinstance(rests, list) and rests:
                stop["restaurants"] = _parse_item_list(rests)

            # Room types — names only
            room_types = []
            for room_key in ("rooms","tents","lodges","suites","units",
                             "villas","apartments","cabins","domes","cabanas","carriages","chalets"):
                items = ext_accom.get(room_key) or []
                if isinstance(items, list):
                    room_types.extend(_parse_item_list(items))
            if room_types:
                stop["room_types"] = room_types

            # Collect ALL accommodation images (top-level + nested inside activities/rooms)
            accom_all_paths = _collect_nested_images(ext_accom)
            accom_imgs = _cap_photos(_build_image_urls(accom_all_paths), PHOTO_LIMIT_ACCOMMODATION)
            if accom_imgs:
                stop["accommodation_images"] = accom_imgs

        # Strip internal ID keys before output
        stop.pop("_dest_id",  None)
        stop.pop("_accom_id", None)

    return stops


def _parse_item_list(items: list) -> list:
    """Convert a list of strings or dicts into clean strings."""
    result = []
    for item in items:
        if isinstance(item, str) and item.strip():
            result.append(item.strip())
        elif isinstance(item, dict):
            # Extract name/title/description from dict
            name = _clean(item.get("name") or item.get("title") or item.get("label") or "")
            desc = _clean(item.get("description") or item.get("overview") or "")
            if name and desc:
                result.append(f"{name}: {desc}")
            elif name:
                result.append(name)
            elif desc:
                result.append(desc)
    return result


def _dedup_photos(urls: list) -> list:
    seen = set()
    out  = []
    for u in urls:
        if not _is_real_photo(u):
            continue
        h = _image_hash(u)
        if h not in seen:
            seen.add(h)
            out.append(u)
    return out


# ─────────────────────────────────────────────────────────────────────────────
# DOM FALLBACK  (used only if API calls fail)
# ─────────────────────────────────────────────────────────────────────────────

async def _dom_scrape(page) -> tuple:
    """Parse the live DOM using Wetu's actual CSS class names."""
    title = await page.evaluate("""
        () => {
            for (const s of ['h1','[class*="itinerary-name"]','[class*="title"]','title']) {
                const el = document.querySelector(s);
                if (el && el.innerText && el.innerText.trim().length > 3)
                    return el.innerText.trim();
            }
            return document.title || 'Untitled';
        }
    """)

    stops = await page.evaluate("""
        () => {
            // Wetu Discovery real class names (from debug output)
            const CONTAINER_SELS = [
                '.destination-section',
                '[class*="destination-section"]',
                '.destination',
                '[class*="destination_section"]',
                '[class*="leg-section"]',
                '[class*="leg_section"]',
                'section',
            ];

            let containers = [];
            for (const sel of CONTAINER_SELS) {
                const found = Array.from(document.querySelectorAll(sel));
                if (found.length >= 2) { containers = found; break; }
            }

            const pick = (root, sels) => {
                for (const s of sels) {
                    try {
                        const el = root.querySelector(s);
                        if (el && el.innerText.trim()) return el.innerText.trim();
                    } catch(e) {}
                }
                return '';
            };

            return containers.map((c, i) => {
                const stop = {
                    stop_index: i + 1,
                    destination: pick(c, ['h2','h3','h4',
                        '[class*="destination-name"]',
                        '[class*="location-name"]',
                        '[class*="heading"]']),
                    description: pick(c, ['[class*="description"]','[class*="overview"]','p']),
                    accommodation: pick(c, ['[class*="accommodation"]','[class*="hotel"]','[class*="lodge"]']),
                };
                return stop;
            }).filter(s => s.destination || s.description);
        }
    """)
    return title, stops


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC: scrape_text
# ─────────────────────────────────────────────────────────────────────────────

async def scrape_text(url: str) -> dict:
    """
    Scrape day-by-day TEXT content from a Wetu Discovery itinerary.
    Returns a dict ready for JSON serialisation.
    """
    print("\n╔══════════════════════════════╗")
    print("║  TEXT SCRAPER                ║")
    print("╚══════════════════════════════╝")
    print(f"  URL: {url}\n")

    guid = _extract_guid(url)
    if not guid:
        return {"error": "Could not extract GUID from URL", "stops": []}

    async with async_playwright() as p:
        browser, context = await _make_context(p)
        page = await context.new_page()

        # Load the page (sets session cookies)
        print("  ▶ Loading page …")
        await page.goto(url, wait_until="domcontentloaded", timeout=60_000)
        await _human_pause(2000, 3000)

        # Call the Wetu /Get API directly
        basic_data = await _call_wetu_api(
            page, f"https://wetu.com/API/Itinerary/Basic/v2/Get/{guid}"
        )

        # Call the Wetu /GetExtendedContent API for richer descriptions
        extended_data = await _call_wetu_api(
            page, f"https://wetu.com/API/Itinerary/Basic/v2/GetExtendedContent/{guid}"
        )

        await browser.close()

    # Parse
    if basic_data:
        title, stops = _parse_basic(basic_data)
    else:
        print("  ⚠ Basic API failed — scraping DOM")
        async with async_playwright() as p:
            browser, context = await _make_context(p)
            page = await context.new_page()
            await page.goto(url, wait_until="domcontentloaded", timeout=60_000)
            await _human_pause(3000, 5000)
            title, stops = await _dom_scrape(page)
            await browser.close()

    # Merge extended content descriptions
    if extended_data and stops:
        stops = _parse_extended(extended_data, stops)

    result = {
        "scraped_at": datetime.now().isoformat(),
        "source_url": url,
        "itinerary_title": title,
        "stop_count": len(stops),
        "stops": stops,
    }
    print(f"\n  ✓ {len(stops)} stop(s) extracted | title: {title!r}")
    return result


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC: scrape_photos
# ─────────────────────────────────────────────────────────────────────────────

async def scrape_photos(url: str) -> dict:
    """
    Scrape all unique PHOTO URLs from a Wetu Discovery itinerary.
    Returns a dict ready for JSON serialisation.
    """
    print("\n╔══════════════════════════════╗")
    print("║  PHOTO SCRAPER               ║")
    print("╚══════════════════════════════╝")
    print(f"  URL: {url}\n")

    guid = _extract_guid(url)
    if not guid:
        return {"error": "Could not extract GUID from URL", "stops": []}

    intercepted_urls: list = []
    seen_hashes: set = set()

    async with async_playwright() as p:
        browser, context = await _make_context(p)
        page = await context.new_page()

        # Intercept image requests as a bonus source
        async def on_request(req):
            if req.resource_type == "image" and _is_real_photo(req.url):
                intercepted_urls.append(req.url)

        page.on("request", on_request)

        print("  ▶ Loading page …")
        await page.goto(url, wait_until="domcontentloaded", timeout=60_000)
        await _human_pause(2000, 3000)

        # Call both API endpoints
        basic_data = await _call_wetu_api(
            page, f"https://wetu.com/API/Itinerary/Basic/v2/Get/{guid}"
        )
        extended_data = await _call_wetu_api(
            page, f"https://wetu.com/API/Itinerary/Basic/v2/GetExtendedContent/{guid}"
        )

        # Scroll to trigger lazy-loaded images
        print("  ▶ Scrolling page for lazy images …")
        height = await page.evaluate("document.body.scrollHeight")
        pos = 0
        while pos < height:
            pos = min(pos + random.randint(300, 600), height)
            await page.evaluate(f"window.scrollTo({{top:{pos},behavior:'smooth'}})")
            await asyncio.sleep(0.15)
            height = await page.evaluate("document.body.scrollHeight")
        await _human_pause(1000, 2000)

        await browser.close()

    # ── Build per-stop photo groups using the correct dict structure ──────────
    stops = []

    if basic_data:
        destinations_dict  = basic_data.get("destinations")  or {}
        accommodations_dict = basic_data.get("accommodations") or {}
        if not isinstance(destinations_dict,  dict): destinations_dict  = {}
        if not isinstance(accommodations_dict, dict): accommodations_dict = {}

        # Extended content has richer image lists for same IDs
        ext_destinations  = {}
        ext_accommodations = {}
        if extended_data and isinstance(extended_data, dict):
            ext_destinations  = extended_data.get("destinations")  or {}
            ext_accommodations = extended_data.get("accommodations") or {}
            if not isinstance(ext_destinations,  dict): ext_destinations  = {}
            if not isinstance(ext_accommodations, dict): ext_accommodations = {}

        # Walk legs in schedule order — one stop per leg
        trip_summary = basic_data.get("trip_summary") or {}
        legs = (trip_summary.get("legs") or []) if isinstance(trip_summary, dict) else []

        for leg in legs:
            if not isinstance(leg, dict):
                continue
            if not leg.get("accommodation_id"):
                continue  # skip flights/transfers

            dest_id  = str(leg.get("destination_id")  or "")
            accom_id = str(leg.get("accommodation_id") or "")

            # Merge basic + extended for this destination and accommodation
            dest_basic  = destinations_dict.get(dest_id)   or {}
            dest_ext    = ext_destinations.get(dest_id)    or {}
            accom_basic = accommodations_dict.get(accom_id) or {}
            accom_ext   = ext_accommodations.get(accom_id)  or {}

            if not isinstance(dest_basic,  dict): dest_basic  = {}
            if not isinstance(dest_ext,    dict): dest_ext    = {}
            if not isinstance(accom_basic, dict): accom_basic = {}
            if not isinstance(accom_ext,   dict): accom_ext   = {}

            dest_name  = _clean(dest_basic.get("name")  or dest_ext.get("name")  or f"Destination {dest_id}")
            accom_name = _clean(accom_basic.get("name") or accom_ext.get("name") or f"Accommodation {accom_id}")

            # Collect ALL image paths: top-level + nested in activities/rooms/restaurants
            # _collect_nested_images handles both basic (plain strings) and extended
            # (dict objects like {"url":"...","description":"..."}) formats
            all_paths = []
            for src in (dest_basic, dest_ext, accom_basic, accom_ext):
                if isinstance(src, dict):
                    all_paths.extend(_collect_nested_images(src))

            # Build full URLs (handles both string paths and dict objects)
            photo_urls = _build_image_urls(all_paths)

            # Deduplicate
            unique = []
            for u in photo_urls:
                h = _image_hash(u)
                if h not in seen_hashes:
                    seen_hashes.add(h)
                    unique.append(u)

            stops.append({
                "destination":   dest_name,
                "accommodation": accom_name,
                "nights":        leg.get("nights") or "",
                "photos":        unique,
                "count":         len(unique),
            })

    # Fallback: scan entire extended blob for any photo URLs
    if not stops and extended_data:
        all_raw = []
        _extract_photos_from_obj(extended_data, all_raw)
        unique_all = _dedup_photos(all_raw)
        if unique_all:
            stops.append({"destination": "All Destinations", "photos": unique_all, "count": len(unique_all)})

    # Add network-intercepted images not yet captured
    extra = []
    for u in intercepted_urls:
        h = _image_hash(u)
        if h not in seen_hashes:
            seen_hashes.add(h)
            extra.append(u)

    total = sum(s["count"] for s in stops) + len(extra)
    title = _clean((basic_data or {}).get("name") or "Untitled Itinerary")

    result = {
        "scraped_at": datetime.now().isoformat(),
        "source_url": url,
        "itinerary_title": title,
        "total_unique_photos": total,
        "stops": stops,
        "network_extras": extra,
    }
    print(f"\n  ✓ {total} unique photos across {len(stops)} stop(s)")
    return result


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC: scrape_both  — ONE browser session, text + photos merged
# ─────────────────────────────────────────────────────────────────────────────

async def scrape_both(url: str) -> dict:
    """
    Single browser session — load the page once, call both APIs once,
    then parse text AND photos from the same data.
    ~Same speed as a single scrape instead of 2×.
    """
    print("\n╔══════════════════════════════════╗")
    print("║  COMBINED SCRAPER (text+photos)  ║")
    print("╚══════════════════════════════════╝")
    print(f"  URL: {url}\n")

    guid = _extract_guid(url)
    if not guid:
        return {"error": "Could not extract GUID from URL", "stops": []}

    intercepted_urls: list = []
    seen_hashes: set = set()

    async with async_playwright() as p:
        browser, context = await _make_context(p)
        page = await context.new_page()

        # Intercept network images as a bonus source
        async def on_request(req):
            if req.resource_type == "image" and _is_real_photo(req.url):
                intercepted_urls.append(req.url)
        page.on("request", on_request)

        print("  ▶ Loading page …")
        await page.goto(url, wait_until="domcontentloaded", timeout=60_000)
        await _human_pause(2000, 3000)

        # Both API calls in the same session
        basic_data    = await _call_wetu_api(page, f"https://wetu.com/API/Itinerary/Basic/v2/Get/{guid}")
        extended_data = await _call_wetu_api(page, f"https://wetu.com/API/Itinerary/Basic/v2/GetExtendedContent/{guid}")

        # Scroll to catch lazy-loaded images
        print("  ▶ Scrolling for lazy images …")
        height = await page.evaluate("document.body.scrollHeight")
        pos = 0
        while pos < height:
            pos = min(pos + random.randint(300, 600), height)
            await page.evaluate(f"window.scrollTo({{top:{pos},behavior:'smooth'}})")
            await asyncio.sleep(0.15)
            height = await page.evaluate("document.body.scrollHeight")
        await _human_pause(800, 1500)

        await browser.close()

    # ── Parse TEXT ────────────────────────────────────────────────────────────
    if basic_data:
        title, text_stops = _parse_basic(basic_data)
    else:
        title, text_stops = "Untitled Itinerary", []

    if extended_data and text_stops:
        text_stops = _parse_extended(extended_data, text_stops)

    # ── Parse PHOTOS from the same API data ──────────────────────────────────
    # Walk legs in schedule order (same logic as scrape_photos)
    photo_by_leg: dict = {}   # leg index → list of unique photo URLs

    if basic_data:
        destinations_dict   = basic_data.get("destinations")  or {}
        accommodations_dict = basic_data.get("accommodations") or {}
        if not isinstance(destinations_dict,  dict): destinations_dict  = {}
        if not isinstance(accommodations_dict, dict): accommodations_dict = {}

        ext_destinations   = {}
        ext_accommodations = {}
        if extended_data and isinstance(extended_data, dict):
            ext_destinations  = extended_data.get("destinations")  or {}
            ext_accommodations = extended_data.get("accommodations") or {}
            if not isinstance(ext_destinations,  dict): ext_destinations  = {}
            if not isinstance(ext_accommodations, dict): ext_accommodations = {}

        trip_summary = basic_data.get("trip_summary") or {}
        legs = (trip_summary.get("legs") or []) if isinstance(trip_summary, dict) else []

        leg_stop_idx = 0   # counts only accommodation legs (matching text_stops order)
        for leg in legs:
            if not isinstance(leg, dict) or not leg.get("accommodation_id"):
                continue

            dest_id  = str(leg.get("destination_id")  or "")
            accom_id = str(leg.get("accommodation_id") or "")

            dest_basic  = destinations_dict.get(dest_id)   or {}
            dest_ext    = ext_destinations.get(dest_id)    or {}
            accom_basic = accommodations_dict.get(accom_id) or {}
            accom_ext   = ext_accommodations.get(accom_id)  or {}

            all_paths = []
            for src in (dest_basic, dest_ext, accom_basic, accom_ext):
                if isinstance(src, dict):
                    all_paths.extend(_collect_nested_images(src))

            unique = []
            for u in _build_image_urls(all_paths):
                h = _image_hash(u)
                if h not in seen_hashes:
                    seen_hashes.add(h)
                    unique.append(u)

            photo_by_leg[leg_stop_idx] = unique
            leg_stop_idx += 1

    # ── Merge photos into text stops ─────────────────────────────────────────
    total_photos = 0
    for i, stop in enumerate(text_stops):
        photos = photo_by_leg.get(i) or []
        stop["photos"]      = photos
        stop["photo_count"] = len(photos)
        total_photos += len(photos)

    # Network-intercepted extras not matched to any stop
    extras = []
    for u in intercepted_urls:
        h = _image_hash(u)
        if h not in seen_hashes:
            seen_hashes.add(h)
            extras.append(u)

    result = {
        "scraped_at":      datetime.now().isoformat(),
        "source_url":      url,
        "itinerary_title": title,
        "stop_count":      len(text_stops),
        "total_photos":    total_photos + len(extras),
        "stops":           text_stops,
        "network_extras":  extras,
    }
    print(f"\n  ✓ {len(text_stops)} stop(s) | {total_photos} photos merged")
    return result


async def scrape_combined(url: str) -> tuple:
    """Legacy alias — wraps scrape_both for CLI backwards compatibility."""
    data = await scrape_both(url)
    photo_rows = []
    for s in data.get("stops", []):
        for u in s.get("photos", []):
            photo_rows.append({"stop": s.get("destination", ""), "url": u})
    for u in data.get("network_extras", []):
        photo_rows.append({"stop": "network_extras", "url": u})
    return data, photo_rows


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC: scrape_accommodation  — detailed per-lodge tab data
# ─────────────────────────────────────────────────────────────────────────────

async def scrape_accommodation(urls: list) -> dict:
    """
    Scrape detailed accommodation data from one or more Wetu itinerary URLs.
    For each lodge found, returns:
      - rooms      : each room type with photos  (skip if empty)
      - restaurants: each restaurant name + photos (skip if empty)
      - activities : text list of activities/services (skip if empty)
      - information: description, facilities, languages, check-in/out (skip if empty)
    Supports multiple itinerary URLs — deduplicates lodges across them.
    """
    print("\n╔══════════════════════════════════════╗")
    print("║  ACCOMMODATION SCRAPER               ║")
    print("╚══════════════════════════════════════╝")

    all_accommodations = []
    seen_accom_ids: set = set()
    itinerary_names: list = []

    for url in urls:
        url = url.strip()
        if not url:
            continue
        guid = _extract_guid(url)
        if not guid:
            print(f"  ⚠ Skipping — no GUID found in: {url}")
            continue

        print(f"\n  ▶ {url}")

        async with async_playwright() as p:
            browser, context = await _make_context(p)
            page = await context.new_page()
            await page.goto(url, wait_until="domcontentloaded", timeout=60_000)
            await _human_pause(2000, 3000)
            basic_data    = await _call_wetu_api(page, f"https://wetu.com/API/Itinerary/Basic/v2/Get/{guid}")
            extended_data = await _call_wetu_api(page, f"https://wetu.com/API/Itinerary/Basic/v2/GetExtendedContent/{guid}")
            await browser.close()

        if not basic_data:
            print("  ⚠ Basic API returned nothing — skipping URL")
            continue

        # Itinerary / safari title for this URL
        itin_name = _clean(basic_data.get("name") or "")
        if itin_name and itin_name not in itinerary_names:
            itinerary_names.append(itin_name)

        basic_accoms  = basic_data.get("accommodations")  or {}
        basic_dests   = basic_data.get("destinations")    or {}
        ext_accoms    = (extended_data or {}).get("accommodations") or {}
        ext_dests     = (extended_data or {}).get("destinations")   or {}

        if not isinstance(basic_accoms,  dict): basic_accoms  = {}
        if not isinstance(basic_dests,   dict): basic_dests   = {}
        if not isinstance(ext_accoms,    dict): ext_accoms    = {}
        if not isinstance(ext_dests,     dict): ext_dests     = {}

        # Walk legs in schedule order
        trip_summary = basic_data.get("trip_summary") or {}
        legs = (trip_summary.get("legs") or []) if isinstance(trip_summary, dict) else []

        for leg in legs:
            if not isinstance(leg, dict) or not leg.get("accommodation_id"):
                continue

            accom_id = str(leg.get("accommodation_id") or "")
            dest_id  = str(leg.get("destination_id")  or "")

            if accom_id in seen_accom_ids:
                continue
            seen_accom_ids.add(accom_id)

            basic_a = basic_accoms.get(accom_id) or {}
            ext_a   = ext_accoms.get(accom_id)   or {}
            basic_d = basic_dests.get(dest_id)   or {}
            ext_d   = ext_dests.get(dest_id)     or {}

            if not isinstance(basic_a, dict): basic_a = {}
            if not isinstance(ext_a,   dict): ext_a   = {}
            if not isinstance(basic_d, dict): basic_d = {}
            if not isinstance(ext_d,   dict): ext_d   = {}

            name     = _clean(basic_a.get("name") or ext_a.get("name") or f"Accommodation {accom_id}")
            dest_nm  = _clean(basic_d.get("name") or "")
            print(f"    → {name}")

            # ── ROOMS ──────────────────────────────────────────────────────────
            rooms_out = []
            for room_key in ("rooms","tents","lodges","suites","units","villas",
                             "apartments","cabins","domes","cabanas","carriages","chalets"):
                for room in (ext_a.get(room_key) or []):
                    if not isinstance(room, dict):
                        continue
                    rn = _clean(room.get("name") or room.get("title") or "")
                    rd = _clean(room.get("description") or room.get("overview") or "")
                    ri = _cap_photos(_build_image_urls(room.get("images") or []), PHOTO_LIMIT_ROOM)
                    if rn or ri:
                        r = {}
                        if rn: r["name"] = rn
                        if rd: r["description"] = rd
                        if ri: r["photos"] = ri; r["photo_count"] = len(ri)
                        rooms_out.append(r)

            # ── RESTAURANTS ────────────────────────────────────────────────────
            rests_out = []
            for rest in (ext_a.get("restaurants") or []):
                if not isinstance(rest, dict):
                    continue
                rn = _clean(rest.get("name") or rest.get("title") or "")
                rd = _clean(rest.get("description") or "")
                ri = _cap_photos(_build_image_urls(rest.get("images") or []), PHOTO_LIMIT_RESTAURANT)
                if rn or ri:
                    r = {}
                    if rn: r["name"] = rn
                    if rd: r["description"] = rd
                    if ri: r["photos"] = ri; r["photo_count"] = len(ri)
                    rests_out.append(r)

            # ── ACTIVITIES & SERVICES ──────────────────────────────────────────
            acts_out = []
            for act in (ext_a.get("activities") or []):
                if not isinstance(act, dict):
                    continue
                an = _clean(act.get("name") or act.get("title") or "")
                ad = _clean(act.get("description") or act.get("overview") or "")
                if an or ad:
                    a = {}
                    if an: a["name"] = an
                    if ad: a["description"] = ad
                    acts_out.append(a)

            # ── INFORMATION ────────────────────────────────────────────────────
            info = {}
            desc = _clean(ext_a.get("description") or ext_a.get("overview") or "")
            if desc: info["description"] = desc

            gi = _clean(ext_a.get("general_info") or ext_a.get("info") or "")
            if gi: info["general_info"] = gi

            if basic_a.get("rating"):     info["rating"]     = _clean(basic_a["rating"])
            if basic_a.get("room_count"): info["room_count"] = basic_a["room_count"]

            ci = _clean(ext_a.get("check_in")  or ext_a.get("check_in_time")  or basic_a.get("check_in")  or "")
            co = _clean(ext_a.get("check_out") or ext_a.get("check_out_time") or basic_a.get("check_out") or "")
            if ci: info["check_in"]  = ci
            if co: info["check_out"] = co

            langs = basic_a.get("spoken_languages") or []
            if isinstance(langs, list) and langs: info["spoken_languages"] = langs

            interests = basic_a.get("special_interests") or []
            if isinstance(interests, list) and interests: info["special_interests"] = interests

            def _fac_list(raw):
                if not isinstance(raw, list): return []
                return [_clean(f) if isinstance(f, str) else _clean(f.get("name") or f.get("label") or "") for f in raw if f]

            pf = ext_a.get("property_facilities") or ext_a.get("facilities") or []
            rf = ext_a.get("room_facilities") or []
            if pf: info["property_facilities"] = _fac_list(pf)
            if rf: info["room_facilities"]     = _fac_list(rf)

            # ── GALLERY (all photos combined, de-duplicated, capped) ───────────
            gallery = _cap_photos(
                _build_image_urls(_collect_nested_images(ext_a)),
                PHOTO_LIMIT_ACCOMMODATION,
            )

            # ── DESTINATION — day text + destination photos ────────────────────
            dest_desc = _clean(ext_d.get("description") or ext_d.get("overview")
                               or basic_d.get("description") or "")
            dest_info = _clean(ext_d.get("general_info") or ext_d.get("info") or "")
            # Destination images live in BOTH basic and extended data — combine.
            dest_photos = _cap_photos(
                _build_image_urls(
                    _collect_nested_images(ext_d)
                    + _collect_nested_images(basic_d)
                    + (basic_d.get("images") or [])
                ),
                PHOTO_LIMIT_DESTINATION,
            )

            # ── BUILD OUTPUT — skip empty sections ─────────────────────────────
            accom_out = {
                "safari_name": itin_name,
                "name":        name,
                "destination": dest_nm,
                "nights":      leg.get("nights") or "",
                "start_date":  _clean(leg.get("start_date") or ""),
                "end_date":    _clean(leg.get("end_date")   or ""),
            }
            if dest_desc:   accom_out["destination_text"]   = dest_desc
            if dest_info:   accom_out["destination_info"]   = dest_info
            if dest_photos: accom_out["destination_photos"] = dest_photos
            if rooms_out:  accom_out["rooms"]       = rooms_out
            if rests_out:  accom_out["restaurants"] = rests_out
            if acts_out:   accom_out["activities"]  = acts_out
            if info:       accom_out["information"] = info
            if gallery:    accom_out["gallery_photos"] = gallery

            # Clean empty values
            accom_out = {k: v for k, v in accom_out.items() if v not in (None, "", [], {})}
            all_accommodations.append(accom_out)

    total = len(all_accommodations)
    print(f"\n  ✓ {total} accommodation(s) scraped")
    return {
        "scraped_at":          datetime.now().isoformat(),
        "itinerary_name":      itinerary_names[0] if len(itinerary_names) == 1 else "",
        "itinerary_names":     itinerary_names,
        "source_urls":         urls,
        "accommodation_count": total,
        "accommodations":      all_accommodations,
    }


# ─────────────────────────────────────────────────────────────────────────────
# NIGHTSBRIDGE AVAILABILITY SCRAPER
# ─────────────────────────────────────────────────────────────────────────────

async def _nb_login(page, email: str, password: str):
    """Log into NightsBridge for Agents. Tries multiple URLs and selectors."""
    # Try the correct AgentBridge URL first, then fallbacks
    NB_URLS = [
        "https://www.nightsbridge.co.za/bridge/agentbridge",
        "https://nightsbridge.co.za/bridge/agentbridge",
        "https://www.nightsbridge.co.za/bridge/book",
        "https://nightsbridge.co.za/bridge/book",
        "https://www.nightsbridge.co.za/",
    ]
    found_login = False
    for url in NB_URLS:
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=40000)
        except Exception:
            continue
        await _human_pause(1200, 2000)
        # Wait (up to 14s) for the login form to actually render — NightsBridge
        # injects it with JavaScript a moment after the page loads, so an
        # instant visibility check misses it.
        try:
            await page.wait_for_selector(
                'input[type="password"], input[type="email"], input[name="email"]',
                state="visible", timeout=14000,
            )
            found_login = True
            break
        except Exception:
            continue

    if not found_login:
        raise Exception(
            "Could not find the NightsBridge login page. "
            "Please paste your AgentBridge/NightsBridge URL into the error report."
        )

    # Fill email — try every common selector
    email_filled = False
    for sel in [
        'input[type="email"]',
        'input[id="email"]',
        'input[name="email"]',
        'input[placeholder*="mail" i]',
        'input[placeholder*="Email" i]',
        'input[autocomplete="email"]',
        # last resort: first non-password, non-hidden text input
        'input:not([type="password"]):not([type="hidden"]):not([type="submit"])',
    ]:
        try:
            el = page.locator(sel).first
            if await el.is_visible(timeout=3000):
                await el.fill(email)
                email_filled = True
                break
        except Exception:
            continue

    if not email_filled:
        raise Exception(
            "Could not find the NightsBridge email field — the login page may have changed."
        )

    await _human_pause(400, 700)
    await page.locator('input[type="password"]').first.fill(password)
    await _human_pause(400, 700)

    await page.locator(
        'button:has-text("Login"), input[value="Login"], '
        'button[type="submit"], input[type="submit"]'
    ).first.click()
    await page.wait_for_load_state("networkidle", timeout=25000)
    await _human_pause(1500, 2500)

    if await page.locator('input[type="password"]').is_visible():
        raise Exception("Login failed — check your NightsBridge email and password.")


async def _nb_search_region(
    page,
    location: str,
    check_in: str,
    check_out: str,
    guests: int,
    rooms: int,
) -> list:
    """
    Search NightsBridge by location/region (no establishment name).
    Returns all property results with has_availability flag.
    """
    # Return to a clean booking form each time
    await page.goto(
        "https://www.nightsbridge.co.za/bridge/agentbridge",
        wait_until="domcontentloaded", timeout=30000
    )
    await _human_pause(800, 1500)

    # Location text field ("Type to search locations...")
    loc_sel = (
        'input[placeholder*="earch location" i], '
        'input[placeholder*="location" i], '
        'input[id*="location" i]'
    )
    try:
        loc_el = page.locator(loc_sel).first
        await loc_el.click()
        await loc_el.fill(location)
        await _human_pause(1000, 1600)

        # Handle autocomplete suggestion
        try:
            sug = page.locator(
                '.ui-autocomplete li:first-child, '
                '[class*="autocomplete"] li:first-child, '
                '[role="listbox"] [role="option"]:first-child'
            ).first
            if await sug.is_visible(timeout=2000):
                await sug.click()
                await _human_pause(700, 1100)
        except Exception:
            pass
    except Exception:
        pass

    # Leave establishment name blank (region search = all lodges in area)
    try:
        await page.locator('input[placeholder*="stablishment" i]').first.fill("")
    except Exception:
        pass

    # Dates
    await _nb_fill_date(
        page,
        'input[id*="arriv"], input[name*="arriv"], #from, [name="from"]',
        check_in
    )
    await _human_pause(400, 700)
    await _nb_fill_date(
        page,
        'input[id*="leav"], input[name*="leav"], #to, [name="to"]',
        check_out
    )
    await _human_pause(400, 700)

    # Guests & rooms
    for sel, val in [
        ('select[name*="guest"], select[id*="guest"]', str(guests)),
        ('select[name*="room"],  select[id*="room"]',  str(rooms)),
    ]:
        try:
            await page.locator(sel).first.select_option(val)
            await _human_pause(300, 500)
        except Exception:
            pass

    # Search
    await page.locator('button:has-text("Search"), input[value="Search"]').first.click()
    await page.wait_for_load_state("networkidle", timeout=30000)
    await _human_pause(2500, 4000)

    # Parse all result cards
    props = await _parse_nb_page(page)

    # Tag each property with an overall availability flag
    for prop in props:
        prop["has_availability"] = any(
            a.get("available")
            for rt in prop.get("room_types", [])
            for a in rt.get("availability", [])
        )

    return props


async def scrape_nb_regions(
    email: str,
    password: str,
    regions: list,   # [{"region": str, "check_in": str, "check_out": str}, ...]
    guests: int = 2,
    rooms: int = 1,
) -> dict:
    """
    Search NightsBridge for available lodges across up to 5 regions.
    One browser session — logs in once, then searches each region in sequence.
    Returns results grouped by region → lodge → room type.
    """
    result = {
        "scraped_at":   datetime.now().isoformat(),
        "platform":     "NightsBridge",
        "guests":       guests,
        "rooms":        rooms,
        "region_count": len(regions),
        "regions":      [],
    }

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage",
                  "--disable-blink-features=AutomationControlled"]
        )
        ctx = await browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            viewport={"width": 1280, "height": 900}
        )
        await ctx.add_init_script(STEALTH_JS)
        page = await ctx.new_page()

        try:
            print("  🔐 Logging into NightsBridge…")
            await _nb_login(page, email, password)
            print("  ✅ Logged in.")

            for idx, reg in enumerate(regions):
                rname    = (reg.get("region")    or "").strip()
                check_in = (reg.get("check_in")  or "").strip()
                check_out= (reg.get("check_out") or "").strip()
                if not rname or not check_in or not check_out:
                    continue

                print(f"  🌍 [{idx+1}/{len(regions)}] {rname}  ({check_in} → {check_out})")
                props = await _nb_search_region(
                    page, rname, check_in, check_out, guests, rooms
                )

                available = [p for p in props if p.get("has_availability")]
                result["regions"].append({
                    "region":          rname,
                    "check_in":        check_in,
                    "check_out":       check_out,
                    "lodge_count":     len(props),
                    "available_count": len(available),
                    "properties":      props,
                })
                print(f"     {len(props)} lodges found — {len(available)} available.")
                await _human_pause(1500, 2500)

        except Exception as exc:
            result["error"] = str(exc)
            print(f"  ❌ Region search error: {exc}")
        finally:
            await browser.close()

    return result


async def _nb_fill_date(page, selector: str, date_val: str):
    """Set a NightsBridge date field reliably, handling both native and custom pickers."""
    try:
        el = page.locator(selector).first
        await el.click()
        await el.fill(date_val)
        await page.evaluate(
            """([sel, val]) => {
                const el = document.querySelector(sel);
                if (!el) return;
                const setter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype, 'value');
                if (setter && setter.set) setter.set.call(el, val);
                el.dispatchEvent(new Event('input',  {bubbles: true}));
                el.dispatchEvent(new Event('change', {bubbles: true}));
                el.dispatchEvent(new Event('blur',   {bubbles: true}));
            }""",
            [selector.split(',')[0].strip(), date_val]
        )
    except Exception:
        pass


async def _parse_nb_page(page) -> list:
    """Extract availability tables from a NightsBridge search results page."""
    return await page.evaluate(r"""
        () => {
            const props = [];

            // Find every table whose first <th> mentions rooms/type/accommodation
            document.querySelectorAll('table').forEach(table => {
                const firstTh = table.querySelector('th');
                if (!firstTh) return;
                const thTxt = firstTh.textContent.trim().toLowerCase();
                if (!thTxt.includes('room') && !thTxt.includes('type') && !thTxt.includes('accommodation')) return;

                // ── Property name & location ──
                let name = '', location = '', description = '';
                let anc = table.parentElement;
                for (let d = 0; d < 10 && anc; d++, anc = anc.parentElement) {
                    const h = anc.querySelector('h2,h3,h4,[class*="title"],[class*="heading"],[class*="property-name"]');
                    if (h && h.textContent.trim().length > 2) {
                        const raw = h.textContent.trim().replace(/\s+/g, ' ');
                        const m = raw.match(/^(.+?)\s*\((.+?)\)\s*$/);
                        if (m) { name = m[1].trim(); location = m[2].trim(); }
                        else     { name = raw; }
                        break;
                    }
                }
                const descEl = table.parentElement?.querySelector('p,[class*="desc"],[class*="info"]');
                if (descEl) description = descEl.textContent.trim().replace(/\s+/g, ' ').slice(0, 500);

                // ── Date column headers (skip col 0 = Room Type, col 1 = Pax) ──
                const dateHeaders = [];
                table.querySelectorAll('thead tr th, tr:first-child th').forEach((th, i) => {
                    if (i >= 2) dateHeaders.push(th.textContent.trim().replace(/\s+/g, ' '));
                });

                // ── Parse body rows ──
                const roomTypes = [];
                let currentRoom = null;
                let paxRow = 0;

                table.querySelectorAll('tbody tr, tr:not(:first-child)').forEach(row => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    if (cells.length < 3) return;

                    const col0 = cells[0].textContent.trim().replace(/\s+/g, ' ');

                    // New room type when col0 has real text
                    if (col0 && col0.length > 1 && col0.toLowerCase() !== 'room type') {
                        currentRoom = { room_type: col0, availability: [] };
                        roomTypes.push(currentRoom);
                        paxRow = 0;
                    } else if (!currentRoom) {
                        return;
                    }

                    const isFirstPax = (paxRow === 0);
                    paxRow++;

                    // Parse date cells starting at index 2
                    cells.slice(2).forEach((cell, ci) => {
                        const label = dateHeaders[ci] || `Day ${ci + 1}`;
                        const txt   = cell.textContent.trim();
                        const bg    = (cell.style && cell.style.backgroundColor) || '';
                        const cls   = (cell.className || '').toLowerCase();

                        const isSold =
                            txt.toLowerCase() === 'sold' ||
                            cls.includes('sold') ||
                            (bg && bg !== '' && !bg.match(/white|transparent|rgba\(0,\s*0,\s*0,\s*0\)|#fff/i));

                        if (isFirstPax) {
                            currentRoom.availability.push({
                                date:        label,
                                available:   !isSold,
                                status:      isSold ? 'Sold' : 'Available',
                                single_rate: isSold ? null : (parseFloat(txt.replace(/[^0-9.]/g, '')) || null),
                                double_rate: null,
                            });
                        } else if (paxRow === 2 && ci < currentRoom.availability.length) {
                            const pr = parseFloat(txt.replace(/[^0-9.]/g, ''));
                            currentRoom.availability[ci].double_rate =
                                isNaN(pr) || isSold ? null : pr;
                        }
                    });
                });

                if (name || roomTypes.length) {
                    props.push({ name, location, description, room_types: roomTypes });
                }
            });

            return props;
        }
    """)


async def scrape_nightsbridge(
    email: str,
    password: str,
    lodge_name: str,
    check_in: str,   # YYYY-MM-DD
    check_out: str,  # YYYY-MM-DD
    guests: int = 2,
    rooms: int = 1,
) -> dict:
    """
    Scrape lodge availability from NightsBridge for Agents (nightsbridge.co.za).
    Logs in with agent credentials, searches by lodge name + date range,
    returns room types with rates and sold/available status per date.
    """
    result = {
        "scraped_at":       datetime.now().isoformat(),
        "platform":         "NightsBridge",
        "lodge_name_query": lodge_name,
        "check_in":         check_in,
        "check_out":        check_out,
        "guests":           guests,
        "rooms":            rooms,
        "result_count":     0,
        "properties":       [],
    }

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage",
                  "--disable-blink-features=AutomationControlled"]
        )
        ctx = await browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            viewport={"width": 1280, "height": 900}
        )
        await ctx.add_init_script(STEALTH_JS)
        page = await ctx.new_page()

        try:
            # ── 1. Login ──────────────────────────────────────────────────────
            print("  🔐 Logging into NightsBridge…")
            await _nb_login(page, email, password)
            print("  ✅ Logged in.")

            # ── 2. Navigate to booking form (after login we may be on agentbridge page already) ──
            print(f"  🔍 Searching for: {lodge_name}")
            if "agentbridge" not in page.url and "book" not in page.url:
                await page.goto(
                    "https://www.nightsbridge.co.za/bridge/agentbridge",
                    wait_until="domcontentloaded", timeout=30000
                )
                await _human_pause(800, 1500)

            # ── Establishment / lodge-name field ───────────────────────────────
            # NightsBridge may render the search form inside an iframe, so search
            # the main page AND every child frame, with many selector variants.
            est_selectors = [
                'input[placeholder*="stablishment" i]',
                'input[placeholder*="property" i]',
                'input[placeholder*="lodge" i]',
                'input[placeholder*="hotel" i]',
                'input[placeholder*="accommodation" i]',
                'input[name*="establishment" i]',
                'input[id*="establishment" i]',
                'input[name*="property" i]',
                'input[id*="bbname" i]',
                'input[id*="name" i]',
                'input[placeholder*="search" i]',
                'input[placeholder*="name" i]',
            ]
            scopes = [page] + list(page.frames)
            est_el = None
            for scope in scopes:
                for sel in est_selectors:
                    try:
                        cand = scope.locator(sel).first
                        await cand.wait_for(state="visible", timeout=2000)
                        est_el = cand
                        break
                    except Exception:
                        continue
                if est_el:
                    break

            if est_el is None:
                # Diagnostic — dump the real fields so we can target them exactly.
                dumps = []
                for scope in scopes:
                    try:
                        fs = await scope.eval_on_selector_all(
                            "input,select,textarea",
                            "els => els.filter(e=>e.offsetWidth||e.offsetHeight)"
                            ".map(e=>({t:e.tagName,ty:e.type||'',ph:e.placeholder||'',"
                            "nm:e.name||'',id:e.id||''}))",
                        )
                        if fs:
                            dumps.append(fs)
                    except Exception:
                        pass
                raise Exception(
                    "Could not find the lodge-name field on the NightsBridge search "
                    "form. Visible fields: " + json.dumps(dumps)[:1500]
                )

            await est_el.fill(lodge_name)
            await _human_pause(800, 1200)

            # Handle autocomplete suggestion if one appears
            try:
                sug = page.locator(
                    '[class*="autocomplete"] li:first-child, '
                    '[class*="suggest"] li:first-child, '
                    '[role="option"]:first-child, '
                    '.ui-autocomplete li:first-child'
                ).first
                if await sug.is_visible(timeout=2000):
                    await sug.click()
                    await _human_pause(600, 900)
            except Exception:
                pass

            # Arriving date
            await _nb_fill_date(
                page,
                'input[id*="arriv"], input[name*="arriv"], '
                '#from, [name="from"], input[placeholder*="rriv" i]',
                check_in
            )
            await _human_pause(500, 800)

            # Leaving date
            await _nb_fill_date(
                page,
                'input[id*="leav"], input[name*="leav"], '
                '#to, [name="to"], input[placeholder*="eav" i]',
                check_out
            )
            await _human_pause(500, 800)

            # Number of guests
            try:
                await page.locator(
                    'select[name*="guest"], select[id*="guest"], select[name*="pax"]'
                ).first.select_option(str(guests))
                await _human_pause(300, 500)
            except Exception:
                pass

            # Number of rooms
            try:
                await page.locator(
                    'select[name*="room"], select[id*="room"]'
                ).first.select_option(str(rooms))
                await _human_pause(300, 500)
            except Exception:
                pass

            # Click Search
            await page.locator(
                'button:has-text("Search"), input[value="Search"], a:has-text("Search")'
            ).first.click()
            await page.wait_for_load_state("networkidle", timeout=25000)
            await _human_pause(2000, 3500)

            # ── 3. Parse results ──────────────────────────────────────────────
            print("  📋 Parsing results…")
            properties = await _parse_nb_page(page)
            result["properties"]   = properties
            result["result_count"] = len(properties)
            print(f"  ✅ Found {len(properties)} result(s).")

        except Exception as exc:
            result["error"] = str(exc)
            print(f"  ❌ NightsBridge error: {exc}")
        finally:
            await browser.close()

    return result


# ─────────────────────────────────────────────────────────────────────────────
# OUTPUT HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _save_json(data: dict, path: Path):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  💾 JSON → {path}")


def _save_csv(rows: list, path: Path):
    if not rows:
        return
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f"  💾 CSV  → {path}")


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

async def main():
    parser = argparse.ArgumentParser(description="Wetu Discovery scraper")
    parser.add_argument("--url",  required=True)
    parser.add_argument("--mode", choices=["text","photos","combined","both"], default="combined")
    parser.add_argument("--out",  default="./wetu_output")
    args = parser.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")

    if args.mode in ("text", "both"):
        _save_json(await scrape_text(args.url), out / f"itinerary_text_{ts}.json")

    if args.mode in ("photos", "both"):
        _save_json(await scrape_photos(args.url), out / f"itinerary_photos_{ts}.json")

    if args.mode == "combined":
        data, rows = await scrape_combined(args.url)
        _save_json(data, out / f"itinerary_combined_{ts}.json")
        _save_csv(rows, out / f"itinerary_photos_{ts}.csv")

    print("\n✅  Done! Files saved to:", out.resolve())


if __name__ == "__main__":
    asyncio.run(main())
