// Renders head-strip.html: previews (PNG), 3D mock-up, and the raw printer's PDF (crop + fold marks).
// usage: node build/strip.js <tmp-dir> [4.5x7]
//   then: python3 build/set-pdf-boxes.py <tmp-dir>/strip-raw.pdf IDMA-Rx-pad-HEAD-STRIP-RGB-LAYOUT-bleed-cropmarks.pdf "IDMA Pharma Rx pad - head strip"
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
(async () => {
  const dir = path.join(__dirname, '..'), scratch = process.argv[2] || os.tmpdir();
  const small = process.argv[3] === '4.5x7';
  const src = small ? 'head-strip-4.5x7.html' : 'head-strip.html', out = small ? path.join(dir, '4.5x7') : dir;
  const raw = path.join(scratch, small ? 'strip-raw-4.5x7.pdf' : 'strip-raw.pdf'), sheet = small ? ['134.3mm', '55mm'] : ['168mm', '53mm'];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 4 });
  await page.goto('file://' + path.join(dir, src));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  await page.evaluate(() => document.body.classList.add('shot'));
  await (await page.$('#preview')).screenshot({ path: path.join(out, '6-head-strip.png') });
  await (await page.$('#mock')).screenshot({ path: path.join(out, '6-head-strip-doctor-view.png') });
  await page.setViewportSize({ width: 1100, height: 1400 });
  if (!small) await (await page.$('#pad3d')).screenshot({ path: path.join(scratch, 'head-strip-3d.png') });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: raw, width: sheet[0], height: sheet[1], printBackground: true, preferCSSPageSize: true });
  console.log('raw strip PDF: ' + raw);
  await browser.close();
})();
