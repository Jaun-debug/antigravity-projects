import glob
import re
import os

# Fix 8-space indentation on the HERO IMAGE REPLACEMENT block
bad_block = """        # HERO IMAGE REPLACEMENT
        try:
            # For the single-job scripts, data is parsed directly. For multi-job it's in the loop.
            # We assume 'data' is the loaded JSON object in context.
            hero_img = data.get('top_carousel', [{'image': 'https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg'}])[0].get('image', 'https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg')
            html = html.replace('https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg', hero_img)
        except Exception as e:
            print("Hero image replace failed:", e)"""

good_block = """# HERO IMAGE REPLACEMENT
try:
    # For the single-job scripts, data is parsed directly. For multi-job it's in the loop.
    # We assume 'data' is the loaded JSON object in context.
    hero_img = data.get('top_carousel', [{'image': 'https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg'}])[0].get('image', 'https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg')
    html = html.replace('https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg', hero_img)
except Exception as e:
    print("Hero image replace failed:", e)"""

for filepath in glob.glob('/Users/jaunhusselmann/Desktop/AG Projects/dt_library/generator_*.py'):
    with open(filepath, 'r') as f:
        content = f.read()
    
    if bad_block in content:
        content = content.replace(bad_block, good_block)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed indentation in {os.path.basename(filepath)}")
