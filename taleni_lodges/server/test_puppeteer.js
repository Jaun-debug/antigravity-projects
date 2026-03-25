const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log("Launching browser...");
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        console.log("Browser launched.");
        const page = await browser.newPage();
        console.log("Page created.");
        await page.goto('about:blank');
        console.log("Navigated to blank.");
        await browser.close();
        console.log("Browser closed. Success.");
    } catch (e) {
        console.error("Puppeteer failed:", e);
    }
})();
