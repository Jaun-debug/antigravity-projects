const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { parseExcel } = require('./extract_excel_rates');

const RATES_DIR = '/Users/jaunhusselmann/OneDrive/1.2 RATES/3. 2026 RATES CELESTE';
const OUTPUT_FILE = 'server/extracted_rates.json';

async function parsePdf(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text.replace(/([A-Z])\s+(?=[A-Z]\s)/g, '$1'); // Basic normalization
    } catch (e) {
        console.error(`Error reading ${filePath}: ${e.message}`);
        return null;
    }
}

async function extractRates() {
    let currentRates = {};
    if (fs.existsSync(OUTPUT_FILE)) {
        currentRates = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    }

    const dirsToProcess = [
        path.join(RATES_DIR, '1. INDIVIDUAL PROPERTY RATES'),
        path.join(RATES_DIR, '2. GROUP RATES')
    ];

    for (const baseDir of dirsToProcess) {
        if (!fs.existsSync(baseDir)) continue;
        console.log(`\n--- Scanning Directory: ${path.basename(baseDir)} ---`);

        const folders = fs.readdirSync(baseDir);

        for (const folder of folders) {
            if (folder === '.DS_Store' || folder.startsWith('.')) continue;

            const folderPath = path.join(baseDir, folder);
            if (!fs.statSync(folderPath).isDirectory()) continue;

            async function findAndProcessPdfs(dir) {
                const list = fs.readdirSync(dir);
                for (const file of list) {
                    const fullPath = path.join(dir, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        await findAndProcessPdfs(fullPath);
                    } else if (file.toLowerCase().endsWith('.pdf') || file.toLowerCase().endsWith('.xlsx') || file.toLowerCase().endsWith('.xls')) {
                        // Skip temporary or metadata files
                        if (file.startsWith('~$') || file.includes('Data Update')) continue;

                        let lodgeName = path.basename(dir).replace(/\(.*\)/, '').replace(/✅/, '').replace(/_/g, ' ').trim().toUpperCase();

                        // If the folder is a group folder, try to get a better name from the file
                        const groupFolders = ['TALENI', 'GONDWANA', 'SUN KARROS', 'O&L LEISURE', 'JOURNEYS NAMIBIA', 'NAMIBIA COUNTRY LODGES'];
                        if (groupFolders.some(g => lodgeName.includes(g)) || lodgeName.includes('GROUP RATES')) {
                            const fileNameCleanup = file.replace(/202[56]/g, '')
                                .replace(/\.pdf/i, '')
                                .replace(/STO/i, '')
                                .replace(/RACK/i, '')
                                .replace(/_/g, ' ')
                                .replace(/\(.*\)/, '')
                                .replace(/✅/, '')
                                .trim().toUpperCase();
                            if (fileNameCleanup.length > 5) {
                                lodgeName = fileNameCleanup;
                            }
                        }

                        console.log(`Processing ${lodgeName} from ${file}...`);

                        let rateInfo = null;

                        if (file.toLowerCase().endsWith('.pdf')) {
                            const text = await parsePdf(fullPath);
                            if (text) {
                                rateInfo = {
                                    rooms: [],
                                    childPolicy: "Contact lodge for details",
                                    source: file
                                };
                                const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
                                lines.forEach(line => {
                                    const prices = line.match(/(\d{3,5}\.\d{2})/g);
                                    if (prices && prices.length >= 1) {
                                        const parts = line.split(/\d/);
                                        let name = parts[0].trim().replace(/[^a-zA-Z\s]/g, '').trim();
                                        if (name.length > 3) {
                                            rateInfo.rooms.push({
                                                name: name,
                                                rackRate: parseFloat(prices[0]),
                                                stoRate: prices[1] ? parseFloat(prices[1]) : Math.round(parseFloat(prices[0]) * 0.8),
                                                basis: line.toLowerCase().includes('bb') ? "BB" : "DBB"
                                            });
                                        }
                                    }
                                });
                            }
                        } else {
                            rateInfo = await parseExcel(fullPath);
                        }

                        if (rateInfo && rateInfo.rooms && rateInfo.rooms.length > 0) {
                            const data = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
                            data[lodgeName] = rateInfo;
                            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
                        }
                    }
                }
            }
            await findAndProcessPdfs(folderPath);
        }
    }

    const finalData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    console.log(`\nFINISHED! Total lodges with rates in database: ${Object.keys(finalData).length}`);
}

extractRates();
