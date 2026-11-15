# Refonte du système de préférences — proposition de design

Date : 2026-11-13 — branche `new-ui`
Contexte : `index.html.gz` a dépassé 100 KB. Première passe déjà faite (icônes locales, suppression preact/compat, factory TFT, zopfli) : **96,3 KB gz** sur Marlin. Ce document couvre le levier suivant : la « machine à settings ».

## 1. Contraintes rappelées

- Package **monolithique standalone** : pas d'externalisation de code dans les extensions ni de textes d'aide dans des fichiers séparés (serveur ESP synchrone, 1 requête à la fois, flash limitée).
- Compatibilité ascendante du `preferences.json` sauvegardé sur l'ESP (les utilisateurs le conservent entre versions) et des packs de langue.
- Le core est presque complet : peu de cas nouveaux à venir, plutôt des compléments de panels.
- **Le moteur de conditions est gelé** (`checkDependencies` / `settingDepend` / `connectionDepend` / `generateDependIds` dans `components/Helpers/components.js`) : la refonte déplace les données `depend` **verbatim**, sans toucher à leur évaluation (voir §4.1).

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
- **R6 — `MachineSettings.js`** garde sa propre gestion d'entrées (`cache`, `generateValidation`, dirty tracking en module mutable) au lieu des helpers partagés. **Re-scopé (2026-11-14)** : le rendu utilise déjà le `Field` standard (avec bouton Send par entrée) — seule la gestion interne change, UX et format fil (ESP400 / `$$`, fournis par les firmwares, non modifiables) strictement inchangés.
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

### 4.1 Le système de conditions (gelé)

Le moteur actuel supporte, par entrée `depend` :

- `id` + `value` / `notvalue` — dépendance à un autre setting (égalité / inégalité strictes), y compris le cas « élément absent » (`false === d.value`) ;
- `connection_id` + `value` / `contains` — dépendance aux settings de connexion issus d'ESP800 (FWTarget, Axisletters, flashfs, directsd…) ;
- `orGroups` — OU récursif de groupes, avec ET implicite entre conditions (`every`).

Les données `depend` vivent à trois endroits : entrées de settings (ex. champ visible si `showfilespanel`), **options de select** (ex. FLASH visible si `flashfs`), et champs de l'éditeur de macros (5 conditions imbriquées FS/SD/URI/CMD — R2).

**Règle de la refonte :** ces données sont déplacées verbatim (notamment vers les constantes de `listKinds.js` au palier B) ; leur évaluation n'est pas modifiée. Aucun palier ne touche au moteur.

**Dette connue, hors scope** : `connectionDepend` utilise `eval()` sur les valeurs de connexion. À remplacer un jour par un mini-parseur (palier D éventuel) — sujet de robustesse, pas de taille.

## 5. Paliers de migration (incrémental, mesuré à chaque étape)

| Palier | Contenu | Gain gz estimé | Risque |
|---|---|---|---|
| **A — Factorisation pure** | `syncPanelsOrder` unique (R1), `clone()` (R5), `buildFontFaceCSS` (R4), dirty flag (R7) | 1,5–3 KB | faible — comportement identique, renommages + déplacements |
| **B — Table des kinds** | `listKinds.js` (R2), simplification `formatItem`/`ItemsList` | 2–4 KB | moyen — vérifier chaque kind visuellement |
| **C — Représentation unique** | suppression flatten/unflatten (R3), MachineSettings sur helpers partagés (R6) | 2–4 KB | moyen+ — nécessite test round-trip import/export |

Total réaliste : **5–8 KB gz** (≈ 88–91 KB sur Marlin) + gains de maintenabilité substantiels (R3/R7 sont des nids à bugs).

Honnêteté sur les chiffres : gzip déduplique déjà le code répété, donc la déduplication pure rapporte moins que le brut ; le vrai gain du palier C vient de la **suppression de logique**, pas de la dedupe.

## 6. Validation

- Après chaque palier : `npm run buildall`, comparaison des 7 tailles gz/br.
- Test visuel onglet Interface : affichage de chaque kind de liste, modification, sauvegarde, rechargement.
- **Matrice d'affichage conditionnel** (obligatoire au palier B) :
  - activer/désactiver `showfilespanel` / `showjogpanel` → les champs dépendants apparaissent et disparaissent ;
  - options de select à dépendance connexion : FLASH visible seulement si `flashfs`, directsd idem ;
  - éditeur de macros : chaque type FS/SD/URI/CMD affiche les bons champs ;
  - cas `orGroups` et élément absent (ex. panels masqués quand le setting n'existe pas).
- Test round-trip : export preferences.json → réimport → diff des valeurs.
- Test langue + thème (palier A touche `useSettings`).

## 7. Questions tranchées (2026-11-14)

1. **Palier C : approuvé.** R3 est un nid à bugs, il faut le refaire. Le test de round-trip import/export est le filet obligatoire ; l'import/export n'a jamais généré de retours utilisateurs, donc risque terrain faible — mais on évite quand même de le casser.
2. **MachineSettings** : migration interne uniquement (validation + gestion d'état partagées) — rendu déjà standard, UX et format fil inchangés.
3. **Emplacement du module** : `src/components/Helpers/settings/` (fonctions pures, pas des composants).

## 8. Bilan — les trois paliers sont livrés (2026-11-14)

### Palier A — factorisation pure ✅

- `Helpers/settings/` créé : `model.js` (`clone`, `reindexList`, `scanFlag`/`settingsStatus` en early-exit — fini les `JSON.stringify().includes('"hasmodified":true')` à chaque frappe), `fonts.js` (`buildFontFaceCSS` partagé thème/langue), `panelsOrder.js` (`syncPanelsOrder` unique : prune orphelins + insertion placeholder + réindexation).
- `useSettings` et `tabs/interface` migrés (~250 lignes supprimées).

### Palier B — table des kinds ✅

- `listKinds.js` : métadonnées de champs + options par kind en constantes partagées ; les `depend` macros (FS/SD) déplacés **verbatim** — moteur de conditions non touché.
- `formatItem` réécrit sur la table (~150 → ~25 lignes) ; `ItemsList` passe à `scanFlag`, `VERBOSE_TYPE_KEYS` dérivé de la table, `clone()`.

### Palier C — représentation unique + MachineSettings ✅

- **R3** : `normalizeListItem` supprimé. `formatItemsList` conserve les items déjà formatés (flags `hasmodified`/`editionMode`/`newItem` préservés — la corruption « double-nesting / [object Object] » est structurellement impossible). Le flatten n'existe plus qu'à l'import et à l'export.
- **Filet de test** : `test/` (harnais webpack+Node, `npm run test`) — 21 vérifications : round-trip export→import→export stable dans les deux flux, préservation des flags, formes d'export par kind, injection `openonstart`, `depend` verbatim.
- **R6** : `machineValidation.js` — coquille de validation unique pour les 7 `MachineSettings`, règles par cible passées en paramètre (exception `$337` grblHAL conservée). Flux de sauvegarde batch et format fil ESP400/`$$` non touchés.

### Mesures réelles (grblHAL, index.html.gz)

| Étape | Taille | Δ |
|---|---|---|
| Avant refonte (réf. 100 KB+ dépassé) | ~96,3 KB après 1ʳᵉ passe | — |
| Palier A | 96 337 o | ~−240 o |
| Palier B | 96 437 o | +100 o |
| Palier C (R3+R6) | 96 452 o | +15 o |

**Conclusion honnête** : la refonte est **neutre en taille** (±0,1 KB — gzip dédupliquait déjà, cf. §5). Ses gains sont ailleurs : nid à bugs R3 éliminé et prouvé par test, fin des sérialisations complètes par frappe, un seul endroit pour chaque savoir-faire (`listKinds`, `syncPanelsOrder`, `buildFontFaceCSS`, `machineSettingValidation`), et un harnais de régression durable (`npm run test`). La hausse grblHAL 95,8 → 96,9 KB constatée sur la période vient des **nouvelles fonctionnalités CNC** (tool change), pas de la refonte.
