# Inch / mm support — complete logic reference (ESP3D-X)

This document describes **everything ESP3D-X does** to support inch and mm on CNC targets
(FluidNC, grbl, grblHAL): what is read from the firmware, when, how it is parsed, where it
is stored, and how each screen uses it. It is written as a porting reference (e.g. for the
ESP3D-WebUI): it describes the ESP3D-X behavior only, not how another client should be
built.

Design rationale of the jog lists: [jog_unit_lists.md](jog_unit_lists.md).
Screen flows: [ux_flows/fluidnc/jog_screen.md](../ux_flows/fluidnc/jog_screen.md),
[ux_flows/fluidnc/gc_state_screen.md](../ux_flows/fluidnc/gc_state_screen.md) (and the
grblHAL equivalents).

---

## 1. Two independent units

The firmware has **two** unit notions, and ESP3D-X tracks them separately. Mixing them up
is the main source of errors.

| Value | Meaning | Source | Used for |
|---|---|---|---|
| `current_unit` | **Work unit** (modal, G-code group 6) | `G20` / `G21` in the parser state `[GC:…]` | Everything the user **sends**: jog step / feedrate values and labels, probe parameters (both unless *Commands in position unit* is on), typed feedrate, `ESP420` `unit` field, information screen |
| `report_unit` | Unit of the **reported positions** (`MPos` / `WPos` in `<…>` status reports) | `$13` (grbl / grblHAL), `$/report_inches` (FluidNC) | Unit label shown next to the positions; jog and probe unit when *Commands in position unit* is on; reference of the GC state unit button |

Both are stored as raw strings, `"0"` = mm (default), `"1"` = inch
(`main/target/cnc/esp3d_system_values_defs.inc`). They are never translated at storage
time: screens convert them to a label (`mm` / `in`) at the point of use.

Why two values: a machine can be in `G20` (program in inches) while reporting positions in
mm (`$13=0`), or the reverse. Jog commands (`$J=G91 X1 F100`) carry **no unit word**, so the
firmware applies the **modal work unit** to them. The displayed position follows the
**report** setting. They are unrelated.

Two ways to avoid jogging in one unit while reading positions in the other:
- the GC state **unit button** switches both together (work unit + report unit, §6);
- the setting **Commands in position unit** (`esp3d_jog_position_unit`, default off;
  named *Jog in position unit* before it covered the probe, key and INI entry
  `Jog_in_position_unit` kept): the jog and the probe use the **report unit** instead of
  the work unit (lists, labels, Custom value, list editor first section, probe
  parameters) and every `$J` / probe line carries that unit word (§4.3, §6 probe).
Both are optional: the two values are still tracked separately, a user can keep
`G20` with `$13=0` (or the reverse). Every screen must stay correct in that mixed state
(see the audit in §9 for the places that are not yet).

**No conversion is done**, with **one exception**: values are displayed and sent as they
are, with the unit next to them. The exception is the programmed feed `F` of `[GC:]`,
shown in the work unit (status `Fs:` and F editor, `formatReportedFeedInWorkUnit()`,
`position_unit.h`): FluidNC always reports it in mm/min, while the user types F in the work
unit (and enters in/min in the jog in G20). Display only: in/min with 1 decimal, mm/min
with 0; a value validated unchanged is not sent (no drift from the rounding).
**Known limitation (accepted 2026-11-07):** a feed typed in inch is shown rounded once back
in mm: `F6` in G20 → `$G` `F152.4`; after `G21`, the status button and the editor show
`152` (mm/min shown with 0 decimal). The machine keeps `152.4`; it changes only if the user
types a new value.

### 1.1 Golden rule: values sent vs values reported

- A number the pendant **sends** (`X`, `F`, probe distances…) is interpreted by the
  firmware in the **work unit** (G20/G21 modal), unless the line carries its own unit word
  (non-modal only in a `$J` line; anywhere else `G20` / `G21` on the line is modal).
  `$13` / `report_inches` never changes how an input is read (FluidNC: the parser scales F
  by `MM_PER_INCH` when `modal.units == Inches`, `GCode.cpp`; `report_inches` only affects
  `Report.cpp` — source review, Devin 2026-11-07).
- A number the firmware **reports** has its own unit, which is **not always the report
  unit**: it depends on the value and on the firmware (table below).
- Danger zone: **pre-filling an input with a reported value**, or sending a reported value
  back. The input unit must be the unit of the reported value, and the command must be sent
  in that unit (unit word on the line, then restore the work unit).

Unit of each reported value (`MPos` / `WPos` / `WCO`, `FS:` real feed, `[GC:]` `F`):

| Reported value | grbl | grblHAL | FluidNC |
|---|---|---|---|
| `MPos` / `WPos` / `WCO` | report unit (`$13`) | report unit (`$13`) | report unit (`report_inches`) |
| `[GC:]` `F` (programmed feed) | report unit (`$13`, from grbl 1.1 source) — **not verified on hardware** | assumed like grbl — **not verified** | **always mm/min**, the internal value, whatever G20/G21 and `report_inches` (`report_inches=true` only adds a decimal: `F100` → `F100.0`). Verified 2026-11-07 on FluidNC 3.9.9 and 4.10 (identical): G20 + `F10` → `[GC:… F254 …]` |
| `FS:` / `F:` real feed (status report) | report unit (`$13`, from source) — **not verified** | **not verified** | **report unit** (`report_inches`). Verified 2026-11-07: G20 + `G1 X1 F10` → `FS:254` with `report_inches=false`, `FS:10` with `true`. Note: unlike `[GC:]` `F` (always mm/min) |
| `[PRB:]` | report unit | report unit | report unit — only the contact flag is used by ESP3D-X |

grbl / grblHAL "not verified" cells: test procedure in
[`tests/units_inch_mm_grbl_grblhal_test_plan.md`](../../tests/units_inch_mm_grbl_grblhal_test_plan.md).

FluidNC accepts both `$report_inches=true|false` and `$13=1|0` (alias), verified
2026-11-07 (3.9.9 and 4.10); `report_inches` only affects reports, never input values (FluidNC wiki).

---

## 2. Reading the units from the firmware

### 2.1 Connection startup sequence

Both units are read once during the connection startup sequence of each target
(`main/target/cnc/<target>/esp3d_gcode_handler_service.cpp`, `_startup_commands_phase`):

| Target | Report unit query | Work unit query |
|---|---|---|
| grbl | none dedicated: `$13=` is parsed from the `$$` settings dump (phase 1) | `$G` (phase 2) |
| grblHAL | `$13` (sent alone, same phase as `$G`) | `$G` |
| FluidNC | `$report_inches` (phase 4) | `$G` (phase 4, right after) |

A failed report unit query is only logged (not fatal); a failed `$G` aborts the step.

### 2.2 Parsing the report unit

| Target | Line matched | Rule |
|---|---|---|
| grbl | starts with `$13=` | `data[4] == '1'` → `"1"`, else `"0"` |
| grblHAL | `$<n>=<v>` setting line with `n == 13` | `v == 1` → `"1"`, else `"0"` (also matches the `$$` dump) |
| FluidNC | starts with `$/report_inches=` (the only answer format, FluidNC 3.x and 4.x) | value starts with `true` or `on` (case-insensitive) or `1` → `"1"`, else `"0"` |

### 2.3 Parsing the work unit (`[GC:…]`)

On a line starting with `[GC:` (same code on the 3 targets):

1. Copy the content after `[GC:` into a 128-byte buffer, cut at `]`. No `]` → line rejected.
2. Store the whole content as `parser_state` (also used for WCS, feed, etc.).
3. Scan the content for `G20` / `G21` **as a whole word**: `G`, `2`, then `0` or `1`,
   followed by a space or end of string (so `G21.1`, `G200`… never match).
4. Each match sets `current_unit` (`G20` → `"1"`, `G21` → `"0"`); the **last match wins**
   (G20 / G21 are one modal group, only one is normally present).
5. No match → `current_unit` is left unchanged.

The same word rule is used by `gcStateScreen::unitCode()` (returns `"G20"` / `"G21"`,
default `"G21"`), which also requires the match to start a word (start of string or
preceded by a space).

### 2.4 Keeping the work unit up to date

The work unit can change after the connection (a program sends `G20`, the user toggles it).
ESP3D-X does **not** parse the outgoing G-code lines; it re-reads the parser state:

- **FluidNC** pushes `[GC:…]` by itself on a modal change: nothing is sent.
- **grbl / grblHAL**: `$G` is sent
  - after each modal command sent by the UI (`gcStateScreen::sendModalCommand()` →
    `requestParserState()`, also used by the status screen after a feedrate change);
  - on each jog screen opening, only if `canSendData()` (when not connected, the startup
    sequence sends it anyway).
- The report unit (`$13` / `report_inches`) is read at connection, and read back after the
  GC state unit button changed it (`$13` on grblHAL, `$$` on grbl, `$report_inches` on
  FluidNC). Changing it on the machine from another client requires a reconnection to be
  seen.

`current_unit` / `report_unit` are not reset on disconnection: they keep the last known
value (default `"0"` at boot) until the next connection reads them again.

### 2.5 Notifications

`ESP3DValues` notifies subscribers **only when the value changes**. A screen therefore
always reads the current value with `get_value()` when it is built, and subscribes for
later changes (see the project rule "read current value, never wait for a notification").

---

## 3. Jog step / feedrate lists

### 3.1 Storage format

Per axis, two NVS string settings (max 128 chars): steps list and feedrates list, `;`
separated. Linear axes (X / Y / Z) may hold one section per unit:

```
mm;0.01;0.1;1;10;50;100;in;0.001;0.01;0.1;1;2;4
```

Parsing (`parseUnitSections()`, `main/display/esp3d_unit_sections.h`):

- Split on `;`, trim spaces around each token, drop empty tokens.
- Token `mm` / `in` (exactly 2 chars, case-insensitive) switches the current section.
- Tokens before the first tag go to the **untagged** section (legacy format).
- Any other token is appended to the current section.
- Result: three `;` lists without tags: `mm`, `in`, `untagged`.

Valid forms: both sections, one tagged section, or no tag at all (legacy, still works).
Rotary axes (A / B / C, degrees) always use plain untagged lists.

### 3.2 Section selection (`selectUnitSection()`)

| Active unit (`current_unit`) | Use, as is |
|---|---|
| inch | `in` section → else `mm` section → else untagged |
| mm | `mm` section → else `in` section → else untagged |

The untagged section is used only when **both** tagged sections are empty. A missing
section falls back to the other one **without conversion**: values that look wrong for the
active unit stay visible because the active unit is displayed next to them. Rotary axes are
always selected as "mm" (`is_inch` forced to false), i.e. they just use their list.

### 3.3 Defaults (FluidNC, grbl, grblHAL — `esp3d_target_settings_defs.inc`)

| List | Default |
|---|---|
| X / Y steps | `mm;0.01;0.1;1;10;50;100;in;0.001;0.01;0.1;1;2;4` |
| Z steps | `mm;0.01;0.1;1;10;50;in;0.001;0.01;0.1;0.5;1` |
| X / Y / Z feedrates | `mm;100;500;1000;2000;5000;in;4;20;40;80;200` |

Existing untagged settings keep working unchanged (no migration).

---

## 4. Jog screen (`main/display/cnc/screens/jog_screen.cpp`)

### 4.1 Loading the lists (`loadAxisValuesFromSettings()`)

1. Read the steps and feedrates settings of the axis.
2. `is_inch = !is_rotary && current_unit == "1"`.
3. Select the section of each list (§3.2), then split it into values.
4. Restore the saved step / feedrate **index** of the axis (one index per axis, shared by
   both units), reset to 0 if out of bounds for the selected list.
5. Unit labels:
   - linear axis: step unit `mm` / `in`, feedrate unit `mm/min` / `in/min`
     (`unit_per_min` translation `"%s/min"`) — from `current_unit`;
   - rotary axis: `°` and `°/min`, whatever the work unit.

### 4.2 When the lists are reloaded (`initializeAxisValues()`)

The lists are rebuilt only if the cache is empty, the axis count changed, **or the work
unit changed** since the last load (`last_initialized_unit_inch`). Otherwise the cache is
kept (the user's current selection is preserved when coming back to the screen).

- Checked on each screen entry.
- Subscribed to `current_unit`: on change → `initializeAxisValues()` +
  `updateAxisValuesDisplay()` (section switch and labels refreshed live).
- A reload clears the volatile **Custom** step / feedrate values typed on the jog screen.

### 4.3 Jog commands

| Mode | Command |
|---|---|
| Step jog | `$J=G91<axis>[-]<step>F<feedrate>` |
| Continuous jog | `$J=G91<axis>[-]10000F<feedrate>` (linear) / `36000` (rotary), cancelled on release |
| Handwheel | `$J=G91<axis><distance %.4f>F<feed %.3f>`, distance = detents × step |

- Classic mode (setting *Commands in position unit* off, default): **no unit word** (`G20` /
  `G21`) is added: the firmware applies its modal work unit, which is exactly the unit the
  values were selected for and displayed with. That is why the labels must follow
  `current_unit` live: a stale label is a 25.4× mistake.
- *Commands in position unit* on (`esp3d_jog_position_unit`, read on each jog screen creation):
  the jog unit is `report_unit` (`jogUnitIsInch()`), and every `$J` starts with its unit word
  (`jogUnitWord()`): `$J=G21G91X1F100` / `$J=G20G91…`. A unit word in a `$J` line is
  **non-modal** (grbl, grblHAL, FluidNC; ESP3D-WebUI does the same; FluidNC verified
  2026-11-07): the machine G20/G21 is never changed.
- **Rotary axes (A/B/C) always get `G21`**, in both modes (`$J=G21G91A10F100`): degrees are
  never scaled, while a modal `G20` could scale them on a firmware treating every axis as
  linear. Lists / labels reload on a `report_unit` change (same as `current_unit` in
  classic mode). The settings list editors open the section of the same jog unit.
- The continuous jog distance is a "far enough" constant: in inch it means 10000 in, which
  is harmless (the jog is cancelled on release and clipped by soft limits).
- The handwheel proportional feed (`speed × step × 60`, capped at the selected feedrate)
  is unit-agnostic: all values are in the same unit.

### 4.4 Custom value editor (jog screen)

The Custom step / feedrate typed from the jog screen uses the current labels as its unit.
Decimal places, linear axes: steps 3 in mm, **4 in inch** (0.0001 in ≈ 2.5 µm, the
firmware inch precision; minimum 0.001 mm / 0.0001 in); feedrates 0 in mm, **1 in inch**
(a whole in/min step ≈ 25.4 mm/min is too coarse). Rotary axes: steps 3, feedrates 0.
Maximums are not unit-dependent (steps 1000, feedrates 20000).

### 4.5 Position unit badge

Small label in the top right corner of the position button, from `report_unit` (`mm` /
`in`), or `°` when a rotary axis is selected. Subscribed to `report_unit`; also refreshed
when the selected axis changes. Change detection: the label text is only set when it
differs.

### 4.6 Position precision

Positions keep the precision of the firmware status report: **3 decimals in mm, 4 in
inch** (grbl / grblHAL `$13=1` and FluidNC `report_inches` report 4 decimals). The status
parser of each target (`esp3d_gcode_handler_service.cpp`) stores MPos, WPos **and WCO**
with `report_unit` decimals; WCO matters because WPos is computed from it (`MPos − WCO`),
a WCO rounded to 3 decimals would shift WPos by up to 0.0005 in. Screens that reformat
the stored value (status `%8.*f`, tool change `%.*f`) use the same precision through
`positionDecimals()` (`position_unit.h`); jog and probe show the stored string as is.

---

## 5. List editor (settings → X/Y/Z Steps / Feedrates)

Files: `main/display/cnc/screens/settings_list_screen.cpp` (open), 
`main/display/screens/input_screen.cpp` (edit), `custom_keyboard_component.cpp` (key).

### 5.1 Opening

- Linear axes only (`axis_idx < 3`): `unit_sections = true`, first shown section =
  `current_unit` (`unit_inch`), unit labels `mm` / `in` (steps) or `mm/min` / `in/min`
  (feedrates). Rotary axes: plain list editor, no toggle.
- The stored list is split with `parseUnitSections()`. If the section of the shown unit is
  empty, it is pre-filled with the **untagged** (legacy) section — the legacy list is edited
  in the active unit.
- The title shows the edited unit (e.g. `X Steps (in)`).
- Keyboard: steps = numeric list with decimals, feedrates = numeric list **integers only**
  (both units).

### 5.2 Toggle key (`mm` / `in`)

- Placed next to backspace; its label is the unit it switches **to**.
- On press: the text being edited is saved into its section, the other section is loaded
  into the text area, the title unit is updated. No conversion, no validation at this
  point.

### 5.3 OK (`finalize_unit_sections()`)

1. Save the text area into the current section.
2. Validate **each non-empty section** as a numeric list: every token numeric, `> 0`, no
   decimal point in integer lists; empty tokens ignored. Any invalid section → refused.
3. Recompose with `composeUnitSections()`: `mm;<mm>;in;<in>`, an empty section is omitted
   (single tagged section), both empty → empty string (refused unless empty is allowed).
4. Write the setting. A legacy untagged list is therefore saved as a tagged section after
   its first edit.

---

## 6. Other screens and outputs

| Place | Unit used | Behavior |
|---|---|---|
| Status screen — `MPos` / `WPos` titles | `report_unit` | Small unit label right after each title, `title + unit` kept centered (`placeUnitNextToTitle()`); subscribed to `report_unit` |
| Status screen — G5X/G2X button | `parser_state` | Label `G54\nG21` (`unitCode()`) |
| Status screen — positions | `report_unit` | 3 decimals in mm, 4 in inch (§4.6) |
| Status screen — feedrate input | `current_unit` (work unit) | Pre-filled with the `[GC:]` `F` **converted to the work unit** when the firmware reports it in another unit (`formatReportedFeedInWorkUnit()`: FluidNC `F` is always mm/min, so G20 + `F15240` → `600.0` in/min), labeled `mm/min` / `in/min` (range 1–10000 either way; 0 decimal in mm, 1 in inch). Sent as plain `F<v>` (work unit); not sent if validated unchanged. `$G` sent after the change on grbl / grblHAL |
| GC state screen — unit button | `report_unit` | **Reference = report unit**: report mm → label `in`, sends `G20` + `$13=1` (grbl / grblHAL) / `$report_inches=true` (FluidNC); report inch → label `mm`, sends `G21` + `$13=0` / `$report_inches=false`, whatever the current G20/G21. Sent immediately; only when idle, connected, unlocked, no job (`canChangeModalState()`); then `$G` on grbl / grblHAL and the report unit read back (`$13` grblHAL, `$$` grbl, `$report_inches` FluidNC). `$13` persists in EEPROM (grbl / grblHAL), `report_inches` only in RAM on FluidNC (config value at boot) |
| Probe screen — position | `report_unit` | Badge in the position button corner |
| Probe screen — parameters | `current_unit`, or `report_unit` with *Commands in position unit* (read on screen creation) | Stored per axis `offset;max_travel;retract;feed_rate`, one section per unit for X / Y / Z (`mm;…;in;…`, same selection as §3.2, no conversion), plain list for A / B / C; loaded for the active unit on screen entry and on edit (no live refresh on a G20 / G21 change while the screen is open: intended, a reference is not changed mid-operation), an edit is saved into the active unit section. Labels `mm` / `in`, feed `…/min`. Commands: every line is `G91`, with a unit word when the probe unit is not the work unit (*Commands in position unit*, or rotary axis in G20 → `G21`): `G91 G21 G38.2 Z-50 F200`, `G10 L20 P0 G21 Z10`. These words are modal: the distance mode (`G90` if `[GC:]` had it) and the work unit read at start are restored on **success**, one line after the `G10` (`G90 G20`). Not on failure / STOP: the controller reset (alarm, or reset on resume after the hold) restores its default modes (assumption from grbl / FluidNC sources, tests plan §5). `[GC:]` unknown → nothing restored. Typed and displayed with up to 4 decimals (`formatProbeValue()`, trailing zeros removed); feed rate integer in mm/min, 1 decimal in in/min. See [probe_screen.md](../ux_flows/fluidnc/probe_screen.md) |
| Tool change screen — positions | `report_unit` | Unit label after the `MPos` / `WPos` titles; 3 decimals in mm, 4 in inch (§4.6) |
| Information screen | `current_unit` | `Unit: mm` / `Unit: in` |
| `[ESP420]` | `current_unit` | `"unit": "mm"` / `"in"` (raw, not translated, works without display) |

Shared helpers: `main/display/cnc/screens/position_unit.h` (`positionUnitText()`,
`createPositionUnitLabel()`, `placeUnitNextToTitle()`, `createPositionUnitBadge()`,
`updatePositionUnitBadge()`), `main/display/esp3d_unit_sections.h`,
`gcStateScreen::unitCode()` / `canChangeModalState()` / `sendModalCommand()`.

---

## 7. Porting checklist

1. Track two values: work unit (from `[GC:]` G20 / G21) and report unit (`$13` /
   `$/report_inches`); default mm; no conversion, except the display of the reported
   `[GC:]` `F` in the work unit (FluidNC reports it in mm/min whatever the units, §1.1).
2. Query both at connection: `$13` (or parse it from `$$`) / `$report_inches`, then `$G`.
3. Parse `[GC:]` with the whole-word rule, last match wins, keep the value when absent.
4. Re-read `$G` after any modal command sent by the client and when opening the jog view
   (grbl / grblHAL); FluidNC pushes `[GC:]` itself.
5. Store jog lists as `mm;…;in;…` (legacy untagged accepted); select own section → other →
   untagged; rotary axes untagged.
6. Send `$J=G91…` **without** unit word (or, with the *commands in position unit* option, with the
   report unit word, `G21` for rotary axes); same unit choice for the probe, whose unit word is
   modal: restore the distance mode and the work unit after the sequence; refresh every jog label as soon as the jog unit
   changes, and reload the lists (index per axis kept, clamped).
7. Show the report unit next to the positions only; degrees for rotary axes. Keep the
   report precision (3 decimals in mm, 4 in inch), WCO included (§4.6).
8. List editor: one section per unit, toggle without conversion, validate each non-empty
   section, recompose omitting empty sections.

## 8. Known limits (as implemented)

- Report unit is read at connection and after the GC state unit button only.
- *Commands in position unit* covers the jog and the probe (probe phase 2, 2026-11-07). The
  probe restores its modal words on success only (§6). The restore uses the parser state
  of the screen opening (`$G` sent then): a G90/G91 changed from another client during the
  probe screen is not seen. The typed feedrate follows the
  work unit **by design** (decision 2026-11-07): it sets the modal F, typed like the jog
  feedrates in G20 (in/min).
- grbl / grblHAL: the unit of `[GC:]` `F` and `FS:`, the unit word in `$J`, the rotary axes
  in G20 and the `$13` read back are **assumed from the grbl 1.1 source, not verified on
  hardware** (§1.1 table, tests plan `tests/units_inch_mm_grbl_grblhal_test_plan.md`).
  `reportedFeedIsInch()` assumes `[GC:]` `F` in the report unit there: if the tests show
  mm/min like FluidNC, only that function changes.
- The tool change screen has no unit-dependent parameter (only `M6` / `M61` and the probe).
- Feedrate lists are integers in both units (the inch defaults are integers; the jog Custom
  value allows 1 decimal in inch).

---

## 9. Unit audit (2026-11-07)

Every place where a value with a unit is shown, typed or sent, checked against §1.1.

| Place | Behavior | Status |
|---|---|---|
| Positions MPos / WPos / WCO (status, jog, probe, tool change) | Report unit, report precision | OK |
| Jog steps / feedrates / handwheel / Custom | Work unit, or report unit + unit word with *Commands in position unit* | OK — follows the GC state unit button, **hardware-confirmed 2026-11-07** (FluidNC) |
| GC state unit button | Reference = report unit; sends `G20`/`G21` + `$report_inches` / `$13`, then reads back | **Hardware-confirmed 2026-11-07** (FluidNC); grbl / grblHAL: tests plan §2 |
| Jog Zero (`G10 L20 P0 X0`) | 0 is unit-independent | OK |
| Probe `G38.2` / retract `G1` / `G10 L20 P0 <offset>` | Work unit, or report unit + unit word with *Commands in position unit*; rotary `G21` in G20; distance mode + work unit restored on success | **DONE 2026-11-07** (phase 2): build OK, hardware test pending. Before: the sequence left the machine in `G91` |
| Probe `[PRB:]` | Contact flag only, no value reused | OK |
| Tool change | `M6` / `M61Q` only, no unit value | OK |
| Status — typed feedrate | Was pre-filled with `[GC:]` `F` but labeled and sent in the work unit (G20 on FluidNC: `254` shown as in/min, OK → 6451 mm/min) | **FIXED 2026-11-07**, final version: editor in the work unit, reported `F` converted for display (the only conversion, §1), plain `F<v>`. An intermediate version (input in mm/min, `G21F<v>` then `G20`) was hardware-validated then replaced: it forced mm/min input while working in inch. Final version: **hardware-confirmed 2026-11-07** (FluidNC). Known limitation accepted: mm display rounded to 0 decimal (`F152.4` shown `152`, §1) |
| Status — `Fs:` / `Fr:` labels | `Fs` converted to the work unit (same as the F editor); `Fr` raw (`FS:`, report unit); no unit text shown | `Fs` OK; unit text next to `Fs` / `Fr` still missing (layout to check) |
| Status — view 3 button `G54` / `G21` | Work unit only | Design question (show the report unit too?) |
| Information screen, `[ESP420]` `unit` | Work unit only | Report unit missing |
| Rotary axes A/B/C | `$J` now always carries `G21` (§4.3), both modes | **FIXED 2026-11-07** for the jog and the probe (`G21` on the probe lines when in G20). **Not tested on hardware** (no rotary machine available, 2026-11-07): left to community testing, or to a test on a bare board. Firmware behavior in G20 still to verify (tests plan §1.4 / §3.4) |
| Report unit changed by another client | Read at connection and after the GC state unit button only | Known limit (§8) |

Planned fixes, in order:
1. ~~Typed feedrate~~ — done 2026-11-07 (§6).
2. ~~Probe phase 2~~ — done 2026-11-07 (§6): probe unit = jog unit, unit word, distance mode
   and work unit restored on success (failure / STOP: controller reset).
3. ~~Rotary axes: `G21` in every `$J`~~ — done 2026-11-07 (§4.3).
4. Unit text next to `Fs:` / `Fr:` (`Fs` = work unit since the conversion, `Fr` = report
   unit).
5. Report unit in the information screen and `[ESP420]`.
