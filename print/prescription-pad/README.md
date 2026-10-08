# IDMA Pharma A5 prescription pad

Sample design for a customised doctor's prescription pad (A5, 148 x 210 mm).
Kept on this branch only: if it were merged to `main`, GitHub Pages would publish this folder.

| Page | Face | Content |
|---|---|---|
| 1 | Front cover, outside | IDMA promotion: "Medicines you can trust", motto, values, range, contact, WhatsApp QR |
| 2 | Front cover, inside | Full product list: brand with composition below |
| 3 | Back cover, inside | Thank-you, new-pad reorder (write-in lines for rep and stockist, QR), 12 highlighted products |
| 4 | Back cover, outside | IMPROVIT reminder with the bottle creative (`improvit-bottle.png`), 3 more products, company details |
| Leaf | Prescription sheet | Patient name and address, Rx, light IDMA watermark (12% red screen), signature & stamp box, Mitthu Range "Create With Care" footer; 100 per pad, 2 inks, same leaf for every doctor (separate PDF) |

Compositions come from IDMA's catalogue (Oct 2026) with IDMA's corrections. **Check every line against
the approved pack label before printing.** Strengths are still missing for MITTHU-AP, IMPROLAN-FC
and IMPROVIT; the "per 5 ml" basis of the syrups is to be confirmed. Page 4 stays a reminder (no
indications or ingredient claims) until the IMPROVIT label gives dosage, contraindications and side effects.

## Files

- `IDMA-Rx-pad-COVERS-PROOF-A5.pdf`: the 4 cover pages for approval (not for press)
- `IDMA-Rx-pad-COVERS-RGB-LAYOUT-bleed-cropmarks.pdf`: covers layout for the printer, 3 mm bleed, crop marks, TrimBox/BleedBox (RGB: convert or re-set before plating)
- `IDMA-Rx-pad-LEAF-A5.pdf`: the prescription leaf
- `IDMA-Rx-pad-printer-job-ticket.pdf`: stock, binding, colours and open items for the printer
- `prescription-pad.html`, `printer-job-ticket.html`: editable sources; `improvit-bottle.png`: IMPROVIT creative (supplied by IDMA)
- `1-front-cover.png` ... `5-prescription-leaf.png`: page previews

## Rebuilding

```
node build/render.js <tmp-dir>          # previews, proof PDFs, raw covers print PDF, layout checks
python3 build/set-pdf-boxes.py <tmp-dir>/print-raw.pdf IDMA-Rx-pad-COVERS-RGB-LAYOUT-bleed-cropmarks.pdf
node build/ticket.js                    # job ticket PDF
```

Needs Playwright (Chromium) and `pypdf`.
