
export async function scrapeDirectory(url: string) {
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }});
        const html = await response.text();
        return html; // let extractor handle it downstream
    } catch(e) {
        return "";
    }
}
