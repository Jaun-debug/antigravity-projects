const puppeteer = require('puppeteer');
const fs = require('fs');
const { LODGES } = require('./scraper');

const DELAY = 5000; // 5 seconds between requests

async function scrapeImages() {
    console.log("Starting Image Scraper for Wetu Lodges...");

    const targetLodges = LODGES.filter(l => l.bbid && l.bbid.startsWith('WETU_'));
    console.log(`Found ${targetLodges.length} target lodges.`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    } catch (e) {
        console.error("Failed to launch browser:", e);
        return;
    }

    let results = {};
    if (fs.existsSync('wetu_images.json')) {
        try {
            results = JSON.parse(fs.readFileSync('wetu_images.json'));
        } catch (e) {
            console.error("Error reading existing JSON:", e);
        }
    }

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    for (const lodge of targetLodges) {
        if (results[lodge.name] && results[lodge.name].length > 0) {
            console.log(`Skipping ${lodge.name} (already have images)`);
            continue;
        }

        console.log(`Processing: ${lodge.name}`);

        try {
            const query = `${lodge.name} Wetu iBrochure`;
            await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });

            // Extract first result link that looks like wetu
            const link = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('li.b_algo h2 a'));
                for (const a of anchors) {
                    if (a.href.includes('wetu.com')) return a.href;
                }
                return null;
            });

            if (!link) {
                console.log(`No Wetu link found for ${lodge.name}`);
                continue;
            }

            console.log(`Found link: ${link}`);
            await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 });

            await new Promise(r => setTimeout(r, 2000));

            const images = await page.evaluate(() => {
                const imgs = Array.from(document.querySelectorAll('img'));
                const candidates = imgs
                    .filter(img => img.src && (img.src.includes('ImageHandler') || img.src.includes('content')))
                    .filter(img => img.naturalWidth > 300)
                    .map(img => img.src);
                return [...new Set(candidates)];
            });

            if (images.length > 0) {
                console.log(`Found ${images.length} images.`);
                results[lodge.name] = images.slice(0, 10);
                fs.writeFileSync('wetu_images.json', JSON.stringify(results, null, 2));
            } else {
                console.log("No images found.");
            }

        } catch (err) {
            console.error(`Error processing ${lodge.name}:`, err.message);
        }

        await new Promise(r => setTimeout(r, DELAY));
    }

    await browser.close();
    console.log("Scraper finished.");
}

scrapeImages().catch(err => console.error("Fatal Error:", err));
