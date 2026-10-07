// Renders prescription-pad.html to page previews (PNG), the A5 proof PDF and the raw print PDF,
// and prints layout checks (gaps, text near the trim, overflow).
// usage: node build/render.js            then: python3 build/set-pdf-boxes.py <tmp>/print-raw.pdf IDMA-Rx-pad-PRINT-bleed-cropmarks.pdf
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
(async () => {
  const dir = path.join(__dirname, '..'), outDir = dir, scratch = process.argv[2] || os.tmpdir();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 700, height: 1000 }, deviceScaleFactor: 3 });
  await page.goto('file://' + path.join(dir, 'prescription-pad.html'));
  await page.evaluate(() => document.fonts.ready);
  const report = await page.evaluate(() => {
    const mm = px => (px / 3.7795).toFixed(1);
    const out = [];
    document.querySelectorAll('.sheet').forEach((s, i) => {
      const sb = s.getBoundingClientRect();
      const top = el => el.getBoundingClientRect().top - sb.top, bot = el => el.getBoundingClientRect().bottom - sb.top;
      const list = s.querySelector('.plist'), next = s.querySelector('.local, .list-foot');
      if (list && next) out.push(`p${i+1}: list ends ${mm(bot(list))}mm, next block starts ${mm(top(next))}mm, gap ${mm(top(next)-bot(list))}mm`);
      const local = s.querySelector('.local'), band = s.querySelector('.back-band');
      if (local && band) out.push(`p${i+1}: local box ends ${mm(bot(local))}mm, band starts ${mm(top(band))}mm`);
      const closing = s.querySelector('.closing'), foot = s.querySelector('.rx-foot');
      if (closing && foot) out.push(`p${i+1}: closing ${mm(top(closing))}-${mm(bot(closing))}mm, footer text ${mm(top(foot))}-${mm(bot(foot))}mm; body height ${mm(s.querySelector('.body').getBoundingClientRect().height)}mm`);
      // text closer than 5 mm to trim, overlaps of overflowing elements
      s.querySelectorAll('p, span, td, th, h1, h2, b, img, .row, .scan').forEach(el => {
        const r = el.getBoundingClientRect(); if (!r.width || !el.textContent.trim() && el.tagName !== 'IMG') return;
        const d = Math.min(r.left - sb.left, sb.right - r.right, r.top - sb.top, sb.bottom - r.bottom);
        if (d < 18.9) out.push(`p${i+1}: ${el.tagName}.${el.className} "${(el.textContent||'').trim().slice(0,30)}" is ${mm(d)}mm from trim`);
      });
      s.querySelectorAll('td, .field, .row').forEach(el => { if (el.scrollWidth > el.clientWidth + 1) out.push(`p${i+1}: overflow in ${el.className} "${el.textContent.trim().slice(0,30)}"`); });
    });
    const sizes = new Set();
    document.querySelectorAll('.sheet *').forEach(el => { if (el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) sizes.add(parseFloat(getComputedStyle(el).fontSize) * 0.75); });
    out.push('smallest text sizes (pt): ' + [...sizes].sort((a,b)=>a-b).slice(0,4).map(x=>x.toFixed(1)).join(', '));
    return out;
  });
  console.log(report.join('\n'));
  const names = ['1-front-cover', '2-inside-front-cover', '3-prescription-leaf', '4-back-cover'];
  const sheets = await page.$$('.sheet');
  for (let i = 0; i < sheets.length; i++) await sheets[i].screenshot({ path: path.join(outDir, `${names[i]}.png`) });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: path.join(outDir, 'IDMA-Rx-pad-PROOF-A5.pdf'), width: '148mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
  await page.evaluate(() => window.printMode());
  await page.pdf({ path: path.join(scratch, 'print-raw.pdf'), width: '168mm', height: '230mm', printBackground: true, preferCSSPageSize: true });
  await page.emulateMedia({ media: 'screen' });
  console.log('raw print PDF: ' + path.join(scratch, 'print-raw.pdf'));
  await browser.close();
})();
