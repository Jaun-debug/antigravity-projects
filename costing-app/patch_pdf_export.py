import re

with open("/Users/jaunhusselmann/Desktop/AG Projects/costing-app/index.html", "r") as f:
    content = f.read()

# Fix calculations in exportDocument
old_calc = """                    let group = 0, single = 0, child = 0, vehicle = 0, guideFee = 0, guideAcc = 0, flights = 0;
                    q.itinerary.forEach(d => {
                        group += (d.pp || 0); single += (d.single || 0);
                        vehicle += (d.vehicle || 0); guideFee += (d.guideFee || 0); guideAcc += (d.guideAcc || 0); flights += (d.flights || 0);
                    });"""

new_calc = """                    let group = 0, single = 0, child = 0, vehicle = 0, guideFee = 0, guideAcc = 0, flights = 0;
                    q.itinerary.forEach(d => {
                        let n = parseInt(d.nights) || 1;
                        group += (d.pp || 0) * n; single += (d.single || 0) * n; child += (d.child || 0) * n;
                        vehicle += (d.vehicle || 0) * n; guideFee += (d.guideFee || 0) * n; guideAcc += (d.guideAcc || 0) * n; flights += (d.flights || 0) * n;
                    });"""

if old_calc in content:
    content = content.replace(old_calc, new_calc)
    print("Fixed exportDocument multiplications.")
else:
    print("Could not find old_calc")

# Fix stoTotal in exportDocument to include child and properly use sharedPP for child
old_sto = """                    const doubleStoPP = group + sharedPP;
                    const singleStoPP = group + single + sharedPP;

                    let stoTotal = (doubleStoPP * Math.max(0, q.doublePax !== undefined ? q.doublePax : q.numPax)) + (singleStoPP * Math.max(0, q.singlePax || 0));"""

new_sto = """                    const doubleStoPP = group + sharedPP;
                    const singleStoPP = group + single + sharedPP;
                    const childStoPP = child + sharedPP;

                    let stoTotal = (doubleStoPP * Math.max(0, q.doublePax !== undefined ? q.doublePax : q.numPax)) + (singleStoPP * Math.max(0, q.singlePax || 0)) + (childStoPP * Math.max(0, q.childPax || 0));"""

if old_sto in content:
    content = content.replace(old_sto, new_sto)
    print("Fixed exportDocument stoTotal.")
else:
    print("Could not find old_sto")


# Now fix the matrix in the PDF display
old_matrix = """        <tr>
            <td style="color: #71717a;">Base Group Accommodation (${Math.max(0, q.numPax)}x)</td>
            <td style="text-align: right; font-weight: 500;">${format(group * Math.max(0, q.numPax))}</td>
        </tr>
        <tr>
            <td style="color: #71717a;">Single Supplements (${Math.max(0, q.singlePax || 0)}x)</td>
            <td style="text-align: right; font-weight: 500;">${format(single * Math.max(0, q.singlePax || 0))}</td>
        </tr>
        <tr>
            <td style="color: #71717a;">Vehicle Hire</td>
            <td style="text-align: right; font-weight: 500;">${format(vehicle)}</td>
        </tr>
        <tr>
            <td style="color: #71717a;">Guide Acc & Fee</td>
            <td style="text-align: right; font-weight: 500;">${format(guideFee + guideAcc)}</td>
        </tr>
        <tr>
            <td style="color: #71717a;">Fuel & Distance (${q.fuelDistance} km)</td>
            <td style="text-align: right; font-weight: 500;">${format(calcFuel)}</td>
        </tr>
        <tr>
            <td style="color: #71717a;">Activities Total</td>
            <td style="text-align: right; font-weight: 500;">${format(activitiesTotal)}</td>
        </tr>
        <tr>
            <td style="color: #71717a;">Other Extras Total</td>
            <td style="text-align: right; font-weight: 500;">${format(extTot)}</td>
        </tr>"""

new_matrix = """        ${group > 0 ? `<tr>
            <td style="color: #71717a;">Base Group Accommodation (${Math.max(0, q.doublePax !== undefined ? q.doublePax : q.numPax)}x)</td>
            <td style="text-align: right; font-weight: 500;">${format(group * Math.max(0, q.doublePax !== undefined ? q.doublePax : q.numPax))}</td>
        </tr>` : ''}
        ${single > 0 ? `<tr>
            <td style="color: #71717a;">Single Supplements (${Math.max(0, q.singlePax || 0)}x)</td>
            <td style="text-align: right; font-weight: 500;">${format(single * Math.max(0, q.singlePax || 0))}</td>
        </tr>` : ''}
        ${child > 0 ? `<tr>
            <td style="color: #71717a;">Child Supplements (${Math.max(0, q.childPax || 0)}x)</td>
            <td style="text-align: right; font-weight: 500;">${format(child * Math.max(0, q.childPax || 0))}</td>
        </tr>` : ''}
        ${vehicle > 0 ? `<tr>
            <td style="color: #71717a;">Vehicle Hire</td>
            <td style="text-align: right; font-weight: 500;">${format(vehicle)}</td>
        </tr>` : ''}
        ${flights > 0 ? `<tr>
            <td style="color: #71717a;">Flights</td>
            <td style="text-align: right; font-weight: 500;">${format(flights)}</td>
        </tr>` : ''}
        ${guideFee > 0 ? `<tr>
            <td style="color: #71717a;">Guide Fee</td>
            <td style="text-align: right; font-weight: 500;">${format(guideFee)}</td>
        </tr>` : ''}
        ${guideAcc > 0 ? `<tr>
            <td style="color: #71717a;">Guide Accommodation</td>
            <td style="text-align: right; font-weight: 500;">${format(guideAcc)}</td>
        </tr>` : ''}
        ${calcFuel > 0 ? `<tr>
            <td style="color: #71717a;">Fuel & Distance (${q.fuelDistance} km)</td>
            <td style="text-align: right; font-weight: 500;">${format(calcFuel)}</td>
        </tr>` : ''}
        ${activitiesTotal > 0 ? `<tr>
            <td style="color: #71717a;">Activities Total</td>
            <td style="text-align: right; font-weight: 500;">${format(activitiesTotal)}</td>
        </tr>` : ''}
        ${extTot > 0 ? `<tr>
            <td style="color: #71717a;">Other Extras Total</td>
            <td style="text-align: right; font-weight: 500;">${format(extTot)}</td>
        </tr>` : ''}"""

if old_matrix in content:
    content = content.replace(old_matrix, new_matrix)
    print("Fixed PDF UI Matrix")
else:
    print("Could not find old_matrix")

with open("/Users/jaunhusselmann/Desktop/AG Projects/costing-app/index.html", "w") as f:
    f.write(content)

