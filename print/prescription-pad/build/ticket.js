// Renders printer-job-ticket.html to an A4 PDF.  usage: node build/ticket.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const dir = path.join(__dirname, '..');
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(dir, 'printer-job-ticket.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(dir, 'IDMA-Rx-pad-printer-job-ticket.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await browser.close();
})();
