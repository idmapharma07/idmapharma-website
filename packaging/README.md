# Carton artwork

Modern redesigns of five Idma Rx cartons, in the style of the new Improvit and
Mitthu-Plus boxes. Each carton keeps its original colours, and the Idma logo is
the main feature on every front.

| Carton | Size (mm) | Colours kept |
|---|---|---|
| IDCEFPO-200 DT | 121 x 62 x 10 | purple, lime, grey |
| IDFLOX-OZ | 80 x 60 x 10 | periwinkle blue, navy, magenta, red |
| LIVOID-M | 86 x 40 x 10 | green, yellow |
| RIDAM-DSR | 127 x 75 x 10 | red, navy, magenta |
| WOMI-MD | 86 x 40 x 10 | purple, yellow, orange, orchid (diamond motif) |

## Files

- `out/<carton>.pdf`: print artwork. The flat net is drawn at exact size
  (front, end flaps, top and bottom strips, back). The file is fully vector,
  with fonts embedded as TrueType and no bitmaps.
- `out/<carton>-proof.png`: proof with cut lines and the size label, for approval.
- `out/overview.png`: all five cartons side by side (not to scale with each other).
- `products.cjs`: all label text and colours. Edit text here, never in the PDFs.
- `build.cjs`: the shared design template and renderer.

Rebuild after editing `products.cjs`:

```
NODE_PATH=$(npm root -g) node packaging/build.cjs            # all cartons
NODE_PATH=$(npm root -g) node packaging/build.cjs livoid-m   # one carton
```

The build prints the final type sizes. The generic name is always set larger
than the brand name, because Rule 96 requires the proper name to be more
conspicuous than the trade name.

## Before sending to the printer

The PDFs are finished artwork on the flat net. They are not yet press-ready.
The printer's prepress team still has to:

1. Place the artwork on their own dieline, which adds the glue flap, tuck flaps and 3 mm bleed.
2. Convert RGB to CMYK. The red, purple and green may shift slightly, so check a hard proof.
3. Get sign-off from regulatory/QA on the text. See the changes listed below.

## Text changes from the original artwork

- RIDAM-DSR: "Each Hard Gelatin Capsules Contains" became "Each hard gelatin capsule contains".
- RIDAM-DSR: "not opened chew or crushed" became "not opened, chewed or crushed".
- RIDAM-DSR: "Keep in cool and dry place" became "Keep in a cool and dry place".
- IDCEFPO-200 DT: the two storage lines are merged into "Store below 25°C, in a cool, dry & dark place."
- Zycone addresses: "Gujarat, INDIA" is now on every carton, not just some.
- Composition headings are in sentence case.

## Open questions for regulatory

- **ISO 9001:2008.** That edition was withdrawn in 2018, so the certification
  line is out of date. Replace it with the current certificate (ISO 9001:2015)
  or remove it. It is left unchanged here.
- **IDCEFPO H1 box.** The heading reads "SCHEDULE H1 PRESCRIPTION DRUG –
  CAUTION". Check the exact wording Rule 97 requires for Schedule H1.
- **IDFLOX-OZ** has no "Keep out of reach of children" line. RIDAM-DSR's
  original artwork didn't have it either, and neither carton has it here.
  Nothing was added.

Note: this folder sits inside the website repo. If it is merged to `main`,
GitHub Pages will publish these files at www.idmapharma.com/packaging/.
