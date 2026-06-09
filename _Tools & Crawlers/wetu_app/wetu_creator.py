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
    """Click the blue 'ACCOMMODATION' button that adds a new lodge row.

    A lodge that failed to grab can leave its typeahead dropdown open, which
    overlays and blocks the ACCOMMODATION button. So before each attempt we
    press Escape (and click an empty area) to dismiss any stuck dropdown, and
    we retry a few times rather than giving up after one miss."""
    candidates = [
        "button:has-text('ACCOMMODATION')",
        "a:has-text('ACCOMMODATION')",
        "button:text-is('Accommodation')",
        ".btn:has-text('Accommodation')",
        "input[value='ACCOMMODATION']",
    ]
    for attempt in range(3):
        # Dismiss any open typeahead dropdown / overlay first.
        try:
            page.keyboard.press("Escape")
            page.wait_for_timeout(200)
        except Exception:
            pass
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
                        cand.scroll_into_view_if_needed(timeout=2000)
                        cand.click(timeout=4000)
                        page.wait_for_timeout(800)
                        return True
                except Exception:
                    continue
        page.wait_for_timeout(400)
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


def _menu_item_count(page):
    """How many visible suggestion items are currently in any open typeahead /
    autocomplete dropdown."""
    js = r"""
    () => {
      const vis = el => !!(el.offsetWidth || el.offsetHeight) &&
                        getComputedStyle(el).display !== 'none';
      const menus = [...document.querySelectorAll(
        'ul.typeahead.dropdown-menu, ul.dropdown-menu.typeahead, ' +
        '.bootstrap-typeahead .dropdown-menu, .ui-autocomplete, ' +
        'ul.dropdown-menu, [role="listbox"]')].filter(vis);
      for (const m of menus) {
        const items = [...m.querySelectorAll('li, [role="option"]')].filter(vis);
        if (items.length) return items.length;
      }
      return 0;
    }
    """
    try:
        return int(page.evaluate(js) or 0)
    except Exception:
        return 0


def select_first_result(page, term, target_box):
    """Pick the first autocomplete suggestion AND verify the field kept it.

    Wetu's bootstrap-typeahead clears itself on blur unless a real menu item
    was committed, so reporting success blindly leaves the row blank. We wait
    for the dropdown, click the first item (keyboard as fallback), then confirm
    the target input actually holds a value before declaring success."""
    # Wait for the dropdown to populate (up to ~8s - some lodges are slow to
    # come back from Wetu's search), then let it settle so the real results are
    # rendered and clickable before we try to pick. Clicking the instant the
    # menu first appears is what made slow lodges (e.g. Nooishof) get skipped.
    deadline = time.time() + 8
    appeared = False
    while time.time() < deadline:
        if _menu_item_count(page) > 0:
            appeared = True
            break
        page.wait_for_timeout(200)
    if not appeared:
        # No dropdown ever showed up = Wetu has no match for this name. The
        # typed text is NOT a real selection (it clears on blur), so this is a
        # genuine miss. Clear the box so it doesn't leave a half-typed value.
        try:
            target_box.fill("", timeout=3000)
        except Exception:
            pass
        return False

    # Settle: wait for the result count to stop changing (debounced search).
    prev = -1
    for _ in range(8):
        cur = _menu_item_count(page)
        if cur == prev and cur > 0:
            break
        prev = cur
        page.wait_for_timeout(250)
    page.wait_for_timeout(300)

    item_selectors = [
        "ul.typeahead.dropdown-menu li:visible a",
        "ul.dropdown-menu.typeahead li:visible a",
        ".bootstrap-typeahead .dropdown-menu li:visible a",
        "ul.dropdown-menu li:visible a",
        "ul.dropdown-menu li:visible",
        ".ui-autocomplete li a:visible",
        ".ui-autocomplete li:visible",
        "[role='option']:visible",
        ".tt-suggestion:visible",
    ]

    def committed():
        # IMPORTANT: after typing, the box already holds the typed text, so a
        # non-empty value alone does NOT mean a selection was made. A *real*
        # selection closes the dropdown AND leaves a value behind. A typed-but-
        # unselected field keeps the menu open; a blurred one clears the value.
        try:
            val = (target_box.input_value() or "").strip()
        except Exception:
            val = ""
        if not val:
            return False
        return _menu_item_count(page) == 0

    # The widget binds selection to mousedown+click on the menu <li>/<a>; a JS
    # dispatch is the most reliable way to fire that exact sequence.
    def js_click_first():
        try:
            return bool(page.evaluate(r"""
            () => {
              const vis = el => !!(el.offsetWidth || el.offsetHeight) &&
                                getComputedStyle(el).display !== 'none';
              const menus = [...document.querySelectorAll(
                'ul.typeahead.dropdown-menu, ul.dropdown-menu.typeahead, ' +
                '.bootstrap-typeahead .dropdown-menu, ul.dropdown-menu, ' +
                '.ui-autocomplete, [role="listbox"]')].filter(vis);
              for (const m of menus) {
                const items = [...m.querySelectorAll('li, [role="option"]')].filter(vis);
                if (!items.length) continue;
                const li = items[0];
                const tgt = li.querySelector('a') || li;
                ['mouseenter','mousedown','mouseup','click'].forEach(t =>
                  tgt.dispatchEvent(new MouseEvent(t, {bubbles:true, cancelable:true, view:window})));
                return true;
              }
              return false;
            }
            """))
        except Exception:
            return False

    # Attempt 1 — JS mousedown+click on the first item (what the widget wants).
    if js_click_first():
        page.wait_for_timeout(500)
        if committed():
            return True

    # Attempt 2 — Playwright real click on the first visible item.
    result = first_visible(page, item_selectors, timeout=2000)
    if result:
        try:
            result.click(timeout=4000)
            page.wait_for_timeout(500)
        except Exception:
            pass
        if committed():
            return True

    # Attempt 3 — keyboard Enter only (bootstrap-typeahead auto-highlights the
    # first item, so a bare Enter selects it; ArrowDown would skip to #2).
    try:
        target_box.click(timeout=4000)
        page.wait_for_timeout(200)
        page.keyboard.press("Enter")
        page.wait_for_timeout(500)
    except Exception:
        pass
    if committed():
        return True

    # Attempt 4 — ArrowDown then Enter, as a last resort.
    try:
        page.keyboard.press("ArrowDown")
        page.wait_for_timeout(300)
        page.keyboard.press("Enter")
        page.wait_for_timeout(500)
    except Exception:
        pass
    return committed()


def fill_stop(page, row_index, search_term, nights):
    """Type the lodge name into the newest search box, pick the first result,
    then set nights."""
    log(f"   • [{row_index+1}] {search_term}  ({nights} night{'s' if nights != 1 else ''})")

    # Type the lodge name and commit the dropdown selection. Retry the whole
    # type-and-select up to 3 times before giving up on this one lodge - a
    # single unmatched name must NEVER abort the itinerary (otherwise it never
    # gets saved). Re-tag the search box every attempt: Wetu's bootstrap
    # typeahead can replace its own <input> node, which would invalidate a
    # cached locator and cause a 30s click timeout.
    committed = False
    for attempt in range(3):
        box = find_search_box(page)
        if box is None:
            log(f"     ⚠ couldn't find the search box (try {attempt+1}/3)")
            page.wait_for_timeout(500)
            continue
        try:
            box.click(timeout=5000)
            try:
                box.fill("", timeout=4000)
            except Exception:
                pass
            page.wait_for_timeout(120)
            box.type(search_term, delay=45, timeout=8000)
            if select_first_result(page, search_term, box):
                committed = True
                break
        except Exception as e:
            log(f"     ⚠ attempt {attempt+1} snag: {str(e).splitlines()[0][:60]}")
        log(f"     ↻ '{search_term}' didn't grab (try {attempt+1}/3) - retrying")
        page.wait_for_timeout(500)

    if not committed:
        shot(page, f"no_grab_{search_term[:15]}")
        # Close any dropdown left hanging open so it can't block the next row's
        # ACCOMMODATION button.
        try:
            page.keyboard.press("Escape")
            page.wait_for_timeout(200)
        except Exception:
            pass
        log(f"     ✗ '{search_term}' would not register - leaving blank for "
            f"manual entry, continuing")
        return False  # skip nights too; the row is empty

    page.wait_for_timeout(600)
    try:
        set_nights(page, nights)
    except Exception as e:
        log(f"     ⚠ nights not set ({str(e).splitlines()[0][:40]})")
    page.wait_for_timeout(400)
    return True


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


def _confirm_any_dialog(page):
    """If a modal/confirmation dialog popped up after clicking save, click its
    primary confirm button so the save actually commits."""
    btn = first_visible(page, [
        ".modal.in button:has-text('Save')",
        ".modal.show button:has-text('Save')",
        ".modal.in button:has-text('Yes')",
        ".modal.in button:has-text('OK')",
        ".modal.in button:has-text('Confirm')",
        ".modal.in button:has-text('Continue')",
        ".modal.show button:has-text('OK')",
        ".bootbox button:has-text('OK')",
        ".swal2-confirm",
        ".ui-dialog button:has-text('OK')",
    ], timeout=1500)
    if btn:
        try:
            btn.click()
            page.wait_for_timeout(1500)
            return True
        except Exception:
            pass
    return False


def save_itinerary(page):
    """Persist the itinerary and VERIFY it committed.

    QUICK SAVE saves in-place with no reliable confirmation, and in testing it
    did NOT actually persist the record. SAVE & EXIT is the dependable path: it
    commits AND navigates back out of the /Build/ editor, which is a definitive
    success signal we can wait for. We try SAVE & EXIT first, verify the URL
    left the builder, and only fall back to QUICK SAVE if the button is absent."""
    start_url = page.url

    def _click(btn):
        try:
            btn.click()
            return True
        except Exception:
            try:
                btn.click(force=True)
                return True
            except Exception:
                return False

    # --- Preferred: SAVE & EXIT (commits + navigates to the itinerary list) ---
    btn = first_visible(page, [
        "button:has-text('SAVE & EXIT')",
        "a:has-text('SAVE & EXIT')",
        "button:has-text('Save & Exit')",
        "a:has-text('Save & Exit')",
    ], timeout=6000)
    if btn and _click(btn):
        page.wait_for_timeout(1500)
        _confirm_any_dialog(page)          # commit any "are you sure?" modal
        try:
            # Success = we left the /Build/ editor (back to the browse list).
            page.wait_for_function(
                "() => !location.href.includes('/Build/')", timeout=15000)
            page.wait_for_timeout(2000)
            shot(page, "after_save")
            log("     ↳ Save & Exit returned to the itinerary list")
            return True
        except Exception:
            shot(page, "save_exit_no_nav")
            log("     ⚠ Save & Exit didn't navigate away — trying QUICK SAVE")

    # --- Fallback: QUICK SAVE ---
    btn = first_visible(page, [
        "button:has-text('QUICK SAVE')",
        "a:has-text('QUICK SAVE')",
        "button:has-text('Quick Save')",
        "a:has-text('Quick Save')",
        "button:has-text('Save')",
        "a:has-text('Save')",
    ], timeout=4000)
    if not btn or not _click(btn):
        return False

    page.wait_for_timeout(2000)
    _confirm_any_dialog(page)
    try:
        page.wait_for_load_state("networkidle", timeout=8000)
    except Exception:
        page.wait_for_timeout(3000)
    page.wait_for_timeout(1500)
    shot(page, "after_save")

    try:
        body = (page.inner_text("body") or "").lower()
    except Exception:
        body = ""
    if "could not be saved" in body or "failed to save" in body:
        return False
    return True


def remove_empty_rows(page):
    """Wetu refuses to save while any accommodation row has no hotel selected
    (an 'open leg'). Delete every empty row before saving so the itinerary
    commits with the lodges that DID grab. The user can add the missing ones by
    hand afterwards."""
    removed = 0
    for _ in range(40):  # safety cap
        clicked = False
        try:
            clicked = bool(page.evaluate(r"""
            () => {
              const vis = el => !!(el.offsetWidth || el.offsetHeight);
              const isAlternative = (el) => {
                let node = el;
                for (let i = 0; i < 6 && node; i++) {
                  const prev = node.previousElementSibling;
                  if (prev && /alternative/i.test(prev.textContent || '')) return true;
                  node = node.parentElement;
                }
                return false;
              };
              // Primary (non-alternative) hotel inputs that are still empty.
              const mains = [...document.querySelectorAll('input.bootstrap-typeahead-input-main')]
                              .filter(vis).filter(el => !isAlternative(el));
              for (const inp of mains) {
                if ((inp.value || '').trim()) continue;          // has a hotel - keep
                // Walk up to the smallest ancestor that holds a DELETE control.
                let node = inp.parentElement;
                for (let i = 0; i < 10 && node; i++) {
                  const del = [...node.querySelectorAll('a,button,span,i,div')].find(b => {
                    if (!vis(b)) return false;
                    const t = (b.textContent || '').trim();
                    return /^delete$/i.test(t) || /(^|\s)delete(\s|$)/i.test(b.className || '');
                  });
                  if (del) { del.click(); return true; }
                  node = node.parentElement;
                }
              }
              return false;
            }
            """))
        except Exception:
            clicked = False
        if not clicked:
            break
        removed += 1
        page.wait_for_timeout(500)
        _confirm_any_dialog(page)        # some deletes pop a confirm modal
        page.wait_for_timeout(400)
    if removed:
        log(f"     🧹 removed {removed} empty row(s) so the itinerary can save")
    return removed


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

    added = 0
    missed = []
    for i, (term, nights) in enumerate(itin["stops"]):
        # Wetu's Accommodation step starts EMPTY - we must click the blue
        # ACCOMMODATION button before EVERY stop, including the first. Guard
        # every stop so one problem lodge can't stop us from saving the rest.
        try:
            if not add_accommodation_row(page):
                shot(page, "no_accom_button")
                log(f"     ⚠ couldn't add a row for '{term}' - skipping it")
                missed.append(term)
                continue
            if fill_stop(page, added, term, nights):
                added += 1
            else:
                missed.append(term)
        except Exception as e:
            log(f"     ⚠ '{term}' failed ({str(e).splitlines()[0][:60]}) - "
                f"skipping, continuing")
            missed.append(term)

    shot(page, f"before_save_{itin['name'][:15]}")

    # NEVER auto-save, NEVER close. Build the rows and STOP. The user fills any
    # blank rows and clicks SAVE & EXIT themselves.
    print("\n  ┌──────────────────────────────────────────────┐")
    print(f"  │  Built {added}/{added + len(missed)} lodges. NOT saving — that's")
    print( "  │  yours to do. Fill any blank rows, then SAVE & EXIT.")
    if missed:
        print( "  │  Couldn't auto-fill these (add them by hand):")
        for m in missed:
            print(f"  │    • {m}")
    print("  └──────────────────────────────────────────────┘")
    log("⏸  Done building — window left OPEN. Save it yourself when ready.")
    page.wait_for_timeout(1000)
    return True   # always left open; never saved by the script


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

        def _to_itin(obj):
            stops = []
            for s in (obj.get("stops") or []):
                if isinstance(s, (list, tuple)) and s and str(s[0]).strip():
                    term = str(s[0]).strip()
                    try:
                        nights = int(s[1]) if len(s) > 1 else 1
                    except (ValueError, TypeError):
                        nights = 1
                    stops.append((term, max(1, nights)))
            return {"name": (obj.get("name") or "Custom Itinerary").strip(),
                    "stops": stops}

        # Accept a single itinerary {name, stops}, a list [ {...}, {...} ], or
        # {itineraries:[ ... ]} so one login can build several in one session.
        if isinstance(c, list):
            todo = [_to_itin(o) for o in c if isinstance(o, dict)]
        elif isinstance(c, dict) and isinstance(c.get("itineraries"), list):
            todo = [_to_itin(o) for o in c["itineraries"]]
        else:
            todo = [_to_itin(c)]
        todo = [t for t in todo if t["stops"]]
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

        left_open = False
        for it in todo:
            try:
                if create_one(page, it):
                    left_open = True
            except Exception as e:
                log(f"❌ {it['name']}: {e}")
                shot(page, f"error_{it['name'][:15]}")
                left_open = True
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

        print("\n  Done building. NOTHING was saved — that's yours to do.")
        if args.auto:
            print("\n" + "=" * 60)
            print("  ⏸  The browser will STAY OPEN. Fill any blank rows, then")
            print("      click SAVE & EXIT yourself. Close the window when you're")
            print("      done — the script will NOT close or save it for you.")
            print("=" * 60)
            # Keep the process (and the window) alive indefinitely. It only ends
            # when the user closes the window themselves.
            while True:
                try:
                    page.wait_for_timeout(10000)
                except Exception:
                    return            # user closed the window -> exit quietly
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
