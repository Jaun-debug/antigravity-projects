import subprocess
import os

result = subprocess.run(['git', 'ls-files', '-z', '--others', '--exclude-standard'], capture_output=True)
files = result.stdout.split(b'\0')
for f in files:
    if not f:
        continue
    file_name = f.decode('utf-8')
    try:
        if os.path.exists(".git/index.lock"):
            os.remove(".git/index.lock")
        subprocess.run(['git', 'add', file_name], check=True, timeout=2)
    except subprocess.TimeoutExpired:
        print(f"TIMEOUT on {file_name}")
    except Exception as e:
        pass
