#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  Desert Tracks — Wetu App launcher
#  Double-click this file to start the app and open it in Chrome.
#  (Close the Terminal window it opens to stop the app.)
# ─────────────────────────────────────────────────────────────

# Move into the folder this script lives in (the app folder)
cd "$(dirname "$0")" || exit 1

echo "Starting the Wetu app…"
echo "Folder: $(pwd)"
echo

# Open the browser a couple of seconds after the server starts
( sleep 2; open "http://localhost:5050" ) &

# Start the server (this stays running until you close the window)
python3 server.py
