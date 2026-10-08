// Renders head-strip.html: previews (PNG), 3D mock-up, and the raw printer's PDF (crop + fold marks).
// usage: node build/strip.js <tmp-dir>
//   then: python3 build/set-pdf-boxes.py <tmp-dir>/strip-raw.pdf IDMA-Rx-pad-HEAD-STRIP-RGB-LAYOUT-bleed-cropmarks.pdf "IDMA Pharma Rx pad - head strip"
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
(async () => {
  const dir = path.join(__dirname, '..'), scratch = process.argv[2] || os.tmpdir();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 4 });
  await page.goto('file://' + path.join(dir, 'head-strip.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  await page.evaluate(() => document.body.classList.add('shot'));
  await (await page.$('#preview')).screenshot({ path: path.join(dir, '6-head-strip.png') });
  await (await page.$('#mock')).screenshot({ path: path.join(dir, '6-head-strip-doctor-view.png') });
  await page.setViewportSize({ width: 1100, height: 1400 });
  await (await page.$('#pad3d')).screenshot({ path: path.join(scratch, 'head-strip-3d.png') });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: path.join(scratch, 'strip-raw.pdf'), width: '168mm', height: '53mm', printBackground: true, preferCSSPageSize: true });
  console.log('raw strip PDF: ' + path.join(scratch, 'strip-raw.pdf') + '\n3D mock-up: ' + path.join(scratch, 'head-strip-3d.png'));
  await browser.close();
})();
