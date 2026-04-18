with open("14-day-comfort.html", "r") as f:
    c = f.read()

# 1. Overview: Make it slightly bigger and bolder than Destinations (Destinations is 2.5rem)
c = c.replace(
    '''<h2 style="color: #1F4F4B !important; font-size: 2.5rem; font-family: 'Playfair Display', serif; font-weight:normal; margin-bottom: 2rem; line-height: 1.2;">Overview</h2>''',
    '''<h2 style="color: #1F4F4B !important; font-size: 3.2rem; font-family: 'Playfair Display', serif; font-weight: 600; margin-bottom: 2rem; line-height: 1.2;">Overview</h2>'''
)

# 2. Day-by-day: Make it bigger/bolder than Arrival in Windhoek (Arrival is clamp(4.5rem, 6vw, 6rem) weight 400)
c = c.replace(
    '''<h2 style="color: #1F4F4B !important; font-size: 2.5rem; font-family: 'Playfair Display', serif; margin-top: 4rem; margin-bottom: 2rem;">Day-by-Day Itinerary</h2>''',
    '''<h2 style="color: #1F4F4B !important; font-size: clamp(5rem, 7vw, 7.5rem); font-family: 'Playfair Display', serif; font-weight: 600; margin-top: 4rem; margin-bottom: 3rem; line-height: 1.1;">Day-by-Day Itinerary</h2>'''
)

with open("14-day-comfort.html", "w") as f:
    f.write(c)

print("Done")
