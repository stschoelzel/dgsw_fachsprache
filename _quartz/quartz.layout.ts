import { h } from "preact"
import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { QuartzComponent, QuartzComponentProps } from "./quartz/components/types"
import { resolveRelative } from "./quartz/util/path"

/**
 * Startseite "Begriffe" der DGSW-Fachsprache.
 *
 *  - TermGraph:  großer Graph, nur Einträge aus begriffe/ (keine Index-, Redaktions- oder Bereichsseiten)
 *  - RecentList: zuletzt angelegte oder bearbeitete Einträge
 *  - TermTable:  Begriffssuche und sortierbare Liste (ID, Deutsch, Englisch, Bereich)
 *
 * Alle Daten stammen aus dem Frontmatter der Einträge (id, de, en, tags, angelegt_am, geaendert_am).
 */

const BEREICHE: Record<string, { label: string; color: string }> = {
  "fuer-spiele": { label: "FÜR Spiele", color: "#00ccee" },
  "ueber-spiele": { label: "ÜBER Spiele", color: "#ffe600" },
  "durch-spiele": { label: "DURCH Spiele", color: "#ee00cc" },
  "mit-spielen": { label: "MIT Spielen", color: "#00dd55" },
  fundament: { label: "Fundament", color: "#9a9a9a" },
}

const asList = (v: unknown): string[] =>
  (Array.isArray(v) ? v : v ? [v] : []).map((x) => String(x).trim()).filter(Boolean)

const toDate = (v: unknown): Date | null => {
  if (!v) return null
  const d = v instanceof Date ? v : new Date(String(v))
  return isNaN(d.getTime()) ? null : d
}

const isTerm = (slug?: string) => !!slug && slug.startsWith("begriffe/") && slug !== "begriffe/index"

/** Alle Begriffseinträge als einfache Datensätze */
function terms(allFiles: QuartzComponentProps["allFiles"]) {
  return allFiles
    .filter((f) => isTerm(f.slug))
    .map((f) => {
      const fm = (f.frontmatter ?? {}) as Record<string, any>
      const title = String(fm.title ?? f.slug)
      const de = asList(fm.de)
      const bereiche = asList(fm.tags)
        .filter((t) => t.startsWith("bereich/"))
        .map((t) => BEREICHE[t.slice("bereich/".length)]?.label ?? t.slice("bereich/".length))
      const created = toDate(fm.angelegt_am)
      const changed = toDate(fm.geaendert_am) ?? created
      return {
        slug: f.slug!,
        id: String(fm.id ?? ""),
        de: de.length ? de : [title],
        en: asList(fm.en),
        bereiche,
        created,
        changed,
      }
    })
    .sort((a, b) => a.de[0].localeCompare(b.de[0], "de"))
}

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
/* Zuletzt angelegt oder bearbeitet                                     */
/* ------------------------------------------------------------------ */

const RecentList: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const recent = terms(allFiles)
    .filter((t) => t.changed)
    .sort((a, b) => b.changed!.getTime() - a.changed!.getTime())
    .slice(0, 5)
  if (recent.length === 0) return null
  const fmt = (d: Date) => d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
  return h("div", { class: "recent-terms" }, [
    h("h3", {}, "Zuletzt angelegt oder bearbeitet"),
    h(
      "ul",
      {},
      recent.map((t) =>
        h("li", {}, [
          h("a", { href: resolveRelative(fileData.slug!, t.slug as any), class: "internal" }, t.de.join(", ")),
          t.en.length ? h("span", { class: "recent-en" }, " / " + t.en.join(", ")) : null,
          h("span", { class: "recent-date" }, " - " + fmt(t.changed!)),
        ]),
      ),
    ),
  ])
}

RecentList.css = `
.recent-terms { margin: 1.25rem 0; }
.recent-terms h3 { margin: 0 0 0.4rem; }
.recent-terms ul { margin: 0; padding-left: 1.2rem; }
.recent-terms .recent-en, .recent-terms .recent-date { color: var(--gray); }
`

/* ------------------------------------------------------------------ */
/* Begriffssuche und sortierbare Liste                                  */
/* ------------------------------------------------------------------ */

const TermTable: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const rows = terms(allFiles)
  if (rows.length === 0) return null

  const th = (label: string, key: string) =>
    h("th", { "data-key": key, tabindex: 0, role: "columnheader", "aria-sort": "none" }, label)

  return h("div", { class: "term-table-wrap" }, [
    h("div", { class: "term-search" }, [
      h("input", {
        type: "search",
        class: "term-filter",
        placeholder: "Begriffe suchen (Deutsch, Englisch, ID, Bereich)",
        "aria-label": "Begriffe suchen",
      }),
      h("span", { class: "term-count", "aria-live": "polite" }, rows.length + " Begriffe"),
    ]),
    h("table", { class: "term-table" }, [
      h("thead", {}, h("tr", {}, [th("ID", "id"), th("Deutsch", "de"), th("Englisch", "en"), th("Bereich", "bereich")])),
      h(
        "tbody",
        {},
        rows.map((r) =>
          h("tr", {}, [
            h("td", { "data-sort": r.id }, r.id),
            h(
              "td",
              { "data-sort": r.de.join(", ").toLowerCase() },
              h("a", { href: resolveRelative(fileData.slug!, r.slug as any), class: "internal" }, r.de.join(", ")),
            ),
            h("td", { "data-sort": r.en.join(", ").toLowerCase() }, r.en.join(", ")),
            h("td", { "data-sort": r.bereiche.join(", ").toLowerCase() }, r.bereiche.join(", ")),
          ]),
        ),
      ),
    ]),
  ])
}

TermTable.css = `
.term-table-wrap { margin: 1.5rem 0; overflow-x: auto; }
.term-search { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; }
.term-filter { flex: 1; padding: 0.5rem 0.75rem; border: 1px solid var(--lightgray); border-radius: 6px; background: var(--light); color: var(--dark); font: inherit; }
.term-filter:focus { outline: 2px solid var(--secondary); border-color: transparent; }
.term-count { color: var(--gray); font-size: 0.85rem; white-space: nowrap; }
.term-table { width: 100%; border-collapse: collapse; }
.term-table th, .term-table td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--lightgray); }
.term-table th { cursor: pointer; user-select: none; white-space: nowrap; border-bottom: 2px solid var(--darkgray); }
.term-table th:hover, .term-table th:focus-visible { color: var(--secondary); outline: none; }
.term-table th[aria-sort="ascending"]::after { content: " \\25B2"; font-size: 0.7em; }
.term-table th[aria-sort="descending"]::after { content: " \\25BC"; font-size: 0.7em; }
.term-table td:first-child { color: var(--gray); font-variant-numeric: tabular-nums; width: 4rem; }
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
    heads[1] && heads[1].setAttribute("aria-sort", "ascending")

    const input = wrap.querySelector(".term-filter"), count = wrap.querySelector(".term-count")
    const total = tbody.rows.length
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase()
      let shown = 0
      Array.from(tbody.rows).forEach((r) => {
        const hit = !q || r.textContent.toLowerCase().indexOf(q) !== -1
        r.hidden = !hit
        if (hit) shown++
      })
      count.textContent = q ? shown + " von " + total + " Begriffen" : total + " Begriffe"
    })
  })
})
`

/* ------------------------------------------------------------------ */
/* Reiter "Begriffe" (Startseite) oberhalb der Dateiliste               */
/* ------------------------------------------------------------------ */

const NavTab: QuartzComponent = ({ fileData }: QuartzComponentProps) =>
  h("nav", { class: "nav-tabs" }, [
    h(
      "a",
      {
        href: resolveRelative(fileData.slug!, "index" as any),
        class: "internal nav-tab" + (fileData.slug === "index" ? " active" : ""),
      },
      "Begriffe",
    ),
  ])

NavTab.css = `
.nav-tabs { margin: 0.5rem 0 0.25rem; }
.nav-tab { display: block; padding: 0.4rem 0.75rem; border-left: 4px solid var(--lightgray); font-weight: 600; color: var(--darkgray); background: transparent; }
.nav-tab:hover { color: var(--secondary); border-left-color: var(--secondary); }
.nav-tab.active { color: var(--secondary); border-left-color: var(--secondary); background: var(--highlight); }
/* Auf der Seite "Alle Begriffe" steht die sortierbare Liste statt der automatischen Seitenliste */
body[data-slug="begriffe/index"] .page-listing { display: none; }
`

/* ------------------------------------------------------------------ */
/* Layout                                                               */
/* ------------------------------------------------------------------ */

const is = (...slugs: string[]) => (page: QuartzComponentProps) => slugs.includes(page.fileData.slug as string)
const only = (component: QuartzComponent, ...slugs: string[]) =>
  Component.ConditionalRender({ component, condition: is(...slugs) })
const except = (component: QuartzComponent, ...slugs: string[]) =>
  Component.ConditionalRender({ component, condition: (page) => !is(...slugs)(page) })

const graph = Component.Graph()

export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      DGSW: "https://www.spiel-wissenschaft.de/",
      // TODO: Impressum und Datenschutz verlinken
    },
  }),
}

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    except(Component.Breadcrumbs(), "index"),
    Component.ArticleTitle(),
    Component.ContentMeta({ showReadingTime: false }),
    Component.TagList(),
    // Startseite "Begriffe": Graph, zuletzt bearbeitet, Suche und Liste
    only(TermGraph, "index"),
    only(RecentList, "index"),
    only(TermTable, "index"),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [{ Component: Component.Search(), grow: true }, { Component: Component.Darkmode() }],
    }),
    NavTab,
    Component.Explorer({
      title: "Inhalt",
      // Läuft im Browser, deshalb eigenständig (keine äußeren Variablen)
      mapFn: (node) => {
        const names: Record<string, string> = {
          begriffe: "Alle Begriffe",
          fachgebiete: "Bereiche",
          redaktion: "Redaktion",
        }
        if (node.isFolder && names[node.slugSegment]) node.displayName = names[node.slugSegment]
      },
      sortFn: (a, b) => {
        // Startseite "Begriffe" zuerst, dann Ordner, dann Seiten
        if (a.slugSegment === "index") return -1
        if (b.slugSegment === "index") return 1
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
        return a.displayName.localeCompare(b.displayName, undefined, { numeric: true, sensitivity: "base" })
      },
    }),
  ],
  right: [
    // Auf der Startseite steht der große Graph im Hauptbereich
    except(graph, "index"),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    // Seite "Alle Begriffe": sortierbare Liste mit Suche
    only(TermTable, "begriffe/index"),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [{ Component: Component.Search(), grow: true }, { Component: Component.Darkmode() }],
    }),
    NavTab,
    Component.Explorer({ title: "Inhalt" }),
  ],
  right: [],
}
