/*
 * Configurable verbose filters for terminal lines.
 * A line is "verbose only" if it matches any of the user-defined rules.
 * Used when "verbose" mode is off to hide these lines from the terminal.
 */

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
 * Returns true if the line should be treated as "verbose only" (hidden when verbose mode is off).
 * @param {string} line - Raw line (will be trimmed)
 * @param {Array<{ type?: string, value?: string }>|null|undefined} filters - List of rules from preferences (verbosefilters)
 * @returns {boolean}
 */
export function matchVerboseLine(line, filters) {
    const trimmed = line.trim()
    if (trimmed.length === 0) return true
    if (!filters || !Array.isArray(filters) || filters.length === 0) return false
    return filters.some((rule) => matchRule(trimmed, rule))
}
