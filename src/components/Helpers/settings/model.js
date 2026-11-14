/*
 model.js - ESP3D WebUI settings helper file

 Copyright (c) 2026 Luc LEBOSSE. All rights reserved.

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.

 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public
 License along with This code; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

//deep clone of settings data (plain JSON only)
const clone = (obj) => JSON.parse(JSON.stringify(obj))

//reindex a list in place, including the embedded "index" sub-field
const reindexList = (arr) => {
    arr.forEach((item, i) => {
        item.index = i
        const idxField =
            item.value && item.value.find((s) => s && s.name === "index")
        if (idxField) idxField.value = i
    })
}

//early-exit scan for a boolean flag anywhere in the tree,
//replaces JSON.stringify(settings).includes('"flag":true') per keystroke
const scanFlag = (obj, key) => {
    if (!obj || typeof obj !== "object") return false
    if (obj[key] === true) return true
    for (const k in obj) {
        if (scanFlag(obj[k], key)) return true
    }
    return false
}

//save button state: something modified and no error
const settingsStatus = (settings) => ({
    hasmodified: scanFlag(settings, "hasmodified"),
    haserrors: scanFlag(settings, "haserror"),
})

export { clone, reindexList, scanFlag, settingsStatus }
