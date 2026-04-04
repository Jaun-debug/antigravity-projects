import re

filepath = "/Users/jaunhusselmann/Desktop/AG Projects/costing-app/index.html"
with open(filepath, 'r') as f:
    text = f.read()

# 1. Provide 'Flights' into the HTML Summary matrix
flights_matrix_row = """
                            <div class="m-section-bottom" style="border-top: none; padding-top: 15px; padding-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; color: #52525b; font-size: 13px; font-weight: 600;">
                                    <span>Flights</span>
                                    <span>{{ format(storeTotals.flights) }}</span>
                                </div>
                            </div>
"""

# Insert it before fuel and return
text = text.replace(
    '<div class="m-section-bottom" style="border-top: none; padding-top: 15px; padding-bottom: 15px;">\n                                <div style="display: flex; justify-content: space-between; align-items: center; color: #52525b; font-size: 13px; font-weight: 600;">\n                                    <span>Fuel & Return</span>',
    flights_matrix_row.strip() + '\n                            <div class="m-section-bottom" style="border-top: none; padding-top: 15px; padding-bottom: 15px;">\n                                <div style="display: flex; justify-content: space-between; align-items: center; color: #52525b; font-size: 13px; font-weight: 600;">\n                                    <span>Fuel & Return</span>'
)

# 2. Fix storeTotals bug: flights was NOT being summed up!
text = text.replace(
    "vehicle += (d.vehicle || 0) * n; guideFee += (d.guideFee || 0) * n; guideAcc += (d.guideAcc || 0) * n;",
    "vehicle += (d.vehicle || 0) * n; guideFee += (d.guideFee || 0) * n; guideAcc += (d.guideAcc || 0) * n; flights += (d.flights || 0) * n;"
)

# 3. Add to dtTotal calculation, logic in PDF template, etc? No wait, this is just for the Summary!

# We MUST also include Flights in the Total Calculation in computed `stoTotal`
text = text.replace(
    "total += t.vehicle + t.guideFee + t.guideAcc;",
    "total += t.vehicle + t.guideFee + t.guideAcc + t.flights;"
)

with open(filepath, 'w') as f:
    f.write(text)

print("Patch fully completed.")
