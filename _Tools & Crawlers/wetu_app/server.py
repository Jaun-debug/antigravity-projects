#!/usr/bin/env python3
"""
server.py — Wetu Itinerary local server
========================================
Serves the viewer UI and runs the Playwright scraper on demand.

Start with:
    python server.py

Then open:  http://localhost:5050
Paste any Wetu URL into the input field and hit Go.

Install deps:
    pip install flask flask-cors playwright
    playwright install chromium
"""

import asyncio
import json
import os
import sys
import subprocess
import threading
from pathlib import Path
from datetime import datetime

from flask import Flask, jsonify, request, send_from_directory, abort
from flask_cors import CORS

# ── Import scraper functions from wetu_scraper.py in the same folder ─────────
SCRIPT_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_DIR))

try:
    from wetu_scraper import scrape_combined, scrape_text, scrape_photos, scrape_both, scrape_accommodation, scrape_nightsbridge, scrape_nb_regions
except ImportError as e:
    print(f"\n❌  Could not import wetu_scraper.py — make sure it is in the same folder.\n   ({e})\n")
    sys.exit(1)

# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__, static_folder=str(SCRIPT_DIR))
CORS(app)  # Allow the HTML file to call the API even when opened via file://

OUTPUT_DIR = SCRIPT_DIR / "wetu_output"
OUTPUT_DIR.mkdir(exist_ok=True)

CREDS_FILE = SCRIPT_DIR / "nb_credentials.json"

def _load_nb_creds():
    """Load saved NightsBridge credentials from disk."""
    if CREDS_FILE.exists():
        try:
            return json.loads(CREDS_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"email": "", "password": ""}

def _save_nb_creds(email: str, password: str):
    """Persist NightsBridge credentials to disk."""
    CREDS_FILE.write_text(
        json.dumps({"email": email, "password": password}, indent=2),
        encoding="utf-8"
    )

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    """Serve the scraper app HTML."""
    return send_from_directory(str(SCRIPT_DIR), "wetu_scraper_app.html")


def _run_scraper(coro):
    """Run an async scraper coroutine synchronously in a fresh event loop."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


def _validate_url(body):
    url = (body.get("url") or "").strip()
    if not url:
        return None, ("No URL provided.", 400)
    if "wetu.com" not in url.lower():
        return None, ("URL does not look like a Wetu itinerary link.", 400)
    return url, None


def _save_and_respond(data, mode):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out = OUTPUT_DIR / f"itinerary_{mode}_{ts}.json"
    out.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  💾 Saved → {out}")
    return jsonify(data)


@app.route("/api/scrape/text", methods=["POST"])
def api_scrape_text():
    """
    POST /api/scrape/text
    Body: { "url": "https://wetu.com/..." }
    Returns day-by-day text JSON.
    """
    body = request.get_json(force=True, silent=True) or {}
    url, err = _validate_url(body)
    if err:
        return jsonify({"error": err[0]}), err[1]
    try:
        data = _run_scraper(scrape_text(url))
    except Exception as e:
        return jsonify({"error": f"Scraper error: {e}"}), 500
    return _save_and_respond(data, "text")


@app.route("/api/scrape/photos", methods=["POST"])
def api_scrape_photos():
    """
    POST /api/scrape/photos
    Body: { "url": "https://wetu.com/..." }
    Returns unique photo URLs grouped by stop.
    """
    body = request.get_json(force=True, silent=True) or {}
    url, err = _validate_url(body)
    if err:
        return jsonify({"error": err[0]}), err[1]
    try:
        data = _run_scraper(scrape_photos(url))
    except Exception as e:
        return jsonify({"error": f"Scraper error: {e}"}), 500
    return _save_and_respond(data, "photos")


@app.route("/api/scrape/both", methods=["POST"])
def api_scrape_both():
    """
    POST /api/scrape/both
    Body: { "url": "https://wetu.com/..." }
    Single browser session — text + photos merged per stop in ~same time as one scrape.
    """
    body = request.get_json(force=True, silent=True) or {}
    url, err = _validate_url(body)
    if err:
        return jsonify({"error": err[0]}), err[1]
    try:
        data = _run_scraper(scrape_both(url))
    except Exception as e:
        return jsonify({"error": f"Scraper error: {e}"}), 500
    return _save_and_respond(data, "both")


@app.route("/api/scrape/accommodation", methods=["POST"])
def api_scrape_accommodation():
    """
    POST /api/scrape/accommodation
    Body: { "urls": "https://wetu.com/...\nhttps://wetu.com/..." }
    Accepts one or more Wetu URLs (newline-separated).
    Returns per-lodge: rooms, restaurants, activities, information.
    """
    body = request.get_json(force=True, silent=True) or {}
    raw  = body.get("urls") or body.get("url") or ""
    if isinstance(raw, list):
        urls = [u.strip() for u in raw if u.strip()]
    else:
        urls = [u.strip() for u in str(raw).splitlines() if u.strip()]

    valid = [u for u in urls if "wetu.com" in u.lower()]
    if not valid:
        return jsonify({"error": "No valid Wetu URLs provided."}), 400
    try:
        data = _run_scraper(scrape_accommodation(valid))
    except Exception as e:
        return jsonify({"error": f"Scraper error: {e}"}), 500
    return _save_and_respond(data, "accommodation")


@app.route("/api/scrape/nb-regions", methods=["POST"])
def api_scrape_nb_regions():
    """
    POST /api/scrape/nb-regions
    Body: {
        "email":    "agent@example.com",
        "password": "...",
        "guests":   2,
        "rooms":    1,
        "regions":  [
            {"region": "Chobe National Park", "check_in": "2026-09-08", "check_out": "2026-09-10"},
            {"region": "Moremi Game Reserve",  "check_in": "2026-09-03", "check_out": "2026-09-06"}
        ]
    }
    Returns all lodges per region with room-type availability.
    """
    body     = request.get_json(force=True, silent=True) or {}
    email    = (body.get("email")    or "").strip()
    password = (body.get("password") or "").strip()
    guests   = int(body.get("guests") or 2)
    rooms    = int(body.get("rooms")  or 1)
    regions  = body.get("regions") or []

    if not email:
        return jsonify({"error": "NightsBridge email is required."}), 400
    if not password:
        return jsonify({"error": "NightsBridge password is required."}), 400
    if not regions:
        return jsonify({"error": "At least one region is required."}), 400

    valid = [r for r in regions if r.get("region") and r.get("check_in") and r.get("check_out")]
    if not valid:
        return jsonify({"error": "Each region needs a name, check_in, and check_out."}), 400

    try:
        data = _run_scraper(scrape_nb_regions(email, password, valid, guests, rooms))
    except Exception as e:
        return jsonify({"error": f"Scraper error: {e}"}), 500
    return _save_and_respond(data, "nb_regions")


@app.route("/api/scrape/nightsbridge", methods=["POST"])
def api_scrape_nightsbridge():
    """
    POST /api/scrape/nightsbridge
    Body: {
        "email":      "agent@example.com",
        "password":   "...",
        "lodge_name": "Camp Moremi",
        "check_in":   "2026-09-03",
        "check_out":  "2026-09-06",
        "guests":     2,
        "rooms":      1
    }
    Returns room types with rate / availability per date.
    """
    body      = request.get_json(force=True, silent=True) or {}
    saved     = _load_nb_creds()
    email     = (body.get("email")     or saved.get("email")    or "").strip()
    password  = (body.get("password")  or saved.get("password") or "").strip()
    lodge     = (body.get("lodge_name") or body.get("lodge") or "").strip()
    check_in  = (body.get("check_in")  or "").strip()
    check_out = (body.get("check_out") or "").strip()
    guests    = int(body.get("guests") or 2)
    rooms     = int(body.get("rooms")  or 1)

    if not email:
        return jsonify({"error": "NightsBridge email is required."}), 400
    if not password:
        return jsonify({"error": "NightsBridge password is required."}), 400
    if not lodge:
        return jsonify({"error": "Lodge name is required."}), 400
    if not check_in or not check_out:
        return jsonify({"error": "check_in and check_out dates are required (YYYY-MM-DD)."}), 400

    try:
        data = _run_scraper(scrape_nightsbridge(email, password, lodge, check_in, check_out, guests, rooms))
    except Exception as e:
        return jsonify({"error": f"Scraper error: {e}"}), 500
    return _save_and_respond(data, "nightsbridge")


@app.route("/api/nb-creds", methods=["GET"])
def api_get_nb_creds():
    """Return saved NightsBridge credentials (password masked for display)."""
    creds = _load_nb_creds()
    return jsonify({"email": creds.get("email",""), "password": creds.get("password","")})


@app.route("/api/nb-creds", methods=["POST"])
def api_save_nb_creds():
    """Save NightsBridge credentials to disk."""
    body     = request.get_json(force=True, silent=True) or {}
    email    = (body.get("email")    or "").strip()
    password = (body.get("password") or "").strip()
    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400
    _save_nb_creds(email, password)
    return jsonify({"status": "saved"})


# ── Itinerary Creator ──────────────────────────────────────────────────────────

CREATOR_FILE = SCRIPT_DIR / "wetu_creator.py"


@app.route("/api/creator/list", methods=["GET"])
def api_creator_list():
    """Return the built-in itineraries the creator knows how to build."""
    try:
        sys.path.insert(0, str(SCRIPT_DIR))
        import importlib
        import wetu_creator
        importlib.reload(wetu_creator)
        items = [
            {"index": i + 1, "name": it["name"], "stops": len(it["stops"])}
            for i, it in enumerate(wetu_creator.ITINERARIES)
        ]
        return jsonify({"itineraries": items})
    except Exception as e:
        return jsonify({"error": f"Could not load creator: {e}", "itineraries": []}), 500


@app.route("/api/create-itineraries", methods=["POST"])
def api_create_itineraries():
    """
    Launch the itinerary creator in its own visible Chrome window.
    Body: { "only": "2,4" }   # optional; omit/empty = create all
    Returns immediately — the long-running creation happens in the spawned
    process, which opens Chrome for you to log into Wetu, then runs on its own.
    """
    if not CREATOR_FILE.exists():
        return jsonify({"error": "wetu_creator.py not found next to server.py."}), 500

    body   = request.get_json(force=True, silent=True) or {}
    only   = (body.get("only") or "").strip()
    custom = body.get("custom") or None

    args = [sys.executable, str(CREATOR_FILE), "--auto"]

    if custom and custom.get("stops"):
        # Build a brand-new itinerary from the user's own lodges.
        name = (custom.get("name") or "Custom Itinerary").strip()
        stops = []
        for s in custom.get("stops"):
            if isinstance(s, (list, tuple)) and s and str(s[0]).strip():
                lodge = str(s[0]).strip()
                try:
                    nights = int(s[1]) if len(s) > 1 else 1
                except (ValueError, TypeError):
                    nights = 1
                stops.append([lodge, max(1, nights)])
        if not stops:
            return jsonify({"error": "No valid lodges provided for the custom itinerary."}), 400
        custom_file = SCRIPT_DIR / "wetu_custom_itinerary.json"
        custom_file.write_text(json.dumps({"name": name, "stops": stops}), encoding="utf-8")
        args += ["--custom", str(custom_file)]
        launch_msg = (f"Chrome is opening. Log into Wetu — it will build your "
                      f"custom itinerary “{name}” ({len(stops)} stops) automatically.")
    else:
        if only:
            # keep only digits and commas for safety
            cleaned = ",".join(p for p in only.replace(" ", "").split(",")
                               if p.isdigit())
            if cleaned:
                args += ["--only", cleaned]
        launch_msg = ("Chrome is opening. Log into Wetu in that window — the "
                      "itineraries will then be created automatically.")

    try:
        subprocess.Popen(args, cwd=str(SCRIPT_DIR))
    except Exception as e:
        return jsonify({"error": f"Could not launch creator: {e}"}), 500

    return jsonify({"status": "launched", "message": launch_msg})


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "server": "wetu-viewer"})


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    print()
    print("╔═══════════════════════════════════════╗")
    print("║   Wetu Itinerary Viewer — Local Server ║")
    print("╚═══════════════════════════════════════╝")
    print(f"\n  Open in your browser → http://localhost:{port}\n")
    print("  Press Ctrl+C to stop.\n")
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)
