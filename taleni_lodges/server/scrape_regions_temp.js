const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeHierarchy() {
    let browser = null;
    try {
        console.log("Launching browser...");
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 2000 });

        console.log("Navigating to namibialuxurysafaris.com...");
        await page.goto('https://www.namibialuxurysafaris.com/accommodation', {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        console.log("Page loaded. Extracting headings and links...");

        const structure = await page.evaluate(() => {
            // Grab H2s as likely regions
            const h2s = Array.from(document.querySelectorAll('h2')).map(h => ({
                text: h.innerText.trim(),
                tagName: 'H2'
            }));

            // Grab links which might be cards
            const links = Array.from(document.querySelectorAll('a')).map(a => ({
                text: a.innerText.trim(),
                href: a.href
            })).filter(l => l.text.length > 0);

            // Also try to find cards by class if possible, but we don't know the classes.
            // Let's grab specific text that looks like a region if we can spot it.
            // Or just dump body text again if we are unsure.

            return {
                h2s,
                links,
                bodyPreview: document.body.innerText.substring(0, 5000) // First 5000 chars
            };
        });

        console.log(`Found ${structure.h2s.length} H2s and ${structure.links.length} links.`);
        fs.writeFileSync('site_dump.json', JSON.stringify(structure, null, 2));
        console.log("Dump saved to site_dump.json");

    } catch (err) {
        console.error("Fatal Error:", err);
    } finally {
        if (browser) await browser.close();
    }
}

scrapeHierarchy();
