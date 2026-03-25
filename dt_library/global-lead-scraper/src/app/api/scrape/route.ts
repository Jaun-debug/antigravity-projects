
import { NextResponse } from 'next/server';
import { scrapeGoogle } from '@/lib/scrapers/google';
import * as cheerio from 'cheerio';
import { extractEmails, scoreLead } from '@/lib/utils/extractEmails';

export async function POST(req: Request) {
    const body = await req.json();
    const { country, industry, filters, apiKey } = body;
    
    const query = `${industry} in ${country} contact email`;
    
    // 1. Search search engines safely
    const searchResults = await scrapeGoogle(query, apiKey);
    
    const leads: any[] = [];
    const seenDomains = new Set();

    // 2. Async batch processing per result -- MUST be in parallel to beat Vercel's 10s timeout!
    const processPromises = searchResults.slice(0, 60).map(async (result: any) => {
        try {
            const domainMatch = result.url.match(/https?:\/\/(?:www\.)?([^\/]+)/i);
            const domain = domainMatch ? domainMatch[1] : '';
            if (!domain || seenDomains.has(domain)) return null;
            seenDomains.add(domain);
            
            // Try fetching the actual site carefully
            const siteRes = await fetch(result.url, { 
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: AbortSignal.timeout(3000) // Super aggressive 3s timeout per lead
            });
            const siteHtml = await siteRes.text();
            
            const siteEmails = extractEmails(siteHtml);
            const allEmails = Array.from(new Set([...result.emails, ...siteEmails]));
            
            // Apply Filters
            if (filters?.onlyEmails && allEmails.length === 0) return null;
            if (filters?.onlyBusiness) {
                const hasBusinessEmail = allEmails.some(e => !e.includes('@gmail') && !e.includes('@yahoo'));
                if (!hasBusinessEmail && allEmails.length > 0) return null;
            }
            
            const $ = cheerio.load(siteHtml);
            const hasContactPage = $('a[href*="contact"]').length > 0;
            
            return allEmails.map(email => ({
                companyName: result.title.replace(/-.*/g, '').trim(),
                country,
                industry,
                website: result.url,
                email,
                score: scoreLead(email, hasContactPage),
                source: 'Web Scrape'
            }));
            
        } catch (e) {
            // fallback to snippet
            if (result.emails && result.emails.length > 0 && !seenDomains.has(result.url)) {
                return [{
                    companyName: result.title, country, industry, website: result.url,
                    email: result.emails[0], score: scoreLead(result.emails[0], false),
                    source: 'Web Search Snippet'
                }];
            }
            return null;
        }
    });
    
    const resultsArrays = await Promise.all(processPromises);
    resultsArrays.forEach(arr => {
        if (arr) leads.push(...arr);
    });

    return NextResponse.json({ success: true, leads });
}
