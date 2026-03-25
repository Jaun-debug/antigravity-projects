const fs = require('fs');
const scraper = require('./scraper.js');

const folderList = fs.readFileSync('server/folder_list.txt', 'utf8').split('\n').filter(Boolean);

const currentLodges = scraper.LODGES.map(l => l.name.toLowerCase());

const missing = [];

folderList.forEach(folder => {
    // Clean folder name (remove things in parentheses, etc)
    let cleanName = folder.replace(/\(.*\)/, '').replace(/✅/, '').trim();
    if (!currentLodges.includes(cleanName.toLowerCase())) {
        missing.push({ folder, cleanName });
    }
});

console.log("Missing Lodges Found in Folder List:");
console.log(JSON.stringify(missing, null, 2));
