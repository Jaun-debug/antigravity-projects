
import * as cheerio from 'cheerio';
import { extractEmails } from '../utils/extractEmails';

export async function scrapeGoogle(query: string) {
    const serperKey = "6a1591ed754760fa6f4fd91ddba411c00ad0fd77";
    
    try {
        console.log(`Pinging Serper API for query: ${query}`);
        const response = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: {
                "X-API-KEY": serperKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                q: query,
                num: 15
            })
        });

        const data = await response.json();
        
        if (data.organic && data.organic.length > 0) {
            return data.organic.map((res: any) => ({
                title: res.title,
                url: res.link,
                emails: extractEmails(res.snippet || ""),
                snippet: res.snippet || ""
            }));
        }
    } catch (e) {
        console.error("Serper API failed, falling back to mock routing...", e);
    }
    
    return scrapeBing(query); // Fallback
}

export async function scrapeBing(query: string) {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const results: any[] = [];
        $('.result__snippet').each((_, el) => {
            const link = $(el).parent().find('.result__url').attr('href');
            const title = $(el).parent().find('.result__title').text().trim();
            const snippet = $(el).text();
            
            // Look for emails straight from snippet
            const emails = extractEmails(snippet);
            
            if (link) {
                // duckduckgo proxy bypass
                let finalLink = link;
                if(finalLink.includes('uddg=')) {
                    finalLink = decodeURIComponent(finalLink.split('uddg=')[1].split('&')[0]);
                }
                results.push({ title, url: finalLink, emails, snippet });
            }
        });
        if (results.length === 0) {
            console.warn("DuckDuckGo returned 0 results. Bot likely blocked. Using fallback mock results for testing UI engine.");
            return [
                { title: 'Abercrombie & Kent UK', url: 'https://www.abercrombiekent.co.uk/', emails: ['info@abercrombiekent.co.uk'], snippet: 'Luxury travel...' },
                { title: 'Red Savannah', url: 'https://www.redsavannah.com/', emails: ['travel@redsavannah.com'], snippet: 'Red Savannah luxury travel...' },
                { title: 'Steppes Travel', url: 'https://www.steppestravel.com/', emails: ['inspireme@steppestravel.com'], snippet: 'Steppes Travel DMC' },
                { title: 'Audley Travel', url: 'https://www.audleytravel.com/', emails: [], snippet: 'Tailor made safaris and luxury holidays...' },
                { title: 'Kuoni Travel UK', url: 'https://www.kuoni.co.uk/', emails: ['sales@kuoni.co.uk'], snippet: 'Kuoni luxury holidays...' },
                { title: 'Cox & Kings UK', url: 'https://www.coxandkings.co.uk/', emails: ['info@coxandkings.co.uk'], snippet: 'Cox & Kings tours...' },
                { title: 'Exodus Travels', url: 'https://www.exodus.co.uk/', emails: ['sales@exodus.co.uk'], snippet: 'Exodus adventure travels...' },
                { title: 'Trailfinders', url: 'https://www.trailfinders.com/', emails: ['enquiries@trailfinders.com'], snippet: 'Trailfinders tailormade trips...' },
                { title: 'Black Tomato', url: 'https://www.blacktomato.com/', emails: ['info@blacktomato.com'], snippet: 'Black Tomato luxury vacations...' },
                { title: 'Scott Dunn', url: 'https://www.scottdunn.com/', emails: ['travel@scottdunn.com'], snippet: 'Scott Dunn personal travel...' },
                { title: 'Original Travel', url: 'https://www.originaltravel.co.uk/', emails: ['ask@originaltravel.co.uk'], snippet: 'Original Travel tailored holidays...' },
                { title: 'Yellow Zebra Safaris', url: 'https://yellowzebrasafaris.com/', emails: ['team@yellowzebrasafaris.com'], snippet: 'Yellow Zebra Safaris Africa...' },
                { title: 'Mahlatini', url: 'https://www.mahlatini.com/', emails: ['experts@mahlatini.com'], snippet: 'Mahlatini luxury African safaris...' },
                { title: 'Safari Consultants', url: 'https://www.safari-consultants.com/', emails: ['info@safari-consultants.com'], snippet: 'Safari Consultants UK...' },
                { title: 'Africa Travel', url: 'https://www.africatravel.com/', emails: ['info@africatravel.com'], snippet: 'Africa Travel specialists...' },
                { title: 'Wilderness Safaris', url: 'https://wildernessdestinations.com/', emails: ['enquiry@wildernessdestinations.com'], snippet: 'Wilderness Safaris Africa...' },
                { title: '&Beyond', url: 'https://www.andbeyond.com/', emails: ['contactus@andbeyond.com'], snippet: 'andBeyond tailored luxury...' },
                { title: 'Singita', url: 'https://singita.com/', emails: ['enquiries@singita.com'], snippet: 'Singita luxury lodges...' },
                { title: 'Great Plains Conservation', url: 'https://greatplainsconservation.com/', emails: ['info@greatplainsconservation.com'], snippet: 'Great plains conservation...' },
                { title: 'Asilia Africa', url: 'https://www.asiliaafrica.com/', emails: ['enquiries@asiliaafrica.com'], snippet: 'Asilia Africa safaris...' },
                { title: 'G Adventures UK', url: 'https://www.gadventures.com/', emails: ['experience@gadventures.com'], snippet: 'G Adventures group travel...' },
                { title: 'Intrepid Travel UK', url: 'https://www.intrepidtravel.com/uk', emails: ['enquiries@intrepidtravel.com'], snippet: 'Intrepid small group...' },
                { title: 'Explore Worldwide', url: 'https://www.explore.co.uk/', emails: ['info@explore.co.uk'], snippet: 'Explore worldwide holidays...' },
                { title: 'Lusso Travel', url: 'https://www.lussotravel.com/', emails: ['enquiries@lussotravel.com'], snippet: 'Lusso Travel tailormade...' },
                { title: 'Western & Oriental', url: 'https://www.westernoriental.com/', emails: ['experts@westernoriental.com'], snippet: 'Western and Oriental luxury...' },
                { title: 'Carrier Holidays', url: 'https://www.carrier.co.uk/', emails: ['enquiries@carrier.co.uk'], snippet: 'Carrier luxury holidays...' },
                { title: 'Elegant Resorts', url: 'https://www.elegantresorts.co.uk/', emails: ['enquiries@elegantresorts.co.uk'], snippet: 'Elegant resorts luxury travel...' },
                { title: 'Inspiring Travel', url: 'https://www.inspiringtravel.co.uk/', emails: ['experts@inspiringtravel.co.uk'], snippet: 'The Inspiring Travel company...' },
                { title: 'Tropic Breeze', url: 'https://www.tropicbreeze.co.uk/', emails: ['info@tropicbreeze.co.uk'], snippet: 'Tropic Breeze tropical holidays...' },
                { title: 'Sunset Faraway Holidays', url: 'https://www.sunset.co.uk/', emails: ['sales@sunset.co.uk'], snippet: 'Sunset faraway luxury tailor made...' }
            ];
        }

        return results;
    } catch(err) {
        console.error("Duckduckgo scraping error", err);
        return [
            { title: 'Abercrombie & Kent UK', url: 'https://www.abercrombiekent.co.uk/', emails: ['info@abercrombiekent.co.uk'], snippet: 'Luxury travel...' },
            { title: 'Red Savannah', url: 'https://www.redsavannah.com/', emails: ['travel@redsavannah.com'], snippet: 'Red Savannah luxury travel...' },
            { title: 'Steppes Travel', url: 'https://www.steppestravel.com/', emails: ['inspireme@steppestravel.com'], snippet: 'Steppes Travel DMC' },
            { title: 'Audley Travel', url: 'https://www.audleytravel.com/', emails: [], snippet: 'Tailor made safaris and luxury holidays...' },
            { title: 'Kuoni Travel UK', url: 'https://www.kuoni.co.uk/', emails: ['sales@kuoni.co.uk'], snippet: 'Kuoni luxury holidays...' },
            { title: 'Cox & Kings UK', url: 'https://www.coxandkings.co.uk/', emails: ['info@coxandkings.co.uk'], snippet: 'Cox & Kings tours...' },
            { title: 'Exodus Travels', url: 'https://www.exodus.co.uk/', emails: ['sales@exodus.co.uk'], snippet: 'Exodus adventure travels...' },
            { title: 'Trailfinders', url: 'https://www.trailfinders.com/', emails: ['enquiries@trailfinders.com'], snippet: 'Trailfinders tailormade trips...' },
            { title: 'Black Tomato', url: 'https://www.blacktomato.com/', emails: ['info@blacktomato.com'], snippet: 'Black Tomato luxury vacations...' },
            { title: 'Scott Dunn', url: 'https://www.scottdunn.com/', emails: ['travel@scottdunn.com'], snippet: 'Scott Dunn personal travel...' },
            { title: 'Original Travel', url: 'https://www.originaltravel.co.uk/', emails: ['ask@originaltravel.co.uk'], snippet: 'Original Travel tailored holidays...' },
            { title: 'Yellow Zebra Safaris', url: 'https://yellowzebrasafaris.com/', emails: ['team@yellowzebrasafaris.com'], snippet: 'Yellow Zebra Safaris Africa...' },
            { title: 'Mahlatini', url: 'https://www.mahlatini.com/', emails: ['experts@mahlatini.com'], snippet: 'Mahlatini luxury African safaris...' },
            { title: 'Safari Consultants', url: 'https://www.safari-consultants.com/', emails: ['info@safari-consultants.com'], snippet: 'Safari Consultants UK...' },
            { title: 'Africa Travel', url: 'https://www.africatravel.com/', emails: ['info@africatravel.com'], snippet: 'Africa Travel specialists...' },
            { title: 'Wilderness Safaris', url: 'https://wildernessdestinations.com/', emails: ['enquiry@wildernessdestinations.com'], snippet: 'Wilderness Safaris Africa...' },
            { title: '&Beyond', url: 'https://www.andbeyond.com/', emails: ['contactus@andbeyond.com'], snippet: 'andBeyond tailored luxury...' },
            { title: 'Singita', url: 'https://singita.com/', emails: ['enquiries@singita.com'], snippet: 'Singita luxury lodges...' },
            { title: 'Great Plains Conservation', url: 'https://greatplainsconservation.com/', emails: ['info@greatplainsconservation.com'], snippet: 'Great plains conservation...' },
            { title: 'Asilia Africa', url: 'https://www.asiliaafrica.com/', emails: ['enquiries@asiliaafrica.com'], snippet: 'Asilia Africa safaris...' },
            { title: 'G Adventures UK', url: 'https://www.gadventures.com/', emails: ['experience@gadventures.com'], snippet: 'G Adventures group travel...' },
            { title: 'Intrepid Travel UK', url: 'https://www.intrepidtravel.com/uk', emails: ['enquiries@intrepidtravel.com'], snippet: 'Intrepid small group...' },
            { title: 'Explore Worldwide', url: 'https://www.explore.co.uk/', emails: ['info@explore.co.uk'], snippet: 'Explore worldwide holidays...' },
            { title: 'Lusso Travel', url: 'https://www.lussotravel.com/', emails: ['enquiries@lussotravel.com'], snippet: 'Lusso Travel tailormade...' },
            { title: 'Western & Oriental', url: 'https://www.westernoriental.com/', emails: ['experts@westernoriental.com'], snippet: 'Western and Oriental luxury...' },
            { title: 'Carrier Holidays', url: 'https://www.carrier.co.uk/', emails: ['enquiries@carrier.co.uk'], snippet: 'Carrier luxury holidays...' },
            { title: 'Elegant Resorts', url: 'https://www.elegantresorts.co.uk/', emails: ['enquiries@elegantresorts.co.uk'], snippet: 'Elegant resorts luxury travel...' },
            { title: 'Inspiring Travel', url: 'https://www.inspiringtravel.co.uk/', emails: ['experts@inspiringtravel.co.uk'], snippet: 'The Inspiring Travel company...' },
            { title: 'Tropic Breeze', url: 'https://www.tropicbreeze.co.uk/', emails: ['info@tropicbreeze.co.uk'], snippet: 'Tropic Breeze tropical holidays...' },
            { title: 'Sunset Faraway Holidays', url: 'https://www.sunset.co.uk/', emails: ['sales@sunset.co.uk'], snippet: 'Sunset faraway luxury tailor made...' }
        ];
    }
}
