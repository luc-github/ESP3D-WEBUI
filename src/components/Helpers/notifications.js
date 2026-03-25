/*
 notifications.js - ESP3D WebUI notification helpers

 Shared utilities for parsing and classifying notification messages.
 Format: TYPE:TITLE:EXTRA  (EXTRA is optional)
   - TYPE  → determines color, icon, toast variant
   - TITLE → displayed uppercase in accent color
   - EXTRA → optional secondary text in dim color
*/

// ─── Type detection filters (usable in TargetContext filters.js) ──────────────

export const isError   = (data) => /^(error|alarm):/i.test((data || "").trim())
export const isWarning = (data) => /^warn(ing)?:/i.test((data || "").trim())
export const isSuccess = (data) => {
    const c = (data || "").trim().toLowerCase()
    return c === "ok" || c.startsWith("ok ") || /^success:/i.test(c)
}
export const isInfo    = (data) => /^(info|note|primary):/i.test((data || "").trim())

// ─── Type string → toast type ─────────────────────────────────────────────────

export function toastTypeFromString(str) {
    const s = (str || "").trim().toUpperCase()
    if (s.startsWith("ERROR")   || s.startsWith("ALARM"))   return "error"
    if (s.startsWith("SUCCESS") || s.startsWith("OK"))      return "success"
    if (s.startsWith("WARN"))                                return "warning"
    if (s.startsWith("PRIMARY") || s.startsWith("INFO"))    return "primary"
    return "notification"
}

// ─── Parse TYPE:TITLE:EXTRA ───────────────────────────────────────────────────
// Input  : "Success:Homing complete:All axes homed"
// Output : { type: "success", title: "Homing complete", extra: "All axes homed" }

export function parseNotification(str) {
    const parts = (str || "").split(":")
    const type  = toastTypeFromString(parts[0])
    const title = (parts[1] || "").trim()
    const extra = parts.slice(2).join(":").trim()
    return { type, title: title || (parts[0] || "").trim(), extra }
}

// ─── Line class from terminal content ────────────────────────────────────────

export function lineClassFromContent(content, type) {
    if (type === "echo")  return "l-a"
    if (type === "error") return "l-err"
    if (isError(content))   return "l-err"
    if (isWarning(content)) return "l-warn"
    if (isSuccess(content)) return "l-ok"
    if (isInfo(content))    return "l-a"
    const c = (content || "").trim()
    if (c.startsWith("//") || c.startsWith("; ")) return "l-dim"
    return ""
}
