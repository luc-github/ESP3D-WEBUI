# Icônes Feather : utilisées vs non utilisées

Référence : `src/components/Images/icons.js` (toutes les icônes sont dans le picker IconSelect ; ici on liste celles qui sont **réellement utilisées** : soit `icon: "Nom"` dans les configs, soit utilisées comme composant dans le code).  
*Liste vérifiée en parcourant tous les `import … from "preact-feather"` du projet.*

---

## Utilisées (référencées dans le code)

Ces noms apparaissent en dur dans les panels/défauts (`icon: "Nom"`) ou sont utilisés comme composant (ex. `<File />` dans Files.js) :

| Nom | Où |
|-----|-----|
| **Cast** | Macros.js (panel) |
| **File** | Files.js (affichage liste fichiers – icône fichier dans le panel Files) |
| **Flag** | Message de validation/erreur partout : MachineSettings (tous targets), tabs features/interface, Mask.js, ItemsList.js |
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
| **Trash2** | Files.js (bouton supprimer dans la liste de fichiers) |
| **Underline** | ProbeCNC.js (panel) |
| **Activity** | Navbar |
| **AlertCircle** | Notifications.js, QuickStopButton (Printer3D, CNC, SandTable) |
| **Aperture** | extraContentItem.js |
| **CheckCircle** | dashboard, Notifications, Terminal, ScanAp, ScanPacksList, StatusCNC |
| **ChevronDown** | Panels/index, Jog, JogCNC, JogPlotter, Input, Navbar |
| **ChevronLeft** / **ChevronRight** | Terminal.js |
| **Circle** | dashboard, Notifications, Terminal |
| **Crosshair** | Jog.js |
| **Download** | tabs/interface, tabs/features |
| **Eye** | Notifications, Input, WebUILogo (targets index) |
| **EyeOff** | Input.js |
| **Frown** | useSettings.js, connection.js |
| **HelpCircle** | dashboard, areas, keepConnectedModal, confirmModal |
| **Home** | Jog, JogCNC, JogPlotter |
| **Info** | useSettings, progressModal, about |
| **LifeBuoy** | about |
| **List** | dashboard |
| **Lock** | MixedExtrudersControl, connection, logginModal, ScanAp |
| **LogOut** | Navbar |
| **Moon** | StatusCNC.js |
| **MoreHorizontal** | JogCNC.js |
| **PauseCircle** / **PlayCircle** / **StopCircle** | Status, StatusCNC, Notifications, Terminal, JogCNC, JogPlotter |
| **Power** | Temperatures.js, LaserCNC.js |
| **RotateCcw** | tabs/features |
| **Save** | MachineSettings (tous), tabs/interface, tabs/features |
| **Send** | Temperatures, Terminal, ExtraControls, MachineSettings (CNC) |
| **Server** / **Settings** | Navbar |
| **Slash** | connection.js |
| **Sun** | LaserCNC.js |
| **Tool** | TabBar |
| **Wind** | SpindleCNC.js |
| **XCircle** | MachineSettings, Input.js |
| **Zap** / **ZapOff** | SpindleCNC.js, Jog.js |

**Total : 55 noms** (hors `Extruder`, qui vient de `iconsTarget`, pas Feather).  
*Note :* Folder et Play sont aussi utilisés dans Files.js mais importés depuis preact-feather dans ce fichier ; ils peuvent être dans `iconsTarget` ou non selon la config.

---

## Non utilisées (jamais référencées comme `icon`)

Ces noms sont uniquement présents dans `iconsFeather` (donc disponibles dans le picker) et ne sont utilisés nulle part dans le code comme `icon: "Nom"` ou dans les défauts :

- Delete  
- Edit  
- Filter  
- GitCommit  
- Grid  
- Heart  
- MapPin  
- Menu  
- MinusCircle  
- MoreVertical  
- Percent  
- PlusCircle  
- RefreshCw  
- Scissors  
- Star  
- Sunrise  
- Sunset  
- Tag  
- Upload  

**Total : 20 noms** (sans compter `None`, qui est `null`).

---

## Résumé

- **Utilisées** : 55  
- **Non utilisées** (uniquement dans le picker) : 20  
- **None** : 1 (pas une icône affichée)

Si tu retires des noms de la liste « non utilisées » dans `icons.js`, les utilisateurs qui avaient déjà choisi une de ces icônes pour une macro/panel (sauvegardé en preferences) verront une icône manquante jusqu’à ce qu’ils en resélectionnent une dans le picker.
