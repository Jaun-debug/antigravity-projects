const fs = require('fs');
const pdf = require('pdf-parse');

async function testPdf() {
    console.log("Starting PDF extraction...");
    let dataBuffer = fs.readFileSync('/Users/jaunhusselmann/OneDrive/1.2 RATES/3. 2026 RATES CELESTE/2. GROUP RATES/GONDWANA (Always add Dinner to rate) ✅/2026+-+20%25+STO+RATE+SHEET+GONDWANA+ACCOMMODATION.pdf');

    try {
        const data = await pdf(dataBuffer);
        // Normalize text (remove extra spaces between letters)
        const normalized = data.text.replace(/([A-Za-z])\s+(?=[A-Za-z]\s)/g, '$1');

        console.log("--- NORMALIZED CONTENT (First 4000 chars) ---");
        console.log(normalized.substring(0, 4000));
        console.log("--- END CONTENT ---");

        // Save to file for easier inspection
        fs.writeFileSync('server/gondwana_text.txt', normalized);
    } catch (error) {
        console.error("Error parsing PDF:", error);
    }
}

testPdf();
