import subprocess
import json
import base64
import os

deployment_id = "dpl_e9SWAB2QdLFkRTRomswDvLLCsuC6"
team_id = "team_UcPDuDkKKWWxLpjGaEICAAAh"

files_to_recover = {
    "individual_rates.html": "87bc8b7e1b6e9318d8933d9514a2928f902c8414",
    "journeys_namibia_rates.html": "a3b11b39df73f6da261b3e574a1cd333d8b2a825",
    "logufa_rates.html": "cad7940d295902cb813218031947c94e05286d3c",
    "mushara_rates.html": "a11d3c717cdff00f0e68333c260e60090f1552cc",
    "vehicle_rates.html": "631093ec29f46eb081f3e8b938d77dddeb44a5a8"
}

target_dir = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library"

for filename, uid in files_to_recover.items():
    print(f"Recovering {filename} (uid: {uid})...")
    cmd = [
        "npx", "vercel", "api",
        f"/v8/deployments/{deployment_id}/files/{uid}?teamId={team_id}"
    ]
    
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        print(f"Failed to fetch {filename}: {result.stderr.decode('utf-8', errors='ignore')}")
        continue
        
    output = result.stdout
    print(f"Fetched {len(output)} bytes.")
    
    # Try parsing as JSON first in case Vercel returns JSON metadata or base64 JSON
    try:
        data = json.loads(output.decode('utf-8'))
        print(f"Parsed as JSON. Keys: {list(data.keys()) if isinstance(data, dict) else type(data)}")
        # If it has a 'data' key
        if isinstance(data, dict) and 'data' in data:
            # Check if it's base64
            content = data['data']
            try:
                decoded = base64.b64decode(content)
                with open(os.path.join(target_dir, filename), 'wb') as f:
                    f.write(decoded)
                print(f"Successfully wrote decoded base64 content to {filename}")
            except Exception as e:
                with open(os.path.join(target_dir, filename), 'w') as f:
                    f.write(content)
                print(f"Wrote text content directly from JSON 'data' key to {filename}")
        else:
            # Write JSON directly
            with open(os.path.join(target_dir, filename), 'wb') as f:
                f.write(output)
            print(f"Wrote JSON response directly to {filename}")
    except json.JSONDecodeError:
        # Not JSON, write directly as raw bytes
        with open(os.path.join(target_dir, filename), 'wb') as f:
            f.write(output)
        print(f"Successfully wrote raw content to {filename}")

print("Recovery process completed!")
