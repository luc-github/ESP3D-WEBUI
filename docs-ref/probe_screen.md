# Probe Screen — grblHAL I/O Reference

> **Scope:** `main/display/cnc/grblhal/screens/probe_screen.cpp` (per-firmware copy since the probe/change_tool split)
> **Target firmware:** grblHAL
> **Status:** ✅ Verified against code + grblHAL standard (2026-06-03). The probe flow generates pure standard G-code (`G38.2` / `G1` / `G10 L20 P0`), identical to what ioSender/UGS produce — the pendant acts as the sender, grblHAL only runs `G38.2`.
> **Purpose of this document:** List all observables monitored and all commands sent, and note grblHAL-specific differences vs FluidNC.

---

## 1. Overview

Same two-pass probing cycle as FluidNC:

1. **Fast seek** — G38.2 at full feed rate
2. **Retract** — small back-off move
3. **Slow feed** — G38.2 at half feed rate
4. **Apply offset** — G10 L20 P0

---

## 2. State Machine

```
IDLE
  │ Button 1 (Play)
  ▼
PRE_CHECK ── firmware_status == "ALARM…" / "ERROR…" ──► FAILED
  │ firmware_status == "IDLE" (current value read at start, else next change)
  ▼
SEEK (G91 G38.2 … F<feed>)
  │ [PRB:…:1] (contact detected)
  ▼
RETRACT (G91 G1 … F<feed>)
  │ firmware_status == "IDLE"
  ▼
FEED (G91 G38.2 … F<feed/2>)
  │ [PRB:…:1] (contact detected)
  ▼
APPLY_OFFSET (G10 L20 P0 …)
  │ firmware_status == "IDLE"
  ▼
SUCCESS
```

**Terminal states:** `SUCCESS`, `FAILED`, `CANCELLED`

**PRE_CHECK:** `ESP3DValues` notifies only on change, so when the machine is already
Idle the reply to `?` would never trigger the callback. `startProbeSequence()` reads the
current `firmware_status` and goes straight to `SEEK` when it is `"IDLE"`. Errors
(`"ERROR:…"` / `"Error:…"`) are matched case-insensitively. The timeout timer covers the
whole sequence: `clamp((|travel|/feed + |retract|/feed + |travel|/(feed/2)) × 60 × 1.5 + 5, 10, 300)` s.
Same logic in the grbl target (`main/display/cnc/grbl/screens/probe_screen.cpp`).

> **Common flow rules** ([../README.md](../README.md)), ported from FluidNC on 2026-11-01,
> not yet tested on hardware:
> - Play while `firmware_status` is `HOLD` / `ALARM` / `DOOR` / `TOOL` / error sends nothing
>   and shows FAILED `probe_error_state` ("Error: Machine not idle").
> - Stop / timeout sends `!` and arms `requestResetBeforeResume()`: the next `~` sent through
>   `sendGcode()` becomes `resetAll()` + `0x18`, so the cancelled `G38.2` is never resumed.
> - Axis switch and screen entry read the current WPos / MPos (`updatePositionDisplay()`
>   from `updateAxisDisplay()`): with a machine at rest no change notification would come.

> **Opened from the tool change screen** (`setReturnScreen(ESP3DScreenType::change_tool)`):
> the axis is forced to Z and the status line shows "Press Play to probe the new tool"
> (`probe_tool_change_hint`, id 563) instead of "Idle". Probing still starts only on Play.
> Same code in the grbl / grblHAL / FluidNC probe screens (2026-11-02).

---

## 3. G-code Commands

| Phase | Command | Example | Notes |
|---|---|---|---|
| PRE_CHECK | `?` | `?` | Realtime status query |
| SEEK | `G91 G38.2 [axis][travel] F[feed]` | `G91 G38.2 Z-50.0 F100.0` | Relative move, stops on contact |
| RETRACT | `G91 G1 [axis][retract] F[feed]` | `G91 G1 Z5 F200` | User feed rate (same unit as the other values; a fixed F200 meant 200 in/min in G20) |
| FEED | `G91 G38.2 [axis][travel] F[feed/2]` | `G91 G38.2 Z-50.0 F50.0` | Half speed for precision |
| APPLY_OFFSET | `G10 L20 P0 [axis][offset]` | `G10 L20 P0 Z-15.3` | Sets WCS zero |
| Cancel / timeout | `!` | `!` | Realtime feed hold |

### Units and modal state

- Probe unit of X / Y / Z: the work unit (`current_unit`), or the report unit when the
  setting *Commands in position unit* (`esp3d_jog_position_unit`) is on, read on each screen
  creation (`isProbeAxisInch()`). It selects the parameter section and the labels.
- When the probe unit is not the work unit (setting on with a mixed state, or a rotary axis
  in G20), every probe line carries the unit word: `G91 G21 G38.2 Z-50 F200`,
  `G10 L20 P0 G21 Z10` (`prepareProbeModalState()`).
- `G91` and the unit word are modal: on **success**, one line after the `G10` restores the
  state read from `[GC:]` at start: `G90` if it was absolute, plus the work unit if a unit
  word was sent (`G90 G20`). Nothing on failure / STOP / timeout: the controller reset
  (probe alarm, or reset on resume after the hold) restores the default modes. `[GC:]` not
  received → nothing restored (logged).
- Before 2026-11-07 the sequence left the machine in `G91`.

### Per-axis probe parameters

Stored per axis in the settings `esp3d_<x…c>_probe_params` (NVS `tgt_prb_<x…c>`, INI
`[pendant] X_probe_params` …), edited from this screen only (no settings list entry):
`offset;max_travel;retract;feed_rate`. X / Y / Z hold one section per work unit, selected by
G20 / G21 without conversion; A / B / C (degrees) a plain list:

| Axis | Default |
|---|---|
| X / Y | `mm;0;30;5;300;in;0;1.2;0.2;12` |
| Z | `mm;10;-50;3;200;in;0.4;-2;0.12;8` |
| A / B / C | `0;360;10;100` |

- Loaded for the active unit (`loadProbeAxisValues()`), cached in `probe_axis_values_map` with
  the unit they were loaded for: reloaded when the work unit changes.
- No live refresh on a G20 / G21 change while the probe screen is open (intended: a
  reference is not changed in the middle of an operation). The screen does not subscribe to
  `current_unit`: values and labels follow the new unit on the next screen entry or edit.
- A malformed section (not 4 numbers) falls back to the setting default.
- An edit (OK in the input screen) is written at once into the section of the active unit;
  the other section is kept (`saveProbeAxisValues()`).

> Values in the commands (and on the parameter buttons) are written with up to 4 decimals, trailing zeros removed (`formatProbeValue()`): `G10 L20 P0 Z15.05`, `F50`. They are typed with up to 4 decimals (same precision, so a displayed value is always accepted as is; feed rate: integer in mm/min, 1 decimal in in/min); the former 1-decimal format rounded them (15.05 mm → `Z15.1`, 0.59 in → `Z0.6`).

---

## 4. Observables

| Observable | Direction | Usage |
|---|---|---|
| `firmware_status` | Read | Phase transitions (IDLE / RUN / ALARM / error) |
| `probe_status` | Read | `[PRB:x,y,z:0\|1]` — contact detection result |
| `last_error_status` | Read | Error display |
| `axis_count` | Read | Number of probing axes available |
| `pin_states` | Read | Visual indicator of probe/limit pin state |
| `position_wx/wy/wz/…` | Read | DRO display (WPos) |
| `position_mx/my/mz/…` | Read | DRO display (MPos) |
| `report_unit` | Subscribe | Unit badge (`mm` / `in`), top right corner of the position button |
| `parser_state` | Subscribe | Active WCS badge (`G54`…`G59`, `---` while unknown), bottom right corner of the position button: the WCS that `G10 L20 P0` overwrites. `$G` sent on screen opening if `canSendData()` (a program may have changed the WCS since the connection). Display only: the WCS is changed from the jog or GC state screen. |
| `server_status` | Read | Connection gate — `"R"` (PASSIVE) blocks probe start |

---

## 5. grblHAL-specific notes

- **`server_status == "R"` (PASSIVE)**: probe cannot be started. The Play button is disabled.
- **G38.2 / G10 / G1**: standard G-code — identical across grblHAL, FluidNC, GRBL.
- **`[PRB:…]` response**: GRBL standard — identical format in grblHAL (`[PRB:x,y,z:1]` on success, `:0` on fail). Also stored in `$#` / params `#5061-#5070`.
- **Pin states**: parsed from `|Pn:` via the `pin_states` observable; axis slots match the effective axis letters via `getAxisLetter()` (UVW honored), plus the fixed `P` (probe) and `O` (probe disconnected) pin characters. See grblHAL [Report extensions](https://github.com/grblHAL/core/wiki/Report-extensions).
- **`|Pn:O` — probe disconnected (grblHAL extension)**: when the report contains `O`, the probe is reported disconnected. `P` = probe triggered, `O` = probe disconnected (mutually exclusive in grblHAL reports). The handler forwards the raw `|Pn:` content, so `O` reaches the screen with no handler change. Handling:
  - **Visual indicator**: `all_axes = "XYZABCPO"` — an `O` square is shown in the probe-pin slot. Since `P`/`O` never coexist and hidden flex items take no space, `O` reuses `P`'s position with **no extra layout space**.
  - **Proactive Play disable**: while disconnected, the Play button is disabled (`update_button(1, &play_b, false)`) in `updatePinsStates()` / `setProbeUIState()` — clearer than only failing on click.
  - **Start gate (defensive)**: `startProbeSequence()` still refuses if disconnected, showing `probe_error_disconnected` (grblHAL target translation id 1000) + error beep.
- **The pendant is the sender**: grblHAL only executes `G38.2`. Plate thickness, retract, two-pass logic are all generated host-side by this screen — there is no firmware-side probe macro involved.

## 6. Design decisions (2026-06-03)

| Topic | Decision | Rationale |
|---|---|---|
| Fast vs slow feed | **Single feed param**, slow pass derived as `feed ÷ 2` | Covers the vast majority of probing; keeps the 2×2 param UI. Editable params stay: Offset / Max Travel / Retract / Feed. |
| Apply zero | **`G10 L20 P0`** (not `G92`) | Persistent WCS offset, robust across reset; standard grblHAL. |
| Probe command | **`G38.2`** (error on no-contact) | Standard; alarm on failure surfaces via `last_error_status`. |

---

## Axis naming — UVW support (implemented)

Both the displayed axis label and the **G-code commands** now resolve axis letters
through `getAxisLetter(real_idx)`, which reads the `axis_names` observable
(`"XYZUVW"`/`"XYZABC"`, set by the grblHAL handler from `$376`). Falls back to
`"XYZABC"` when `axis_names` is unset (FluidNC, or grblHAL ≤ 3 axes).

- `getAxisLetter()` feeds `G91 G38.2 <axis>…`, `G91 G1 <axis>…`, `G10 L20 P0 <axis>…`
  → on a `$376=1` machine the 4th axis is correctly probed as `U` (not `A`).
- `getAxisName()` (display label) delegates to `getAxisLetter()` for the letters,
  keeping only the lock (`"0"`) and invalid (`"?"`) special cases.

The limit/probe-pin indicator squares also honor `axis_names`: axis slots (0-5)
resolve their letter and `|Pn:` matching through `getAxisLetter()`; the `P` (probe)
and `O` (probe disconnected) slots keep their fixed grblHAL pin characters from
`all_axes = "XYZABCPO"`. Letters are refreshed in `updatePinsStates()` with change
detection, in case `axis_names` is learned after screen creation.
