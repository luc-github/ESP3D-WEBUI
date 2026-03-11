/*
 extensions.js - ESP3D WebUI helpers file

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.
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
