import glob
import re

gens = glob.glob("/Users/jaunhusselmann/Desktop/AG Projects/dt_library/generator_*.py")

# The original logic usually has:
# raw_day_str = item.get('day', f'Day {day_num}')
# We want to REPLACE this with a dynamic night calculator based on the days array!

dynamic_day_logic = '''
            # Calculate consecutive days without overlap
            # We parse the day string from Wetu which looks like "Day 2 - 5"
            # It means you check in on Day 2, and check out on Day 5 (3 nights).
            # So the stay is Day 2, 3, 4. So we should show "Day 2 - 4".
            raw_wetu_day = item.get('day', f'Day {day_num}')
            day_match = re.search(r'Day\s+(\d+)(?:\s*-\s*(\d+))?', raw_wetu_day, re.IGNORECASE)
            if day_match:
                start_day = int(day_match.group(1))
                end_day = int(day_match.group(2)) if day_match.group(2) else start_day
                
                # If they check out on end_day, the last full day of the stay is end_day - 1
                if end_day > start_day:
                    stay_end = end_day - 1
                    if stay_end > start_day:
                        raw_day_str = f"Day {start_day} - {stay_end}"
                    else:
                        raw_day_str = f"Day {start_day}"
                else:
                    raw_day_str = f"Day {start_day}"
            else:
                raw_day_str = raw_wetu_day
'''

for gen in gens:
    with open(gen, 'r') as f:
        content = f.read()
        
    # We want to replace:
    # raw_day_str = item.get('day', f'Day {day_num}')
    # OR
    # raw_day_str = item.get('day', f"Day {day_num}")
    
    # Let's find it.
    # It might be indented.
    pattern = r'([ \t]+)raw_day_str\s*=\s*item\.get\([\'"]day[\'"],[^)]+\)'
    
    def replacer(match):
        indent = match.group(1)
        # return the dynamic logic with proper indentation
        indented_logic = "\n".join([indent + line.lstrip() if line.strip() else "" for line in dynamic_day_logic.strip().split('\n')])
        return indented_logic

    new_content = re.sub(pattern, replacer, content)
    
    if new_content != content:
        with open(gen, 'w') as f:
            f.write(new_content)
        print(f"Fixed overlapping days in {gen}")
    else:
        print(f"Skipped {gen} (already fixed or pattern not found)")

print("All done fixing days!")
