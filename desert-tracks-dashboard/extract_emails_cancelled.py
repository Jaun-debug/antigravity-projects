import mailbox
import os
import re
import email.utils
from pathlib import Path

base_dir = Path("/Users/jaunhusselmann/Desktop/canceled")
master_file = Path('/Users/jaunhusselmann/.gemini/antigravity/scratch/desert-tracks-dashboard/Master_Client_Emails.txt')
output_file = Path('/Users/jaunhusselmann/.gemini/antigravity/scratch/desert-tracks-dashboard/Clean_Client_Emails.txt')

if not base_dir.exists():
    print(f"Directory {base_dir} does not exist!")
    exit(1)

mbox_files = list(base_dir.rglob("mbox"))

contacts = {}

# Known supplier/agent/internal domains or keywords to filter out
ignore_domains = [
    'desert-tracks.com', 'wordpress.com', 'wetu.com', 'sentry.io', 'mailchimp.com', 
    'google.com', 'apple.com', 'safaridestinations.net', 'travellocal.com', 
    'xero.com', 'exclusive.com.na', 'swakopmundluxurysuites.com', 'ngepicamp.com', 
    'scadvlodges.com', 'afol.com.na', 'nwr.com.na', 'bigsky-namibia.com',
    'namibguesthouse.com', 'resdest.com', 'chiwani.com', 'customer.io', 'host-h.net',
    'postmarkapp.com', 'zariscarrentalnamibia.com', 'logufa.com', 'sunkarros.com',
    'etendeka-namibia.com', 'gcnam.com', 'namibia-tracks-and-trails.com',
    'namibiatravelconsultants.com', 'okonjimalodge.com', 'ondili.com', 
    'twyfelfonteincamp.com', 'urbancamp.net', 'voigt-land.com', 'sandyhorizon.com',
    'exclusive.co', 'homestead.com.na', 'deserthomesteadlodge.com', 'homestead.com', 
    'bagatelle-kalahari-gameranch.com', 'shameturiverlodge.com', 'mukolocamp.com',
    'nightsbridge.co.za', 'onguma.com'
]

ignore_keywords = [
    'lodge', 'camp', 'hotel', 'resort', 'safari', 'rental', 'reservation', 
    'booking', 'info', 'admin', 'noreply', 'no-reply', 'accounts', 
    'desert tracks', 'bianca', 'reply', 'enquiry', 'guest', 'centralres',
    'operations', 'spam', 'abuse', 'mail'
]

unique_clients = {}

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
        # Ignore permission/read errors for some nested empty files
        pass

for addr, names in contacts.items():
    domain = addr.split('@')[-1] if '@' in addr else ""
    local_part = addr.split('@')[0] if '@' in addr else ""
    
    # Filter domains
    if any(ign in domain for ign in ignore_domains): continue
    
    # Filter explicit keywords
    if any(ign in local_part for ign in ignore_keywords): continue
    
    # Find best name
    best_name = max(names, key=len) if names else ""
    best_name = best_name.replace('"', '').replace("'", "")
    
    if any(ign in best_name.lower() for ign in ignore_keywords): continue

    # Skip false positives
    if addr.endswith('png') or addr.endswith('jpg') or addr.endswith('jpeg') or addr.endswith('.com>'): continue
    if addr.startswith('0') or addr.startswith('1'): continue
    if len(addr) > 50: continue # Likely a tracking ID

    unique_clients[addr] = best_name

# Write output for THIS specific batch
with open(output_file, 'w', encoding='utf-8') as f:
    f.write("Email Address, First Name\n")
    for email, name in sorted(unique_clients.items()):
        first_name = name.split(' ')[0] if name else ""
        f.write(f"{email}, {first_name}\n")

# Append new ones to Master List
existing_master = set()
if master_file.exists():
    with open(master_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip() and not line.startswith("Email Address"):
                parts = line.strip().split(',')
                if parts: existing_master.add(parts[0].strip().lower())

with open(master_file, 'a', encoding='utf-8') as f:
    if not master_file.exists() or len(existing_master) == 0:
        f.write("Email Address, First Name\n")
    
    added_count = 0
    for email, name in sorted(unique_clients.items()):
        if email not in existing_master:
            first_name = name.split(' ')[0] if name else ""
            f.write(f"{email}, {first_name}\n")
            added_count += 1

print(f"Cleaned! Found {len(unique_clients)} real client emails in 'canceled' folder.")
print(f"Added {added_count} brand new emails to the Master List.")
