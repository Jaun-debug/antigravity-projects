const puppeteer = require('puppeteer-core');

(async () => {
    try {
        const browser = await puppeteer.launch({
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            headless: 'new',
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        await page.goto("https://wetu.com/ItineraryOutputs/Discovery/EC95E889-23FE-4AC2-8023-F2CB885D59C7", {waitUntil: 'networkidle2', timeout: 30000});
        
        // Extract all itinerary blocks
        const data = await page.evaluate(() => {
            let days = [];
            document.querySelectorAll('.itinerary-day, .day-container, .itinerary-item').forEach(day => {
                let text = day.innerText;
                let images = Array.from(day.querySelectorAll('.gallery-image img, .slick-slide img, img')).map(i => i.src);
                days.append({text, images});
            });
            return days;
        });

        console.log(JSON.stringify(data, null, 2));
        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();
