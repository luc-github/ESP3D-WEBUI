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

export { parseEmbeddedManifest }
