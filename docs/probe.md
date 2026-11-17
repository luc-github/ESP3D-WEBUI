# Probe Panel — ESP3D WebUI (CNC targets: GRBL / grblHAL)

> **Scope:** `src/components/Panels/ProbeCNC.js`, settings in `src/targets/CNC/preferences.json` (`probe` section)
> **Target firmwares:** GRBL 1.1 / grblHAL
> **Purpose:** Document the probing cycle philosophy, the commands sent, the observables used, and the deliberate design differences with the ESP3D pendant probe screen (`Luc-Pibot-cnc-pendant-firmware`).

---

## 1. Overview

The panel implements a **two-pass probing cycle**, identical in spirit to the pendant and to what ioSender/UGS generate:

1. **Fast seek** — `G38.x` at the configured feed rate
2. **Retract** — small back-off `G1` move
3. **Slow feed** — `G38.x` at half feed rate, for precision
4. **Apply offset** — user-defined finalize commands (default `G10 L20 P0 <axis><thickness>`)

The WebUI acts as the **sender**: the firmware only executes `G38.x`. Plate thickness, retract and the two-pass logic are generated UI-side — there is no firmware-side probe macro involved.

---

## 2. Command sequence

Sent in one batch when the Probe button is pressed (grbl executes the planner queue sequentially, so no event-driven state machine is needed):

```
G91
G21                      ← unit word, only if the work unit is known (see §4)
G38.2 Z-<travel> F<feed>     ← fast seek (sign depends on probe type, see §3)
G1 Z<retract> F<feed>        ← back-off, opposite direction
G38.2 Z-<travel> F<feed/2>   ← slow pass at half feed rate
G90
G10 L20 P0 Z<thickness>      ← default finalize command (probepostcommand setting)
```

**Safety property of `G38.2` (default):** if the seek does not touch, the firmware raises an alarm and the alarm **purges the planner queue** — the retract, the slow pass and the `G10` offset are never executed. This is why `G38.2` (error on no-contact) is the default and recommended probe type.

---

## 3. Probe type selector (G38.2 / G38.3 / G38.4 / G38.5)

Unlike the pendant (locked to `G38.2`), the WebUI keeps the historical type selector because it merely builds a command line, which covers exotic setups:

| Type | Behaviour | With the two-pass cycle |
|---|---|---|
| `G38.2` | Seek toward workpiece, **alarm on no-contact** | ✅ Reference mode — failure purges the queue |
| `G38.3` | Same, **no alarm** on no-contact | ⚠️ Works, but a failed seek continues silently and the offset is still applied |
| `G38.4` / `G38.5` | Probe **away**, stop on **loss** of contact (normally-closed contact) | ⚠️ Seek direction is inverted (`+`); use knowingly |

The seek direction convention is unchanged: `G38.2`/`G38.3` move in the negative axis direction, `G38.4`/`G38.5` in the positive one; the retract always goes the opposite way.

---

## 4. Units handling (mm / inch)

No conversion anywhere — values are displayed and sent as-is, in the **work unit**:

- Probe parameters (distance max, retract, thickness, feed rate) are interpreted in the **current work unit** (`G20`/`G21` read from the `[GC:]` report). Field suffixes follow it (`mm`/`in`, `mm/min`/`in/min`).
- The unit word (`G20`/`G21`) is prepended to the sequence **only when the work unit is known** (a `[GC:]` report has been received). Otherwise it is omitted so the sequence never flips an unknown modal state.
- Since the sent unit word equals the current work unit, no modal restore is needed after the cycle (`G90` is still sent, as historically).

**Deliberate difference with the pendant:** the pendant stores one parameter section per axis **per unit** (`mm;…;in;…`). The WebUI keeps a single global parameter set interpreted in the current work unit — simpler, smaller footprint, and consistent with the "no conversion" philosophy. Users working in both units should review the probe parameters after switching unit.

---

## 5. Guards

The Probe button refuses to start (error toast) when:

- the machine status is not `Idle` (`CN115`)
- the probe-disconnected pin is reported (`|Pn:…O…`, grblHAL extension — `CN116`)

There is no software timeout: the firmware alarm on a failed `G38.2` seek terminates the cycle, and a feed hold / soft reset from the Status panel remains available at any time.

---

## 6. Observables used

| Observable | Source | Usage |
|---|---|---|
| `status.state` | `<…\|…>` status report | Idle guard |
| `states.units` | `[GC:…]` parser state | Work unit (labels, unit word) |
| `pinsStates.P` / `pinsStates.O` | `\|Pn:` in status report | Probe / probe-disconnected badges + disconnected guard |
| `gcodeParameters.PRB` | `[PRB:…:0\|1]` | Last probe result display |
| `positions` (`#pos_*#`), `#selected_axis#`, `#probe_thickness#` | variablesList | Substitutions in finalize commands |

---

## 7. Parameters (settings → Probe)

| Setting | Type | Default | Notes |
|---|---|---|---|
| `probefeedrate` | number | 20 | Seek feed rate; slow pass = ÷2. Work unit / min |
| `maxprobe` | number | 15 | Max travel of each pass. Work unit |
| `proberetract` | number | 2 | Back-off between passes. Work unit |
| `probethickness` | number | 1 | Plate thickness, exported as `#probe_thickness#`. Work unit |
| `probepostcommand` | text | `G10 L20 P0 #selected_axis##probe_thickness#` | Finalize commands (`;` separated) |

---

## 8. Known limitations / possible future work

- Blind batch sequencing (no per-phase confirmation from firmware status).
- No per-axis or per-unit parameter sections (pendant parity).
- `G38.3`–`G38.5` do not benefit from the alarm-based safety purge.
- Rotary axes (A/B/C/U/V/W) are selectable but the cycle is unit-agnostic for them (degrees).
