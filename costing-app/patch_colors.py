import re

filepath = "/Users/jaunhusselmann/Desktop/AG Projects/costing-app/index.html"
with open(filepath, 'r') as f:
    text = f.read()

# Make the page background white/airy
text = text.replace("--bg-subtle: #D8D0C5;", "--bg-subtle: #ffffff;")

# Top Section (Client Name, etc.)
# Currently: class="bg-white/80 backdrop-blur-md border border-white rounded-3xl p-4 md:p-6 shadow-sm mb-6
text = text.replace('class="bg-white/80 backdrop-blur-md border border-white rounded-3xl p-4 md:p-6 shadow-sm mb-6"',
                    'class="bg-[#F1EEF4] border border-[#e5e0ea] rounded-3xl p-4 md:p-6 shadow-sm mb-6"')

# Top Section labels (text-gray-500 -> text-gray-600 for contrast on pastel)
text = text.replace('text-gray-500 mb-1">CLIENT NAME', 'text-gray-600 mb-1">CLIENT NAME')
text = text.replace('text-gray-500 mb-1">QUOTE LABEL', 'text-gray-600 mb-1">QUOTE LABEL')
text = text.replace('text-gray-500 mb-1">AGENT NAME', 'text-gray-600 mb-1">AGENT NAME')
text = text.replace('text-gray-500 mb-1">Total Pax', 'text-gray-600 mb-1">Total Pax')

# Itinerary Breakdown Block wrapper
# Currently: class="bg-white/90 backdrop-blur-md border border-white rounded-3xl p-4 md:p-8 shadow-sm mb-8
text = text.replace('class="bg-white/90 backdrop-blur-md border border-white rounded-3xl p-4 md:p-8 shadow-sm mb-8"',
                    'class="bg-[#F4F5F6] border border-[#eaebec] rounded-3xl p-4 md:p-8 shadow-sm mb-8"')

# Botswana Safari Block
# Currently: class="bg-white/90 border border-white rounded-2xl p-4 shadow-sm h-full flex flex-col justify-between"
text = text.replace('class="bg-white/90 border border-white rounded-2xl p-4 shadow-sm h-full flex flex-col justify-between"',
                    'class="bg-[#E2F1E8] border border-[#d2e7d9] rounded-2xl p-4 shadow-sm h-full flex flex-col justify-between"')

# Transport & Extras Block
# Currently: class="bg-white/90 border border-white rounded-2xl p-4 shadow-sm"
# Wait, let's use the soft pink/rose for Transport & Extras: #FCEFF2
text = text.replace('class="bg-white/90 border border-white rounded-2xl p-4 shadow-sm"',
                    'class="bg-[#FCEFF2] border border-[#f0dee2] rounded-2xl p-4 shadow-sm"')

# Table header bg inside Itinerary Breakdown
# Currently: class="bg-gray-50 sticky top-0 border-b border-gray-100 z-10"
# change to match the #F4F5F6 base or be slightly lighter #ffffff
text = text.replace('class="bg-gray-50 sticky top-0 border-b border-gray-100 z-10"',
                    'class="bg-[#ffffff] sticky top-0 border-b border-gray-100 z-10"')

# Small dt-input styling in the CSS block
# Let's adjust inputs to look a bit softer and whiter. 
# Currently: border: 1px solid #e1d8cf; background-color: rgba(255, 255, 255, 0.7);
text = text.replace('border: 1px solid #e1d8cf;', 'border: 1px solid #eaeaea;')
text = text.replace('background-color: rgba(255, 255, 255, 0.7);', 'background-color: #ffffff;')

# Change the "ADD DAY" button from dark #1a1a24 to soft baby blue like "Sign Up" button #79b4ff
# Currently: class="bg-[#1a1a24] hover:bg-[#2d2d3d] text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
text = text.replace('class="bg-[#1a1a24] hover:bg-[#2d2d3d] text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-sm"',
                    'class="bg-[#79b4ff] hover:bg-[#639aeb] text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-sm"')

with open(filepath, 'w') as f:
    f.write(text)

print("Safely Patched Colors")
