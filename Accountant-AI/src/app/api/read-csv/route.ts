import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const client = searchParams.get('client');
        const type = searchParams.get('type');
        const file = searchParams.get('file');

        if (!client || !type || !file) return NextResponse.json({ error: "Missing params" }, { status: 400 });

        const safeClient = client.replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
        const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

        if (!['Debits', 'Credits'].includes(normalizedType) || file.includes('..')) {
            return NextResponse.json({ error: "Invalid path parameters" }, { status: 400 });
        }

        const filePath = path.join((process.env.VERCEL ? '/tmp' : process.cwd()), 'storage', 'data', 'clients', safeClient, normalizedType, file);

        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
            const rows = lines.slice(1).map(line => {
                const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
                return matches.map(m => m.replace(/^"|"$/g, ''));
            });

            return NextResponse.json({ headers, rows });
        } else {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }
    } catch (error: any) {
        console.error("Read CSV Error:", error);
        return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
    }
}
