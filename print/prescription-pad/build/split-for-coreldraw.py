"""Split the vector print files into one file per page for CorelDRAW (needs: pip install pymupdf).

usage: python3 build/split-for-coreldraw.py
Writes coreldraw/pdf/NN-name.pdf (vector, single page) and coreldraw/svg/NN-name.svg (text as curves).
CorelDRAW: File > Open the PDF (or File > Import the SVG), then File > Save As > CorelDRAW (*.cdr).
"""
import os
import pymupdf

here = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
covers = 'IDMA-Rx-pad-COVERS-RGB-LAYOUT-bleed-cropmarks.pdf'
pages = [  # same order as the client's combined PDF
    ('01-front-cover', covers, 0),
    ('02-inside-front-product-list', covers, 1),
    ('03-prescription-leaf', 'IDMA-Rx-pad-LEAF-A5.pdf', 0),
    ('04-head-strip', 'IDMA-Rx-pad-HEAD-STRIP-RGB-LAYOUT-bleed-cropmarks.pdf', 0),
    ('05-inside-back-thank-you', covers, 2),
    ('06-back-cover-improvit', covers, 3),
]
out = os.path.join(here, 'coreldraw')
for sub in ('pdf', 'svg'):
    os.makedirs(os.path.join(out, sub), exist_ok=True)
for name, src, i in pages:
    doc = pymupdf.open(os.path.join(here, src))
    one = pymupdf.open()
    one.insert_pdf(doc, from_page=i, to_page=i)
    one.set_metadata({'title': 'IDMA Pharma Rx pad - ' + name[3:].replace('-', ' '), 'producer': 'IDMA Rx pad build'})
    one.save(os.path.join(out, 'pdf', name + '.pdf'), garbage=4, deflate=True)
    svg = doc[i].get_svg_image(text_as_path=True)
    with open(os.path.join(out, 'svg', name + '.svg'), 'w', encoding='utf-8') as f:
        f.write(svg)
    r = doc[i].rect
    print(f'{name}: {r.width / 72 * 25.4:.0f} x {r.height / 72 * 25.4:.0f} mm from {src} p{i + 1}')
