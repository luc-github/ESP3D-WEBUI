/**
 * Regenerates src/components/Icons/index.js: scans src/ for imports from
 * "preact-feather" (aliased to the local registry at build time) and
 * embeds only the SVG children data of the icons actually used.
 * Run: node config/build-icons.js   (after adding/removing an icon import)
 */
const fs = require("fs")
const path = require("path")

const SRC = path.join(__dirname, "..", "src")
const FEATHER = path.join(
    __dirname,
    "..",
    "node_modules",
    "preact-feather",
    "dist",
    "icons"
)
const OUT = path.join(SRC, "components", "Icons", "index.js")

const walk = (dir, out = []) => {
    for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f)
        if (fs.statSync(p).isDirectory()) walk(p, out)
        else if (/\.[jt]sx?$/.test(f)) out.push(p)
    }
    return out
}

const used = new Set()
const importRe = /import\s*\{([^}]*)\}\s*from\s*["']preact-feather["']/g
for (const f of walk(SRC)) {
    const txt = fs.readFileSync(f, "utf8")
    let m
    while ((m = importRe.exec(txt))) {
        m[1].split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((n) => used.add(n.split(" as ")[0].trim()))
    }
}

const byNorm = {}
for (const f of fs.readdirSync(FEATHER).filter((f) => f.endsWith(".js")))
    byNorm[f.replace(/\.js$/, "").replace(/-/g, "")] = f

const entries = []
for (const name of [...used].sort()) {
    const file = byNorm[name.toLowerCase()]
    if (!file) throw new Error("Icon not found in preact-feather: " + name)
    const src = fs.readFileSync(path.join(FEATHER, file), "utf8")
    const children = [...src.matchAll(/h\("(\w+)", (\{[^{}]*\})\)/g)].map(
        (mm) => [mm[1], mm[2]]
    )
    if (!children.length)
        throw new Error("No SVG children parsed for " + name)
    entries.push({ name, children })
}

const header = `/*
 index.js - ESP3D local icon set (drop-in replacement for preact-feather)

 Icon path data derived from Feather Icons (https://feathericons.com, MIT License).
 A single shared SVG wrapper + per-icon child table, instead of one full
 Preact component per icon, to reduce bundle size.

 GENERATED FILE - regenerate with: node config/build-icons.js
*/
import { h } from "preact"

const makeIcon = (children) => {
    const Icon = (props) => {
        const { color, size, ...rest } = props || {}
        return h(
            "svg",
            {
                xmlns: "http://www.w3.org/2000/svg",
                width: size || 24,
                height: size || 24,
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: color || "currentColor",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                ...rest,
            },
            children.map(([tag, attrs]) => h(tag, attrs))
        )
    }
    return Icon
}

`

let out = header
for (const e of entries) {
    const kids = e.children
        .map(
            ([t, a]) =>
                "[" +
                JSON.stringify(t) +
                ", " +
                a.replace(/\s+/g, " ").replace(/\{ /g, "{").replace(/ \}/g, "}") +
                "]"
        )
        .join(",")
    out += "export const " + e.name + " = /*#__PURE__*/ makeIcon([" + kids + "])\n"
}
fs.writeFileSync(OUT, out)
console.log("Generated", OUT, "-", entries.length, "icons")
