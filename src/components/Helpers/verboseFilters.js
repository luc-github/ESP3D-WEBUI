/*
 * Configurable verbose filters for terminal lines.
 * The filter defines what is considered "verbose" content: if a line matches the filter, it is verbose.
 * When verbose mode is off, lines that match any rule are hidden (not displayed).
 */
const TERMINAL_VERBOSE_DEBUG = false

/**
 * Match a line against a single filter rule.
 * @param {string} line - Trimmed line text
 * @param {{ type: string, value: string }} rule - { type: "startswith"|"endswith"|"contain"|"regex", value: string }
 * @returns {boolean}
 */
function matchRule(line, rule) {
    if (!rule || rule.value == null || rule.value === "") return false
    const v = String(rule.value)
    switch (rule.type) {
        case "startswith":
            return line.startsWith(v)
        case "endswith":
            return line.endsWith(v)
        case "contain":
            return line.includes(v)
        case "regex": {
            try {
                return new RegExp(v).test(line)
            } catch (_) {
                return false
            }
        }
        default:
            return false
    }
}

/**
 * Normalize a verbose filter rule coming from settings.
 * The UI editor stores list items as { id, value: [{name:"type",value:"contain"},{name:"value",value:"T:"}], ... }.
 * Targets may also define defaults as plain { type, value } objects.
 * @param {any} rule
 * @returns {{ type?: string, value?: string }}
 */
function normalizeRule(rule) {
    if (!rule) return {}
    // UI list item format: value is array of sub-fields [{name:"type",value:"contain"},{name:"value",value:"T:"}]
    // Must check first, otherwise we'd do String(rule.value) => "[object Object],..."
    if (Array.isArray(rule.value)) {
        const typeField = rule.value.find((e) => e && e.name === "type")
        const valueField = rule.value.find((e) => e && e.name === "value")
        return {
            type: typeField && typeField.value != null ? String(typeField.value) : undefined,
            value: valueField && valueField.value != null ? String(valueField.value) : undefined,
        }
    }
    // Plain object format: { type, value } with primitive value
    if (rule.type != null || rule.value != null) {
        return { type: rule.type != null ? String(rule.type) : undefined, value: rule.value != null ? String(rule.value) : undefined }
    }
    return {}
}

/**
 * Returns true if the line should be treated as "verbose only" (hidden when verbose mode is off).
 * If the line matches any filter rule, it is considered verbose → return true (hide when verbose off).
 * @param {string} line - Raw line (will be trimmed)
 * @param {Array<{ type?: string, value?: string }>|null|undefined} filters - List of rules from preferences (verbosefilters)
 * @returns {boolean}
 */
export function matchVerboseLine(line, filters) {
    const trimmed = line.trim()
    if (trimmed.length === 0) return true
    const isArray = Array.isArray(filters)
    const list = isArray ? filters : filters && filters.value
    const arr = Array.isArray(list) ? list : []
    if (arr.length === 0) {
        if (TERMINAL_VERBOSE_DEBUG) console.log("[Terminal verbose] filter: no rules (filters isArray=%s, arr.length=0)", isArray)
        return false
    }
    const matched = arr.some((rule) => matchRule(trimmed, normalizeRule(rule)))
    if (TERMINAL_VERBOSE_DEBUG) {
        const firstRule = normalizeRule(arr[0])
        console.log("[Terminal verbose] line=%s | rules=%s | firstRule=%s | isverboseOnly=%s", trimmed.slice(0, 60), arr.length, JSON.stringify(firstRule), matched)
    }
    return matched
}
