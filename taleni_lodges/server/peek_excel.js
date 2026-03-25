const XLSX = require('xlsx');
const fs = require('fs');

async function peek() {
    const file = '/Users/jaunhusselmann/OneDrive/1.2 RATES/3. 2026 RATES CELESTE/1. INDIVIDUAL PROPERTY RATES/BEACH LODGE 2025 (2026 Rates not available yet)/BEACH LODGE STO 2024 - 2025.xls';
    if (!fs.existsSync(file)) return console.log('File not found');

    const workbook = XLSX.readFile(file);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log('Sheet Name:', sheetName);
    console.log('First 5 rows:');
    data.slice(0, 10).forEach(row => console.log(row));
}

peek();
