---
id:
title: "Pathfinding"
typ: begriff
de: ["Pathfinding"]
en: []
aliases: ["Wegfindung", "Pathfinding / Wegfindung"]
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
kurz: "Algorithmen, mit denen Spielcharaktere (NPCs) selbstständig Wege durch die Spielwelt finden, Hindernisse umgehen und Ziele erreichen."
dgsw_stand: 2026-08-20
quelle: https://www.spiel-wissenschaft.de/projekte/wiki/begriff.php?slug=pathfinding
publish: true
---


## Benennungen

| Sprache | Vorzugsbenennung | weitere Benennungen | Äquivalenz zu DE |
| --- | --- | --- | --- |
| de | Pathfinding | Wegfindung | - |
| en | *offen* | | *offen* |

## Definition

**DE:** Algorithmen, mit denen Spielcharaktere (NPCs) selbstständig Wege durch die Spielwelt finden, Hindernisse umgehen und Ziele erreichen. *[Beleg fehlt]*

**EN:** *offen*

## Erläuterung

### Definition

Pathfinding bezeichnet Algorithmen der künstlichen Intelligenz, die es Spielcharakteren ermöglichen, selbstständig navigierbare Pfade durch die Spielwelt zu berechnen und dabei Hindernisse und Einschränkungen zu berücksichtigen.

### A\*-Algorithmus

Der A\*-Algorithmus (A-Star) ist der Standardalgorithmus für Pathfinding in Spielen. Er kombiniert Dijkstras Algorithmus (garantiert kürzester Weg) mit einer Heuristik (Manhattan- oder euklidische Distanz), um Berechnungen zu beschleunigen.

### Navigation Meshes (NavMesh)

Moderne Spiele nutzen Navigation Meshes – vereinfachte Polygonrepräsentationen des begehbaren Spielraums – als Grundlage für Pathfinding-Berechnungen. Unity und Unreal Engine bieten integrierte NavMesh-Systeme.

### Weiterentwicklungen

- **Hierarchisches Pathfinding:** Mehrstufige Planung für große Welten
- **Dynamisches Pathfinding:** Reaktion auf sich verändernde Spielwelten
- **Crowd Simulation:** Pfadplanung für große NPC-Gruppen

## Quellen

- *offen*
