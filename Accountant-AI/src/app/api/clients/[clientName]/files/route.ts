import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ clientName: string }> }
) {
    try {
        const { clientName } = await params;
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const filename = searchParams.get('filename');

        const safeClientName = clientName.replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
        if (!safeClientName || !type || !filename || !['Debits', 'Credits', 'debits', 'credits'].includes(type)) {
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        // Normalize type case
        const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

        const filePath = path.join((process.env.VERCEL ? '/tmp' : process.cwd()), 'storage', 'data', 'clients', safeClientName, normalizedType, filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return NextResponse.json({ success: true, message: "File deleted" });
        } else {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }
    } catch (error: any) {
        console.error("Delete File Error:", error);
        return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
}
