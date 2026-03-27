# CSS Class Migration Log

Suivi fichier par fichier des classes CSS utilisées dans `src/`.
Objectif : supprimer les inline styles, moderniser les combinaisons, et identifier les classes CSS inutilisées en fin de migration.

## Légende
- ✓ = Terminé
- ⬜ = En attente
- — = Aucun changement nécessaire (classes déjà optimales)

---

## Sommaire des fichiers

| # | Fichier | Statut | Note |
|---|---------|--------|------|
| 01 | [src/areas/footer.js](#01-srcareasfooterjs) | — | 1 classe, rien à faire |
| 02 | [src/areas/informations.js](#02-srcareasinformationsjs) | — | 2 classes, rien à faire |
| 03 | [src/areas/menu.js](#03-srcareasmenujs) | — | 1 classe, rien à faire |
| 04 | [src/areas/connection.js](#04-srcareasconnectionjs) | — | pas d'inline styles, classes OK |
| 05 | [src/areas/main.js](#05-srcareasmainjs) | — | 1 classe, rien à faire |
| 06 | [src/components/App/index.js](#06-srccomponentsappindexjs) | — | aucune classe CSS |
| 07 | [src/components/Controls/Button.js](#07-srccomponentscontrolsbuttonjs) | — | classes via createComponent, pas de JSX |
| 08 | [src/components/Controls/ButtonImg.js](#08-srccomponentscontrolsbuttonimgjs) | ⬜ | inline style dynamique (max-width prop) — à garder |
| 09 | [src/components/Controls/CenterLeft.js](#09-srccomponentscontrolscenterleftjs) | ✓ | |
| 10 | [src/components/Controls/CloseButton.js](#10-srccomponentscontrolsclosebuttonjs) | — | 1 classe, rien à faire |
| 11 | [src/components/Controls/ContainerHelper.js](#11-srccomponentscontrolscontainerhelperjs) | — | aucune classe CSS |
| 12 | [src/components/Controls/FieldGroup.js](#12-srccomponentscontrolsfieldgroupjs) | — | classes OK, rien à faire |
| 13 | [src/components/Controls/FullScreenButton.js](#13-srccomponentscontrolsfullscreenbuttonjs) | — | classes via ButtonImg, rien à faire |
| 14 | [src/components/Controls/Loading.js](#14-srccomponentscontrolsloadingjs) | — | classes via createComponent, pas de JSX |
| 15 | [src/components/Controls/Modal.js](#15-srccomponentscontrolsmodaljs) | — | classes via createComponent, pas de JSX |
| 16 | [src/components/Controls/Progress.js](#16-srccomponentscontrolsprogressjs) | — | 1 classe, rien à faire |
| 17 | [src/components/Controls/ScanAp.js](#17-srccomponentscontrolsscanapjs) | — | classes OK, rien à faire |
| 18 | [src/components/Controls/ScanExtensions.js](#18-srccomponentscontrolsscanextensionsjs) | ✓ | inline styles → text-center, d-flex flex-col items-center gap-1 |
| 19 | [src/components/Controls/ScanPacksList.js](#19-srccomponentscontrolsscanpackslistjs) | — | classes OK, rien à faire |
| 20 | [src/components/Controls/Toast.js](#20-srccomponentscontrolstoastjs) | — | classes via createComponent, pas de JSX |
| 21 | [src/components/Controls/Fields/Boolean.js](#21-srccomponentscontrolsfieldsbooleansjs) | — | classes OK, rien à faire |
| 22 | [src/components/Controls/Fields/FormGroup.js](#22-srccomponentscontrolsfieldsformgroupjs) | — | classes OK, rien à faire |
| 23 | [src/components/Controls/Fields/IconSelect.js](#23-srccomponentscontrolsfieldsiconselectjs) | — | classes OK, rien à faire |
| 24 | [src/components/Controls/Fields/Input.js](#24-srccomponentscontrolsfieldsinputjs) | ⬜ | inline style width dynamique — à garder |
| 25 | [src/components/Controls/Fields/ItemsList.js](#25-srccomponentscontrolsfieldsitemslistjs) | — | classes OK, rien à faire |
| 26 | [src/components/Controls/Fields/Label.js](#26-srccomponentscontrolsfieldslabeljs) | — | retourne null, aucune classe |
| 27 | [src/components/Controls/Fields/Mask.js](#27-srccomponentscontrolsfieldsmaskjs) | — | classes OK, rien à faire |
| 28 | [src/components/Controls/Fields/PickUp.js](#28-srccomponentscontrolsfieldspickupjs) | ✓ | cursor:pointer → c-hand |
| 29 | [src/components/Controls/Fields/Select.js](#29-srccomponentscontrolsfieldsselectjs) | — | classes OK, rien à faire |
| 30 | [src/components/Controls/Fields/Slider.js](#30-srccomponentscontrolsfieldssliderjs) | — | classes OK, rien à faire |
| 31 | [src/components/ExtraContent/extraContentItem.js](#31-srccomponentsextracontentextracontentitemjs) | — | classes OK, rien à faire |
| 32 | [src/components/ExtraContent/index.js](#32-srccomponentsextracontentindexjs) | — | classes OK, rien à faire |
| 33 | [src/components/Images/logo.js](#33-srccomponentsimageslogojs) | — | SVG, rien à faire |
| 34 | [src/components/Modal/confirmModal.js](#34-srccomponentsmodalconfirmmodaljs) | — | aucune classe CSS |
| 35 | [src/components/Modal/genericModal.js](#35-srccomponentsmodalgenericmodaljs) | — | classes OK, rien à faire |
| 36 | [src/components/Modal/index.js](#36-srccomponentsmodalindexjs) | — | classes OK, rien à faire |
| 37 | [src/components/Modal/keepConnectedModal.js](#37-srccomponentsmodalkeepconnectedmodaljs) | — | classes OK, rien à faire |
| 38 | [src/components/Modal/logginModal.js](#38-srccomponentsmodallogginmodaljs) | — | classes OK, rien à faire |
| 39 | [src/components/Modal/progressModal.js](#39-srccomponentsmodalprogressmodaljs) | — | classes OK, rien à faire |
| 40 | [src/components/Navbar/index.js](#40-srccomponentsnavbarindexjs) | ✓ | cursor:pointer → c-hand |
| 41 | [src/components/Panels/Charts.js](#41-srccomponentspanelschartsjs) | ⬜ | couleur dynamique rgb() — garder |
| 42 | [src/components/Panels/ExtraControls.js](#42-srccomponentspanelsextracontrolsjs) | — | classes OK, rien à faire |
| 43 | [src/components/Panels/ExtraPanel.js](#43-srccomponentspanelsextrapaneljs) | — | délègue à ExtraContent, aucune classe |
| 44 | [src/components/Panels/Extruders.js](#44-srccomponentspanelsextrudersjs) | — | classes OK, rien à faire |
| 45 | [src/components/Panels/Files.js](#45-srccomponentspanelsfilesjs) | ⬜ | width:2rem spacer — pas de classe utilitaire |
| 46 | [src/components/Panels/Jog.js](#46-srccomponentspanelsjogjs) | ⬜ | inline styles SVG (opacity, stroke) — garder |
| 47 | [src/components/Panels/JogCNC.js](#47-srccomponentspanelsjogcncjs) | — | classes OK, rien à faire |
| 48 | [src/components/Panels/JogPlotter.js](#48-srccomponentspanelsjogplotterjs) | — | classes OK, rien à faire |
| 49 | [src/components/Panels/Macros.js](#49-srccomponentspanelsmacrosjs) | — | classes OK, rien à faire |
| 50 | [src/components/Panels/Notifications.js](#50-srccomponentspanelsnotificationsjs) | — | classes OK, rien à faire |
| 51 | [src/components/Panels/Status.js](#51-srccomponentspanelsstatusjs) | — | classes OK, rien à faire |
| 52 | [src/components/Panels/Terminal.js](#52-srccomponentspanelsterminaljs) | — | classes OK, rien à faire |
| 53 | [src/components/Panels/Temperatures.js](#53-srccomponentspanelstemperaturesjs) | — | classes OK, rien à faire |
| 54 | [src/components/Panels/index.js](#54-srccomponentspanelsindexjs) | — | classes OK, rien à faire |
| 55 | [src/components/TabBar/index.js](#55-srccomponentstabbarindexjs) | — | classes OK, rien à faire |
| 56 | [src/components/Toast/index.js](#56-srccomponentstoastindexjs) | — | classes OK, rien à faire |
| 57 | [src/pages/about/index.js](#57-srcpagesaboutindexjs) | — | classes OK, rien à faire |
| 58 | [src/pages/dashboard/index.js](#58-srcpagesdashboardindexjs) | ⬜ | z-index:1000 — pas de classe utilitaire |
| 59 | [src/pages/extrapages/index.js](#59-srcpagesextrapagesindexjs) | — | classes OK, rien à faire |
| 60 | [src/pages/settings/index.js](#60-srcpagessettingsindexjs) | — | classes OK, rien à faire |
| 61 | [src/tabs/features/index.js](#61-srctabsfeaturesindexjs) | ✓ | height:100% → full-height |
| 62 | [src/tabs/interface/index.js](#62-srctabsinterfaceindexjs) | — | classes OK, rien à faire |
| 63 | [src/tabs/machine/index.js](#63-srctabsmachineindexjs) | — | classes OK, rien à faire |
| 64 | [src/targets/CNC/Controls/QuickStopButton.js](#64) | — | classes OK, rien à faire |
| 65 | [src/targets/CNC/GRBL/Controls/BackgroundContainer.js](#65) | — | classes OK, rien à faire |
| 66 | [src/targets/CNC/GRBL/Controls/InformationsControls.js](#66) | — | classes OK, rien à faire |
| 67 | [src/targets/CNC/GRBL/Controls/QuickButtonsBar.js](#67) | — | classes OK, rien à faire |
| 68 | [src/targets/CNC/GRBL/MachineSettings.js](#68) | — | `<center>` tag (déprécié mais fonctionnel), pas d'inline style |
| 69 | [src/targets/CNC/grblHAL/Controls/BackgroundContainer.js](#69) | — | classes OK, rien à faire |
| 70 | [src/targets/CNC/grblHAL/Controls/InformationsControls.js](#70) | — | classes OK, rien à faire |
| 71 | [src/targets/CNC/grblHAL/Controls/QuickButtonsBar.js](#71) | — | classes OK, rien à faire |
| 72 | [src/targets/CNC/grblHAL/MachineSettings.js](#72) | — | `<center>` tag, pas d'inline style |
| 73 | [src/targets/Printer3D/Controls/BackgroundContainer.js](#73) | — | classes OK, rien à faire |
| 74 | [src/targets/Printer3D/Controls/QuickStopButton.js](#74) | — | classes OK, rien à faire |
| 75 | [src/targets/Printer3D/Marlin/Controls/MixedExtrudersControl.js](#75) | ⬜ | background-color dynamique — garder |
| 76 | [src/targets/Printer3D/Marlin-embedded/Controls/MixedExtrudersControl.js](#76) | ⬜ | background-color dynamique — garder |
| 77 | [src/targets/Printer3D/Repetier/Controls/MixedExtrudersControl.js](#77) | ⬜ | background-color dynamique — garder |
| 78 | [src/targets/Printer3D/Smoothieware/MachineSettings.js](#78) | ⬜ | max-width inline styles — pas de classe utilitaire |
| 79 | [src/targets/SandTable/GRBL/MachineSettings.js](#79) | — | `<center>` tag, pas d'inline style |

---

## Détails par fichier

---

### 01 src/areas/footer.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `footer-container` | — |

---

### 02 src/areas/informations.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div id="infopage">` | `container m-2` | — |
| `<div>` | `information-buttons-bar m-2` | — |

---

### 03 src/areas/menu.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `menu-container` | — |

---

### 04 src/areas/connection.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<button>` | `btn btn-accent` | — |
| `<div>` (Loading wrapper) | `d-inline-block content-icon` | — |
| `<div>` outer | `empty fullscreen` | — |
| `<div>` | `centered text-primary` | — |
| `<div>` | `empty-icon` | — |
| `<div>` | `d-flex p-centered empty-content` | — |
| `<Minus>` / `<HardDrive>` | `hide-low` | — |
| `<div>` titre | `empty-title h5 {text-primary\|text-error}` | — |
| `<div>` | `empty-subtitle` | — |
| `<div>` | `empty-action` | — |

---

### 05 src/areas/main.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `main-page-container` | — |

---

### 06 src/components/App/index.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div id="app">` | *(aucune)* | — |

---

### 07 src/components/Controls/Button.js
**Statut : —** *(rien à faire)*

Classes assemblées via `createComponent("button", "btn", modifiers)` — pas de JSX direct.

| Modificateur prop | Classe CSS |
|-------------------|-----------|
| base | `btn` |
| `link` | `btn-link` |
| `primary` | `btn-primary` |
| `error` | `btn-error` |
| `success` | `btn-success` |
| `lg` | `btn-lg` |
| `sm` | `btn-sm` |
| `xs` | `btn-xs` |
| `block` | `btn-block` |
| `action` | `btn-action` |
| `circle` | `s-circle` |
| `active` | `active` |
| `loading` | `loading` |
| `tooltip` | `tooltip` |
| `btooltip` | `tooltip-bottom` |
| `ltooltip` | `tooltip tooltip-left` |
| `rtooltip` | `tooltip tooltip-right` |
| `mx2` | `mx-2` |
| `m05` | `m-05` |
| `m2` | `m-2` |
| `m1` | `m-1` |
| `mt1` | `mt-1` |
| `min2rem` | `min2rem` |
| `min1rem` | `min1rem` |
| `donotdisable` | `do-not-disable` |
| `group` | `input-group-btn` |

---

### 08 src/components/Controls/ButtonImg.js
**Statut : ⬜** *(inline style dynamique intentionnel)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<Button>` conditionnel | `feather-icon-container icon-button text-straight insensitive` | — |
| `<div>` inner | `insensitive text-straight` | — |
| `<label>` conditionnel | `hide-low` | — |
| `<label>` inline style | `style="display:inline;max-width:{prop width ou 3rem};margin-right:0.35rem"` | *garder — max-width est dynamique* |

**Note** : l'inline style sur `<label>` contient `max-width` dépendant du prop `width` → ne peut pas être remplacé par classe utilitaire statique.

---

### 09 src/components/Controls/CenterLeft.js
**Statut : ✓**

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` conditionnel `bordered=warning` | `bordered_warning m-2` + `style="display:inline-block;text-align:left;"` | `d-inline-block text-left bordered_warning m-2` |
| `<div>` conditionnel `bordered` autre | `bordered m-2` + `style="display:inline-block;text-align:left;"` | `d-inline-block text-left bordered m-2` |
| `<div>` sans `bordered` | *(aucune)* + `style="display:inline-block;text-align:left;"` | `d-inline-block text-left` |

**Inline style supprimé** : `display: inline-block; text-align: left;`

---

### 10 src/components/Controls/CloseButton.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<span>` | `btn btn-clear btn-close m-1` | — |

---

### 11 src/components/Controls/ContainerHelper.js
**Statut : —** *(rien à faire)*

Composant logique pur — aucune classe CSS dans le JSX.

---

### 12 src/components/Controls/FieldGroup.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<fieldset>` conditionnel | `fieldset-top-separator` \| `fieldset-no-top-separator` | — |
| `<fieldset>` conditionnel | `fieldset-bottom-separator field-group` \| `fieldset-no-bottom-separator field-group field-group-fullwidth` | — |
| `<label>` | `m-1` | — |
| `<div>` | `field-group-content` \| `field-group-content field-group-content-fullwidth` | — |

---

### 13 src/components/Controls/FullScreenButton.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<ButtonImg>` conditionnel | `btn btn-screen` (via prop `class`) | — |

Pas d'inline styles.

---

### 14 src/components/Controls/Loading.js
**Statut : —** *(rien à faire)*

Classes via `createComponent("div", "loading", modifiers)` — pas de JSX direct.

| Modificateur prop | Classe CSS |
|-------------------|-----------|
| base | `loading` |
| `lg` / `large` | `loading loading-lg` |

---

### 15 src/components/Controls/Modal.js
**Statut : —** *(rien à faire)*

Classes via `createComponent` — pas de JSX direct.

| Composant | Classe CSS |
|-----------|-----------|
| `Modal` base | `modal` |
| `Modal` lg/large | `modal text-lg` |
| `Modal` sm/small | `modal text-sm` |
| `Modal.Overlay` | `modal-overlay` |
| `Modal.Container` | `modal-container` |
| `Modal.Header` | `modal-header` |
| `Modal.Body` | `modal-body` |
| `Modal.Footer` | `modal-footer` |

---

### 16 src/components/Controls/Progress.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<label>` | `progress-value-label` | — |

---

### 17 src/components/Controls/ScanAp.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<table>` | `table` | — |
| `<thead>` | `hide-low` | — |

---

### 18 src/components/Controls/ScanExtensions.js
**Statut : ✓**

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<span>` | `text-gray` | — |
| `<div>` statusContent | `{className}` + `style="display:flex; flex-direction:column; align-items:center; gap:0.15rem;"` | `{className} d-flex flex-col items-center gap-1` |
| `<span>` | `feather-icon-container` | — |
| `<div>` | `form-group` | — |
| `<table>` | `table` | — |
| `<thead>` | `hide-low` | — |
| `<td>` vide | `text-gray` | — |
| `<input>` | `form-checkbox` | — |
| `<th>` (×4) | `style="text-align:center;"` | `text-center` |
| `<td>` (×4) | `style="text-align:center;"` | `text-center` |
| `<th>` largeur | `style="width:2rem;"` | *garder — valeur dynamique* |

**Inline styles supprimés** : `display:flex; flex-direction:column; align-items:center; gap:0.15rem;` et `text-align:center` (×8)

---

### 19 src/components/Controls/ScanPacksList.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<table>` | `table` | — |
| `<thead>` | `hide-low` | — |
| `<span>` | `tooltip tooltip-right` | — |

---

### 20 src/components/Controls/Toast.js
**Statut : —** *(rien à faire)*

Classes via `createComponent` — pas de JSX direct.

| Composant | Classe CSS |
|-----------|-----------|
| `Toast` base | `toast` |
| `Toast` primary | `toast toast-primary` |
| `Toast` success | `toast toast-success` |
| `Toast` warning | `toast toast-warning` |
| `Toast` error | `toast toast-error` |
| `Toast.Close` | `btn btn-clear float-right` |

---

### 21 src/components/Controls/Fields/Boolean.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<label>` | `form-switch` \| `form-switch tooltip tooltip-right` | — |
| `<i>` | `form-icon` | — |
| `<span>` conditionnel | `text-dark` \| `d-none` | — |

---

### 22 src/components/Controls/Fields/FormGroup.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `form-group` \| `form-group-inline form-group` \| `form-group has-modification` \| `has-success` \| `has-error` | — |
| `<div>` inner | `columns mt-2` \| `flex-cols` | — |
| `<label>` | `d-none` \| `form-label text-primary` \| `form-label text-dark` \| `form-label text-primary column col-auto` | — |
| `<div>` hint | `form-input-hint text-left` \| `form-input-hint text-center` | — |

---

### 23 src/components/Controls/Fields/IconSelect.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `input-group` | — |

---

### 24 src/components/Controls/Fields/Input.js
**Statut : ⬜** *(inline style width dynamique — à garder)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` password/shortkey | `has-icon-right` \| `has-icon-right column` | — |
| `<input>` | `form-input` | — |
| `<div>` Reveal | `form-icon passwordReveal` | — |
| `<EyeOff>/<Eye>` | `has-error icon-reveal` | — |
| `<div>` ClearText | `form-icon clearShortkey` | — |
| `<XCircle>` | `icon-clear` | — |
| `<div>` dropList/scan | `input-group` \| `input-group column` | — |
| `<input>` inline style | `style={width ? "width:"+width : ""}` | *garder — dynamique* |
| `<span>` | `input-group-addon` \| `input-group-addon tooltip tooltip-left` | — |
| `<ButtonImg>` | `input-group-btn` \| `input-group-btn nested-button` | — |
| `<ul>` | `selection-list` | — |
| `<li>` | `item-selection-list` | — |
| `<div>` default | `input-group has-button-submit` \| `input-group no-button-submit tooltip` | — |

---

### 25 src/components/Controls/Fields/ItemsList.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<fieldset>` | `fieldset-top-separator fieldset-bottom-separator field-group` \| `+ items-list-top-separator` | — |
| `<div>` spacer | `m-1` | — |
| `<div>` | `items-group-content` | — |
| `<div>` | `fields-line` | — |
| `<div>` | `item-list-move` | — |
| `<div>` | `item-list-name` | — |
| `<label>` | `m-2` | — |
| `<div>` editor | `itemEditor` | — |
| `<div>` | `m-1` | — |
| `className` conditionnel | `nested-button` \| `btn-save` \| `btn-restart` | — |
| `className` | `item-editor-close nested-button` | — |

---

### 26 src/components/Controls/Fields/Label.js
**Statut : —** *(rien à faire)*

Retourne `null` — aucune classe CSS dans le JSX.

---

### 27 src/components/Controls/Fields/Mask.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<FieldGroup className>` | `m-1` | — |

---

### 28 src/components/Controls/Fields/PickUp.js
**Statut : ✓**

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `input-group` \| `input-group column` | — |
| `<span>` | `form-input` + `style="cursor: pointer;"` | `form-input c-hand` |

**Inline style supprimé** : `cursor: pointer;`

---

### 29 src/components/Controls/Fields/Select.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` outer | *(vide)* \| `column` \| `tooltip tooltip-top` \| `column tooltip tooltip-top` | — |
| `<div>` | `dropdown` | — |
| `<span>` | `dropdown-toggle btn` | — |
| `<ul>` | `menu` | — |
| `<li>` | `menu-item` \| `menu-item active` | — |
| `<div>` | `menu-entry` | — |

---

### 30 src/components/Controls/Fields/Slider.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `slider-ctrl text-center hide-low` | — |
| `<input>` | `slider` | — |
| `<Input class>` | `show-low form-input text-center` | — |

---

### 31 src/components/ExtraContent/extraContentItem.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` erreur | `fallback-content` | — |
| `<div>` | `picture-container` | — |
| `<img>` | `cameraContainer` \| `imageContainer` | — |
| `<iframe>` | `extensionContainer` \| `contentContainer` | — |
| `<div>` contrôles | `m-2 image-button-bar` | — |
| `<div>` root | `extra-content-container` | — |

---

### 32 src/components/ExtraContent/index.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` contrôles page | `m-2 image-button-bar` | — |
| `<div>` page root | `page-container` | — |
| `<div>` page cible | `page-target-container` | — |
| `<div>` panel root | `panel panel-dashboard` | — |
| `<div>` panel cible | `panel-body panel-body-dashboard no-margin-no-padding panel-target-container` | — |

---

### 33 src/components/Images/logo.js
**Statut : —** *(SVG, rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<svg>` | `esp3dlogo` | — |

---

### 34 src/components/Modal/confirmModal.js
**Statut : —** *(rien à faire)*

Composant sans JSX direct — délègue à `showModal`. Aucune classe CSS.

---

### 35 src/components/Modal/genericModal.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` titre | `text-primary feather-icon-container modal_title` | — |
| `<button>` | `btn mx-2` \| `btn mx-2 {customClass}` | — |

---

### 36 src/components/Modal/index.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `modals-container` | — |
| `<SpectreModal>` | `active` | — |
| `<button>` | `d-none` \| `btn btn-clear float-right btn-close` | — |
| `<div>` | `modal-title h5` | — |
| `<div>` | `content` | — |

---

### 37 src/components/Modal/keepConnectedModal.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` titre | `text-primary feather-icon-container modal_title` | — |
| `<button>` | `btn mx-2` | — |

---

### 38 src/components/Modal/logginModal.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` titre | `text-primary feather-icon-container modal_title` | — |
| `<div>` | `form-horizontal` | — |
| `<div>` conditionnel | `error-login-message` | — |
| `<button>` | `btn mx-2` | — |

---

### 39 src/components/Modal/progressModal.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` titre | `text-primary feather-icon-container modal_title` | — |
| `<button>` | `btn mx-2` | — |

---

### 40 src/components/Navbar/index.js
**Statut : ✓**

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<header>` | `navbar` | — |
| `<section>` | `navbar-section` | — |
| `<Link>` logo | `navbar-brand logo no-box` | — |
| `<Link>` conditionnel | `d-none` | — |
| `<Link>` | `btn btn-link no-box feather-icon-container` | — |
| `<label>` | `hide-low` | — |
| `<div>` | `dropdown dropdown-right` | — |
| `<a>` | `btn btn-link no-box dropdown-toggle feather-icon-container` | — |
| `<ul>` | `menu` | — |
| `<li>` | `menu-item` | — |
| `<a>` | `feather-icon-container` | — |
| `<span>` conditionnel | `btn btn-link no-box mx-2 feather-icon-container` \| `d-none` | — |
| `<label>` logout | `hide-low` + `style="cursor:pointer;"` | `c-hand hide-low` |

**Inline style supprimé** : `cursor:pointer;`

---

### 41 src/components/Panels/Charts.js
**Statut : ⬜** *(couleur dynamique rgb() — garder)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `panel panel-dashboard` | — |
| `<div>` | `panel-body panel-body-dashboard` | — |
| `<div>` | `charts-container` | — |
| `<div>` | `charts-subcontainer` | — |
| `<canvas>` | `chart` | — |
| `<div>` | `m-1` | — |
| `<div>` (légende) | `legend-name` + `style="color:rgb(...)"` | *garder — couleur dynamique* |
| `<div>` | `chart-legend` | — |

**Inline style gardé** : `color:rgb(...)` — valeur dynamique

---

### 42 src/components/Panels/ExtraControls.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `extra-ctrls` | — |
| `<div>` | `extra-control mt-1 tooltip tooltip-bottom` | — |
| `<div>` | `extra-control-header` | — |
| `<div>` | `extra-control-value` | — |
| `<div>` | `extra-ctrls-container m-1` | — |
| `<div>` | `extra-ctrl-name` | — |
| `<div>` | `extra-ctrls-container2` | — |
| `<div>` | `extra-ctrl-send [dynamic]` | — |
| `<div>` | `panel panel-dashboard` | — |
| `<div>` | `panel-body panel-body-dashboard` | — |
| `<div>` | `extruders-container` | — |
| `<div>` | `loading-panel` | — |
| `<div>` | `m-1` `m-2` | — |

---

### 43 src/components/Panels/ExtraPanel.js
**Statut : —** *(aucune classe CSS — délègue à ExtraContent)*

---

### 44 src/components/Panels/Extruders.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `panel panel-dashboard` | — |
| `<div>` | `panel-body panel-body-dashboard` | — |
| `<div>` | `extruders-container` | — |
| `<div>` | `extruder-ctrl-name` | — |
| `<div>` | `extruder-ctrls-container m-1` | — |
| `<div>` | `extruder-ctrl-send m-2 [dynamic]` | — |
| `<div>` | `divider` | — |
| `<label>` | `form-label` | — |
| `<input>` | `form-input` | — |
| `<div>` | `loading-panel` | — |
| `<div>` | `m-1` `m-2` | — |

---

### 45 src/components/Panels/Files.js
**Statut : ⬜** *(width inline styles — pas de classe utilitaire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `panel panel-dashboard` | — |
| `<div>` conditionnel | `d-none` | — |
| `<div>` | `panel-body panel-body-dashboard files-panel-body` | — |
| `<div>` | `input-group` | — |
| `<div>` | `dropdown` | — |
| `<span>` | `dropdown-toggle btn` | — |
| `<ul>` | `menu` | — |
| `<li>` conditionnel | `menu-item active` | — |
| `<div>` | `menu-entry` | — |
| `<div>` | `form-control form-control-path` | — |
| `<div>` | `drop-zone files-list` | — |
| `<div>` | `file-line file-line-name` | — |
| `<div>` | `file-line-controls` | — |
| `<div>` | `files-list-footer filelist-occupation` | — |
| `<div>` | `flex-pack` `flex-pack m-2` `flex-pack hide-low m-1` | — |
| `<div>` | `bar bar-sm` | — |
| `<div>` | `bar-item` | — |
| spacer `<div>` | `style="width:2rem"` | *garder — pas de classe utilitaire* |
| barre `<div>` | `bar bar-sm` + `style="width:4rem"` | *garder — pas de classe utilitaire* |
| `<div>` | `bar-item` + `style="width:{occupation}%"` | *garder — valeur dynamique* |

**Inline styles gardés** : `width:2rem`, `width:4rem`, `width:{occupation}%`

---

### 46 src/components/Panels/Jog.js
**Statut : ⬜** *(inline styles SVG — garder)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `jog-positions-ctrls` | — |
| `<div>` | `jog-position-ctrl` | — |
| `<div>` | `jog-position-header` | — |
| `<div>` | `m-1 jog-position-value` | — |
| `<label>` | `form-label` | — |
| `<input>` | `form-input` | — |
| `<div>` | `panel panel-dashboard` | — |
| `<div>` | `panel-body panel-body-dashboard` | — |
| `<div>` | `m-1 jog-container` | — |
| `<div>` conditionnel | `m-1` \| `show-low m-1` | — |
| `<div>` | `jog-buttons-main-container` | — |
| `<div>` | `m-1 jog-buttons-container` | — |
| `<span>` | `text-tiny` | — |
| `<div>` | `btn-group jog-distance-selector-container` | — |
| `<center>` | `jog-distance-selector-header` | — |
| `<div>` | `flatbtn tooltip tooltip-left` | — |
| `<label>` | `last-button` | — |
| `<div>` | `hide-low jog-svg-container` | — |
| SVG `<g>` | `home` `std` `scl` `jog` `cross` `posscl` `movez` `r10` | — |
| `<div>` | `jog-extra-buttons-container` | — |
| SVG `<g>` | `style="opacity:0.2"` | *garder — SVG* |
| SVG `<line>` | `style="stroke:black;stroke-width:1"` | *garder — SVG* |
| SVG `<g>` | `style="pointer-events:none;"` | *garder — SVG* |

**Inline styles gardés** : `opacity:0.2`, `stroke:black;stroke-width:1`, `pointer-events:none` — SVG-spécifiques

---

### 47 src/components/Panels/JogCNC.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `jog-positions-ctrls m-1` | — |
| `<div>` | `jog-position-ctrl` | — |
| `<div>` | `jog-position-sub-header` | — |
| `<div>` | `m-1 jog-position-value` | — |
| `<label>` | `form-label` | — |
| `<input>` | `form-input` | — |
| `<div>` | `panel panel-dashboard` | — |
| `<div>` | `panel-body panel-body-dashboard` | — |
| `<div>` | `m-1 jog-container` | — |
| `<div>` | `jog-buttons-main-container` | — |
| `<div>` | `m-1 jog-buttons-container` | — |
| `<span>` | `text-tiny` | — |
| `<div>` | `btn-group jog-distance-selector-container` | — |
| `<center>` | `jog-distance-selector-header` | — |
| `<div>` conditionnel | `d-none` | — |
| `<div>` | `flatbtn tooltip tooltip-left` | — |
| `<label>` | `last-button` | — |
| `<div>` | `m-1 jog-buttons-container-horizontal` | — |
| `<div>` | `form-group m-2 text-primary` | — |
| `<select>` | `form-select` | — |
| `<div>` | `jog-extra-buttons-container` | — |
| `<label>` | `text-like-icon` | — |
| `<span>` | `text-error` | — |

---

### 48 src/components/Panels/JogPlotter.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `jog-positions-ctrls m-1` | — |
| `<div>` | `jog-position-ctrl` | — |
| `<div>` | `jog-position-sub-header` | — |
| `<div>` | `m-1 jog-position-value` | — |
| `<input>` | `form-input` | — |
| `<div>` | `panel panel-dashboard` | — |
| `<div>` | `panel-body panel-body-dashboard` | — |
| `<div>` | `m-1 jog-container` | — |
| `<div>` | `jog-buttons-main-container` | — |
| `<div>` | `m-1 jog-buttons-container` | — |
| `<div>` | `jog-buttons-line-top-container` | — |
| `<div>` | `jog-buttons-line-container` | — |
| `<div>` | `jog-buttons-line-bottom-container` | — |
| `<div>` | `button-minimal` | — |
| `<div>` | `btn-group jog-distance-selector-container` | — |
| `<center>` | `jog-distance-selector-header` | — |
| `<div>` conditionnel | `d-none` | — |
| `<div>` | `flatbtn tooltip tooltip-left` | — |
| `<label>` | `last-button` | — |
| `<div>` | `jog-extra-buttons-container` | — |
| `<span>` | `text-error` | — |

---

### 49 src/components/Panels/Macros.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `panel panel-dashboard` | — |
| `<div>` | `panel-body panel-body-dashboard` | — |
| `<div>` | `macro-buttons-panel` | — |

---

### 50 src/components/Panels/Notifications.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<span>` | `menu-switch` / `menu-switch-on` / `menu-switch-pause` (dynamic) | — |
| `<span>` | `btn btn-clear` | — |
| `<div>` | `panel panel-dashboard` | — |
| `<div>` | `m-1` | — |
| `<div>` | `panel-body panel-body-dashboard terminal m-1` | — |
| `<div>` | `[classText] feather-icon-container notification-line` (dynamic) | — |
| `<label>` | `m-1` | — |

---

### 51 src/components/Panels/Status.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `extra-control-value flex-row-between` | — |
| `<div>` | `m-1` | — |
| `<div>` | `status-ctrls` | — |
| `<div>` | `extra-control mt-1 tooltip tooltip-bottom` | — |
| `<div>` | `extra-control-header` | — |
| `<div>` | `extra-control-value m-1` / `extra-control-value` | — |
| `<div>` | `status-control mt-1 tooltip tooltip-bottom` | — |
| `<div>` | `status-control-header` | — |
| `<div>` | `status-control-value` | — |
| `<div>` | `panel panel-dashboard` | — |
| `<div>` | `panel-body panel-body-dashboard` | — |
| `<fieldset>` | `fieldset-top-separator fieldset-bottom-separator field-group` | — |
| `<div>` | `field-group-content maxwidth` | — |
| `<div>` | `print-buttons-container` | — |

---

### 52 src/components/Panels/Terminal.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<span>` | `menu-switch` / `menu-switch-on` (dynamic) | — |
| `<span>` | `btn btn-clear` | — |
| `<div>` | `panel panel-dashboard` | — |
| `<div>` | `input-group m-1` | — |
| `<input>` | `form-input` | — |
| `<div>` | `show-low` | — |
| `<div>` | `m-2` | — |
| `<div>` | `panel-body panel-body-dashboard terminal m-1` | — |
| `<pre>` | `action` | — |
| `<pre>` | `[line.lineClass]` (dynamic) | — |

---

### 53 src/components/Panels/Temperatures.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `temperatures-ctrls` | — |
| `<div>` | `temperatures-ctrl mt-1 tooltip tooltip-bottom` | — |
| `<div>` | `temperatures-header` | — |
| `<div>` | `temperatures-value` | — |
| `<div>` | `temperatures-target` | — |
| `<div>` | `temperature-ctrls-container m-1` | — |
| `<div>` | `temperature-ctrl-name` | — |
| `<div>` | `temperature-ctrls-container2` | — |
| `<div>` | `temperature-ctrl-stop m-1` | — |
| `<div>` | `m-1` | — |
| `<div>` | `temperature-ctrl-send [dynamic]` | — |
| `<div>` | `panel panel-dashboard` | — |
| `<div>` | `panel-body panel-body-dashboard` | — |
| `<div>` | `temperatures-container` | — |
| `<div>` | `temperature-extra-buttons-container m-2` | — |
| `<div>` | `loading-panel` | — |
| `<div>` | `m-2` | — |

---

### 54 src/components/Panels/index.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `dropdown dropdown-right` | — |
| `<span>` | `dropdown-toggle btn btn-xs btn-header m-1` | — |
| `<ul>` | `menu` | — |
| `<li>` | `divider` | — |
| `<li>` | `menu-item` | — |
| `<div>` | `menu-entry` | — |
| `<div>` | `menu-panel-item` | — |
| `<span>` | `text-menu-item` | — |

---

### 55 src/components/TabBar/index.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<ul>` | `tab tab-block` | — |
| `<li>` | `tab-item` | — |
| `<a>` | `btn btn-link no-box feather-icon-container` | — |
| `<a>` conditionnel | `d-none` | — |
| `<label>` | `hide-low` | — |

---

### 56 src/components/Toast/index.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `toasts-container` | — |
| `<div>` | `alert-icon-wrap` | — |
| `<span>` | `toast-text` | — |
| `<div>` | `alert-body` | — |
| `<div>` | `alert-title` | — |
| `<div>` | `alert-msg` | — |

---

### 57 src/pages/about/index.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `container` | — |
| `<li>` | `feather-icon-container` | — |
| `<span>` | `text-dark text-label` | — |
| `<div>` conditionnel | `d-none` | — |
| `<span>` | `text-primary` | — |

---

### 58 src/pages/dashboard/index.js
**Statut : ⬜** *(z-index:1000 — pas de classe utilitaire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<table>` | `table` | — |
| `<div>` | `buttons-bar m-2` | — |
| `<div>` | `dropdown` | — |
| `<span>` | `dropdown-toggle btn tooltip tooltip-right m-1` | — |
| `<ul>` | `menu` | — |
| `<li>` | `menu-item` | — |
| `<div>` | `menu-entry` | — |
| `<div>` | `menu-panel-item` | — |
| `<span>` | `text-menu-item feather-icon-container` | — |
| `<span>` conditionnel | `menu-switch` \| `menu-switch-on` | — |
| `<li>` | `divider` | — |
| `<div>` | `panels-container m-2` | — |
| `<div>` conditionnel | `panel-drag-wrapper` + `panel-drop-indicator-{side}` | — |
| `<div>` | `style="z-index:1000"` | *garder — pas de classe utilitaire* |

**Inline style gardé** : `z-index:1000`

---

### 59 src/pages/extrapages/index.js
**Statut : —** *(aucune classe CSS)*

---

### 60 src/pages/settings/index.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `container` | — |

---

### 61 src/tabs/features/index.js
**Statut : ✓**

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` conditionnel | `d-none` | — |
| `<h4>` | `show-low title` | — |
| `<div>` | `m-2` | — |
| `<div>` | `panels-container` | — |
| `<div>` | `panel panel-features` | — |
| `<div>` | `navbar` | — |
| `<span>` | `navbar-section text-ellipsis` | — |
| `<span>` | `panel-title text-ellipsis` | — |
| `<span>` | `navbar-section` | — |
| `<span>` | `label label-primary align-top` | — |
| `<div>` | `panel-body panel-body-features` | — |
| `<div>` | `m-1` | — |
| `<span>` | `style="height:100%;"` | `full-height` |

**Inline style supprimé** : `height:100%` → `full-height`

---

### 62 src/tabs/interface/index.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` conditionnel | `d-none` | — |
| `<h4>` | `show-low title` | — |
| `<div>` | `m-2` | — |
| `<div>` | `panels-container` | — |
| `<div>` | `panel panel-interface` | — |
| `<div>` | `navbar` | — |
| `<span>` | `navbar-section text-ellipsis` | — |
| `<span>` | `panel-title text-ellipsis` | — |
| `<div>` | `panel-body panel-body-interface` | — |
| `<div>` | `m-1` | — |

---

### 63 src/tabs/machine/index.js
**Statut : —** *(aucune classe CSS)*

---

### 64 src/targets/CNC/Controls/QuickStopButton.js
**Statut : —** *(aucune classe CSS)*

---

### 65 src/targets/CNC/GRBL/Controls/BackgroundContainer.js
**Statut : —** *(aucune classe CSS)*

---

### 66 src/targets/CNC/GRBL/Controls/InformationsControls.js
**Statut : —** *(aucune classe CSS)*

---

### 67 src/targets/CNC/GRBL/Controls/QuickButtonsBar.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `quick-buttons-bar` | — |

---

### 68 src/targets/CNC/GRBL/MachineSettings.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `container` | — |
| `<h4>` | `show-low title` | — |
| `<div>` | `m-2` | — |
| `<center>` | `m-2` | — |
| `<div>` | `comment m-1` | — |
| `<div>` | `m-1` | — |

---

### 69 src/targets/CNC/grblHAL/Controls/BackgroundContainer.js
**Statut : —** *(aucune classe CSS)*

---

### 70 src/targets/CNC/grblHAL/Controls/InformationsControls.js
**Statut : —** *(aucune classe CSS)*

---

### 71 src/targets/CNC/grblHAL/Controls/QuickButtonsBar.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `quick-buttons-bar` | — |

---

### 72 src/targets/CNC/grblHAL/MachineSettings.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `container` | — |
| `<h4>` | `show-low title` | — |
| `<div>` | `m-2` | — |
| `<center>` | `m-2` | — |
| `<div>` | `comment m-1` | — |
| `<div>` | `m-1` | — |

---

### 73 src/targets/Printer3D/Controls/BackgroundContainer.js
**Statut : —** *(aucune classe CSS)*

---

### 74 src/targets/Printer3D/Controls/QuickStopButton.js
**Statut : —** *(aucune classe CSS)*

---

### 75 src/targets/Printer3D/Marlin/Controls/MixedExtrudersControl.js
**Statut : ⬜** *(background-color dynamique — garder)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `mixed-extruders-container` | — |
| `<div>` | `m-1` | — |
| `<div>` | `mixed-extruder-control m-1` | — |
| `<div>` | `mixed-extruder-control-header` | — |
| `<div>` | `label` | — |
| `<div>` conditionnel | `d-none` (×3, dynamic) | — |
| `<div>` | `m-2` | — |
| `<div>` | `style={background-color: ...}` | *garder — valeur dynamique* |

**Inline style gardé** : `background-color` — valeur dynamique

---

### 76 src/targets/Printer3D/Marlin-embedded/Controls/MixedExtrudersControl.js
**Statut : ⬜** *(background-color dynamique — garder)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `mixed-extruders-container` | — |
| `<div>` | `m-1` | — |
| `<div>` | `mixed-extruder-control m-1` | — |
| `<div>` | `mixed-extruder-control-header` | — |
| `<div>` | `label` | — |
| `<div>` conditionnel | `d-none` (×3, dynamic) | — |
| `<div>` | `m-2` | — |
| `<div>` | `style={background-color: ...}` | *garder — valeur dynamique* |

**Inline style gardé** : `background-color` — valeur dynamique

---

### 77 src/targets/Printer3D/Repetier/Controls/MixedExtrudersControl.js
**Statut : ⬜** *(background-color dynamique — garder)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `mixed-extruders-container` | — |
| `<div>` | `m-1` | — |
| `<div>` | `mixed-extruder-control m-1` | — |
| `<div>` | `mixed-extruder-control-header` | — |
| `<div>` | `label` | — |
| `<div>` conditionnel | `d-none` (×3, dynamic) | — |
| `<div>` | `m-2` | — |
| `<div>` | `style={background-color: ...}` | *garder — valeur dynamique* |

**Inline style gardé** : `background-color` — valeur dynamique

---

### 78 src/targets/Printer3D/Smoothieware/MachineSettings.js
**Statut : ⬜** *(max-width + margin-left inline styles — garder)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `container` + `style="max-width:600px"` | *garder — pas de classe utilitaire* |
| `<h4>` | `show-low title` | — |
| `<div>` | `m-2` | — |
| `<div>` conditionnel | `d-none` | — |
| `<div>` | `bordered` | — |
| `<div>` | `comment m-1 text-left` | — |
| `<div>` | `text-secondary m-1 text-left` | — |
| `<div>` | `text-small text-gray text-italic text-left` | — |
| `<div>` | `m-1` | — |
| `<div>` | `text-primary m-2` | — |
| `<div>` | `form-group` | — |
| `<label>` | `form-radio form-inline` | — |
| `<i>` | `form-icon` | — |
| `<input>` | `style="max-width:10rem;"` | *garder — pas de classe utilitaire* |
| `<div>` | `style="margin-left:2rem; ..."` | *garder — valeur dynamique* |

**Inline styles gardés** : `max-width:600px`, `max-width:10rem`, `margin-left:2rem`

---

### 79 src/targets/SandTable/GRBL/MachineSettings.js
**Statut : —** *(rien à faire)*

| Élément | Classes avant | Classes après |
|---------|--------------|---------------|
| `<div>` | `container` | — |
| `<h4>` | `show-low title` | — |
| `<div>` | `m-2` | — |
| `<center>` | `m-2` | — |
| `<div>` | `comment m-1` | — |
| `<div>` | `m-1` | — |

---

## Classes CSS confirmées utilisées (running list)

| Classe CSS | Fichiers | Statut |
|------------|---------|--------|
| `bordered` | CenterLeft.js | ✓ utilisée |
| `bordered_warning` | CenterLeft.js | ✓ utilisée |
| `d-inline-block` | CenterLeft.js, connection.js | ✓ utilisée |
| `text-left` | CenterLeft.js | ✓ utilisée |
| `m-2` | CenterLeft.js + beaucoup | ✓ utilisée |
