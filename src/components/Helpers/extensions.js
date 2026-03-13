/*
 extensions.js - ESP3D WebUI helpers file

 Extract manifest from extension HTML or validate manifest object.
*/

/** Extract manifest from embedded <script type="application/json" id="esp3dext-manifest">...</script> in extension HTML */
const parseEmbeddedManifest = (htmlText) => {
    if (!htmlText || typeof htmlText !== "string") return null
    const match = htmlText.match(/<script[^>]*\sid=["']esp3dext-manifest["'][^>]*>([\s\S]*?)<\/script>/i)
    if (!match || !match[1]) return null
    try {
        return JSON.parse(match[1].trim())
    } catch (_) {
        return null
    }
}

const matchVersion = (version, pattern) => {
    if (!pattern || pattern === "*") return true
    const v = String(version).split(".")
    const p = String(pattern).split(".")
    for (let i = 0; i < Math.max(v.length, p.length); i++) {
        const pSeg = p[i] === undefined ? "*" : p[i]
        const vSeg = v[i] === undefined ? "0" : v[i]
        if (pSeg !== "*" && pSeg !== vSeg) return false
    }
    return true
}

/** Check manifest compatibility with current target. config: { webUIVersion, targetCategory, target } */
const isExtensionCompatible = (manifest, config) => {
    if (!manifest || manifest.supportedVersion == null || String(manifest.supportedVersion).trim() === "" ||
        manifest.targetSystem == null || String(manifest.targetSystem).trim() === "") return false
    const { webUIVersion: wv, targetCategory: tc, target: tgt } = config || {}
    const categoryId = ({ Printer3D: "3d printer", CNC: "cnc", SandTable: "sand table" }[tc] || (tc || "").toLowerCase()).replace(/\s/g, "")
    const targetId = (tgt || "").toLowerCase().replace(/\s/g, "")
    const list = String(manifest.targetSystem).toLowerCase().replace(/\s/g, "").split(",").map((s) => s.trim()).filter(Boolean)
    const matchTarget = list.length === 0 || list.includes("*") || list.includes(categoryId) || list.includes(targetId)
    return matchVersion(wv || "3.0", String(manifest.supportedVersion).trim()) && matchTarget
}

export { parseEmbeddedManifest, matchVersion, isExtensionCompatible }
