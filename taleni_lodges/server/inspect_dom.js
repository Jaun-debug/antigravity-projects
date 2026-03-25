const puppeteer = require('puppeteer');

(async () => {
    let browser = null;
    try {
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

        // Hoodia Lodge URL
        const url = "https://book.nightsbridge.com/15195?checkInDate=2026-06-01&checkOutDate=2026-06-02";

        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log("Page loaded. Extracting structure...");

        const result = await page.evaluate(() => {
            // Get all room types and their containers
            const roomNodes = Array.from(document.querySelectorAll('.room-type-container, .rt-container, .room-type'));

            // If we can't find specific classes, dump the structure of identifying elements
            const structure = roomNodes.map(node => {
                return {
                    className: node.className,
                    innerText: node.innerText.substring(0, 100) + "..." // Truncate
                };
            });

            return {
                title: document.title,
                bodyText: document.body.innerText.substring(0, 500), // First 500 chars
                structure: structure.length > 0 ? structure : "No .room-type-container found. Dumping body classes: " + document.body.className
            };
        });

        console.log("--- RESULT ---");
        console.log(JSON.stringify(result, null, 2));
        console.log("--------------");

    } catch (error) {
        console.error("Scraping failed:", error);
    } finally {
        if (browser) await browser.close();
    }
})();
