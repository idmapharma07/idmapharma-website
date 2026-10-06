// Label content for each carton. Text is copied from the approved artwork;
// changes from the originals are listed in packaging/README.md.
//
// Sizes are the carton's outer dimensions in mm: W (front width),
// H (front height), D (depth: the strips and end flaps).
// Colour keys: p = primary field colour, pDark/pLight = its gradient ends,
// a1/a2 = the two accent stripes along the swoosh, ribbon = silk lines.

const ZYCONE_BY = 'Zycone Healthcare, 1185/A-3, Santej, Dist. Gandhinagar-382721, Gujarat, INDIA.';
const ZYCONE_AT = '1185/A, Santej, Dist. Gandhinagar-382721, Gujarat, INDIA.';
const ZYCONE_LIC = 'G/25-A/4258-A';

const SCHEDULE_H = {
  title: 'SCHEDULE H PRESCRIPTION DRUG',
  lines: ['CAUTION: Not to be sold by retail without the prescription of a Registered Medical Practitioner.'],
};

module.exports = [
  {
    slug: 'idcefpo-200-dt',
    W: 121, H: 62, D: 10,
    brand: [['IDCEFPO-200 DT', 'p']],
    pill: 'outline', pillBorder: 'p',
    generic: 'Cefpodoxime Dispersible Tablets 200 mg.',
    pack: '10 x 10 Tablets',
    colors: { p: '#5B2D84', pDark: '#3D1A5E', pLight: '#7B44AC', a1: '#C5D400', a2: '#8C8C8C', ribbon: '#FFFFFF' },
    comp: {
      head: 'Each uncoated dispersible tablet contains:',
      rows: [['Cefpodoxime Proxetil I.P.', ''], ['eq. to Cefpodoxime', '200 mg.', 1], ['Excipients', 'Q.S.']],
      notes: [],
    },
    info: [
      ['Dose', 'As directed by the physician.'],
      ['Storage', 'Store below 25°C, in a cool, dry & dark place.'],
      ['Direction for use', 'Disperse the tablet in a teaspoonful of boiled & cooled water before administration.'],
    ],
    schedule: {
      title: 'SCHEDULE H1 PRESCRIPTION DRUG – CAUTION',
      lines: [
        '– It is dangerous to take this preparation except in accordance with the medical advice.',
        '– Not to be sold by retail without the prescription of a Registered Medical Practitioner.',
      ],
    },
    after: ['Keep medicine out of reach of children.'],
    mfgBy: 'India Life Bio Science, B.No: 1185/A-1, Santej, Dist: Gandhinagar 382721.',
    mfgAt: 'B.No: 1185/A, Santej, Dist: Gandhinagar 382721.',
    lic: 'G/28-A/4298-A',
  },
  {
    slug: 'idflox-oz',
    W: 80, H: 60, D: 10,
    brand: [['IDFLOX', 'navy'], ['-OZ', 'red']],
    pill: 'outline', pillBorder: 'magenta',
    generic: 'Ofloxacin & Ornidazole Tablets',
    pack: '10 x 10 Tablets',
    colors: { p: '#6F92CA', pDark: '#3F5FA5', pLight: '#94B2E0', a1: '#E4007C', a2: '#2E3192', ribbon: '#FFFFFF', navy: '#2E3192', red: '#E52521', magenta: '#E4007C' },
    comp: {
      head: 'Each film coated tablet contains:',
      rows: [['Ofloxacin I.P.', '200 mg.'], ['Ornidazole', '500 mg.'], ['Excipients', 'Q.S.']],
      notes: ['Colour: Erythrosine'],
    },
    info: [
      ['Dosage', 'As directed by the Physician.'],
      ['Storage', 'Store in a cool and dry place, away from light.'],
    ],
    schedule: SCHEDULE_H,
    after: [],
    mfgBy: ZYCONE_BY,
    mfgAt: ZYCONE_AT,
    lic: ZYCONE_LIC,
  },
  {
    slug: 'livoid-m',
    W: 86, H: 40, D: 10,
    brand: [['LIVOID-M', 'white']],
    pill: 'solid', pillBorder: 'a1', italic: true,
    generic: 'Levocetirizine Hydrochloride & Montelukast Tablets I.P.',
    pack: '10 x 10 Tablets',
    colors: { p: '#22A33F', pDark: '#13782B', pLight: '#45C25E', a1: '#E6E000', a2: '#9ACD32', ribbon: '#E6E000', white: '#FFFFFF' },
    comp: {
      head: 'Each film coated tablet contains:',
      rows: [['Levocetirizine Hydrochloride I.P.', '5 mg.'], ['Montelukast Sodium I.P.', ''], ['eq. to Montelukast', '10 mg.', 1], ['Excipients', 'Q.S.']],
      notes: ['Colour: Iron Oxide Red and Titanium Dioxide I.P.'],
    },
    info: [
      ['Dosage', 'As directed by the physician.'],
      ['Storage', 'Store in a cool dry place, protected from light.'],
    ],
    schedule: SCHEDULE_H,
    after: ['Keep the medicine out of reach of children.'],
    mfgBy: ZYCONE_BY,
    mfgAt: ZYCONE_AT,
    lic: ZYCONE_LIC,
  },
  {
    slug: 'ridam-dsr',
    W: 127, H: 75, D: 10,
    brand: [['RIDAM', 'navy'], ['-DSR', 'red']],
    pill: 'outline', pillBorder: 'magenta',
    generic: 'Enteric Coated Rabeprazole Sodium & Domperidone (SR) Capsules',
    pack: '10 x 10 Capsules',
    colors: { p: '#E2202A', pDark: '#A9111A', pLight: '#F2524A', a1: '#E5007E', a2: '#2D2E83', ribbon: '#FFFFFF', navy: '#2D2E83', red: '#E2202A', magenta: '#E5007E' },
    comp: {
      head: 'Each hard gelatin capsule contains:',
      rows: [['Rabeprazole Sodium I.P.', '20 mg.'], ['(As enteric coated pellets)', '', 1], ['Domperidone I.P.', '30 mg.'], ['(As sustained release pellets)', '', 1], ['Excipients', 'Q.S.']],
      notes: ['Approved colours used in hard gelatin capsule shells.'],
    },
    info: [
      ['Dosage', 'As directed by the Physician.'],
      ['Storage', 'Keep in a cool and dry place, protected from sunlight.'],
    ],
    schedule: SCHEDULE_H,
    after: ['Capsule should be swallowed whole and not opened, chewed or crushed.'],
    mfgBy: ZYCONE_BY,
    mfgAt: ZYCONE_AT,
    lic: ZYCONE_LIC,
  },
  {
    slug: 'womi-md',
    W: 86, H: 40, D: 10,
    brand: [['WOMI-MD', 'p']],
    pill: 'outline', pillBorder: 'p',
    generic: 'Ondansetron Orally Disintegrating Tablets I.P.',
    pack: '10 x 10 Tablets',
    motif: 'diamonds',
    colors: { p: '#6A3D99', pDark: '#4A2774', pLight: '#8A5BBE', a1: '#FFC20E', a2: '#F7941D', ribbon: '#FFC20E', orchid: '#C455B5' },
    comp: {
      head: 'Each uncoated tablet contains:',
      rows: [['Ondansetron Hydrochloride I.P.', ''], ['eq. to Ondansetron', '4 mg.', 1], ['Excipients', 'Q.S.']],
      notes: [],
    },
    info: [
      ['Dosage', 'As directed by the Physician.'],
      ['Storage', 'Store in a cool & dry place, protect from light.'],
    ],
    schedule: SCHEDULE_H,
    after: ['Keep medicine out of reach of children.'],
    mfgBy: ZYCONE_BY,
    mfgAt: ZYCONE_AT,
    lic: ZYCONE_LIC,
  },
];
