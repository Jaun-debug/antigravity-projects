import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        let { clientName, listName, transactions, transactionType } = await req.body ? await req.json() : {};

        if (!clientName || !transactions || !Array.isArray(transactions)) {
            return NextResponse.json({ error: "Missing required fields or invalid data" }, { status: 400 });
        }

        const safeClientName = clientName.replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
        const safeListName = (listName || 'extraction').replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
        const timestamp = Date.now();

        const clientBaseDir = path.join((process.env.VERCEL ? '/tmp' : process.cwd()), 'storage', 'data', 'clients', safeClientName);
        const debitDir = path.join(clientBaseDir, 'Debits');
        const creditDir = path.join(clientBaseDir, 'Credits');

        if (!fs.existsSync(debitDir)) fs.mkdirSync(debitDir, { recursive: true });
        if (!fs.existsSync(creditDir)) fs.mkdirSync(creditDir, { recursive: true });

        // Categorization logic
        if (transactionType === 'debit') {
            transactions = transactions.map((t: any) => ({
                ...t,
                amount: -Math.abs(parseFloat(t.amount))
            }));
        } else if (transactionType === 'credit') {
            transactions = transactions.map((t: any) => ({
                ...t,
                amount: Math.abs(parseFloat(t.amount))
            }));
        } else {
            const expenseKeywords = ['grocer', 'crocer', 'food', 'fuel', 'petrol', 'diesel', 'gas', 'expense', 'debit', 'cost', 'pay', 'shop', 'market', 'store', 'buy', 'purchase', 'fee', 'charge', 'bill', 'restaur', 'cafe', 'fix', 'repair', 'maint', 'spare', 'part', 'vehicle', 'car'];
            const isLikelyExpenseList = expenseKeywords.some(k => safeListName.toLowerCase().includes(k));
            const vendorKeywords = ['spar', 'shoprite', 'checkers', 'pick n pay', 'woolworths', 'clicks', 'engen', 'shell', 'total', 'caltex', 'puma', 'bp', 'pharmacy', 'doctor', 'hospital', 'medic', 'kfc', 'mcdonalds', 'steers', 'nando', 'mug & bean', 'mtc', 'telecom', 'paratus', 'municipal', 'namwater', 'nampower'];

            transactions = transactions.map((t: any) => {
                let amount = parseFloat(t.amount);
                const desc = (t.description || '').toLowerCase();
                if (amount > 0) {
                    const isVendorExpense = vendorKeywords.some(v => desc.includes(v));
                    if (isLikelyExpenseList || isVendorExpense) {
                        amount = -Math.abs(amount);
                    }
                }
                return { ...t, amount };
            });
        }

        const generateCSV = (items: any[]) => {
            if (items.length === 0) return null;
            const headers = ['Date', 'Description', 'Category', 'Amount'];
            const rows = items.map(t => [t.date || '', t.description || '', t.account || 'General', t.amount || '']);
            const total = items.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
            return [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(',')),
                `"","","TOTAL","${total.toFixed(2)}"`
            ].join('\n');
        };

        let results = [];
        if (transactions.filter((t: any) => parseFloat(t.amount) < 0).length > 0) {
            const debits = transactions.filter((t: any) => parseFloat(t.amount) < 0);
            const debitCSV = generateCSV(debits);
            if (debitCSV) {
                const debitPath = path.join(debitDir, `${safeListName}_DEBITS_${timestamp}.csv`);
                fs.writeFileSync(debitPath, debitCSV);
                results.push(`Saved ${debits.length} Debits`);
            }
        }

        if (transactions.filter((t: any) => parseFloat(t.amount) >= 0).length > 0) {
            const credits = transactions.filter((t: any) => parseFloat(t.amount) >= 0);
            const creditCSV = generateCSV(credits);
            if (creditCSV) {
                const creditPath = path.join(creditDir, `${safeListName}_CREDITS_${timestamp}.csv`);
                fs.writeFileSync(creditPath, creditCSV);
                results.push(`Saved ${credits.length} Credits`);
            }
        }

        return NextResponse.json({ success: true, message: results.join(', ') || "No transactions to save" });
    } catch (error: any) {
        console.error("Save Error:", error);
        return NextResponse.json({ error: "Failed to save to server" }, { status: 500 });
    }
}
