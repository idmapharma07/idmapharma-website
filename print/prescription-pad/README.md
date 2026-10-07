# IDMA Pharma A5 prescription pad

Sample design for a customised doctor's prescription pad (A5, 148 x 210 mm).
Kept on this branch only: if it were merged to `main`, GitHub Pages would publish this folder.

| Page | Face | Content |
|---|---|---|
| 1 | Front cover, outside | Logo, motto, IDMA values, product forms, segments, contact, WhatsApp QR |
| 2 | Front cover, inside | Product list 1 of 2 (brand, composition, form) |
| 3 | Prescription leaf | 100 per pad, personalised per doctor, 2 inks (PMS 186 U + black) |
| 4 | Back cover, outside | Product list 2 of 2, Kanpur representative and stockist, contact |

**The product list is sample data.** Every brand name and composition on pages 2 and 4 must be
replaced with IDMA's own licensed products, copied from the approved labels, before printing.

## Files

- `IDMA-Rx-pad-PROOF-A5.pdf`: A5 proof for approval (not for press)
- `IDMA-Rx-pad-PRINT-bleed-cropmarks.pdf`: press file, 3 mm bleed, crop marks, TrimBox/BleedBox
- `IDMA-Rx-pad-printer-job-ticket.pdf`: stock, binding, colours and open items for the printer
- `prescription-pad.html`, `printer-job-ticket.html`: editable sources
- `1-front-cover.png` ... `4-back-cover.png`: page previews

## Rebuilding

```
node build/render.js <tmp-dir>          # previews, proof PDF, raw print PDF, layout checks
python3 build/set-pdf-boxes.py <tmp-dir>/print-raw.pdf IDMA-Rx-pad-PRINT-bleed-cropmarks.pdf
node build/ticket.js                    # job ticket PDF
```

Needs Playwright (Chromium) and `pypdf`.
