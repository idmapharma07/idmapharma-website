"""Build head-strip-4.5x7.html (strip for the 4.5 x 7 in pad) from head-strip.html.

usage: python3 build/make-strip-4.5x7.py   then: node build/strip.js <tmp-dir> 4.5x7
Strip 114.3 mm wide; front flap 12 mm (on the leaves' top margin, perforation at 14 mm), spine 11, back flap 12.
"""
import os
here = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
s = open(os.path.join(here, 'head-strip.html'), encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a, s.count(a))
    s = s.replace(a, b)

W = 114.3
rep('<title>IDMA Rx Pad Strip</title>', '<title>IDMA Rx Pad Strip 4.5x7</title>')
rep('  .panel { position: relative; width: 148mm; overflow: hidden; }\n  .panel.front { height: 10mm; }',
    '  .panel { position: relative; width: 114.3mm; overflow: hidden; }\n  .panel.front { height: 12mm; }')
rep('#mock { position: relative; width: 148mm; height: 105mm; overflow: hidden; background: #fff url(5-prescription-leaf.png) top center / 148mm auto no-repeat;',
    '#mock { position: relative; width: 114.3mm; height: 90mm; overflow: hidden; background: #fff url(4.5x7/5-prescription-leaf.png) top center / 114.3mm auto no-repeat;')
rep('#mock::before { content: ""; position: absolute; left: 0; right: 0; top: 12mm;', '#mock::before { content: ""; position: absolute; left: 0; right: 0; top: 14mm;')
rep('#mock::after { content: ""; position: absolute; left: 0; right: 0; top: 10mm;', '#mock::after { content: ""; position: absolute; left: 0; right: 0; top: 12mm;')
rep('#flat { position: relative; width: 154mm; height: 39mm;', '#flat { position: relative; width: 120.3mm; height: 41mm;')
rep('#flat .slot { position: absolute; left: 3mm; width: 148mm; }', '#flat .slot { position: absolute; left: 3mm; width: 114.3mm; }')
rep('#flat .slot.front { top: 26mm; height: 10mm; }', '#flat .slot.front { top: 26mm; height: 12mm; }')
rep('#press { position: relative; width: 168mm; height: 53mm;', '#press { position: relative; width: 134.3mm; height: 55mm;')
rep('#press .marks { position: absolute; inset: 0; width: 168mm; height: 53mm; }', '#press .marks { position: absolute; inset: 0; width: 134.3mm; height: 55mm; }')
rep('#press .slug { position: absolute; left: 13mm; width: 141mm; top: 1.3mm; font-size: 5pt; line-height: 1.3;',
    '#press .slug { position: absolute; left: 13mm; width: 108mm; top: .8mm; font-size: 4.5pt; line-height: 1.2;')
rep('  @page { size: 168mm 53mm; margin: 0; }', '  @page { size: 134.3mm 55mm; margin: 0; }\n  #pad3d { display: none !important; }')

# marks: trim 114.3 x 35 at (10,10) on a 134.3 x 55 sheet; folds at 22 and 33
L, SW, SH, r, b = 7, 134.3, 55, 124.3, 45
lines = [(0, 10, L, 10), (SW - L, 10, SW, 10), (0, b, L, b), (SW - L, b, SW, b), (10, 0, 10, L), (r, 0, r, L), (10, SH - L, 10, SH), (r, SH - L, r, SH)]
marks = ''.join(f'<line x1="{x1:g}" y1="{y1:g}" x2="{x2:g}" y2="{y2:g}"/>' for x1, y1, x2, y2 in lines)
folds = ''.join(f'<line x1="0" y1="{y}" x2="{L - 1}" y2="{y}"/><line x1="{SW - L + 1:g}" y1="{y}" x2="{SW:g}" y2="{y}"/>' for y in (22, 33))
a = s.index('<svg class="marks"'); e = s.index('</svg>', a) + 6
s = s[:a] + f'<svg class="marks" viewBox="0 0 {SW:g} {SH}" aria-hidden="true"><g stroke="#000" stroke-width=".1">{marks}</g><g stroke="#000" stroke-width=".1" stroke-dasharray=".8 .5">{folds}</g></svg>' + s[e:]
a = s.index('<p class="slug">'); e = s.index('</p>', a) + 4
s = s[:a] + ('<p class="slug">IDMA Pharma Rx pad 4.5 &times; 7 in &middot; HEAD STRIP &middot; 4C &middot; trim 114.3 &times; 35 mm flat (back 12 / spine 11 / front 12) &middot; bleed 3 mm &middot; fold at dashed marks<br>'
             'Front flap above the leaves&rsquo; 14 mm perforation &middot; cover hinges at the head &middot; match spine to the block &middot; <b>CHECK COMPOSITIONS AGAINST LABELS</b></p>') + s[e:]
rep('<p class="plab" style="top:36.6mm">FRONT</p>', '<p class="plab" style="top:37.6mm">FRONT</p>')
rep('<p class="lab">Front flap &middot; 148 &times; 10 mm &middot; above every prescription</p>', '<p class="lab">Front flap &middot; 114.3 &times; 12 mm &middot; above every prescription</p>')
rep('<p class="lab">Spine &middot; 148 &times; 11 mm &middot; the head edge</p>', '<p class="lab">Spine &middot; 114.3 &times; 11 mm &middot; the head edge</p>')
rep('<p class="lab">Back flap &middot; 148 &times; 12 mm &middot; on top of the back cover</p>', '<p class="lab">Back flap &middot; 114.3 &times; 12 mm &middot; on top of the back cover</p>')

# front flap: generic names on two lines; back flap carries the same block
rep('<span class="comp">Iron + Cyanocobalamin + Pyridoxine + Folic Acid + Zinc</span>', '<span class="comp">Iron + Cyanocobalamin +<br>Pyridoxine + Folic Acid + Zinc</span>')
rep('<span class="comp">Miconazole + Fluocinolone + Neomycin</span>', '<span class="comp">Miconazole +<br>Fluocinolone + Neomycin</span>')
rep('<span class="comp">Esomeprazole + Domperidone (SR)</span>', '<span class="comp">Esomeprazole 40 mg +<br>Domperidone 30 mg (SR)</span>')
a = s.index('<template id="t-front">'); e = s.index('</template>', a)
front_inner = s[a + len('<template id="t-front">'):e]
a = s.index('<template id="t-back">'); e = s.index('</template>', a)
s = s[:a + len('<template id="t-back">')] + front_inner + s[e:]

css = '''
  /* ---- 4.5 x 7 in strip (114.3 mm): front and back flaps 12 mm, generic names on two lines ---- */
  .front .band, .back .band { top: 5.2mm; }
  .front .segs, .back .segs { position: absolute; left: 5.2mm; right: 5.2mm; top: 0; bottom: 0; display: grid; grid-template-columns: max-content 1fr max-content 1fr max-content; }
  .front .dv, .back .dv { justify-self: center; width: .35mm; margin: 1.8mm 0 1.7mm; background: var(--orange); border-radius: .2mm; }
  .front .seg, .back .seg { display: flex; flex-direction: column; align-items: flex-start; }
  .front .nm, .back .nm { margin-top: 1.25mm; height: 3.7mm; display: flex; align-items: center; gap: 1.1mm; }
  .front .brand, .back .brand { font-size: 10.5pt; }
  .front .ic, .back .ic { width: 3.8mm; height: 3.8mm; }
  .front .seg .comp, .back .seg .comp { margin-top: .95mm; line-height: 1.13; }
  .spine .names { left: 5.2mm; right: 5.2mm; }
  .spine .logo { height: 5.4mm; }
  .spine .list { gap: 2mm; }
  .spine .list b { font-size: 10.5pt; }
  .spine .list i { width: 1.1mm; height: 1.1mm; }
'''
rep('</style>\n</head>', css + '</style>\n</head>')
s = s.replace('  Build: node build/strip.js <tmp-dir>', '  GENERATED by build/make-strip-4.5x7.py from head-strip.html: do not edit.\n  Build: node build/strip.js <tmp-dir> 4.5x7', 1)
open(os.path.join(here, 'head-strip-4.5x7.html'), 'w', encoding='utf-8').write(s)
print('wrote head-strip-4.5x7.html')
