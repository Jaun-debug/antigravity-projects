const fs = require('fs');

const file = fs.readFileSync('/Users/jaunhusselmann/.gemini/antigravity/scratch/taleni_lodges/server/scraper.js', 'utf8');

const match = file.match(/const LODGES = (\[[\s\S]*?\]);/);
if (match) {
    let lodgesText = match[1];
    fs.writeFileSync('/Users/jaunhusselmann/.gemini/antigravity/scratch/desert-tracks-dashboard/src/data/lodges.ts', 
        `export const INITIAL_LODGES = ${lodgesText};\n`
    );
    console.log("Extracted to src/data/lodges.ts");
} else {
    console.log("Could not find LODGES in server/scraper.js");
}
