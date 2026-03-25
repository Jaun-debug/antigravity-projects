const https = require('https');
// 28492 is Chobe River Camp ID
const url = 'https://wetu.com/iBrochure/en/Data/28492';

console.log(`Fetching Data from ${url}...`);

https.get(url, {
    headers: {
        'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        'Referer': "https://wetu.com/iBrochure/en/Home/28492/Chobe_River_Camp_Gondwana_Collection_Namibia"
    }
}, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Snippet: ${data.substring(0, 500)}`);

        // Check for images again
        const matches = data.match(/https?:\/\/[^"']*ImageHandler[^"']*/g);
        if (matches) console.log(`Found ${matches.length} images.`);
    });
});
