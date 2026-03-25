const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

async function parseExcel(filePath) {
    try {
        const workbook = XLSX.readFile(filePath);
        let extractedData = {
            rooms: [],
            childPolicy: "Contact lodge for details",
            source: path.basename(filePath)
        };

        // We'll check the first few sheets that look relevant
        const relevantSheets = workbook.SheetNames.filter(name =>
            /rate|price|rack|sto|202[56]/i.test(name)
        );

        const sheetsToProcess = relevantSheets.length > 0 ? relevantSheets : [workbook.SheetNames[0]];

        for (const sheetName of sheetsToProcess) {
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            for (const row of rows) {
                if (!Array.isArray(row)) continue;

                // Simple heuristic: find a string (room name) and a number (price)
                let roomName = "";
                let prices = [];

                row.forEach(cell => {
                    if (typeof cell === 'string' && cell.length > 5 && !/total|date|page|email|tel/i.test(cell)) {
                        roomName = cell.trim();
                    } else if (typeof cell === 'number' && cell > 100) {
                        prices.push(cell);
                    }
                });

                if (roomName && prices.length > 0) {
                    // Avoid adding generic headers as room names
                    if (/rack|sto|price|adult|child|policy/i.test(roomName) && roomName.length < 15) continue;

                    extractedData.rooms.push({
                        name: roomName,
                        rackRate: prices[0],
                        stoRate: prices[1] || Math.round(prices[0] * 0.8),
                        basis: "BB" // Default for Excel if not found
                    });
                }
            }
        }

        return extractedData.rooms.length > 0 ? extractedData : null;
    } catch (e) {
        console.error(`Error parsing Excel ${filePath}:`, e.message);
        return null;
    }
}

module.exports = { parseExcel };
