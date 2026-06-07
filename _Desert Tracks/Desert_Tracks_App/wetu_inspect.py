#!/usr/bin/env python3
"""
wetu_inspect.py  -  one-shot DOM inspector for the Wetu accommodation row.

It logs in (you do it), creates a throwaway sample itinerary, goes to the
Accommodation step, clicks ACCOMMODATION once, then prints a compact table of
every visible input: its placeholder, the nearest label text to its left, and
whether a 'ROOM DETAILS' button follows it. That tells us which box is the
PRIMARY 'select a hotel' field versus the Alternative 1 / 2 fields, so the
creator's selector can be finalised. It also saves the row's raw HTML.

Run:  python3 wetu_inspect.py
"""

from playwright.sync_api import sync_playwright
import wetu_creator as wc   # reuse the navigation helpers

INSPECT_JS = r"""
() => {
  const vis = el => !!(el.offsetWidth || el.offsetHeight);
  const inputs = [...document.querySelectorAll('input')].filter(vis);
  const out = [];
  inputs.forEach((el, i) => {
    // nearest non-empty preceding text (the field's label)
    let label = '';
    let node = el;
    for (let l = 0; l < 6 && node && !label; l++) {
      let sib = node.previousElementSibling;
      while (sib && !label) {
        const t = (sib.textContent || '').trim();
        if (t) label = t.slice(0, 30);
        sib = sib.previousElementSibling;
      }
      node = node.parentElement;
    }
    // is a ROOM DETAILS control just after it?
    let rd = false;
    const starts = [el, el.parentElement,
                    el.parentElement ? el.parentElement.parentElement : null];
    for (const s of starts) {
      if (!s) continue;
      let sib = s, st = 0;
      while (sib && st < 6) {
        sib = sib.nextElementSibling; st++;
        if (sib && /room details/i.test(sib.textContent || '')) { rd = true; break; }
      }
      if (rd) break;
    }
    out.push({
      i, ph: el.placeholder || '', name: el.name || '', id: el.id || '',
      cls: (el.className || '').slice(0, 60), label, rd
    });
  });
  return out;
}
"""

ROW_HTML_JS = r"""
() => {
  const all = [...document.querySelectorAll('*')];
  const row = all.find(e =>
    /room details/i.test(e.textContent || '') &&
    /alternative\s*1/i.test(e.textContent || '') &&
    e.querySelectorAll('input').length >= 2 &&
    e.querySelectorAll('input').length <= 8);
  return row ? row.outerHTML : document.body.innerHTML.slice(0, 8000);
}
"""


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, args=["--start-maximized"])
        ctx = browser.new_context(no_viewport=True)
        page = ctx.new_page()
        page.goto(wc.BUILDER_URL, wait_until="domcontentloaded")

        print("\n" + "=" * 60)
        print("  Log in to Wetu in the browser, wait for the dashboard,")
        print("  then come back here and press ENTER.")
        print("=" * 60)
        input("\n  Press ENTER once logged in … ")

        wc.open_sample_form(page)
        wc.set_itinerary_name(page, "INSPECT TEST (delete me)")
        wc.go_next_step(page)
        wc.add_accommodation_row(page)
        page.wait_for_timeout(1800)

        data = page.evaluate(INSPECT_JS)
        print("\n================ VISIBLE INPUTS ================")
        for d in data:
            print(f"[{d['i']:>2}] ph='{d['ph']}'  label='{d['label']}'  "
                  f"ROOM_DETAILS_AFTER={d['rd']}")
            print(f"     name='{d['name']}' id='{d['id']}' cls='{d['cls']}'")
        print("================================================")

        try:
            html = page.evaluate(ROW_HTML_JS)
            with open("wetu_row_dump.html", "w", encoding="utf-8") as f:
                f.write(html)
            print(f"\n  Saved row HTML ({len(html)} chars) -> wetu_row_dump.html")
        except Exception as e:
            print("  row dump failed:", e)

        print("\n  ^ Screenshot the VISIBLE INPUTS block above and send it to Claude.")
        input("\n  Press ENTER to close the browser … ")
        browser.close()


if __name__ == "__main__":
    main()
