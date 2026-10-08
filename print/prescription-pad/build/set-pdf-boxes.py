"""Set TrimBox and BleedBox on a printer's PDF (needs: pip install pypdf).

usage: python3 set-pdf-boxes.py raw.pdf out.pdf ["Title"]
Every sheet has a 10 mm slug round the trim and 3 mm bleed, so the trim is the page inset by 10 mm:
covers 168 x 230 mm sheets (A5 trim), head strip 168 x 53 mm sheets (148 x 33 mm flat trim).
"""
import sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject

mm = 72 / 25.4
reader, writer = PdfReader(sys.argv[1]), PdfWriter()
for page in reader.pages:
    # Chrome rounds the page to whole points (168 mm -> 167.9 mm): snap to the nominal whole-mm size
    w, h = round(float(page.mediabox.width) / mm) * mm, round(float(page.mediabox.height) / mm) * mm
    page.trimbox = RectangleObject([10 * mm, 10 * mm, w - 10 * mm, h - 10 * mm])
    page.bleedbox = RectangleObject([7 * mm, 7 * mm, w - 7 * mm, h - 7 * mm])
    writer.add_page(page)
writer.add_metadata({"/Title": sys.argv[3] if len(sys.argv) > 3 else "IDMA Pharma Rx pad - print file (3 mm bleed, crop marks)"})
writer.write(sys.argv[2])
