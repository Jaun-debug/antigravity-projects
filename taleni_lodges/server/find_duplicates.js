const { LODGES } = require('./scraper');

const nameMap = new Map();
const bbidMap = new Map();
const duplicates = [];

LODGES.forEach((lodge, index) => {
    // Check Name Duplicates
    if (nameMap.has(lodge.name)) {
        duplicates.push({ type: 'Same Name', original: nameMap.get(lodge.name), current: lodge, index });
    } else {
        nameMap.set(lodge.name, { ...lodge, index });
    }

    // Check BBID Duplicates
    if (lodge.bbid && bbidMap.has(lodge.bbid)) {
        // If names are different, it's a conflict
        const original = bbidMap.get(lodge.bbid);
        if (original.name !== lodge.name) {
            duplicates.push({ type: 'ID Conflict', original, current: lodge, index });
        } else if (!nameMap.has(lodge.name)) {
            // If same name, we already caught it above, but double check
            duplicates.push({ type: 'ID Duplicate', original, current: lodge, index });
        }
    } else if (lodge.bbid) {
        bbidMap.set(lodge.bbid, { ...lodge, index });
    }
});

console.log(JSON.stringify(duplicates, null, 2));
