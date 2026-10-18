---
title: Redaktionsleitfaden
aliases: [Leitfaden]
publish: true
---
## Grundsätze

1. **Ein Eintrag pro Begriff, nicht pro Wort.** Deutsche und englische Benennungen gehören zum selben Eintrag. Ein Wort mit zwei Bedeutungen bekommt zwei Einträge (z. B. "Spiel" als *game* und als *play*, siehe [[Spiel]]).
2. **Zweisprachig vollständig.** Jeder veröffentlichte Eintrag hat eine deutsche und eine englische Definition. Wo es keine etablierte deutsche Benennung gibt, wird das ausdrücklich vermerkt und nicht erfunden.
3. **Dokumentieren vor Normieren.** Der Normalfall ist, den Sprachgebrauch in der Literatur mit mehreren belegten Definitionen darzustellen. Eine eigene Arbeitsdefinition der DGSW gibt es nur nach Abstimmung.
4. **Belegpflicht.** Jede Definition aus der Literatur wird mit Quelle und Seite angegeben. Zitate werden am Original geprüft.
5. **Neutralität.** Konkurrierende Positionen werden fair und nebeneinander dargestellt; disziplinäre Unterschiede werden benannt, nicht aufgelöst.
6. **Analog und digital gleichwertig.** Definitionen, die nur für digitale Spiele gelten, werden als solche gekennzeichnet.

## Statusstufen

| Status | Bedeutung | veröffentlicht |
| --- | --- | --- |
| `entwurf` | in Arbeit | nein |
| `review` | wartet auf Prüfung durch Redaktion und Bereich | nein |
| `dokumentiert` | Sprachgebrauch belegt dargestellt | ja |
| `arbeitsdefinition` | abgestimmte Arbeitsdefinition der DGSW | ja |
| `veraltet` | nicht mehr empfohlen, mit Verweis auf Nachfolger | ja |

Veröffentlicht wird nur, was `publish: true` trägt. Die Redaktion setzt dieses Feld beim Übergang zu `dokumentiert` oder `arbeitsdefinition`.

## Aufbau eines Eintrags

Neue Einträge entstehen aus der Vorlage `vorlagen/Begriff.md` (in Obsidian: *Vorlage einfügen*). Pflichtteile: Benennungen, Definition (DE/EN), Beziehungen, mindestens eine Quelle.

### Benennungen und Äquivalenz

Für jede Sprache: Vorzugsbenennung, weitere Benennungen (Synonyme, Abkürzungen) und die Äquivalenz zur deutschen Benennung:

- **voll** - Benennungen bezeichnen denselben Begriff
- **teilweise** - Begriffsumfang überschneidet sich nur
- **keine** - keine Entsprechung, Benennung wird übernommen oder umschrieben

### Definitionen schreiben

Eine Definition ist **ein Satz** nach dem Muster *Oberbegriff + unterscheidende Merkmale* ("Ein Serious Game ist ein [[Spiel]], das ..."). Keine Beispiele, keine Wertungen, keine Zirkeldefinition. Erläuterungen gehören in *Abgrenzung* oder *Anmerkungen*.

### Beziehungen

Beziehungen werden im Text als Links eingetragen, damit sie in Obsidian und auf der Website (Graph, Rückverweise) sichtbar sind:

- **Oberbegriff** - der nächsthöhere Begriff (SKOS: *broader*)
- **Unterbegriffe** - spezifischere Begriffe (*narrower*)
- **Verwandt** - inhaltlich nahe, aber nicht hierarchisch (*related*)

### Bereich

Jeder Eintrag wird mindestens einem Bereich zugeordnet, als Schlagwort (`bereich/durch-spiele`) und als Link in der Infobox: [[fuer-spiele|FÜR Spiele]], [[ueber-spiele|ÜBER Spiele]], [[durch-spiele|DURCH Spiele]], [[mit-spielen|MIT Spielen]], [[fundament|Fundament]].

## Kennung (ID)

Jeder Begriffseintrag trägt im Frontmatter eine eindeutige, fortlaufende Kennung, z. B. `id: "0042"`. Andere Seiten (Bereiche, Leitfaden, Startseite) haben keine.

- Die ID ist die feste Identität des Begriffs. Sie ändert sich nie, auch wenn der Eintrag umbenannt wird, und wird nie wiederverwendet, auch nicht bei `veraltet`.
- Der Dateiname bleibt der lesbare Name des Begriffs; die ID dient zum Zitieren, für Exporte und als Anker bei Umbenennungen.
- Neue Einträge starten mit leerem Feld `id`. Die Redaktion vergibt die nächste freie Nummer, wenn sie den Eintrag zur Veröffentlichung freigibt. *(Vorschlag; Verfahren bei Bedarf zu klären.)*
- Die Übersicht (`redaktion/Übersicht.base`) zeigt die ID als erste Spalte.

## Datumsfelder

Die Startseite zeigt die zuletzt angelegten oder bearbeiteten Einträge. Dafür tragen Einträge zwei Felder im Frontmatter:

- `angelegt_am` - Datum, an dem der Eintrag angelegt wurde (die Vorlage setzt es automatisch).
- `geaendert_am` - Datum der letzten inhaltlichen Änderung. Wer einen Eintrag bearbeitet, trägt hier das aktuelle Datum ein (Format `JJJJ-MM-TT`). Ist das Feld leer, gilt `angelegt_am`.

## Dateinamen

- Dateiname = deutsche Vorzugsbenennung, im Singular (`Serious Game.md`, nicht `Serious Games.md`).
- Gibt es keine etablierte deutsche Benennung, gilt die englische.
- Bei mehrdeutigen Wörtern ein Zusatz in Klammern: `Spiel (Artefakt).md`.
- Plural, englische Formen und Abkürzungen kommen in `aliases`, damit Links in beiden Sprachen funktionieren.

## Rollen

- **Redaktion** - achtet auf Einheitlichkeit, Belege und Standards, gibt zur Veröffentlichung frei.
- **Bereichsbetreuung** - je Bereich Verantwortliche aus den AGs; prüfen fachlich.
- **Beitragende** - alle Mitglieder; schlagen Einträge und Änderungen vor.

Eine Änderung an einer Arbeitsdefinition braucht die Freigabe von Redaktion **und** Bereichsbetreuung.
