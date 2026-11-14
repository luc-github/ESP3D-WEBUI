/*
 panelsOrder.js - ESP3D WebUI settings helper file

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

import { reindexList } from "./model"

//single source of truth for panelsorder <-> extracontents reconciliation
//(was duplicated 3 times: importHelper + twice in tabs/interface):
//- drops extracontents_<id> entries whose panel no longer exists
//- inserts missing panels in place of the legacy "extracontents"
//  placeholder when present, else appends them
//- reindexes once and refreshes nb
//mutates settings in place, returns true when the list changed

const getExtraRootId = (item) => {
    const nameVal =
        item.value && item.value.find((s) => s && s.name === "name")?.value
    if (!nameVal || !String(nameVal).startsWith("extracontents_")) return null
    return String(nameVal).replace("extracontents_", "")
}

const findElement = (settings, id) => {
    for (const key of Object.keys(settings)) {
        const arr = settings[key]
        if (!Array.isArray(arr)) continue
        const found = arr.find((el) => el.id === id)
        if (found) return found
    }
    return null
}

const syncPanelsOrder = (settings) => {
    if (!settings || typeof settings !== "object") return false
    const panelsOrderEl = findElement(settings, "panelsorder")
    if (!panelsOrderEl || !Array.isArray(panelsOrderEl.value)) return false
    const extraContentsEl = findElement(settings, "extracontents")

    const panelIds =
        extraContentsEl && Array.isArray(extraContentsEl.value)
            ? extraContentsEl.value
                  .filter((item) => {
                      const targetField =
                          item.value &&
                          item.value.find((s) => s && s.name === "target")
                      return (
                          targetField &&
                          (targetField.value === "panel" ||
                              targetField.initial === "panel")
                      )
                  })
                  .map((item) => item.id)
            : []

    let changed = false
    let arr = panelsOrderEl.value

    //1- drop orphans
    const filtered = arr.filter((item) => {
        const rootId = getExtraRootId(item)
        return rootId === null || panelIds.includes(rootId)
    })
    if (filtered.length != arr.length) {
        arr = filtered
        changed = true
    }

    //2- insert missing panels
    const existingIds = new Set(
        arr.map(getExtraRootId).filter((id) => id !== null)
    )
    const missingIds = panelIds.filter((id) => !existingIds.has(id))
    if (missingIds.length > 0) {
        const mkItem = (id, i) => ({
            id: "extracontents_" + id,
            value: [
                { name: "name", value: "extracontents_" + id },
                { name: "index", value: i },
            ],
            index: i,
        })
        const placeholderIdx = arr.findIndex(
            (item) =>
                item.value &&
                item.value.find((s) => s && s.name === "name")?.value ===
                    "extracontents"
        )
        if (placeholderIdx != -1) {
            arr = [
                ...arr.slice(0, placeholderIdx),
                ...missingIds.map((id, i) => mkItem(id, placeholderIdx + i)),
                ...arr.slice(placeholderIdx + 1),
            ]
        } else {
            arr = [
                ...arr,
                ...missingIds.map((id, i) => mkItem(id, arr.length + i)),
            ]
        }
        changed = true
    }

    if (changed) {
        reindexList(arr)
        panelsOrderEl.value = arr
        panelsOrderEl.nb = arr.length
    }
    return changed
}

export { syncPanelsOrder }
