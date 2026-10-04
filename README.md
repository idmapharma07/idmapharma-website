# IDMA Pharma website

Source for [www.idmapharma.com](https://www.idmapharma.com), hosted on GitHub Pages.

## Pages

| URL | Source |
|---|---|
| `/` | `src/pages/home.html` |
| `/what-we-do/` | `src/pages/what-we-do.html` |
| `/product-range/` | `src/pages/product-range.html` |
| `/mission-values/` | `src/pages/mission-values.html` |
| `/contact/` | `src/pages/contact.html` |

The shared `<head>`, header and footer live in `src/partials/`.

## Editing

Edit files in `src/`, then rebuild the pages:

```
python3 tools/build.py
```

This regenerates `index.html` and each page's `*/index.html`. Commit both the
`src/` change and the regenerated HTML. Changes pushed to `main` go live in
about a minute.

Styles: `assets/css/styles.css` (brand colours and fonts at the top).
Product photos: `assets/img/products/` (1200×900, used on the site) and
`assets/img/products/hd/` (2000×1500 originals on a plain white background).
Scripts: `assets/js/main.js`.
