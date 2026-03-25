# ESP3D WebUI - Spectre CSS Removal - Phase 2: Quick Build Test

## Commandes à exécuter

```bash
# 1. Installer les dépendances (au cas où)
npm install

# 2. Tester le build de développement
npm run build:dev

# 3. Vérifier les erreurs de compilation
npm run build:prod

# 4. Vérifier la taille du bundle CSS
ls -lh build/main.css
gzip -c build/main.css | wc -c
```

## À vérifier visuellement

1. ✓ Page se charge sans erreurs JavaScript
2. ✓ Styles CSS appliqués correctement
3. ✓ Boutons ont la bonne couleur (accent Design System)
4. ✓ Formulaires affichent correctement
5. ✓ Panneaux et modales font apparaître
6. ✓ Spacing/padding OK
7. ✓ Responsive design fonctionne

## Classes CSS à tester immédiatement

- [ ] `.btn` - tous les variants (.btn-primary, .btn-link, etc.)
- [ ] `.form-input`, `.form-select`
- [ ] `.d-flex`, `.d-none`, spacing (`.m-1`, `.p-2`, etc.)
- [ ] `.navbar`, `.tab`, `.menu`
- [ ] `.panel`, `.modal`
- [ ] `.toast`, `.tooltip`

## Si erreurs de compilation SCSS

1. Vérifier syntax SCSS (parentheses, semicolons)
2. Vérifier imports manquants
3. Vérifier variables non définies (utiliser `--token` var() ou $variable SCSS)

## Prochaines phases après validation

### Phase 2: Styles spécifiques à ESP3D
- Adapter les styles custom dans `src/style/components/`
- Vérifier les classes spéciales (.emergency-btn, .quick-buttons-bar, etc.)

### Phase 3: Modal & Toast React
- Mettre à jour les composants si nécessaire
- Adapter les styles Spectre restants

### Phase 4: Nettoyage
- Supprimer `_spectre.scss`
- Supprimer `_spectre-icons.scss`
- Supprimer `_spectre-exp.scss`
- Supprimer dépendance package.json
- Tester à nouveau
