/**
 * Webpack loader: shortens keys in preferences.json to reduce bundle size.
 * Only applied to preferences.json under src/targets.
 * Map must match src/components/Helpers/preferencesKeys.js SHORT_KEYS.
 */
const SHORT_KEYS = {
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

function shortenKeys(obj) {
    if (obj === null || typeof obj !== "object") return obj
    if (Array.isArray(obj)) return obj.map((item) => shortenKeys(item))
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
        const key = SHORT_KEYS[k] !== undefined ? SHORT_KEYS[k] : k
        out[key] = shortenKeys(v)
    }
    return out
}

module.exports = function (content) {
    const parsed = JSON.parse(content)
    const shortened = shortenKeys(parsed)
    return "module.exports = " + JSON.stringify(shortened)
}
