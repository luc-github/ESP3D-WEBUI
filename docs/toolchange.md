# Tool Change Panel — ESP3D WebUI (CNC target: grblHAL only)

> **Scope:** `src/components/Panels/ToolChangeCNC.js`, registered in `src/targets/CNC/grblHAL/panels.js`, settings in `src/targets/CNC/grblHAL/preferences.json` (`tool` section)
> **Target firmware:** grblHAL (manual tool change protocol — not available on classic GRBL)
> **Purpose:** Document the tool change flow, the commands sent, the observables used, and the deliberate design differences with the ESP3D pendant change-tool screen (`Luc-Pibot-cnc-pendant-firmware`).

---

## 1. Overview

Two modes, mirroring the pendant:

| Mode | Command | Description |
|---|---|---|
| **Set** | `M61Q<n>` | Set the current tool number, no movement |
| **Change** | `T<n> M6` | Full manual tool change via the grblHAL protocol |

The WebUI acts as the **sender** and follows the grblHAL manual tool change protocol:

```
T<n> M6  →  "Tool" state  →  ack (realtime 0xA3)  →  install tool (+ optional $TPW)  →  cycle start (~)  →  Idle
```

grblHAL `$341` selects the controller-side behaviour (0=manual, 1=manual touch off `$TPW`, 2=touch off @G59.3, 3=automatic @G59.3, 4=ignore). From the sender's point of view the flow is uniform (ack → finish), so the panel does **not** read `$341`; the `$TPW` button covers modes 1-2.

> Refs: [Manual tool change protocol](https://github.com/grblHAL/core/wiki/Manual-tool-change-protocol) ·
> [Manual, semi-automatic and automatic tool change](https://github.com/grblHAL/core/wiki/Manual,-semi-automatic-and-automatic-tool-change)

---

## 2. UI flow

The panel has no internal state machine — **the firmware `Tool` status drives the UI directly**:

```
Idle (or any non-Tool state)                Tool state reported
┌─────────────────────────────┐          ┌──────────────────────────────┐
│ Active tool: T<n>           │          │ Active tool: T<n>            │
│ Tool number: [___]          │          │ [Acknowledge]  → 0xA3        │
│ Mode: Set (M61Q)/Change(M6) │   T M6   │ [Probe]        → $TPW        │
│ [Start]  (disabled if       │ ───────► │ [Finish]       → ~           │
│  status != Idle)            │          │ [Cancel]       → 0x18        │
└─────────────────────────────┘          └──────────────────────────────┘
```

- **Re-entry**: opening the panel while a change is already pending (firmware in `Tool`) shows the action buttons directly — the flow resumes where it is.
- **Guard**: Start refuses to send when the machine is not `Idle` (error toast `CN115`); the button is also disabled.
- **`$G`** is sent after Start and after Finish to refresh the modal states display (including the active tool) without waiting for the next `[GC:]` report.

---

## 3. Commands sent

| Action | Command | Notes |
|---|---|---|
| Start (Set) | `M61Q<n>` | Standard, no movement |
| Start (Change) | `T<n> M6` | Enters the grblHAL `Tool` state |
| Acknowledge | `0xA3` (`#TOOLCHANGE#`) | Realtime — flushes buffer, accepts jog/touch-off/`$` commands |
| Probe | `$TPW` | Tool-setter probe (`$341` modes 1-2) |
| Finish | `~` (`#CYCLESTART#`) | Restores buffer, resumes |
| Cancel | `0x18` (`#SOFTRESET#`) | Aborts the pending change |
| Refresh | `$G` | Parser state report → updates active tool display |

While the change is pending, only **jogging** is allowed by the firmware; other motion returns error 40. The Jog panel remains usable (and is the expected way to position for the touch off).

---

## 4. Observables used

| Observable | Source | Usage |
|---|---|---|
| `status.state` | `<…\|…>` status report | `Tool` detection (UI switch + re-entry), Idle guard |
| `states.active_tool` | `[GC:…]` parser state (`T<n>`) | Active tool display |

The realtime commands (`0xA3`, `~`, `0x18`) reuse the existing `realCommandsTable.js` entries — no protocol addition was needed.

---

## 5. Design decisions / differences with the pendant

| Topic | WebUI | Pendant | Rationale |
|---|---|---|---|
| State machine | None — firmware `Tool` status drives the UI | Full machine (MOVING_TO_CHANGE / WAITING_ACK / WAITING_USER / PROBING / COMPLETING) | The status report carries the same information; keeps the panel small |
| Timeouts | None | Per-phase timeouts | The firmware holds the state; the user acts at their pace, Cancel always available |
| Cancel | Soft reset only (`0x18`) | Soft reset + `M61Q<previous>` revert | The pendant itself flags cancel-via-reset semantics as needing hardware validation; keeping the blunt-but-predictable reset |
| `$341` | Not read | Not read either | Sender-side flow is uniform |

---

## 6. Settings

Settings tab, **Tool** section (grblHAL only):

| Setting | Default | Notes |
|---|---|---|
| `showtoolpanel` | true | Show the panel on the dashboard |
| `opentoolonstart` | true | Panel opened at connection |

---

## 7. Known limitations / possible future work

- No `$341` awareness (the `$TPW` button is offered even in modes where it is a no-op).
- No revert of the tool number on Cancel.
- No dedicated DRO in the panel (the Jog panel positions remain visible alongside, which covers the touch-off positioning need).
- grblHAL only: classic GRBL has no `Tool` state nor `0xA3`, so the panel is not registered in the GRBL target (and is tree-shaken out of its bundle).
