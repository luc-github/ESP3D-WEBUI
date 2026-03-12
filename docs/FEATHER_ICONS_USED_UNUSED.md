# Icônes Feather : utilisées vs non utilisées

Référence : `src/components/Images/icons.js` (toutes les icônes sont dans le picker IconSelect ; ici on liste celles qui sont **réellement référencées** ailleurs dans le code comme `icon: "Nom"` ou dans les défauts).

---

## Utilisées (référencées dans le code)

Ces noms apparaissent en dur dans les panels, les défauts ou les configs (macros, extra contents, etc.) :

| Nom | Où |
|-----|-----|
| **Cast** | Macros.js (panel) |
| **HardDrive** | Files.js (panel) |
| **Image** | Charts.js (panel) |
| **Layers** | Status.js, StatusCNC.js (panels) |
| **Loader** | LaserCNC.js (panel) |
| **MessageSquare** | Notifications.js (panel) |
| **Meh** | def_panel.json, def_macro.json (défaut nouveau panel / macro) |
| **Move** | Jog.js, JogPlotter.js, JogCNC.js (panels) |
| **Repeat** | OverridesCNC.js (panel) |
| **Sliders** | ExtraControls.js (panel) |
| **Target** | SpindleCNC.js (panel) |
| **Terminal** | Terminal.js (panel) |
| **Thermometer** | Temperatures.js (panel) |
| **Underline** | ProbeCNC.js (panel) |

**Total : 14 noms** (hors `Extruder`, qui vient de `iconsTarget`, pas Feather).

---

## Non utilisées (jamais référencées comme `icon`)

Ces noms sont uniquement présents dans `iconsFeather` (donc disponibles dans le picker) et ne sont utilisés nulle part dans le code comme `icon: "Nom"` ou dans les défauts :

- Activity  
- AlertCircle  
- Anchor  
- Aperture  
- Award  
- BarChart  
- BellOff  
- Bell  
- Bluetooth  
- Bookmark  
- Box  
- Camera  
- CheckCircle  
- ChevronDown  
- ChevronLeft  
- ChevronRight  
- ChevronUp  
- ChevronsDown  
- ChevronsLeft  
- ChevronsRight  
- ChevronsUp  
- Circle  
- Clipboard  
- Clock  
- Cpu  
- Crosshair  
- Database  
- Delete  
- Download  
- Droplet  
- Edit  
- EyeOff  
- Eye  
- File  
- Filter  
- Flag  
- Frown  
- GitCommit  
- Globe  
- Grid  
- Hash  
- Heart  
- HelpCircle  
- Home  
- Info  
- LifeBuoy  
- List  
- Lock  
- LogIn  
- LogOut  
- Mail  
- MapPin  
- Menu  
- MinusCircle  
- Monitor  
- Moon  
- MoreHorizontal  
- MoreVertical  
- PauseCircle  
- Percent  
- PlayCircle  
- PlusCircle  
- Power  
- Printer  
- Radio  
- RefreshCw  
- RotateCcw  
- Save  
- Scissors  
- Send  
- Server  
- Settings  
- Share  
- Slash  
- Smile  
- Star  
- StopCircle  
- Sun  
- Sunrise  
- Sunset  
- Tag  
- Tool  
- Trash2  
- Upload  
- VideoOff  
- Video  
- VolumeX  
- Volume  
- Wifi  
- WifiOff  
- Wind  
- XCircle  
- ZapOff  
- Zap  

**Total : 80 noms** (sans compter `None`, qui est `null`).

---

## Résumé

- **Utilisées** : 14  
- **Non utilisées** (uniquement dans le picker) : 80  
- **None** : 1 (pas une icône affichée)

Si tu retires des noms de la liste « non utilisées » dans `icons.js`, les utilisateurs qui avaient déjà choisi une de ces icônes pour une macro/panel (sauvegardé en preferences) verront une icône manquante jusqu’à ce qu’ils en resélectionnent une dans le picker.
