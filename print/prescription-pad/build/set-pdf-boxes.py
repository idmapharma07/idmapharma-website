"""Set TrimBox and BleedBox on a printer's PDF (needs: pip install pypdf).

usage: python3 set-pdf-boxes.py raw.pdf out.pdf ["Title"] [WxH]
Every sheet has a 10 mm slug round the trim and 3 mm bleed. WxH is the trim size in mm
(e.g. 114.3x177.8); without it the trim is the page inset by 10 mm, rounded to whole mm
(covers 168 x 230 mm sheets -> A5 trim, head strip 168 x 53 mm sheets -> 148 x 33 mm).
Chrome rounds the page to whole points, so boxes are measured from the top-left, where it lays out.
"""
import sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject

mm = 72 / 25.4
reader, writer = PdfReader(sys.argv[1]), PdfWriter()
title = sys.argv[3] if len(sys.argv) > 3 else "IDMA Pharma Rx pad - print file (3 mm bleed, crop marks)"
size = [float(v) for v in sys.argv[4].split('x')] if len(sys.argv) > 4 else None
for page in reader.pages:
    w, h = float(page.mediabox.width), float(page.mediabox.height)
    W, H = size or (round(w / mm) - 20, round(h / mm) - 20)
    page.trimbox = RectangleObject([10 * mm, h - (10 + H) * mm, (10 + W) * mm, h - 10 * mm])
    page.bleedbox = RectangleObject([7 * mm, h - (13 + H) * mm, (13 + W) * mm, h - 7 * mm])
    writer.add_page(page)
writer.add_metadata({"/Title": title})
writer.write(sys.argv[2])
