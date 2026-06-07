#!/usr/bin/env python3
"""
wetu_creator.py
================
Auto-creates SAMPLE itineraries in the Wetu Builder using Playwright.

Why Playwright (not the Chrome extension / JS injection):
  Wetu's lodge search is a React autocomplete that only fires on REAL keyboard
  events. Playwright drives Chrome through the DevTools protocol, so its
  keystrokes are indistinguishable from a human's and DO trigger the dropdown.

How it works:
  1. Opens a VISIBLE Chrome window.
  2. Navigates to the Wetu Builder login page and PAUSES.
     -> You log in yourself. No password is ever stored or typed by the script.
  3. Once you press Enter in the terminal, it creates each itinerary:
       - clicks "Create New Itineraries" -> "Sample Itineraries"
       - fills the itinerary name
       - for each stop: types the lodge name, picks the first autocomplete
         match, sets the number of nights
       - saves
  4. On any selector problem it saves a screenshot to ./wetu_creator_debug/
     so we can see exactly what the page looked like and tune the selectors.

USAGE
-----
  # Test run - creates ONLY the first itinerary (Family Namibia):
  python3 wetu_creator.py --test

  # Create ALL itineraries:
  python3 wetu_creator.py

  # Create specific ones by number (1-based, see the list below):
  python3 wetu_creator.py --only 1,5,9

Requirements: playwright (already installed for the scraper).
"""

import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path

from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

BUILDER_URL = "https://wetu.com/Builder"
DEBUG_DIR = Path(__file__).resolve().parent / "wetu_creator_debug"
DEBUG_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
#  ITINERARY DATA  (Safari Drive - Namibia)
#  Each stop is (lodge_search_term, nights). The search term is what gets
#  typed into Wetu's lodge autocomplete - keep it short & distinctive so the
#  first dropdown result is the right property.
# ---------------------------------------------------------------------------
ITINERARIES = [
    {
        "name": "Family Namibia (14 nights)",
        "stops": [
            ("Olive Grove Guesthouse Windhoek", 1),
            ("Okonjima", 1),
            ("Onguma", 1),
            ("Etosha Safari Lodge", 1),
            ("Hoada Campsite", 1),
            ("Khowarib Lodge", 2),
            ("Mowani", 1),
            ("Spitzkoppe", 1),
            ("Desert Breeze Swakopmund", 2),
            ("Desert Quiver Camp", 1),
            ("Bullsport", 1),
            ("Eningu Kalahari Lodge", 1),
        ],
    },
    {
        "name": "Exclusive Northern Namibia (15 nights)",
        "stops": [
            ("Heinitzburg", 1),
            ("Okonjima", 1),
            ("Ongava Lodge", 2),
            ("Hoada Campsite", 1),
            ("Hoanib Valley Camp", 2),
            ("Shipwreck Lodge", 2),
            ("Mowani", 1),
            ("Elephant Rock", 1),
            ("Villa Margherita Swakopmund", 1),
            ("Tsondab Valley Lodge", 2),
            ("Sandwerf", 1),
        ],
    },
    {
        "name": "Coast & Caprivi (14 nights)",
        "stops": [
            ("Olive Grove Guesthouse Windhoek", 1),
            ("Brigadoon Swakopmund", 2),
            ("Spitzkoppe", 1),
            ("Mowani", 1),
            ("Etosha Safari Lodge", 1),
            ("Onguma", 2),
            ("Hakusembe River Lodge", 1),
            ("Nunda", 1),
            ("Nambwa", 1),
            ("Muchenje", 1),
            ("Waterberry Lodge Livingstone", 2),
        ],
    },
    {
        "name": "Scenery & Solitude (16 nights)",
        "stops": [
            ("Olive Grove Guesthouse Windhoek", 1),
            ("Bagatelle Kalahari", 1),
            ("Mesosaurus Fossil Camp", 1),
            ("Fish River Lodge", 2),
            ("Eagle's Nest Klein Aus Vista", 2),
            ("Little Hunter's Rest Namtib", 1),
            ("Nooishof", 2),
            ("NamibRand Family Hideout", 1),
            ("Le Mirage Sesriem", 1),
            ("Tsondab Valley Lodge", 2),
            ("Namibgrens", 1),
            ("Eningu Kalahari Lodge", 1),
        ],
    },
    {
        "name": "Camp Namibia (13 nights)",
        "stops": [
            ("Galton House Windhoek", 1),
            ("Okonjima", 1),
            ("Onguma", 2),
            ("Etosha Trading Post", 1),
            ("Hoada Campsite", 1),
            ("Mowani", 2),
            ("Spitzkoppe", 1),
            ("Desert Breeze Swakopmund", 1),
            ("Sesriem Campsite", 1),
            ("Namibgrens", 1),
            ("River Crossing Lodge Windhoek", 1),
        ],
    },
    {
        "name": "Houseboat & Bushmen (17 nights)",
        "stops": [
            ("Olive Grove Guesthouse Windhoek", 1),
            ("Spitzkoppe", 2),
            ("Mowani", 2),
            ("Andersson's at Ongava", 1),
            ("Mushara Outpost", 2),
            ("Mukuri Village Campsite", 2),
            ("Kubu Queen Houseboat", 3),
            ("Nambwa", 2),
            ("Waterberry Lodge Livingstone", 2),
        ],
    },
    {
        "name": "Namibia in Depth (27 nights)",
        "stops": [
            ("River Crossing Lodge Windhoek", 1),
            ("Bagatelle Kalahari", 1),
            ("Canyon Road House", 2),
            ("Eagle's Nest Klein Aus Vista", 2),
            ("NamibRand Family Hideout", 2),
            ("Sossusvlei Lodge Sesriem", 1),
            ("Villa Margherita Swakopmund", 2),
            ("Spitzkoppe", 1),
            ("Malansrus", 2),
            ("Camp Aussicht", 1),
            ("Purros Community Campsite", 2),
            ("Khowarib Lodge", 1),
            ("Etendeka Mountain Camp", 2),
            ("Hoada Campsite", 1),
            ("Etosha Oberland Lodge", 1),
            ("Onguma", 2),
            ("Waterberg Plateau Campsite", 2),
            ("Olive Grove Guesthouse Windhoek", 1),
        ],
    },
    {
        "name": "Dunes & Falls (19 nights)",
        "stops": [
            ("Waterberry Lodge Livingstone", 2),
            ("Muchenje", 2),
            ("Kazile Island Lodge", 2),
            ("Nunda", 1),
            ("Hakusembe River Lodge", 1),
            ("Onguma", 2),
            ("Etosha Safari Lodge", 1),
            ("Granietkop", 1),
            ("Spitzkoppe", 1),
            ("Desert Breeze Swakopmund", 2),
            ("Le Mirage Sesriem", 1),
            ("NamibRand Family Hideout", 1),
            ("Barkhan Dune Retreat", 1),
            ("Eningu Kalahari Lodge", 1),
        ],
    },
    {
        "name": "Luxury Namibia (18 nights)",
        "stops": [
            ("Omaanda", 1),
            ("Okonjima Luxury Bush Camp", 1),
            ("Onguma Tented Camp", 2),
            ("Encounter by Ongava", 1),
            ("Grootberg Lodge", 1),
            ("Hoanib Valley Camp", 2),
            ("Mowani Mountain Camp", 1),
            ("Villa Margherita Swakopmund", 2),
            ("Tsondab Valley Lodge", 2),
            ("Le Mirage Sesriem", 1),
            ("Wolwedans Dune Camp", 2),
            ("Namibgrens", 1),
            ("Sandwerf", 1),
        ],
    },
    {
        "name": "Classic Namibia (16 nights)",
        "stops": [
            ("River Crossing Lodge Windhoek", 1),
            ("Otjiwa", 1),
            ("Onguma", 2),
            ("Etosha Safari Lodge", 1),
            ("Hoada Campsite", 1),
            ("Etendeka Mountain Camp", 2),
            ("Mowani", 1),
            ("Spitzkoppe", 1),
            ("Brigadoon Swakopmund", 2),
            ("Dead Valley Lodge", 1),
            ("NamibRand Family Hideout", 1),
            ("Namibgrens", 1),
            ("Sandwerf", 1),
        ],
    },
]


# ---------------------------------------------------------------------------
#  Helpers
# ---------------------------------------------------------------------------
def log(msg):
    print(f"  {msg}", flush=True)


def shot(page, label):
    """Save a debug screenshot."""
    ts = datetime.now().strftime("%H%M%S")
    path = DEBUG_DIR / f"{ts}_{label}.png"
    try:
        page.screenshot(path=str(path), full_page=True)
        log(f"📸 debug screenshot -> {path.name}")
    except Exception:
        pass


def first_visible(page, selectors, timeout=4000):
    """Return the first selector (from a list) that resolves to a visible
    element, else None. Tries each quickly."""
    for sel in selectors:
        try:
            loc = page.locator(sel).first
            loc.wait_for(state="visible", timeout=timeout)
            return loc
        except PWTimeout:
            continue
        except Exception:
            continue
    return None


# ---------------------------------------------------------------------------
#  Core creation flow
#  NOTE: Wetu's Builder DOM is not publicly documented. The selectors below
#  are best-effort with several fallbacks each. The script screenshots every
#  step so we can tune any selector that misses on the first real run.
# ---------------------------------------------------------------------------
def open_sample_form(page):
    """From the Builder dashboard, open the 'Create Sample Itinerary' form."""
    log("Opening 'Create New Itineraries' …")
    create_btn = first_visible(page, [
        "text=Create New Itineraries",
        "button:has-text('Create New')",
        "a:has-text('Create New')",
        "text=Create New Itinerary",
    ], timeout=8000)
    if create_btn:
        create_btn.click()
        page.wait_for_timeout(800)

    log("Choosing 'Sample Itineraries' …")
    sample_btn = first_visible(page, [
        "text=Sample Itineraries",
        "text=Sample Itinerary",
        "button:has-text('Sample')",
        "a:has-text('Sample')",
    ], timeout=8000)
    if not sample_btn:
        shot(page, "no_sample_button")
        raise RuntimeError("Could not find the 'Sample Itineraries' button.")
    sample_btn.click()
    page.wait_for_timeout(1500)


def set_itinerary_name(page, name):
    log(f"Setting name: {name}")
    name_field = first_visible(page, [
        "input[name='Name']",
        "input[name='name']",
        "input[placeholder*='name' i]",
        "input[placeholder*='title' i]",
        "input[type='text']",
    ], timeout=8000)
    if not name_field:
        shot(page, "no_name_field")
        raise RuntimeError("Could not find the itinerary name field.")
    name_field.click()
    name_field.fill("")
    name_field.type(name, delay=40)
    page.wait_for_timeout(300)


def go_next_step(page):
    nxt = first_visible(page, [
        "button:has-text('Next Step')",
        "button:has-text('Next')",
        "a:has-text('Next Step')",
        "text=Next Step",
    ], timeout=6000)
    if nxt:
        nxt.click()
        page.wait_for_timeout(1200)
        return True
    return False


def add_accommodation_row(page):
    """Click the blue 'ACCOMMODATION' button that adds a new lodge row."""
    # The button sits next to an 'Add:' label. Match it specifically and avoid
    # the step-2 heading which also reads 'Accommodation'.
    candidates = [
        "button:has-text('ACCOMMODATION')",
        "a:has-text('ACCOMMODATION')",
        "button:text-is('Accommodation')",
        ".btn:has-text('Accommodation')",
        "input[value='ACCOMMODATION']",
    ]
    for sel in candidates:
        loc = page.locator(sel)
        try:
            n = loc.count()
        except Exception:
            n = 0
        for k in range(n):
            cand = loc.nth(k)
            try:
                if cand.is_visible():
                    cand.click()
                    page.wait_for_timeout(900)
                    return True
            except Exception:
                continue
    return False


def find_search_box(page, timeout=6000):
    """Return the PRIMARY 'select a hotel' input of the newest accommodation
    row - explicitly skipping the 'Alternative 1' / 'Alternative 2' fields.

    Wetu's row layout is:  [main hotel]  Destination  Alternative 1  Alternative 2
    The alternatives share the same 'select a hotel' placeholder, so we tell
    them apart by checking whether a nearby label reads 'Alternative'. The
    chosen input is tagged with data-wetu-target so Playwright can act on it.
    """
    js = r"""
    () => {
      const vis = el => !!(el.offsetWidth || el.offsetHeight);
      const T = el => (el && el.textContent ? el.textContent : '');

      // The hotel fields are Bootstrap Typeahead widgets. The TYPEABLE box is
      // 'bootstrap-typeahead-input-main'. Each row has a primary one (label =
      // the row letter A/B/C...) plus the Alternative 1/2 boxes (label =
      // 'Alternative N'). We want the primary: a -main input that is NOT under
      // an 'Alternative' label.
      const isAlternative = (input) => {
        let node = input;
        for (let i = 0; i < 6 && node; i++) {
          let sib = node.previousElementSibling;
          while (sib) {
            if (/alternative/i.test(T(sib))) return true;
            sib = sib.previousElementSibling;
          }
          node = node.parentElement;
        }
        return false;
      };

      let mains = [...document.querySelectorAll('input.bootstrap-typeahead-input-main')]
                    .filter(vis);
      let primaries = mains.filter(el => !isAlternative(el));
      if (!primaries.length) {
        // Fallback: any visible 'select a hotel' input that isn't an alternative
        primaries = [...document.querySelectorAll('input')].filter(el =>
          vis(el) && /select a hotel/i.test(el.placeholder || '') && !isAlternative(el));
      }
      if (!primaries.length) return false;
      document.querySelectorAll('[data-wetu-target]')
              .forEach(e => e.removeAttribute('data-wetu-target'));
      // newest row is the last primary in the DOM
      primaries[primaries.length - 1].setAttribute('data-wetu-target', '1');
      return true;
    }
    """
    deadline = time.time() + timeout / 1000.0
    while time.time() < deadline:
        try:
            ok = page.evaluate(js)
        except Exception:
            ok = False
        if ok:
            return page.locator('[data-wetu-target="1"]').first
        page.wait_for_timeout(300)
    return None


def select_first_result(page, term):
    """Pick the first autocomplete suggestion. Tries a real click on a visible
    result first, then falls back to keyboard (ArrowDown + Enter), which most
    autocomplete widgets honour."""
    page.wait_for_timeout(1500)  # let the dropdown populate
    result = first_visible(page, [
        ".ui-autocomplete li a:visible",
        ".ui-autocomplete li:visible",
        "ul.dropdown-menu li:visible",
        "li.ui-menu-item:visible",
        "[role='option']:visible",
        ".tt-suggestion:visible",
        ".autocomplete-suggestion:visible",
        ".search-result:visible",
        ".results li:visible",
    ], timeout=2500)
    if result:
        try:
            result.click()
            return True
        except Exception:
            pass
    # Keyboard fallback.
    try:
        page.keyboard.press("ArrowDown")
        page.wait_for_timeout(400)
        page.keyboard.press("Enter")
        page.wait_for_timeout(400)
        return True
    except Exception:
        return False


def fill_stop(page, row_index, search_term, nights):
    """Type the lodge name into the newest search box, pick the first result,
    then set nights."""
    log(f"   • [{row_index+1}] {search_term}  ({nights} night{'s' if nights != 1 else ''})")

    box = find_search_box(page)
    if box is None:
        shot(page, f"no_search_row{row_index}")
        dump_dom(page, f"no_search_row{row_index}")
        raise RuntimeError(f"Could not find search box for row {row_index+1}.")

    # Real keystrokes trigger the React/jQuery autocomplete.
    box.click()
    try:
        box.fill("")
    except Exception:
        pass
    box.type(search_term, delay=90)

    if not select_first_result(page, search_term):
        shot(page, f"no_dropdown_{search_term[:15]}")
        dump_dom(page, f"no_dropdown_{search_term[:15]}")
        raise RuntimeError(f"No autocomplete results for '{search_term}'.")
    page.wait_for_timeout(800)

    # Verify the PRIMARY field actually received the hotel. If it's empty we
    # targeted the wrong box - dump Wetu's real HTML so the selector can be
    # finalised (only on the first stop, to keep the log clean).
    if row_index == 0:
        try:
            filled = (box.input_value() or "").strip()
        except Exception:
            filled = ""
        if not filled:
            shot(page, "primary_empty")
            dump_dom(page, "primary_empty_row")
            log("     ⚠ primary hotel field looks empty - dumped DOM for review")

    set_nights(page, nights)
    page.wait_for_timeout(400)


def set_nights(page, nights):
    """Set the nights for the newest row. Wetu uses a '- N +' stepper whose
    box is read-only, so we read the current value and click '+' (or '-') the
    right number of times rather than typing."""
    # Tag the newest row's nights box and its +/- buttons.
    js = r"""
    () => {
      const vis = el => !!(el.offsetWidth || el.offsetHeight);
      const nearNights = (el) => {
        let node = el;
        for (let i = 0; i < 5 && node; i++) {
          if (/night/i.test(node.textContent || '')) return true;
          node = node.parentElement;
        }
        return false;
      };
      // numeric, visible inputs that sit near a 'Nights' label
      const boxes = [...document.querySelectorAll('input')].filter(el => {
        if (!vis(el)) return false;
        const v = (el.value || '').trim();
        return /^\d+$/.test(v) && nearNights(el);
      });
      if (!boxes.length) return false;
      document.querySelectorAll('[data-wetu-nights],[data-wetu-plus],[data-wetu-minus]')
        .forEach(e => { e.removeAttribute('data-wetu-nights');
                        e.removeAttribute('data-wetu-plus');
                        e.removeAttribute('data-wetu-minus'); });
      const box = boxes[boxes.length - 1];      // newest row
      box.setAttribute('data-wetu-nights', '1');
      // find +/- controls in the surrounding container
      let container = box.parentElement, plus = null, minus = null;
      for (let i = 0; i < 4 && container && !(plus && minus); i++) {
        const ctrls = [...container.querySelectorAll('button, a, span, div, i')]
          .filter(b => vis(b));
        for (const b of ctrls) {
          const t = (b.textContent || '').trim();
          const cls = (b.className || '') + ' ' + (b.getAttribute('class') || '');
          if (!plus && (t === '+' || /plus|increment|fa-plus/i.test(cls))) plus = b;
          if (!minus && (t === '-' || /minus|decrement|fa-minus/i.test(cls))) minus = b;
        }
        container = container.parentElement;
      }
      if (plus) plus.setAttribute('data-wetu-plus', '1');
      if (minus) minus.setAttribute('data-wetu-minus', '1');
      return true;
    }
    """
    try:
        ok = page.evaluate(js)
    except Exception:
        ok = False
    if not ok:
        log("     ⚠ couldn't locate nights field (set it by hand if needed)")
        return

    box = page.locator('[data-wetu-nights="1"]').first
    try:
        current = int((box.input_value() or "1").strip() or "1")
    except Exception:
        current = 1

    delta = nights - current
    if delta == 0:
        return

    btn_sel = '[data-wetu-plus="1"]' if delta > 0 else '[data-wetu-minus="1"]'
    btn = page.locator(btn_sel).first
    if btn.count() == 0:
        # Fallback: try typing into the box directly.
        try:
            box.fill(str(nights))
            return
        except Exception:
            log("     ⚠ couldn't set nights automatically (set it by hand if needed)")
            return
    for _ in range(abs(delta)):
        try:
            btn.click()
            page.wait_for_timeout(180)
        except Exception:
            break


def dump_dom(page, label):
    """Save the page body HTML and list every visible input - so we can read
    Wetu's real field names/placeholders and finalise the selectors."""
    ts = datetime.now().strftime("%H%M%S")
    try:
        html = page.locator("body").inner_html()
        path = DEBUG_DIR / f"{ts}_{label}.html"
        path.write_text(html, encoding="utf-8")
        log(f"📝 DOM dump -> {path.name}")
    except Exception:
        pass
    try:
        infos = page.eval_on_selector_all(
            "input, textarea, select",
            "els => els.map(e => ({tag:e.tagName, ph:e.placeholder||'', "
            "name:e.name||'', cls:(e.className||'').slice(0,50), "
            "type:e.type||'', vis: !!(e.offsetWidth||e.offsetHeight)}))",
        )
        visible = [i for i in infos if i.get("vis")]
        log(f"   visible fields ({len(visible)}):")
        for i in visible[:25]:
            log(f"     {i['tag'].lower()} type='{i['type']}' "
                f"ph='{i['ph']}' name='{i['name']}' cls='{i['cls']}'")
    except Exception as e:
        log(f"   (field dump failed: {e})")


def save_itinerary(page):
    # Prefer QUICK SAVE - it persists the itinerary without leaving the page,
    # so the record is committed before we navigate to the next itinerary.
    btn = first_visible(page, [
        "button:has-text('QUICK SAVE')",
        "a:has-text('QUICK SAVE')",
        "button:has-text('Quick Save')",
        "button:has-text('Save & Exit')",
        "a:has-text('Save & Exit')",
        "button:has-text('Save')",
        "a:has-text('Save')",
    ], timeout=6000)
    if btn:
        btn.click()
        page.wait_for_timeout(3000)  # let the save complete
        return True
    return False


def create_one(page, itin):
    print(f"\n╔══════════════════════════════════════════════╗")
    print(f"║  CREATING: {itin['name'][:34]:<34}║")
    print(f"╚══════════════════════════════════════════════╝")
    # Always start each itinerary from a fresh Builder dashboard, otherwise the
    # 'Create New -> Sample' step can fail and lodges pile into the open one.
    page.goto(BUILDER_URL, wait_until="domcontentloaded")
    page.wait_for_timeout(1800)
    open_sample_form(page)
    set_itinerary_name(page, itin["name"])
    go_next_step(page)            # -> Accommodation step

    for i, (term, nights) in enumerate(itin["stops"]):
        # Wetu's Accommodation step starts EMPTY - we must click the blue
        # ACCOMMODATION button before EVERY stop, including the first.
        if not add_accommodation_row(page):
            shot(page, "no_accom_button")
            dump_dom(page, "no_accom_button")
            raise RuntimeError("Could not find the ACCOMMODATION button.")
        fill_stop(page, i, term, nights)

    shot(page, f"before_save_{itin['name'][:15]}")
    if save_itinerary(page):
        log("✅ saved")
    else:
        log("⚠ no Save button found — left open for you to review/save")
    page.wait_for_timeout(1500)


# ---------------------------------------------------------------------------
#  Main
# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Create Wetu sample itineraries.")
    ap.add_argument("--test", action="store_true",
                    help="Create only the FIRST itinerary (Family Namibia).")
    ap.add_argument("--only", type=str, default="",
                    help="Comma-separated 1-based indexes, e.g. 1,5,9")
    ap.add_argument("--auto", action="store_true",
                    help="Launched from the app: auto-detect login (no ENTER "
                         "prompts), auto-continue past errors, auto-close at end.")
    ap.add_argument("--custom", type=str, default="",
                    help="Path to a JSON file {name, stops:[[lodge, nights], ...]} "
                         "to build a single brand-new itinerary instead of a preset.")
    args = ap.parse_args()

    # Decide which itineraries to build.
    if args.custom:
        with open(args.custom, encoding="utf-8") as f:
            c = json.load(f)
        stops = []
        for s in (c.get("stops") or []):
            if isinstance(s, (list, tuple)) and s and str(s[0]).strip():
                term = str(s[0]).strip()
                try:
                    nights = int(s[1]) if len(s) > 1 else 1
                except (ValueError, TypeError):
                    nights = 1
                stops.append((term, max(1, nights)))
        todo = [{"name": (c.get("name") or "Custom Itinerary").strip(), "stops": stops}]
    elif args.test:
        todo = ITINERARIES[:1]
    elif args.only:
        idxs = [int(x) - 1 for x in args.only.split(",") if x.strip().isdigit()]
        todo = [ITINERARIES[i] for i in idxs if 0 <= i < len(ITINERARIES)]
    else:
        todo = ITINERARIES

    print("\n  Itineraries queued:")
    for it in todo:
        print(f"    • {it['name']}  ({len(it['stops'])} stops)")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, args=["--start-maximized"])
        ctx = browser.new_context(no_viewport=True)
        page = ctx.new_page()

        log(f"Opening {BUILDER_URL} …")
        page.goto(BUILDER_URL, wait_until="domcontentloaded")

        print("\n" + "=" * 60)
        print("  👉  LOG IN to Wetu in the browser window that just opened.")
        if args.auto:
            print("      Once you see the Builder dashboard, the app will start")
            print("      creating automatically — no need to come back here.")
            print("=" * 60)
            if not wait_for_login(page):
                print("  ⏱  Timed out waiting for login. Closing.")
                browser.close()
                return
        else:
            print("      Wait until you can see the Builder dashboard, then come")
            print("      back here and press ENTER to start creating.")
            print("=" * 60)
            try:
                input("\n  Press ENTER once you're logged in … ")
            except (EOFError, KeyboardInterrupt):
                print("  Cancelled.")
                browser.close()
                return

        for it in todo:
            try:
                create_one(page, it)
            except Exception as e:
                log(f"❌ {it['name']}: {e}")
                shot(page, f"error_{it['name'][:15]}")
                if not args.auto:
                    ans = input("  Continue with the next itinerary? [y/N] ").strip().lower()
                    if ans != "y":
                        break
                # Return to the dashboard before the next one.
                try:
                    page.goto(BUILDER_URL, wait_until="domcontentloaded")
                    page.wait_for_timeout(1500)
                except Exception:
                    pass

        print("\n  Done. Review the itineraries in Wetu before sending to clients.")
        if args.auto:
            page.wait_for_timeout(2500)
        else:
            input("  Press ENTER to close the browser … ")
        browser.close()


def wait_for_login(page, timeout=300):
    """Poll the Builder dashboard until the user has logged in (the 'Create New
    Itineraries' / 'Sample Itineraries' controls appear). Returns True on
    success, False on timeout."""
    log("Waiting for you to log in to Wetu …")
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            for sel in ["text=Sample Itineraries", "text=Create New Itineraries",
                        "text=PERSONAL ITINERARIES"]:
                loc = page.locator(sel).first
                if loc.count() and loc.is_visible():
                    log("✓ Logged in — starting.")
                    page.wait_for_timeout(800)
                    return True
        except Exception:
            pass
        # IMPORTANT: do NOT navigate while the user is on a login/account page —
        # re-navigating would wipe the login form before they can sign in. Only
        # nudge back to the Builder if we've landed somewhere that is neither the
        # login page nor the Builder itself.
        try:
            u = (page.url or "").lower()
            on_login = ("login" in u) or ("account.wetu" in u) or ("signin" in u)
            if ("builder" not in u) and not on_login:
                page.goto(BUILDER_URL, wait_until="domcontentloaded")
        except Exception:
            pass
        page.wait_for_timeout(2000)
    return False


if __name__ == "__main__":
    main()
