import { h } from "preact"
import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { QuartzComponent, QuartzComponentProps } from "./quartz/components/types"
import { resolveRelative } from "./quartz/util/path"

/**
 * DGSW-Fachsprache: Layout und eigene Komponenten.
 *
 * Gestaltung angelehnt an spiel-wissenschaft.de (Exo 2, Schwarz/Weiß, Navy, CMYK-Akzente,
 * Rauten, Page-Hero, Slim-Cards, Säulen-Infografik FÜR / ÜBER / DURCH + Fundament, dunkler Footer).
 *
 * Navigation (links):
 *   Fachsprache            -> Begriffe (Übersicht, Startseite), Alle Begriffe A-Z
 *   Redaktion & Impressum  -> Leitfaden, Mitwirken, Literatur, Impressum
 *
 * Startseite "Begriffe":
 *   PageHero, TermGraph (unverändert), RecentList, BereichGrid, TermTable, danach der Text aus index.md
 *
 * Alle Daten stammen aus dem Frontmatter:
 *   Begriffe:    id, de, en, tags (bereich/...), status, created, modified
 *   Bereiche:    bereich, untertitel, icon, beschreibung, felder, betreuung (fachgebiete/*.md)
 */

const BEREICHE: Record<string, { label: string; color: string }> = {
  "fuer-spiele": { label: "FÜR Spiele", color: "#00ccee" },
  "ueber-spiele": { label: "ÜBER Spiele", color: "#ffe600" },
  "durch-spiele": { label: "DURCH Spiele", color: "#ee00cc" },
  "mit-spielen": { label: "MIT Spielen", color: "#00dd55" },
  fundament: { label: "Fundament", color: "#9a9a9a" },
}

/** Navigation links: [Slug, Bezeichnung] */
const NAV: { title: string; items: [string, string][] }[] = [
  {
    title: "Fachsprache",
    items: [
      ["index", "Begriffe"],
      ["begriffe/index", "Alle Begriffe A-Z"],
    ],
  },
  {
    title: "Redaktion & Impressum",
    items: [
      ["redaktion/Leitfaden", "Redaktionsleitfaden"],
      ["redaktion/Mitwirken", "Mitwirken"],
      ["redaktion/Literatur", "Literatur"],
      ["redaktion/Impressum", "Impressum"],
    ],
  },
]

const DGSW = "https://www.spiel-wissenschaft.de"
const REPO = "https://github.com/stschoelzel/dgsw_fachsprache"

const asList = (v: unknown): string[] =>
  (Array.isArray(v) ? v : v ? [v] : []).map((x) => String(x).trim()).filter(Boolean)

const toDate = (v: unknown): Date | null => {
  if (!v) return null
  const d = v instanceof Date ? v : new Date(String(v))
  return isNaN(d.getTime()) ? null : d
}

const fmtDate = (d: Date) => d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })

const isTerm = (slug?: string) => !!slug && slug.startsWith("begriffe/") && slug !== "begriffe/index"
const isBereich = (slug?: string) => !!slug && slug.startsWith("fachgebiete/") && slug !== "fachgebiete/index"
const isRedaktion = (slug?: string) => !!slug && slug.startsWith("redaktion/")

const bereichKeys = (fm: Record<string, any>) =>
  asList(fm.tags)
    .filter((t) => t.startsWith("bereich/"))
    .map((t) => t.slice("bereich/".length))

/** Alle Begriffseinträge als einfache Datensätze */
function terms(allFiles: QuartzComponentProps["allFiles"]) {
  return allFiles
    .filter((f) => isTerm(f.slug))
    .map((f) => {
      const fm = (f.frontmatter ?? {}) as Record<string, any>
      const title = String(fm.title ?? f.slug)
      const de = asList(fm.de)
      const keys = bereichKeys(fm)
      const created = toDate(fm.created)
      const changed = toDate(fm.modified) ?? created
      return {
        slug: f.slug!,
        id: String(fm.id ?? ""),
        de: de.length ? de : [title],
        en: asList(fm.en),
        keys,
        bereiche: keys.map((k) => BEREICHE[k]?.label ?? k),
        status: String(fm.status ?? ""),
        // optionale Kurzbeschreibung für Listen (Frontmatter "kurz"); der Text der Infobox eignet sich nicht
        kurz: String(fm.kurz ?? ""),
        created,
        changed,
      }
    })
    .sort((a, b) => a.de[0].localeCompare(b.de[0], "de"))
}

/** Bereichsseiten aus fachgebiete/ */
function bereiche(allFiles: QuartzComponentProps["allFiles"]) {
  const order = Object.keys(BEREICHE)
  return allFiles
    .filter((f) => isBereich(f.slug))
    .map((f) => {
      const fm = (f.frontmatter ?? {}) as Record<string, any>
      const key = String(fm.bereich ?? f.slug!.split("/").pop())
      return {
        slug: f.slug!,
        key,
        label: String(fm.title ?? BEREICHE[key]?.label ?? key),
        untertitel: String(fm.untertitel ?? ""),
        icon: String(fm.icon ?? ""),
        beschreibung: String(fm.beschreibung ?? ""),
        felder: asList(fm.felder),
        betreuung: String(fm.betreuung ?? ""),
      }
    })
    .sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
}

const link = (from: string, to: string, attrs: Record<string, any>, children: any) =>
  h("a", { href: resolveRelative(from as any, to as any), class: "internal", ...attrs }, children)

const pill = (label: string, cls: string) => h("span", { class: "dg-pill " + cls }, label)

/** Bereichs-Chip, farbig wie auf spiel-wissenschaft.de */
const chip = (key: string, label: string, href?: string) =>
  href ? h("a", { href, class: "internal dg-chip dg-chip--" + key }, label) : h("span", { class: "dg-chip dg-chip--" + key }, label)

/** Überzeile + Überschrift + Link rechts, wie die Abschnittsköpfe der DGSW-Startseite */
const sectionHead = (kicker: string, title: string, more?: any) =>
  h("div", { class: "dg-section-head" }, [h("div", {}, [h("p", { class: "dg-kicker" }, kicker), h("h2", {}, title)]), more ?? null])

/* ------------------------------------------------------------------ */
/* Kopf: Marke (Rauten + DGSW)                                          */
/* ------------------------------------------------------------------ */

const Brand: QuartzComponent = ({ fileData }: QuartzComponentProps) =>
  h("a", { href: resolveRelative(fileData.slug!, "index" as any), class: "internal dg-brand" }, [
    h("span", { class: "dg-brand-mark", "aria-hidden": "true" }, [
      h("i", { class: "c" }),
      h("i", { class: "y" }),
      h("i", { class: "g" }),
      h("i", { class: "m" }),
    ]),
    h("span", { class: "dg-brand-text" }, [h("b", {}, "DGSW Fachsprache"), h("small", {}, "Begriffe der Spielwissenschaft")]),
  ])

Brand.css = `
.dg-brand { display: flex; align-items: center; gap: .7rem; background: none !important; padding: 0 !important; margin: 1.5rem 0 .25rem; color: var(--dark) !important; }
.dg-brand-mark { position: relative; width: 34px; height: 34px; flex-shrink: 0; }
.dg-brand-mark i { position: absolute; width: 14px; height: 14px; transform: rotate(45deg); border-radius: 1px; }
.dg-brand-mark .c { background: #00ccee; left: 10px; top: 0; }
.dg-brand-mark .y { background: #ffe600; left: 0; top: 10px; }
.dg-brand-mark .g { background: #00dd55; left: 20px; top: 10px; }
.dg-brand-mark .m { background: #ee00cc; left: 10px; top: 20px; }
.dg-brand-text { display: flex; flex-direction: column; line-height: 1.15; }
.dg-brand-text b { font-size: 1.15rem; font-weight: 800; letter-spacing: -.01em; }
.dg-brand-text small { font-size: .68rem; color: var(--gray); letter-spacing: .02em; }
`

/* ------------------------------------------------------------------ */
/* Navigation links: Fachsprache | Redaktion & Impressum               */
/* ------------------------------------------------------------------ */

const SideNav: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const here = fileData.slug!
  const activeOf = (slug: string) =>
    here === slug ||
    (slug === "index" && (isTerm(here) || isBereich(here) || here.startsWith("tags/"))) ||
    (slug === "begriffe/index" && here === "begriffe/index")
  return h(
    "nav",
    { class: "dg-nav", "aria-label": "Navigation" },
    NAV.map((group) =>
      h("div", { class: "dg-nav-group" }, [
        h("p", { class: "dg-nav-title" }, group.title),
        h(
          "ul",
          {},
          group.items.map(([slug, label]) =>
            h("li", {}, link(here, slug, { class: "internal dg-nav-link" + (activeOf(slug) ? " active" : "") }, label)),
          ),
        ),
      ]),
    ),
  )
}

SideNav.css = `
.dg-nav { margin: .75rem 0 0; }
.dg-nav-group { margin-bottom: 1.1rem; }
.dg-nav-title { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; color: var(--gray); margin: 0 0 .35rem; }
.dg-nav ul { list-style: none; padding: 0; margin: 0; }
.dg-nav li { margin: 0; }
.dg-nav-link { display: block; padding: .38rem .7rem; border-radius: 6px; font-size: .92rem; font-weight: 500; color: var(--darkgray) !important; background: none !important; }
.dg-nav-link::before { content: "◆"; font-size: .5em; margin-right: .55em; vertical-align: middle; }
.dg-nav li:nth-child(4n+1) .dg-nav-link::before { color: #00ccee; }
.dg-nav li:nth-child(4n+2) .dg-nav-link::before { color: #c9a000; }
.dg-nav li:nth-child(4n+3) .dg-nav-link::before { color: #00b347; }
.dg-nav li:nth-child(4n+4) .dg-nav-link::before { color: #ee00cc; }
.dg-nav-link:hover { background: var(--lightgray) !important; color: var(--dark) !important; }
.dg-nav-link.active { background: var(--dg-navy) !important; color: #fff !important; font-weight: 600; }
@media all and (max-width: 800px) {
  .left.sidebar { flex-wrap: wrap !important; }
  .dg-nav { display: flex; flex-wrap: wrap; gap: .25rem 1.25rem; width: 100%; flex-basis: 100%; order: 10; margin-top: .25rem; }
  .dg-nav-group { margin-bottom: .25rem; }
  .dg-nav ul { display: flex; flex-wrap: wrap; gap: .15rem; }
  .dg-nav-link { padding: .25rem .55rem; font-size: .85rem; }
}
`

/* ------------------------------------------------------------------ */
/* Page-Hero: dunkler Kopf mit Brotkrumen, Pill, Titel, Untertitel     */
/* ------------------------------------------------------------------ */

const STATUS_CLASS: Record<string, string> = {
  entwurf: "dg-pill--yellow",
  review: "dg-pill--cyan",
  dokumentiert: "dg-pill--green",
  arbeitsdefinition: "dg-pill--navy",
  veraltet: "dg-pill--grey",
}

const PageHero: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const slug = fileData.slug!
  const fm = (fileData.frontmatter ?? {}) as Record<string, any>
  const title = String(fm.title ?? slug.split("/").pop())
  const crumb = (to: string, label: string) => link(slug, to, {}, label)
  const sep = h("span", { class: "sep" }, "›")

  let crumbs: any[] = [h("a", { href: DGSW + "/projekte/wiki/" }, "DGSW"), sep, crumb("index", "Fachsprache")]
  let pills: any[] = []
  let subtitle: any = null
  let accent = "linear-gradient(90deg,#00ccee 0 25%,#ffe600 25% 50%,#00dd55 50% 75%,#ee00cc 75%)"

  if (slug === "index") {
    crumbs = [h("a", { href: DGSW + "/" }, "DGSW"), sep, h("a", { href: DGSW + "/projekte/" }, "Projekte"), sep, h("span", {}, "Fachsprachen-Wiki")]
    pills = [pill("Fachsprachen-Wiki", "dg-pill--magenta"), h("span", { class: "dg-hero-meta" }, "Deutsch · Englisch · analog & digital")]
    subtitle = "Wissenschaftliches Begriffslexikon der Spielwissenschaft. Ein Eintrag pro Begriff, zweisprachig, mit belegten Definitionen und Beziehungen."
  } else if (isTerm(slug)) {
    const keys = bereichKeys(fm)
    crumbs.push(sep, crumb("begriffe/index", "Begriffe"))
    pills = [
      ...keys.map((k) => pill(BEREICHE[k]?.label ?? k, "dg-pill--" + k)),
      fm.status ? pill(String(fm.status), STATUS_CLASS[String(fm.status)] ?? "dg-pill--grey") : null,
      fm.typ && String(fm.typ) !== "begriff" ? pill(String(fm.typ), "dg-pill--navy") : null,
      // Wartungsmarke nach dem Vorbild von Wikipedia ("Belege fehlen" / "citation needed")
      asList(fm.tags).includes("belege-fehlen") ? pill("Belege fehlen", "dg-pill--warn") : null,
      fm.id ? h("span", { class: "dg-hero-meta" }, "ID " + fm.id) : null,
    ]
    const en = asList(fm.en)
    subtitle = en.length ? h("span", {}, [h("span", { class: "dg-lang" }, "EN"), " " + en.join(" · ")]) : null
    if (keys[0] && BEREICHE[keys[0]]) accent = BEREICHE[keys[0]].color
  } else if (isBereich(slug)) {
    crumbs.push(sep, h("span", {}, "Bereiche"))
    const key = String(fm.bereich ?? "")
    pills = [pill("Bereich", "dg-pill--" + key)]
    subtitle = fm.untertitel ? String(fm.untertitel) : null
    if (BEREICHE[key]) accent = BEREICHE[key].color
  } else if (isRedaktion(slug)) {
    crumbs.push(sep, h("span", {}, "Redaktion & Impressum"))
    pills = [pill(slug === "redaktion/Impressum" ? "Rechtliches" : "Redaktion", "dg-pill--navy")]
    subtitle = fm.description ? String(fm.description) : null
    accent = "#1c2e4a"
  } else if (slug === "begriffe/index") {
    pills = [pill("Verzeichnis", "dg-pill--cyan")]
    subtitle = "Alle veröffentlichten Einträge, sortierbar und durchsuchbar."
  } else if (slug.startsWith("tags/")) {
    pills = [pill("Schlagwort", "dg-pill--grey")]
  }

  return h("div", { class: "dg-hero", style: `--dg-accent:${accent}` }, [
    h("div", { class: "dg-hero-deco", "aria-hidden": "true" }),
    h("p", { class: "dg-crumbs" }, crumbs),
    pills.length ? h("div", { class: "dg-hero-pills" }, pills) : null,
    h("h1", { class: "article-title" }, title),
    subtitle ? h("p", { class: "dg-hero-sub" }, subtitle) : null,
  ])
}

PageHero.css = `
.dg-hero { position: relative; overflow: hidden; background: var(--dg-surface); color: var(--dg-ink); border: 1px solid var(--dg-line); border-top: none; box-shadow: 0 2px 16px rgba(0,0,0,.06); border-radius: 0 0 10px 10px; padding: 1.6rem 1.75rem 1.5rem; margin: 1.5rem 0 1.5rem; }
.dg-hero::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 4px; background: var(--dg-accent); }
.dg-hero::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: linear-gradient(90deg,#00ccee 0 25%,#ffe600 25% 50%,#00dd55 50% 75%,#ee00cc 75%); }
.dg-hero-deco { position: absolute; width: 220px; height: 220px; right: -60px; top: -70px; background: var(--dg-accent); opacity: .09; transform: rotate(45deg); border-radius: 6px; pointer-events: none; }
.dg-crumbs { font-size: .78rem; color: var(--dg-ink-3); margin: 0 0 .7rem; }
.dg-crumbs a { color: var(--dg-link) !important; background: none !important; padding: 0 !important; font-weight: 500; }
.dg-crumbs .sep { margin: 0 .4rem; opacity: .5; }
.dg-hero-pills { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-bottom: .55rem; }
.dg-hero-meta { font-size: .8rem; color: var(--dg-ink-2); font-weight: 500; }
.dg-hero h1.article-title { color: var(--dg-ink) !important; margin: 0 0 .35rem; font-size: clamp(1.7rem, 4vw, 2.3rem); line-height: 1.15; }
.dg-hero-sub { color: var(--dg-ink-2) !important; margin: 0; font-size: .98rem; line-height: 1.6; max-width: 640px; }
.dg-lang { font-size: .68rem; font-weight: 800; letter-spacing: .1em; padding: .1rem .4rem; border: 1px solid var(--dg-ink-3); border-radius: 4px; margin-right: .2rem; vertical-align: 1px; }
`

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Graph: nur Begriffe                                                  */
/* ------------------------------------------------------------------ */

const TermGraph: QuartzComponent = () => {
  const legend = Object.values(BEREICHE).map((b) =>
    h("span", { class: "term-graph-key" }, [
      h("span", { class: "term-graph-dot", style: `background:${b.color}` }),
      b.label,
    ]),
  )
  return h("div", { class: "term-graph", "aria-label": "Graph der Begriffe" }, [
    h("div", { class: "term-graph-legend" }, legend),
  ])
}

TermGraph.css = `
.term-graph { border: 1px solid var(--lightgray); border-radius: 8px; margin: 1.25rem 0; padding: 0.5rem; }
.term-graph svg { width: 100%; height: auto; display: block; touch-action: none; }
.term-graph-legend { display: flex; flex-wrap: wrap; gap: 0.25rem 1rem; font-size: 0.8rem; color: var(--darkgray); padding: 0.25rem 0.5rem 0.5rem; }
.term-graph-dot { display: inline-block; width: 0.7rem; height: 0.7rem; border-radius: 50%; margin-right: 0.35rem; border: 1px solid var(--darkgray); vertical-align: -1px; }
.term-graph text { font-size: 11px; fill: var(--darkgray); pointer-events: none; }
.term-graph .tg-node { cursor: pointer; }
.term-graph .tg-node circle { stroke: var(--dark); stroke-width: 1; }
.term-graph .tg-link { stroke: var(--gray); stroke-width: 1; }
.term-graph .tg-dim { opacity: 0.2; }
`

TermGraph.afterDOMLoaded = `
document.addEventListener("nav", async () => {
  const hosts = document.querySelectorAll(".term-graph")
  if (!hosts.length) return
  let idx
  try { idx = await fetchData } catch (e) { return }
  const colors = { "bereich/fuer-spiele": "#00ccee", "bereich/ueber-spiele": "#ffe600", "bereich/durch-spiele": "#ee00cc", "bereich/mit-spielen": "#00dd55" }
  const entries = Object.entries(idx).filter(([k]) => k.indexOf("begriffe/") === 0 && k !== "begriffe/index")
  hosts.forEach((host) => {
    if (host.dataset.ready) return
    host.dataset.ready = "1"
    if (!entries.length) { host.style.display = "none"; return }
    const NS = "http://www.w3.org/2000/svg", W = 900, H = 460
    const el = (name, attrs) => { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); return e }
    const nodes = entries.map(([slug, d], i) => {
      const a = (i / entries.length) * 2 * Math.PI
      const tag = (d.tags || []).find((t) => colors[t])
      return { slug, title: d.title, color: tag ? colors[tag] : "#9a9a9a", x: W / 2 + Math.cos(a) * 140, y: H / 2 + Math.sin(a) * 140, vx: 0, vy: 0, deg: 0, fixed: false }
    })
    const byId = new Map(nodes.map((n) => [n.slug, n]))
    const links = [], seen = new Set()
    entries.forEach(([slug, d]) => (d.links || []).forEach((t) => {
      const key = [slug, t].sort().join("|")
      if (byId.has(t) && t !== slug && !seen.has(key)) { seen.add(key); links.push({ s: byId.get(slug), t: byId.get(t) }) }
    }))
    links.forEach((l) => { l.s.deg++; l.t.deg++ })

    const svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img" })
    const gl = el("g", {}), gn = el("g", {})
    svg.append(gl, gn)
    links.forEach((l) => { l.el = el("line", { class: "tg-link" }); gl.append(l.el) })
    nodes.forEach((n) => {
      n.r = Math.min(16, 6 + n.deg * 2)
      n.g = el("g", { class: "tg-node", tabindex: "0" })
      n.c = el("circle", { r: n.r, fill: n.color })
      n.t = el("text", { "text-anchor": "middle" })
      n.t.textContent = n.title
      n.g.append(n.c, n.t)
      gn.append(n.g)
    })
    host.insertBefore(svg, host.firstChild)

    const go = (slug) => {
      const depth = (document.body.dataset.slug || "index").split("/").length - 1
      const href = (depth ? "../".repeat(depth) : "./") + slug
      if (window.spaNavigate) window.spaNavigate(new URL(href, location.href)); else location.href = href
    }
    const neighbors = (n) => { const s = new Set([n]); links.forEach((l) => { if (l.s === n) s.add(l.t); if (l.t === n) s.add(l.s) }); return s }

    const draw = () => {
      links.forEach((l) => { l.el.setAttribute("x1", l.s.x); l.el.setAttribute("y1", l.s.y); l.el.setAttribute("x2", l.t.x); l.el.setAttribute("y2", l.t.y) })
      nodes.forEach((n) => { n.g.setAttribute("transform", "translate(" + n.x + "," + n.y + ")"); n.t.setAttribute("y", n.r + 12) })
    }
    let alpha = 1
    const step = () => {
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j]
        let dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy
        if (d2 < 0.01) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 0.5 }
        const d = Math.sqrt(d2), f = Math.min(40, (2600 / d2)) * alpha, fx = (dx / d) * f, fy = (dy / d) * f
        a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy
      }
      links.forEach((l) => {
        const dx = l.t.x - l.s.x, dy = l.t.y - l.s.y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = (d - 90) * 0.05 * alpha
        l.s.vx += (dx / d) * f; l.s.vy += (dy / d) * f; l.t.vx -= (dx / d) * f; l.t.vy -= (dy / d) * f
      })
      nodes.forEach((n) => {
        n.vx += (W / 2 - n.x) * 0.012 * alpha; n.vy += (H / 2 - n.y) * 0.012 * alpha
        if (n.fixed) { n.vx = 0; n.vy = 0; return }
        n.vx *= 0.6; n.vy *= 0.6
        n.x = Math.max(30, Math.min(W - 30, n.x + n.vx)); n.y = Math.max(20, Math.min(H - 30, n.y + n.vy))
      })
      alpha *= 0.985
    }
    let running = false
    const run = () => {
      if (running) return
      running = true
      const frame = () => {
        if (!host.isConnected) { running = false; return }
        step(); step(); draw()
        if (alpha > 0.02) requestAnimationFrame(frame); else running = false
      }
      requestAnimationFrame(frame)
    }
    for (let i = 0; i < 150; i++) step()
    alpha = 0.3; draw(); run()

    // Hover, Klick, Ziehen
    const pt = (e) => { const r = svg.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H } }
    nodes.forEach((n) => {
      let down = null
      n.g.addEventListener("mouseenter", () => {
        const nb = neighbors(n)
        nodes.forEach((m) => m.g.classList.toggle("tg-dim", !nb.has(m)))
        links.forEach((l) => l.el.classList.toggle("tg-dim", l.s !== n && l.t !== n))
      })
      n.g.addEventListener("mouseleave", () => {
        nodes.forEach((m) => m.g.classList.remove("tg-dim")); links.forEach((l) => l.el.classList.remove("tg-dim"))
      })
      n.g.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY, moved: false }; n.fixed = true; n.g.setPointerCapture(e.pointerId) })
      n.g.addEventListener("pointermove", (e) => {
        if (!down) return
        if (Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 4) down.moved = true
        if (down.moved) { const p = pt(e); n.x = p.x; n.y = p.y; alpha = Math.max(alpha, 0.2); draw(); run() }
      })
      n.g.addEventListener("pointerup", () => { const wasClick = down && !down.moved; down = null; n.fixed = false; if (wasClick) go(n.slug) })
      n.g.addEventListener("keydown", (e) => { if (e.key === "Enter") go(n.slug) })
    })
  })
})
`

/* ------------------------------------------------------------------ */
/* Infobox "Eintrag" und Wartungskasten "Belege fehlen" (aus dem Frontmatter) */
/* ------------------------------------------------------------------ */

/** Status, bei denen ein Eintrag als veröffentlicht gilt: die Infobox wird dann ausgegraut */
const PUBLISHED_STATUS = ["dokumentiert", "arbeitsdefinition"]

const TermInfo: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const fm = (fileData.frontmatter ?? {}) as Record<string, any>
  const here = fileData.slug!
  const status = String(fm.status ?? "")
  const keys = bereichKeys(fm)
  const betreuung = String(fm.betreuung ?? "").trim()
  const sep = h("span", { class: "sep" }, " · ")
  // Oberbegriff steht im Frontmatter als "[[Name]]"; wenn es den Eintrag gibt, wird er verlinkt
  const oberRaw = String(fm.oberbegriff ?? "").trim()
  const oberName = (oberRaw.match(/^\[\[([^\]|#]+)/)?.[1] ?? oberRaw).trim()
  const oberFile = oberName
    ? allFiles.find(
        (f) =>
          isTerm(f.slug) &&
          (String(f.frontmatter?.title ?? "") === oberName || asList((f.frontmatter ?? {}).aliases).includes(oberName)),
      )
    : undefined
  const wikidata = String(fm.wikidata ?? "").trim()
  const info = h("div", { class: "dg-info" + (PUBLISHED_STATUS.includes(status) ? " dg-info--published" : "") }, [
    h("p", { class: "dg-info-title" }, "Eintrag"),
    h("p", { class: "dg-info-body" }, [
      h("b", {}, "Status: "), status || "offen",
      sep, h("b", {}, "Bereich: "),
      keys.length ? keys.map((k, i) => [i ? ", " : "", link(here, "fachgebiete/" + k, {}, BEREICHE[k]?.label ?? k)]) : "offen",
      sep, h("b", {}, "Betreuung: "), betreuung || "offen",
      sep, h("b", {}, "Typ: "), String(fm.typ ?? "begriff"),
      sep, h("b", {}, "Oberbegriff: "),
      oberName ? (oberFile ? link(here, oberFile.slug!, {}, oberName) : oberName) : "offen",
      /^Q\d+$/.test(wikidata)
        ? [sep, h("b", {}, "Wikidata: "), h("a", { href: "https://www.wikidata.org/wiki/" + wikidata, class: "external" }, wikidata)]
        : null,
    ]),
  ])
  const warn = asList(fm.tags).includes("belege-fehlen")
    ? h("div", { class: "dg-warn" }, [
        h("p", { class: "dg-info-title" }, "⚑ Belege fehlen"),
        h("p", { class: "dg-info-body" }, [
          "Definition und Erläuterung sind nicht belegt. Bitte Quellen mit Seitenangabe ergänzen und danach das Schlagwort ",
          h("code", {}, "belege-fehlen"),
          " entfernen (siehe ",
          link(here, "redaktion/Leitfaden", {}, "Belegpflicht"),
          ").",
        ]),
      ])
    : null
  return h("div", { class: "dg-term-info" }, [info, warn])
}

TermInfo.css = `
.dg-term-info { display: flex; flex-direction: column; gap: .75rem; margin: 0 0 1.5rem; }
.dg-info, .dg-warn { border: 1px solid var(--lightgray); border-left: 4px solid var(--dg-navy); border-radius: 6px; background: var(--dg-card); padding: .75rem 1rem; box-shadow: 0 2px 12px rgba(0,0,0,.05); }
.dg-info-title { margin: 0 0 .3rem !important; font-weight: 700; font-size: .85rem; color: var(--dg-navy-text); }
.dg-info-body { margin: 0 !important; font-size: .92rem; }
.dg-info .sep { color: var(--gray); }
.dg-info--published { opacity: .55; filter: grayscale(1); box-shadow: none; }
.dg-warn { border-left-color: #ee00cc; background: rgba(238,0,204,.05); }
.dg-warn .dg-info-title { color: var(--dg-magenta-text); }
`

/* ------------------------------------------------------------------ */
/* Abschnittsköpfe für die Startseite                                   */
/* ------------------------------------------------------------------ */

const SectionHead = (kicker: string, title: string, more?: [string, string]): QuartzComponent => {
  const C: QuartzComponent = ({ fileData }: QuartzComponentProps) =>
    sectionHead(kicker, title, more ? link(fileData.slug!, more[0], { class: "internal dg-more" }, more[1]) : null)
  return C
}

const SharedCss: QuartzComponent = () => null
SharedCss.css = `
.dg-section-head { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: .5rem; margin: 2.5rem 0 1rem; padding-top: 1.5rem; border-top: 1px solid var(--lightgray); }
.dg-section-head h2 { margin: 0 !important; font-size: 1.6rem; }
.dg-section-head h2::before { display: none !important; }
.dg-kicker { margin: 0 0 .15rem !important; font-size: .78rem; font-weight: 600; color: var(--gray); letter-spacing: .02em; }
.dg-more { font-size: .82rem; font-weight: 700; color: var(--dg-navy-text) !important; background: none !important; padding: 0 !important; white-space: nowrap; }
.dg-more:hover { color: var(--tertiary) !important; }
.dg-pill { display: inline-block; font-size: .66rem; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; padding: .22rem .65rem; border-radius: 4px; line-height: 1.4; color: #0a0a0a; background: #e0e0e0; }
.dg-pill--magenta, .dg-pill--durch-spiele { background: #ee00cc; color: #fff; }
.dg-pill--cyan, .dg-pill--fuer-spiele { background: #00ccee; }
.dg-pill--yellow, .dg-pill--ueber-spiele { background: #ffe600; }
.dg-pill--green, .dg-pill--mit-spielen { background: #00dd55; }
.dg-pill--navy { background: #1c2e4a; color: #fff; box-shadow: inset 0 0 0 1px rgba(255,255,255,.25); }
.dg-pill--grey, .dg-pill--fundament { background: #6b6b6b; color: #fff; }
.dg-pill--warn { background: transparent; color: var(--dg-magenta-text); box-shadow: inset 0 0 0 1.5px #ee00cc; }
.dg-pill--warn::before { content: "⚑ "; }
.dg-chip { display: inline-block; font-size: .74rem; padding: .2rem .6rem; border-radius: 20px; font-weight: 600; line-height: 1.4; background: var(--lightgray); color: var(--darkgray); border: 1px solid transparent; }
a.dg-chip { text-decoration: none; }
.dg-chip--fuer-spiele { background: rgba(0,180,216,.12) !important; color: var(--dg-cyan-text) !important; border-color: rgba(0,180,216,.3); }
.dg-chip--ueber-spiele { background: rgba(255,230,0,.18) !important; color: var(--dg-yellow-text) !important; border-color: rgba(200,170,0,.35); }
.dg-chip--durch-spiele { background: rgba(238,0,204,.08) !important; color: var(--dg-magenta-text) !important; border-color: rgba(238,0,204,.25); }
.dg-chip--mit-spielen { background: rgba(0,221,85,.1) !important; color: var(--dg-green-text) !important; border-color: rgba(0,180,70,.3); }
.dg-chip--fundament { background: rgba(127,127,127,.12) !important; color: var(--darkgray) !important; border-color: rgba(127,127,127,.3); }
`

/* ------------------------------------------------------------------ */
/* Zuletzt angelegt oder bearbeitet: Slim-Cards                         */
/* ------------------------------------------------------------------ */

const slimCard = (from: string, t: ReturnType<typeof terms>[number], meta: string) =>
  h(
    "a",
    {
      href: resolveRelative(from as any, t.slug as any),
      class: "internal dg-slim",
      style: `--dg-accent:${BEREICHE[t.keys[0]]?.color ?? "#1c2e4a"}`,
    },
    [
      h("div", { class: "dg-slim-body" }, [
        h("div", { class: "dg-slim-title" }, [t.de.join(", "), t.en.length ? h("span", { class: "dg-slim-en" }, " / " + t.en.join(", ")) : null]),
        t.kurz ? h("div", { class: "dg-slim-desc" }, t.kurz) : null,
      ]),
      h("div", { class: "dg-slim-meta" }, meta + " →"),
    ],
  )

const RecentList: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const recent = terms(allFiles)
    .filter((t) => t.changed)
    // bei gleichem Zeitpunkt entscheidet zuerst das Anlegedatum, danach die alphabetische Reihenfolge
    .sort(
      (a, b) =>
        b.changed!.getTime() - a.changed!.getTime() ||
        (b.created?.getTime() ?? 0) - (a.created?.getTime() ?? 0) ||
        a.de[0].localeCompare(b.de[0], "de"),
    )
    .slice(0, 5)
  if (recent.length === 0) return null
  return h(
    "div",
    { class: "dg-slim-list" },
    recent.map((t) => slimCard(fileData.slug!, t, [t.bereiche[0], fmtDate(t.changed!)].filter(Boolean).join(" · "))),
  )
}

RecentList.css = `
.dg-slim-list { display: flex; flex-direction: column; gap: .55rem; }
.dg-slim, a.dg-slim.internal { display: flex; align-items: center; gap: 1rem; padding: .75rem 1rem !important; background: var(--dg-card) !important; border: 1px solid var(--lightgray); border-left: 4px solid var(--dg-accent); border-radius: 6px; color: inherit !important; transition: box-shadow .15s, transform .15s; }
.dg-slim:hover { box-shadow: 0 2px 12px rgba(0,0,0,.1); transform: translateX(2px); }
.dg-slim-body { flex: 1; min-width: 0; }
.dg-slim-title { font-weight: 700; font-size: .95rem; color: var(--dark); }
.dg-slim-en { font-weight: 400; color: var(--gray); }
.dg-slim-desc { font-size: .8rem; color: var(--gray); margin-top: .1rem; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dg-slim-meta { font-size: .74rem; white-space: nowrap; color: var(--dg-navy-text); font-weight: 700; flex-shrink: 0; }
@media (max-width: 600px) { .dg-slim { flex-wrap: wrap; } .dg-slim-meta { width: 100%; } }
`

/* ------------------------------------------------------------------ */
/* Bereiche: Säulen-Infografik wie auf spiel-wissenschaft.de           */
/* ------------------------------------------------------------------ */

const BereichGrid: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const all = bereiche(allFiles)
  const rows = terms(allFiles)
  const here = fileData.slug!
  const cols = all.filter((b) => ["fuer-spiele", "ueber-spiele", "durch-spiele"].includes(b.key))
  const mit = all.find((b) => b.key === "mit-spielen")
  const fund = all.find((b) => b.key === "fundament")
  const count = (key: string) => rows.filter((r) => r.keys.includes(key)).length
  const countLabel = (n: number) => (n === 1 ? "1 Begriff" : n + " Begriffe")

  const column = (b: (typeof all)[number]) =>
    h("div", { class: "dg-col dg-col--" + b.key }, [
      link(here, b.slug, { class: "internal dg-col-head" }, [
        b.icon ? h("div", { class: "dg-col-icon" }, b.icon) : null,
        h("div", { class: "dg-col-title" }, b.label),
        h("div", { class: "dg-col-sub" }, b.untertitel),
      ]),
      h("div", { class: "dg-col-body" }, [
        b.beschreibung ? h("p", {}, b.beschreibung) : null,
        h("div", { class: "dg-chips" }, b.felder.map((f) => chip(b.key, f))),
        link(here, b.slug, { class: "internal dg-col-count" }, countLabel(count(b.key)) + " →"),
      ]),
    ])

  return h("div", { class: "dg-sw" }, [
    h("div", { class: "dg-sw-center" }, [
      h("div", { class: "dg-sw-badge" }, [h("div", { class: "t" }, "◆  SPIELWISSENSCHAFT  ◆"), h("div", { class: "s" }, "Game Sciences")]),
    ]),
    h("div", { class: "dg-sw-grid" }, [h("div", { class: "dg-sw-bar", "aria-hidden": "true" }), ...cols.map(column)]),
    mit
      ? link(here, mit.slug, { class: "internal dg-sw-mit" }, [
          h("span", { class: "k" }, mit.label),
          h("span", { class: "d" }, mit.untertitel),
          h("span", { class: "n" }, countLabel(count(mit.key)) + " →"),
        ])
      : null,
    fund
      ? h("div", { class: "dg-sw-fund" }, [
          link(here, fund.slug, { class: "internal k" }, "Fundament"),
          h("div", { class: "chips" }, fund.felder.map((f) => h("span", {}, f))),
        ])
      : null,
  ])
}

BereichGrid.css = `
.dg-sw { margin: .5rem 0 0; }
.dg-sw-center { text-align: center; position: relative; padding-bottom: 1.25rem; }
.dg-sw-center::after { content: ""; position: absolute; bottom: 0; left: 50%; width: 2px; height: 1.25rem; background: var(--lightgray); }
.dg-sw-badge { display: inline-block; background: #1c2e4a; color: #fff; padding: .55rem 2.2rem; border-radius: 6px; }
.dg-sw-badge .t { font-weight: 800; font-size: 1rem; letter-spacing: .04em; white-space: pre; }
.dg-sw-badge .s { font-size: .68rem; letter-spacing: .12em; opacity: .55; margin-top: .15rem; text-transform: uppercase; font-style: italic; }
.dg-sw-grid { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.dg-sw-bar { position: absolute; top: 0; height: 2px; left: calc(16.66% + .33rem); right: calc(16.66% + .33rem); background: var(--lightgray); }
.dg-col { background: var(--dg-card); border-top: 3px solid var(--c); border-radius: 0 0 10px 10px; box-shadow: 0 2px 12px rgba(0,0,0,.07); overflow: hidden; display: flex; flex-direction: column; }
.dg-col--fuer-spiele { --c: #00b4d8; --bg: rgba(0,180,216,.1); --ct: var(--dg-cyan-text); }
.dg-col--ueber-spiele { --c: #c9a000; --bg: rgba(255,230,0,.12); --ct: var(--dg-yellow-text); }
.dg-col--durch-spiele { --c: #ee00cc; --bg: rgba(238,0,204,.07); --ct: var(--dg-magenta-text); }
.dg-col-head { display: block; text-align: center; padding: .9rem 1rem .7rem; background: var(--bg) !important; border-bottom: 1px solid var(--lightgray); color: inherit !important; }
.dg-col-icon { font-size: 1.5rem; margin-bottom: .15rem; }
.dg-col-title { font-weight: 800; font-size: 1.1rem; color: var(--ct); letter-spacing: .02em; }
.dg-col-sub { font-size: .76rem; color: var(--gray); margin-top: .1rem; }
.dg-col-body { padding: .9rem 1rem 1rem; display: flex; flex-direction: column; gap: .75rem; flex: 1; }
.dg-col-body p { font-size: .82rem; color: var(--darkgray); line-height: 1.55; margin: 0; }
.dg-chips { display: flex; flex-wrap: wrap; gap: .35rem; }
.dg-col-count { margin-top: auto; font-size: .8rem; font-weight: 700; color: var(--ct) !important; background: none !important; padding: 0 !important; }
.dg-sw-mit { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; padding: .6rem 1.25rem; border-radius: 8px; border-left: 4px solid #00dd55; background: rgba(0,221,85,.08) !important; color: inherit !important; }
.dg-sw-mit .k { font-weight: 800; color: var(--dg-green-text); }
.dg-sw-mit .d { font-size: .82rem; color: var(--gray); flex: 1; }
.dg-sw-mit .n { font-size: .8rem; font-weight: 700; color: var(--dg-green-text); }
.dg-sw-fund { margin-top: 1rem; background: #1c2e4a; border-radius: 8px; padding: .8rem 1.25rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.dg-sw-fund .k { color: rgba(255,255,255,.6) !important; background: none !important; padding: 0 !important; font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
.dg-sw-fund .chips { display: flex; flex-wrap: wrap; gap: .4rem; }
.dg-sw-fund .chips span { font-size: .71rem; padding: .15rem .5rem; border-radius: 4px; background: rgba(255,255,255,.08); color: rgba(255,255,255,.78); border: 1px solid rgba(255,255,255,.15); }
@media (max-width: 900px) { .dg-sw-grid { grid-template-columns: 1fr; } .dg-sw-bar, .dg-sw-center::after { display: none; } .dg-sw-center { padding-bottom: .75rem; } }
`

/* ------------------------------------------------------------------ */
/* Bereichsseite: Felder als Chips + Begriffe als Slim-Cards           */
/* ------------------------------------------------------------------ */

const BereichPage: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const fm = (fileData.frontmatter ?? {}) as Record<string, any>
  const key = String(fm.bereich ?? "")
  const here = fileData.slug!
  const rows = terms(allFiles).filter((t) => t.keys.includes(key))
  const felder = asList(fm.felder)
  return h("div", { class: "dg-bereich" }, [
    fm.beschreibung ? h("p", { class: "dg-bereich-lead" }, String(fm.beschreibung)) : null,
    felder.length
      ? h("div", { class: "dg-bereich-box" }, [
          h("p", { class: "dg-kicker" }, key === "fundament" ? "Fächer laut DGSW" : "Felder laut DGSW"),
          h("div", { class: "dg-chips" }, felder.map((f) => chip(key, f))),
          fm.betreuung ? h("p", { class: "dg-bereich-betreuung" }, [h("b", {}, "Betreuung: "), String(fm.betreuung)]) : null,
        ])
      : null,
    sectionHead("Begriffe", "In diesem Bereich", link(here, "begriffe/index", { class: "internal dg-more" }, "Alle Begriffe →")),
    rows.length
      ? h("div", { class: "dg-slim-list" }, rows.map((t) => slimCard(here, t, t.id ? "ID " + t.id : t.changed ? fmtDate(t.changed) : "")))
      : h("p", { class: "dg-empty" }, "Noch keine veröffentlichten Begriffe in diesem Bereich."),
  ])
}

BereichPage.css = `
.dg-bereich-lead { font-size: 1.05rem; color: var(--darkgray); margin-top: 0; }
.dg-bereich-box { border: 1px solid var(--lightgray); border-radius: 10px; padding: 1rem 1.25rem; background: var(--dg-card); }
.dg-bereich-betreuung { margin: .75rem 0 0; font-size: .85rem; color: var(--darkgray); }
.dg-empty { color: var(--gray); font-style: italic; }
`

/* ------------------------------------------------------------------ */
/* Begriffssuche, A-Z und sortierbare Liste                             */
/* ------------------------------------------------------------------ */

const TermTable: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const rows = terms(allFiles)
  if (rows.length === 0) return null
  const hasIds = rows.some((r) => r.id)
  const letters = Array.from(new Set(rows.map((r) => r.de[0].charAt(0).toUpperCase()))).sort((a, b) => a.localeCompare(b, "de"))

  const th = (label: string, key: string) =>
    h("th", { "data-key": key, tabindex: 0, role: "columnheader", "aria-sort": "none" }, label)

  return h("div", { class: "term-table-wrap" }, [
    h("div", { class: "dg-alpha", role: "group", "aria-label": "Nach Anfangsbuchstaben filtern" }, [
      h("button", { type: "button", class: "dg-alpha-btn active", "data-letter": "" }, "Alle"),
      ...letters.map((l) => h("button", { type: "button", class: "dg-alpha-btn", "data-letter": l }, l)),
    ]),
    h("div", { class: "term-search" }, [
      h("input", {
        type: "search",
        class: "term-filter",
        placeholder: "Begriff suchen (Deutsch, Englisch, ID, Bereich) …",
        "aria-label": "Begriffe suchen",
      }),
      h("span", { class: "term-count", "aria-live": "polite" }, rows.length + " Einträge"),
    ]),
    h("table", { class: "term-table" }, [
      h("thead", {}, h("tr", {}, [hasIds ? th("ID", "id") : null, th("Deutsch", "de"), th("Englisch", "en"), th("Bereich", "bereich")])),
      h(
        "tbody",
        {},
        rows.map((r) =>
          h("tr", { "data-letter": r.de[0].charAt(0).toUpperCase() }, [
            hasIds ? h("td", { "data-sort": r.id }, r.id) : null,
            h(
              "td",
              { "data-sort": r.de.join(", ").toLowerCase() },
              h("a", { href: resolveRelative(fileData.slug!, r.slug as any), class: "internal" }, r.de.join(", ")),
            ),
            h("td", { "data-sort": r.en.join(", ").toLowerCase() }, r.en.join(", ")),
            h(
              "td",
              { "data-sort": r.bereiche.join(", ").toLowerCase() },
              r.keys.map((k) => chip(k, BEREICHE[k]?.label ?? k)),
            ),
          ]),
        ),
      ),
    ]),
  ])
}

TermTable.css = `
.term-table-wrap { margin: .5rem 0 1rem; overflow-x: auto; }
.dg-alpha { display: flex; flex-wrap: wrap; gap: .3rem; margin: 0 0 .8rem; }
.dg-alpha-btn { font: inherit; padding: .28rem .65rem; border-radius: 5px; font-size: .85rem; font-weight: 600; background: var(--dg-card); border: 1px solid var(--lightgray); color: var(--dg-navy-text); cursor: pointer; transition: background .12s; }
.dg-alpha-btn:hover, .dg-alpha-btn.active { background: #1c2e4a; color: #fff; border-color: #1c2e4a; }
.term-search { display: flex; align-items: center; gap: 1rem; margin-bottom: .75rem; }
.term-filter { flex: 1; padding: .6rem .85rem; border: 1px solid var(--lightgray); border-radius: 6px; background: var(--dg-card); color: var(--dark); font: inherit; }
.term-filter:focus { outline: 2px solid #00ccee; border-color: transparent; }
.term-count { color: var(--gray); font-size: .82rem; white-space: nowrap; }
.term-table { width: 100%; border-collapse: collapse; margin: 0 !important; }
.term-table th, .term-table td { text-align: left; padding: .55rem .75rem; border-bottom: 1px solid var(--lightgray); }
.term-table th { cursor: pointer; user-select: none; white-space: nowrap; font-size: .78rem; text-transform: uppercase; letter-spacing: .08em; color: var(--dg-navy-text); border-bottom: 2px solid #1c2e4a; }
.term-table th:hover, .term-table th:focus-visible { color: var(--tertiary); outline: none; }
.term-table th[aria-sort="ascending"]::after { content: " \\25B2"; font-size: .7em; }
.term-table th[aria-sort="descending"]::after { content: " \\25BC"; font-size: .7em; }
.term-table td a.internal { font-weight: 700; }
.term-table tbody tr:hover { background: var(--highlight); }
.term-table td:first-child { font-variant-numeric: tabular-nums; }
.term-table tr[hidden] { display: none; }
`

TermTable.afterDOMLoaded = `
document.addEventListener("nav", () => {
  document.querySelectorAll(".term-table-wrap").forEach((wrap) => {
    const table = wrap.querySelector("table.term-table")
    const tbody = table.tBodies[0]
    const heads = Array.from(table.querySelectorAll("th[data-key]"))
    const sortBy = (th, dir) => {
      const idx = heads.indexOf(th)
      const rows = Array.from(tbody.rows)
      rows.sort((a, b) => {
        const x = a.cells[idx].dataset.sort || "", y = b.cells[idx].dataset.sort || ""
        if (!x && y) return 1
        if (x && !y) return -1
        return dir * x.localeCompare(y, "de", { numeric: true })
      })
      rows.forEach((r) => tbody.appendChild(r))
      heads.forEach((h) => h.setAttribute("aria-sort", h === th ? (dir === 1 ? "ascending" : "descending") : "none"))
    }
    heads.forEach((th) => {
      const handler = () => sortBy(th, th.getAttribute("aria-sort") === "ascending" ? -1 : 1)
      th.addEventListener("click", handler)
      th.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handler() } })
    })
    const first = heads.find((x) => x.dataset.key === "de")
    first && first.setAttribute("aria-sort", "ascending")

    const input = wrap.querySelector(".term-filter"), count = wrap.querySelector(".term-count")
    const btns = Array.from(wrap.querySelectorAll(".dg-alpha-btn"))
    const total = tbody.rows.length
    let letter = ""
    const apply = () => {
      const q = input.value.trim().toLowerCase()
      let shown = 0
      Array.from(tbody.rows).forEach((r) => {
        const hit = (!q || r.textContent.toLowerCase().indexOf(q) !== -1) && (!letter || r.dataset.letter === letter)
        r.hidden = !hit
        if (hit) shown++
      })
      count.textContent = q || letter ? shown + " von " + total + " Einträgen" : total + " Einträge"
    }
    input.addEventListener("input", apply)
    btns.forEach((b) => b.addEventListener("click", () => {
      letter = b.dataset.letter || ""
      btns.forEach((x) => x.classList.toggle("active", x === b))
      apply()
    }))
  })
})
`

/* ------------------------------------------------------------------ */
/* Footer im Stil der DGSW                                              */
/* ------------------------------------------------------------------ */

const DgFooter: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const here = fileData.slug!
  const col = (title: string, items: any[]) => h("div", { class: "dg-foot-col" }, [h("h4", {}, title), h("ul", {}, items.map((i) => h("li", {}, i)))])
  const ext = (href: string, label: string) => h("a", { href, target: "_blank", rel: "noopener" }, label)
  return h("footer", { class: "dg-foot" }, [
    h("div", { class: "dg-foot-grid" }, [
      h("div", { class: "dg-foot-col" }, [
        h("p", { class: "dg-foot-tagline" }, "Where Game meets Science"),
        h("p", {}, "Die Fachsprache ist das Begriffslexikon der Deutschen Gesellschaft für Spielwissenschaft e.V. (DGSW). Sie entsteht offen in einem git-Repository und lässt sich als Markdown-Vault lokal spiegeln."),
      ]),
      col("Fachsprache", [link(here, "index", {}, "Begriffe"), link(here, "begriffe/index", {}, "Alle Begriffe A-Z"), ext(DGSW + "/projekte/wiki/", "Fachsprachen-Wiki der DGSW")]),
      col("Redaktion", [link(here, "redaktion/Leitfaden", {}, "Redaktionsleitfaden"), link(here, "redaktion/Mitwirken", {}, "Mitwirken"), link(here, "redaktion/Literatur", {}, "Literatur"), ext(REPO, "git-Repository")]),
      col("Rechtliches", [link(here, "redaktion/Impressum", {}, "Impressum"), ext(DGSW + "/datenschutz.php", "Datenschutz"), ext(DGSW + "/kontakt/", "Kontakt")]),
    ]),
    h("div", { class: "dg-foot-bottom" }, [
      h("span", {}, "© " + new Date().getFullYear() + " Deutsche Gesellschaft für Spielwissenschaft e.V."),
      h("span", {}, [link(here, "redaktion/Impressum", {}, "Impressum"), " | ", ext(DGSW + "/datenschutz.php", "Datenschutz")]),
    ]),
  ])
}

DgFooter.css = `
.dg-foot { box-sizing: border-box; width: 100%; max-width: 100%; text-align: left; opacity: 1; background: var(--dg-surface); color: var(--dg-ink-2); border: 1px solid var(--dg-line); border-top: none; border-radius: 10px 10px 0 0; padding: 2.5rem 1.75rem 1.25rem; margin-top: 4rem; position: relative; }
.dg-foot::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 4px; border-radius: 10px 10px 0 0; background: linear-gradient(90deg,#00ccee 0 25%,#ffe600 25% 50%,#00dd55 50% 75%,#ee00cc 75%); }
.dg-foot-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
.dg-foot h4 { font-size: .72rem; text-transform: uppercase; letter-spacing: .12em; color: var(--dg-ink); margin: 0 0 .8rem; }
.dg-foot p { font-size: .84rem; line-height: 1.7; color: var(--dg-ink-2); margin: 0; }
.dg-foot ul { list-style: none; padding: 0; margin: 0; }
.dg-foot li { margin: 0 0 .4rem; }
.dg-foot a { color: var(--dg-ink-2) !important; background: none !important; padding: 0 !important; font-size: .84rem; font-weight: 400 !important; border: none !important; }
.dg-foot a:hover { color: var(--dg-link-hover) !important; }
.dg-foot-tagline { font-size: .76rem !important; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--dg-link-hover) !important; margin-bottom: .7rem !important; }
.dg-foot-bottom { border-top: 1px solid var(--dg-line); padding-top: 1.1rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: .5rem; font-size: .76rem; color: var(--dg-ink-3); }
.dg-foot-bottom a { font-size: .76rem; color: var(--dg-ink-3) !important; }
@media (max-width: 800px) { .dg-foot-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 520px) { .dg-foot-grid { grid-template-columns: 1fr; } }
`

/* ------------------------------------------------------------------ */
/* Layout                                                               */
/* ------------------------------------------------------------------ */

const is = (...slugs: string[]) => (page: QuartzComponentProps) => slugs.includes(page.fileData.slug as string)
const only = (component: QuartzComponent, ...slugs: string[]) =>
  Component.ConditionalRender({ component, condition: is(...slugs) })
const when = (component: QuartzComponent, test: (slug: string) => boolean) =>
  Component.ConditionalRender({ component, condition: (page) => test(page.fileData.slug as string) })

const graph = Component.Graph()
const left = [
  Brand,
  Component.MobileOnly(Component.Spacer()),
  Component.Flex({
    components: [{ Component: Component.Search(), grow: true }, { Component: Component.Darkmode() }],
  }),
  SideNav,
]

export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: DgFooter,
}

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    SharedCss,
    PageHero,
    // Startseite "Begriffe"
    only(SectionHead("Netz", "Begriffsgraph"), "index"),
    only(TermGraph, "index"),
    only(SectionHead("Aktuelles", "Zuletzt angelegt oder bearbeitet", ["begriffe/index", "Alle Begriffe →"]), "index"),
    only(RecentList, "index"),
    only(SectionHead("Forschungsfelder", "Begriffe nach Bereich"), "index"),
    only(BereichGrid, "index"),
    only(SectionHead("Verzeichnis", "Alle Begriffe A-Z"), "index"),
    only(TermTable, "index"),
    only(SectionHead("Über die Fachsprache", "So ist das Lexikon aufgebaut"), "index"),
    // Bereichsseiten
    when(BereichPage, isBereich),
    // Begriffe: Schlagwörter unter dem Kopf
    when(Component.TagList(), isTerm),
    when(TermInfo, isTerm),
  ],
  left,
  right: [
    // Auf der Startseite steht der große Graph im Hauptbereich
    when(graph, (s) => s !== "index"),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    SharedCss,
    PageHero,
    // Seite "Alle Begriffe": A-Z, Suche, sortierbare Liste
    only(TermTable, "begriffe/index"),
  ],
  left,
  right: [],
}
