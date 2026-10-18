# Fachsprache der Spielwissenschaft (Prototyp)

Strukturentwurf für ein zweisprachiges Fachvokabular der Deutschen Gesellschaft für Spielwissenschaft e.V. (DGSW).

- Inhalte: Markdown-Dateien, Ausgelegt für [Obsidian](https://obsidian.md), oder mit markdown Tool wie [Zettlr](https://www.zettlr.com/) oder jedem Texteditor
- Website: statisch gebaut mit [Quartz](https://quartz.jzhao.xyz), kein Backend nötig
- Veröffentlicht wird nur, was im Frontmatter `publish: true` trägt

## Ordner

| Ordner | Inhalt |
| --- | --- |
| `begriffe/` | ein Eintrag pro Begriff |
| `fachgebiete/` | Bereichsseiten (FÜR / ÜBER / DURCH / MIT Spielen, Fundament) |
| `redaktion/` | Leitfaden, Mitwirken, offene Fragen, Übersicht (Obsidian Bases) |
| `vorlagen/` | Vorlage für neue Einträge (wird nicht veröffentlicht) |
| `_quartz/` | Konfiguration und Design der Website |
| `.github/workflows/` | automatischer Bau und Veröffentlichung auf GitHub Pages |

## GitHub Page

Für GitHub Pages: Repository-Einstellungen → Pages → Source: *GitHub Actions*. In `_quartz/quartz.config.ts` die `baseUrl` anpassen.
