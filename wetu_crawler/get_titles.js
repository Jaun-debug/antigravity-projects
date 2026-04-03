const { chromium } = require('playwright');

const urls = [
  "https://wetu.com/ItineraryOutputs/Discovery/de75c783-8643-4e46-b0d6-114fbcd3f137",
  "https://wetu.com/ItineraryOutputs/Discovery/4db02e36-a80a-4486-987a-251d707016c0",
  "https://wetu.com/ItineraryOutputs/Discovery/cf8f5ef9-4740-4976-90d5-e644b2e25b4b",
  "https://wetu.com/ItineraryOutputs/Discovery/F959961B-5EA6-43DC-B713-5A2FB0928EB1",
  "https://wetu.com/ItineraryOutputs/Discovery/d957f35f-76c0-4276-899d-ba04411b5e9e",
  "https://wetu.com/ItineraryOutputs/Discovery/2084D921-60AB-4B0F-8832-E857FD4D0E35"
];

async function scrapeTitles() {
  const browser = await chromium.launch({ headless: true });
  for (let i = 0; i < urls.length; i++) {
    const page = await browser.newPage();
    try {
        await page.goto(urls[i], { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(6000); // Wait for React
        const title = await page.evaluate(() => {
            const h1 = document.querySelector('h1, .itinerary-header__title, .HeroHeader--title');
            if (h1) return h1.innerText.trim();
            const h2 = document.querySelector('h2');
            return h2 ? h2.innerText.trim() : document.title;
        });
        console.log(`URL ${i+1}: ${title} -> ${urls[i]}`);
    } catch(err) {
        console.log(`URL ${i+1}: ERROR -> ${urls[i]}`);
    }
    await page.close();
  }
  await browser.close();
}

scrapeTitles();
