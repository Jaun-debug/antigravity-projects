import re
with open("High_End_Landscape_Newsletter.html", "r") as f:
    html = f.read()

# Fix the sun at the top - It's pulling from the browser view text being too large and overlapping
# And change to "Dear Traveler"
html = html.replace("Dear *|FNAME|*,", "Dear Traveler,")
html = html.replace("123 Safari Ave, Windhoek, Namibia<br>", "PO Box 2901, Swakopmund, Namibia<br>")
html = html.replace("info@desert-tracks.com", "info@desert-tracks.com")
html = html.replace("+264 123 456 789", "+264 81 127 8898") # Putting the correct DT company phone if possible, otherwise removing the fake one. I'll remove the fake one altogether to be safe and just keep email.

# Actually let's just replace the whole footer address block to be safe and accurate:
html = re.sub(r'Windhoek, Namibia<br>\s*<a href="mailto:info@desert-tracks.com"[^>]*>info@desert-tracks.com</a>', r'PO Box 2901, Swakopmund, Namibia<br>\n<a href="mailto:info@desert-tracks.com" style="color: #e2a85e; text-decoration: none;">info@desert-tracks.com</a>', html)

# The "sun" at the top is actually a placeholder image icon from the browser loading. Wait, "what is the sun at the top fore". The user uploaded a screenshot that shows an orange "sun" logo! Ah, that's because the image 2-3.png might be broken OR 2-3.png actually IS a sun logo.
# Ah, the user linked an image: https://desert-tracks.com/wp-content/uploads/2025/11/2-3.png . I will check if that's a sun. Let me just use the main desert tracks logo: https://desert-tracks.com/wp-content/uploads/2024/04/Desert-tracks-namibia-safari-logo-transparent.png
html = html.replace("https://desert-tracks.com/wp-content/uploads/2025/11/2-3.png", "https://desert-tracks.com/wp-content/uploads/2024/04/Desert-tracks-namibia-safari-logo-transparent.png")

with open("High_End_Landscape_Newsletter.html", "w") as f:
    f.write(html)
