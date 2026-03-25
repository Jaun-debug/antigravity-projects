
export function extractEmails(text: string): string[] {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const matches = text.match(emailRegex) || [];
    
    // Filter obvious spam or invalid formats like png@2x or .js
    return Array.from(new Set(matches.filter(e => {
        const lower = e.toLowerCase();
        return !lower.endsWith('.png') && 
               !lower.endsWith('.jpg') && 
               !lower.endsWith('.gif') &&
               !lower.includes('sentry') &&
               !lower.includes('wixpress');
    })));
}

export function scoreLead(email: string, hasContactPage: boolean): number {
    let score = 0;
    const lower = email.toLowerCase();
    
    // -1 if only gmail
    if (lower.includes('@gmail') || lower.includes('@yahoo')) {
        score -= 1;
    } else {
        // +2 if business domain email
        score += 2;
    }
    
    // flag generic emails (info@, admin@) vs personal emails
    if (lower.startsWith('info@') || lower.startsWith('admin@') || lower.startsWith('contact@') || lower.startsWith('hello@')) {
        score -= 1; // generic
    }
    
    // +1 if contact page found
    if (hasContactPage) {
        score += 1;
    }
    
    return score;
}
