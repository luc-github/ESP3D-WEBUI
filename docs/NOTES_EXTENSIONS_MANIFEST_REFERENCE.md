# Gestion des extensions (ajout auto + filtrage par manifest) – Référence

Notes tirées de `reference/` pour implémenter dans `src/` la **gestion des extensions avec scan automatique et filtrage selon le manifest**.

---

## Références officielles : API et exemples

La **structure du manifest** et les **règles de filtrage** sont décrites dans l’API, avec des exemples concrets dans les extensions d’échantillon :

- **`extensions_samples/API.md`** — Section **« Extension manifest (auto-configuration) »**  
  - Définition du bloc embarqué `<script type="application/json" id="esp3dext-manifest">...</script>`.  
  - Fallback : fichier `.json` de même nom que le `.html`.  
  - Tableau des champs (owner, version, name, target, supportedVersion, targetSystem, icon, refreshtime, etc.) et indication Requis/Optionnel.  
  - Règles pour `supportedVersion` (ex. `3.*`, `3.0.*`) et `targetSystem` (marlin, 3d printer, cnc, sand table, etc.).

- **Exemples de manifests embarqués** (tous dans `extensions_samples/`) :  
  - **`esp3dext-capabilities.html`** — Exemple type : manifest en tête de fichier avec owner, version, github, description, name, icon, target, refreshtime, supportedVersion, targetSystem.  
  - Autres exemples avec le même format : `esp3dext-modal.html`, `esp3dext-download.html`, `esp3dext-extension_settings.html`, `esp3dext-icons.html`, `esp3dext-dispatch.html`, `esp3dext-sound.html`, `esp3dext-terminal.html`, `esp3dext-upload.html`, `esp3dext-query.html`, `esp3dext-translate.html`, `esp3dext-toast.html`.

Pour la **forme exacte du JSON** et les **valeurs autorisées**, se reporter à l’API et à ces fichiers ; les notes ci‑dessous décrivent le flux d’implémentation (reference) et ce qu’il faut porter dans `src/`.

---

## 1. Vue d’ensemble

- **Où** : Settings → Interface → Extra content.
- **Comportement** : Un bouton **« Extensions list »** (S242) ouvre une modale qui :
  1. Liste les fichiers du répertoire upload (HostUploadPath) dont le nom contient `esp3dext` et se termine par `.html` ou `.html.gz`.
  2. Pour chaque fichier, récupère le **manifest** (embarqué dans le HTML ou fichier `.json` de même nom).
  3. Filtre selon **version WebUI** (`supportedVersion`) et **cible** (`targetSystem`).
  4. Affiche un tableau avec statut : **available** / **added** / **rejected**.
  5. L’utilisateur coche les extensions « available » et clique **« Add selected »** (S254) pour les ajouter en une fois à la liste Extra content.

---

## 2. Fichiers de référence concernés

| Fichier | Rôle |
|--------|------|
| `reference/components/Helpers/extensions.js` | `parseEmbeddedManifest(htmlText)` : extrait le JSON du bloc `<script type="application/json" id="esp3dext-manifest">...</script>`. |
| `reference/components/Controls/Fields/ItemsList.js` | Bouton « Extensions list », `openExtensionsPreview`, `ExtensionsPreviewTable`, logique scan + filtrage + « Add selected ». |
| `reference/components/ExtraContent/extraContentItem.js` | À l’affichage d’un extra en type `extension` : vérification compatibilité (manifest `supportedVersion` + `targetSystem`), toast « extension %s not compatible » (S252) si non compatible. |
| `reference/tabs/interface/importHelper.js` | `extensionMetadataKeys` : champs exclus de l’export extra contents (owner, version, github, description, supportedVersion, targetSystem). |
| `reference/tabs/interface/exportHelper.js` | Même liste pour l’export ; `preferences.extensions` exporté si présent. |
| `extensions_samples/API.md` | Doc manifest : champs requis/optionnels, embedded vs external, `supportedVersion`, `targetSystem`. |

---

## 3. Manifest – Champs et filtrage (aligné référence + API.md)

**Référence détaillée :** tableau des champs et règles dans `extensions_samples/API.md` (section Extension manifest). Exemple de structure complète : `extensions_samples/esp3dext-capabilities.html`.

- **Requis pour que le scan propose l’extension** (logique dans reference/ItemsList) : `name`, `target`, `supportedVersion` non vides, et `targetSystem` présent (peut être `*` ou vide = toute cible).
- **Optionnels** : owner, version, github, description, icon, refreshtime. (L’API mentionne aussi des champs requis supplémentaires selon le contexte ; le code reference n’exige que name, target, supportedVersion, targetSystem pour le scan.)
- **supportedVersion** : pattern type `*`, `3.*`, `3.0.*` ; comparaison segment par segment (voir `matchVersion` dans référence).
- **targetSystem** : string ou array ; valeurs possibles : `marlin`, `repetier`, `smoothieware`, `marlin-embedded`, `grbl`, `grblhal`, `3d printer`, `cnc`, `sand table`. Le scan utilise la catégorie courante (Printer3D → `3d printer`, etc.) et le target (ex. Marlin) pour `matchTargetSystem(manifest.targetSystem)`.

---

## 4. Flux technique (reference/ItemsList.js)

1. **Bouton** : affiché seulement si `id === "extracontents"` ; label S242, `onClick={openExtensionsPreview}`.
2. **openExtensionsPreview** :
   - Récupère la liste des fichiers (requête vers HostTarget avec path HostUploadPath).
   - Filtre les entrées : `name` contient `esp3dext`, fin par `.html` ou `.html.gz`, `size !== -1`.
   - Pour chaque fichier : `source` = URL du .html, `manifestPath` = même chemin en `.json`.
   - Charge le HTML (GET sur `source`), appelle `processHtml(htmlText)` :
     - Si `parseEmbeddedManifest(htmlText)` retourne un objet → `pushRow(manifest)`.
     - Sinon GET sur `manifestPath` (fichier .json), parse JSON → `pushRow(manifest)`.
   - **pushRow(manifest)** :
     - `existingSources` = liste des `source` déjà dans la liste extra contents → si déjà présent → statut **added**.
     - Sinon : `hasRequiredFields(manifest)` (name, target, supportedVersion non vides ; targetSystem != null) + `matchVersion(webUIVersion, manifest.supportedVersion)` + `matchTargetSystem(manifest.targetSystem)` → si tout ok **available**, sinon **rejected**.
   - Une fois toutes les lignes prêtes : affichage modale avec `ExtensionsPreviewTable` (checkboxes pour les « available »), bouton « Add selected ».
3. **Add selected** : pour chaque ligne sélectionnée avec `status === "available"` et `manifest` présent, crée un nouvel item extra content (clone `defaultPanel`), remplit depuis le manifest (name, source, type `"extension"`, target, icon, refreshtime), `formatItem(..., "extracontents")`, puis `setValue([...newItems, ...value])`.

---

## 5. Dépendances à ajouter dans src/ (si on porte la feature)

- **Helpers** : `parseEmbeddedManifest` (exporter depuis `src/components/Helpers/extensions.js` ou équivalent, comme dans reference), `espHttpURL`.
- **Targets** : `webUIVersion`, `Target`, `targetCategory` (pour `matchTargetSystem`).
- **Hooks** : `useHttpQueue` pour les requêtes liste fichiers + HTML + JSON.
- **UI** : `Loading`, `List`, `CheckCircle`, `XCircle`, `PlusCircle` (preact-feather), `showModal` (Modal).
- **Traductions** : S237 (Scan for extensions), S242 (Extensions list), S243–S247 (colonnes tableau), S252 (extension %s not compatible), S253 (Filename), S254 (Add selected).

---

## 6. ExtraContent – Vérification compatibilité à l’affichage

Dans `reference/components/ExtraContent/extraContentItem.js`, pour `type === "extension"` :

- Après chargement du HTML de l’extension, `parseEmbeddedManifest(htmlText)`.
- Si manifest présent avec `supportedVersion` et `targetSystem` non vides : `matchVersion(webUIVersion, manifest.supportedVersion)` et `matchTargetSystem(manifest.targetSystem)` (liste = `targetSystem` split par virgule, normalisée en minuscules).
- Si non compatible : toast S252 (extension %s not compatible) et pas d’injection du contenu dans l’iframe.

À porter dans `src/components/ExtraContent/` (ou équivalent) si ce comportement n’y est pas déjà.

---

## 7. Résumé pour implémentation

1. **Helpers** : `parseEmbeddedManifest` dans `src/components/Helpers/extensions.js` (ou réutiliser/copier depuis reference).
2. **ItemsList (extracontents)** :  
   - Bouton « Extensions list » (S242).  
   - `openExtensionsPreview` : liste fichiers esp3dext*.html, pour chacun récupérer manifest (HTML embarqué ou .json), filtrer par version + targetSystem, construire lignes (filename, name, version, supportedVersion, targetSystem, source, status, manifest).  
   - Modale avec tableau (ExtensionsPreviewTable) + « Add selected » qui crée les items extra content à partir des manifests sélectionnés.
3. **ExtraContentItem** : pour type extension, vérifier manifest (supportedVersion + targetSystem) avant d’afficher ; sinon toast « not compatible ».
4. **Traductions** : S237, S242, S243–S247, S252, S253, S254 (au moins en).
5. **Export/import** : garder les clés metadata extensions hors export utilisateur (déjà en place dans reference import/export).

---

*Document généré pour faciliter le port de la gestion des extensions (scan + filtrage manifest) de `reference/` vers `src/`.*
