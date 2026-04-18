import json
import traceback
from flask import Flask, request, render_template, jsonify
from wetu_scraper import extract_id_from_url, process_url_api, process_url_browser
from playwright.sync_api import sync_playwright

app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/api/extract", methods=["POST"])
def extract():
    data = request.json
    url = data.get('url', '').strip()
    if not url:
        return jsonify({"error": "No URL provided"}), 400
        
    wetu_id = extract_id_from_url(url)
    parsed_data = None
    
    if wetu_id:
        parsed_data = process_url_api(url, wetu_id)
        
    if not parsed_data:
        try:
            import subprocess
            import sys
            result = subprocess.run([sys.executable, "run_playwright_extract.py", url], capture_output=True, text=True)
            try:
                playwright_data = json.loads(result.stdout)
                if "error" in playwright_data:
                    return jsonify({"error": playwright_data["error"]}), 500
                parsed_data = playwright_data
            except json.JSONDecodeError:
                return jsonify({"error": "Failed to parse browser extraction output. " + result.stderr}), 500
        except Exception as e:
            traceback.print_exc()
            return jsonify({"error": f"Scraping failed: {str(e)}"}), 500

    if parsed_data:
        images = parsed_data.get('images', [])
        title = parsed_data.get('title', 'Unknown Itinerary')
        days = parsed_data.get('days', [])
        groups = parsed_data.get('groups', [])
        
        # If we have days from wetu_scraper.py, format them as groups
        if not groups and days:
            groups = []
            for day in days:
                if day.get('dest_images'):
                    groups.append({
                        "name": day.get('location') or day.get('day_range') or 'Unknown Location',
                        "type": "Region",
                        "images": day['dest_images']
                    })
                if day.get('lodge_images'):
                    groups.append({
                        "name": day.get('accommodation') or 'Unknown Lodge',
                        "type": "Lodge",
                        "images": day['lodge_images']
                    })
                    
        return jsonify({
            "title": title,
            "images": images,
            "groups": groups,
            "count": sum(len(g['images']) for g in groups) if groups else len(images)
        })
    else:
        return jsonify({"error": "No data could be extracted from this URL. It might require login or be invalid."}), 400

if __name__ == "__main__":
    app.run(port=5050, debug=True)
