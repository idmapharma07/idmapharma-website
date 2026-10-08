"""Set TrimBox and BleedBox on the printer's PDF (needs: pip install pypdf).

usage: python3 set-pdf-boxes.py print-raw.pdf IDMA-Rx-pad-COVERS-RGB-LAYOUT-bleed-cropmarks.pdf
Sheets are 168 x 230 mm with the A5 trim 10 mm in from each edge and 3 mm bleed.
"""
import sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject

mm = 72 / 25.4
reader, writer = PdfReader(sys.argv[1]), PdfWriter()
for page in reader.pages:
    h = float(page.mediabox.height)
    page.trimbox = RectangleObject([10 * mm, h - 220 * mm, 158 * mm, h - 10 * mm])
    page.bleedbox = RectangleObject([7 * mm, h - 223 * mm, 161 * mm, h - 7 * mm])
    writer.add_page(page)
writer.add_metadata({"/Title": "IDMA Pharma Rx pad - print file (3 mm bleed, crop marks)"})
writer.write(sys.argv[2])
