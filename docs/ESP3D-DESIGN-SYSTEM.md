# ESP3D Design System

> Visual identity reference for **ESP3D-WebUI** and **ESP3D-TFT** (LVGL).  
> Sharp Industrial aesthetic — dark background, accent color, icon-first UI.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Themes — 4 Accent Variants](#2-themes--4-accent-variants)
3. [Background & Surface Tokens](#3-background--surface-tokens)
4. [Semantic Colors](#4-semantic-colors)
5. [Border Tokens](#5-border-tokens)
6. [Typography](#6-typography)
7. [Spacing & Radius](#7-spacing--radius)
8. [Component Specifications](#8-component-specifications)
9. [Icon System](#9-icon-system)
10. [WebUI — CSS Implementation](#10-webui--css-implementation)
11. [LVGL — Token Mapping](#11-lvgl--token-mapping)

---

## 1. Design Principles

| Principle | Rule |
|-----------|------|
| **Dark-first** | All surfaces on near-black backgrounds — never invert |
| **Sharp geometry** | `border-radius: 2px` everywhere — no rounded cards |
| **Accent coherence** | One accent color per theme, applied consistently |
| **Icon-first** | Prefer SVG icons over text labels — no translation issues, no truncation |
| **Tinted borders** | Borders carry a subtle hue of the active accent — backgrounds stay neutral |
| **Numeric readability** | Orbitron Bold for all numeric values (DRO, feedrate, %) |
| **System UI for labels** | `system-ui` for buttons, labels — zero extra bundle cost |
| **Mono for terminal** | System monospace only for serial output and G-code input |

---

## 2. Themes — 4 Accent Variants

Each theme overrides only **accent tokens** and **border tokens**.  
Backgrounds, text, and semantic colors are fixed across all themes.

### 2.1 Cyan / Electric *(default)*

> Inspired by industrial control rooms, CNC machine displays.

| Token | Value | Usage |
|-------|-------|-------|
| `--a` | `#00d4ff` | Primary accent — DRO values, active states, glows |
| `--a-dim` | `#0099bb` | Borders, dim variant |
| `--a-g` | `rgba(0,212,255,0.18)` | Glow / shadow |
| `--a-fill` | `rgba(0,212,255,0.12)` | Filled background (active chips, toggles) |
| `--a-f2` | `rgba(0,212,255,0.22)` | Stronger fill (active buttons) |
| `--border-dim` | `#1c2e3e` | Panel borders (cyan tint) |
| `--border-mid` | `#224055` | Input borders, jog buttons |
| `--border-lit` | `#2e5670` | Slider track fill, hover borders |

**LVGL hex equivalents**

| Role | `lv_color_hex()` |
|------|-----------------|
| Accent | `0x00d4ff` |
| Accent dim | `0x0099bb` |
| Border dim | `0x1c2e3e` |
| Border mid | `0x224055` |

---

### 2.2 Amber / Forge

> Warm industrial — forge, lathe, machine tool aesthetic.  
> ⚠ Note: amber is also used for warnings — keep semantic `--warn` (`#ffb300`) distinct from accent in this theme by using a slightly different amber shade for the accent.

| Token | Value | Usage |
|-------|-------|-------|
| `--a` | `#ffaa00` | Primary accent |
| `--a-dim` | `#cc8000` | Borders, dim variant |
| `--a-g` | `rgba(255,170,0,0.20)` | Glow |
| `--a-fill` | `rgba(255,170,0,0.12)` | Filled background |
| `--a-f2` | `rgba(255,170,0,0.22)` | Stronger fill |
| `--border-dim` | `#2e2412` | Panel borders (amber tint) |
| `--border-mid` | `#3e3018` | Input borders |
| `--border-lit` | `#584420` | Hover borders |

**LVGL hex equivalents**

| Role | `lv_color_hex()` |
|------|-----------------|
| Accent | `0xffaa00` |
| Accent dim | `0xcc8000` |
| Border dim | `0x2e2412` |
| Border mid | `0x3e3018` |

---

### 2.3 Green / Terminal

> Retro CNC — oscilloscope, vintage DNC terminal aesthetic.

| Token | Value | Usage |
|-------|-------|-------|
| `--a` | `#39ff84` | Primary accent |
| `--a-dim` | `#22cc5a` | Borders, dim variant |
| `--a-g` | `rgba(57,255,132,0.18)` | Glow |
| `--a-fill` | `rgba(57,255,132,0.11)` | Filled background |
| `--a-f2` | `rgba(57,255,132,0.22)` | Stronger fill |
| `--border-dim` | `#162a1e` | Panel borders (green tint) |
| `--border-mid` | `#1e3a28` | Input borders |
| `--border-lit` | `#285438` | Hover borders |

**LVGL hex equivalents**

| Role | `lv_color_hex()` |
|------|-----------------|
| Accent | `0x39ff84` |
| Accent dim | `0x22cc5a` |
| Border dim | `0x162a1e` |
| Border mid | `0x1e3a28` |

---

### 2.4 Orange / Heat

> Industrial robotics — FANUC, Kuka, hot-end energy.

| Token | Value | Usage |
|-------|-------|-------|
| `--a` | `#ff6a1a` | Primary accent |
| `--a-dim` | `#cc4800` | Borders, dim variant |
| `--a-g` | `rgba(255,106,26,0.22)` | Glow |
| `--a-fill` | `rgba(255,106,26,0.12)` | Filled background |
| `--a-f2` | `rgba(255,106,26,0.22)` | Stronger fill |
| `--border-dim` | `#2e1e0e` | Panel borders (orange tint) |
| `--border-mid` | `#3e2814` | Input borders |
| `--border-lit` | `#583820` | Hover borders |

**LVGL hex equivalents**

| Role | `lv_color_hex()` |
|------|-----------------|
| Accent | `0xff6a1a` |
| Accent dim | `0xcc4800` |
| Border dim | `0x2e1e0e` |
| Border mid | `0x3e2814` |

---

## 3. Background & Surface Tokens

Fixed across **all themes** — never tinted.

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-void` | `#070a0d` | Page background, deepest layer |
| `--bg-base` | `#0c1116` | DRO cells, input backgrounds, terminal bg |
| `--bg-panel` | `#10181f` | Panel cards |
| `--bg-raised` | `#18242e` | Buttons (ghost), jog pads, chip backgrounds |
| `--bg-hover` | `#1f2f3c` | Hover state for interactive elements |
| `--terminal-bg` | `#050810` | Serial monitor background |

**LVGL equivalents**

| Token | `lv_color_hex()` |
|-------|-----------------|
| `--bg-void` | `0x070a0d` |
| `--bg-base` | `0x0c1116` |
| `--bg-panel` | `0x10181f` |
| `--bg-raised` | `0x18242e` |
| `--bg-hover` | `0x1f2f3c` |

---

## 4. Semantic Colors

Fixed across all themes — independent of accent.

| Token | Value | Usage |
|-------|-------|-------|
| `--ok` | `#00e676` | Success states, RUN badge, homing complete |
| `--ok-g` | `rgba(0,230,118,0.18)` | OK glow |
| `--err` | `#ff3d57` | Alarms, E-STOP, ALARM badge, error messages |
| `--err-g` | `rgba(255,61,87,0.20)` | Error glow |
| `--warn` | `#ffb300` | Warnings — buffer high, hold state |
| `--warn-g` | `rgba(255,179,0,0.18)` | Warning glow |
| `--txt-bright` | `#f0f8ff` | Primary text — values, labels, headings |
| `--txt-mid` | `#9ab8cc` | Secondary text — descriptions, inactive labels |
| `--txt-dim` | `#5a7a90` | Tertiary text — section titles, hints |

**LVGL equivalents**

| Token | `lv_color_hex()` |
|-------|-----------------|
| `--ok` | `0x00e676` |
| `--err` | `0xff3d57` |
| `--warn` | `0xffb300` |
| `--txt-bright` | `0xf0f8ff` |
| `--txt-mid` | `0x9ab8cc` |
| `--txt-dim` | `0x5a7a90` |

---

## 5. Border Tokens

Borders are the **only layer that changes between themes** — they carry a subtle hue of the active accent. See section 2 for per-theme values.

| Token | Role |
|-------|------|
| `--border-dim` | Panel outer borders, inactive cells |
| `--border-mid` | Input fields, jog buttons, toggle tracks |
| `--border-lit` | Hover state borders, slider track fill |

---

## 6. Typography

### 6.1 Font Stack

| Role | Font | Source | Bundle cost |
|------|------|--------|-------------|
| **Numeric display** | Orbitron Bold 700 | Embedded woff2 subset | **+1.2 KB** gzipped |
| **UI labels / buttons** | `system-ui, 'Segoe UI', sans-serif` | OS native | +0 KB |
| **Terminal / G-code** | `ui-monospace, 'Cascadia Mono', Consolas` | OS native | +0 KB |

### 6.2 Orbitron Subset

Only numeric characters are subsetted — this covers all CNC display needs (DRO values, feedrate, spindle RPM, overrides, progress %).

```
Characters: 0 1 2 3 4 5 6 7 8 9 . , - + / % :
Format:     woff2 (Brotli compressed)
Raw size:   1.11 KB
Gzip cost:  1.19 KB added to bundle
```

**Subsetting command** (build pipeline):
```bash
python3 -m fontTools.subset Orbitron-Bold.ttf \
  --text="0123456789.,-+/%:" \
  --flavor=woff2 \
  --layout-features="" \
  --output-file=orbitron-digits.woff2
```

**CSS @font-face** (embed base64 in bundle):
```css
@font-face {
  font-family: 'Orbitron';
  font-weight: 700;
  font-display: swap;
  src: url('data:font/woff2;base64,<BASE64>') format('woff2');
}
```

### 6.3 Type Scale

| Role | Font | Size | Weight | Letter-spacing |
|------|------|------|--------|---------------|
| DRO value | Orbitron | `1.5rem` | 700 | `-0.01em` |
| Status bar value | Orbitron | `0.82rem` | 700 | `0` |
| Override % | Orbitron | `0.75rem` | 700 | `0` |
| Progress % | Orbitron | `0.68rem` | 700 | `0` |
| File size | Orbitron | `0.75rem` | 700 | `0` |
| Logo / brand | Orbitron | `1.0rem` | 700 | `0.08em` |
| Section title | system-ui | `0.68rem` | 700 | `0.25em` + uppercase |
| Button label | system-ui | `0.82rem` | 700 | `0.07em` + uppercase |
| Body / description | system-ui | `0.85rem` | 400 | `0` |
| Terminal output | monospace | `0.82rem` | 400 | `0` |

### 6.4 LVGL Font Notes

On the TFT, Orbitron Bold is already compiled as an LVGL binary font (`.c` file via `lv_font_conv`). No embedding needed. The same subset logic applies — generate a font file with only the numeric glyphs needed to minimize flash usage.

---

## 7. Spacing & Radius

### 7.1 Border Radius

| Token | Value | Applied to |
|-------|-------|-----------|
| `--radius` | `2px` | All elements — panels, buttons, inputs, chips |

> **Rule:** `2px` everywhere, no exceptions. This is the core of the "sharp industrial" aesthetic.  
> If a future direction shifts toward rounded, the single token change propagates everywhere.

**LVGL:** `lv_style_set_radius(&style, 2)`

### 7.2 Spacing Scale

| Name | Value | Usage |
|------|-------|-------|
| `xs` | `4px` | Gap between chips, jog grid gap |
| `sm` | `8px` | Internal padding (small components) |
| `md` | `12px` | Panel padding, button padding |
| `lg` | `16px` | Section margins |
| `xl` | `24px` | Page-level margins |

### 7.3 Border Width

| Context | Width |
|---------|-------|
| All borders | `1px` |
| Accent stripe (topbar, panel header) | `2–3px` |
| Slider thumb | `2px` (inner border for contrast) |

**LVGL:** `lv_style_set_border_width(&style, 1)`

---

## 8. Component Specifications

### 8.1 Panel

```
Background : --bg-panel
Border     : 1px solid --border-dim
Radius     : 2px
Top line   : 1px gradient (--a-g → transparent) — accent hint
Shadow     : 0 4px 20px rgba(0,0,0,0.45)
```

**Panel Header**
```
Background : linear-gradient(--bg-raised → --bg-panel)
Text       : system-ui 0.68rem 700 uppercase 0.20em spacing
Left bar   : 2px solid --a  (box-shadow: 0 0 6px --a-g)
Border-bot : 1px solid --border-dim
```

**LVGL panel style**
```c
lv_style_set_bg_color(&style_panel, lv_color_hex(0x10181f));
lv_style_set_border_color(&style_panel, lv_color_hex(0x1c2e3e)); /* theme border-dim */
lv_style_set_border_width(&style_panel, 1);
lv_style_set_radius(&style_panel, 2);
```

---

### 8.2 DRO Cell

```
Background : --bg-base
Border     : 1px solid --border-dim
Radius     : 2px
Hover      : border → --a-dim, box-shadow 0 0 10px --a-g

Label      : system-ui 0.72rem 700 uppercase 0.18em  color: --txt-mid
Value      : Orbitron 1.5rem  color: --a  text-shadow 0 0 14px --a-g
Unit       : system-ui 0.65rem 700 uppercase 0.12em  color: --txt-dim
Zero btn   : 22×18px  border 1px --border-dim  hover → --a
```

**LVGL DRO label style**
```c
lv_style_set_text_font(&style_dro, &orbitron_bold_32); /* Orbitron, size adapted */
lv_style_set_text_color(&style_dro, lv_color_hex(0x00d4ff)); /* --a cyan */
```

---

### 8.3 Buttons

Three visual levels:

**Primary (accent filled)**
```
Background : --a-f2
Border     : 1px solid --a-dim
Text color : --a
Hover      : brightness +18%, box-shadow --accent-glow
Active     : translateY(1px), brightness -8%
```

**Secondary (ghost)**
```
Background : --bg-raised
Border     : 1px solid --border-mid
Text color : --txt-mid
Hover      : text → --txt-bright, border → --border-lit
```

**E-STOP**
```
Background : rgba(255,61,87,0.18)
Border     : 1px solid --err
Text color : #ffffff
Shadow     : 0 0 12px --err-g (pulsing animation 3s)
Hover      : background → --err, shadow × 2
Width      : 100% of available container
```

**LVGL button styles**
```c
/* Primary */
lv_style_set_bg_color(&style_btn_primary, lv_color_hex(0x10181f));
lv_style_set_border_color(&style_btn_primary, lv_color_hex(0x0099bb));
lv_style_set_text_color(&style_btn_primary, lv_color_hex(0x00d4ff));

/* E-STOP */
lv_style_set_bg_color(&style_estop, lv_color_hex(0x2a0810));
lv_style_set_border_color(&style_estop, lv_color_hex(0xff3d57));
lv_style_set_text_color(&style_estop, lv_color_hex(0xffffff));
lv_style_set_border_width(&style_estop, 2);
```

---

### 8.4 Jog Pad

```
Button size     : 52×52px (desktop), 44×44px (mobile)
Grid            : 3×3 (XY), 1×2 (Z)
Gap             : 4px

Button normal   : bg --bg-raised, border 1px --border-mid, color --txt-mid
Button hover    : bg --bg-hover, border --a-dim, color --a, shadow --a-g
Button active   : scale(0.91), bg --a-fill
Center cell     : bg --bg-base, border --border-dim, color --txt-dim, no hover
```

**Step / Feed chips**
```
Normal   : bg --bg-raised, border 1px --border-dim, color --txt-mid
Active   : border --a, bg --a-fill, color --a, shadow --a-g
Size     : font 0.72rem mono, padding 0.22rem 0.5rem
Radius   : 2px
```

**LVGL jog button**
```c
lv_style_set_bg_color(&style_jog_btn, lv_color_hex(0x18242e));
lv_style_set_border_color(&style_jog_btn, lv_color_hex(0x2f4455));
lv_style_set_text_color(&style_jog_btn, lv_color_hex(0x9ab8cc));
lv_style_set_radius(&style_jog_btn, 2);
/* Pressed state */
lv_style_set_bg_color(&style_jog_pressed, lv_color_hex(0x0c1116));
lv_style_set_text_color(&style_jog_pressed, lv_color_hex(0x00d4ff));
```

---

### 8.5 Toggle Switch

```
Track size  : 36×18px
Thumb size  : 12×12px
Track off   : bg --bg-raised, border 1px --border-mid, thumb color --txt-dim
Track on    : bg --a-fill, border --a, shadow --a-g, thumb → --a + shadow
Radius      : 2px (track and thumb) — sharp style
Transition  : 150ms
```

**LVGL:** Use `LV_PART_INDICATOR` for track, `LV_PART_KNOB` for thumb.
```c
/* Knob OFF */
lv_style_set_bg_color(&style_sw_knob, lv_color_hex(0x5a7a90));
/* Indicator ON */
lv_style_set_bg_color(&style_sw_on, lv_color_hex(0x00d4ff));
lv_style_set_radius(&style_sw_knob, 2);
```

---

### 8.6 Progress Bar / Slider

**Progress bar**
```
Track height : 4px
Track bg     : --bg-raised, border 1px --border-dim
Fill         : --a (job), --warn (buffer), --ok (signal), --err (danger)
Fill shadow  : 0 0 5px corresponding glow color
Radius       : 0px — sharp, no pill
```

**Slider (override)**
```
Track height : 4px, same as progress bar
Thumb        : 14×14px square, bg --a, border 2px --bg-panel
Thumb shadow : 0 0 8px --a-g
Thumb hover  : scale(1.3)
Track fill   : CSS gradient matching current value %
```

**LVGL**
```c
lv_style_set_radius(&style_bar, 0); /* sharp, no rounding */
lv_style_set_bg_color(&style_bar_indic, lv_color_hex(0x00d4ff));
lv_style_set_bg_opa(&style_bar_indic, LV_OPA_COVER);
```

---

### 8.7 Alert / Notification

Four severity levels — all share the same structure:

```
Layout      : flex row, icon box 28×28px + body
Border      : 1px solid (semantic color at 22% opacity)
Background  : semantic color at 5–6% opacity
Left stripe : 2px solid semantic color (full height)
Radius      : 2px
Icon box    : border 1px semantic-dim, bg semantic at 7%

Title       : system-ui 0.70rem 700 uppercase 0.08em  color: semantic
Message     : system-ui 0.78rem 400  color: --txt-mid
```

| Level | Border color | Stripe | Icon |
|-------|-------------|--------|------|
| Info (accent) | `--a-g` | `--a` | ℹ |
| OK | `rgba(0,230,118,0.22)` | `--ok` | ✓ |
| Warning | `rgba(255,179,0,0.22)` | `--warn` | ⚠ |
| Error | `rgba(255,61,87,0.25)` | `--err` | ✕ |

**LVGL:** Alerts are typically rendered as `lv_label` inside styled `lv_obj` containers with left border accent.

---

### 8.8 Terminal / Serial Monitor

```
Background  : --terminal-bg (#050810)
Border      : 1px solid --border-dim
Radius      : 2px
Font        : system monospace, 0.82rem, line-height 1.75
Scrollbar   : 3px, color --border-mid

Text colors:
  Command sent  : --a (accent)
  Response OK   : --ok
  Warning       : --warn
  Error         : --err
  Status/dim    : --txt-dim
```

**Input row**
```
Input field : bg --bg-base, border --border-mid, font monospace
              focus: border --a-dim, shadow 0 0 0 2px --a-g
Send button : Primary style with send icon
```

---

## 9. Icon System

All icons are **SVG inline**, defined once in a `<defs>/<symbol>` block at top of HTML, reused via `<use href="#id">`. Zero external dependencies.

### 9.1 Icon Specifications

```
Stroke      : currentColor (inherits text color)
Stroke-width: 2px (1.5px for complex icons)
Stroke-linecap : round
Stroke-linejoin: round
Fill        : none (outline style) — exception: play, stop, pause (filled)
ViewBox     : 0 0 24 24
```

### 9.2 Icon Size Classes

| Class | Size | Usage |
|-------|------|-------|
| `.icon-sm` | `0.95em` | Status bar, section titles, toggle labels |
| `.icon` | `1.15em` | Default — list items, chip labels |
| `.icon-lg` | `1.4em` | Primary action buttons |
| `.icon-xl` | `1.7em` | E-STOP button |

### 9.3 Icon Inventory

| Symbol ID | Usage |
|-----------|-------|
| `#i-play` | Start job |
| `#i-pause` | Hold |
| `#i-stop` | E-STOP (filled square) |
| `#i-resume` | Resume after hold |
| `#i-home` | Home single axis |
| `#i-homeall` | Home all axes (crosshair + arrows) |
| `#i-probe` | Probe Z / tool length |
| `#i-unlock` | Unlock after alarm |
| `#i-settings` | Settings panel |
| `#i-arrow-up/dn/lt/rt` | Jog direction arrows |
| `#i-zero` | Zero axis (dot in circle) |
| `#i-feed` | Feedrate (speedometer arc) |
| `#i-spindle` | Spindle (sun/gear) |
| `#i-rapid` | Rapid override (waveform) |
| `#i-buffer` | Planner buffer (blocks) |
| `#i-coolant` | Coolant (drop) |
| `#i-tool` | Tool / probe tip |
| `#i-reconnect` | Auto-reconnect (circular arrows) |
| `#i-wifi` | WiFi signal |
| `#i-flash` | Flash storage |
| `#i-file` | G-code file |
| `#i-check` | Success / OK |
| `#i-warn` | Warning triangle |
| `#i-err` | Error circle-X |
| `#i-info` | Info circle |
| `#i-send` | Send command |
| `#i-clear` | Clear terminal |

### 9.4 LVGL Icons

On TFT, icons are rendered as:
- **LVGL font glyphs** (recommended) — compile icon SVGs to font via `lv_font_conv`
- **`lv_img`** with binary image descriptors — for complex multi-color icons

```bash
# Example: convert a subset of icons to LVGL font at 24px
lv_font_conv \
  --font icons.ttf \
  --size 24 \
  --bpp 4 \
  --format lvgl \
  -o ui_icons_24.c
```

---

## 10. WebUI — CSS Implementation

### 10.1 CSS Custom Properties Structure

```css
/* ── Fixed layers — same across all themes ── */
:root {
  --bg-void:    #070a0d;
  --bg-base:    #0c1116;
  --bg-panel:   #10181f;
  --bg-raised:  #18242e;
  --bg-hover:   #1f2f3c;

  --ok:    #00e676; --ok-g:    rgba(0,230,118,0.18);
  --err:   #ff3d57; --err-g:   rgba(255,61,87,0.20);
  --warn:  #ffb300; --warn-g:  rgba(255,179,0,0.18);

  --txt-bright: #f0f8ff;
  --txt-mid:    #9ab8cc;
  --txt-dim:    #5a7a90;

  --r: 2px;
  --t: 150ms;
}

/* ── Theme overrides — accent + borders only ── */
.v-cyan {
  --a: #00d4ff; --a-dim: #0099bb;
  --a-g: rgba(0,212,255,0.18); --a-fill: rgba(0,212,255,0.12); --a-f2: rgba(0,212,255,0.22);
  --border-dim: #1c2e3e; --border-mid: #224055; --border-lit: #2e5670;
}
.v-amber {
  --a: #ffaa00; --a-dim: #cc8000;
  --a-g: rgba(255,170,0,0.20); --a-fill: rgba(255,170,0,0.12); --a-f2: rgba(255,170,0,0.22);
  --border-dim: #2e2412; --border-mid: #3e3018; --border-lit: #584420;
}
.v-green {
  --a: #39ff84; --a-dim: #22cc5a;
  --a-g: rgba(57,255,132,0.18); --a-fill: rgba(57,255,132,0.11); --a-f2: rgba(57,255,132,0.22);
  --border-dim: #162a1e; --border-mid: #1e3a28; --border-lit: #285438;
}
.v-orange {
  --a: #ff6a1a; --a-dim: #cc4800;
  --a-g: rgba(255,106,26,0.22); --a-fill: rgba(255,106,26,0.12); --a-f2: rgba(255,106,26,0.22);
  --border-dim: #2e1e0e; --border-mid: #3e2814; --border-lit: #583820;
}
```

### 10.2 Font Loading

```css
/* Orbitron — digits subset only, embedded woff2 */
@font-face {
  font-family: 'Orbitron';
  font-weight: 700;
  font-display: swap;
  src: url('data:font/woff2;base64,<BASE64_FROM_BUILD>') format('woff2');
}

/* Usage — numeric elements only */
.dro-val, .stat-val, .sl-val, .prog-pct, .coord-val, .filesize {
  font-family: 'Orbitron', ui-monospace, monospace;
}

/* UI labels — system font, zero cost */
body, button, .btn, .panel-header, .toggle-label {
  font-family: system-ui, 'Segoe UI', sans-serif;
}

/* Terminal — system monospace */
.terminal, pre, .formControl, code {
  font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
}
```

### 10.3 Bundle Size Budget

| Component | Raw | Gzipped |
|-----------|-----|---------|
| HTML + CSS + JS | ~30 KB | ~9 KB |
| SVG icon defs | ~4 KB | ~1.5 KB |
| Orbitron digits woff2 (base64) | ~1.5 KB | ~1.2 KB |
| **Total** | **~35 KB** | **~11.7 KB** |

> Current production bundle (`index.html.gz`) = 97 KB.  
> The design system adds **~11 KB** over a minimal HTML shell.

---

## 11. LVGL — Token Mapping

### 11.1 Color Defines (C header)

```c
/* esp3d_theme.h — generated from design system tokens */

/* ── Backgrounds ── */
#define ESP3D_BG_VOID    0x070a0d
#define ESP3D_BG_BASE    0x0c1116
#define ESP3D_BG_PANEL   0x10181f
#define ESP3D_BG_RAISED  0x18242e
#define ESP3D_BG_HOVER   0x1f2f3c

/* ── Text ── */
#define ESP3D_TXT_BRIGHT 0xf0f8ff
#define ESP3D_TXT_MID    0x9ab8cc
#define ESP3D_TXT_DIM    0x5a7a90

/* ── Semantic ── */
#define ESP3D_OK         0x00e676
#define ESP3D_ERR        0xff3d57
#define ESP3D_WARN       0xffb300

/* ── Accent — Cyan (default) ── */
#define ESP3D_ACCENT     0x00d4ff
#define ESP3D_ACCENT_DIM 0x0099bb
#define ESP3D_BORDER_DIM 0x1c2e3e
#define ESP3D_BORDER_MID 0x224055
#define ESP3D_BORDER_LIT 0x2e5670

/* ── To switch theme: redefine these 5 macros ── */
```

### 11.2 Base Style Tokens

| Property | Value | LVGL API |
|----------|-------|----------|
| Border radius | `2` | `lv_style_set_radius(&s, 2)` |
| Border width | `1` | `lv_style_set_border_width(&s, 1)` |
| Default padding | `8` | `lv_style_set_pad_all(&s, 8)` |
| Transition time | `150ms` | `lv_style_set_transition(&s, ...)` |
| Default font | Barlow / system | LVGL compiled font |
| Numeric font | Orbitron Bold | LVGL compiled font |

### 11.3 Practical LVGL Style Initialization

```c
/* Panel */
static lv_style_t style_panel;
lv_style_init(&style_panel);
lv_style_set_bg_color(&style_panel,     lv_color_hex(ESP3D_BG_PANEL));
lv_style_set_bg_opa(&style_panel,       LV_OPA_COVER);
lv_style_set_border_color(&style_panel, lv_color_hex(ESP3D_BORDER_DIM));
lv_style_set_border_width(&style_panel, 1);
lv_style_set_radius(&style_panel,       2);
lv_style_set_pad_all(&style_panel,      12);

/* DRO value label */
static lv_style_t style_dro;
lv_style_init(&style_dro);
lv_style_set_text_font(&style_dro,  &orbitron_bold_32);
lv_style_set_text_color(&style_dro, lv_color_hex(ESP3D_ACCENT));

/* Accent button */
static lv_style_t style_btn_accent;
lv_style_init(&style_btn_accent);
lv_style_set_bg_color(&style_btn_accent,     lv_color_hex(ESP3D_BG_RAISED));
lv_style_set_bg_opa(&style_btn_accent,       LV_OPA_COVER);
lv_style_set_border_color(&style_btn_accent, lv_color_hex(ESP3D_ACCENT_DIM));
lv_style_set_border_width(&style_btn_accent, 1);
lv_style_set_text_color(&style_btn_accent,   lv_color_hex(ESP3D_ACCENT));
lv_style_set_radius(&style_btn_accent,       2);

/* E-STOP button */
static lv_style_t style_estop;
lv_style_init(&style_estop);
lv_style_set_bg_color(&style_estop,     lv_color_hex(0x2a0810));
lv_style_set_bg_opa(&style_estop,       LV_OPA_COVER);
lv_style_set_border_color(&style_estop, lv_color_hex(ESP3D_ERR));
lv_style_set_border_width(&style_estop, 2);
lv_style_set_text_color(&style_estop,   lv_color_hex(0xffffff));
lv_style_set_radius(&style_estop,       2);
```

### 11.4 Theme Switching in LVGL

The single-accent-color model maps cleanly to LVGL — swap 5 color defines and call `lv_obj_invalidate(lv_scr_act())`:

```c
typedef struct {
    uint32_t accent;
    uint32_t accent_dim;
    uint32_t border_dim;
    uint32_t border_mid;
    uint32_t border_lit;
} esp3d_theme_t;

const esp3d_theme_t esp3d_themes[] = {
    { 0x00d4ff, 0x0099bb, 0x1c2e3e, 0x224055, 0x2e5670 }, /* cyan   */
    { 0xffaa00, 0xcc8000, 0x2e2412, 0x3e3018, 0x584420 }, /* amber  */
    { 0x39ff84, 0x22cc5a, 0x162a1e, 0x1e3a28, 0x285438 }, /* green  */
    { 0xff6a1a, 0xcc4800, 0x2e1e0e, 0x3e2814, 0x583820 }, /* orange */
};
```

---

## Appendix — Quick Reference Card

```
BACKGROUNDS     FIXED       ACCENT (per theme)       SEMANTIC
bg-void  070a0d             cyan    00d4ff           ok    00e676
bg-base  0c1116             amber   ffaa00           err   ff3d57
bg-panel 10181f             green   39ff84           warn  ffb300
bg-raised 18242e            orange  ff6a1a
bg-hover  1f2f3c

TEXT            FIXED       BORDER (per theme, shown for cyan)
txt-bright f0f8ff           border-dim  1c2e3e
txt-mid    9ab8cc           border-mid  224055
txt-dim    5a7a90           border-lit  2e5670

GEOMETRY
radius   2px (all)
border   1px (all), 2px (E-STOP, accent stripes)
padding  8px (sm) / 12px (md) / 16px (lg)

FONTS
numbers  Orbitron Bold 700 — subset 0-9.,-+/%:  (+1.2KB gz)
ui       system-ui (free)
terminal ui-monospace (free)
```

---

*ESP3D Design System — v0.1 — Sharp Industrial*
