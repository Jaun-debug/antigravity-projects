from playwright.sync_api import sync_playwright
try:
    with sync_playwright() as p:
        print("Launching Firefox...")
        b = p.firefox.launch(headless=True)
        print("Firefox launched successfully!")
        b.close()
except Exception as e:
    print(f"Error: {e}")
