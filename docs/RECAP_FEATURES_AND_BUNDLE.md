# Récapitulatif des nouvelles fonctionnalités et taille du bundle

**Règle du projet : pas de lazy loading dans ce projet**, sauf pour les extensions (chargement à part). Tout le code de l’UI doit être dans le bundle principal (un seul `index.html.gz`) pour garder un footprint minimal et une installation simple.

---

## Tracker de taille (index.html.gz)

**Package Marlin.** Ajouter une ligne après chaque build ou optimisation pour voir la courbe (quand on descend, quand on remonte).

| # | Étape | Taille (octets) | Variation |
|---|-------|-----------------|-----------|
| 1 | Base de départ | 98 117 | — |
| 2 | PurgeCSS | 92 100 | −6 017 |
| 3 | Réduction icônes (34 retirées de `icons.js`) | 92 595 | +495 |
| 4 | Optimisation sauvegarde preferences.json (diffs + minification) | 92 870 | +275 |
| 5 | Clés raccourcies preferences statiques (bundle) | 92 816 | −54 |
| 6 | Export lisible (id/value) + import full/optimisé, sauvegarde optimisée | 92 913 | +97 |
| 7 | Smoothie remplacé par module minimal (smoothieChartMinimal.js, resetBounds, labels) | 89 871 | −3 042 |
| 8 | Filtres verboses configurables (verbosefilters, export minimal, UI Terminal, traductions S228–S233) | 90 927 | +1 056 |
| 9 | *prochaine étape…* | | |

**Légende :** *Variation* = différence vs ligne précédente (négatif = on descend, positif = on remonte).

Référence « avant toute optimisation taille » : ~163 KB (code complet, footprint énorme).

Référence : `docs/FEATHER_ICONS_USED_UNUSED.md`.

**Partie icônes : validée.** Passer aux autres leviers pour réduire la taille du package.

**Preferences.json (fichier sauvegardé sur le device) : optimisé.** On n’écrit que les clés qui diffèrent des valeurs par défaut (`omitDefaultSettings` dans `exportHelper.js`) et on minifie le JSON (plus de pretty-print). Résultat : le fichier passe de plusieurs KB à quelques centaines d’octets. Validé.

---

### Analyse du rapport bundle (12 Mar 2026)

D’après le treemap (build Printer3D/Marlin), chunk **main** ≈ **839 KB** parsé, **141 KB** gzip. Répartition indicative :

| Bloc | Parsed (KB) | Gzip (KB) | Commentaire |
|------|-------------|-----------|-------------|
| **targets/index.js + 45 modules** | ~290 | ~47 | Plus gros bloc : Marlin (preferences, panels, MachineSettings, TargetContext, filters, FLASH/SD sources), Panels (Files, Jog, Terminal, etc.) |
| **index.js + 29 modules** (entry) | ~148 | ~25 | areas, tabs (interface, features), pages (about, dashboard) |
| **node_modules** | ~121 | ~22 | smoothie ~48 KB, preact-feather icons ~57 KB, preact ~15 KB |
| **components/Controls** | ~87 | ~13 | Fields (Input, ItemsList, Mask, etc.), Modal, ScanAp |
| **Translations** (en.json fusionnés) | ~15 | ~6 | Base + Printer3D + Marlin |
| **components/Images** (icons.js + Feather) | ~34 | ~5 | Picker + icônes utilisées |
| **preferences.json** (base + target + subtarget) | — | ~3,6 | Inclus dans targets : base ~3 KB, Printer3D ~12 KB, Marlin ~6 KB (parsed) |
| **style (Spectre + app)** | — | (dans HTML) | CSS extrait puis inliné |

**Réduire les preferences statiques (bundle) (~21 KB parsé)**

- **Minifier les .json avant intégration (enlever espaces / retours à la ligne) ?**  
  **Pas de gain.** Webpack importe les JSON avec `import … from "…/preferences.json"`, les parse et les intègre comme objets JS. Le bundle final contient la sérialisation minifiée de ces objets, pas le texte brut des fichiers. Les espaces des .json sources ne se retrouvent donc pas dans le bundle. Minifier les fichiers .json sur disque ne change pas la taille du .gz.

- **Clés raccourcies (short keys) ?**  
  **Implémenté.** Loader webpack (`config/shrink-preferences-loader.js`) raccourcit les clés dans les `preferences.json` du bundle ; au runtime `expandShortKeys()` (dans `src/components/Helpers/preferencesKeys.js`) restaure les clés après merge dans `targets/index.js`. Gain mesuré sur index.html.gz : **−54 octets** (92 870 → 92 816). En gzip les clés répétées se compriment déjà très bien, donc le gain est négligeable ; on peut revert si on préfère garder le code plus simple.

**Propositions prioritaires (sans changer la règle « un seul fichier ») :**

1. **Preferences JSON (statiques dans le bundle)** : le fichier sauvegardé sur le device est déjà optimisé. Les défauts (base + target + subtarget) pèsent ~21 KB parsé. Voir ci‑dessus « Réduire les preferences statiques (bundle) ».
2. **Smoothie** : remplacé par un module minimal (`src/components/Panels/smoothieChartMinimal.js`) compatible avec l’API utilisée par Charts.js (TimeSeries + SmoothieChart, linear only). Gain ~3,2 KB sur index.html.gz, sans lazy load.
3. **Traductions** (~15 KB parsé, ~6 KB gzip) : une seule langue (en) dans le bundle ; déjà raisonnable. Option ultérieure : clés numériques + fichier de traduction minimal si d’autres langues sont chargées à part.
4. **Targets / Panels** : le bloc targets est très gros car il contient tout Marlin (sources FLASH/SD, filters, MachineSettings). Pas de lazy load possible sans plusieurs artefacts ; éventuellement factoriser du code dupliqué entre targets (hors scope court terme).
5. **Terser / minification** (point 4) : tester des options plus agressives et mesurer le gain sur le .gz.

---

### Prochaines optimisations (réduction taille du package)

Pistes à explorer, par ordre de priorité suggéré :

1. **Analyser le bundle** ✅ en place  
   Commande : `npm run analyze` (build Printer3D/Marlin → génère `build/bundle-stats.json` → ouvre le treemap via la CLI). Le rapport s’ouvre dans le navigateur avec les données chargées depuis le JSON. Pour une autre cible : `cross-env ANALYZE=1 TARGET_ENV=CNC SUBTARGET_ENV=GRBL webpack --config config/webpack.prod.js` puis `npx webpack-bundle-analyzer build/bundle-stats.json`. Noter les 3–5 plus gros blocs pour les prochaines optimisations.

2. **Fichiers JSON dans le bundle**  
   Le bundle inclut : `preferences.json` (base + target + subtarget fusionnés), `def_panel.json`, `def_macro.json`, `def_polling.json`, et les traductions `en.json`. Vérifier la taille de ces JSON en sortie (après minification). Si un fichier est très gros, envisager : clés plus courtes en prod, ou structure par défaut minimale avec complétion à l’exécution.

3. **PurgeCSS**  
   Vérifier que les `paths` et la `safelist` dans `webpack.prod.js` ne laissent pas trop de CSS inutilisé (Spectre a beaucoup de classes ; plus le contenu scruté est large, plus le purge est efficace).

4. **Minification JS plus agressive**  
   Webpack 5 en mode production utilise Terser par défaut. On peut tester des options plus agressives (`compress.passes`, `mangle`, etc.) et mesurer le gain sur `index.html.gz`.

5. **Dépendances**  
   `preact` et `preact-feather` sont déjà légers. Vérifier que `smoothie` et `spectre` sont bien tree-shakés / qu’on n’importe que le strict nécessaire.

---

### Optimisations icônes sans réduire le nombre

Sans retirer d’icônes du picker, on peut encore :

1. **Création différée de `iconsFeather`**  
   Ne construire l’objet `iconsFeather` qu’à l’ouverture du modal IconSelect (lazy init), au lieu au chargement du module. Le code reste dans le bundle, mais le coût d’exécution (création des ~75 composants Preact) est reporté. **Gain : temps jusqu’à interactif, pas de gain sur la taille du fichier.**

2. **Vérifier le tree-shaking**  
   S’assurer que seuls les composants Feather réellement importés (dans `icons.js` et ailleurs) sont inclus. Avec des imports nommés `import { X, Y } from "preact-feather"`, le bundler devrait déjà éliminer le reste. À contrôler en inspectant le bundle (analyse de dépendances).

3. **Pas de lazy loading des icônes**  
   Comme rappelé en tête de document : un seul `index.html.gz` sans chunk séparé, donc pas de chargement différé du module icônes sans changer l’architecture de build.

---

## Taille du bundle : base 98 117 → 163 KB (footprint énorme) → 90 927 (actuel)

- **Base de départ** : **98 117** octets (package Marlin de référence).
- **163 KB** : état du code avec toutes les améliorations fonctionnelles mais avant les optimisations de taille (footprint énorme).
- **92 870** : après réduction icônes + optimisation preferences (fichier sauvegardé).
- **92 816** : après clés raccourcies sur preferences statiques (bundle) ; gain négligeable (−54 o).
- **92 913** : export lisible (id/value, toutes les prefs) + import full/optimisé, sauvegarde sur flash optimisée.
- **89 871** : Smoothie remplacé par module minimal (resetBounds, labels min/max visibles), sans lazy load.
- **90 927** : actuel — Filtres verboses configurables (verbosefilters, export minimal type/value, UI Terminal alignée Macros/Extra contents, traductions S228–S233, défauts par cible Printer3D/CNC/SandTable).
- Le bloc ~70 KB (163 KB − 97 KB) venait surtout de :
  - **Drag/drop + individualisation des panels** (ordre par panel, extra contents en panels individuels, expansion au chargement, marquage modifié, nom affiché, cadre/drapeau orange, correctifs dashboard + Settings).
  - **Preferences.json sauvegardé** : optimisé (seulement les diffs aux défauts + minification) → quelques centaines d’octets au lieu de plusieurs KB.

---

## Nouvelles fonctionnalités (depuis avant filtres verboses)

### 1. Gestion des filtres verboses (verbose filters)
- **Fichiers** : `src/components/Helpers/verboseFilters.js`, préférences `verbosefilters` dans les targets, `TargetContext.js` (utilisation des filtres), Terminal / stream.
- **Fonctionnalité** : Filtrage des lignes du terminal selon des règles (startswith, endswith, contain, regex, matchers sémantiques). Liste configurable dans Settings > Interface (liste « filtres verboses »).
- **Impact bundle** : Nouveau module `verboseFilters.js`, références dans plusieurs targets (Marlin, Repetier, Smoothieware, CNC, SandTable, etc.) et dans les préférences par cible.

### 2. Panels – ordre et extra contents
- **Affichage du nom** : Dans Settings > Interface > Panels, les entrées « extra contents » affichent le nom de l’extension (ex. « Capabilities ») au lieu de l’id (`extracontents_xxx`). Résolution via la liste `extracontents` des settings.
- **Modification et indicateurs** :
  - Quand l’ordre des panels est modifié (drag/drop sur le dashboard ou boutons haut/bas dans la liste), la liste est marquée modifiée (`hasmodified`), le bouton **Save** apparaît.
  - Cadre orange autour du bloc « Panel order » et drapeau orange centré en dessous (SVG inline, pas l’icône Feather).
- **Fichiers** : `ItemsList.js` (nom résolu, `markListOrderModified`, Fragment + SVG drapeau), `dashboard/index.js` (`el.hasmodified` + `item.value[0].hasmodified` après réordre).

### 3. Correctifs
- **Crash Settings** : `interfaceSettings` passé en prop à `ItemControl` pour éviter `ReferenceError: interfaceSettings is not defined` au retour sur Settings après modification des panels.
- **Erreurs console ExtraContent** : Dans `ExtraContent/index.js`, garde `mountedRef` pour ne plus appeler `updateContentPosition` après démontage (ex. après navigation), et suppression du `console.error` répété « container not found ».

---

## Icônes Feather : utilisées vs présentes dans `icons.js`

### Source principale : `src/components/Images/icons.js`

Ce fichier importe **toutes** les icônes listées ci‑dessous et les expose dans `iconsFeather`. Ce dictionnaire est fusionné avec `iconsTarget` pour former `iconsList`, utilisé notamment par :
- **IconSelect** : affiche **toutes** les clés de `iconsList` dans le sélecteur d’icônes (macros, panels, extra contents). Donc **toutes** les icônes de `icons.js` sont « utilisées » au moins par ce picker.
- **Panels / dashboard / Navbar** : affichage d’icônes selon `panel.icon` ou `item.icon` (valeurs en chaîne, ex. `"Terminal"`, `"Move"`).

### Icônes **réellement référencées par nom** dans le code (panels, défauts, config)

Utilisées comme `icon: "XXX"` dans les panels ou dans les fichiers de défaut :

| Icône       | Où |
|------------|-----|
| Meh        | def_panel.json, def_macro.json, fallback extensions |
| Cast       | Macros.js |
| Terminal   | Terminal.js |
| Move       | Jog.js, JogCNC.js, JogPlotter.js |
| Layers     | Status.js, StatusCNC.js |
| Image      | Charts.js |
| Target     | SpindleCNC.js |
| Repeat     | OverridesCNC.js |
| Sliders    | ExtraControls.js |
| Thermometer| Temperatures.js |
| Underline  | ProbeCNC.js |
| Loader     | LaserCNC.js |
| MessageSquare | Notifications.js |
| HardDrive  | Files.js |

(Extruder est dans `iconsTarget`, pas Feather.)

### Liste complète des icônes dans `icons.js` (toutes chargées pour IconSelect)

**Présentes dans le bundle via `icons.js`** (ordre du fichier) :

- Activity, AlertCircle, Anchor, Aperture, Award, BarChart, BellOff, Bell, Bluetooth, Bookmark, Box, Camera, Cast, CheckCircle  
- ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsDown, ChevronsLeft, ChevronsRight, ChevronsUp  
- Circle, Clipboard, Clock, Cpu, Crosshair, Database, Delete, Download, Droplet, Edit  
- EyeOff, Eye, File, Filter, Flag, Frown, GitCommit, Globe, Grid, HardDrive, Hash, Heart, HelpCircle, Home  
- Image, Info, Layers, LifeBuoy, List, Loader, Lock, LogIn, LogOut, Mail, MapPin, Meh, Menu, MessageSquare  
- MinusCircle, Monitor, Moon, MoreHorizontal, MoreVertical, Move, PauseCircle, Percent, PlayCircle, PlusCircle, Power, Printer, Radio  
- RefreshCw, Repeat, RotateCcw, Save, Scissors, Send, Server, Settings, Share, Slash, Sliders, Smile, Star, StopCircle  
- Sun, Sunrise, Sunset, Tag, Target, Terminal, Thermometer, Tool, Trash2, Underline, Upload  
- VideoOff, Video, VolumeX, Volume, Wifi, WifiOff, Wind, XCircle, ZapOff, Zap  

Soit **95 noms** (dont `None` = null dans l’objet).

### Icônes importées ailleurs que `icons.js` (fichiers qui importent directement depuis preact-feather)

Ces fichiers chargent en plus leurs propres icônes (non listées ici exhaustivement) :

- about, TabBar, QuickStopButton (plusieurs targets), Mask, ExtraContent/extraContentItem, FullScreenButton, MachineSettings (plusieurs), Jog, JogPlotter, Temperatures, Terminal, Navbar, connection, Modals, useSettings, ScanAp, ScanPacksList, PickUp, IconSelect, Input, etc.

### Proportion « utilisées dans la config » vs « uniquement dans le picker »

- **Référencées explicitement** (panels / défauts) : **15** noms Feather (Meh, Cast, Terminal, Move, Layers, Image, Target, Repeat, Sliders, Thermometer, Underline, Loader, MessageSquare, HardDrive + usages divers comme CheckCircle, Flag, etc. dans d’autres écrans).
- **Présentes uniquement parce que dans `iconsFeather`** (donc dans le sélecteur d’icônes) : **toutes les autres** (~80), nécessaires pour que l’utilisateur puisse les choisir dans Settings (macros, panels, extra contents).

Donc la **proportion** : une petite partie des icônes est utilisée « en dur » dans le code ; la grande majorité est là pour le **picker**. Pour réduire la taille tout en gardant le picker, on peut charger les icônes du picker en lazy (voir section « Lazy loading » ci-dessous).

---

## Lazy loading des icônes Feather (non utilisé dans ce projet)

Ce projet n’utilise pas le lazy loading (voir règle en tête de document). La section ci-dessous décrit le principe à titre de référence uniquement.

### Situation actuelle (tout dans le bundle principal)

Aujourd'hui, `icons.js` importe toutes les icônes Feather et exporte `iconsFeather`. Tout fichier qui importe `iconsFeather` force le bundler à inclure **toutes** ces icônes dans le bundle principal. Au premier chargement, le navigateur télécharge et exécute ce code ; la taille du bundle initial inclut donc le coût des ~95 icônes, même si l'utilisateur n'ouvre jamais le sélecteur d'icônes.

### Principe du lazy loading

Ne pas importer le module des icônes au démarrage, mais seulement **au moment où on en a besoin** (par ex. à l'ouverture du modal IconSelect). En JavaScript, avec un **import dynamique** :

```js
// Au lieu de : import { iconsFeather } from "../../Images"
// On fait, au moment d'ouvrir le picker :
const module = await import("../../Images/iconsFeatherLazy.js")
const iconsFeather = module.iconsFeather
```

Le bundler voit `import(...)` et crée un **chunk séparé** : un deuxième fichier JS qui contient uniquement ce module (les icônes Feather). Ce chunk n'est **pas** dans le bundle principal.

### Comment ça réduit la taille du package

- **Bundle principal** : il ne contient plus le code des icônes, donc la taille du JS au premier chargement **diminue**.
- **Chunk des icônes** : téléchargé **uniquement** quand on exécute l'import dynamique (ex. au clic sur « Choisir une icône »). Le volume total téléchargé peut être le même sur la session, mais il est réparti : moins au démarrage (meilleur temps jusqu'à interactif), le reste seulement si l'utilisateur ouvre le picker.

En résumé : le lazy loading **ne réduit pas le volume total** des icônes, il **déplace** ce volume du bundle initial vers un chunk chargé à la demande. La réduction concerne le **package** (chunk) du premier chargement.

### Mise en œuvre possible

1. Créer un module dédié (ex. `iconsFeatherLazy.js`) qui importe toutes les icônes Feather et exporte `iconsFeather`.
2. Dans le bundle principal : ne plus importer ce module. Pour l'affichage des panels/dashboard, garder uniquement les icônes utilisées par nom dans un petit objet « critical » ou les importer nommément.
3. Dans IconSelect : à l'ouverture du modal, faire `const { iconsFeather } = await import("./iconsFeatherLazy.js")`, puis afficher la liste.
4. Le bundler génère un chunk (ex. `iconsFeatherLazy.chunk.js`) ; le bundle principal ne contient plus les ~95 icônes.

En pratique : souvent on garde en statique les 15–20 icônes utilisées par les panels par défaut et on met le reste (picker) en lazy.

### Cas du build actuel : un seul fichier `index.html.gz`

Dans ce projet, le build de prod (webpack) :

1. Produit un bundle JS (et du CSS).
2. **Inline** tout dans la page : `HtmlWebpackPlugin` + `HtmlInlineScriptPlugin` + `HTMLInlineCSSWebpackPlugin` mettent tout le JS et tout le CSS **dans** le fichier HTML.
3. Le résultat est compressé en **un seul** `index.html.gz` (JS + CSS + HTML dans un seul fichier).

Donc aujourd’hui il n’y a **pas de chunk séparé** : tout est dans ce fichier unique.

**Où se situerait un “chunk” si on faisait du lazy loading ?**

- Avec un `import()` dynamique, webpack générerait **un deuxième fichier JS** (le chunk), par ex. `1.[hash].js`.
- En l’état, `HtmlInlineScriptPlugin` avec `scriptMatchPattern: [/.+[.]js$/]` inlinerait **tous** les `.js` produits (donc le bundle principal **et** le chunk) dans le même `index.html`. Au final, le chunk serait **à l’intérieur** du même `index.html.gz`, sous forme d’un second bloc `<script>` dans la page.
- Mais à l’exécution, le runtime webpack pour le code splitting fait un **nouvelle requête HTTP** pour charger le chunk (il injecte une balise `<script src="1.[hash].js">`). Comme ce fichier n’est **pas** servi séparément (tout est dans `index.html.gz`), cette requête échouerait (404). Donc le lazy loading “classique” (chunk dans un fichier à part, chargé à la demande) **ne fonctionne pas** avec un déploiement en un seul `index.html.gz` sans adapter le build ou le runtime.

**En résumé**

- Avec **un seul package** `index.html.gz` (tout inliné), il n’y a **pas de chunk “à côté”** : soit tout reste dans ce fichier (pas de vrai lazy load), soit on change le build pour sortir un chunk **séparé** et on a alors **deux artefacts** (ex. `index.html.gz` + `1.[hash].js`) à déployer et à servir.
- Pour garder **un seul fichier** et quand même réduire la taille ou le coût au démarrage, les options sont : réduire la liste d’icônes dans `icons.js`, ou garder tout le JS dans le bundle mais retarder l’**exécution** du code des icônes (par ex. ne créer `iconsFeather` qu’à l’ouverture du picker, avec le code déjà présent dans le même bundle — on ne réduit pas le poids du fichier, seulement le travail fait au premier chargement).

---

*Document généré pour le projet ESP3D-WEBUI – récap des features (filtres verboses + panels/extra contents) et analyse des icônes Feather.*
