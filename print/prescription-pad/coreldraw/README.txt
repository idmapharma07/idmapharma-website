IDMA Pharma Rx pad A5 - one file per page, for CorelDRAW
========================================================

pdf/    vector PDF, one page each, with real fonts: opens in CorelDRAW with editable text
svg/    the same pages, text as curves
fonts/  Plus Jakarta Sans (the font of the design): install before opening

01-front-cover                 168 x 230 mm  (A5 + 3 mm bleed + crop marks)
02-inside-front-product-list   168 x 230 mm
03-prescription-leaf           148 x 210 mm  (A5, no bleed; 2 inks)
04-head-strip                  168 x  53 mm  (flat strip + bleed, crop and fold marks)
05-inside-back-thank-you       168 x 230 mm
06-back-cover-improvit         168 x 230 mm

HOW TO GET AN EDITABLE .CDR (do NOT use the JPG files: a JPG is only a photo and can never be edited)
 0. Install the fonts first: open the fonts folder, select all 6 .ttf files, right-click > "Install for all users".
    Then close and reopen CorelDRAW.
 1. CorelDRAW > File > Open (Ctrl+O) > choose a file from the pdf folder (not Import, not the JPG).
 2. In the PDF dialog set "Import text as: TEXT" > OK.
    Every word is now editable with the Text tool (F8); colours and shapes with the Pick tool.
    If objects are grouped: Object > Group > Ungroup All (Ctrl+U).
 3. File > Save As > Save as type "CDR - CorelDRAW" > pick the version your press uses > Save.
 4. Before plates: convert colours to CMYK, black text to K100 overprint (see the job ticket).

svg folder: the same pages with text already turned into curves (looks exactly right, but words cannot be retyped).

Rebuild these files: python3 build/split-for-coreldraw.py
