const https = require('https');
const fs = require('fs');
const { LODGES } = require('./scraper');

const DELAY = 1500;
const DB_FILE = 'wetu_images.json';
const URL_DB_FILE = 'wetu_urls.json';

// === UTILS ===
function fetchUrl(url, redirectCount = 0) {
    return new Promise((resolve, reject) => {
        if (redirectCount > 5) return reject(new Error("Too many redirects"));
        const req = https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            timeout: 10000
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let nextUrl = res.headers.location;
                if (!nextUrl.startsWith('http')) {
                    const baseUrl = new URL(url).origin;
                    nextUrl = new URL(nextUrl, baseUrl).toString();
                }
                return fetchUrl(nextUrl, redirectCount + 1).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error("Timeout")); });
    });
}

// === LOGIC ===
async function findWetuUrl(lodgeName) {
    const query = `${lodgeName} Wetu iBrochure`;
    const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
    try {
        const html = await fetchUrl(searchUrl);
        const encodedRegex = /RU=(https%3a%2f%2f(?:www\.)?wetu\.com%2fiBrochure%2fen%2f[^"&]*)/g;
        let match = encodedRegex.exec(html);
        if (match) return decodeURIComponent(match[1]);

        const rawRegex = /href="(https?:\/\/wetu\.com\/iBrochure\/en\/[^"]*)"/g;
        match = rawRegex.exec(html);
        if (match) return match[1];
    } catch (e) {
        console.warn(`  Search failed for ${lodgeName}: ${e.message}`);
    }
    return null;
}

async function scrapeImages(wetuUrl) {
    // Strategy: Fetch the "Print" version of the page which is often Server-Side Rendered
    // URL Pattern: .../iBrochure/en/Home/[ID]/Name...  --> replace /Home/ with /Information/ and append /Print

    // 1. Construct Print URL
    let printUrl = wetuUrl;
    if (wetuUrl.includes('/Home/')) {
        printUrl = wetuUrl.replace('/Home/', '/Information/');
        if (!printUrl.endsWith('/Print')) printUrl += '/Print';
    }

    // 2. Fetch
    try {
        // console.log(`      fetching print url: ${printUrl}`);
        const html = await fetchUrl(printUrl);

        // 3. Extract Images
        const imgRegex = /https?:\/\/(?:www\.|evo\.dev\.)?wetu\.com\/ImageHandler\/[^"'\s\)\]]*/g;
        const matches = html.match(imgRegex);

        if (matches) {
            return [...new Set(matches.filter(u => !u.includes('logo') && !u.includes('icon')))].slice(0, 15);
        }

        // 4. Fallback: Try original URL if Print failed to yield images
        if (printUrl !== wetuUrl) {
            const html2 = await fetchUrl(wetuUrl);
            const matches2 = html2.match(imgRegex);
            if (matches2) return [...new Set(matches2.filter(u => !u.includes('logo') && !u.includes('icon')))].slice(0, 15);
        }

    } catch (e) {
        console.warn(`  Scrape failed: ${e.message}`);
    }
    return [];
}

async function run() {
    console.log("Starting FINAL HTTP Image Population Task...");

    const targetLodges = LODGES.filter(l => l.bbid && l.bbid.startsWith('WETU_'));
    const totalLodges = targetLodges.length;

    let imageDb = {};
    if (fs.existsSync(DB_FILE)) { imageDb = JSON.parse(fs.readFileSync(DB_FILE)); }

    let urlDb = {};
    if (fs.existsSync(URL_DB_FILE)) { urlDb = JSON.parse(fs.readFileSync(URL_DB_FILE)); }

    for (let i = 0; i < totalLodges; i++) {
        const lodge = targetLodges[i];
        const lodgeName = lodge.name;

        // Skip valid
        if (imageDb[lodgeName] && imageDb[lodgeName].length > 0) {
            console.log(`[${i + 1}/${totalLodges}] ${lodgeName} - Cached`);
            continue;
        }

        console.log(`[${i + 1}/${totalLodges}] Processing ${lodgeName}...`);

        let wetuUrl = urlDb[lodgeName];
        if (!wetuUrl) {
            wetuUrl = await findWetuUrl(lodgeName);
            if (wetuUrl) {
                urlDb[lodgeName] = wetuUrl;
                fs.writeFileSync(URL_DB_FILE, JSON.stringify(urlDb, null, 2));
            }
        }

        if (wetuUrl) {
            const images = await scrapeImages(wetuUrl);
            if (images.length > 0) {
                console.log(`  > Found ${images.length} images!`);
                imageDb[lodgeName] = images;
                fs.writeFileSync(DB_FILE, JSON.stringify(imageDb, null, 2));
            } else {
                console.log(`  > URL found but NO images.`);
            }
        } else {
            console.log(`  > No Wetu URL.`);
        }

        await new Promise(r => setTimeout(r, DELAY));
    }
    console.log("Done.");
}

run();
