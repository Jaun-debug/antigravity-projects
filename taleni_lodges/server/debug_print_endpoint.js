const https = require('https');
// Trying alternate pattern: /iBrochure/en/Information/[ID]/.../Print
const url = 'https://wetu.com/iBrochure/en/Information/28492/Chobe_River_Camp_Gondwana_Collection_Namibia/Print';

console.log(`Fetching Print view from ${url}...`);

https.get(url, {
    headers: {
        'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
}, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        const matches = data.match(/https?:\/\/[^"']*ImageHandler[^"']*/g);
        if (matches) console.log(`Found ${matches.length} images.`);
        else console.log("No images found.");

        // Also check for the "IBrochureData" variable in the HTML script tags
        if (data.includes('IBrochureData')) console.log("Found IBrochureData JSON blob!");
    });
});
