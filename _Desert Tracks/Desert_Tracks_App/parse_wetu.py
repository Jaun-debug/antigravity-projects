import urllib.request
import re
import json

url = "https://wetu.com/ItineraryOutputs/Discovery/4c89ae0c-337b-4fc9-b1d8-45e2989c9bb2"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        
        # Look for var model = ...
        model_match = re.search(r'var model\s*=\s*(\{.*?\});', html, re.DOTALL)
        if model_match:
            try:
                data = json.loads(model_match.group(1))
                print(f"Tour Name: {data.get('ItineraryName')}")
                days = data.get('ItineraryDays', [])
                print(f"Total Segments: {len(days)}")
                for node in data.get('Nodes', []):
                    print(f"Node Type: {node.get('NodeType')}, Name: {node.get('Name')}")
                
                # Check where the description text is
                print("--- First Day Info ---")
                if days:
                    print(days[0].keys())
                
                with open("wetu_data.json", "w") as f:
                    json.dump(data, f)
            except Exception as e:
                print("JSON parsing error:", e)
except Exception as e:
    print(e)
