const https = require('https');
const fs = require('fs');

const baseId = '28492';
const slug = 'Chobe_River_Camp_Gondwana_Collection_Namibia';

const variants = [
    `https://wetu.com/iBrochure/en/Home/${baseId}/${slug}`,
    `https://wetu.com/iBrochure/en/Information/${baseId}/${slug}`,
    `https://wetu.com/iBrochure/en/Print/${baseId}/${slug}`,
    `https://wetu.com/iBrochure/en/Launch/${baseId}/${slug}/Landing`
];

function checkUrl(url, idx) {
    console.log(`\n[${idx}] Fetching: ${url}`);
    https.get(url, {
        headers: { 'User-Agent': "Mozilla/5.0" }
    }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            if (data.includes('Brochure Error')) {
                console.log("Result: Soft 404 (Brochure Error)");
            } else {
                console.log("Result: OK (Content found)");
                const imgs = data.match(/ImageHandler/g);
                console.log(`ImageHandler count: ${imgs ? imgs.length : 0}`);
                if (idx === 0) fs.writeFileSync('debug_home.html', data);
            }
        });
    });
}

variants.forEach((u, i) => checkUrl(u, i));
