import re

with open("11-day-wildlife-FINAL.html", "r") as f:
    content = f.read()

# The broken block starts somewhere with <!-- DAY 7 --> or Day 11 title.
# We just want to find <h2 class="lux-day-title">Day 11</h2> and remove its ENTIRE surrounding <div class="lux-day-block">...</div>
# Let's cleanly rebuild from wetu JSON because it's so much simpler!
# Oh wait, do I have the 11-day-wildlife json?
# No, I don't necessarily have it unless I check.
# Let's just Regex remove the broken block.
# The broken block will have `<h2 class="lux-day-title">Day 11</h2>` in it.
# We can find the start of its `<div class="lux-day-block"` and the end of it, which is followed by the `Departure Bound` block.
pattern = r'<div class="lux-day-block"[^>]*>[\s\S]*?<h2 class="lux-day-title">Day 11</h2>[\s\S]*?(?=<div class="lux-day-block" id="day-08" data-bg="">)'

new_content = re.sub(pattern, '', content)

with open("11-day-wildlife-FINAL.html", "w") as f:
    f.write(new_content)
print("Cleaned up broken Day 11 block!")
