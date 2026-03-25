const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { OpenAI } = require("openai");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });
// Increase body parser limit for large JSON payloads
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// We export a function that accepts (server, app) as per index.js call signature
async function registerRoutes(server, app) {

    // Ensure body parsing is enabled for the app
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Mock Database for Statements
    const STATEMENTS_DIR = path.join(__dirname, "statements_data");
    if (!fs.existsSync(STATEMENTS_DIR)) fs.mkdirSync(STATEMENTS_DIR);

    // --- STATEMENT MANAGEMENT ENDPOINTS ---

    // 1. Upload Statement
    app.post("/api/statements", upload.single("file"), (req, res) => {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        // Move to persistent storage
        const targetPath = path.join(STATEMENTS_DIR, req.file.originalname);
        fs.renameSync(req.file.path, targetPath);

        res.json({ message: "File uploaded", filename: req.file.originalname });
    });

    // 2. List Statements
    app.get("/api/statements", (req, res) => {
        const files = fs.readdirSync(STATEMENTS_DIR).map(file => {
            const stats = fs.statSync(path.join(STATEMENTS_DIR, file));
            return {
                id: file,
                month: file,
                size: (stats.size / 1024).toFixed(2) + " KB",
                status: "Ready"
            };
        });
        res.json(files);
    });

    // 3. Delete Statement
    app.delete("/api/statements/:filename", (req, res) => {
        const filePath = path.join(STATEMENTS_DIR, req.params.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ message: "Deleted" });
        } else {
            res.status(404).json({ error: "File not found" });
        }
    });

    // 4. Download/View Statement
    app.get("/api/statements/:filename", (req, res) => {
        const filePath = path.join(STATEMENTS_DIR, req.params.filename);
        if (fs.existsSync(filePath)) {
            res.download(filePath);
        } else {
            res.status(404).json({ error: "File not found" });
        }
    });


    // --- AI ANALYSIS ENDPOINTS ---

    // 5. Analyze Statement (PDF/Image)
    app.post("/api/analyze-statement", upload.single("file"), async (req, res) => {
        try {
            const file = req.file;
            const { keywords, listName } = req.body;

            if (!file) return res.status(400).json({ error: "No file uploaded" });

            let detectedText = "";

            if (file.mimetype === "application/pdf") {
                const dataBuffer = fs.readFileSync(file.path);
                const pdfData = await pdfParse(dataBuffer);
                detectedText = pdfData.text;
            }

            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            let messages = [];

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

            if (file.mimetype.startsWith("image/")) {
                const imageBuffer = fs.readFileSync(file.path);
                const base64Image = imageBuffer.toString('base64');
                messages = [
                    { role: "system", content: systemPrompt },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Analyze this bank statement image." },
                            { type: "image_url", image_url: { url: `data:${file.mimetype};base64,${base64Image}` } }
                        ]
                    }
                ];
            } else {
                messages = [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Here is the text content of the statement:\n\n${detectedText}` }
                ];
            }

            try {
                const makeOpenAICall = async (retries = 3) => {
                    try {
                        return await openai.chat.completions.create({
                            model: "gpt-4o",
                            messages: messages,
                            temperature: 0,
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
                try {
                    // Remove markdown code blocks if present
                    content = content.replace(/```json/g, '').replace(/```/g, '');

                    // Try to find the first { and last } to ignore markdown or text
                    const firstBrace = content.indexOf('{');
                    const lastBrace = content.lastIndexOf('}');

                    if (firstBrace !== -1 && lastBrace !== -1) {
                        content = content.substring(firstBrace, lastBrace + 1);
                    }

                    const parsed = JSON.parse(content);
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                    res.json(parsed);

                } catch (parseError) {
                    console.error("JSON Parse Error. Raw content:", content);
                    throw new Error("Failed to parse AI response. Try again.");
                }

            } catch (authError) {
                console.error("Auth/API Error:", authError);
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                return res.status(500).json({ error: authError.message });
            }

        } catch (error) {
            console.error("Analysis error:", error);
            res.status(500).json({ error: error.message || "Failed to analyze statement" });
        }
    });

    // 6. Save Client Transactions (Split by Credit/Debit)
    app.post("/api/save-separated-transactions", async (req, res) => {
        try {
            // Get override type from body
            let { clientName, listName, transactions, transactionType } = req.body;

            if (!clientName || !transactions || !Array.isArray(transactions)) {
                return res.status(400).json({ error: "Missing required fields or invalid data" });
            }

            const safeClientName = clientName.replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
            const safeListName = (listName || 'extraction').replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
            const timestamp = Date.now();

            const clientBaseDir = path.join(__dirname, 'data', 'clients', safeClientName);
            const debitDir = path.join(clientBaseDir, 'Debits');
            const creditDir = path.join(clientBaseDir, 'Credits');

            // Ensure directories exist
            if (!fs.existsSync(debitDir)) fs.mkdirSync(debitDir, { recursive: true });
            if (!fs.existsSync(creditDir)) fs.mkdirSync(creditDir, { recursive: true });


            // --- CATEGORIZATION LOGIC ---

            if (transactionType === 'debit') {
                // FORCE DEBIT: Make all amounts NEGATIVE
                transactions = transactions.map(t => ({
                    ...t,
                    amount: -Math.abs(parseFloat(t.amount)) // Ensure negative
                }));
                console.log(`[Manual Override] ${safeListName} enforced as DEBITS.`);

            } else if (transactionType === 'credit') {
                // FORCE CREDIT: Make all amounts POSITIVE
                transactions = transactions.map(t => ({
                    ...t,
                    amount: Math.abs(parseFloat(t.amount)) // Ensure positive
                }));
                console.log(`[Manual Override] ${safeListName} enforced as CREDITS.`);

            } else {
                // AUTO MODE (Existing Heuristics)

                // HEURISTIC 1: Check List Name
                const expenseKeywords = [
                    'grocer', 'crocer', 'food', 'fuel', 'petrol', 'diesel', 'gas',
                    'expense', 'debit', 'cost', 'pay', 'shop', 'market', 'store',
                    'buy', 'purchase', 'fee', 'charge', 'bill', 'restaur', 'cafe',
                    'fix', 'repair', 'maint', 'spare', 'part', 'vehicle', 'car'
                ];
                const isLikelyExpenseList = expenseKeywords.some(k => safeListName.toLowerCase().includes(k));

                // HEURISTIC 2: Check Individual Transaction Descriptions (Vendor-based)
                const vendorKeywords = [
                    'spar', 'shoprite', 'checkers', 'pick n pay', 'woolworths', 'clicks',
                    'engen', 'shell', 'total', 'caltex', 'puma', 'bp',
                    'pharmacy', 'doctor', 'hospital', 'medic',
                    'kfc', 'mcdonalds', 'steers', 'nando', 'mug & bean',
                    'mtc', 'telecom', 'paratus', 'municipal', 'namwater', 'nampower'
                ];

                transactions = transactions.map(t => {
                    let amount = parseFloat(t.amount);
                    const desc = (t.description || '').toLowerCase();

                    // If list is an expense list OR description matches a known vendor, force negative
                    if (amount > 0) {
                        const isVendorExpense = vendorKeywords.some(v => desc.includes(v));
                        if (isLikelyExpenseList || isVendorExpense) {
                            amount = -Math.abs(amount);
                        }
                    }
                    return { ...t, amount };
                });

                if (isLikelyExpenseList) {
                    console.log(`[Heuristic] ${safeListName} or vendors detected as expense. Forced amounts to negative.`);
                }
            }
            // --- END CATEGORIZATION LOGIC ---

            // Split transactions
            const debits = transactions.filter(t => parseFloat(t.amount) < 0);
            const credits = transactions.filter(t => parseFloat(t.amount) >= 0);

            const generateCSV = (items) => {
                if (items.length === 0) return null;
                const headers = ['Date', 'Description', 'Amount'];
                const rows = items.map(t => [t.date || '', t.description || '', t.amount || '']);
                const total = items.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

                return [
                    headers.join(','),
                    ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(',')),
                    `"","TOTAL","${total.toFixed(2)}"`
                ].join('\n');
            };

            let results = [];

            if (debits.length > 0) {
                const debitCSV = generateCSV(debits);
                const debitPath = path.join(debitDir, `${safeListName}_DEBITS_${timestamp}.csv`);
                fs.writeFileSync(debitPath, debitCSV);
                results.push(`Saved ${debits.length} Debits`);
            }

            if (credits.length > 0) {
                const creditCSV = generateCSV(credits);
                const creditPath = path.join(creditDir, `${safeListName}_CREDITS_${timestamp}.csv`);
                fs.writeFileSync(creditPath, creditCSV);
                results.push(`Saved ${credits.length} Credits`);
            }

            console.log(`Saved client data for ${safeClientName}: ${results.join(', ')}`);
            res.json({ success: true, message: results.join(', ') || "No transactions to save" });

        } catch (error) {
            console.error("Save Separated Error:", error);
            res.status(500).json({ error: "Failed to save to server" });
        }
    });

    // 6.5. Extract Lodge Rates (New Endpoint)
    app.post("/api/extract", upload.single("file"), async (req, res) => {
        try {
            const file = req.file;
            if (!file) return res.status(400).json({ error: "No file uploaded" });

            let detectedText = "";

            if (file.mimetype === "application/pdf") {
                const dataBuffer = fs.readFileSync(file.path);
                const pdfData = await pdfParse(dataBuffer);
                detectedText = pdfData.text;
            }

            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            let messages = [];

            const systemPrompt = `You are a travel industry data specialist.
Your task is to extract lodge rate sheet data from the provided document.
Identify all properties/lodges mentioned and their room rates.

Return a JSON object in this format:
{
  "properties": [
    {
      "propertyName": "Lodge Name",
      "rates": [
        {
          "roomType": "Luxury Room / Standard / Camping",
          "basis": "DBB / BB / FB",
          "rackRate": 1234.00,
          "stoRate": 1000.00,
          "singleRate": 1500.00,
          "childRate": 500.00,
          "perPersonSharing": 1000.00
        }
      ]
    }
  ],
  "childPolicy": "Summary of child policy if found"
}

- "stoRate" is the Trade/Tour Operator rate.
- "rackRate" is the Public/Rack rate.
- If only one rate is clear, try to infer if it is RACK or STO.
- Remove currency symbols (N$, R, USD). Return numbers.
- CRITICAL: If the input is not a rate sheet or you cannot extract data, return: {"properties": [], "error": "Document does not appear to contain rate data."} and nothing else.`;

            if (file.mimetype.startsWith("image/")) {
                const imageBuffer = fs.readFileSync(file.path);
                const base64Image = imageBuffer.toString('base64');
                messages = [
                    { role: "system", content: systemPrompt },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Extract rate sheet data from this image." },
                            { type: "image_url", image_url: { url: `data:${file.mimetype};base64,${base64Image}` } }
                        ]
                    }
                ];
            } else {
                messages = [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Here is the text content of the rate sheet: \n\n${detectedText} ` }
                ];
            }

            const makeOpenAICall = async (retries = 3) => {
                try {
                    return await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: messages,
                        temperature: 0,
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

            try {
                content = content.replace(/```json/g, '').replace(/```/g, '');
                const firstBrace = content.indexOf('{');
                const lastBrace = content.lastIndexOf('}');

                if (firstBrace !== -1 && lastBrace !== -1) {
                    content = content.substring(firstBrace, lastBrace + 1);
                } else {
                    throw new Error("AI did not return a valid JSON object. It might not have recognized the document.");
                }

                const parsed = JSON.parse(content);
                if (parsed.error) {
                    throw new Error(parsed.error);
                }

                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                res.json(parsed);

            } catch (parseError) {
                console.error("Analysis Error. Raw content:", content);
                const msg = parseError.message.includes("AI did") || parseError.message.includes("Document does")
                    ? parseError.message
                    : `Failed to parse AI response. Raw Content: ${content.substring(0, 100)}...`;
                throw new Error(msg);
            }


        } catch (error) {
            console.error("Rate Extraction Error:", error);
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            res.status(500).json({ error: error.message || "Failed to extract rates" });
        }
    });

    // 7. List Clients with Files (Enriched with Total & Companies)
    app.get("/api/clients", (req, res) => {
        try {
            const clientsDir = path.join(__dirname, 'data', 'clients');
            if (!fs.existsSync(clientsDir)) {
                return res.json([]);
            }

            const clients = fs.readdirSync(clientsDir).filter(file => {
                return fs.statSync(path.join(clientsDir, file)).isDirectory();
            }).map(client => {
                const clientPath = path.join(clientsDir, client);
                const debitsPath = path.join(clientPath, 'Debits');
                const creditsPath = path.join(clientPath, 'Credits');

                const getFiles = (dir) => {
                    if (!fs.existsSync(dir)) return [];
                    return fs.readdirSync(dir).filter(f => f.endsWith('.csv')).map(f => {
                        const filePath = path.join(dir, f);
                        const stats = fs.statSync(filePath);
                        let total = "0.00";
                        let listName = f;
                        let companies = [];

                        // Extract List Name
                        // Format: ListName_TYPE_TIMESTAMP.csv
                        const parts = f.split('_');
                        if (parts.length >= 3) {
                            // Remove last two parts (TYPE and TIMESTAMP)
                            listName = parts.slice(0, parts.length - 2).join(' ');
                        }

                        // Extract Total and Companies from File Content
                        try {
                            const content = fs.readFileSync(filePath, 'utf8');
                            const lines = content.trim().split('\n');

                            // Extract Total from last line
                            const lastLine = lines[lines.length - 1];
                            if (lastLine.includes('"TOTAL"')) {
                                const match = lastLine.match(/"([^"]+)"$/);
                                if (match) total = match[1];
                            }

                            // Extract Descriptions/Companies (Skip Header and Total)
                            // CSV Format: "Date","Description","Amount"
                            const dataRows = lines.slice(1);
                            const descriptions = new Set();

                            dataRows.forEach(row => {
                                if (row.includes('"TOTAL"')) return; // Skip total row
                                // Split by comma, respecting quotes
                                const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                                if (matches && matches.length >= 2) {
                                    // Description is likely index 1
                                    const desc = matches[1].replace(/^"|"$/g, '').trim();
                                    if (desc) descriptions.add(desc);
                                }
                            });

                            companies = Array.from(descriptions).slice(0, 3); // Top 3 unique companies
                            if (descriptions.size > 3) companies.push(`+${descriptions.size - 3} more`);

                        } catch (e) {
                            console.error("Error reading file info from " + f, e);
                        }

                        return {
                            name: f,
                            displayName: listName,
                            total: total,
                            companies: companies, // Return extracted companies
                            created: stats.mtime
                        };
                    }).sort((a, b) => b.created - a.created); // Newest first
                };

                return {
                    name: client,
                    debits: getFiles(debitsPath),
                    credits: getFiles(creditsPath)
                };
            });

            res.json(clients);
        } catch (error) {
            console.error("List Clients Error:", error);
            res.status(500).json({ error: "Failed to list clients" });
        }
    });

    // 8. Delete Client
    app.delete("/api/clients/:clientName", (req, res) => {
        try {
            const { clientName } = req.params;
            const safeClientName = clientName.replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
            if (!safeClientName) return res.status(400).json({ error: "Invalid client name" });

            const clientDir = path.join(__dirname, 'data', 'clients', safeClientName);

            if (fs.existsSync(clientDir)) {
                fs.rmSync(clientDir, { recursive: true, force: true });
                res.json({ success: true, message: "Client deleted" });
            } else {
                res.status(404).json({ error: "Client not found" });
            }
        } catch (error) {
            console.error("Delete Client Error:", error);
            res.status(500).json({ error: "Failed to delete client" });
        }
    });

    // 8.5 Delete Individual File
    app.delete("/api/clients/:clientName/files", (req, res) => {
        try {
            const { clientName } = req.params;
            const { type, filename } = req.query;

            const safeClientName = clientName.replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
            if (!safeClientName || !type || !filename || !['Debits', 'Credits'].includes(type)) {
                return res.status(400).json({ error: "Invalid parameters" });
            }

            const filePath = path.join(__dirname, 'data', 'clients', safeClientName, type, filename);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                res.json({ success: true, message: "File deleted" });
            } else {
                res.status(404).json({ error: "File not found" });
            }
        } catch (error) {
            console.error("Delete File Error:", error);
            res.status(500).json({ error: "Failed to delete file" });
        }
    });

    // 9. Read CSV File Content
    app.get("/api/read-csv", (req, res) => {
        try {
            const { client, type, file } = req.query;
            if (!client || !type || !file) return res.status(400).json({ error: "Missing params" });

            const safeClient = client.replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
            if (!['Debits', 'Credits'].includes(type) || file.includes('..')) {
                return res.status(400).json({ error: "Invalid path parameters" });
            }

            const filePath = path.join(__dirname, 'data', 'clients', safeClient, type, file);

            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.trim().split('\n');
                const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
                const rows = lines.slice(1).map(line => {
                    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
                    return matches.map(m => m.replace(/^"|"$/g, ''));
                });

                res.json({ headers, rows });
            } else {
                res.status(404).json({ error: "File not found" });
            }

        } catch (error) {
            console.error("Read CSV Error:", error);
            res.status(500).json({ error: "Failed to read file" });
        }
    });

    return app;
}

module.exports = { registerRoutes };
