# Refonte du système de préférences — proposition de design

Date : 2026-11-13 — branche `new-ui`
Contexte : `index.html.gz` a dépassé 100 KB. Première passe déjà faite (icônes locales, suppression preact/compat, factory TFT, zopfli) : **96,3 KB gz** sur Marlin. Ce document couvre le levier suivant : la « machine à settings ».

## 1. Contraintes rappelées

- Package **monolithique standalone** : pas d'externalisation de code dans les extensions ni de textes d'aide dans des fichiers séparés (serveur ESP synchrone, 1 requête à la fois, flash limitée).
- Compatibilité ascendante du `preferences.json` sauvegardé sur l'ESP (les utilisateurs le conservent entre versions) et des packs de langue.
- Le core est presque complet : peu de cas nouveaux à venir, plutôt des compléments de panels.

## 2. État mesuré

Contribution gz réelle (mesurée, pas estimée) :

| Élément | Source | gz (mesuré) | Verdict |
|---|---|---|---|
| Données `preferences.json` ×3 (après shrink loader) | 61 KB → 17,5 KB | **2,9 KB** | ✅ déjà optimal, ne pas toucher |
| Traductions EN embarquées (fallback) | 16,7 KB | 5,2 KB | nécessaire |
| **Code de la machine à settings** | ~123 KB | **~12–15 KB** | 🎯 la cible |

Détail du code (tailles source webpack) :

| Module | Source | Rôle |
|---|---|---|
| `tabs/interface/index.js` | 26 KB | Onglet settings UI + save + import/export + sync extensions |
| `tabs/interface/importHelper.js` | 12,7 KB | formatPreferences, formatItem, prunePanelsOrderOrphans |
| `tabs/interface/exportHelper.js` | 7 KB | Sérialisation vers preferences.json |
| `tabs/interface/formatHelper.js` | 3,5 KB | Helpers de formatage |
| `Controls/Fields/ItemsList.js` | 15,2 KB | Éditeur de listes (macros, polling, extrapanels…) |
| `hooks/useSettings.js` | 19,5 KB | Chargement settings + thème + langue |
| `targets/*/MachineSettings.js` | 9,2 KB | Onglet machine (ESPxxx) |
| `Controls/Field.js` + `Fields/*` | ~25 KB | Rendu des champs par type |

**Conclusion clé : le problème n'est pas les données (3 KB gz) mais le code de manipulation (12–15 KB gz).** Un format tuple pour les préférences ne rapporterait que ~1 KB gz : non rentable, à écarter.

## 3. Redondances structurelles identifiées

Preuves à l'appui (fichier:ligne) :

- **R1 — Sync panelsorder ↔ extracontents dupliquée 3 fois.** La même logique (filtrer les orphelins, réinsérer les manquants, réindexer) existe dans `importHelper.js:326-412` (`prunePanelsOrderOrphans`) **et** deux fois dans `tabs/interface/index.js:398-426` et `446-545`. Le bloc « réindexation » (`item.index = i` + `idxField.value = i`) apparaît **6 fois** presque à l'identique.
- **R2 — `formatItem` reconstruit les métadonnées à chaud pour chaque item.** `importHelper.js:30-193` : un `switch` sur le nom de champ recrée type/label/help/**options** pour chaque item de liste. Pour les macros, les options `FS/SD/URI/CMD` avec leurs `depend` complexes (5 conditions imbriquées) sont recréées **à chaque macro** alors qu'elles sont statiques par kind.
- **R3 — Double représentation des listes.** `normalizeListItem` (flatten) + `formatItem` (expand) + exportHelper (re-flatten) : la navette `{name,value,...}` ↔ `{clé: valeur}` est source de bugs (cf. le commentaire « Avoids double-nesting and "[object Object]" » dans `importHelper.js:195-199` — le bug a déjà existé).
- **R4 — Builder de fonts CSS dupliqué** dans `useSettings.js` : le bloc construction `@font-face` (sources/data/format) est écrit deux fois (thème ligne ~396-424, manifest langue ligne ~572-596), ~30 lignes chacun.
- **R5 — `JSON.parse(JSON.stringify(...))` dispersé** : 4 occurrences dans `useSettings.js` seul, plusieurs dans `tabs/interface`. Pas de helper `clone()`.
- **R6 — `MachineSettings.js`** réimplémente sa propre gestion d'entrées (`cache`, `toSave`, `totalToSave` en module mutable) au lieu de réutiliser le schéma + Fields standard.
- **R7 — `checkSaveStatus` par `JSON.stringify(...).includes('"hasmodified":true')`** (`tabs/interface/index.js:565-570`) : sérialise tout l'arbre à chaque frappe et dépend du formatage JSON.

## 4. Architecture cible

Principe : **un seul endroit pour chaque savoir-faire**, sans changer le format externe (`preferences.json` inchangé côté ESP).

```
src/components/Settings/            (nouveau module, ou dans Helpers)
├── model.js     → getElement, getValue, setValue, clone, reindexList
├── listKinds.js → table statique : métadonnées de champs par kind
│                  (macros, polling, extrapanels, verbosefilters, quickbuttons)
├── panelsOrder.js → syncPanelsOrder(settings) : LA fonction unique (R1)
└── fonts.js     → buildFontFaceCSS(fonts) : partagé thème + langue (R4)
```

- **`listKinds.js`** remplace le switch de `formatItem` : `{ macros: { cmds: {...}, type: { options: MACRO_TYPE_OPTIONS } }, ... }`. Les `options`/`depend` des macros deviennent **une constante partagée** au lieu d'être recréées par item (R2).
- **`syncPanelsOrder(settings)`** unique, appelée depuis `useSettings` (chargement), `tabs/interface` (ajout extension), et l'effet de réconciliation (R1). Fini les 6 blocs de réindexation : `reindexList(arr)` dans `model.js`.
- **Représentation unique des listes** : garder la forme « formatted » en interne partout, ne flattener **qu'à l'export** (et à l'import) — supprime `normalizeListItem` et la double navette (R3). ⚠️ point le plus délicat : toucher au round-trip import/export, à couvrir par un test de round-trip.
- **Dirty-check explicite** : un compteur/flag `dirty` incrémenté par les setters au lieu du `JSON.stringify().includes()` (R7) — supprime aussi des sérialisations complètes à chaque frappe.

## 5. Paliers de migration (incrémental, mesuré à chaque étape)

| Palier | Contenu | Gain gz estimé | Risque |
|---|---|---|---|
| **A — Factorisation pure** | `syncPanelsOrder` unique (R1), `clone()` (R5), `buildFontFaceCSS` (R4), dirty flag (R7) | 1,5–3 KB | faible — comportement identique, renommages + déplacements |
| **B — Table des kinds** | `listKinds.js` (R2), simplification `formatItem`/`ItemsList` | 2–4 KB | moyen — vérifier chaque kind visuellement |
| **C — Représentation unique** | suppression flatten/unflatten (R3), MachineSettings sur schéma standard (R6) | 2–4 KB | moyen+ — nécessite test round-trip import/export |

Total réaliste : **5–8 KB gz** (≈ 88–91 KB sur Marlin) + gains de maintenabilité substantiels (R3/R7 sont des nids à bugs).

Honnêteté sur les chiffres : gzip déduplique déjà le code répété, donc la déduplication pure rapporte moins que le brut ; le vrai gain du palier C vient de la **suppression de logique**, pas de la dedupe.

## 6. Validation

- Après chaque palier : `npm run buildall`, comparaison des 7 tailles gz/br.
- Test visuel onglet Interface : affichage de chaque kind de liste, modification, sauvegarde, rechargement.
- Test round-trip : export preferences.json → réimport → diff des valeurs.
- Test langue + thème (palier A touche `useSettings`).

## 7. Questions ouvertes

1. Palier C : acceptes-tu de toucher au round-trip import/export (avec test dédié), ou préfères-tu rester sur A+B dans un premier temps ?
2. Le module `MachineSettings` (ESPxxx) : le migrer sur le schéma standard change un peu son UX (rendu Field standard) — acceptable ?
3. Où loger le nouveau module : `src/components/Settings/` ou dans `Helpers/` existant ?
