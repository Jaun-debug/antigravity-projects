
import { NextResponse } from 'next/server';
import { scrapeGoogle } from '@/lib/scrapers/google';
import * as cheerio from 'cheerio';
import { extractEmails, scoreLead } from '@/lib/utils/extractEmails';

export async function POST(req: Request) {
    const body = await req.json();
    const { country, industry, filters } = body;
    
    const query = `${industry} in ${country} contact email`;
    
    // 1. Search search engines safely
    const searchResults = await scrapeGoogle(query);
    
    const leads: any[] = [];
    const seenDomains = new Set();

    // 2. Async batch processing per result
    for (const result of searchResults.slice(0, 15)) {
        try {
            // Rate Limiting (500ms-1.5s delay)
            await new Promise(r => setTimeout(r, Math.random() * 1000 + 500));
            
            const domainMatch = result.url.match(/https?:\/\/(?:www\.)?([^\/]+)/i);
            const domain = domainMatch ? domainMatch[1] : '';
            
            if (!domain || seenDomains.has(domain)) continue;
            seenDomains.add(domain);
            
            // Try fetching the actual site carefully
            const siteRes = await fetch(result.url, { 
                headers: { 'User-Agent': 'Mozilla/5.0' },
                // VERY IMPORTANT: aggressive timeout so vercel function doesn't hang!
                signal: AbortSignal.timeout(4000)
            });
            const siteHtml = await siteRes.text();
            
            const siteEmails = extractEmails(siteHtml);
            // Combine with snippet emails
            const allEmails = Array.from(new Set([...result.emails, ...siteEmails]));
            
            // Apply Filters
            if (filters?.onlyEmails && allEmails.length === 0) continue;
            
            if (filters?.onlyBusiness) {
                const hasBusinessEmail = allEmails.some(e => !e.includes('@gmail') && !e.includes('@yahoo'));
                if (!hasBusinessEmail && allEmails.length > 0) continue;
            }
            
            const $ = cheerio.load(siteHtml);
            const hasContactPage = $('a[href*="contact"]').length > 0;
            
            for (const email of allEmails) {
                const score = scoreLead(email, hasContactPage);
                leads.push({
                    companyName: result.title.replace(/-.*/g, '').trim(),
                    country,
                    industry,
                    website: result.url,
                    email,
                    score,
                    source: 'Web Scrape'
                });
            }
            
        } catch (e) {
            // timeout or connection block, ignore and continue
            console.error(`Failed to scrape exactly URL: ${result.url}`);
            
            // If snippet had an email, fall back to snippet only
            if (result.emails && result.emails.length > 0) {
                if(!seenDomains.has(result.url)) {
                     leads.push({
                        companyName: result.title,
                        country, industry, website: result.url,
                        email: result.emails[0],
                        score: scoreLead(result.emails[0], false),
                        source: 'Web Search Snippet'
                    });
                }
            }
        }
    }
    
    return NextResponse.json({ success: true, leads });
}
