# Extension repository – étude et spécification

Document d’étude pour un **dépôt d’extensions** (et éventuellement language packs / themes) avec un **backend** et un **bouton dans la WebUI** pour lister, sélectionner, télécharger et installer.

---

## 1. Objectifs

- **Backend** : héberger un catalogue d’extensions (et optionnellement languages / themes) versionné et filtré par **système** et **version WebUI**.
- **WebUI** : un bouton ouvre une liste d’extensions **installables** (depuis le repo), l’utilisateur sélectionne, la WebUI **télécharge** les fichiers, les **envoie sur la flash**, puis **lance le scan** pour que l’utilisateur confirme l’ajout dans Extra contents.
- Réutiliser le même principe pour **language packs** et **themes** (même API, type de paquet différent).

---

## 2. Flux utilisateur (WebUI)

1. Utilisateur va dans **Settings → Interface → Extra content** (ou un nouvel emplacement dédié).
2. Clic sur un bouton du type **« Repository »** / **« Browse installable extensions »**.
3. La WebUI envoie une requête au backend avec **système** (ex. `grblhal`, `marlin`) et **version WebUI** (ex. `3.0.0`).
4. Le backend renvoie un **JSON catalogue** : liste d’extensions (ou languages/themes) avec pour chaque entrée :
   - **manifest** (nom, description, supportedVersion, targetSystem, icon, etc.)
   - **fichiers à télécharger** (URL ou chemin + URL de base)
   - **taille du paquet** (pour affichage).
5. La WebUI affiche la liste (table ou cartes), filtrée côté client si besoin (supportedVersion / targetSystem déjà filtrés côté backend).
6. L’utilisateur **coche** les extensions (ou languages/themes) à installer.
7. Clic **« Install selected »** (ou équivalent) :
   - pour chaque paquet : **téléchargement** des fichiers depuis le repo (en local navigateur / mémoire),
   - puis **upload** vers la flash via l’API existante (HostUploadPath, même flux que l’upload de fichiers),
   - à la fin : **lancement du scan** (extensions / languages / themes) comme aujourd’hui,
   - l’utilisateur voit les nouveaux éléments **disponibles** et les ajoute aux Extra contents (ou active le language/theme) comme aujourd’hui.

Optionnel : indiquer la **progression** (download + upload) et gérer les **erreurs** (réseau, flash pleine, etc.).

---

## 3. Backend – besoins et API

### 3.1 Entrée (requête WebUI)

- **Méthode** : GET (simple, cacheable).
- **Paramètres** (query ou chemin) :
  - **system** (ou `target`) : identifiant du système/firmware, ex. `marlin`, `grblhal`, `grbl`, `repetier`, `smoothieware`, `marlin-embedded`, ou catégorie `3d printer`, `cnc`, `sand table`.
  - **version** (ou `webuiversion`) : version de la WebUI, ex. `3.0.0`, `3.1.0`.
- **Optionnel** : `type` = `extensions` | `languages` | `themes` pour ne renvoyer qu’un type (sinon le backend peut tout renvoyer et la WebUI filtre).

Exemple d’URL :  
`GET https://repo.example.com/catalog?system=grblhal&version=3.0.0`  
ou  
`GET https://repo.example.com/catalog/grblhal/3.0.0`.

### 3.2 Sortie (réponse backend)

**JSON** avec une structure du type :

```json
{
  "extensions": [
    {
      "id": "gcodeViewer",
      "name": "G-code Viewer",
      "description": "...",
      "manifest": { "owner": "...", "version": "1.0.0", "supportedVersion": "3.*", "targetSystem": ["3d printer", "cnc"], "icon": "Box", "target": "panel", "refreshtime": "0" },
      "files": [
        { "path": "extensions/gcodeViewer.html", "url": "https://repo.example.com/packages/gcodeViewer/v1.0.0/gcodeViewer.html", "size": 123456 }
      ],
      "size": 123456,
      "version": "1.0.0"
    }
  ],
  "languages": [
    {
      "id": "fr",
      "name": "French",
      "files": [ { "path": "languages/fr.json", "url": "...", "size": 5000 } ],
      "size": 5000
    }
  ],
  "themes": [
    {
      "id": "dark",
      "name": "Dark theme",
      "files": [ { "path": "themes/dark.css", "url": "...", "size": 2000 } ],
      "size": 2000
    }
  ]
}
```

- **manifest** : même format que le manifest embarqué (voir `extensions_samples/API.md`), pour que la WebUI puisse afficher infos et compatibilité sans télécharger le .html.
- **files** : pour chaque fichier, **path** (destination sur la flash, relatif à la racine upload), **url** (téléchargement direct), **size** (octets).
- **size** (au niveau entrée) : somme des tailles des fichiers (affichage « taille du paquet »).

Le backend peut **filtrer** par `supportedVersion` et `targetSystem` pour ne renvoyer que les extensions (ou languages/themes) compatibles avec `system` + `version`. La WebUI peut refiltrer pour cohérence.

### 3.3 Hébergement des fichiers

- Les **url** dans `files` doivent pointer vers des ressources **téléchargeables** (GET sans auth, ou token dans l’URL si besoin).
- Stockage possible : système de fichiers, CDN, ou stockage objet (S3, etc.). Le backend sert le **catalogue** (JSON) et peut soit rediriger vers des URLs statiques, soit servir les fichiers lui‑même.

### 3.4 Backend – résumé des besoins

| Besoin | Détail |
|--------|--------|
| **API HTTP** | Au moins un endpoint GET : catalogue JSON (paramètres system, version, optionnel type). |
| **Stockage** | Fichiers des paquets (extensions .html, languages .json, themes .css) + métadonnées (manifest, liste de fichiers par paquet). |
| **Versionnement** | Associer chaque paquet à une version (ex. 1.0.0) et une liste de fichiers avec URLs. |
| **Filtrage** | Filtrer par système et version WebUI (supportedVersion, targetSystem) pour ne renvoyer que les entrées compatibles. |
| **Sécurité** | HTTPS recommandé ; pas d’exécution de code côté repo, uniquement servir JSON + fichiers statiques. Pas d’auth obligatoire pour la lecture du catalogue si public. |
| **Évolutivité** | Possibilité d’ajouter languages/themes avec la même API (sections `languages`, `themes` dans le JSON). |

### 3.5 Approche recommandée : catalogues statiques + script de génération

Pas de serveur dynamique : on pré-génère les JSON et on les sert comme **fichiers statiques**.

#### 3.5.1 Structure du dépôt (un répertoire par paquet : nom + version)

Chaque paquet (extension, thème, language pack) est stocké dans **un répertoire dédié** dont le nom est **`{id}-{version}`**. À l’intérieur : le **manifest** et les **fichiers du paquet** côte à côte.

**Extensions :**
```
extensions/
  gcodeViewer-1.0.0/
    manifest.json      ← métadonnées (owner, supportedVersion, targetSystem, icon, etc.)
    gcodeViewer.html   ← fichier(s) de l’extension
  anotherExt-2.1.0/
    manifest.json
    anotherExt.html
```

**Themes :**
```
themes/
  dark-1.0.0/
    manifest.json      ← métadonnées (nom, version, supportedVersion, etc.)
    dark.css           ← fichier(s) du thème
  compact-1.0.0/
    manifest.json
    compact.css
```

**Language packs :**
```
languages/
  fr-1.0.0/
    manifest.json      ← métadonnées (nom, version, locale, etc.)
    fr.json            ← fichier(s) de traduction
  de-1.0.0/
    manifest.json
    de.json
```

Règles :
- **Un répertoire = un paquet** identifié par `id` + `version` (ex. `gcodeViewer-1.0.0`).
- **manifest.json** dans chaque répertoire : même format que le manifest embarqué (extensions) ou équivalent pour themes/languages ; le script le lit pour filtrer par `supportedVersion` / `targetSystem` et pour remplir le catalogue.
- **Fichiers du paquet** : à côté du manifest (ex. `.html` pour extensions, `.css` pour themes, `.json` pour languages). Les champs `path` et `url` du catalogue sont dérivés de l’arborescence (ex. `extensions/gcodeViewer.html`, URL = base du repo + `extensions/gcodeViewer-1.0.0/gcodeViewer.html`).

Le script de génération parcourt `extensions/`, `themes/`, `languages/`, lit chaque `manifest.json`, liste les autres fichiers du répertoire, et produit les catalogues JSON (par version × target).

- **Dépôt** : arborescence des paquets (extensions, languages, themes) + leurs fichiers, comme ci‑dessus.
- **Script** (Node, Python, etc.) exécuté **à chaque ajout ou modification** d’un pack (extension, language pack, theme pack) :
  - parcourt tous les paquets,
  - lit les manifests / métadonnées (version, targetSystem, supportedVersion, etc.),
  - pour chaque combinaison **version WebUI** × **target** (ou catégorie) concernée, génère un **catalogue JSON filtré**,
  - écrit les fichiers dans un dossier du repo (ex. `catalog/3.0.0/grblhal.json`, `catalog/3.0.0/marlin.json`, …).
- **Hébergement** : le repo sert ces JSON en statique (GitHub Pages, CDN, etc.). La WebUI fait un GET sur l’URL du catalogue (ex. `catalog/{version}/{target}.json`).
- **Avantages** : pas de backend à maintenir, pas de logique à l’exécution, cache simple, déploiement = push + éventuel CI qui lance le script.

### 3.6 Hébergement sur GitHub et CORS

Oui, le dépôt peut être sur **GitHub** et les catalogues servis en statique. Contrainte : **CORS**. La WebUI tourne sur l’origine du device (ex. `http://192.168.1.100`). Un `fetch()` vers `https://xxx.github.io/...` ou `https://raw.githubusercontent.com/...` est cross-origin ; GitHub / raw n’envoient pas toujours les en-têtes CORS, donc le navigateur peut bloquer la requête.

**Options qui fonctionnent :**

1. **CDN qui mirror GitHub avec CORS** (recommandé)  
   Utiliser **jsDelivr** (ou équivalent) qui sert les fichiers d’un repo GitHub avec les bons en-têtes CORS.  
   - Exemple d’URL catalogue : `https://cdn.jsdelivr.net/gh/org/esp3d-repo@main/catalog/3.0.0/grblhal.json`  
   - Le script pousse les JSON sur GitHub ; la WebUI appelle les URLs jsDelivr. Aucun serveur à maintenir.

2. **GitHub Pages**  
   Servir le site (dont les JSON) depuis GitHub Pages. CORS peut être accepté selon le type de requête ; à tester. Si le navigateur bloque, revenir à l’option 1.

3. **Proxy côté firmware**  
   La WebUI demande à l’ESP3D (même origine) de récupérer l’URL du catalogue ; le firmware fait la requête HTTP vers GitHub et renvoie le JSON. Pas de CORS côté navigateur, mais dépend du firmware (capacité HTTP client).

**Test CORS effectué (Chrome, mars 2025) :** depuis la WebUI en `http://localhost:8088` (Settings → Interface), un `fetch("https://luc-github.github.io/images/ESP3D_social_mini.png")` a réussi (Promise fulfilled, pas de blocage CORS). On peut donc utiliser **GitHub Pages** (ex. `https://luc-github.github.io/<repo>/catalog/...`) directement pour les catalogues et fichiers, sans passer par jsDelivr. À re-tester depuis l’origine device (IP du module) si besoin.

Pas besoin de compte utilisateur ni d’upload vers le repo dans une première version (les paquets sont ajoutés par les mainteneurs du repo, pas par l’utilisateur depuis la WebUI).

---

## 4. WebUI – changements à prévoir

### 4.1 Nouveau flux « Repository »

- **Entrée** : bouton « Repository » / « Install from repository » (Settings → Interface → Extra content, ou onglet dédié).
- **Modal ou page** :
  1. Appel au backend (URL du repo configurable ? ou en dur pour un repo officiel).
  2. Affichage de la liste (extensions, puis éventuellement onglets Languages / Themes).
  3. Cases à cocher + infos (nom, description, taille, compatibilité).
  4. Bouton « Install selected » :
     - pour chaque paquet sélectionné : fetch des `files[].url` → blobs,
     - upload vers la flash via l’API existante (path = `files[].path`, même mécanisme que l’upload de fichiers),
     - en fin de série : déclencher le **scan** (extensions / languages / themes).
  5. Après le scan : fermeture ou redirection vers la liste « Extensions list » / Extra content pour que l’utilisateur **ajoute** les nouvelles extensions aux panneaux (comportement actuel).

### 4.2 Réutilisation du code existant

- **Scan** : réutiliser la logique actuelle (ScanExtensions, liste des fichiers dans HostUploadPath, récupération des manifests, filtre supportedVersion / targetSystem). Après l’upload depuis le repo, lancer ce scan pour que les nouveaux fichiers apparaissent en « Available ».
- **Upload** : réutiliser le même chemin d’upload que le filemanager (HostUploadPath, multipart/form-data ou équivalent selon l’API firmware).
- **Manifest** : le format du manifest dans le catalogue doit être identique à celui embarqué (voir `extensions_samples/API.md` et `EXTENSIONS_MANIFEST.md`) pour réutiliser `parseEmbeddedManifest` / `isExtensionCompatible` côté affichage.

### 4.3 Configuration

- **URL du repository** : soit en dur (repo officiel), soit préférence dans Settings (ex. `repositoryUrl`) pour un repo personnalisé ou une instance auto‑hébergée.
- **Gestion hors‑ligne** : si le backend est injoignable, afficher un message clair et désactiver ou masquer le bouton « Repository ».

---

## 5. Languages et themes (même système)

- **Catalogue** : mêmes paramètres `system` + `version` ; sections `languages` et `themes` dans le JSON avec la même structure (`id`, `name`, `files[]`, `size`).
- **Installation** : même flux (télécharger les fichiers, upload vers la flash aux paths indiqués).
- **Après install** : lancer le scan des languages/themes (si la WebUI a déjà un équivalent) pour que l’utilisateur puisse sélectionner la langue ou le thème. Sinon, documenter où placer les fichiers (path) pour que le mécanisme existant les détecte.

Cela ne change pas les besoins backend : uniquement le contenu des paquets (fichiers .json / .css) et les clés dans le JSON (`languages`, `themes`).

---

## 6. Points ouverts / décisions

| Sujet | Options |
|-------|--------|
| **URL du repo** | Fixe (officiel) vs configurable (préférence utilisateur). |
| **Sécurité / intégrité** | Hash (ex. SHA-256) par fichier dans le catalogue pour vérification optionnelle après download. |
| **Versions WebUI** | Backend renvoie uniquement les paquets dont `supportedVersion` matche la version demandée ; la WebUI peut afficher la version courante à côté de la liste. |
| **Dépendances** | Pas prévu en v1 ; plus tard on pourrait ajouter un champ `dependencies` (liste d’ids) et installer en ordre. |
| **Mise à jour** | Même flux : le catalogue peut exposer une `version` par paquet ; la WebUI compare avec l’installé (si disponible) et affiche « Update » pour les paquets plus récents. |

---

## 7. Synthèse

- **Backend** : une API GET (catalogue JSON) + hébergement des fichiers des paquets ; filtrage par système et version WebUI ; même schéma pour extensions, languages et themes.
- **WebUI** : un bouton « Repository » → récupération du catalogue → affichage → sélection → téléchargement des fichiers → upload sur la flash → scan automatique → l’utilisateur confirme l’ajout dans Extra contents (ou active language/theme).
- **Réutilisation** : scan actuel, upload actuel, format manifest actuel ; pas de changement du modèle de données des extra contents, seulement une nouvelle source d’acquisition des fichiers (repo au lieu de l’utilisateur qui uploade à la main).

Cette base suffit pour préciser l’API (ex. noms exacts des paramètres et champs JSON) et implémenter d’abord le backend minimal puis le flux WebUI.
