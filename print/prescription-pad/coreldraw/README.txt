IDMA Pharma Rx pad - one file per page, for CorelDRAW
=====================================================

pdf/  vector PDF, one page each (best: opens in CorelDRAW as editable vector artwork)
svg/  the same pages as SVG with all text converted to curves (no fonts needed)

01-front-cover                 168 x 230 mm  (A5 + 3 mm bleed + crop marks)
02-inside-front-product-list   168 x 230 mm
03-prescription-leaf           148 x 210 mm  (A5, no bleed; 2 inks)
04-head-strip                  168 x  53 mm  (flat strip + bleed, crop and fold marks)
05-inside-back-thank-you       168 x 230 mm
06-back-cover-improvit         168 x 230 mm

Make a .cdr from each file (CorelDRAW X7 or later):
 1. File > Open > choose the PDF.  In the PDF dialog set "Import text as: Curves".  OK.
    (or File > Import > the SVG)
 2. Check the page size against the list above.
 3. File > Save As > Save as type "CDR - CorelDRAW" > pick the version your press uses > Save.
 4. Before plates: convert colours to CMYK, black text to K100 overprint (see the job ticket).

Fonts: Plus Jakarta Sans (free, Google Fonts) if any text is re-set.
Rebuild these files: python3 build/split-for-coreldraw.py
