# Mapping Classes Spectre CSS → Vanilla CSS Custom

## Classes Utilitaires (✅ Déjà implémentées en _custom-utilities.scss)

### Display
- ✅ `.d-none` → Vanilla CSS
- ✅ `.d-block` → Vanilla CSS
- ✅ `.d-inline` → Vanilla CSS
- ✅ `.d-inline-block` → Vanilla CSS
- ✅ `.d-flex` → Vanilla CSS
- ✅ `.d-inline-flex` → Vanilla CSS
- ✅ `.d-visible` → Vanilla CSS
- ✅ `.d-invisible` → Vanilla CSS

### Spacing (Margin & Padding)
- ✅ `.m-0`, `.m-1`, `.m-2` → Vanilla CSS
- ✅ `.mb-*`, `.ml-*`, `.mr-*`, `.mt-*` → Vanilla CSS
- ✅ `.mx-*`, `.my-*` → Vanilla CSS
- ✅ `.p-0`, `.p-1`, `.p-2` → Vanilla CSS
- ✅ `.pb-*`, `.pl-*`, `.pr-*`, `.pt-*` → Vanilla CSS
- ✅ `.px-*`, `.py-*` → Vanilla CSS

### Text Utilities
- ✅ `.text-primary`, `.text-dark`, `.text-gray` → Vanilla CSS (utilise tokens)
- ✅ `.text-success`, `.text-warning`, `.text-error` → Vanilla CSS
- ✅ `.text-left`, `.text-right`, `.text-center`, `.text-justify` → Vanilla CSS
- ✅ `.text-bold`, `.text-italic`, `.text-small`, `.text-large` → Vanilla CSS
- ✅ `.text-uppercase`, `.text-lowercase`, `.text-capitalize` → Vanilla CSS
- ✅ `.text-ellipsis`, `.text-muted` → Vanilla CSS

### Background
- ✅ `.bg-primary`, `.bg-dark`, `.bg-gray`, `.bg-success`, `.bg-warning`, `.bg-error` → Vanilla CSS

### Positioning
- ✅ `.p-relative`, `.p-absolute`, `.p-fixed`, `.p-sticky` → Vanilla CSS
- ✅ `.float-left`, `.float-right` → Vanilla CSS
- ✅ `.p-centered`, `.flex-centered`, `.centered` → Vanilla CSS

### Responsive
- ✅ `.hide-low`, `.show-low` → Vanilla CSS with media queries

### Border & Radius
- ✅ `.s-rounded`, `.s-circle` → Vanilla CSS

### Cursor
- ✅ `.c-hand`, `.c-move`, `.c-zoom-in`, `.c-zoom-out`, `.c-not-allowed` → Vanilla CSS

---

## Classes Form (✅ Déjà implémentées en _custom-form-elements.scss)

### Form Structure
- ✅ `.form-group` → Vanilla CSS
- ✅ `.form-label`, `.label-sm`, `.label-lg` → Vanilla CSS
- ✅ `fieldset`, `legend` → Vanilla CSS (HTML5 native)

### Input Types
- ✅ `.form-input` → Vanilla CSS
- ✅ `.form-select` → Vanilla CSS
- ✅ `.form-input[type="file"]` → Vanilla CSS
- ✅ `textarea.form-input` → Vanilla CSS
- ✅ `.input-sm`, `.input-lg`, `.input-inline` → Vanilla CSS

### Form States
- ✅ `.form-input:focus` → Vanilla CSS
- ✅ `.has-success`, `.is-success` → Vanilla CSS
- ✅ `.has-error`, `.is-error` → Vanilla CSS
- ✅ `.form-input:disabled`, `.form-input[readonly]` → Vanilla CSS

### Icons in Forms
- ✅ `.has-icon-left`, `.has-icon-right` → Vanilla CSS
- ✅ `.form-icon` → Vanilla CSS

### Input Groups
- ✅ `.input-group` → Vanilla CSS (flex layout)
- ✅ `.input-group-addon` → Vanilla CSS
- ✅ `.input-group-btn` → Vanilla CSS

### Checkboxes, Radios, Switches
- ✅ `.form-checkbox`, `.form-radio`, `.form-switch` → Vanilla CSS
- ✅ `.form-checkbox input:checked + .form-icon` → Vanilla CSS
- ✅ `.form-switch input:checked + .form-icon` → Vanilla CSS

---

## Composants Buttons (✅ Déjà implémentés en _custom-components.scss)

### Button Styles
- ✅ `.btn` → Vanilla CSS
- ✅ `.btn-primary` → Vanilla CSS (var(--a-f2), var(--a-dim))
- ✅ `.btn-success` → Vanilla CSS (var(--ok))
- ✅ `.btn-error` → Vanilla CSS (var(--err))
- ✅ `.btn-link` → Vanilla CSS
- ✅ `.btn-clear` → Vanilla CSS

### Button Sizes
- ✅ `.btn-sm`, `.btn-lg` → Vanilla CSS
- ✅ `.btn-block` → Vanilla CSS
- ✅ `.btn-action` → Vanilla CSS

### Button Groups
- ✅ `.btn-group` → Vanilla CSS (flex layout)
- ✅ `.btn-group-block` → Vanilla CSS

---

## Composants Labels & Badges (✅ Implémentés)

- ✅ `.label` → Vanilla CSS
- ✅ `.label-rounded`, `.label-primary`, `.label-success` → Vanilla CSS
- ✅ `.badge`, `.badge[data-badge]` → Vanilla CSS

---

## Composants Core (✅ Implémentés)

### Progress Bar
- ✅ `.bar`, `.bar-sm` → Vanilla CSS
- ✅ `.bar-item` → Vanilla CSS

### Card & Panel
- ✅ `.card`, `.panel` → Vanilla CSS
- ✅ `.card-header`, `.card-body`, `.card-footer` → Vanilla CSS
- ✅ `.panel-header`, `.panel-body`, `.panel-footer` → Vanilla CSS
- ✅ `.panel-body-dashboard`, `.panel-body-interface`, `.panel-body-features` → Vanilla CSS

### Navbar
- ✅ `.navbar` → Vanilla CSS
- ✅ `.navbar-section`, `.navbar-center`, `.navbar-brand` → Vanilla CSS

### Tabs
- ✅ `.tab`, `.tab-item` → Vanilla CSS
- ✅ `.tab-block` → Vanilla CSS
- ✅ `.tab-item.active` → Vanilla CSS

### Menu & Dropdown
- ✅ `.dropdown` → Vanilla CSS
- ✅ `.dropdown-toggle` → CSS class (no JS required, uses :focus)
- ✅ `.menu`, `.menu-item` → Vanilla CSS
- ✅ `.menu-badge`, `.menu-nav` → Vanilla CSS

### Modal & Overlay
- ✅ `.modal` → Vanilla CSS
- ✅ `.modal.active` → Vanilla CSS class
- ✅ `.modal-container`, `.modal-header`, `.modal-body`, `.modal-footer` → Vanilla CSS
- ✅ `.modal-overlay` → Vanilla CSS
- ✅ `.modal-sm`, `.modal-lg` → Vanilla CSS

### Toast
- ✅ `.toast` → Vanilla CSS
- ✅ `.toast-primary`, `.toast-success`, `.toast-warning`, `.toast-error` → Vanilla CSS

### Tooltip
- ✅ `.tooltip` → Vanilla CSS (uses CSS ::after with data attribute)
- ✅ `.tooltip-right`, `.tooltip-bottom`, `.tooltip-left` → Vanilla CSS

### Table
- ✅ `.table` → Vanilla CSS
- ✅ `.table-striped`, `.table-hover`, `.table-scroll` → Vanilla CSS

### Slider
- ✅ `.slider` → Vanilla CSS
- ✅ `.slider::-webkit-slider-thumb`, `.slider::-moz-range-thumb` → Vanilla CSS

### Images & Media
- ✅ `.img-responsive`, `.img-fit-cover`, `.img-fit-contain` → Vanilla CSS

### Loading & Empty
- ✅ `.loading`, `.loading-lg` → Vanilla CSS with @keyframes
- ✅ `.empty` → Vanilla CSS

### Navigation
- ✅ `.nav`, `.nav-item` → Vanilla CSS

---

## Code & Typography

- ✅ `code` → Vanilla CSS
- ✅ `.code` → Vanilla CSS
- ✅ `small`, `sub`, `sup` → HTML5 native + Vanilla CSS

---

## 📋 Fichiers JSX à mettre à jour

Aucun changement de classe CSS nécessaire - tout est compatible !
Les classes existantes Spectre CSS vont maintenant charger depuis nos fichiers custom.

### À vérifier
- [ ] Modal component React (`src/components/Modal/index.js`)
- [ ] Toast component React (`src/components/Toast/index.js`)
- [ ] Vérifier si classes personnalisées appliquées dans `src/style/components/` fonctionnent

---

## 🎯 Prochaines étapes

1. ✅ Créer fichiers _custom-*.scss
2. ✅ Mettre à jour index.scss
3. ⏳ Tester le build webpack
4. ⏳ Valider visuellement dans le navigateur
5. ⏳ Supprimer _spectre.scss du repo
6. ⏳ Supprimer dépendance package.json
7. ⏳ Optimiser bundle

---

## 📊 Comparaison de tailles

| Élément | Spect re CSS | Custom CSS | Gain |
|---------|------|---------|------|
| Utilitaires | ~5KB | ~2KB | -60% |
| Forms | ~8KB | ~5KB | -37% |
| Components | ~12KB | ~8KB | -33% |
| **TOTAL** | **~25KB** | **~15KB** | **-40%** |

(Valeurs gzipped estimées)
