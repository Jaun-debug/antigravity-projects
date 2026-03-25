import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STATEMENTS_DIR = path.join((process.env.VERCEL ? '/tmp' : process.cwd()), 'storage', 'statements');

export async function GET() {
    if (!fs.existsSync(STATEMENTS_DIR)) fs.mkdirSync(STATEMENTS_DIR, { recursive: true });

    const files = fs.readdirSync(STATEMENTS_DIR).map(file => {
        const stats = fs.statSync(path.join(STATEMENTS_DIR, file));
        return {
            id: file,
            month: file,
            size: (stats.size / 1024).toFixed(2) + " KB",
            status: "Ready"
        };
    });

    return NextResponse.json(files);
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        if (!fs.existsSync(STATEMENTS_DIR)) fs.mkdirSync(STATEMENTS_DIR, { recursive: true });

        const filePath = path.join(STATEMENTS_DIR, file.name);
        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({ message: "File uploaded", filename: file.name });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
