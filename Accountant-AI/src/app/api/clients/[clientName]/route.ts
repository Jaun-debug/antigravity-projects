import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ clientName: string }> }
) {
    try {
        const { clientName } = await params;
        const safeClientName = clientName.replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
        if (!safeClientName) return NextResponse.json({ error: "Invalid client name" }, { status: 400 });

        const clientDir = path.join((process.env.VERCEL ? '/tmp' : process.cwd()), 'storage', 'data', 'clients', safeClientName);

        if (fs.existsSync(clientDir)) {
            fs.rmSync(clientDir, { recursive: true, force: true });
            return NextResponse.json({ success: true, message: "Client deleted" });
        } else {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }
    } catch (error: any) {
        console.error("Delete Client Error:", error);
        return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
    }
}
