IDMA Pharma Rx pad 4.5 x 7 in - one file per page, for CorelDRAW
===============================================================

pdf/  vector PDF, one page each (best: opens in CorelDRAW as editable vector artwork)
svg/  the same pages as SVG with all text converted to curves (no fonts needed)

01-front-cover                 134.3 x 197.8 mm  (4.5 x 7 in = 114.3 x 177.8 mm trim + 3 mm bleed + crop marks)
02-inside-front-product-list   134.3 x 197.8 mm
03-inside-back-thank-you       134.3 x 197.8 mm
04-back-cover-improvit         134.3 x 197.8 mm
05-prescription-leaf           114.3 x 177.8 mm  (4.5 x 7 in, no bleed; 2 inks)

Make a .cdr from each file (CorelDRAW X7 or later):
 1. File > Open > choose the PDF.  In the PDF dialog set "Import text as: Curves".  OK.
    (or File > Import > the SVG)
 2. Check the page size against the list above.
 3. File > Save As > Save as type "CDR - CorelDRAW" > pick the version your press uses > Save.
 4. Before plates: convert colours to CMYK, black text to K100 overprint (see the job ticket).

Fonts: Plus Jakarta Sans (free, Google Fonts) if any text is re-set.
Rebuild these files: python3 build/split-for-coreldraw.py 4.5x7
