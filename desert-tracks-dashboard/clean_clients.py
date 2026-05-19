import re
from pathlib import Path
import csv

input_file = Path('/Users/jaunhusselmann/Desktop/Mailchimp_List.txt')
output_file = Path('/Users/jaunhusselmann/.gemini/antigravity/scratch/desert-tracks-dashboard/Clean_Client_Emails.txt')
master_file = Path('/Users/jaunhusselmann/.gemini/antigravity/scratch/desert-tracks-dashboard/Master_Client_Emails.txt')

if not input_file.exists():
    print(f"Error: {input_file} not found.")
    exit(1)

# Aggressively filter out travel agents and lodges based on what we saw earlier
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

with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        line = line.strip()
        if not line: continue
        
        # Try finding email pattern
        match = re.search(r'([a-zA-Z0-9._%+-]+(?:@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))', line)
        if not match: continue
        
        email = match.group(1).lower()
        domain = email.split('@')[-1] if '@' in email else ""
        local_part = email.split('@')[0] if '@' in email else ""
        
        # Name is usually what comes before '<' in Apple Mail's default format
        name_part = line.split('<')[0].replace('"', '').strip() if '<' in line else ''
        
        # Master Filters
        if any(ign in domain for ign in ignore_domains): continue
        if any(ign in local_part for ign in ignore_keywords): continue
        if any(ign in name_part.lower() for ign in ignore_keywords): continue
        
        # Fix instances where the name part is just a duplicate of the email
        if name_part.lower() == email: name_part = ""
        
        # Get longest known name for this email
        if email in unique_clients:
            if len(name_part) > len(unique_clients[email]):
                unique_clients[email] = name_part
        else:
            unique_clients[email] = name_part

# Write the output for THIS specific batch
with open(output_file, 'w', encoding='utf-8') as f:
    f.write("Email Address, First Name\n")
    for email, name in sorted(unique_clients.items()):
        first_name = name.split(' ')[0] if name else ""
        f.write(f"{email}, {first_name}\n")

# Read existing master list to avoid duplicates
existing_master = set()
if master_file.exists():
    with open(master_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip() and not line.startswith("Email Address"):
                parts = line.strip().split(',')
                if parts: existing_master.add(parts[0].strip().lower())

# Append new ones to Master List
with open(master_file, 'a', encoding='utf-8') as f:
    if not master_file.exists() or len(existing_master) == 0:
        f.write("Email Address, First Name\n")
    
    added_count = 0
    for email, name in sorted(unique_clients.items()):
        if email not in existing_master:
            first_name = name.split(' ')[0] if name else ""
            f.write(f"{email}, {first_name}\n")
            added_count += 1

print(f"Cleaned! Found {len(unique_clients)} real client emails in this folder.")
print(f"Added {added_count} brand new emails to the Master List.")
