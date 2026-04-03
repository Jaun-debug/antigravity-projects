import { NextResponse } from 'next/server';
import { scrapeGoogle } from '@/lib/scrapers/google';
import * as cheerio from 'cheerio';
import { extractEmails } from '@/lib/utils/extractEmails';

// ==========================================
// 1. LEAD DISCOVERY & TEXT EXTRACTION
// ==========================================
async function crawlWebsites(url: string) {
    try {
        const res = await fetch(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            signal: AbortSignal.timeout(6000)
        });
        const html = await res.text();
        const emails = extractEmails(html);
        
        const $ = cheerio.load(html);
        const textContent = $('body').text().toLowerCase();
        
        // Africa Relevance Check
        const africaKeywords = ['africa', 'safari', 'namibia', 'botswana', 'kenya', 'tanzania', 'kruger', 'serengeti'];
        const isAfricaRelevant = africaKeywords.some(kw => textContent.includes(kw));

        // Looking for LinkedIn
        const linkedinFound = $('a[href*="linkedin.com/company"]').length > 0;

        return { emails, html, isAfricaRelevant, linkedinFound };
    } catch {
        return { emails: [], html: '', isAfricaRelevant: false, linkedinFound: false };
    }
}

// ==========================================
// 2. ENRICHMENT ENGINE (Apollo & Hunter)
// ==========================================
async function enrichWithApollo(domain: string) {
    const apolloKey = "l5Qx1PMnC05iYVMpnh7Rrg";
    
    // Fallback to MOCK ENRICHMENT if no API key is set
    if (!apolloKey) {
        console.warn(`[WARN] APOLLO_API_KEY is not set. Using mock data for ${domain}`);
        const hasPersonal = Math.random() > 0.5;
        if (hasPersonal) {
            return {
                contactName: 'Sarah Jenkins',
                role: 'Product Manager Africa',
                personalEmail: `sarah@${domain}`,
                linkedinUrl: `https://linkedin.com/company/${domain.split('.')[0]}`,
            };
        }
        return null;
    }

    try {
        const res = await fetch(`https://api.apollo.io/v1/organizations/enrich?domain=${domain}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json',
                'api-key': apolloKey,
            }
        });
        
        if (!res.ok) {
            console.error(`Apollo API Error: ${res.statusText}`);
            return null;
        }

        const data = await res.json();
        const org = data.organization;

        if (org) {
            // Simplify extraction for prototype; normally we'd pull exact people
            return {
                contactName: org.primary_contact?.name || org.name,
                role: org.primary_contact?.title || 'Unknown',
                personalEmail: org.primary_contact?.email || null,
                linkedinUrl: org.linkedin_url || null,
            };
        }
    } catch (error) {
        console.error(`Error fetching from Apollo: ${error}`);
    }
    
    return null;
}

// ==========================================
// 3. VERIFICATION PROTOCOL (NeverBounce)
// ==========================================
async function verifyEmail(email: string) {
    const neverbounceKey = "private_c342da902706d1bf84b568c9b8a31794";

    // Filter purely invalid string formats
    if (!email.includes('@') || !email.includes('.')) return false;

    // Fallback if no key is set yet
    if (!neverbounceKey) {
        console.warn(`[WARN] NEVERBOUNCE_API_KEY is not set. Mocking valid result for ${email}`);
        return true; 
    }

    try {
        const res = await fetch(`https://api.neverbounce.com/v4/single/check?key=${neverbounceKey}&email=${email}`);
        
        if (!res.ok) {
            console.error(`NeverBounce API Error: ${res.statusText}`);
            return true; // fail open for now
        }

        const data = await res.json();
        // valid, invalid, disposable, catchall, unknown
        if (data.result === 'invalid' || data.result === 'disposable') {
            return false;
        }
        
        return true; 
    } catch (error) {
        console.error(`Error verifying email with NeverBounce: ${error}`);
        return true; // fail open
    }
}

// ==========================================
// 4. MAIN PIPELINE
// ==========================================
export async function POST(req: Request) {
    const { country, industry, minScore } = await req.json();
    
    const query = `"${industry}" OR "Tour Operator" OR "Safari Company" in ${country} contact email`;
    
    const searchResults = await scrapeGoogle(query);
    console.log(`DuckDuckGo returned ${searchResults.length} results for query: ${query}`);
    const leads: any[] = [];
    const seenDomains = new Set();

    // Process all results (No artificial limits for maximum extraction)
    for (const result of searchResults) {
        try {
            // Speed optimized: removed artificial delay
            
            const domainMatch = result.url.match(/https?:\/\/(?:www\.)?([^\/]+)/i);
            const domain = domainMatch ? domainMatch[1] : '';
            if (!domain || seenDomains.has(domain)) continue;
            seenDomains.add(domain);
            
            // 1. DISCOVERY & CRAWLING
            const { emails, isAfricaRelevant, linkedinFound } = await crawlWebsites(result.url);
            
            // 2. ENRICHMENT
            const enrichedData = await enrichWithApollo(domain);
            
            let allEmails = Array.from(new Set([...result.emails, ...emails]));
            
            if (enrichedData?.personalEmail) {
                allEmails.unshift(enrichedData.personalEmail); // Priority
            }

            // Must have email to be a valid lead
            if (allEmails.length === 0) continue;

            const primaryEmail = allEmails[0];

            // 3. VERIFICATION
            const isValid = await verifyEmail(primaryEmail);
            if (!isValid) continue;

            // 4. SCORING ENGINE
            let score = 0;
            if (domain) score += 10; // Website exists
            if (enrichedData?.personalEmail === primaryEmail) score += 20; // Personal email found
            if (linkedinFound || enrichedData?.linkedinUrl) score += 10; // LinkedIn found
            if (isAfricaRelevant) score += 25; // Africa relevance
            if (allEmails.length > 1) score += 15; // Multiple contacts found

            // 5. FILTERING
            if (score >= (minScore || 0)) {
                leads.push({
                    companyName: result.title.split('-')[0].split('|')[0].trim(),
                    country,
                    industry,
                    website: result.url,
                    email: primaryEmail,
                    contactName: enrichedData ? enrichedData.contactName : null,
                    role: enrichedData ? enrichedData.role : null,
                    score,
                    verified: true
                });
            }

        } catch (e) {
            console.error(`Scrape Job Failed: ${result.url}`);
        }
    }
    
    return NextResponse.json({ success: true, leads });
}
