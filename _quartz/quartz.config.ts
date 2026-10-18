import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Fachsprache der Spielwissenschaft (DGSW) - Quartz 4 Konfiguration
 * Farben und Schrift angelehnt an spiel-wissenschaft.de
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "DGSW Fachsprache",
    pageTitleSuffix: " | DGSW Fachsprache",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "de-DE",
    // TODO: an das spätere Ziel anpassen, z. B. "fachsprache.spiel-wissenschaft.de"
    baseUrl: "example.github.io/fachsprache",
    ignorePatterns: [".obsidian", ".github", "_quartz", "_build", "vorlagen", "README.md", "**/*.base"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Exo 2",
        body: "Exo 2",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#ffffff",
          lightgray: "#e0e0e0",
          gray: "#9a9a9a",
          darkgray: "#2a2a2a",
          dark: "#0a0a0a",
          secondary: "#006d85",
          tertiary: "#ee00cc",
          highlight: "rgba(0, 204, 238, 0.10)",
          textHighlight: "#ffe60088",
        },
        darkMode: {
          light: "#0a0a0a",
          lightgray: "#2a2a2a",
          gray: "#6b6b6b",
          darkgray: "#e8e8e8",
          dark: "#ffffff",
          secondary: "#00ccee",
          tertiary: "#ee00cc",
          highlight: "rgba(0, 204, 238, 0.12)",
          textHighlight: "#ffe60066",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
    ],
    // Nur Seiten mit "publish: true" gehen online; Entwürfe bleiben intern
    filters: [Plugin.ExplicitPublish()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
