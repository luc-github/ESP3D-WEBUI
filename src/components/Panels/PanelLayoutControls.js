/*
 PanelLayoutControls.js - ESP3D WebUI component file

 Copyright (c) 2026 Luc Lebosse. All rights reserved.

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

/*
 * Per-panel layout controls, shown on the dashboard when the layout
 * edition mode is enabled.
 *
 * - mode "grid" (ardoise, responsive): -/+ buttons to change the panel
 *   width in column units. The height is global (panelheight
 *   preference) and panels are reordered by drag & drop as usual.
 * - mode "canvas" (fixe): a move handle (drag to position the panel,
 *   top left), a bottom-right grip (drag to resize the panel) and a
 *   button to toggle the panel borderless display. Positions and sizes
 *   snap to a magnetic grid.
 *
 * Layout is persisted locally, see layoutHelper.js
 */
import { h } from "preact"
import { useState, useEffect } from "preact/hooks"
import { Minus, Plus, Square, EyeOff } from "preact-feather"
import { T } from "../Translations"
import { useUiContextFn } from "../../contexts"
import { eventBus } from "../../hooks/eventBus"
import {
    getPanelLayout,
    setPanelLayout,
    getColumnCount,
    getPanelsBorderless,
    reflowCanvas,
    snap,
    CHANGE_EVENT,
    SPAN_MIN,
    SPAN_MAX,
    CANVAS_MIN_W,
    CANVAS_MIN_H,
} from "./layoutHelper"

const PanelLayoutControls = ({ panelId, mode }) => {
    const readWidthSpan = () => {
        const layout = getPanelLayout(panelId)
        const span = parseInt(layout.w, 10)
        return span >= SPAN_MIN ? span : 1
    }
    const readBorderless = () => !!getPanelLayout(panelId).b
    const [widthSpan, setWidthSpan] = useState(readWidthSpan)
    const [borderless, setBorderless] = useState(readBorderless)

    useEffect(() => {
        const handler = () => {
            setWidthSpan(readWidthSpan())
            setBorderless(readBorderless())
        }
        const listenerId = eventBus.on(CHANGE_EVENT, handler)
        return () => eventBus.off(CHANGE_EVENT, listenerId)
    }, [])

    //The drag wrapper is HTML5-draggable: suspend it while using the
    //layout controls, otherwise moving the pointer would start a panel
    //drag instead of a move/resize
    const suspendWrapperDrag = (panel, suspend) => {
        const wrapper = panel && panel.closest(".panel-drag-wrapper")
        if (wrapper) wrapper.draggable = !suspend
    }

    /* ------------------------- grid mode ------------------------- */

    const changeWidthSpan = (delta) => {
        const panel = document.getElementById(panelId)
        if (!panel) return
        useUiContextFn.haptic && useUiContextFn.haptic()
        const next = Math.max(
            SPAN_MIN,
            Math.min(SPAN_MAX, widthSpan + delta)
        )
        if (next == widthSpan) return
        setWidthSpan(next)
        setPanelLayout(panelId, { w: next > 1 ? next : null })
        //apply immediately for instant feedback
        const columns = getColumnCount(panel)
        const gridItem =
            panel.closest(".panel-drag-wrapper, .panel-layout-wrapper") ||
            panel
        gridItem.style.gridColumn =
            next >= columns ? "1 / -1" : next > 1 ? "span " + next : ""
    }

    /* ------------------------- canvas mode ------------------------ */

    const toggleBorderless = () => {
        const panel = document.getElementById(panelId)
        useUiContextFn.haptic && useUiContextFn.haptic()
        const next = !borderless
        setBorderless(next)
        setPanelLayout(panelId, { b: next ? true : null })
        if (panel && panel.classList)
            panel.classList.toggle("panel-borderless", next)
    }

    const startMove = (e) => {
        const panel = document.getElementById(panelId)
        if (!panel) return
        const gridItem =
            panel.closest(".panel-drag-wrapper, .panel-layout-wrapper") ||
            panel
        const startX = e.clientX
        const startY = e.clientY
        const startLeft = parseInt(gridItem.style.left, 10) || 0
        const startTop = parseInt(gridItem.style.top, 10) || 0
        let x = startLeft
        let y = startTop
        let z = null
        //the drag starts only after a small threshold, so a simple click
        //on the panel keeps its normal behavior
        let started = false
        const onMove = (ev) => {
            if (!started) {
                if (
                    Math.abs(ev.clientX - startX) < 4 &&
                    Math.abs(ev.clientY - startY) < 4
                )
                    return
                started = true
                useUiContextFn.haptic && useUiContextFn.haptic()
                suspendWrapperDrag(panel, true)
                document.body.classList.add("panel-canvas-moving")
                //raise the panel above the others so it stays visible
                //while dragging (and keeps this stacking order after the
                //drop, where the user placed it)
                const container = gridItem.parentElement
                if (container) {
                    z = (parseInt(container.dataset.ztop, 10) || 30) + 1
                    container.dataset.ztop = z
                    gridItem.style.zIndex = z
                }
            }
            //snap to the magnetic grid while moving
            x = Math.max(0, snap(startLeft + (ev.clientX - startX)))
            y = Math.max(0, snap(startTop + (ev.clientY - startY)))
            gridItem.style.left = x + "px"
            gridItem.style.top = y + "px"
            //let the cached extra contents (iframes) track the panel live
            eventBus.emit("panelsLayoutChanged", { id: panelId, moving: true })
        }
        const onUp = () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
            document.body.classList.remove("panel-canvas-moving")
            if (started) {
                setPanelLayout(panelId, { x, y, z })
                reflowCanvas(gridItem.parentElement)
                suspendWrapperDrag(panel, false)
            }
        }
        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)
    }

    //In canvas edition the whole panel is the move handle: a drag
    //started anywhere on the panel (except on interactive elements)
    //moves it
    useEffect(() => {
        if (mode !== "canvas") return
        const panel = document.getElementById(panelId)
        if (!panel) return
        const onPointerDown = (e) => {
            if (
                e.target.closest(
                    "button, a, input, select, textarea, label, canvas, .btn, .dropdown, .menu, .panel-canvas-resize, .panel-canvas-borderless"
                )
            )
                return
            startMove(e)
        }
        panel.addEventListener("pointerdown", onPointerDown)
        return () => panel.removeEventListener("pointerdown", onPointerDown)
    }, [mode])

    const startResize = (e) => {
        const panel = document.getElementById(panelId)
        if (!panel) return
        const gridItem =
            panel.closest(".panel-drag-wrapper, .panel-layout-wrapper") ||
            panel
        e.preventDefault()
        e.stopPropagation()
        useUiContextFn.haptic && useUiContextFn.haptic()
        suspendWrapperDrag(panel, true)
        const startX = e.clientX
        const startY = e.clientY
        const startWidth = gridItem.offsetWidth
        const startHeight = gridItem.offsetHeight
        let cw = startWidth
        let ch = startHeight
        const onMove = (ev) => {
            //snap to the magnetic grid while resizing
            cw = Math.max(
                CANVAS_MIN_W,
                snap(startWidth + (ev.clientX - startX))
            )
            ch = Math.max(
                CANVAS_MIN_H,
                snap(startHeight + (ev.clientY - startY))
            )
            gridItem.style.width = cw + "px"
            gridItem.style.height = ch + "px"
            //let the cached extra contents (iframes) track the panel live
            eventBus.emit("panelsLayoutChanged", { id: panelId, moving: true })
        }
        const onUp = () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
            setPanelLayout(panelId, { cw, ch })
            reflowCanvas(gridItem.parentElement)
            suspendWrapperDrag(panel, false)
        }
        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)
    }

    /* --------------------------- render --------------------------- */

    if (mode === "canvas") {
        return (
            <span class="panel-layout-controls panel-canvas-controls">
                {/*per-panel borderless is pointless when the global
                   borderless mode already hides every panel chrome*/}
                {!getPanelsBorderless() && (
                    <button
                        type="button"
                        class="btn btn-xs panel-canvas-borderless tooltip tooltip-left"
                        data-tooltip={T("S267")}
                        aria-label={T("S267")}
                        onclick={toggleBorderless}
                    >
                        {borderless ? (
                            <EyeOff size="0.7rem" />
                        ) : (
                            <Square size="0.7rem" />
                        )}
                    </button>
                )}
                <span
                    class="panel-canvas-resize"
                    onPointerDown={startResize}
                    onDragStart={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                />
            </span>
        )
    }

    return (
        <span class="panel-layout-controls">
            <span class="panel-layout-group">
                <span
                    class="panel-layout-group-label tooltip"
                    data-tooltip={T("S265")}
                >
                    W
                </span>
                <button
                    type="button"
                    class="btn btn-xs"
                    disabled={widthSpan <= SPAN_MIN}
                    onclick={() => changeWidthSpan(-1)}
                    aria-label="-"
                >
                    <Minus size="0.7rem" />
                </button>
                <span class="panel-layout-group-value">{widthSpan}</span>
                <button
                    type="button"
                    class="btn btn-xs"
                    disabled={widthSpan >= SPAN_MAX}
                    onclick={() => changeWidthSpan(1)}
                    aria-label="+"
                >
                    <Plus size="0.7rem" />
                </button>
            </span>
        </span>
    )
}

export default PanelLayoutControls
export { PanelLayoutControls }
