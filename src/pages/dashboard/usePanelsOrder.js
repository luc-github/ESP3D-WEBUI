/*
 usePanelsOrder.js - ESP3D WebUI dashboard panels reordering

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
import { clone, applyPanelsOrder } from "../../components/Helpers"
import { useUiContextFn } from "../../contexts"

//Reordering of the dashboard panels: the grid pointer drag (see
//PanelLayoutControls.js) swaps two panels live; each swap updates the
//visible order immediately, and the panelsorder preference is written
//back once the drag settles (debounced - flagged modified for save)
let persistTimer = null

const usePanelsOrder = ({ panels, uisettings, interfaceSettings }) => {
    //write the current order back to the panelsorder preference
    const writeBack = () => {
        const visibles = panels.visibles
        const next = clone(uisettings.current)
        const el = useUiContextFn.getElement("panelsorder", next)
        if (
            applyPanelsOrder(
                el,
                visibles.map((p) => p.settingid || p.id)
            )
        ) {
            uisettings.set(next)
            if (interfaceSettings?.current)
                interfaceSettings.current.settings = next
        }
    }
    const reorderPanels = (dragIndex, insertIndex) => {
        if (
            dragIndex == null ||
            insertIndex == null ||
            dragIndex === insertIndex ||
            dragIndex < 0 ||
            insertIndex < 0 ||
            dragIndex >= panels.visibles.length ||
            insertIndex >= panels.visibles.length
        )
            return
        const visibles = [...panels.visibles]
        const [moved] = visibles.splice(dragIndex, 1)
        visibles.splice(insertIndex, 0, moved)
        const newFixedPanels = visibles.map((p, i) => ({
            index: i,
            id: p.settingid || p.id,
        }))
        panels.setPanelsOrder(newFixedPanels)
        panels.setVisibles(visibles)
        //debounced write-back: a drag can swap several times in a row
        if (persistTimer) clearTimeout(persistTimer)
        persistTimer = setTimeout(writeBack, 300)
    }
    return { reorderPanels }
}

export { usePanelsOrder }
