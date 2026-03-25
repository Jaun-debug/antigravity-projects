const fs = require('fs');
const path = require('path');
const { LODGES } = require('./scraper');

// Dedup by Name
const seenNames = new Set();
const uniqueLodges = [];

LODGES.forEach(lodge => {
    if (!seenNames.has(lodge.name)) {
        seenNames.add(lodge.name);
        uniqueLodges.push(lodge);
    }
});

// Read the original file
const filePath = path.join(__dirname, 'scraper.js');
let content = fs.readFileSync(filePath, 'utf8');

// Construct the new string
const newLodgesString = `const LODGES = ${JSON.stringify(uniqueLodges, null, 4)};`;

// Regex to replace the LODGES array
// Matches "const LODGES = [" ... "];" inclusive
// We rely on the structure of the file we saw earlier
const regex = /const LODGES = \[\s*[\s\S]*?\n\];/;

if (regex.test(content)) {
    const newContent = content.replace(regex, newLodgesString);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated scraper.js. Lodges count: ${LODGES.length} -> ${uniqueLodges.length}`);
} else {
    console.error("Could not find LODGES array in scraper.js");
}
