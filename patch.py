import re

with open('costing-app/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Insert UI
ui = """            <div class="w-full space-y-8 shrink-0 z-10">

                <!-- Pax Groups UI -->
                <div class="bg-white rounded-2xl shadow-sm border border-[#e5e7e9] p-5">
                    <div class="flex justify-between items-center mb-5">
                        <h3 class="font-bold text-gray-800 tracking-wide uppercase text-sm">Passenger Configuration</h3>
                        <button @click="addGroup" class="px-4 py-1.5 bg-gray-900 border border-gray-900 shadow-sm text-white text-[10px] uppercase font-bold rounded hover:bg-dt-orange hover:border-dt-orange transition-colors">+ Add Group</button>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div v-for="(g, idx) in paxGroups" :key="g.id" class="bg-gray-50 border text-center border-gray-200 rounded-xl p-4 relative shadow-sm transition-all hover:border-gray-300">
                            <button v-if="paxGroups.length > 1" @click="removeGroup(idx)" class="absolute top-2 right-2.5 text-gray-400 hover:text-red-500 font-bold transition-colors">✕</button>
                            <input v-model="g.name" class="font-bold text-sm bg-transparent border-b border-gray-200 outline-none w-3/4 mb-4 pb-1 text-center text-gray-800 focus:border-dt-orange" placeholder="e.g. Group 1" />
                            <div class="grid grid-cols-3 gap-2">
                                <div>
                                <label class="text-[9px] uppercase font-bold tracking-wider text-gray-400 mb-1.5 block">Double</label>
                                <input type="number" v-model.number="g.double" step="2" class="w-full dt-input text-center font-bold px-1 py-1.5 text-sm bg-white shadow-sm border border-gray-100 rounded" min="0" autocomplete="off">
                                </div>
                                <div>
                                <label class="text-[9px] uppercase font-bold tracking-wider text-gray-400 mb-1.5 block">Single</label>
                                <input type="number" v-model.number="g.single" class="w-full dt-input text-center font-bold px-1 py-1.5 text-sm bg-white shadow-sm border border-gray-100 rounded" min="0" autocomplete="off">
                                </div>
                                <div>
                                <label class="text-[9px] uppercase font-bold tracking-wider text-gray-400 mb-1.5 block">Child</label>
                                <input type="number" v-model.number="g.child" class="w-full dt-input text-center font-bold px-1 py-1.5 text-sm bg-white shadow-sm border border-gray-100 rounded" min="0" autocomplete="off">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Itinerary Builder -->"""
text = text.replace('            <div class="w-full space-y-8 shrink-0 z-10">\n                <!-- Itinerary Builder -->', ui)

# 2. Clean table headers
h = """                                    <th class="px-3 py-4 w-[130px] min-w-[130px] text-right font-bold">Double PP</th>
                                    <th class="px-3 py-4 w-[130px] min-w-[130px] text-right font-bold">Single PP</th>
                                    <th class="px-3 py-4 w-[130px] min-w-[130px] text-right font-bold">Child PP</th>"""
text = re.sub(r'<th class="px-3 py-4 w-\[130px\] min-w-\[130px\] text-right font-bold">Double PP.*?Child Pax">\s*</div>\s*</th>', h, text, flags=re.DOTALL)

# 3. Clean Total UI
sui = """                        <div v-for="g in paxGroups" :key="g.id" v-show="parseInt(g.double) > 0 || parseInt(g.single) > 0 || parseInt(g.child) > 0" class="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span class="text-gray-500 font-medium">{{ g.name }} 
                                <span v-if="parseInt(g.double) > 0" class="text-[10px] bg-gray-100 px-1 rounded text-gray-500 ml-1 font-bold">{{g.double}}x DBL</span>
                                <span v-if="parseInt(g.single) > 0" class="text-[10px] bg-gray-100 px-1 rounded text-gray-500 ml-1 font-bold">{{g.single}}x SGL</span>
                                <span v-if="parseInt(g.child) > 0" class="text-[10px] bg-gray-100 px-1 rounded text-gray-500 ml-1 font-bold">{{g.child}}x CHD</span>
                            </span>
                            <span class="font-bold text-gray-900">{{ format((storeTotals.group * Math.max(0, parseInt(g.double) || 0)) + (storeTotals.single * Math.max(0, parseInt(g.single) || 0)) + (storeTotals.child * Math.max(0, parseInt(g.child) || 0))) }}</span>
                        </div>"""
text = re.sub(r'<div v-if="storeTotals.group > 0".*?format\(storeTotals\.child \* Math\.max\(1, childPax\)\) }}</span>\s*</div>', sui, text, flags=re.DOTALL)


# 4. Modify data block
text = re.sub(
    r"numPax: 2,\s*doublePax: 2,\s*singlePax: 0,\s*childPax: 0,", 
    "paxGroups: [{ id: 1, name: 'Group 1', double: 2, single: 0, child: 0 }],", 
    text
)

# 5. Modify Computed
computed_methods = """                doublePax() { return this.paxGroups.reduce((s, g) => s + (parseInt(g.double) || 0), 0); },
                singlePax() { return this.paxGroups.reduce((s, g) => s + (parseInt(g.single) || 0), 0); },
                childPax() { return this.paxGroups.reduce((s, g) => s + (parseInt(g.child) || 0), 0); },
                numPax() { return this.doublePax + this.singlePax + this.childPax; },
                isPaxValid() {"""
text = text.replace('                isPaxValid() {', computed_methods)

# 6. stoTotal Math
stoTotalOrig = """                    total += (t.group * Math.max(0, this.doublePax));
                    total += (t.single * Math.max(0, this.singlePax)) + (t.child * Math.max(0, this.childPax));"""
stoTotalNew = """                    this.paxGroups.forEach(g => {
                        total += (t.group * Math.max(0, parseInt(g.double) || 0));
                        total += (t.single * Math.max(0, parseInt(g.single) || 0));
                        total += (t.child * Math.max(0, parseInt(g.child) || 0));
                    });"""
text = text.replace(stoTotalOrig, stoTotalNew)

# 7. Add group logic
methOrig = """                addDay() {"""
methNew = """                addGroup() {
                    const maxId = this.paxGroups.reduce((max, g) => Math.max(max, g.id), 0);
                    this.paxGroups.push({ id: maxId + 1, name: `Group ${maxId + 1}`, double: 2, single: 0, child: 0 });
                },
                removeGroup(index) {
                    this.paxGroups.splice(index, 1);
                },
                addDay() {"""
text = text.replace(methOrig, methNew)

# 8. Saved data fixes
backup_old = """                        numPax: this.numPax,
                        doublePax: this.doublePax,
                        singlePax: this.singlePax,
                        childPax: this.childPax,"""
backup_new = """                        paxGroups: JSON.parse(JSON.stringify(this.paxGroups)),"""
text = text.replace(backup_old, backup_new)

load_old = """                    this.numPax = quote.numPax;
                    this.doublePax = quote.doublePax !== undefined ? quote.doublePax : quote.numPax;
                    this.singlePax = !!quote.singlePax ? quote.singlePax : 0;
                    this.childPax = !!quote.childPax ? quote.childPax : 0;"""
load_new = """                    if (!quote.paxGroups || quote.paxGroups.length === 0) {
                        this.paxGroups = [{ 
                            id: 1, 
                            name: 'Group 1', 
                            double: quote.doublePax !== undefined ? quote.doublePax : (quote.numPax || 2), 
                            single: quote.singlePax || 0, 
                            child: quote.childPax || 0 
                        }];
                    } else { this.paxGroups = quote.paxGroups; }"""
text = text.replace(load_old, load_new)

with open('costing-app/index.html', 'w', encoding='utf-8') as f:
    f.write(text)
