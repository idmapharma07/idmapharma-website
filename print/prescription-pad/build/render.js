// Renders prescription-pad.html: page previews (PNG), proof PDFs (covers + leaf),
// the raw printer's PDF for the covers, and layout checks.
// usage: node build/render.js <tmp-dir> [4.5x7]   (no size = A5)
//   then: python3 build/set-pdf-boxes.py <tmp-dir>/print-raw.pdf IDMA-Rx-pad-COVERS-RGB-LAYOUT-bleed-cropmarks.pdf
const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
(async () => {
  const dir = path.join(__dirname, '..'), scratch = process.argv[2] || os.tmpdir();
  const SIZES = { A5: { src: 'prescription-pad.html', w: 148, h: 210, out: dir, tag: 'A5' },
                  '4.5x7': { src: 'prescription-pad-4.5x7.html', w: 114.3, h: 177.8, out: path.join(dir, '4.5x7'), tag: '4.5x7' } };
  const V = SIZES[process.argv[3] || 'A5'];
  require('fs').mkdirSync(V.out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 700, height: 1000 }, deviceScaleFactor: 3 });
  await page.goto('file://' + path.join(dir, V.src));
  await page.evaluate(() => document.fonts.ready);
  const report = await page.evaluate(() => {
    const mm = px => (px / 3.7795).toFixed(1);
    const out = [];
    document.querySelectorAll('.sheet').forEach((s, i) => {
      const sb = s.getBoundingClientRect();
      const box = el => el.getBoundingClientRect();
      // multi-column product list must not overflow its box (hidden overflow columns)
      const pl = s.querySelector('.plist2');
      if (pl) {
        const pb = pl.getBoundingClientRect().bottom;
        const low = Math.max(...[...pl.querySelectorAll('.pc, .gh')].map(el => el.getBoundingClientRect().bottom));
        const bad = pl.scrollWidth > pl.clientWidth + 1 ? 'OVERFLOWS into a hidden column' : low > pb + 0.5 ? `OVERFLOWS the bottom by ${mm(low - pb)}mm` : `fits, ${mm(pb - low)}mm spare`;
        out.push(`p${i+1}: product list ${bad} (box ${mm(pl.clientHeight)}mm tall)`);
      }
      // overlapping absolutely-positioned blocks
      const blocks = [...s.querySelectorAll('.trim > *')].filter(el => getComputedStyle(el).position === 'absolute' && box(el).height > 0 && !el.matches('.cover-top, .cover-curve, .ivbg, .bar, .stripe, .iv-glow, .iv-shadow, .iv-hero, .plfoot.hinge'));
      // page 2 footer sits under column 1: the column-1 cards above it must end before it starts
      const hf = s.querySelector('.plfoot.hinge');
      if (hf && pl) { const f = box(hf); const hit = [...pl.querySelectorAll('.pc, .gh')].filter(el => box(el).left < f.right && box(el).bottom > f.top); if (hit.length) out.push(`p${i+1}: OVERLAP product list / page-2 footer`); }
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
  // previews: white surround so rounding at the sheet edge doesn't pick up the grey page background
  await page.addStyleTag({ content: 'html, body { background: #fff !important; } .sheet { box-shadow: none !important; }' });
  const names = ['1-front-cover', '2-inside-front-product-list', '3-inside-back-thank-you', '4-back-cover-improvit', '5-prescription-leaf'];
  const sheets = await page.$$('.sheet');
  for (let i = 0; i < sheets.length; i++) await sheets[i].screenshot({ path: path.join(V.out, `${names[i]}.png`) });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: path.join(V.out, `IDMA-Rx-pad-COVERS-PROOF-${V.tag}.pdf`), width: V.w + 'mm', height: V.h + 'mm', printBackground: true, preferCSSPageSize: true, pageRanges: '1-4' });
  await page.pdf({ path: path.join(V.out, `IDMA-Rx-pad-LEAF-${V.tag}.pdf`), width: V.w + 'mm', height: V.h + 'mm', printBackground: true, preferCSSPageSize: true, pageRanges: '5' });
  await page.evaluate(() => window.printMode());
  const raw = path.join(scratch, V.tag === 'A5' ? 'print-raw.pdf' : `print-raw-${V.tag}.pdf`);
  await page.pdf({ path: raw, width: (V.w + 20) + 'mm', height: (V.h + 20) + 'mm', printBackground: true, preferCSSPageSize: true, pageRanges: '1-4' });
  console.log('raw print PDF: ' + raw);
  await browser.close();
})();
