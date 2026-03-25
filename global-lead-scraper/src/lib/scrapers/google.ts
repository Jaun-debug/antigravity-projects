
import * as cheerio from 'cheerio';
import { extractEmails } from '../utils/extractEmails';

export async function scrapeGoogle(query: string) {
    // Note: Standard Google search blocks simple fetch. We use a fallback proxy or search API (Serper/SerpApi) ideally, 
    // but for this MVP, we scrape Bing instead as a proxy for "Google" or use a DuckDuckGo HTML endpoint to avoid blocks.
    return scrapeBing(query); // Bridged for stability without API keys
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
        return results;
    } catch(err) {
        console.error("Duckduckgo scraping error", err);
        return [];
    }
}
