// Renders prescription-pad.html: page previews (PNG), proof PDFs (covers + leaf),
// the raw printer's PDF for the covers, and layout checks.
// usage: node build/render.js <tmp-dir>
//   then: python3 build/set-pdf-boxes.py <tmp-dir>/print-raw.pdf IDMA-Rx-pad-COVERS-PRINT-bleed-cropmarks.pdf
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
(async () => {
  const dir = path.join(__dirname, '..'), scratch = process.argv[2] || os.tmpdir();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 700, height: 1000 }, deviceScaleFactor: 3 });
  await page.goto('file://' + path.join(dir, 'prescription-pad.html'));
  await page.evaluate(() => document.fonts.ready);
  const report = await page.evaluate(() => {
    const mm = px => (px / 3.7795).toFixed(1);
    const out = [];
    document.querySelectorAll('.sheet').forEach((s, i) => {
      const sb = s.getBoundingClientRect();
      const box = el => el.getBoundingClientRect();
      // multi-column product list must not overflow its box (hidden overflow columns)
      const pl = s.querySelector('.plist2');
      if (pl) out.push(`p${i+1}: product list ${pl.scrollWidth > pl.clientWidth + 1 ? 'OVERFLOWS into a hidden column' : 'fits'} (box ${mm(pl.clientHeight)}mm tall)`);
      // overlapping absolutely-positioned blocks
      const blocks = [...s.querySelectorAll('.trim > *')].filter(el => getComputedStyle(el).position === 'absolute' && box(el).height > 0 && !el.matches('.cover-top, .cover-curve, .ivbg, .bar, .stripe'));
      for (let a = 0; a < blocks.length; a++) for (let b = a + 1; b < blocks.length; b++) {
        const A = box(blocks[a]), B = box(blocks[b]);
        const ov = Math.min(A.right, B.right) - Math.max(A.left, B.left) > 1 && Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top) > 1;
        if (ov) out.push(`p${i+1}: OVERLAP ${blocks[a].className} / ${blocks[b].className}`);
      }
      // text too close to trim (ignore full-width centred lines)
      s.querySelectorAll('p, span, h1, h2, b, img, .row, .pc').forEach(el => {
        const r = el.getBoundingClientRect(); if (!r.width || r.width > sb.width - 2) return;
        const d = Math.min(r.left - sb.left, sb.right - r.right, r.top - sb.top, sb.bottom - r.bottom);
        if (d < 18.9) out.push(`p${i+1}: ${el.tagName}.${el.className} "${(el.textContent || '').trim().slice(0, 28)}" ${mm(d)}mm from trim`);
      });
      s.querySelectorAll('td, .field, .row, .pn, .pcomp').forEach(el => { if (el.scrollWidth > el.clientWidth + 1) out.push(`p${i+1}: text overflow in ${el.className} "${el.textContent.trim().slice(0, 30)}"`); });
    });
    return out;
  });
  console.log(report.join('\n') || 'no layout problems found');
  const names = ['1-front-cover', '2-inside-front-product-list', '3-inside-back-thank-you', '4-back-cover-improvit', '5-prescription-leaf'];
  const sheets = await page.$$('.sheet');
  for (let i = 0; i < sheets.length; i++) await sheets[i].screenshot({ path: path.join(dir, `${names[i]}.png`) });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: path.join(dir, 'IDMA-Rx-pad-COVERS-PROOF-A5.pdf'), width: '148mm', height: '210mm', printBackground: true, preferCSSPageSize: true, pageRanges: '1-4' });
  await page.pdf({ path: path.join(dir, 'IDMA-Rx-pad-LEAF-A5.pdf'), width: '148mm', height: '210mm', printBackground: true, preferCSSPageSize: true, pageRanges: '5' });
  await page.evaluate(() => window.printMode());
  await page.pdf({ path: path.join(scratch, 'print-raw.pdf'), width: '168mm', height: '230mm', printBackground: true, preferCSSPageSize: true, pageRanges: '1-4' });
  console.log('raw print PDF: ' + path.join(scratch, 'print-raw.pdf'));
  await browser.close();
})();
