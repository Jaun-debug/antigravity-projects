const fs = require('fs');
const pdf = require('pdf-parse');

async function parseGondwana() {
    const filePath = '/Users/jaunhusselmann/OneDrive/1.2 RATES/3. 2026 RATES CELESTE/2. GROUP RATES/GONDWANA (Always add Dinner to rate) ✅/2026+-+20%25+STO+RATE+SHEET+GONDWANA+ACCOMMODATION.pdf';
    let dataBuffer = fs.readFileSync(filePath);

    try {
        const data = await pdf(dataBuffer);
        const text = data.text;

        const rates = {};

        // Normalize text roughly
        const normalized = text.replace(/([A-Z])\s+(?=[A-Z]\s)/g, '$1');

        const properties = [
            'OKAPUKA SAFARI LODGE', 'THE WEINBERG', 'KALAHARI ANIB LODGE', 'KALAHARI FARMHOUSE',
            'CANYON LODGE', 'CANYON VILLAGE', 'CANYON ROADHOUSE', 'NAMIB DESERT LODGE',
            'NAMIB DUNE STAR CAMP', 'THE DESERT GRACE', 'DESERT WHISPER', 'THE DELIGHT',
            'DAMARA MOPANE LODGE', 'PALMWAG LODGE', 'OMARUNGA EPUPA FALLS', 'ETOSHA SAFARI LODGE',
            'ETOSHA SAFARI CAMP', 'ETOSHA KING NEHALE', 'HAKUSEMBE RIVER LODGE', 'NAMUSHASHA RIVER LODGE',
            'ZAMBEZI MUBALA LODGE', 'ZAMBEZI MUBALA CAMP', 'CHOBE RIVER CAMP'
        ];

        properties.forEach((prop, index) => {
            const startIdx = normalized.indexOf(prop);
            const endStr = properties[index + 1] || 'APPENDIX';
            const endIdx = normalized.indexOf(endStr, startIdx + prop.length);

            if (startIdx !== -1) {
                const section = normalized.substring(startIdx, endIdx !== -1 ? endIdx : normalized.length);
                const lines = section.split('\n').map(l => l.trim()).filter(l => l.length > 0);

                rates[prop] = {
                    rooms: [],
                    childPolicy: "0-5: Free, 6-13: 50% of Rack"
                };

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.includes('room') || line.includes('Suite') || line.includes('Pod') || line.includes('Villa') || line.includes('House')) {
                        // Look for prices in this line or next 2 lines
                        let foundPrices = null;
                        for (let j = 0; j < 3; j++) {
                            if (i + j < lines.length) {
                                const priceMatch = lines[i + j].match(/(\d{3,5}\.\d{2})/g);
                                if (priceMatch && priceMatch.length >= 2) {
                                    foundPrices = priceMatch;
                                    break;
                                }
                            }
                        }

                        if (foundPrices) {
                            const roomName = line.split(':')[0].trim();
                            rates[prop].rooms.push({
                                name: roomName,
                                rackRate: parseFloat(foundPrices[0]),
                                stoRate: parseFloat(foundPrices[1]),
                                basis: line.toLowerCase().includes('breakfast') || line.toLowerCase().includes('bb') ? "BB" : "DBB"
                            });
                        }
                    }
                }
            }
        });

        fs.writeFileSync('server/extracted_rates.json', JSON.stringify(rates, null, 2));
        console.log("Extraction complete. Saved to server/extracted_rates.json");
    } catch (error) {
        console.error("Error parsing PDF:", error);
    }
}

parseGondwana();
