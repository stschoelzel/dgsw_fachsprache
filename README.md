# Fachsprache der Spielwissenschaft

Zweisprachiges Fachvokabular der Deutschen Gesellschaft für Spielwissenschaft e.V. (DGSW).

## Rolle dieses Repositorys

- **Hier entsteht die Fachsprache.** Einträge werden in diesem Repository geschrieben, diskutiert (Issues, Pull Requests) und freigegeben.
- **Lokal spiegelbar.** Wer das Repository klont, hat die ganze Fachsprache als Markdown-Vault: für Obsidian oder jedes andere Werkzeug nach Wahl.
- **Pipeline zur DGSW-Website.** Freigegebene Inhalte fließen von hier in das [Fachsprachen-Wiki](https://www.spiel-wissenschaft.de/projekte/wiki/) auf spiel-wissenschaft.de bzw. werden dort übernommen. Die Quartz-Website dieses Repositorys ist die Vorschau.

- Inhalte: Markdown-Dateien, Ausgelegt für [Obsidian](https://obsidian.md), oder mit markdown Tool wie [Zettlr](https://www.zettlr.com/) oder jedem Texteditor
- Website: statisch gebaut mit [Quartz](https://quartz.jzhao.xyz), kein Backend nötig
- Veröffentlicht wird nur, was im Frontmatter `publish: true` trägt

## Ordner

| Ordner | Inhalt |
| --- | --- |
| `begriffe/` | ein Eintrag pro Begriff |
| `fachgebiete/` | Bereiche (FÜR / ÜBER / DURCH / MIT Spielen, Fundament); Felder und Texte im Frontmatter |
| `redaktion/` | Redaktion & Impressum: Leitfaden, Mitwirken, Literatur, Impressum, offene Fragen, Übersicht (Obsidian Bases) |
| `vorlagen/` | Vorlage für neue Einträge (wird nicht veröffentlicht) |
| `_quartz/` | Konfiguration und Design der Website |
| `.github/workflows/` | automatischer Bau und Veröffentlichung auf GitHub Pages |

## GitHub Page

Für GitHub Pages: Repository-Einstellungen → Pages → Source: *GitHub Actions*. In `_quartz/quartz.config.ts` die `baseUrl` anpassen.
