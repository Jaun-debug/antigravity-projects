const { firefox } = require('playwright');
const fs = require('fs');

const url = "https://wetu.com/ItineraryOutputs/Discovery/fed30fb1-7ce5-4fc8-b519-b5f2d903af33?m=d";

(async () => {
    console.log("Launching Firefox via Node.js Playwright...");
    const browser = await firefox.launch({ 
        headless: true
    });
    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0"
    });
    const page = await context.newPage();

    let itineraryData = null;

    page.on('response', async response => {
        if (response.url().includes("GetItinerary") || response.url().includes("ItineraryApi") || response.url().includes("ClientOutputs") || response.url().toLowerCase().includes("api")) {
            try {
                const text = await response.text();
                if (text.includes("ItineraryDays")) {
                    itineraryData = JSON.parse(text);
                    console.log(`Captured data from API: ${response.url()}`);
                }
            } catch (e) {
                // ignore
            }
        }
    });

    console.log("Navigating...");
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(6000);

    await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
    await page.waitForTimeout(4000);

    if (!itineraryData) {
        console.log("Evaluating window.model as fallback...");
        const globalData = await page.evaluate(() => window.model || window.itineraryData || null);
        if (globalData && JSON.stringify(globalData).includes("ItineraryDays")) {
            itineraryData = globalData;
        }
    }

    if (itineraryData) {
        const parsedDays = [];
        const days = itineraryData.ItineraryDays || [];
        console.log(`Found ${days.length} days`);

        for (const day of days) {
            const dayRange = day.DayRange || '';
            let locName = "";
            if (day.LocationPaths && day.LocationPaths.length > 0) {
                locName = day.LocationPaths[0].LocationModel?.Name || '';
            }
            if (!locName && day.Destinations && day.Destinations.length > 0) {
                locName = day.Destinations[0].DestinationName || '';
            }

            let accName = "";
            if (day.Accommodation) {
                accName = day.Accommodation.Name || '';
            }

            const desc = day.Description || '';
            let images = [];

            if (day.Accommodation && day.Accommodation.Pictures) {
                for (const pic of day.Accommodation.Pictures) {
                    if (pic.PictureUrl) images.push(pic.PictureUrl);
                }
            }

            if (day.Gallery) {
                for (const item of day.Gallery) {
                    if (item.Picture && item.Picture.PictureUrl) {
                        const purl = item.Picture.PictureUrl;
                        if (!images.includes(purl)) images.push(purl);
                    }
                }
            }

            const filteredImages = images.filter(img => img);
            const finalImages = [];
            if (filteredImages.length > 0) {
                for(let i=0; i<6; i++) {
                    finalImages.push(filteredImages[i % filteredImages.length]);
                }
            }

            parsedDays.push({
                day_range: dayRange,
                location: locName,
                accommodation: accName,
                description: desc,
                images: finalImages.slice(0, 6)
            });
        }
        
        if (parsedDays.length > 0) {
            parsedDays[parsedDays.length - 1].images = [];
        }

        fs.writeFileSync("wetu_data.json", JSON.stringify(parsedDays, null, 2));
        console.log("Dumped correctly formatted data to wetu_data.json");
    } else {
        console.log("Failed to find itinerary data either via API or global object.");
    }

    await browser.close();
})().catch(err => {
    console.error("Playwright failed:", err);
    process.exit(1);
});
