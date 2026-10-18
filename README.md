# Fachsprache der Spielwissenschaft (Prototyp)

Strukturentwurf für ein zweisprachiges Fachvokabular der Deutschen Gesellschaft für Spielwissenschaft e.V. (DGSW).

- Inhalte: Markdown-Dateien, bearbeitbar mit [Obsidian](https://obsidian.md) oder jedem Texteditor
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

## Website lokal bauen

```bash
git clone --depth 1 -b v4 https://github.com/jackyzha0/quartz.git _build
cd _build && npm ci
rm -rf content && mkdir content
rsync -a --exclude '.git' --exclude '.github' --exclude '.obsidian' --exclude '_quartz' --exclude '_build' --exclude 'vorlagen' ../ content/
cp ../_quartz/quartz.config.ts ../_quartz/quartz.layout.ts .
cp ../_quartz/custom.scss quartz/styles/custom.scss
npx quartz build --serve
```

Für GitHub Pages: Repository-Einstellungen → Pages → Source: *GitHub Actions*. In `_quartz/quartz.config.ts` die `baseUrl` anpassen.

## Status

Prototyp zur Diskussion in der DGSW. Siehe `redaktion/Offene Fragen.md`.
