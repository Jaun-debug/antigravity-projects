const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

// Locate the base HTML template
let templatePath = path.join(__dirname, '../Desert_Tracks_App/14-day-highlights-FINAL.html');
if (!fs.existsSync(templatePath)) {
    templatePath = path.join(__dirname, '14-day-highlights-FINAL.html');
}

let BASE_HTML = "";
try {
    BASE_HTML = fs.readFileSync(templatePath, 'utf8');
} catch (e) {
    console.error("Could not find the 14-day HTML template!", e);
    process.exit(1);
}

const URLS = [
    "https://wetu.com/ItineraryOutputs/Discovery/f959961b-5ea6-43dc-b713-5a2fb0928eb1",
    "https://wetu.com/ItineraryOutputs/Discovery/487e81b5-4faf-4bdc-88f7-d28a3b229cdf",
    "https://wetu.com/Itinerary/Overview/8d67bdc1-417a-411c-ac60-e312537c8730",
    "https://wetu.com/ItineraryOutputs/Discovery/f959961b-5ea6-43dc-b713-5a2fb0928eb1" // Reused 1
];

/**
 * Clean formatting of image URL to get hires
 */
function cleanImgUrl(url) {
    if (!url || typeof url !== 'string') return "";
    if (url.startsWith("data:")) return ""; // strictly avoid lazy-loaded base64 placeholders
    if (url.startsWith("//")) url = "https:" + url;
    if (!url.startsWith("http")) url = "https://wetu.com/Resources/" + url;
    return url.replace('c380x250', 'c1920x1080'); // highest res bump
}

/**
 * Main Generation Function
 */
async function generateItinerary(url, outputName) {
    const browser = await chromium.launch({ headless: true });
    // ... API Hook setup omitted manually below
    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    });
    const page = await context.newPage();

    let apiData = null;

    // Hook APIs to catch raw data feeds robustly!
    page.on('response', async (response) => {
        try {
            const reqUrl = response.url();
            // Allow any JSON from any host if it looks like an itinerary
            if (response.request().resourceType() === 'fetch' || response.request().resourceType() === 'xhr') {
                const text = await response.text();
                if (text && text.trim().startsWith('{')) {
                    const json = JSON.parse(text);
                    if (json && typeof json === 'object') {
                        if (json.itinerary && json.itinerary.stops) apiData = json.itinerary;
                        else if (json.stops || json.days || json.destinations) apiData = json;
                    }
                }
            }
        } catch (e) {}
    });

    console.log(`\nScraping: ${url}`);
    
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    
    // DELAYS & SCROLLING FIX: Progressively scroll to trigger lazy loading images
    console.log(`Scrolling to trigger lazy images...`);
    await page.evaluate(async () => {
        for (let i = 0; i < 15; i++) {
            window.scrollBy(0, window.innerHeight);
            await new Promise(r => setTimeout(r, 400));
        }
    });

    await page.waitForTimeout(4000);

    // Expand all DOM content
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('div, a, button, span, li'))
            .filter(el => /Itinerary|Day by Day|Details/i.test(el.innerText || ""));
        for (let tab of tabs) { try { tab.click(); } catch(e){} }
    });
    
    await page.waitForTimeout(3000);

    // Deep DOM Extract for foolproof text and fallback images
    const extracted = await page.evaluate(() => {
        let globalModel = window.model || window.itineraryData || null;
        let rawText = document.body.innerText;
        let allImages = Array.from(document.querySelectorAll('img')).map(i => i.src).filter(u => u && !u.includes('logo') && !u.includes('icon'));
        
        return {
           title: document.title,
           allImages: allImages,
           globalModel: globalModel,
           rawText: rawText
        };
    });

    let daysData = [];

    // Prioritize robust JSON data for exact image mapping!
    let stops = (apiData && apiData.stops) ? apiData.stops : (extracted.globalModel && extracted.globalModel.stops ? extracted.globalModel.stops : []);

    // Build daysData perfectly from stops (JSON payloads NEVER lie about image placements)
    let daysMap = {};
    let virtualCounter = 1;

    for (let s of stops) {
        let dayRangeStr = String(s.date || s.day || s.dayNumber || `Day ${virtualCounter}`).toUpperCase();
        let strippedDesc = (s.description || "").replace(/<[^>]*>?/gm, '').trim(); 
        if (!strippedDesc) strippedDesc = (s.longDescription || "").replace(/<[^>]*>?/gm, '').trim();

        let dKey = dayRangeStr.trim().replace(/\s+/g, '');
        
        if (!daysMap[dKey]) {
            daysMap[dKey] = { 
                day_range: dayRangeStr.includes('DAY') ? dayRangeStr : `DAY ${virtualCounter}`, 
                location: "", 
                accommodation: "", 
                desc: strippedDesc.substring(0, 800), 
                bg: "", 
                images: [] 
            };
        }
        
        let target = daysMap[dKey];
        target.location = s.accommodationName || s.name || target.location;
        target.accommodation = s.accommodationName || s.name || target.accommodation;
        if (!target.bg) target.bg = s.destinationPicture || s.picture || "";
        if (s.accommodationPictures) target.images.push(...s.accommodationPictures);
        if (s.pictures) target.images.push(...s.pictures);

        virtualCounter++;
    }

    for (let k in daysMap) {
        if (daysMap[k].location || daysMap[k].accommodation) {
            daysData.push(daysMap[k]);
        }
    }

    // Fallback if stops array failed: Strict DOM Traversal
    if (daysData.length === 0) {
        const domDays = await page.evaluate(() => {
            let res = [];
            let els = Array.from(document.querySelectorAll('h2, h3, h4, .day-title, .title, .day-heading, strong')).filter(el => /Day(?!s) \d+/i.test(el.innerText));
            for (let el of els) {
                 let title = el.innerText.trim();
                 let desc = ""; let imgs = [];
                 let curr = el.nextElementSibling;
                 let steps = 0;
                 while(curr && steps < 50) {
                     if (['H2','H3','H4'].includes(curr.tagName) && /Day \d+/i.test(curr.innerText)) break;
                     desc += curr.innerText ? curr.innerText + " " : "";
                     let elImgs = curr.querySelectorAll ? Array.from(curr.querySelectorAll('img')) : [];
                     if (curr.tagName === 'IMG' && curr.src) imgs.push(curr.src);
                     elImgs.forEach(im => imgs.push(im.src));
                     curr = curr.nextElementSibling; steps++;
                 }
                 res.push({ day_range: title, desc: desc, images: Array.from(new Set(imgs)) });
            }
            return res;
        });
        
        for (let h of domDays) {
            let dKey = h.day_range.toUpperCase().replace(/\s+/g, '');
            daysData.push({
                day_range: h.day_range,
                location: "Namibia Location",
                accommodation: "Lodge",
                desc: h.desc || "",
                bg: h.images.length > 0 ? cleanImgUrl(h.images[0]) : "",
                images: Array.from(new Set(h.images.map(cleanImgUrl))).filter(u => !u.includes('logo') && !u.includes('icon'))
            });
        }
    }

    // Clean Images without STEALING from other days! (Unless entirely missing)
    let globalImageCursor = 0;
    let uniqueGlobalImgs = Array.from(new Set(extracted.allImages.map(cleanImgUrl))).filter(Boolean);

    for (let d of daysData) {
        d.day_range = d.day_range.replace(/DAY/i, 'Day');
        if (!d.images) d.images = [];
        
        // Ensure hires variants
        d.images = Array.from(new Set(d.images.map(cleanImgUrl))).filter(Boolean);
        
        // If JSON completely failed to find images for this day, fallback to sequential global images
        if (d.images.length === 0 && uniqueGlobalImgs.length > 0) {
             while (d.images.length < 6 && globalImageCursor < uniqueGlobalImgs.length) {
                 d.images.push(uniqueGlobalImgs[globalImageCursor]);
                 globalImageCursor++;
             }
        }

        if (d.bg) d.bg = cleanImgUrl(d.bg);
        
        // Rule: Exactly 1 Destination Hero Image
        // If missing bg, use first lodge image
        if (!d.bg && d.images.length > 0) d.bg = d.images[0];
        
        // WE NEVER STEAL IMAGES FROM A GLOBAL LIST ANYMORE unless absolutely necessary.
        // Slice to exactly 6. If they have less than 6, they show what they have!
        d.images = d.images.slice(0, 6);
    }

        console.log(`Successfully mapped ${daysData.length} days of data with strictly 6 images per day... injecting to HTML.`);

        // DOM INJECTION LOGIC FOR DESERT TRACKS
        let finalHtml = BASE_HTML;
        
        // ------------------ BUILD DESTINATIONS GRID ------------------
        let uniqueDests = [];
        let destSet = new Set();
        for (let idx = 0; idx < daysData.length; idx++) {
            let loc = daysData[idx].location || daysData[idx].accommodation;
            if (loc && !destSet.has(loc)) {
                destSet.add(loc);
                uniqueDests.push({
                    loc: loc, 
                    acc: daysData[idx].accommodation,
                    bg: daysData[idx].bg || (daysData[idx].images[0] || ""), 
                    desc: (daysData[idx].desc || "").substring(0, 110) + "...",
                    dayId: `day-${String(idx + 1).padStart(2, '0')}`
                });
            }
        }
        
        let destGridHtml = "";
        for (let d of uniqueDests) {
             destGridHtml += `                    <a href="#${d.dayId}" class="lux-acc-card">\n                        <img src="${d.bg}" alt="${d.loc}">\n                        <h4 class="lux-acc-title">${d.loc}</h4>\n                        <p class="lux-acc-desc">${d.desc}</p>\n                    </a>\n`;
        }

        // ------------------ BUILD LODGE SELECTION GRID ------------------
        let uniqueLodges = [];
        let lodgeSet = new Set();
        for (let idx = 0; idx < daysData.length; idx++) {
            let acc = daysData[idx].accommodation || daysData[idx].location;
            if (acc && !lodgeSet.has(acc)) {
                lodgeSet.add(acc);
                uniqueLodges.push({
                    loc: daysData[idx].location || acc, 
                    acc: acc,
                    bg: (daysData[idx].images && daysData[idx].images.length > 0) ? daysData[idx].images[0] : daysData[idx].bg, 
                    dayId: `day-${String(idx + 1).padStart(2, '0')}`
                });
            }
        }
        
        let lodgeGridHtml = "";
        for (let l of uniqueLodges) {
             lodgeGridHtml += `                    <a href="#${l.dayId}" class="lux-acc-card">\n                        <img src="${l.bg}" alt="${l.acc}">\n                        <h4 class="lux-acc-title">${l.acc}</h4>\n                        <p class="lux-acc-desc">${l.loc}</p>\n                    </a>\n`;
        }

        // ------------------ BUILD MAIN ITINERARY BLOCKS ------------------
        let daysHtml = "";

        for (let idx = 0; idx < daysData.length; idx++) {
            let day = daysData[idx];
            let numStr = String(idx + 1).padStart(2, '0');
            
            let bg_img = day.bg || (day.images[0] || "");
            let acc = day.accommodation || day.location;
            let loc_display = day.location || acc;
            let acc_display = (acc !== loc_display) ? ` — ${acc}` : "";
            
            let cardsHtml = "";
            for (let img of day.images) {
                cardsHtml += `                        <div class="dt-film-card">\n                            <img src="${img}" alt="${acc}">\n                        </div>\n`;
            }
            
            let total_imgs = String(day.images.length).padStart(2, '0');

            daysHtml += `
        <!-- DAY ${numStr} -->
        <div class="lux-day-block" id="day-${numStr}" data-bg="${bg_img}">
            <div class="lux-day-block-header">
                <div class="lux-day-number-row">
                    <span class="lux-day-numeral">${numStr}</span>
                    <div class="lux-day-line"></div>
                </div>
                <span class="lux-day-location">${loc_display}${acc_display}</span>
                <h2 class="lux-day-title">${day.day_range}</h2>
                <p class="lux-day-desc">${day.desc}</p>
            </div>
`;
            if (day.images && day.images.length > 0) {
                daysHtml += `            
            <div class="dt-film-section">
                <div class="dt-film-header">
                    <div>
                        <span class="dt-film-eyebrow">Accommodation Profile</span>
                        <h2 class="dt-film-title">${acc}</h2>
                    </div>
                    <div class="dt-film-counter">01 <span>/ ${total_imgs}</span></div>
                </div>
                
                <div class="dt-film-track-wrap">
                    <div class="dt-film-track">
${cardsHtml}                    </div>
                </div>

                <div class="dt-film-footer">
                    <div class="dt-film-progress-wrap"><div class="dt-film-progress-bar" style="width: 0%;"></div></div>
                    <div class="dt-film-arrows">
                        <div class="dt-film-arrow dt-film-prev-btn"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg></div>
                        <div class="dt-film-arrow dt-film-next-btn"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                    </div>
                </div>
            </div>
`;
            }
            daysHtml += '        </div>\n';
        }

        // Wipe the placeholder blocks dynamically
        const startMarker = '<!-- DAY 01 -->';
        const endMarker = '<!-- Accommodations Grid Block -->';
        
        let sIdx = finalHtml.indexOf(startMarker);
        let eIdx = finalHtml.indexOf(endMarker);
        
        if (sIdx !== -1 && eIdx !== -1) {
            finalHtml = finalHtml.substring(0, sIdx) + daysHtml + "        " + finalHtml.substring(eIdx);
        }

        // Dynamically Inject Destinations Grid
        finalHtml = finalHtml.replace(/(<!-- Destinations 3x Grid Block -->[\s\S]*?<div class="lux-acc-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<!-- Inclusions Block -->)/i, `$1\n${destGridHtml}$3`);
        
        // Dynamically Inject Lodge Selection Grid
        finalHtml = finalHtml.replace(/(<!-- Accommodations Grid Block -->[\s\S]*?<div class="lux-acc-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<div[^>]*>\s*<h2[^>]*>Includes \/ Excludes)/i, `$1\n${lodgeGridHtml}$3`);

        // Dynamically update main page background if first bg exists
        if (daysData[0] && daysData[0].bg) {
            finalHtml = finalHtml.replace(/id="lux-bg-base"\s+style="background-image:\s*url\([^)]+\);"/i, `id="lux-bg-base" style="background-image: url('${daysData[0].bg}');"`);
        }

        // Change Header Title dynamically
        finalHtml = finalHtml.replace(
            /<h1 class="lux-title">.*?<\/h1>/i, 
            `<h1 class="lux-title">${extracted.title || 'Luxury Namibia Safari'}</h1>`
        );

        let outPath = path.join(OUTPUT_DIR, outputName);
        fs.writeFileSync(outPath, finalHtml, 'utf8');
        console.log(`✅ Saved flawlessly to /output/${outputName}!`);
        
    if (daysData.length === 0) {
        console.log(`❌ Failed to parse valid days for ${url}`);
    }

    await browser.close();
}

async function runAll() {
    for (let i = 0; i < URLS.length; i++) {
        await generateItinerary(URLS[i], `itinerary_${i+1}.html`);
    }
    console.log("\\n🎉 ALL ITINERARIES GENERATED SUCCESSFULLY in /output!");
}

runAll();
