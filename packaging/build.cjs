// Renders every carton in products.cjs to a print PDF and a proof PNG.
//
//   NODE_PATH=$(npm root -g) node packaging/build.cjs        (all products)
//   NODE_PATH=$(npm root -g) node packaging/build.cjs ridam-dsr
//
// Needs Playwright with Chromium. Output goes to packaging/out/.
//
// Net layout (matches the existing artwork, all in mm):
//
//          D        W        D
//        +---+------------+---+
//      H |   |   FRONT    |END|
//        +---+------------+---+
//      D     |   STRIP    |
//        +---+------------+
//      H |END|    BACK    |
//        +---+------------+
//      D     |   STRIP    |
//            +------------+

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const PRODUCTS = require('./products.cjs');

const OUT = path.join(__dirname, 'out');
const n = (v) => +v.toFixed(3);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Escaped text with "Gandhinagar-382721," style tokens kept unbroken.
const escNB = (s) => esc(s).replace(/(\S+-\d{6}[.,]?)/g, '<span class="nb">$1</span>');

// ---------- shared vector pieces ----------

// The Idma oval: orange swoosh behind a glossy red body, as on the new cartons.
const LOGO_DEFS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <linearGradient id="lgO" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="#FFC627"/><stop offset=".55" stop-color="#F7941D"/><stop offset="1" stop-color="#EE5A24"/>
    </linearGradient>
    <radialGradient id="lgR" cx=".42" cy=".32" r=".75">
      <stop offset="0" stop-color="#F65A45"/><stop offset=".55" stop-color="#E2202A"/><stop offset="1" stop-color="#B0121C"/>
    </radialGradient>
    <linearGradient id="lgGloss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <symbol id="idma" viewBox="0 0 120 60">
      <ellipse cx="60" cy="30" rx="57.5" ry="25.5" transform="rotate(-11 60 30)" fill="url(#lgO)"/>
      <ellipse cx="60" cy="30" rx="54" ry="25.5" transform="rotate(-2 60 30)" fill="url(#lgR)"/>
      <ellipse cx="57" cy="16.5" rx="40" ry="10" transform="rotate(-2 57 16.5)" fill="url(#lgGloss)"/>
      <text x="58.5" y="42.5" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="32" fill="#7d0c12" fill-opacity=".35">Idma</text>
      <text x="58" y="41.6" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="32" fill="#fff">Idma</text>
      <text x="94.5" y="19.5" font-family="Montserrat" font-weight="700" font-size="7" fill="#fff">®</text>
    </symbol>
  </defs>
</svg>`;

const logo = (x, y, w, extra = '') =>
  `<svg class="logo" ${extra} style="left:${n(x)}mm;top:${n(y)}mm;width:${n(w)}mm;height:${n(w / 2)}mm" viewBox="0 0 120 60"><use href="#idma"/></svg>`;

const brandHTML = (p) =>
  p.brand.map(([t, c]) => `<span style="color:${p.colors[c]}">${esc(t)}</span>`).join('');

// Brand text recoloured for use on a white pill sitting on the coloured field.
const brandOnWhite = (p) =>
  p.brand.map(([t, c]) => `<span style="color:${c === 'white' ? p.colors.p : p.colors[c]}">${esc(t)}</span>`).join('');

// Cubic bezier sampled into points, used for the swoosh and its collision checks.
function bezierPoints(P, steps = 120) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    pts.push([
      u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0],
      u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1],
    ]);
  }
  return pts;
}
// Curve height at x (Infinity left of the swoosh, where there is no field).
function curveY(pts, x) {
  if (x < pts[0][0]) return Infinity;
  for (let i = 1; i < pts.length; i++) {
    if (pts[i][0] >= x) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
    }
  }
  return pts[pts.length - 1][1];
}

function halftone(id, color, op, r, step) {
  return `<pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse">
    <circle cx="${step / 2}" cy="${step / 2}" r="${r}" fill="${color}" fill-opacity="${op}"/></pattern>`;
}

function fadingDots(W, H, x0, y0, x1, y1, step, r, op) {
  // Opacity runs from `op` at (x0,y0) to 0 at 60% of the way to (x1,y1).
  const dx = x1 - x0, dy = y1 - y0, len2 = dx * dx + dy * dy, out = [];
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      const t = ((x - x0) * dx + (y - y0) * dy) / len2 / 0.6;
      const o = op * (1 - Math.min(1, Math.max(0, t)));
      if (o > 0.015) out.push(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill-opacity="${n(o)}"/>`);
    }
  }
  return `<g fill="#fff">${out.join('')}</g>`;
}

function fieldGradient(id, c) {
  return `<linearGradient id="${id}" x1="1" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${c.pLight}"/><stop offset=".55" stop-color="${c.p}"/><stop offset="1" stop-color="${c.pDark}"/></linearGradient>`;
}

function diamonds(c, cx, cy, s, sw) {
  const d = (x, y, size, col, op = 1) =>
    `<rect x="${n(x - size / 2)}" y="${n(y - size / 2)}" width="${n(size)}" height="${n(size)}" rx="${n(size * 0.08)}" transform="rotate(45 ${n(x)} ${n(y)})" fill="none" stroke="${col}" stroke-width="${n(sw)}" stroke-opacity="${op}"/>`;
  return [
    d(cx - s * 1.55, cy + s * 0.55, s * 0.42, c.a1),
    d(cx - s * 1.05, cy + s * 0.95, s * 0.30, c.orchid),
    d(cx + s * 1.45, cy - s * 0.85, s * 0.36, c.orchid),
    d(cx + s * 1.30, cy + s * 0.95, s * 0.55, c.a1, 0.85),
    d(cx + s * 0.55, cy + s * 1.25, s * 0.30, c.a2),
  ].join('');
}

// ---------- panels ----------

function front(p) {
  const { W, H, colors: c } = p;
  const u = H / 62; // design unit: 1 at the reference 62 mm height
  const slim = H / W < 0.5;
  const a = slim ? 0.40 : 0.44;    // where the swoosh meets the bottom edge (x / W)
  const cy = slim ? 0.52 : 0.45;   // where it meets the right edge (y / H)
  const P = [[a * W, H], [a * W + 0.09 * W, 0.56 * H], [0.70 * W, cy * H + 0.025 * H], [W, cy * H]];
  const pts = bezierPoints(P);
  const curve = `M${n(P[0][0])},${n(P[0][1])} C${n(P[1][0])},${n(P[1][1])} ${n(P[2][0])},${n(P[2][1])} ${n(P[3][0])},${n(P[3][1])}`;
  const field = `${curve} L${W},${H} Z`;

  // Largest logo (up to 31% of the width) that sits wholly inside the field.
  const mR = Math.max(4, 0.05 * W), mB = Math.max(3, 0.06 * H);
  let Lw = Math.min(0.31 * W, 0.62 * H), lx, ly;
  for (; Lw > 10; Lw *= 0.97) {
    lx = W - mR - Lw;
    ly = Math.min(H - mB - Lw / 2, (cy * H + H) / 2 - Lw / 4 + 0.02 * H);
    const halo = Lw * 0.06;
    if (ly - halo > curveY(pts, lx - halo) + 1.5 * u) break;
  }

  // Ribbons: the swoosh repeated deeper into the field, clipped to it.
  const ribbons = [1, 2, 3.2].map((k, i) => {
    const dx = k * 3.2 * u, dy = k * 3.6 * u;
    const Q = P.map(([x, y]) => [x + dx, y + dy]);
    return `<path d="M${n(Q[0][0])},${n(Q[0][1])} C${n(Q[1][0])},${n(Q[1][1])} ${n(Q[2][0])},${n(Q[2][1])} ${n(Q[3][0] + 5)},${n(Q[3][1])}" fill="none" stroke="${c.ribbon}" stroke-opacity="${[0.45, 0.28, 0.18][i]}" stroke-width="${n([0.45, 0.8, 1.3][i] * u)}"/>`;
  }).join('');

  const motif = p.motif === 'diamonds'
    ? diamonds(c, lx + Lw * 0.5, ly + Lw * 0.25, Lw * 0.42, 0.9 * u) : '';

  const art = `
  <svg class="art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <defs>
      ${fieldGradient('fFg', c)}
      <clipPath id="fClip"><path d="${field}"/></clipPath>
      <radialGradient id="fHalo" cx=".5" cy=".5" r=".5">
        <stop offset=".55" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <radialGradient id="fWash" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${n(0.9 * W)}">
        <stop offset="0" stop-color="${c.p}" stop-opacity=".07"/><stop offset="1" stop-color="${c.p}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#fff"/>
    <rect width="${W}" height="${H}" fill="url(#fWash)"/>
    ${[c.a1, c.p, c.a2].map((col, i) => `<rect x="0" y="${n(H * 0.83 + i * 1.3 * u)}" width="${W}" height="${n(0.38 * u)}" fill="${col}"/>`).join('')}
    <path d="${curve}" fill="none" stroke="${c.a2}" stroke-width="${n(2.8 * u)}"/>
    <path d="${curve}" fill="none" stroke="#fff" stroke-width="${n(2.0 * u)}"/>
    <path d="${curve}" fill="none" stroke="${c.a1}" stroke-width="${n(1.4 * u)}"/>
    <path d="${field}" fill="url(#fFg)"/>
    <g clip-path="url(#fClip)">
      ${fadingDots(W, H, W, cy * H, a * W, H, 0.95 * u, 0.2 * u, 0.22)}
      ${ribbons}
    </g>
    <ellipse cx="${n(lx + Lw / 2)}" cy="${n(ly + Lw / 4)}" rx="${n(Lw * 0.62)}" ry="${n(Lw * 0.36)}" fill="url(#fHalo)"/>
    <g clip-path="url(#fClip)">${motif}</g>
  </svg>`;

  const m = Math.max(4.5, 0.055 * W);
  const rowTop = 0.07 * H, rowFs = Math.min(3.6, 0.06 * H);
  const gTop = rowTop + rowFs * 1.35 + 0.02 * H;
  const gMaxH = cy * H - 2.2 * u - gTop;

  return {
    pts,
    html: `
  <div class="panel front" style="left:${p.D}mm;top:0;width:${W}mm;height:${H}mm">
    ${art}
    ${logo(lx, ly, Lw)}
    <div class="row" style="left:${n(m)}mm;right:${n(m)}mm;top:${n(rowTop)}mm;font-size:${n(rowFs)}mm">
      <span class="rx">R<sub>x</sub></span><span class="pack" style="border-color:${c.a1 === '#E6E000' || c.a1 === '#C5D400' ? c.p : c.a1}">${esc(p.pack)}</span>
    </div>
    <div class="stack" style="left:${n(m)}mm;top:${n(gTop)}mm;width:${n(W - 2 * m)}mm">
      <div class="generic" data-maxh="${n(gMaxH)}" data-max="${n(Math.min(0.13 * H, 8.5))}">${esc(p.generic)}</div>
      <div class="pill ${p.pill}${p.italic ? ' italic' : ''}" data-max="${n(Math.min(0.105 * H, 6.5))}" data-bottom="${n(H - mB)}"
        style="margin-top:${n(0.035 * H)}mm;--pb:${c[p.pillBorder]};--pc:${c.p};--pd:${c.pDark}">${brandHTML(p)}</div>
    </div>
  </div>`,
  };
}

function strip(p, top, id) {
  const { W, D, colors: c } = p;
  return `
  <div class="panel strip" style="left:${p.D}mm;top:${n(top)}mm;width:${W}mm;height:${D}mm">
    <svg class="art" viewBox="0 0 ${W} ${D}" preserveAspectRatio="none">
      <defs>${fieldGradient(id + 'g', c)}${halftone(id + 'd', '#fff', 0.16, 0.18, 0.9)}</defs>
      <rect width="${W}" height="${D}" fill="url(#${id}g)"/><rect width="${W}" height="${D}" fill="url(#${id}d)"/>
      <rect y="0" width="${W}" height="0.45" fill="${c.a1}"/>
      <rect y="${D - 0.45}" width="${W}" height="0.45" fill="${c.a1}"/>
    </svg>
    <span class="halo" style="left:${n(3.2)}mm;top:${n(D * 0.12)}mm;width:${n(D * 1.6)}mm;height:${n(D * 0.76)}mm"></span>
    ${logo(3.5, D * 0.15, D * 1.4)}
    <div class="pill white" data-max="${n(D * 0.4)}" data-maxw="${n(W - 2 * (3.5 + D * 1.5) - 2)}">${brandOnWhite(p)}</div>
    <span class="strip-pack" style="font-size:${n(Math.min(2.6, D * 0.24))}mm">${esc(p.pack)}</span>
  </div>`;
}

function endFlap(p, left, top, rot, id) {
  const { H, D, colors: c } = p;
  return `
  <div class="panel end" style="left:${n(left)}mm;top:${n(top)}mm;width:${D}mm;height:${H}mm">
    <svg class="art" viewBox="0 0 ${D} ${H}" preserveAspectRatio="none">
      <defs>${fieldGradient(id + 'g', c)}${halftone(id + 'd', '#fff', 0.16, 0.18, 0.9)}</defs>
      <rect width="${D}" height="${H}" fill="url(#${id}g)"/><rect width="${D}" height="${H}" fill="url(#${id}d)"/>
    </svg>
    <div class="end-rot" style="width:${n(H * 0.86)}mm;height:${D}mm;transform:translate(-50%,-50%) rotate(${rot}deg)">
      <div class="pill white" data-max="${n(D * 0.42)}" data-maxw="${n(H * 0.84)}">${brandOnWhite(p)}</div>
    </div>
  </div>`;
}

function back(p, top) {
  const { W, H, D, colors: c } = p;
  const slim = H / W < 0.5;
  const padY = 0.065 * H, padX = 0.05 * W;
  const rows = p.comp.rows.map(([name, qty, sub]) =>
    `<tr class="${sub ? 'sub' : ''}"><td>${esc(name)}</td><td class="q">${esc(qty)}</td></tr>`).join('');
  const notes = p.comp.notes.map((t) => `<div class="note">${esc(t)}</div>`).join('');
  const info = p.info.map(([k, v]) => `<p><b>${esc(k)}:</b> ${esc(v)}</p>`).join('');
  const after = p.after.map((t) => `<p class="after">${esc(t)}</p>`).join('');
  const warn = `<div class="warn"><b>${esc(p.schedule.title)}</b>${p.schedule.lines.map((l) => `<span>${esc(l)}</span>`).join('')}</div>`;
  return `
  <div class="panel back" style="left:${D}mm;top:${n(top)}mm;width:${W}mm;height:${H}mm;--p:${c.p};--a1:${c.a1}">
    <svg class="art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <defs><radialGradient id="bWash" gradientUnits="userSpaceOnUse" cx="${W}" cy="${H}" r="${n(0.75 * W)}">
        <stop offset="0" stop-color="${c.p}" stop-opacity=".10"/><stop offset="1" stop-color="${c.p}" stop-opacity="0"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="#fff"/><rect width="${W}" height="${H}" fill="url(#bWash)"/>
    </svg>
    <div class="back-grid" data-fs="${n(Math.min(2.7, 0.045 * H))}" style="left:${n(padX)}mm;right:${n(padX)}mm;top:${n(padY)}mm;bottom:${n(padY)}mm;grid-template-columns:${slim ? '1.45fr 1fr' : '1.3fr 1fr'};column-gap:${n(0.045 * W)}mm">
      <div class="col">
        <div class="comp"><div class="comp-h">${esc(p.comp.head)}</div><table>${rows}</table>${notes}</div>
        <div class="info">${info}</div>
        ${warn}
        ${after}
        <div class="mfg"><b>Mfg. By:</b> ${escNB(p.mfgBy)}<br><b>Mfg. At:</b> ${escNB(p.mfgAt)}</div>
      </div>
      <div class="col right">
        <div class="lic">Mfg. Lic. No.: <b>${esc(p.lic)}</b></div>
        <div class="batch"><div class="labels"><span>Batch No.:</span><span>Mfg. Date:</span><span>Exp. Date:</span></div><div class="brace"></div><b>Refer Strip</b></div>
        <div class="sample">Physician’s Sample<br>Not for Sale</div>
        <div class="mkt">
          <svg class="logo-inline" viewBox="0 0 120 60"><use href="#idma"/></svg>
          <span class="mby">Marketed by:</span>
          <b class="co">Idma Pharma</b>
          <span class="iso">(AN ISO 9001:2008 CERTIFIED COMPANY)</span>
          <span>Rishi House, Maninagar, <span class="nb">Ahmedabad-380008.</span></span>
        </div>
      </div>
    </div>
  </div>`;
}

// ---------- page ----------

const CSS = `
@font-face{font-family:Montserrat;src:url(../fonts/montserrat-700-normal.woff2) format('woff2');font-weight:700;font-style:normal}
@font-face{font-family:Montserrat;src:url(../fonts/montserrat-800-normal.woff2) format('woff2');font-weight:800;font-style:normal}
@font-face{font-family:Montserrat;src:url(../fonts/montserrat-800-italic.woff2) format('woff2');font-weight:800;font-style:italic}
@font-face{font-family:'Roboto Condensed';src:url(../fonts/roboto-condensed-400-normal.woff2) format('woff2');font-weight:400;font-style:normal}
@font-face{font-family:'Roboto Condensed';src:url(../fonts/roboto-condensed-500-normal.woff2) format('woff2');font-weight:500;font-style:normal}
@font-face{font-family:'Roboto Condensed';src:url(../fonts/roboto-condensed-600-normal.woff2) format('woff2');font-weight:600;font-style:normal}
@font-face{font-family:'Roboto Condensed';src:url(../fonts/roboto-condensed-700-normal.woff2) format('woff2');font-weight:700;font-style:normal}
@font-face{font-family:Nunito;src:url(../fonts/nunito-900-normal.woff2) format('woff2');font-weight:900;font-style:normal}
*{box-sizing:border-box}
html,body{margin:0;background:#fff}
body{font-family:'Roboto Condensed',sans-serif;color:#1E1B2E;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sheet{position:relative}
.panel{position:absolute;overflow:hidden}
.art{position:absolute;inset:0;width:100%;height:100%}
.logo{position:absolute}
.row{position:absolute;display:flex;justify-content:space-between;align-items:baseline;line-height:1}
.rx{font-family:Montserrat;font-weight:700;color:#E31E24;font-size:1.15em}
.rx sub{font-size:.6em;vertical-align:-.25em}
.pack{font-weight:700;letter-spacing:.01em;border-bottom:.45mm solid;padding-bottom:.18em}
.stack{position:absolute;display:flex;flex-direction:column;align-items:flex-start}
.generic{font-weight:500;line-height:1.04;letter-spacing:-.005em;text-wrap:balance;color:#1E1B2E}
.pill{font-family:Montserrat;font-weight:800;line-height:1;letter-spacing:.01em;white-space:nowrap;padding:.3em .55em .26em;border-radius:.32em}
.pill.outline{background:#fff;border:.38mm solid var(--pb)}
.pill.solid{color:#fff;background:linear-gradient(100deg,var(--pc),var(--pd));border-left:1.6mm solid var(--pb);border-radius:.18em}
.pill.italic{font-style:italic}
.pill.white{background:#fff;font-size:3mm}
.strip{display:flex;align-items:center;justify-content:center}
.strip .pill{position:relative}
.halo{position:absolute;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.95) 60%,rgba(255,255,255,0))}
.strip-pack{position:absolute;right:3.5mm;top:50%;transform:translateY(-50%);color:#fff;font-weight:700;letter-spacing:.01em}
.end-rot{position:absolute;left:50%;top:50%;display:flex;align-items:center;justify-content:center}
.back-grid{position:absolute;display:grid;font-size:var(--fs);line-height:1.22}
.col{display:flex;flex-direction:column;justify-content:space-between;min-height:0;overflow:hidden}
.col>*{flex:none}
.comp{background:color-mix(in srgb,var(--p) 7%,#fff);border-left:.7mm solid var(--p);border-radius:.25em;padding:.4em .6em .45em}
.comp-h{font-weight:700;color:var(--p);margin-bottom:.15em}
.comp table{width:100%;border-collapse:collapse}
.comp td{padding:0;vertical-align:top}
.comp td.q{text-align:right;white-space:nowrap;padding-left:.6em;font-weight:600;font-variant-numeric:tabular-nums}
.comp tr.sub td:first-child{padding-left:.7em;font-size:.94em;color:#4a4658}
.note{margin-top:.15em}
.info p,.after{margin:0}
.info p+p{margin-top:.18em}
.info b{font-weight:700}
.warn{background:#E31E24;color:#fff;border-radius:.3em;padding:.35em .55em .4em;text-align:center;font-size:.95em;line-height:1.18;display:flex;flex-direction:column}
.warn b{font-weight:700;letter-spacing:.02em}
.after{font-weight:600}
.mfg{font-size:.86em;color:#3b3748}
.mfg b{font-weight:600}
.right{align-items:flex-start}
.lic b{font-weight:700}
.batch{display:flex;align-items:center;gap:.45em;background:color-mix(in srgb,var(--p) 7%,#fff);border-radius:.3em;padding:.35em .6em}
.batch .labels{display:flex;flex-direction:column;gap:.12em}
.batch .brace{align-self:stretch;width:.5em;border:.25mm solid var(--p);border-left:0;border-radius:0 .5em .5em 0}
.batch>b{color:var(--p)}
.sample{color:#E31E24;font-weight:700;font-size:1.08em;line-height:1.15;text-decoration:underline;text-underline-offset:.15em;text-decoration-thickness:.25mm}
.mkt{display:flex;flex-direction:column;line-height:1.2}
.logo-inline{width:8.5em;height:4.25em;margin:0 0 .25em -.2em}
.mby{font-size:.95em}
.co{font-family:Montserrat;font-weight:800;color:#E31E24;font-size:1.3em;line-height:1.1}
.iso{font-weight:700;font-size:.82em}
.nb{white-space:nowrap}
.proof .sheet{margin:8mm}
.proof .cut{position:absolute;inset:0;pointer-events:none}
.proof .label{position:absolute;font:600 3.2mm 'Roboto Condensed';color:#555}
`;

const FIT_JS = `
window.fitAll = async function () {
  await document.fonts.ready;
  const MM = 96 / 25.4, out = {};
  const pts = window.CURVE;
  const curveY = (x) => {
    if (x < pts[0][0]) return Infinity;
    for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      return y0 + (y1 - y0) * (x - x0) / ((x1 - x0) || 1);
    }
    return pts[pts.length - 1][1];
  };
  // Front: largest generic name that fits its box, brand kept smaller than it
  // (proper name must be more conspicuous than the brand name).
  const front = document.querySelector('.front');
  const fr = front.getBoundingClientRect();
  const g = front.querySelector('.generic');
  let gs = +g.dataset.max;
  const fitsG = () => g.scrollWidth <= g.clientWidth + 0.5 && g.getBoundingClientRect().height <= g.dataset.maxh * MM + 0.5;
  for (g.style.fontSize = gs + 'mm'; !fitsG() && gs > 1.6; gs *= 0.98) g.style.fontSize = gs + 'mm';
  out.generic = gs;
  const pill = front.querySelector('.pill');
  let ps = Math.min(+pill.dataset.max, gs * 0.8);
  const hits = () => {
    const r = pill.getBoundingClientRect();
    const x = (r.right - fr.left) / MM, y = (r.bottom - fr.top) / MM;
    return y > +pill.dataset.bottom || y + 1.2 > curveY(x + 0.8);
  };
  for (pill.style.fontSize = ps + 'mm'; hits() && ps > 1.5; ps *= 0.97) pill.style.fontSize = ps + 'mm';
  out.brand = ps;
  // Strip and end-flap pills: as large as allowed, within their width.
  // offsetWidth ignores transforms, so the rotated end-flap pills fit the same way.
  document.querySelectorAll('.pill.white').forEach((el) => {
    let s = +el.dataset.max;
    for (el.style.fontSize = s + 'mm'; el.offsetWidth > +el.dataset.maxw * MM && s > 1.5; s *= 0.97) el.style.fontSize = s + 'mm';
  });
  // Back: one body size for both columns, shrunk until neither overflows.
  const grid = document.querySelector('.back-grid');
  let fs = +grid.dataset.fs;
  const cols = [...grid.querySelectorAll('.col')];
  const over = () => cols.some((c) => c.scrollHeight > c.clientHeight + 0.5);
  for (grid.style.setProperty('--fs', fs + 'mm'); over() && fs > 1.2; fs *= 0.98) grid.style.setProperty('--fs', fs + 'mm');
  out.back = fs;
  return out;
};`;

function page(p, proof) {
  const { W, H, D } = p;
  const SW = W + 2 * D, SH = 2 * H + 2 * D;
  const f = front(p);
  const cut = proof ? `
  <svg class="cut" viewBox="0 0 ${SW} ${SH}" fill="none" stroke="#8a8f98" stroke-width=".15">
    <rect x="${D}" y="0" width="${W}" height="${H}"/><rect x="${D + W}" y="0" width="${D}" height="${H}"/>
    <rect x="${D}" y="${H}" width="${W}" height="${D}"/><rect x="0" y="${H + D}" width="${D}" height="${H}"/>
    <rect x="${D}" y="${H + D}" width="${W}" height="${H}"/><rect x="${D}" y="${2 * H + D}" width="${W}" height="${D}"/>
  </svg>
  <div class="label" style="right:0;top:${SH + 2}mm">${W} x ${H} x ${D} mm</div>` : '';
  const pageW = proof ? SW + 16 : SW, pageH = proof ? SH + 17 : SH;
  return {
    size: { w: pageW, h: pageH },
    html: `<!doctype html><html${proof ? ' class="proof"' : ''}><head><meta charset="utf-8"><title>${esc(p.slug)}</title>
<style>${CSS}@page{size:${pageW}mm ${pageH}mm;margin:0}body{width:${pageW}mm;height:${pageH}mm}</style></head>
<body${proof ? ' class="proof"' : ''}>${LOGO_DEFS}
<div class="sheet" style="width:${SW}mm;height:${SH}mm">
  ${f.html}
  ${endFlap(p, D + W, 0, -90, 'eR')}
  ${strip(p, H, 'sT')}
  ${endFlap(p, 0, H + D, 90, 'eL')}
  ${back(p, H + D)}
  ${strip(p, 2 * H + D, 'sB')}
  ${cut}
</div>
<script>window.CURVE=${JSON.stringify(f.pts.map(([x, y]) => [n(x), n(y)]))};${FIT_JS}</script>
</body></html>`,
  };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const only = process.argv.slice(2);
  const browser = await chromium.launch();
  const report = [];
  for (const p of PRODUCTS.filter((x) => !only.length || only.includes(x.slug))) {
    for (const proof of [false, true]) {
      const { html, size } = page(p, proof);
      const file = path.join(OUT, `${p.slug}${proof ? '-proof' : ''}.html`);
      fs.writeFileSync(file, html);
      const pg = await browser.newPage({ deviceScaleFactor: proof ? 3 : 1 });
      await pg.setViewportSize({ width: Math.ceil(size.w * 96 / 25.4), height: Math.ceil(size.h * 96 / 25.4) });
      await pg.goto('file://' + file);
      const fit = await pg.evaluate(() => window.fitAll());
      if (proof) {
        await pg.screenshot({ path: path.join(OUT, `${p.slug}-proof.png`), fullPage: true });
        fs.unlinkSync(file);
      } else {
        await pg.pdf({ path: path.join(OUT, `${p.slug}.pdf`), width: size.w + 'mm', height: size.h + 'mm', printBackground: true, pageRanges: '1' });
        fs.unlinkSync(file);
        const pt = (mm) => (mm * 72 / 25.4).toFixed(1) + 'pt';
        report.push(`${p.slug.padEnd(16)} generic ${pt(fit.generic)}  brand ${pt(fit.brand)}  back text ${pt(fit.back)}`);
      }
      await pg.close();
    }
  }
  await browser.close();
  console.log(report.join('\n'));
})();
