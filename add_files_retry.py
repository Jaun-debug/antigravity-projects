import subprocess
import os
import time

result = subprocess.run(['git', 'ls-files', '-z', '--others', '--exclude-standard'], capture_output=True)
files = result.stdout.split(b'\0')
for f in files:
    if not f:
        continue
    file_name = f.decode('utf-8')
    success = False
    for attempt in range(10):
        if os.path.exists(".git/index.lock"):
            try:
                os.remove(".git/index.lock")
            except:
                pass
        res = subprocess.run(['git', 'add', file_name], capture_output=True)
        if res.returncode == 0:
            success = True
            break
        time.sleep(0.1)
    if not success:
        print(f"FAILED on {file_name}")
