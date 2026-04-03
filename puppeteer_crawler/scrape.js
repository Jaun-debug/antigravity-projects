const puppeteer = require('puppeteer');
const fs = require('fs');

const urls = [
  "https://wetu.com/ItineraryOutputs/Discovery/d957f35f-76c0-4276-899d-ba04411b5e9e",
  "https://wetu.com/ItineraryOutputs/Discovery/b02e8a98-0fe9-4d6b-9a85-8fcc81355557",
  "https://wetu.com/Itinerary/Landing/8d67bdc1-417a-411c-ac60-e312537c8730",
  "https://wetu.com/ItineraryOutputs/Discovery/f959961b-5ea6-43dc-b713-5a2fb0928eb1",
  "https://wetu.com/ItineraryOutputs/Discovery/487e81b5-4faf-4bdc-88f7-d28a3b229cdf",
  "https://wetu.com/ItineraryOutputs/Discovery/e3ab6f95-cd77-4d07-943b-45d8257dda6c"
];

async function scrape() {
  const browser = await puppeteer.launch({ headless: "new" });
  const results = [];

  for (let i = 0; i < urls.length; i++) {
    const page = await browser.newPage();
    console.log(`Scraping ${urls[i]} ...`);
    try {
      await page.goto(urls[i], { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Wait for either Discovery or Landing page itinerary elements.
      await page.waitForTimeout(5000); // give it time to render the react app
      
      const data = await page.evaluate(() => {
        // Wetu structure varies, so we look for common day elements or we just extract all text and images.
        // Discovery uses div.day, Landing uses something else. We'll grab text block by block if needed.
        // Easiest is to look for elements containing 'Day '
        
        let days = [];
        
        // Strategy A: typical Wetu 'Itinerary' list
        let dayHeaders = Array.from(document.querySelectorAll('h2, h3, h4, .day-title, .itinerary-day-title')).filter(el => el.innerText.includes('Day '));
        
        if (dayHeaders.length === 0) {
            // Strategy B: generic blocks
            let allText = document.body.innerText;
            return { raw: "Couldn't parse exact days, raw extraction needed.", all: document.querySelectorAll('img').length + " images found" };
        }
        
        for (let j=0; j<dayHeaders.length; j++) {
            let title = dayHeaders[j].innerText.trim();
            // Get content between this header and next
            let current = dayHeaders[j].nextElementSibling;
            let desc = "";
            let img = "";
            let count = 0;
            while(current && count < 20) {
                if (['H2','H3','H4'].includes(current.tagName) && current.innerText.includes('Day ')) break;
                if (current.innerText) desc += current.innerText + "\n";
                if (!img && current.querySelector && current.querySelector('img')) {
                    img = current.querySelector('img').src;
                }
                current = current.nextElementSibling;
                count++;
            }
            days.push({
                title: title,
                desc: desc.substring(0, 300) + '...',
                img: img
            });
        }
        
        let heroImg = "";
        let heroEl = document.querySelector('img');
        if (heroEl) heroImg = heroEl.src;
        
        return {
            title: document.title,
            hero: heroImg,
            days: days
        };
      });
      
      results.push({ url: urls[i], data });
      console.log(`Finished ${urls[i]}`);
    } catch(err) {
      console.log(`Error on ${urls[i]}: ${err}`);
    }
    await page.close();
  }
  
  await browser.close();
  fs.writeFileSync('wetu_data.json', JSON.stringify(results, null, 2));
  console.log("Done");
}

scrape();
