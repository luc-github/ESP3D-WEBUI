# WebUI features (by target)

This document lists supported features by target (3D Printer, CNC, Sand Table). **Last aligned with code:** Firmware/target list verified against `src/targets/` (Printer3D: Marlin, Marlin-embedded, Repetier, Smoothieware; CNC: GRBL, grblHAL; SandTable: GRBL).

The full reference is **ESP3D-WebUI-features.xhtml** (converted from ESP3D-WebUI-features.xls), now readable; place it in **docs/** (e.g. `docs/ESP3D-WebUI-features.xhtml`) and complete or align this .md from it when needed.

## Global features

-   Firmware update
-   WebUI update
-   List of enabled features / capabilities
-   Wifi configuration
-   Features configuration
-   WebUI features configuration
-   Haptic feedback
-   Audio feedback
-   Terminal commands
-   Emergency stop
-   Plugins support
-   Themes support (CSS)
-   Language packs support
-   Macro commands
-   Local FS listing / content management
-   External pages/panel support
-   PC / Tablet / phone UI
-   IP Camera & ESP32 Camera display support
-   Import / Export settings
-   Restart board support
-   Monolithic small footprint
-   Single user management support (auto close if not latest connected)
-   Authentication support (admin / user)
-   Configuration wizard (TBD)
-   **Firmware supported** (3D Printer / CNC / Sand Table), aligned with `src/targets/`:
    -   **Printer3D:** Marlin, Marlin-embedded, Repetier, Smoothieware (ESP3D V3.x / ESP3DLib)
    -   **CNC:** GRBL, grblHAL
    -   **SandTable:** GRBL
    -   ESP3D-TFT (ESP3D), Makerbase TFT (ESP3D), Bigtreetech TFT (ESP3D)
    -   ESP3DLib: Marlin (2.x) — custom Marlin: https://github.com/luc-github/Marlin/tree/ESP3DLibV3.0
-   **Firmware NOT yet supported:** RepRap. **Not in repo:** GRBL_ESP32 (was in old datastructure only).

## 3D Printer features

-   Target firmware configuration
-   Jog control / monitoring
-   Temperatures control / monitoring
-   Additional sensors support
-   Chart support for temperatures / sensors
-   Multiple extruder support
-   Target Firmware SD listing / content management (if supported)
-   TFT SD/USB listing / content management (if supported)
-   Fan control / monitoring (if supported)
-   Flow rate control / monitoring (if supported)
-   Feed rate control / monitoring (if supported)
-   Print control / monitoring
-   More to come…

## CNC features

-   Target firmware configuration
-   Jog control / monitoring
-   Laser control
-   Spindle control
-   Status monitoring
-   Probing control / monitoring
-   Code streaming using ESP3D V3
-   More to come…

## Sand Table features

-   Target firmware configuration
-   Jog control / monitoring
-   Status monitoring
-   More to come…
