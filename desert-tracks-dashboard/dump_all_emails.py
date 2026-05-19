import re
from pathlib import Path

base_dir = Path("/Users/jaunhusselmann/.gemini/antigravity/scratch/desert-tracks-dashboard/extracted_leads")
mbox_files = list(base_dir.rglob("mbox"))

all_emails = set()

for mbox_file in mbox_files:
    try:
        with open(mbox_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            found = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content)
            for email in found:
                all_emails.add(email.lower())
    except Exception as e:
        pass

ignore_domains = ['desert-tracks.com', 'wordpress.com', 'wetu.com', 'sentry.io', 'mailchimp.com', 'google.com', 'apple.com', 'safaridestinations.net', 'travellocal.com', 'xero.com', 'outlook.com']

with open("all_extracted_emails.txt", "w") as f:
    for email in sorted(all_emails):
        domain = email.split('@')[-1] if '@' in email else ""
        if any(ign in domain for ign in ignore_domains):
            continue
        if email.endswith('png') or email.endswith('jpg') or email.endswith('jpeg'):
            continue
        f.write(email + "\n")
