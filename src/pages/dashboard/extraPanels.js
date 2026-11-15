/*
 extraPanels.js - ESP3D WebUI dashboard extra content (extension) panels

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

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
import { ExtraPanelElement } from "../../components/Panels/ExtraPanel"

//Build the panels hosting the extra contents (extensions). Entries may
//share the same id (e.g. two extensions with the same name): ensure every
//panel gets a unique id so edition / layout / collapse features can
//address each panel individually
const buildExtraPanels = (
    extraContents,
    incompatibleExtraIds,
    defaultPanelsList
) => {
    const usedIds = new Set(defaultPanelsList.map((p) => p.id))
    return extraContents.reduce((acc, curr) => {
        if (incompatibleExtraIds.has(curr.id)) return acc
        const item = (curr.value || []).reduce((accumulator, current) => {
            accumulator[current.name] = current.initial
            return accumulator
        }, {})
        if (item.target === "panel") {
            let uniqueId = curr.id || item.name || "extrapanel"
            if (usedIds.has(uniqueId)) {
                let suffix = 2
                while (usedIds.has(`${uniqueId}_${suffix}`)) suffix++
                uniqueId = `${uniqueId}_${suffix}`
            }
            usedIds.add(uniqueId)
            acc.push(ExtraPanelElement(item, uniqueId))
        }
        return acc
    }, [])
}

export { buildExtraPanels }
