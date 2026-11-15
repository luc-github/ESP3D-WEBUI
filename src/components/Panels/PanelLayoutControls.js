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
 * - mode "grid" (ardoise, responsive): the whole panel is a drag
 *   handle - the panel floats with the pointer and swaps its slot
 *   live with the panel it flies over. -/+ buttons change the panel
 *   width in column units; the height is global (panelheight
 *   preference) and cannot be changed.
 * - mode "canvas" (fixe): the whole panel is the move handle (free
 *   flight, live slot swap), a bottom-right grip resizes the panel and
 *   a button toggles the panel borderless display. Positions and sizes
 *   snap to a magnetic grid.
 *
 * Layout is persisted locally, see layoutHelper.js
 */
import { h } from "preact"
import { useState, useEffect, useRef } from "preact/hooks"
import { Minus, Plus, Square, EyeOff } from "preact-feather"
import { T } from "../Translations"
import { useUiContextFn } from "../../contexts"
import { eventBus } from "../../hooks/eventBus"
import {
    getPanelLayout,
    setPanelLayout,
    getColumnCount,
    getPanelsBorderless,
    getCanvasPeers,
    getCanvasBounds,
    clampCanvasResize,
    constrainCanvas,
    resolveCanvasDrop,
    isDesktopLayout,
    snap,
    CHANGE_EVENT,
    SPAN_MIN,
    SPAN_MAX,
    CANVAS_MIN_W,
    CANVAS_MIN_H,
} from "./layoutHelper"

const PanelLayoutControls = ({ panelId, mode, onReorder }) => {
    const readWidthSpan = () => {
        const layout = getPanelLayout(panelId)
        const span = parseInt(layout.w, 10)
        return span >= SPAN_MIN ? span : 1
    }
    const readBorderless = () => !!getPanelLayout(panelId).b
    const [widthSpan, setWidthSpan] = useState(readWidthSpan)
    const [borderless, setBorderless] = useState(readBorderless)
    //the reorder callback changes identity at each dashboard render -
    //keep it in a ref so the pointerdown binding (below) stays stable
    const onReorderRef = useRef(onReorder)
    onReorderRef.current = onReorder

    useEffect(() => {
        const handler = () => {
            setWidthSpan(readWidthSpan())
            setBorderless(readBorderless())
        }
        const listenerId = eventBus.on(CHANGE_EVENT, handler)
        return () => eventBus.off(CHANGE_EVENT, listenerId)
    }, [])

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

    //Free pointer drag to reorder the panels: the panel floats with
    //the pointer and, when its center passes over another panel, the
    //two exchange their slot live (like the canvas fixed mode)
    const startGridMove = (e) => {
        const panel = document.getElementById(panelId)
        if (!panel) return
        const gridItem = panel.closest(
            ".panel-drag-wrapper, .panel-layout-wrapper"
        )
        if (!gridItem) return
        const container = gridItem.parentElement
        if (!container || !onReorderRef.current) return
        const startX = e.clientX
        const startY = e.clientY
        //panel layout position at drag start, and the applied
        //transform - rebased on each move because a live swap reflows
        //the grid under the dragged panel
        let startLeft = 0
        let startTop = 0
        let tx = 0
        let ty = 0
        let lockedItem = null
        let rebaseScheduled = false
        let started = false
        //float the panel under the pointer: the transform is relative
        //to the current layout position, which changes on each swap
        const applyTransform = (ev) => {
            const rect = gridItem.getBoundingClientRect()
            tx = startLeft + (ev.clientX - startX) - (rect.left - tx)
            ty = startTop + (ev.clientY - startY) - (rect.top - ty)
            gridItem.style.transform =
                "translate(" + tx + "px, " + ty + "px)"
        }
        const onMove = (ev) => {
            if (!started) {
                if (
                    Math.abs(ev.clientX - startX) < 4 &&
                    Math.abs(ev.clientY - startY) < 4
                )
                    return
                started = true
                useUiContextFn.haptic && useUiContextFn.haptic()
                document.body.classList.add("panel-moving")
                //float above the others, following the pointer
                gridItem.classList.add("panel-lifted")
                const rect = gridItem.getBoundingClientRect()
                startLeft = rect.left
                startTop = rect.top
            }
            applyTransform(ev)
            //live swap with the panel under the pointer
            let found = null
            container
                .querySelectorAll(
                    ".panel-drag-wrapper, .panel-layout-wrapper"
                )
                .forEach((item) => {
                    if (found || item === gridItem) return
                    const r = item.getBoundingClientRect()
                    if (
                        ev.clientX >= r.left + 8 &&
                        ev.clientX < r.right - 8 &&
                        ev.clientY >= r.top + 8 &&
                        ev.clientY < r.bottom - 8
                    )
                        found = item
                })
            if (found && found !== lockedItem && onReorderRef.current) {
                lockedItem = found
                const items = Array.from(
                    container.querySelectorAll(
                        ".panel-drag-wrapper, .panel-layout-wrapper"
                    )
                )
                const from = items.indexOf(gridItem)
                const to = items.indexOf(found)
                if (from !== -1 && to !== -1 && from !== to) {
                    onReorderRef.current(from, to)
                    //the reflow lands after this frame: rebase the
                    //transform so the panel stays under the pointer
                    if (!rebaseScheduled) {
                        rebaseScheduled = true
                        requestAnimationFrame(() => {
                            rebaseScheduled = false
                            applyTransform(ev)
                        })
                    }
                }
            } else if (!found) {
                lockedItem = null
            }
        }
        const onUp = () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
            window.removeEventListener("pointercancel", onUp)
            document.body.classList.remove("panel-moving")
            gridItem.classList.remove("panel-lifted")
            gridItem.style.transform = ""
            //the order was applied live at each swap - nothing left
            //to do on release
        }
        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)
        window.addEventListener("pointercancel", onUp)
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
        const container = gridItem.parentElement
        if (!container) return
        const startX = e.clientX
        const startY = e.clientY
        const startLeft = parseInt(gridItem.style.left, 10) || 0
        const startTop = parseInt(gridItem.style.top, 10) || 0
        const w = gridItem.offsetWidth
        const h = gridItem.offsetHeight
        //the slot vacated by the dragged panel: a panel hovered by the
        //dragged panel center takes it live (position + size swap)
        let home = { x: startLeft, y: startTop, w, h }
        let lastSwapId = null
        let x = startLeft
        let y = startTop
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
                document.body.classList.add("panel-moving")
                //raise above the others while flying over them and
                //follow the pointer instantly (no transition) - the
                //stacking is dropped on release, the order is spatial
                gridItem.classList.add("panel-lifted")
            }
            //free move: the panel may fly over the others, the drop is
            //resolved on release (swap or nudge - see onUp)
            x = snap(startLeft + (ev.clientX - startX))
            y = snap(startTop + (ev.clientY - startY))
            gridItem.style.left = x + "px"
            gridItem.style.top = y + "px"
            //live swap: when the panel center passes over another panel,
            //that panel immediately takes the vacated slot
            const centerX = x + w / 2
            const centerY = y + h / 2
            const target = getCanvasPeers(container, panelId).find(
                (p) =>
                    centerX >= p.x + 8 &&
                    centerX < p.x + p.w - 8 &&
                    centerY >= p.y + 8 &&
                    centerY < p.y + p.h - 8
            )
            if (target && target.id !== lastSwapId) {
                lastSwapId = target.id
                setPanelLayout(target.id, {
                    x: home.x,
                    y: home.y,
                    cw: home.w,
                    ch: home.h,
                })
                const targetPanel = document.getElementById(target.id)
                const targetItem =
                    targetPanel &&
                    (targetPanel.closest(
                        ".panel-drag-wrapper, .panel-layout-wrapper"
                    ) ||
                        targetPanel)
                if (targetItem) {
                    targetItem.style.left = home.x + "px"
                    targetItem.style.top = home.y + "px"
                    targetItem.style.width = home.w + "px"
                    targetItem.style.height = home.h + "px"
                }
                home = { x: target.x, y: target.y, w: target.w, h: target.h }
            } else if (!target) {
                lastSwapId = null
            }
            //let the cached extra contents (iframes) track the panel live
            eventBus.emit("panelsLayoutChanged", { id: panelId, moving: true })
        }
        const onUp = () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
            window.removeEventListener("pointercancel", onUp)
            document.body.classList.remove("panel-moving")
            gridItem.classList.remove("panel-lifted")
            if (started) {
                const swapped =
                    home.x !== startLeft ||
                    home.y !== startTop ||
                    home.w !== w ||
                    home.h !== h
                if (swapped) {
                    //strict swap: settle exactly in the vacated slot
                    //(position + size) - nothing else moves
                    setPanelLayout(panelId, {
                        x: home.x,
                        y: home.y,
                        cw: home.w,
                        ch: home.h,
                    })
                    constrainCanvas(container)
                } else {
                    //no live swap: swap with the panel it is dropped
                    //onto (fast flick), or free drop - the nudge out of
                    //a grazing overlap is a separate adjustment step
                    const bounds = getCanvasBounds(container)
                    const drop = {
                        x: Math.max(
                            0,
                            Math.min(x, Math.max(0, bounds.w - w))
                        ),
                        y: Math.max(
                            0,
                            Math.min(y, Math.max(0, bounds.h - h))
                        ),
                        w,
                        h,
                    }
                    resolveCanvasDrop(container, panelId, drop, home)
                }
            }
        }
        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)
        window.addEventListener("pointercancel", onUp)
    }

    //In layout edition the whole panel is the drag handle: a drag
    //started anywhere on the panel (except on interactive elements)
    //moves it (canvas) or reorders it (grid). Desktop only, like the
    //rest of the layout edition
    useEffect(() => {
        if (mode !== "canvas" && !isDesktopLayout()) return
        const panel = document.getElementById(panelId)
        if (!panel) return
        const onPointerDown = (e) => {
            if (
                e.target.closest(
                    "button, a, input, select, textarea, label, canvas, .btn, .dropdown, .menu, .panel-canvas-resize, .panel-canvas-borderless"
                )
            )
                return
            if (mode === "canvas") startMove(e)
            else startGridMove(e)
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
        const container = gridItem.parentElement
        if (!container) return
        e.preventDefault()
        e.stopPropagation()
        useUiContextFn.haptic && useUiContextFn.haptic()
        //follow the pointer instantly (no transition)
        gridItem.classList.add("panel-lifted")
        const startX = e.clientX
        const startY = e.clientY
        const startWidth = gridItem.offsetWidth
        const startHeight = gridItem.offsetHeight
        const x = parseInt(gridItem.style.left, 10) || 0
        const y = parseInt(gridItem.style.top, 10) || 0
        const bounds = getCanvasBounds(container)
        //the other panels are blocking obstacles (no overlap allowed)
        const obstacles = getCanvasPeers(container, panelId)
        let cw = startWidth
        let ch = startHeight
        const onMove = (ev) => {
            //snap to the magnetic grid, then clamp to the visible zone
            //and to the first obstacle the growing edges would cover
            const desiredW = Math.max(
                CANVAS_MIN_W,
                snap(startWidth + (ev.clientX - startX))
            )
            const desiredH = Math.max(
                CANVAS_MIN_H,
                snap(startHeight + (ev.clientY - startY))
            )
            const clamped = clampCanvasResize(
                x,
                y,
                desiredW,
                desiredH,
                bounds,
                obstacles
            )
            cw = clamped.w
            ch = clamped.h
            gridItem.style.width = cw + "px"
            gridItem.style.height = ch + "px"
            //let the cached extra contents (iframes) track the panel live
            eventBus.emit("panelsLayoutChanged", { id: panelId, moving: true })
        }
        const onUp = () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
            window.removeEventListener("pointercancel", onUp)
            gridItem.classList.remove("panel-lifted")
            setPanelLayout(panelId, { cw, ch })
        }
        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)
        window.addEventListener("pointercancel", onUp)
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
