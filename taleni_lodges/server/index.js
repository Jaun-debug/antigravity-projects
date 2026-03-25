require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { fetchLodgeData, LODGES } = require('./scraper');

const app = express();
const port = 3000;

app.use(cors());

const fs = require('fs');
const path = require('path');

// New endpoint to get static lodge data for UI building
app.get('/api/static-lodges', (req, res) => {
    let images = {};
    try {
        if (fs.existsSync('wetu_images.json')) {
            images = JSON.parse(fs.readFileSync('wetu_images.json'));
        }
    } catch (e) {
        console.error("Failed to load wetu_images.json", e);
    }

    const enrichedLodges = LODGES.map(lodge => {
        if (images[lodge.name] && images[lodge.name].length > 0) {
            return { ...lodge, images: images[lodge.name] };
        }
        return lodge;
    });

    res.json(enrichedLodges);
});

app.get('/api/rates/:lodgeName', (req, res) => {
    try {
        const ratesPath = path.join(__dirname, 'extracted_rates.json');
        if (fs.existsSync(ratesPath)) {
            const ratesData = JSON.parse(fs.readFileSync(ratesPath, 'utf8'));
            const requestedName = req.params.lodgeName.toUpperCase();

            // 1. Exact match
            if (ratesData[requestedName]) return res.json(ratesData[requestedName]);

            // 2. Fuzzy match
            function normalize(name) {
                return name.replace(/( LODGE| CAMP| HOTEL| GUESTHOUSE| RESORT| SAFARI| COLLECTION| THE | GUEST HOUSE)/g, '')
                    .replace(/[^A-Z]/g, '')
                    .trim();
            }

            const normalizedRequested = normalize(requestedName);

            const matchKey = Object.keys(ratesData).find(k => {
                const normalizedKey = normalize(k);
                if (!normalizedKey || !normalizedRequested) return false;
                return normalizedRequested.includes(normalizedKey) || normalizedKey.includes(normalizedRequested);
            });

            if (matchKey) {
                res.json(ratesData[matchKey]);
            } else {
                res.status(404).json({ error: "Rates not found for this lodge" });
            }
        } else {
            res.status(404).json({ error: "Rates database not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error reading rates" });
    }
});

app.get('/api/availability', async (req, res) => {
    try {
        const { checkInDate, checkOutDate, adults, children, lodgeName } = req.query;

        console.log(`Checking availability for: ${checkInDate} to ${checkOutDate} (Adults: ${adults})`);
        if (lodgeName) {
            console.log(`Specific lodge requested: ${lodgeName}`);
        }

        const data = await fetchLodgeData({
            checkInDate,
            checkOutDate,
            adults,
            children,
            lodgeName // Pass the optional filter
        });
        res.json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to scrape data" });
    }
});

// Register extraction routes
const { registerRoutes } = require('./routes');
const http = require('http');

// Create HTTP server to be compatible with registerRoutes signature
const server = http.createServer(app);

// Use registerRoutes to attach endpoints
// Note: registerRoutes is async but for express setup we can just call it
// It attaches listeners to the app/server instance
registerRoutes(server, app).then(() => {
    server.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});
