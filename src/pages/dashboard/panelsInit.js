/*
 panelsInit.js - ESP3D WebUI dashboard panels initialisation

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

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
import { applyVisibilityOverrides } from "../../components/Panels/layoutHelper"

//Panels flagged to open on start (onstart) and enabled in the settings
//(show) - the startup visibility, before any device-local override
const computeStartupPanels = (panelsList, uisettings) =>
    panelsList.reduce((acc, curr) => {
        if (
            (typeof curr.onstart === "boolean"
                ? curr.onstart
                : uisettings.getValue(curr.onstart)) &&
            uisettings.getValue(curr.show)
        )
            acc.push(curr)
        return acc
    }, [])

//Visible panels = enabled in settings (show) + flagged to open on start,
//with the device-local visibility overrides applied
const computeVisiblePanels = (panelsList, uisettings) =>
    applyVisibilityOverrides(computeStartupPanels(panelsList, uisettings))

//Load the saved panels order into panels.list and compute the visible
//panels. Called on every render by the dashboard until panels.initDone is
//set; afterwards it only prunes the visible panels that disappeared from
//the list.
//fixedPanels is a module-level mutable of the caller: it survives remounts
//so the saved order is loaded only once per session
const initDashboardPanels = ({ panels, uisettings, isfixed, fixedPanels }) => {
    if (!panels.initDone && panels.list.length !== 0) {
        if (isfixed && fixedPanels.length === 0) {
            const panelOrder = uisettings.getValue("panelsorder")
            if (Array.isArray(panelOrder)) {
                let orderIndex = 0
                panelOrder.forEach((panel) => {
                    const nameField =
                        panel.value &&
                        panel.value.find((s) => s.name === "name")
                    const id =
                        nameField != null && nameField.value != null
                            ? nameField.value
                            : (panel.value &&
                                  panel.value[0] &&
                                  panel.value[0].value) ||
                              panel.name ||
                              panel.id
                    if (id === "extracontents") {
                        panels.list
                            .filter((p) =>
                                (p.settingid || "").startsWith(
                                    "extracontents_"
                                )
                            )
                            .forEach((p) => {
                                fixedPanels.push({
                                    index: orderIndex++,
                                    id: p.settingid,
                                })
                            })
                    } else {
                        fixedPanels.push({ index: orderIndex++, id })
                    }
                })
                panels.setPanelsOrder(fixedPanels)
                const newList = fixedPanels.reduce((acc, panel) => {
                    //skip duplicates: the saved order may reference
                    //the same settingid several times (e.g. two
                    //extensions that shared the same id before the
                    //deduplication)
                    const paneldesc = panels.list.filter(
                        (p) =>
                            p.settingid === panel.id &&
                            !acc.some((entry) => entry.id === p.id)
                    )
                    if (paneldesc.length > 0) acc.push(...paneldesc)
                    return acc
                }, [])
                //panels missing from the saved order (e.g. an
                //extension whose id changed after a name collision)
                //are appended so they stay reachable
                panels.list.forEach((p) => {
                    if (!newList.some((entry) => entry.id === p.id))
                        newList.push(p)
                })
                panels.set([...newList])
                panels.setVisibles(computeVisiblePanels(newList, uisettings))
                /* Do not write back to uisettings here: we are only loading
                   the saved order. Writing would set hasmodified and mark
                   panel order as modified when user just opened dashboard. */
            } else {
                panels.setVisibles(computeVisiblePanels(panels.list, uisettings))
            }
        } else {
            panels.setVisibles(computeVisiblePanels(panels.list, uisettings))
        }
        panels.setInitDone(true)
    } else if (panels.initDone) {
        panels.visibles.forEach((element) => {
            if (!panels.list.find((panel) => panel.id === element.id))
                panels.hide(element.id)
        })
    }
}

export { initDashboardPanels, computeVisiblePanels, computeStartupPanels }
