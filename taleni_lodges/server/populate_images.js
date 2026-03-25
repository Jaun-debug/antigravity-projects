const fs = require('fs');

const data = {
    "Susuwe Island Lodge": [
        "https://evo.dev.wetu.com/ImageHandler/c400x350/10998/doj0hw2zexqka_nbglcuvr-fm97438.jpg",
        "https://evo.dev.wetu.com/ImageHandler/c400x350/10998/Squiver_06D9974.jpg",
        "https://evo.dev.wetu.com/ImageHandler/c400x350/10998/Private-plunge-pool.jpg"
    ],
    "Zambezi Queen": [
        "https://wetu.com/ImageHandler/c800x600/16243/1748436089391_ZQC_ZQ_Exterior_277.jpg",
        "https://wetu.com/ImageHandler/c800x600/16243/zambezi_queen_exterior_andrew_morgan_4894.jpg",
        "https://wetu.com/ImageHandler/c800x600/16243/zambezi_queen_lounge_view_andrew_morgan_9199.jpg"
    ],
    "Ongava Lodge": [
        "https://wetu.com/ImageHandler/c800x600/8002/oevans-3344-1511.jpg",
        "https://wetu.com/ImageHandler/c800x600/8002/and_1495.jpg",
        "https://wetu.com/ImageHandler/c800x600/8002/amp_1721.jpg"
    ],
    "Wolwedans Dunes Lodge": [
        "https://wetu.com/ImageHandler/c800x600/10601/1736924264106_WOLWEDANS-COLLECTION---Dune-Camp---Main-area-at-sunset.jpg",
        "https://wetu.com/ImageHandler/c800x600/10601/wolwedans_-_dune_camp_-_0.jpg",
        "https://wetu.com/ImageHandler/c800x600/10601/1736924134157_WOLWEDANS-COLLECTION---Dune-Camp---Main-area-lounge-and-books.jpg"
    ],
    "Fish River Lodge": [
        "https://wetu.com/ImageHandler/c800x600/21616/1759400018062mg3394-panorama.jpg",
        "https://wetu.com/ImageHandler/c800x600/21616/1759395401799sonjakilianphotographyfishriverlodgeexterior22042023-13.jpg",
        "https://wetu.com/ImageHandler/c800x600/21616/frl_ext_lodge_day_01_cmyk_v1.png"
    ]
};

// Map exact names from scraper.js
// If "Wolwedans Dunes Lodge" is "Wolwedans Dune Camp" or similar, we might need to adjust.
// The scraper used "Wolwedans Plains Camp" etc.
// Let's check the scraper.js again.
// scraper.js has: "Wolwedans Boulders Camp", "Wolwedans Plains Camp", "Wolwedans Mountain View Suite"
// It does NOT have "Wolwedans Dunes Lodge".
// But we have "Zambezi Queen" (yes), "Ongava Lodge" (yes), "Fish River Lodge" (yes).
// We'll add the data regardless.

let existing = {};
if (fs.existsSync('wetu_images.json')) {
    existing = JSON.parse(fs.readFileSync('wetu_images.json'));
}

const merged = { ...existing, ...data };
fs.writeFileSync('wetu_images.json', JSON.stringify(merged, null, 2));
