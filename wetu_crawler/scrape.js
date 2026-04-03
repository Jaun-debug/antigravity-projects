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
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const results = {};

  for (let i = 0; i < urls.length; i++) {
    const page = await browser.newPage();
    console.log(`Scraping ${urls[i]} ...`);
    try {
        await page.goto(urls[i], { waitUntil: 'networkidle2', timeout: 90000 });
        await page.waitForTimeout(6000); // Wait for React
        
        await page.evaluate(() => {
            let tabs = Array.from(document.querySelectorAll('div, a, button, span')).filter(el => /Itinerary|Day by Day|Details/i.test(el.innerText));
            for(let tab of tabs) try { tab.click(); } catch(e){}
        });
        await page.waitForTimeout(4000);
        
        const data = await page.evaluate(() => {
            let days = [];
            let headers = Array.from(document.querySelectorAll('h2, h3, h4, .day-title, .title, .day-heading, .day')).filter(el => /Day \d+/i.test(el.innerText));
            
            if (headers.length > 0) {
                for (let j = 0; j < headers.length; j++) {
                    let title = headers[j].innerText.trim();
                    let desc = "";
                    let imgs = [];
                    // simple text extraction up to next heading
                    let curr = headers[j].nextElementSibling;
                    let steps = 0;
                    while(curr && steps < 50) {
                        if (['H2','H3','H4'].includes(curr.tagName) && /Day \d+/i.test(curr.innerText)) break;
                        desc += curr.innerText ? curr.innerText + "\\n" : "";
                        let elImgs = curr.querySelectorAll ? Array.from(curr.querySelectorAll('img')) : [];
                        if (curr.tagName === 'IMG' && curr.src) imgs.push(curr.src);
                        elImgs.forEach(im => i.src && imgs.push(i.src));
                        curr = curr.nextElementSibling;
                        steps++;
                    }
                    days.push({ title, desc: desc.substring(0, 1000), images: Array.from(new Set(imgs)).slice(0, 6) });
                }
            } else {
                days.push({ title: "Day 1", desc: document.body.innerText.substring(0, 1000), images: [] });
            }
            return { title: document.title, days };
        });
        
        results[`tour_${i+1}`] = data;
        console.log(`Finished ${urls[i]}`);
    } catch(err) {
        console.log(`Error on ${urls[i]}: ${err.message}`);
    }
    await page.close();
  }
  
  await browser.close();
  fs.writeFileSync('wetu_extracted.json', JSON.stringify(results, null, 2));
  console.log("Done extracting");
}

scrape();
