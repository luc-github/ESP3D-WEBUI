/*
 fonts.js - ESP3D WebUI settings helper file

 Copyright (c) 2026 Luc LEBOSSE. All rights reserved.

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public
 License as published by the Free Software Foundation; either
 version 3 of the License, or (at your option) any later version.

 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.

 You should have received a copy of the GNU General Public
 License along with This code; if not, see <https://www.gnu.org/licenses/>.
*/

//build @font-face CSS for theme packs and language packs
//each font supports: sources[] (multi-format), data (base64) or src (URL)
const buildFontFaceCSS = (fonts) =>
    fonts
        .map((f) => {
            let srcParts
            if (f.sources && f.sources.length > 0) {
                srcParts = f.sources
                    .map((s) =>
                        s.data
                            ? `url('data:font/${s.format || "woff2"};base64,${s.data}') format('${s.format || "woff2"}')`
                            : `url('${s.src}') format('${s.format || "woff2"}')`
                    )
                    .join(",")
            } else if (f.data) {
                srcParts = `url('data:font/${f.format || "woff2"};base64,${f.data}') format('${f.format || "woff2"}')`
            } else {
                srcParts = `url('${f.src}') format('${f.format || "woff2"}')`
            }
            return (
                `@font-face{font-family:'${f.family}';src:${srcParts};` +
                `font-weight:${f.weight || "400"};` +
                `font-style:${f.style || "normal"};` +
                `font-display:${f.display || "auto"};}`
            )
        })
        .join("")

export { buildFontFaceCSS }
