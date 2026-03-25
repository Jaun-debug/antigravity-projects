const https = require('https');

// Verify Launch Endpoint
const url = 'https://wetu.com/iBrochure/en/Launch/28492/Chobe_River_Camp_Gondwana_Collection_Namibia/Landing';

console.log(`Fetching: ${url}`);
https.get(url, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        if (data.includes('Brochure Error')) {
            console.log("Error: Soft 404");
        } else {
            console.log("Success: Content found");
            const matches = data.match(/https?:\/\/[^"']*ImageHandler[^"']*/g);
            if (matches) {
                console.log(`Found ${matches.length} images:`);
                console.log(matches.slice(0, 3));
            } else {
                console.log("No images found.");
            }
        }
    });
});
