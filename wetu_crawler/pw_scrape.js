const { chromium } = require('playwright');
const fs = require('fs');

const urls = [
  "https://wetu.com/ItineraryOutputs/Discovery/d957f35f-76c0-4276-899d-ba04411b5e9e?_gl=1*1m76u70*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM",
  "https://wetu.com/ItineraryOutputs/Discovery/b02e8a98-0fe9-4d6b-9a85-8fcc81355557?_gl=1*1m76u70*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.",
  "https://wetu.com/Itinerary/Landing/8d67bdc1-417a-411c-ac60-e312537c8730?_gl=1*pltz9a*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.",
  "https://wetu.com/ItineraryOutputs/Discovery/f959961b-5ea6-43dc-b713-5a2fb0928eb1?_gl=1*pltz9a*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.",
  "https://wetu.com/ItineraryOutputs/Discovery/487e81b5-4faf-4bdc-88f7-d28a3b229cdf?_gl=1*pltz9a*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.",
  "https://wetu.com/ItineraryOutputs/Discovery/e3ab6f95-cd77-4d07-943b-45d8257dda6c?_gl=1*1ybjf9g*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM."
];

async function scrape() {
  const browser = await chromium.launch({ headless: true });
  const results = {};

  for (let i = 0; i < urls.length; i++) {
    const context = await browser.newContext();
    const page = await context.newPage();
    console.log(`Scraping Tour ${i+1}: ${urls[i]} ...`);
    
    try {
        await page.goto(urls[i], { waitUntil: 'load', timeout: 90000 });
        console.log(`[Tour ${i+1}] Page loaded, waiting 6s for React...`);
        await page.waitForTimeout(6000); // Wait for SPA load
        
        // Try clicking tabs
        await page.evaluate(() => {
            let tabs = Array.from(document.querySelectorAll('div, a, button, span, li')).filter(el => /Itinerary|Day by Day|Details/i.test(el.innerText));
            for(let tab of tabs) { try { tab.click(); } catch(e){} }
        });
        
        console.log(`[Tour ${i+1}] Clicked tabs, waiting 4s...`);
        await page.waitForTimeout(4000);
        
        // Extract Data
        const data = await page.evaluate(() => {
            let daysArr = [];
            // Target Day Headers
            let headers = Array.from(document.querySelectorAll('h2, h3, h4, .day-title, .title, .day-heading, .day, strong')).filter(el => /Day(?!s) \d+/i.test(el.innerText));
            
            if (headers.length > 0) {
                for (let j = 0; j < headers.length; j++) {
                    let title = headers[j].innerText.trim();
                    let desc = "";
                    let imgs = [];
                    let curr = headers[j].nextElementSibling;
                    let steps = 0;
                    
                    // Dig up if next element is empty
                    let container = headers[j].parentElement;
                    if (container && container.innerText.length > 200) {
                       desc = container.innerText.replace(title, '').trim();
                       let elImgs = container.querySelectorAll('img');
                       elImgs.forEach(im => { if(im.src && !im.src.includes('logo') && !im.src.includes('icon')) imgs.push(im.src); });
                    } else {
                       while(curr && steps < 50) {
                           if (['H2','H3','H4'].includes(curr.tagName) && /Day \d+/i.test(curr.innerText)) break;
                           desc += curr.innerText ? curr.innerText + "\\n" : "";
                           let elImgs = curr.querySelectorAll ? Array.from(curr.querySelectorAll('img')) : [];
                           if (curr.tagName === 'IMG' && curr.src) imgs.push(curr.src);
                           elImgs.forEach(im => { if(im.src && !im.src.includes('logo') && !im.src.includes('icon')) imgs.push(im.src); });
                           curr = curr.nextElementSibling;
                           steps++;
                       }
                    }
                    daysArr.push({ title, desc: desc.substring(0, 1000), images: Array.from(new Set(imgs)).slice(0, 7) });
                }
            } else {
                // Failsafe
                let allImgs = Array.from(document.querySelectorAll('img')).map(i=>i.src).filter(url => url && !url.includes('logo') && !url.includes('icon'));
                daysArr.push({ title: "Itinerary Overiew", desc: document.body.innerText.substring(0, 2000), images: Array.from(new Set(allImgs)).slice(0, 10) });
            }
            return { title: document.title, days: daysArr };
        });
        
        results[`tour_${i+1}`] = data;
        console.log(`[Tour ${i+1}] Success! Found ${data.days.length} days.`);
        
    } catch(err) {
        console.log(`[Tour ${i+1}] Error: ${err.message}`);
    }
    
    await context.close();
  }
  
  await browser.close();
  fs.writeFileSync('/tmp/wetu_scraped_data.json', JSON.stringify(results, null, 2));
  console.log("Extraction completely done and saved to root dt_library folder as wetu_scraped_data.json");
}

scrape();
