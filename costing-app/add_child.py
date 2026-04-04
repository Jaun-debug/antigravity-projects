import re

filepath = "/Users/jaunhusselmann/Desktop/AG Projects/costing-app/index.html"
with open(filepath, 'r') as f:
    text = f.read()

# 1. Add childPax input in HTML
single_pax_html = '''<div class="flex flex-col">
                                        <label class="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">Single Pax</label>
                                        <input type="number" v-model.number="singlePax" autocomplete="off"
                                            class="dt-input" placeholder="0">
                                    </div>'''
child_pax_html = single_pax_html + '''
                                    <div class="flex flex-col">
                                        <label class="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">Child Pax</label>
                                        <input type="number" v-model.number="childPax" autocomplete="off"
                                            class="dt-input" placeholder="0">
                                    </div>'''
text = text.replace(single_pax_html, child_pax_html)

# 2. Add column header
single_pp_header = '''<th class="px-3 py-3 font-semibold uppercase tracking-wider">
                                        <div class="flex items-center justify-end">Single PP <span
                                                class="ml-1 bg-gray-100 text-gray-500 px-1 rounded">{{singlePax}}</span>
                                        </div>
                                    </th>'''
child_pp_header = single_pp_header + '''
                                    <th class="px-3 py-3 font-semibold uppercase tracking-wider">
                                        <div class="flex items-center justify-end">Child PP <span
                                                class="ml-1 bg-gray-100 text-gray-500 px-1 rounded">{{childPax}}</span>
                                        </div>
                                    </th>'''
text = text.replace(single_pp_header, child_pp_header)

# 3. Add column input in main table
single_input = """<td class="px-3 py-2"><currency-input v-model="day.single" :is-disabled="day.isLocked"
                                            :custom-class="day.isLocked ? 'dt-input text-right bg-gray-100/50 opacity-80 cursor-not-allowed' : 'dt-input text-right'"></currency-input></td>"""
child_input = single_input + """
                                    <td class="px-3 py-2"><currency-input v-model="day.child" :is-disabled="day.isLocked"
                                            :custom-class="day.isLocked ? 'dt-input text-right bg-gray-100/50 opacity-80 cursor-not-allowed' : 'dt-input text-right'"></currency-input></td>"""
text = text.replace(single_input, child_input)

# 4. Add Subtotal
single_subtotal = """{{ format(storeTotals.single) }}<br>
                                        <span v-if="singlePax > 0"
                                            class="text-[10px] uppercase tracking-wider text-gray-400 mt-1 block">{{
                                            singlePax }} Pax Total:
                                            <span class="text-gray-700">{{format(storeTotals.single * singlePax)}}</span></span>"""
child_subtotal = single_subtotal + """
                                    </td>
                                    <td class="px-3 py-3 text-right bg-gray-50 border-x border-[#ebe4dc] text-xs font-semibold text-gray-600">
                                        {{ format(storeTotals.child) }}<br>
                                        <span v-if="childPax > 0"
                                            class="text-[10px] uppercase tracking-wider text-gray-400 mt-1 block">{{
                                            childPax }} Pax Total:
                                            <span class="text-gray-700">{{format(storeTotals.child * childPax)}}</span></span>"""
text = text.replace(single_subtotal, child_subtotal)

# 5. Add to Total breakdown
single_total_display = """<span
                                class="text-gray-500 font-medium">Single Group <span class="text-[10px] bg-gray-100 px-1 rounded text-gray-400 ml-1">{{singlePax}}x</span></span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.single * singlePax) }}</span>"""
child_total_display = single_total_display + """
                        </div>
                        <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                            <span
                                class="text-gray-500 font-medium">Child Group <span class="text-[10px] bg-gray-100 px-1 rounded text-gray-400 ml-1">{{childPax}}x</span></span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.child * childPax) }}</span>"""
text = text.replace(single_total_display, child_total_display)

# 6. Add initial data
text = text.replace("singlePax: 0,", "singlePax: 0,\n                    childPax: 0,")
text = text.replace("single: 0, vehicle: 2500,", "single: 0, child: 0, vehicle: 2500,")
text = text.replace("single: 0, vehicle: 2500", "single: 0, child: 0, vehicle: 2500")

# 7. Update computed
text = text.replace("Number(this.singlePax || 0))", "Number(this.singlePax || 0) + Number(this.childPax || 0))")
text = text.replace("this.singlePax));", "this.singlePax)) + ((this.botswanaChildPP || 0) * Math.max(0, this.childPax));")
text = text.replace("group = 0, single = 0, vehicle = 0", "group = 0, single = 0, child = 0, vehicle = 0")
text = text.replace("single += (d.single || 0) * n;", "single += (d.single || 0) * n; child += (d.child || 0) * n;")
text = text.replace("return { group, single, vehicle", "return { group, single, child, vehicle")
text = text.replace("total += (t.single * Math.max(0, this.singlePax));", "total += (t.single * Math.max(0, this.singlePax)); total += (t.child * Math.max(0, this.childPax));")

text = text.replace("singlePax: this.singlePax,", "singlePax: this.singlePax,\n                        childPax: this.childPax,")
text = text.replace("quote.singlePax : 0;", "quote.singlePax : 0;\n                    this.childPax = quote.childPax !== undefined ? quote.childPax : 0;")

# Botswana
text = text.replace('botswanaSinglePP"', 'botswanaSinglePP"\n                                        :custom-class="\'w-20 dt-input text-xs text-right\'"\n                                        placeholder="0.00"></currency-input>\n                        </div>\n                        <div class="flex flex-col">\n                            <label class="text-[9px] uppercase font-bold tracking-wider text-gray-500 mb-1">CHILD PP</label>\n                            <currency-input v-model="botswanaChildPP"')

# Vue app data init
text = text.replace("botswanaSinglePP: 0,", "botswanaSinglePP: 0, botswanaChildPP: 0,")

with open(filepath, 'w') as f:
    f.write(text)
print("Updated Index")
