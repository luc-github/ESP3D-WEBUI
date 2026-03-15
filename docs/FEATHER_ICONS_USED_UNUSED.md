# Feather icons: used vs unused

Reference: `src/components/Images/icons.js` (all icons are in the IconSelect picker; this list covers those **actually used** in the code: either `icon: "Name"` in configs or used as a component).

---

## Used (referenced in code)

These names appear in panels/defaults (`icon: "Name"`) or as components (e.g. `<File />` in Files.js):

| Name | Where |
|------|-------|
| Cast | Macros.js (panel) |
| File | Files.js (file list) |
| Flag | Validation/error messages: MachineSettings, tabs, Mask.js, ItemsList.js |
| HardDrive | Files.js (panel) |
| Image | Charts.js (panel) |
| Layers | Status.js, StatusCNC.js |
| Loader | LaserCNC.js (panel) |
| MessageSquare | Notifications.js (panel) |
| Meh | def_panel.json, def_macro.json (default new panel/macro) |
| Move | Jog.js, JogPlotter.js, JogCNC.js |
| Repeat | OverridesCNC.js (panel) |
| Sliders | ExtraControls.js (panel) |
| Target | SpindleCNC.js (panel) |
| Terminal | Terminal.js (panel) |
| Thermometer | Temperatures.js (panel) |
| Trash2 | Files.js (delete button) |
| Underline | ProbeCNC.js (panel) |
| Activity | Navbar |
| AlertCircle | Notifications.js, QuickStopButton (Printer3D, CNC, SandTable) |
| Aperture | extraContentItem.js |
| CheckCircle | dashboard, Notifications, Terminal, ScanAp, ScanPacksList, StatusCNC |
| ChevronDown | Panels/index, Jog, JogCNC, JogPlotter, Input, Navbar |
| ChevronLeft / ChevronRight | Terminal.js |
| Circle | dashboard, Notifications, Terminal |
| Crosshair | Jog.js |
| Download | tabs/interface, tabs/features |
| Eye | Notifications, Input, WebUILogo (targets index) |
| EyeOff | Input.js |
| Frown | useSettings.js, connection.js |
| HelpCircle | dashboard, areas, keepConnectedModal, confirmModal |
| Home | Jog, JogCNC, JogPlotter |
| Info | useSettings, progressModal, about |
| LifeBuoy | about |
| List | dashboard |
| Lock | MixedExtrudersControl, connection, logginModal, ScanAp |
| LogOut | Navbar |
| Moon | StatusCNC.js |
| MoreHorizontal | JogCNC.js |
| PauseCircle / PlayCircle / StopCircle | Status, StatusCNC, Notifications, Terminal, JogCNC, JogPlotter |
| Power | Temperatures.js, LaserCNC.js |
| RotateCcw | tabs/features |
| Save | MachineSettings, tabs/interface, tabs/features |
| Send | Temperatures, Terminal, ExtraControls, MachineSettings (CNC) |
| Server / Settings | Navbar |
| Slash | connection.js |
| Sun | LaserCNC.js |
| Tool | TabBar |
| Wind | SpindleCNC.js |
| XCircle | MachineSettings, Input.js |
| Zap / ZapOff | SpindleCNC.js, Jog.js |

**Total: 55 names** (excluding `Extruder`, which comes from `iconsTarget`).

---

## Unused (only in picker)

These names exist only in `iconsFeather` (available in the picker) and are not used in code as `icon: "Name"` or in defaults:

- Delete, Edit, Filter, GitCommit, Grid, Heart, MapPin, Menu, MinusCircle, MoreVertical, Percent, PlusCircle, RefreshCw, Scissors, Star, Sunrise, Sunset, Tag, Upload

**Total: 20 names** (excluding `None`, which is `null`).

---

## Summary

- **Used:** 55  
- **Unused (picker only):** 20  
- **None:** 1 (not a displayed icon)

Removing names from the "unused" list in `icons.js` will cause users who had already chosen one of those icons for a macro/panel (saved in preferences) to see a missing icon until they pick another in the picker.
