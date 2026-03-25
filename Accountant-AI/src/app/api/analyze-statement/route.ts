import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import pdfParse from 'pdf-parse';

export function repairJSON(content: string) {
    try {
        return JSON.parse(content);
    } catch (e) {
        console.warn("Attempting JSON repair...", e);
        // Often it's missing the closing array and object
        const repaired = content + "\n]\n}";
        try {
            return JSON.parse(repaired);
        } catch (e2) {
            // Or maybe just the closing object
            const repaired2 = content + "\n}";
            try { return JSON.parse(repaired2); } catch (e3) {
                // If all fails, throw to the outer catch
                throw new Error("Cannot repair JSON");
            }
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const keywords = formData.get('keywords') as string;
        const listName = formData.get('listName') as string;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let detectedText = "";

        if (file.type === "application/pdf") {
            try {
                const pdfData = await pdfParse(buffer);
                detectedText = pdfData.text;
            } catch (pdfErr: any) {
                console.error("PDF Parsing error:", pdfErr);
                return NextResponse.json({ error: "Failed to read PDF text: " + pdfErr.message }, { status: 422 });
            }
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        let messages: any[] = [];

        const systemPrompt = `You are an expert accountant AI. 
Your task is to analyze a bank statement and extract specific transactions.
Create a list titled "${listName || 'Extracted Transactions'}".
Search for transactions that match these keywords: "${keywords}".
If keywords are empty, extract ALL business-related expenses.

CRITICAL FINANCIAL RULES:
1. **EXPENSES ARE NEGATIVE**: Any money leaving the account (Groceries, Fuel, Fees, Purchases) MUST be a negative number (e.g., -150.00).
2. **INCOME IS POSITIVE**: Money entering the account is positive.
3. **DEBIT COLUMNS**: If a statement has a "Debit" column with positive numbers, YOU MUST INVERT THEM to negative.

Return ONLY a valid JSON object.
{
  "listName": "...",
  "transactions": [
    { "date": "YYYY-MM-DD", "description": "...", "amount": -0.00 }
  ]
}
IMPORTANT JSON SYNTAX:
- Double quotes for everything. No trailing commas. Amount is a number.`;

        if (file.type.startsWith("image/")) {
            const base64Image = buffer.toString('base64');
            messages = [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this bank statement image." },
                        { type: "image_url", image_url: { url: `data:${file.type};base64,${base64Image}` } }
                    ]
                }
            ];
        } else {
            messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Here is the text content of the statement:\n\n${detectedText}` }
            ];
        }

        const makeOpenAICall = async (retries = 3): Promise<any> => {
            try {
                return await openai.chat.completions.create({
                    model: "gpt-4o-2024-08-06",
                    messages: messages,
                    temperature: 0,
                    response_format: { type: "json_object" },
                    max_tokens: 16300,
                });
            } catch (err) {
                if (retries > 0) {
                    console.log(`OpenAI API failed, retrying... (${retries} left)`);
                    await new Promise(res => setTimeout(res, 1000));
                    return makeOpenAICall(retries - 1);
                }
                throw err;
            }
        };

        const completion = await makeOpenAICall();
        let content = completion.choices[0].message.content.trim();

        // Robust JSON Extraction
        content = content.replace(/```json/g, '').replace(/```/g, '');
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            content = content.substring(firstBrace, lastBrace + 1);
        }

        let parsed;
        try {
            parsed = repairJSON(content);
            if (!parsed.transactions) {
                // sometimes AI returns nested or different format
                if (parsed.listName && Array.isArray(parsed.listName)) parsed.transactions = parsed.listName;
                else parsed.transactions = [];
            }
        } catch (e) {
            // Include a chunk of the raw content so we can see EXACTLY what is breaking the parser
            parsed = {
                listName: `Error parsing JSON. Raw length: ${content.length}. Ends with: ${content.substring(content.length - 40)}`,
                transactions: []
            };
        }
        return NextResponse.json(parsed);

    } catch (error: any) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze statement" }, { status: 500 });
    }
}
