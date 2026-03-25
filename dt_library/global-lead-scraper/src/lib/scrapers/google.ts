
import * as cheerio from 'cheerio';
import { extractEmails } from '../utils/extractEmails';

export async function scrapeGoogle(query: string, apiKey?: string) {
    // Note: Standard Google search blocks simple fetch. We use a fallback proxy or search API (Serper/SerpApi) ideally, 
    // but for this MVP, we scrape Bing instead as a proxy for "Google" or use a DuckDuckGo HTML endpoint to avoid blocks.
    return scrapeBing(query, apiKey); // Bridged for stability without API keys
}

export async function scrapeBing(query: string, apiKey?: string) {
    if (apiKey) {
        try {
            const res = await fetch('https://google.serper.dev/search', {
                method: 'POST',
                headers: {
                    'X-API-KEY': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ q: query, gl: 'us', num: 80 })
            });
            const data = await res.json();
            
            if (data.organic) {
                return data.organic.map((r: any) => ({
                    title: r.title,
                    url: r.link,
                    snippet: r.snippet,
                    emails: extractEmails(r.snippet)
                }));
            }
        } catch (e) {
            console.error("Serper API error", e);
        }
    }

    // Fallback to DuckDuckGo Lite if no API key
    const searchUrl = `https://lite.duckduckgo.com/lite/`;
    try {
        const response = await fetch(searchUrl, {
            method: 'POST',
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ q: query }).toString()
        });
        
        const html = await response.text();
        const $ = cheerio.load(html);
        const results: any[] = [];
        
        $('tr').each((i, el) => {
            const linkTag = $(el).find('.result-snippet').length > 0 ? null : $(el).find('a[rel="nofollow"]');
            if (linkTag && linkTag.length > 0) {
                const url = linkTag.attr('href');
                const title = linkTag.text().trim();
                const snippetRow = $(el).next();
                const snippet = snippetRow.find('.result-snippet').text().trim() || "";
                const emails = extractEmails(snippet);
                
                if (url && !url.includes('duckduckgo.com')) {
                    let finalLink = url;
                    if(finalLink.includes('uddg=')) {
                        try {
                            finalLink = decodeURIComponent(finalLink.split('uddg=')[1].split('&')[0]);
                        } catch(e) {}
                    }
                    results.push({ title, url: finalLink, emails, snippet });
                }
            }
        });
        return results;
    } catch(err) {
        return [];
    }
}
