---
title: Mitwirken
publish: true
---

Die Fachsprache ist ein Ordner mit Markdown-Dateien, verwaltet mit git. Man kann ihn in Obsidian öffnen, in jedem Texteditor bearbeiten oder direkt im Browser auf der git-Plattform ändern. Die Website wird bei jeder Änderung automatisch neu gebaut.

## Drei Wege beizutragen

**1. Ohne Technik:** Begriffsvorschlag oder Korrektur als Issue auf der git-Plattform einreichen (oder per Mail an die Redaktion). Die Redaktion legt den Eintrag an.

**2. Im Browser:** Datei auf der git-Plattform öffnen, bearbeiten, als Änderungsvorschlag (Pull Request) speichern.

**3. Mit Obsidian:**
1. Repository klonen und den Ordner in Obsidian als Vault öffnen.
2. Optional das Community-Plugin *Obsidian Git* installieren, dann geht Synchronisieren per Klick.
3. Neuen Eintrag im Ordner `begriffe/` anlegen und die Vorlage *Begriff* einfügen.
4. Änderungen in einem eigenen Branch speichern und einen Pull Request stellen.

## Prüfung

Jeder Pull Request wird von der Redaktion und, bei inhaltlichen Änderungen, von der Bereichsbetreuung geprüft. Diskussionen finden im Pull Request statt und bleiben so dokumentiert. Erst nach Freigabe wird die Änderung übernommen und erscheint (mit `publish: true`) auf der Website.

## Wichtig

- Keine persönlichen Daten Dritter in Einträge schreiben.
- Den Ordner `.obsidian/` nur mit Bedacht ändern; persönliche Einstellungen und Plugin-Daten werden über `.gitignore` ausgeschlossen.
