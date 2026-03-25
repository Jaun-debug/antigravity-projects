import mailbox
import os
import re
import email.utils
from pathlib import Path

base_dir = Path("/Users/jaunhusselmann/.gemini/antigravity/scratch/desert-tracks-dashboard/extracted_leads")

if not base_dir.exists():
    print(f"Directory {base_dir} does not exist!")
    exit(1)

mbox_files = list(base_dir.rglob("mbox"))

contacts = {}
email_to_name = {}

# Known supplier/agent/internal domains or keywords to filter out
ignore_domains = ['desert-tracks.com', 'wordpress.com', 'wetu.com', 'sentry.io', 'mailchimp.com', 'google.com', 'apple.com', 'safaridestinations.net', 'travellocal.com', 'xero.com', 'exclusive.com.na', 'swakopmundluxurysuites.com', 'ngepicamp.com', 'scadvlodges.com']
ignore_keywords = ['lodge', 'camp', 'hotel', 'resort', 'safari', 'rental', 'reservation', 'booking', 'info', 'admin', 'noreply', 'no-reply', 'accounts', 'desert tracks', 'bianca', 'reply', 'enquiry']

for mbox_file in mbox_files:
    try:
        mb = mailbox.mbox(mbox_file)
        for msg in mb:
            headers_to_check = ['From', 'Reply-To', 'To', 'Cc']
            
            # Check headers
            for header in headers_to_check:
                val = msg.get(header)
                if val:
                    parsed = email.utils.getaddresses([str(val)])
                    for name, addr in parsed:
                        if addr and '@' in addr:
                            addr = addr.lower().strip()
                            if addr not in contacts:
                                contacts[addr] = set()
                            if name:
                                contacts[addr].add(name.strip())
            
            # Check body for enquiry structure
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == 'text/plain':
                        body = part.get_payload(decode=True)
                        if body:
                            body_str = body.decode('utf-8', errors='ignore')
                            found = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', body_str)
                            for f in found:
                                f = f.lower().strip()
                                if f not in contacts:
                                    contacts[f] = set()
            else:
                body = msg.get_payload(decode=True)
                if body:
                    body_str = body.decode('utf-8', errors='ignore')
                    found = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', body_str)
                    for f in found:
                        f = f.lower().strip()
                        if f not in contacts:
                            contacts[f] = set()
    except Exception as e:
        print(f"Error reading {mbox_file}: {e}")

filtered_clients = {}
for addr, names in contacts.items():
    domain = addr.split('@')[-1] if '@' in addr else ""
    local_part = addr.split('@')[0] if '@' in addr else ""
    
    # 1. Filter out known internal/supplier domains
    if any(ign in domain for ign in ignore_domains): continue
    
    # 2. Filter out explicit role-based or supplier-based local parts
    if any(ign in local_part for ign in ignore_keywords): continue
    
    # 3. Filter out if the NAME looks like a supplier (e.g., "Okaukuejo Resort")
    name_str = " ".join(names).lower()
    if any(ign in name_str for ign in ignore_keywords): continue

    # 4. Skip false positives (images, etc)
    if addr.endswith('png') or addr.endswith('jpg') or addr.endswith('jpeg') or addr.endswith('.com>'): continue
    if addr.startswith('0') or addr.startswith('1'): continue # Sometimes ids
    
    # We choose the longest/best name found for this email
    best_name = max(names, key=len) if names else ""
    # Remove quotes
    best_name = best_name.replace('"', '').replace("'", "")
    
    filtered_clients[addr] = best_name

with open("extracted_client_emails.txt", "w") as f:
    for addr, name in sorted(filtered_clients.items()):
        if name:
            f.write(f"{name} <{addr}>\n")
        else:
            f.write(f"{addr}\n")

print(f"Extracted {len(filtered_clients)} potential client emails. Saved to extracted_client_emails.txt")
