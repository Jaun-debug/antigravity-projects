import re

filepath = "/Users/jaunhusselmann/Desktop/AG Projects/costing-app/index.html"
with open(filepath, 'r') as f:
    text = f.read()

# --- 1. Reset all amounts to zero ---
# Finding dummy data in initial data()
text = text.replace("vehicle: 2500,", "vehicle: 0,")
text = text.replace("pp: 3264", "pp: 0")
text = text.replace("pp: 7000", "pp: 0")
text = text.replace("vehicle: 2500", "vehicle: 0") # For addDay fallback if it's there

# --- 2. Add 'Flights' Column ---
# Table Header
guide_acc_header = '<th class="px-3 py-4 w-[160px] min-w-[160px] text-right font-bold">Guide Acc.</th>'
flights_header = guide_acc_header + '\n                                    <th class="px-3 py-4 w-[160px] min-w-[160px] text-right font-bold">Flights</th>'
text = text.replace(guide_acc_header, flights_header)

# Table Rows
guide_acc_input = """<td class="px-3 py-2"><currency-input v-model="day.guideAcc"\n                                            :custom-class="'dt-input text-right'"></currency-input></td>"""

guide_acc_input_with_propagate = """<td class="px-3 py-2"><currency-input v-model="day.guideAcc" @blur="propagate(index, 'guideAcc', day.guideAcc)"\n                                            :custom-class="'dt-input text-right'"></currency-input></td>"""

flights_input = guide_acc_input_with_propagate + """\n                                    <td class="px-3 py-2"><currency-input v-model="day.flights"\n                                            :custom-class="'dt-input text-right'"></currency-input></td>"""

text = text.replace(guide_acc_input, flights_input)

# Table Subtotal
guide_acc_subtotal = '<td class="px-3 py-4 text-right text-gray-700">{{ format(storeTotals.guideAcc) }}</td>'
flights_subtotal = guide_acc_subtotal + '\n                                    <td class="px-3 py-4 text-right text-gray-700">{{ format(storeTotals.flights) }}</td>'
text = text.replace(guide_acc_subtotal, flights_subtotal)

# Initial Data & Calculations
text = text.replace("guideAcc: 0,", "guideAcc: 0, flights: 0,")
text = text.replace("guideAcc: 0 }", "guideAcc: 0, flights: 0 }")

text = text.replace("vehicle = 0, guideFee = 0, guideAcc = 0;", "vehicle = 0, guideFee = 0, guideAcc = 0, flights = 0;")
text = text.replace("guideAcc += (d.guideAcc || 0);", "guideAcc += (d.guideAcc || 0); flights += (d.flights || 0);")
text = text.replace("return { group, single, child, vehicle, guideFee, guideAcc };", "return { group, single, child, vehicle, guideFee, guideAcc, flights };")

text = text.replace("guideFee: firstDay ? firstDay.guideFee : 0,", "guideFee: firstDay ? firstDay.guideFee : 0,\n                        flights: 0,")
text = text.replace("firstDay ? firstDay.vehicle : 2500", "firstDay ? firstDay.vehicle : 0") # Safety

# --- 3. Lodge rate memory & propagation functions ---
# Adding @change to lodge select
text = text.replace('v-model="day.lodge" class="dt-input text-xs pl-2"', 'v-model="day.lodge" @change="onLodgeSelect(day)" class="dt-input text-xs pl-2"')
# Update vehicle/guide inputs to propagate on blur
text = text.replace('v-model="day.vehicle"', 'v-model="day.vehicle" @blur="propagate(index, \'vehicle\', day.vehicle)"')
text = text.replace('v-model="day.guideFee"', 'v-model="day.guideFee" @blur="propagate(index, \'guideFee\', day.guideFee)"')
# (guideAcc is handled in block 2)

# Add storedLodgeRates to data
text = text.replace("savedQuotes: [],", "savedQuotes: [],\n                    storedLodgeRates: {},")

# Add methods and global keydown listener
mounted_code = """mounted() {
                // Global enter-to-jump logic
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const target = e.target;
                        if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea') {
                            e.preventDefault();
                            const inputs = Array.from(document.querySelectorAll('input:not([disabled]), textarea:not([disabled]), [contenteditable="true"]'));
                            const index = inputs.indexOf(target);
                            if (index > -1 && index < inputs.length - 1) {
                                inputs[index + 1].focus();
                                if(inputs[index + 1].select) inputs[index + 1].select();
                            }
                        }
                    }
                });"""

text = text.replace("mounted() {", mounted_code)

methods_additions = """               propagate(index, field, value) {
                    // "once in the fisrt lodge line a vehicle and guide fee was added it must be added automatacly in eache following line"
                    if (index === 0) {
                        for (let i = 1; i < this.itinerary.length; i++) {
                            this.itinerary[i][field] = value;
                        }
                    }
                },
                onLodgeSelect(day) {
                    const rates = this.storedLodgeRates[day.lodge];
                    if (rates) {
                        if (!day.pp) day.pp = rates.pp || 0;
                        if (!day.single) day.single = rates.single || 0;
                        if (!day.child) day.child = rates.child || 0;
                    }
                },"""

text = text.replace("addDay() {", methods_additions + "\n                addDay() {")

# Deep watch to store lodge rates automatically when user types them
watch_additions = """            watch: {
                itinerary: {
                    deep: true,
                    handler(newVal) {
                        newVal.forEach(day => {
                            if (day.lodge) {
                                if (!this.storedLodgeRates[day.lodge]) {
                                    this.storedLodgeRates[day.lodge] = { pp: 0, single: 0, child: 0 };
                                }
                                if (day.pp > 0) this.storedLodgeRates[day.lodge].pp = day.pp;
                                if (day.single > 0) this.storedLodgeRates[day.lodge].single = day.single;
                                if (day.child > 0) this.storedLodgeRates[day.lodge].child = day.child;
                            }
                        });
                    }
                }
            },"""
            
text = text.replace("computed: {", watch_additions + "\n            computed: {")

# Modify addDay to copy vehicle/guide from first row automatically
text = text.replace("vehicle: 0,", "vehicle: this.itinerary.length > 0 ? this.itinerary[0].vehicle : 0,")
text = text.replace("guideFee: 0,", "guideFee: this.itinerary.length > 0 ? this.itinerary[0].guideFee : 0,")
text = text.replace("guideAcc: 0,", "guideAcc: this.itinerary.length > 0 ? this.itinerary[0].guideAcc : 0,")

# Total Calculation Inclusion (totalSto)
text = text.replace("((d.guideAcc || 0) * n)", "((d.guideAcc || 0) * n) + ((d.flights || 0) * n)")

# We should also disable Enter-to-jump in `currency-input` so it doesn't run twice and skip inputs.
# Remove internal keydown.enter logic:
text = text.replace('@keydown.enter="handleEnter"', '')

with open(filepath, 'w') as f:
    f.write(text)

print("Patch completely executed")
