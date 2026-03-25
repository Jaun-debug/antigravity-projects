import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const clientsDir = path.join((process.env.VERCEL ? '/tmp' : process.cwd()), 'storage', 'data', 'clients');
        if (!fs.existsSync(clientsDir)) {
            return NextResponse.json([]);
        }

        const clients = fs.readdirSync(clientsDir).filter(file => {
            return fs.statSync(path.join(clientsDir, file)).isDirectory();
        }).map(client => {
            const clientPath = path.join(clientsDir, client);
            const debitsPath = path.join(clientPath, 'Debits');
            const creditsPath = path.join(clientPath, 'Credits');

            const getFiles = (dir: string) => {
                if (!fs.existsSync(dir)) return [];
                return fs.readdirSync(dir).filter(f => f.endsWith('.csv')).map(f => {
                    const filePath = path.join(dir, f);
                    const stats = fs.statSync(filePath);
                    let total = "0.00";
                    let listName = f;
                    let companies: string[] = [];

                    const parts = f.split('_');
                    if (parts.length >= 3) {
                        listName = parts.slice(0, parts.length - 2).join(' ');
                    }

                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        const lines = content.trim().split('\n');
                        const lastLine = lines[lines.length - 1];
                        if (lastLine.includes('"TOTAL"')) {
                            const match = lastLine.match(/"([^"]+)"$/);
                            if (match) total = match[1];
                        }
                        const dataRows = lines.slice(1);
                        const descriptions = new Set<string>();
                        dataRows.forEach(row => {
                            if (row.includes('"TOTAL"')) return;
                            const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                            if (matches && matches.length >= 2) {
                                const desc = matches[1].replace(/^"|"$/g, '').trim();
                                if (desc) descriptions.add(desc);
                            }
                        });
                        companies = Array.from(descriptions).slice(0, 3);
                        if (descriptions.size > 3) companies.push(`+${descriptions.size - 3} more`);
                    } catch (e) {
                        console.error("Error reading file info from " + f, e);
                    }

                    return {
                        name: f,
                        displayName: listName,
                        total: total,
                        companies: companies,
                        created: stats.mtime
                    };
                }).sort((a: any, b: any) => b.created - a.created);
            };

            return {
                name: client,
                debits: getFiles(debitsPath),
                credits: getFiles(creditsPath)
            };
        });

        return NextResponse.json(clients);
    } catch (error: any) {
        console.error("List Clients Error:", error);
        return NextResponse.json({ error: "Failed to list clients" }, { status: 500 });
    }
}
