import re

with open("/Users/jaunhusselmann/Desktop/AG Projects/costing-app/index.html", "r") as f:
    content = f.read()

old_block = """                        <div class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Double Group <span class="text-[10px] bg-gray-100 px-1 rounded text-gray-400 ml-1">{{doublePax}}x</span></span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.group * doublePax) }}</span></div>
                        <div class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Single Group <span class="text-[10px] bg-gray-100 px-1 rounded text-gray-400 ml-1">{{singlePax}}x</span></span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.single * singlePax) }}</span>
                        </div>
                        <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                            <span
                                class="text-gray-500 font-medium">Child Group <span class="text-[10px] bg-gray-100 px-1 rounded text-gray-400 ml-1">{{childPax}}x</span></span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.child * childPax) }}</span>
                        </div>
                        <div class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Vehicle Hire</span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.vehicle) }}</span></div>
                        <div class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Flights</span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.flights) }}</span></div>
                        <div class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Guide Acc & Fee</span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.guideFee + storeTotals.guideAcc)
                                }}</span></div>
                        <div class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Fuel & Return</span><span
                                class="font-bold text-gray-900">{{ format(calculatedFuel)
                                }}</span></div>
                        <div class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Activities</span><span
                                class="font-bold text-gray-900">{{ format(activitiesTotal) }}</span></div>
                        <div class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Other Extras</span><span
                                class="font-bold text-gray-900">{{ format(extrasTotal) }}</span>
                        </div>"""

new_block = """                        <div v-if="(storeTotals.group * doublePax) > 0" class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Double Group <span class="text-[10px] bg-gray-100 px-1 rounded text-gray-400 ml-1">{{doublePax}}x</span></span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.group * doublePax) }}</span></div>
                        <div v-if="(storeTotals.single * singlePax) > 0" class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Single Group <span class="text-[10px] bg-gray-100 px-1 rounded text-gray-400 ml-1">{{singlePax}}x</span></span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.single * singlePax) }}</span>
                        </div>
                        <div v-if="(storeTotals.child * childPax) > 0" class="flex justify-between items-center pb-2 border-b border-gray-100">
                            <span
                                class="text-gray-500 font-medium">Child Group <span class="text-[10px] bg-gray-100 px-1 rounded text-gray-400 ml-1">{{childPax}}x</span></span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.child * childPax) }}</span>
                        </div>
                        <div v-if="storeTotals.vehicle > 0" class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Vehicle Hire</span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.vehicle) }}</span></div>
                        <div v-if="storeTotals.flights > 0" class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Flights</span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.flights) }}</span></div>
                        <div v-if="storeTotals.guideFee > 0" class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Guide Fee</span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.guideFee) }}</span></div>
                        <div v-if="storeTotals.guideAcc > 0" class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Guide Acc</span><span
                                class="font-bold text-gray-900">{{ format(storeTotals.guideAcc) }}</span></div>
                        <div v-if="calculatedFuel > 0" class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Fuel & Return</span><span
                                class="font-bold text-gray-900">{{ format(calculatedFuel)
                                }}</span></div>
                        <div v-if="activitiesTotal > 0" class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Activities</span><span
                                class="font-bold text-gray-900">{{ format(activitiesTotal) }}</span></div>
                        <div v-if="extrasTotal > 0" class="flex justify-between border-b border-gray-100 pb-2"><span
                                class="text-gray-500 font-medium">Other Extras</span><span
                                class="font-bold text-gray-900">{{ format(extrasTotal) }}</span>
                        </div>"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open("/Users/jaunhusselmann/Desktop/AG Projects/costing-app/index.html", "w") as f:
        f.write(content)
    print("UI Summary Matrix Patched successfully.")
else:
    print("Error: Could not find old block")

# Let's also patch downloadPdf html generation if it's there
pdf_old_block = """                        <div class="row"><span>Vehicle Hire</span><span>${format(t.vehicle)}</span></div>
                        <div class="row"><span>Flights</span><span>${format(t.flights)}</span></div>
                        <div class="row"><span>Guide Acc & Fee</span><span>${format(t.guideFee + t.guideAcc)}</span></div>"""

pdf_new_block = """                        ${t.vehicle > 0 ? `<div class="row"><span>Vehicle Hire</span><span>${format(t.vehicle)}</span></div>` : ''}
                        ${t.flights > 0 ? `<div class="row"><span>Flights</span><span>${format(t.flights)}</span></div>` : ''}
                        ${t.guideFee > 0 ? `<div class="row"><span>Guide Fee</span><span>${format(t.guideFee)}</span></div>` : ''}
                        ${t.guideAcc > 0 ? `<div class="row"><span>Guide Acc</span><span>${format(t.guideAcc)}</span></div>` : ''}"""

if pdf_old_block in content:
    content = content.replace(pdf_old_block, pdf_new_block)
    with open("/Users/jaunhusselmann/Desktop/AG Projects/costing-app/index.html", "w") as f:
        f.write(content)
    print("PDF Summary Matrix Patched successfully.")
else:
    print("Error: Could not find pdf old block")

