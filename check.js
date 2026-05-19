const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('file:///Users/jaunhusselmann/Desktop/AG%20Projects/dt_library/costing_engine_v3.html', { waitUntil: 'networkidle0' });
  await browser.close();
})();
