# IDMA Pharma A5 prescription pad

Sample design for a customised doctor's prescription pad (A5, 148 x 210 mm).
Kept on this branch only: if it were merged to `main`, GitHub Pages would publish this folder.

| Page | Face | Content |
|---|---|---|
| 1 | Front cover, outside | IDMA promotion: "Medicines you can trust", motto, values, range, contact, WhatsApp QR |
| 2 | Front cover, inside | Full product list: brand with composition below |
| 3 | Back cover, inside | Thank-you, new-pad reorder (write-in lines for rep and stockist, QR), 12 highlighted products |
| 4 | Back cover, outside | IMPROVIT reminder with the bottle creative (`improvit-bottle.png`), 3 more products, company details |
| Head strip | Binding strip over the head | IMPROVIT, IMPROLAN-FC, RIDAM-ESR: front flap 10 mm above every leaf, spine, back flap 12 mm (`head-strip.html`) |
| Leaf | Prescription sheet | Patient name and address, Rx, light IDMA watermark (12% red screen), signature & stamp box, Mitthu Range "Create With Care" footer; 100 per pad, 2 inks, same leaf for every doctor (separate PDF) |

Compositions come from IDMA's catalogue (Oct 2026) with IDMA's corrections. **Check every line against
the approved pack label before printing.** Strengths are still missing for MITTHU-AP, IMPROLAN-FC
and IMPROVIT; the "per 5 ml" basis of the syrups is to be confirmed. Page 4 stays a reminder (no
indications or ingredient claims) until the IMPROVIT label gives dosage, contraindications and side effects.

## Files

- `IDMA-Rx-pad-COVERS-PROOF-A5.pdf`: the 4 cover pages for approval (not for press)
- `IDMA-Rx-pad-COVERS-RGB-LAYOUT-bleed-cropmarks.pdf`: covers layout for the printer, 3 mm bleed, crop marks, TrimBox/BleedBox (RGB: convert or re-set before plating)
- `IDMA-Rx-pad-HEAD-STRIP-RGB-LAYOUT-bleed-cropmarks.pdf`: head strip for the printer (crop and fold marks); `6-head-strip*.png`: strip previews and mock-up
- `coreldraw/`: every page as its own vector PDF and SVG (text as curves) for CorelDRAW; see `coreldraw/README.txt`
- `IDMA-Rx-pad-LEAF-A5.pdf`: the prescription leaf
- `IDMA-Rx-pad-printer-job-ticket.pdf`: stock, binding, colours and open items for the printer
- `prescription-pad.html`, `printer-job-ticket.html`: editable sources; `improvit-bottle.png`: IMPROVIT creative (supplied by IDMA)
- `1-front-cover.png` ... `5-prescription-leaf.png`: page previews

## 4.5 x 7 in version

`4.5x7/` holds the same pad laid out at 4.5 x 7 in (114.3 x 177.8 mm): previews, proof PDFs, the covers print file and
`4.5x7/coreldraw/` (one PDF + SVG per page). Content comes from `prescription-pad.html`; only the layout differs
(`build/size-4.5x7.css`). `prescription-pad-4.5x7.html` is generated: do not edit it.

```
python3 build/make-variant.py 4.5x7
node build/render.js <tmp-dir> 4.5x7
python3 build/set-pdf-boxes.py <tmp-dir>/print-raw-4.5x7.pdf 4.5x7/IDMA-Rx-pad-COVERS-RGB-LAYOUT-4.5x7-bleed-cropmarks.pdf "IDMA Pharma Rx pad 4.5 x 7 in" 114.3x177.8
python3 build/split-for-coreldraw.py 4.5x7
```

## Rebuilding

```
node build/render.js <tmp-dir>          # previews, proof PDFs, raw covers print PDF, layout checks
python3 build/set-pdf-boxes.py <tmp-dir>/print-raw.pdf IDMA-Rx-pad-COVERS-RGB-LAYOUT-bleed-cropmarks.pdf
node build/strip.js <tmp-dir>           # head strip previews, mock-up, raw strip PDF
python3 build/set-pdf-boxes.py <tmp-dir>/strip-raw.pdf IDMA-Rx-pad-HEAD-STRIP-RGB-LAYOUT-bleed-cropmarks.pdf "IDMA Pharma Rx pad - head strip"
node build/ticket.js                    # job ticket PDF
python3 build/split-for-coreldraw.py    # one PDF + SVG per page in coreldraw/ (needs pymupdf)
```

Needs Playwright (Chromium) and `pypdf`.
