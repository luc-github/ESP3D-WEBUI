/*
 usePanelDnD.js - ESP3D WebUI dashboard panels drag & drop

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
import { useState } from "preact/hooks"
import { clone, applyPanelsOrder } from "../../components/Helpers"
import { useUiContextFn } from "../../contexts"

//Drag & drop reordering of the fixed dashboard panels; the new order is
//written back to the panelsorder preference (flagged modified for save)
const usePanelDnD = ({ panels, uisettings, interfaceSettings }) => {
    const [dropIndicator, setDropIndicator] = useState({
        index: null,
        side: null,
    })

    const getDragHandlers = (index) => {
        const handleDragStart = (e) => {
            e.dataTransfer.setData("text/plain", String(index))
            e.dataTransfer.effectAllowed = "move"
            useUiContextFn.haptic()
            document.body.classList.add("panel-dragging")
            const img = new Image()
            img.src =
                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            e.dataTransfer.setDragImage(img, 0, 0)
        }
        const handleDragOver = (e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = "move"
            const rect = e.currentTarget.getBoundingClientRect()
            const side =
                e.clientX < rect.left + rect.width / 2 ? "before" : "after"
            setDropIndicator({ index, side })
        }
        const handleDragEnd = () => {
            document.body.classList.remove("panel-dragging")
            setDropIndicator({ index: null, side: null })
        }
        const handleDrop = (e) => {
            e.preventDefault()
            const dragIndex = parseInt(
                e.dataTransfer.getData("text/plain"),
                10
            )
            const { index: dropIndex, side: dropSide } = dropIndicator
            setDropIndicator({ index: null, side: null })
            if (dropIndex == null || dropSide == null) return
            let insertIndex =
                dropSide === "before" ? dropIndex : dropIndex + 1
            if (dragIndex < insertIndex) insertIndex -= 1
            if (dragIndex === insertIndex) return
            const visibles = [...panels.visibles]
            const [moved] = visibles.splice(dragIndex, 1)
            visibles.splice(insertIndex, 0, moved)
            const newFixedPanels = visibles.map((p, i) => ({
                index: i,
                id: p.settingid || p.id,
            }))
            panels.setPanelsOrder(newFixedPanels)
            panels.setVisibles(visibles)
            //write the new order back to the panelsorder
            //preference (flagged modified for save)
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
        return { handleDragStart, handleDragOver, handleDragEnd, handleDrop }
    }

    return { dropIndicator, setDropIndicator, getDragHandlers }
}

export { usePanelDnD }
