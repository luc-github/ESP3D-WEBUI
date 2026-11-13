# Change Tool Screen — grblHAL I/O Reference

> **Scope:** `main/display/cnc/grblhal/screens/change_tool_screen.cpp` (per-firmware copy since the probe/change_tool split)
> **Target firmware:** grblHAL
> **Status:** ⚠️ Implemented against the grblHAL manual tool change protocol — **HARDWARE VALIDATION NEEDED** (intermediate state names, $TPW completion, cancel-via-soft-reset).
> **Purpose of this document:** List all observables monitored and all commands sent, and document the grblHAL manual tool change flow (which differs fundamentally from FluidNC).

---

## 1. Overview

Two modes:

| Mode | Command | Description | grblHAL |
|---|---|---|---|
| **SET** (`M61Q`) | `M61Q<n>` | Set current tool number, no movement | ✅ Standard |
| **CHANGE** (`T<n> M6`) | `T<n> M6` | Full manual tool change via the grblHAL protocol | ✅ Implemented (validate on HW) |

The pendant acts as the **sender** and implements the grblHAL **manual tool change protocol**:

```
T<n> M6  →  "TOOL" state  →  ack (realtime 0xA3)  →  install tool (+ optional $TPW)  →  cycle start (~)  →  IDLE
```

grblHAL `$341` selects the controller-side behaviour (0=100% manual, 1=manual touch off `$TPW`,
2=touch off @G59.3, 3=automatic @G59.3, 4=ignore). From the **sender's** point of view the
flow is uniform (ack → finish), so the screen does **not** read `$341`; the optional `$TPW`
button covers modes 1-2.

> Refs: [Manual tool change protocol](https://github.com/grblHAL/core/wiki/Manual-tool-change-protocol) ·
> [Manual, semi-automatic and automatic tool change](https://github.com/grblHAL/core/wiki/Manual,-semi-automatic-and-automatic-tool-change)

---

## 2. State Machine

### Mode CHANGE (T<n> M6) — grblHAL manual protocol

```
IDLE
  │ btn1 START  → T<n> M6
  ▼
MOVING_TO_CHANGE  ── timeout / ALARM ──► FAILED (+ revert)
  │ firmware_status == "TOOL"   (timeout dropped — user-driven from here)
  ▼
WAITING_ACK            ← UI: "Tool change pending - acknowledge"
  │ btn1 ACK → realtime 0xA3
  ▼
WAITING_USER           ← install tool; jog allowed; UI: "Change tool T<n>, probe or finish"
  │ btn0 $TPW → "$TPW" ──► PROBING ──(returns to TOOL)──► back to WAITING_USER   (ALARM ► FAILED)
  │ btn1 FINISH → realtime ~ (cycle start)
  ▼
COMPLETING  ── timeout / ALARM ──► FAILED (+ revert)
  │ firmware_status == "IDLE"
  ▼
SUCCESS  (current_tool = target_tool; auto-suggest next tool)
```

### Mode SET (M61Q)

```
IDLE → btn1 START → M61Q<n> → SUCCESS (immediate) → optional probe prompt → probe_screen / done
```

**Terminal states:** `SUCCESS`, `FAILED`, `CANCELLED`.
**Cancel** (btn1 Stop during MOVING_TO_CHANGE / PROBING / COMPLETING): soft reset `0x18` + `M61Q<previous>` revert. *(HW validation needed.)*

---

## 3. Realtime / G-code Commands

| Phase | Command | Constant / value | Notes |
|---|---|---|---|
| START (CHANGE) | `T<n> M6` | normal gcode | Enters grblHAL `Tool` state |
| Acknowledge | `0xA3` | `GRBLHAL_RT_TOOL_ACK` | **New** — flushes buffer, accepts jog/touch-off/$ |
| Tool probe | `$TPW` | normal gcode | Tool-setter probe, `$341` modes 1-2 |
| Finish | `~` | `GRBL_RT_CYCLE_START` | Restores buffer, resumes |
| Cancel | `0x18` | `GRBL_RT_SOFT_RESET` | Abort pending change + revert |
| START (SET) | `M61Q<n>` | normal gcode | Standard, no movement |
| Revert | `M61Q<previous>` | normal gcode | Realign firmware tool number |

While the change is pending, only **jogging** is allowed; other motion returns **error 40**.

---

## 4. Observables

| Observable | Direction | Usage |
|---|---|---|
| `parser_state` | Read | Current tool number (`T<n>` field) |
| `firmware_status` | Read | State transitions — `TOOL` / `IDLE` / `ALARM` (uppercased by handler) |
| `position_wx/wy/wz` | Read | DRO display (WPos), throttled |
| `position_mx/my/mz` | Read | DRO display (MPos), throttled |
| `server_status` | Read | Connection gate — `"R"` (PASSIVE) disables controls |

---

## 5. Button mapping per state (0=left, 1=center, 2=right)

| State | btn0 | btn1 | btn2 |
|---|---|---|---|
| IDLE / SUCCESS / FAILED / CANCELLED | mode toggle (`ok_b`) | START (`change_b`) | Back (`back_b`) |
| MOVING_TO_CHANGE / PROBING / COMPLETING | — | Stop (`stop_b`) | — |
| WAITING_ACK | — | **Ack** (`ok_b` → 0xA3) | — |
| WAITING_USER | **$TPW** (`zero_b`) | **Finish** (`play_b` → ~) | — |

> `$TPW` reuses `zero_b` (no dedicated `probe_b` button icon exists).

---

## 6. grblHAL-specific notes / open items (validate on hardware)

- **State name**: grblHAL reports `Tool` (→ `TOOL`); FluidNC used `HOLD`. The recovery/restore paths and the re-entry case now key on `TOOL`.
- **0xA3 ack**: required by grblHAL before it accepts commands — has **no FluidNC equivalent**.
- **$TPW completion detection**: heuristic = leave `TOOL` (motion seen) then return to `TOOL`. If grblHAL keeps `Tool` state during the probe move, this needs revisiting (could use `probe_status`).
- **Cancel**: soft reset is a blunt abort; exact clean-cancel semantics for a pending tool change need confirmation.
- **Re-entry**: if the screen opens while firmware is already in `TOOL`, it resumes into `WAITING_ACK`.
- **Translations**: grblHAL-only labels `tc_*` (ids 1001-1006) in `grblhal/esp3d_target_translations_defs.inc`.

## 7. Axis naming — UVW

Position rows (MPos/WPos) for axes 4/5/6 still use hardcoded `A`/`B`/`C` labels (display only, no commands use axis names here). Same deferred gap as noted previously — adapt to `axis_names` if a UVW machine needs it.
