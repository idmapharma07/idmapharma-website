IDMA Pharma Rx pad 4.5 x 7 in - one file per page, for CorelDRAW
================================================================

pdf/    vector PDF, one page each, with real fonts: opens in CorelDRAW with editable text
svg/    the same pages, text as curves
fonts/  Plus Jakarta Sans (the font of the design): install before opening

01-front-cover                 134.3 x 197.8 mm  (4.5 x 7 in = 114.3 x 177.8 mm trim + 3 mm bleed + crop marks)
02-inside-front-product-list   134.3 x 197.8 mm
03-inside-back-thank-you       134.3 x 197.8 mm
04-back-cover-improvit         134.3 x 197.8 mm
05-prescription-leaf           114.3 x 177.8 mm  (4.5 x 7 in, no bleed; 2 inks; leaves perforated 14 mm from the head)
06-head-strip                  134.3 x  55 mm    (strip 114.3 x 35 mm flat + bleed, crop and fold marks: back flap 12 / spine 11 / front flap 12)

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

Rebuild these files: python3 build/split-for-coreldraw.py 4.5x7
