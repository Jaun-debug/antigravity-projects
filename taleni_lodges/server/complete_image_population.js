const https = require('https');
const fs = require('fs');
const { LODGES } = require('./scraper');

const DELAY = 1500; // Polite delay
const DB_FILE = 'wetu_images.json';

// Utility: Promisified HTTPS Get
function fetchUrl(url, redirectCount = 0) {
    return new Promise((resolve, reject) => {
        if (redirectCount > 5) return reject(new Error("Too many redirects"));

        const req = https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        }, (res) => {
            // Handle Redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let nextUrl = res.headers.location;
                if (!nextUrl.startsWith('http')) {
                    // Handle relative redirect (rare for DDG/Wetu but possible)
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
        req.on('timeout', () => {
            req.destroy();
            reject(new Error("Timeout"));
        });
    });
}

// 1. Search Phase: Get Wetu URL from Yahoo (DDG is rate limited)
async function findWetuUrl(lodgeName) {
    const query = `${lodgeName} Wetu iBrochure`;
    const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;

    try {
        const html = await fetchUrl(searchUrl);
        // Yahoo typical link format: .../RU=https%3a%2f%2fwetu.com.../RK=...
        // Or sometimes direct href depending on user agent, but usually wrapped

        // Regex to catch encoded Wetu URLs
        const encodedRegex = /RU=(https%3a%2f%2f(?:www\.)?wetu\.com%2fiBrochure%2fen%2f[^"&]*)/g;
        let match = encodedRegex.exec(html);
        if (match) {
            return decodeURIComponent(match[1]);
        }

        // Regex for unencoded (fallback)
        const rawRegex = /href="(https?:\/\/wetu\.com\/iBrochure\/en\/[^"]*)"/g;
        match = rawRegex.exec(html);
        if (match) {
            return match[1];
        }

    } catch (e) {
        console.warn(`  Search failed for ${lodgeName}: ${e.message}`);
    }
    return null;
}

// 2. Scrape Phase: Extract Images from Wetu Page
async function scrapeImages(wetuUrl) {
    try {
        const html = await fetchUrl(wetuUrl);

        // Strategy A: Regex for ImageHandler URLs (Wetu's specific CDN format)
        // Matches: https://wetu.com/ImageHandler/c[dims]/[id]/[filename]
        const imgRegex = /https?:\/\/(?:www\.|evo\.dev\.)?wetu\.com\/ImageHandler\/[^"'\s\)\]]*/g;
        let matches = html.match(imgRegex);

        if (matches) {
            return processMatches(matches);
        }

        // Strategy B: If no images, try to find the "Data" endpoint (AJAX payload)
        // URL pattern: .../iBrochure/en/Home/[ID]/... -> .../iBrochure/en/Data/[ID]
        // Regex to extract ID: /Home/([0-9-_]+)/
        const idMatch = wetuUrl.match(/\/Home\/([0-9-_]+)\//);
        if (idMatch) {
            const wetuId = idMatch[1];
            const dataUrl = `https://wetu.com/iBrochure/en/Data/${wetuId}`;
            // console.log(`    > Trying Data Endpoint: ${dataUrl}`);
            try {
                const jsonStr = await fetchUrl(dataUrl);
                // We don't even need to parse JSON, just regex over the string again
                matches = jsonStr.match(imgRegex);
                if (matches) {
                    return processMatches(matches);
                }
            } catch (err) {
                // Silently fail secondary strategy
            }
        }

        return [];

    } catch (e) {
        console.warn(`  Scrape failed for ${wetuUrl}: ${e.message}`);
        return [];
    }
}

function processMatches(matches) {
    const images = matches
        .filter(url => !url.includes('icon') && !url.includes('logo'))
        .filter(url => !url.includes('map') && !url.includes('Map'))
        .map(url => {
            // Ensure high quality: Force replacement of small thumbnails with large format if possible
            // But usually just taking what is there is safe.
            return url;
        });
    return [...new Set(images)].slice(0, 15);
}

const URL_DB_FILE = 'wetu_urls.json';
let urlDb = {};
if (fs.existsSync(URL_DB_FILE)) {
    try { urlDb = JSON.parse(fs.readFileSync(URL_DB_FILE)); } catch (e) { }
}

async function run() {
    console.log("Starting HTTP-based Image Population Task (No Puppeteer)...");

    // 1. Identify Target Lodges
    const targetLodges = LODGES.filter(l => l.bbid && l.bbid.startsWith('WETU_'));
    const totalLodges = targetLodges.length;
    console.log(`Target Lodges: ${totalLodges}`);

    // 2. Load Existing Data
    let imageDb = {};
    if (fs.existsSync(DB_FILE)) {
        try { imageDb = JSON.parse(fs.readFileSync(DB_FILE)); } catch (e) { console.error("Error reading DB", e); }
    }

    // 3. Processing Loop
    for (let i = 0; i < totalLodges; i++) {
        const lodge = targetLodges[i];
        const lodgeNum = i + 1;
        const lodgeName = lodge.name;

        // Skip if we already have images
        if (imageDb[lodgeName] && imageDb[lodgeName].length > 0) {
            console.log(`[${lodgeNum}/${totalLodges}] ${lodgeName} - Cached (${imageDb[lodgeName].length} imgs)`);
            continue;
        }

        console.log(`[${lodgeNum}/${totalLodges}] Processing: ${lodgeName}...`);

        // Find URL
        let wetuUrl = urlDb[lodgeName]; // Check cache first
        if (!wetuUrl) {
            wetuUrl = await findWetuUrl(lodgeName);
            if (wetuUrl) {
                urlDb[lodgeName] = wetuUrl;
                fs.writeFileSync(URL_DB_FILE, JSON.stringify(urlDb, null, 2));
            }
        }

        if (wetuUrl) {
            // Scrape Images
            const images = await scrapeImages(wetuUrl);

            if (images.length > 0) {
                imageDb[lodgeName] = images;
                console.log(`  > Success: Found ${images.length} images.`);
                fs.writeFileSync(DB_FILE, JSON.stringify(imageDb, null, 2));
            } else {
                console.log(`  > URL found (${wetuUrl}) but NO images extracted.`);
                imageDb[lodgeName] = [];
            }
        } else {
            console.log(`  > No Wetu iBrochure URL found.`);
            imageDb[lodgeName] = [];
        }

        // Polite Delay
        await new Promise(r => setTimeout(r, DELAY));
    }

    console.log("Done.");
}

run();
