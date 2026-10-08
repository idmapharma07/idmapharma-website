# IDMA Pharma A5 prescription pad

Sample design for a customised doctor's prescription pad (A5, 148 x 210 mm).
Kept on this branch only: if it were merged to `main`, GitHub Pages would publish this folder.

| Page | Face | Content |
|---|---|---|
| 1 | Front cover, outside | IDMA promotion: "Medicines you can trust", motto, values, range, contact, WhatsApp QR |
| 2 | Front cover, inside | Full product list: brand with composition below |
| 3 | Back cover, inside | Thank-you, new-pad reorder (Kanpur rep/stockist, QR), highlighted products |
| 4 | Back cover, outside | IMPROVIT promotion, 3 more products, company details |
| Leaf | Prescription sheet | 100 per pad, 2 inks, personalised per doctor (separate PDF) |

Compositions come from IDMA's catalogue (Oct 2026) with IDMA's corrections. **Check every line against
the approved pack label before printing.** Strengths are still missing for MITTHU-AP, WOMI-G,
IMPROLAN-FC and IMPROVIT.

## Files

- `IDMA-Rx-pad-COVERS-PROOF-A5.pdf`: the 4 cover pages for approval (not for press)
- `IDMA-Rx-pad-COVERS-PRINT-bleed-cropmarks.pdf`: covers press file, 3 mm bleed, crop marks, TrimBox/BleedBox
- `IDMA-Rx-pad-LEAF-A5.pdf`: the prescription leaf
- `IDMA-Rx-pad-printer-job-ticket.pdf`: stock, binding, colours and open items for the printer
- `prescription-pad.html`, `printer-job-ticket.html`: editable sources
- `1-front-cover.png` ... `5-prescription-leaf.png`: page previews

## Rebuilding

```
node build/render.js <tmp-dir>          # previews, proof PDFs, raw covers print PDF, layout checks
python3 build/set-pdf-boxes.py <tmp-dir>/print-raw.pdf IDMA-Rx-pad-COVERS-PRINT-bleed-cropmarks.pdf
node build/ticket.js                    # job ticket PDF
```

Needs Playwright (Chromium) and `pypdf`.
