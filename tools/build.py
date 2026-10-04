"""Build the IDMA Pharma site.

Each page in src/pages/ starts with a front-matter comment (title, description,
path, page) and may use {{cta}}, {{icon:NAME}} and {{wa}} placeholders. The
shared head, header and footer in src/partials/ are wrapped around every page.

Run from the repo root:  python3 tools/build.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

ICONS = {
    "tablets": '<circle cx="24" cy="24" r="15" fill="#ffe0e1"/><circle cx="24" cy="24" r="15" fill="none" stroke="#c8102e" stroke-width="2.5"/><path d="M13 24h22" stroke="#c8102e" stroke-width="2.5" stroke-linecap="round"/>',
    "capsules": '<g transform="rotate(-40 24 24)"><path d="M24 14h-7a10 10 0 0 0 0 20h7z" fill="#c8102e"/><path d="M24 14h7a10 10 0 0 1 0 20h-7z" fill="#ffe0e1" stroke="#c8102e" stroke-width="2.5"/></g>',
    "syrups": '<rect x="19" y="6" width="10" height="6" rx="1.5" fill="#c8102e"/><path d="M17 14h14v4l3 4v18a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V22l3-4z" fill="#ffe0e1" stroke="#c8102e" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 30h20v10a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z" fill="#f07c13" opacity=".85"/>',
    "creams": '<path d="M12 14h24l-3 24a4 4 0 0 1-4 3.5H19A4 4 0 0 1 15 38z" fill="#ffe0e1" stroke="#c8102e" stroke-width="2.5" stroke-linejoin="round"/><rect x="18" y="6" width="12" height="8" rx="2" fill="#c8102e"/>',
    "nutrition": '<path d="M14 12h20l-2 28a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3z" fill="#ffe0e1" stroke="#c8102e" stroke-width="2.5" stroke-linejoin="round"/><rect x="12" y="7" width="24" height="6" rx="2" fill="#c8102e"/><path d="M26 19l-5 8h6l-5 8" fill="none" stroke="#f07c13" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
}

# Stroke icons (24x24, currentColor)
LINE = {
    "flask": '<path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21.5h11.6a2 2 0 0 0 1.7-3L14 9V3"/><path d="M7 15h10"/>',
    "box": '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    "file": '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M9 14l2 2 4-4"/>',
    "test": '<path d="M9 3v13a3 3 0 0 0 6 0V3M8 3h8M9 10h6"/>',
    "truck": '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    "star": '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    "bulb": '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
    "check": '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    "growth": '<path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/>',
    "heart": '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
    "chat": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    "tag": '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
}

WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 12.05 0Zm0 21.785a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 5.45 0 9.884 4.434 9.881 9.892-.003 5.45-4.437 9.884-9.889 9.884Zm5.422-7.403c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z"/></svg>'

ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

CTA = f'''    <section class="cta-band">
      <div class="container cta-band__inner">
        <div>
          <h2 class="cta-band__title">Partner with IDMA Pharma</h2>
          <p class="cta-band__text">Distributors, stockists and healthcare professionals: get availability and rates in one message.</p>
        </div>
        <div class="cta-band__actions">
          <a class="btn btn--white btn--lg" href="https://wa.me/916387878493?text=Hello%20IDMA%20Pharma" target="_blank" rel="noopener"><span class="btn__wa">{WA}</span>Chat on WhatsApp</a>
          <a class="btn btn--ghost btn--lg" href="/contact/">Contact us {ARROW}</a>
        </div>
      </div>
    </section>
'''


def icon(name):
    if name in ICONS:
        return f'<svg viewBox="0 0 48 48" aria-hidden="true">{ICONS[name]}</svg>'
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{LINE[name]}</svg>')


def render(text):
    text = text.replace("{{cta}}", CTA).replace("{{wa}}", WA).replace("{{arrow}}", ARROW)
    return re.sub(r"\{\{icon:(\w+)\}\}", lambda m: icon(m.group(1)), text)


def build():
    head = (SRC / "partials/head.html").read_text()
    header = (SRC / "partials/header.html").read_text()
    footer = (SRC / "partials/footer.html").read_text()

    for page in sorted((SRC / "pages").glob("*.html")):
        raw = page.read_text()
        meta_block, body = re.match(r"\s*<!--(.*?)-->\n(.*)", raw, re.S).groups()
        meta = dict(re.findall(r"^\s*(\w+):\s*(.+?)\s*$", meta_block, re.M))

        nav = header.replace(f'data-page="{meta["page"]}"', f'data-page="{meta["page"]}" aria-current="page"')
        html = (head.replace("{{title}}", meta["title"])
                    .replace("{{description}}", meta["description"])
                    .replace("{{path}}", meta["path"])
                + '<body data-page="' + meta["page"] + '">\n\n'
                + nav + '  <main id="main">\n' + render(body) + '  </main>\n\n'
                + render(footer) + "</body>\n</html>\n")

        out = ROOT / meta["path"].strip("/") / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html)
        print("built", out.relative_to(ROOT))


if __name__ == "__main__":
    build()
