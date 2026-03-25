 now const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('Navigating to https://www.namibialuxurysafaris.com/accommodation?region=sossusvlei...');
        await page.goto('https://www.namibialuxurysafaris.com/accommodation?region=sossusvlei', { waitUntil: 'networkidle0', timeout: 60000 });

        // Wait for items to load
        // Based on typical scraping, we look for elements that look like cards
        // Inspecting typical generic structure if we don't know the exact class names:
        // usually <a> tags with images inside, or <div>s with class 'item', 'card', 'accommodation', etc.
        // We will try to extract as much as possible.

        // Let's create a generic extractor that looks for image + text pairs
        const lodges = await page.evaluate(() => {
            const results = [];
            // Try to identify the grid items. 
            // Often these are in a grid.
            // Let's look for images that have 'alt' text which might be the lodge name

            // Selector strategy: look for images within links or common card containers
            const images = Array.from(document.querySelectorAll('img'));

            images.forEach(img => {
                const src = img.src || img.dataset.src;
                if (!src || src.includes('logo') || src.includes('icon')) return;

                // Try to find the closest name
                // 1. Alt text
                let name = img.alt;

                // 2. If no alt, look for nearest heading
                if (!name || name.length < 3) {
                    const parentCard = img.closest('div, a, li');
                    if (parentCard) {
                        const heading = parentCard.querySelector('h1, h2, h3, h4, h5, .title, .name');
                        if (heading) name = heading.innerText;
                    }
                }

                if (name && name.length > 3 && src) {
                    // Clean up name
                    name = name.trim();
                    // Avoid duplicates and generic names
                    if (!results.find(r => r.name === name)) {
                        results.push({ name, image: src });
                    }
                }
            });

            return results.slice(0, 30); // Limit to 30
        });

        console.log(JSON.stringify(lodges, null, 2));

        await browser.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();
