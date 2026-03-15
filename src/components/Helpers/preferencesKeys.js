/*
 * Short-key mapping for static preferences in the bundle.
 * Build: webpack loader shortens keys in preferences.json.
 * Runtime: expandShortKeys() restores full keys once after merge.
 */

/** long key -> short key (used by build loader) */
export const SHORT_KEYS = {
    id: "i",
    type: "t",
    label: "l",
    value: "v",
    depend: "d",
    help: "h",
    append: "a",
    min: "m",
    name: "n",
    fixed: "f",
    sorted: "s",
    settings: "g",
    connection_id: "c",
    nodelete: "o",
    editable: "e",
    key: "k",
    cmds: "x",
    refreshtime: "r",
}

/** short key -> long key (used at runtime) */
const LONG_KEYS = {}
for (const [long, short] of Object.entries(SHORT_KEYS)) {
    LONG_KEYS[short] = long
}

/**
 * Recursively expand short keys to full keys (mutates in place).
 * @param {object|array} obj - Preferences tree (short keys)
 * @returns {object|array} - Same tree with full keys
 */
export function expandShortKeys(obj) {
    if (obj === null || typeof obj !== "object") return obj
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            obj[i] = expandShortKeys(obj[i])
        }
        return obj
    }
    const expanded = {}
    for (const k of Object.keys(obj)) {
        const long = LONG_KEYS[k]
        const key = long !== undefined ? long : k
        expanded[key] = expandShortKeys(obj[k])
    }
    return expanded
}

/**
 * Recursively shorten keys (used by webpack loader only).
 * @param {object|array} obj - Preferences tree (full keys)
 * @returns {object|array} - New tree with short keys
 */
export function shortenKeys(obj) {
    if (obj === null || typeof obj !== "object") return obj
    if (Array.isArray(obj)) return obj.map((item) => shortenKeys(item))
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
        const short = SHORT_KEYS[k]
        const key = short !== undefined ? short : k
        out[key] = shortenKeys(v)
    }
    return out
}
