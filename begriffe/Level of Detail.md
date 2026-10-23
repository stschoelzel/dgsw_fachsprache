---
id:
title: "Level of Detail"
typ: begriff
de: ["Level of Detail"]
en: []
aliases: ["LOD", "Level of Detail (LOD)"]
oberbegriff:
wikidata:
tags: [bereich/fuer-spiele, kategorie/spielentwicklung-technik, belege-fehlen]
status: review
betreuung:
verfasst_von: []
reviewt_von: []
created: 2026-10-23
modified: 2026-10-23
geprueft_am:
kurz: "Technik zur Optimierung der Renderingleistung, bei der weit entfernte Objekte mit weniger Details gerendert werden als nahe Objekte."
dgsw_stand: 2026-08-20
quelle: https://www.spiel-wissenschaft.de/projekte/wiki/begriff.php?slug=level-of-detail
publish: true
---


## Benennungen

| Sprache | Vorzugsbenennung | weitere Benennungen | Äquivalenz zu DE |
| --- | --- | --- | --- |
| de | Level of Detail | LOD | - |
| en | *offen* | | *offen* |

## Definition

**DE:** Technik zur Optimierung der Renderingleistung, bei der weit entfernte Objekte mit weniger Details gerendert werden als nahe Objekte. *[Beleg fehlt]*

**EN:** *offen*

## Erläuterung

### Definition

Level of Detail (LOD) ist eine Optimierungstechnik im Echtzeit-Rendering, bei der die geometrische Komplexität und Texturauflösung von Objekten dynamisch in Abhängigkeit ihrer Entfernung zur Kamera reduziert werden.

### Funktionsweise

Für jedes signifikante Spielobjekt werden mehrere Detailstufen (LOD 0 bis LOD N) modelliert. Bei steigender Entfernung wechselt das System automatisch zu weniger detaillierten Modellen:

- LOD 0: Vollständiges Hochpolygon-Modell (nah)
- LOD 1: Reduziertes Modell (mittlere Entfernung)
- LOD 2+: Stark vereinfachte Geometrie oder Billboard (fern)

### Moderne Ansätze

- **Nanite (Unreal Engine 5):** Virtuelles Mikropolygon-Rendering, das LOD weitgehend automatisiert
- **Impostor/Billboard LOD:** 3D-Objekte durch 2D-Sprites ersetzt
- **HLOD (Hierarchical LOD):** Kombiniert mehrere Objekte zu einem LOD für ganze Stadtbereiche

## Quellen

- *offen*
