import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STATEMENTS_DIR = path.join((process.env.VERCEL ? '/tmp' : process.cwd()), 'storage', 'statements');

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;
    const filePath = path.join(STATEMENTS_DIR, filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return NextResponse.json({ message: "Deleted" });
    } else {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;
    const filePath = path.join(STATEMENTS_DIR, filename);

    if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Type': 'application/octet-stream',
            },
        });
    } else {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}
