/*
 layoutHelper.js - ESP3D WebUI per-panel layout support

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

/**
 * Per-panel layout support (desktop), two modes:
 *
 * - "grid" (ardoise, default): the dashboard is a responsive wrapping
 *   grid. Widths are expressed in column units (grid-column span) and
 *   heights in row units (grid-row span over --panel-row-unit), so a
 *   panel can be 1x1, 2x2, 1x3... The grid reflows on window resize.
 *
 * - "canvas" (fixe): the dashboard is a fixed full-screen overlay whose
 *   usable area is the visible zone - the page does not scroll. Each
 *   panel has an absolute position (x, y) and size (cw, ch) in pixels.
 *   Panels cannot overlap: a resize stops at the neighbors' borders,
 *   and a moved panel flies freely while the hovered panels take the
 *   vacated slot live (position + size swap); on release it settles
 *   in the last vacated slot, or swaps with the panel it is dropped
 *   onto. If the panels cannot all fit (many panels on a small
 *   screen), heights are reduced down to CANVAS_MIN_H and the page
 *   scrolls only as a last resort.
 *
 * - Both modes support per-panel borderless display (class
 *   panel-borderless) on top of the global borderless mode
 *   (class panels-borderless on #app).
 *
 * Everything is persisted locally (localStorage): positions and sizes
 * are a property of the device/display, not of the ESP firmware.
 * A MutationObserver re-applies persisted layouts to panels as they
 * are (re)rendered, and a resize listener re-clamps panels when the
 * window size changes.
 */
import { eventBus } from "../../hooks/eventBus"
import { useUiContextFn } from "../../contexts"

const STORAGE_KEY = "esp3d-ui-panel-layout-v2"
const LEGACY_STORAGE_KEY = "esp3d-ui-panel-layout"
const BORDERLESS_KEY = "esp3d-ui-panels-borderless"
const MODE_KEY = "esp3d-ui-layout-mode"
const CHANGE_EVENT = "panelsLayoutChanged"

const SPAN_MIN = 1
const SPAN_MAX = 8
const CANVAS_MARGIN = 10
const CANVAS_SNAP = 10
const DEFAULT_CANVAS_W = 380
const DEFAULT_CANVAS_H = 550
const CANVAS_MIN_W = 240
const CANVAS_MIN_H = 150

//Snap a position or size to the magnetic grid - the step is the
//canvassnap preference (fixed UI), clamped to a sane range
const getSnap = () => {
    const raw =
        useUiContextFn.getValue && useUiContextFn.getValue("canvassnap")
    const num = parseInt(String(raw), 10)
    if (Number.isNaN(num)) return CANVAS_SNAP
    return Math.min(50, Math.max(1, num))
}
const snap = (value) => Math.round(value / getSnap()) * getSnap()

//Usable canvas zone: the fixed dashboard viewport minus everything
//above / beside the container (buttons bar, margins). The container
//height collapses (its children are absolutely positioned) so its
//clientHeight cannot be used - the offsets against the fixed dashboard
//give the real visible zone
const getCanvasBounds = (container) => {
    if (!container) return { w: 1200, h: 600 }
    const host = container.closest("#dashboard")
    if (!host)
        return {
            w: (typeof window !== "undefined" && window.innerWidth) || 1200,
            h: (typeof window !== "undefined" && window.innerHeight) || 600,
        }
    return {
        w: Math.max(CANVAS_MIN_W, host.clientWidth - container.offsetLeft),
        h: Math.max(CANVAS_MIN_H, host.clientHeight - container.offsetTop),
    }
}

//Layout modes and per-panel sizing are desktop-only features
const isDesktopLayout = () => {
    if (typeof document === "undefined") return true
    const app = document.getElementById("app")
    if (app && app.classList.contains("mobile-view")) return false
    return !(
        window.matchMedia && window.matchMedia("(max-width: 768px)").matches
    )
}

/* ------------------------------------------------------------------ */
/* storage                                                             */
/* ------------------------------------------------------------------ */

const getLayouts = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const layouts = raw ? JSON.parse(raw) : {}
        return layouts && typeof layouts === "object" ? layouts : {}
    } catch (e) {
        return {}
    }
}

const saveLayouts = (layouts) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts))
    } catch (e) {
        //storage may be unavailable - layout still works for the session
    }
}

const getPanelLayout = (id) => {
    const layout = getLayouts()[id]
    return layout && typeof layout === "object" ? layout : {}
}

//Update part of a panel layout ({w, h, b} for grid, {x, y, cw, ch} for
//canvas) and persist it
const setPanelLayout = (id, patch) => {
    const layouts = getLayouts()
    const current =
        layouts[id] && typeof layouts[id] === "object" ? layouts[id] : {}
    const next = { ...current, ...patch }
    //remove empty entries to keep storage clean
    Object.keys(next).forEach((key) => {
        if (next[key] == null) delete next[key]
    })
    if (Object.keys(next).length == 0) delete layouts[id]
    else layouts[id] = next
    saveLayouts(layouts)
    eventBus.emit(CHANGE_EVENT, { id })
}

/* ------------------------------------------------------------------ */
/* layout mode (grid / canvas)                                         */
/* ------------------------------------------------------------------ */

const getLayoutMode = () => {
    try {
        return localStorage.getItem(MODE_KEY) === "canvas"
            ? "canvas"
            : "grid"
    } catch (e) {
        return "grid"
    }
}

const setLayoutMode = (mode) => {
    try {
        localStorage.setItem(MODE_KEY, mode === "canvas" ? "canvas" : "grid")
    } catch (e) {
        //storage may be unavailable
    }
    eventBus.emit(CHANGE_EVENT, {})
}

/* ------------------------------------------------------------------ */
/* global borderless mode                                              */
/* ------------------------------------------------------------------ */

const getPanelsBorderless = () => {
    try {
        return localStorage.getItem(BORDERLESS_KEY) === "1"
    } catch (e) {
        return false
    }
}

const applyPanelsBorderless = () => {
    const app = document.getElementById("app")
    if (app && app.classList)
        app.classList.toggle("panels-borderless", getPanelsBorderless())
}

const setPanelsBorderless = (enabled) => {
    try {
        localStorage.setItem(BORDERLESS_KEY, enabled ? "1" : "0")
    } catch (e) {
        //storage may be unavailable
    }
    applyPanelsBorderless()
    eventBus.emit(CHANGE_EVENT, {})
}

/* ------------------------------------------------------------------ */
/* collision helpers (canvas: blocking borders, visible zone)          */
/* ------------------------------------------------------------------ */

//Two rectangles overlap - touching edges is not overlapping
const overlaps = (a, b) =>
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y

//Absolute rects of the visible canvas panels, excluding one - these
//are the obstacles for move / resize
const getCanvasPeers = (container, excludePanelId) => {
    const rects = []
    if (!container) return rects
    container
        .querySelectorAll(".panel-drag-wrapper, .panel-layout-wrapper")
        .forEach((wrapper) => {
            const panel = wrapper.querySelector(".panel[id]")
            if (!panel || panel.id === excludePanelId) return
            if (wrapper.style.position !== "absolute") return
            rects.push({
                id: panel.id,
                x: parseInt(wrapper.style.left, 10) || 0,
                y: parseInt(wrapper.style.top, 10) || 0,
                w: wrapper.offsetWidth,
                h: wrapper.offsetHeight,
            })
        })
    return rects
}

//Clamp a resize: the growing right / bottom edges stop at the visible
//zone and at the first obstacle they would cover
const clampCanvasResize = (x, y, w, h, bounds, obstacles) => {
    let maxW = Math.max(CANVAS_MIN_W, bounds.w - x)
    let maxH = Math.max(CANVAS_MIN_H, bounds.h - y)
    obstacles.forEach((o) => {
        //obstacle on the right, overlapping vertically
        if (o.x >= x && y + h > o.y && y < o.y + o.h)
            maxW = Math.min(maxW, Math.max(CANVAS_MIN_W, o.x - x))
        //obstacle below, overlapping horizontally
        if (o.y >= y && x + w > o.x && x < o.x + o.w)
            maxH = Math.min(maxH, Math.max(CANVAS_MIN_H, o.y - y))
    })
    return {
        w: Math.max(CANVAS_MIN_W, Math.min(w, maxW)),
        h: Math.max(CANVAS_MIN_H, Math.min(h, maxH)),
    }
}

//First free slot for a rectangle inside the zone: scan the candidate
//positions derived from the occupied rects, top-left first
const findFreeSlot = (rects, w, h, bounds) => {
    const xs = [CANVAS_MARGIN]
    const ys = [CANVAS_MARGIN]
    rects.forEach((r) => {
        xs.push(r.x + r.w + CANVAS_MARGIN)
        ys.push(r.y + r.h + CANVAS_MARGIN)
    })
    xs.sort((a, b) => a - b)
    ys.sort((a, b) => a - b)
    for (const y of ys) {
        for (const x of xs) {
            if (x + w > bounds.w || y + h > bounds.h) continue
            const candidate = { x, y, w, h }
            if (!rects.some((r) => overlaps(candidate, r))) return { x, y }
        }
    }
    return null
}

/* ------------------------------------------------------------------ */
/* application to the DOM                                              */
/* ------------------------------------------------------------------ */

//The grid item of a panel is its drag/layout wrapper when present,
//otherwise the panel element itself
const getGridItem = (panel) =>
    panel.closest(".panel-drag-wrapper, .panel-layout-wrapper") || panel

//Count the current number of columns of the grid containing the panel
const getColumnCount = (panel) => {
    const container = panel.closest(".panels-container")
    if (!container) return 1
    const template = getComputedStyle(container).gridTemplateColumns
    if (!template || template === "none") return 1
    return template.split(" ").filter((part) => part.length > 0).length
}

const isDashboardPanel = (panel) => !!panel.closest("#dashboard")

//Assign a position to a panel that has none yet in canvas mode: the
//first free slot inside the visible zone, or below the content when
//the zone is full (the constrain pass then shrinks / scrolls)
const ensureCanvasPosition = (id) => {
    const layout = getPanelLayout(id)
    if (layout.x != null && layout.y != null) return
    const rects = []
    Object.entries(getLayouts()).forEach(([otherId, entry]) => {
        if (otherId !== id && entry && entry.x != null && entry.y != null)
            rects.push({
                x: entry.x,
                y: entry.y,
                w: entry.cw || DEFAULT_CANVAS_W,
                h: entry.ch || DEFAULT_CANVAS_H,
            })
    })
    const container = document.querySelector("#dashboard .panels-container")
    const bounds = getCanvasBounds(container)
    const w = Math.min(
        DEFAULT_CANVAS_W,
        Math.max(CANVAS_MIN_W, bounds.w - 2 * CANVAS_MARGIN)
    )
    const h = Math.min(
        DEFAULT_CANVAS_H,
        Math.max(CANVAS_MIN_H, bounds.h - 2 * CANVAS_MARGIN)
    )
    const slot = findFreeSlot(rects, w, h, bounds)
    if (slot) {
        setPanelLayout(id, { x: slot.x, y: slot.y, cw: w, ch: h })
        return
    }
    //no free slot: below the current content (fallback)
    let maxBottom = 0
    rects.forEach((entry) => {
        maxBottom = Math.max(maxBottom, entry.y + entry.h)
    })
    setPanelLayout(id, {
        x: CANVAS_MARGIN,
        y: maxBottom > 0 ? maxBottom + CANVAS_MARGIN : CANVAS_MARGIN,
        cw: w,
        ch: h,
    })
}

//Tile panels side by side on the canvas, with no overlap - used as the
//default / reset canvas layout. The tile height is reduced so all rows
//stay inside the visible zone when possible.
//panelIds: every panel that must get a slot, including the ones
//currently hidden (so they fall in place when shown again); when
//omitted, the panels present in the DOM are used
const tileCanvasLayout = (container, panelIds) => {
    if (!container) return
    //the canvas container may carry a stale min size from the previous
    //layout: clear it before measuring the available width
    container.style.minWidth = ""
    container.style.minHeight = ""
    let ids = panelIds
    if (!ids) {
        ids = []
        container
            .querySelectorAll(".panel[id]")
            .forEach((panel) => ids.push(panel.id))
    }
    if (ids.length == 0) return
    const { w: width, h: height } = getCanvasBounds(container)
    //column count from the default tile width, then the tiles stretch
    //to fill the whole usable zone (no wasted surface); the min sizes
    //are the limit, then scroll is the escape
    const columns = Math.min(
        ids.length,
        Math.max(
            1,
            Math.floor((width - CANVAS_MARGIN) / (DEFAULT_CANVAS_W + CANVAS_MARGIN))
        )
    )
    const rows = Math.ceil(ids.length / columns)
    const tileW = snap(
        Math.max(
            CANVAS_MIN_W,
            Math.floor((width - (columns + 1) * CANVAS_MARGIN) / columns)
        )
    )
    const tileH = snap(
        Math.max(
            CANVAS_MIN_H,
            Math.floor((height - (rows + 1) * CANVAS_MARGIN) / rows)
        )
    )
    ids.forEach((id, index) => {
        const row = Math.floor(index / columns)
        const column = index % columns
        setPanelLayout(id, {
            x: CANVAS_MARGIN + column * (tileW + CANVAS_MARGIN),
            y: CANVAS_MARGIN + row * (tileH + CANVAS_MARGIN),
            cw: tileW,
            ch: tileH,
        })
    })
    container.querySelectorAll(".panel[id]").forEach(applyLayout)
}

//Let the page scroll only when the content really exceeds the visible
//zone (last resort: more panels than the screen can hold even at min
//height); otherwise the canvas area is exactly the viewport
const updateCanvasOverflow = (container) => {
    if (!container) return
    const bounds = getCanvasBounds(container)
    let maxX = 0
    let maxY = 0
    container
        .querySelectorAll(".panel-drag-wrapper, .panel-layout-wrapper")
        .forEach((wrapper) => {
            if (wrapper.style && wrapper.style.position === "absolute") {
                maxX = Math.max(
                    maxX,
                    (parseInt(wrapper.style.left, 10) || 0) +
                        wrapper.offsetWidth
                )
                maxY = Math.max(
                    maxY,
                    (parseInt(wrapper.style.top, 10) || 0) +
                        wrapper.offsetHeight
                )
            }
        })
    container.style.minWidth =
        maxX > bounds.w ? maxX + CANVAS_MARGIN + "px" : ""
    container.style.minHeight =
        maxY > bounds.h ? maxY + CANVAS_MARGIN + "px" : ""
}

//Constrain every visible canvas panel inside the visible zone:
//shrink oversized panels, clamp positions, resolve the overlaps of
//legacy layouts (push below / to the right), shrink heights if the
//packing overflows. Used when entering the canvas, on window resize,
//when panels (re)appear and after a drop to apply the styles
const constrainCanvas = (container) => {
    if (!container || getLayoutMode() !== "canvas") return
    const wrappers = []
    container
        .querySelectorAll(".panel-drag-wrapper, .panel-layout-wrapper")
        .forEach((wrapper) => {
            const panel = wrapper.querySelector(".panel[id]")
            if (panel && wrapper.style.position === "absolute")
                wrappers.push({ wrapper, id: panel.id })
        })
    if (wrappers.length == 0) {
        updateCanvasOverflow(container)
        return
    }
    const bounds = getCanvasBounds(container)
    //shrink panels larger than the zone and clamp positions inside
    const rects = wrappers.map(({ id }) => {
        const layout = getPanelLayout(id)
        const r = {
            id,
            x: snap(layout.x || 0),
            y: snap(layout.y || 0),
            w: Math.min(
                snap(layout.cw || DEFAULT_CANVAS_W),
                Math.max(CANVAS_MIN_W, snap(bounds.w))
            ),
            h: Math.min(
                snap(layout.ch || DEFAULT_CANVAS_H),
                Math.max(CANVAS_MIN_H, snap(bounds.h))
            ),
        }
        r.x = Math.max(0, Math.min(r.x, Math.max(0, bounds.w - r.w)))
        r.y = Math.max(0, Math.min(r.y, Math.max(0, bounds.h - r.h)))
        return r
    })
    //resolve remaining overlaps in reading order
    rects.sort((a, b) => a.y - b.y || a.x - b.x)
    const placed = []
    rects.forEach((r) => {
        let guard = 0
        let hit = true
        while (hit && guard++ < 100) {
            hit = false
            for (const p of placed) {
                if (overlaps(r, p)) {
                    hit = true
                    const down = p.y + p.h
                    const right = p.x + p.w
                    if (
                        down + r.h <= bounds.h &&
                        !placed.some((q) =>
                            overlaps({ x: r.x, y: down, w: r.w, h: r.h }, q)
                        )
                    ) {
                        r.y = down
                    } else if (right + r.w <= bounds.w) {
                        r.x = right
                    } else {
                        //nowhere to go inside the zone: push below, the
                        //shrink pass / scroll escape takes over
                        r.y = down
                    }
                    break
                }
            }
        }
        placed.push(r)
    })
    //shrink heights (bottom-most first) when the packing overflows the
    //zone - min height is the limit, then updateCanvasOverflow scrolls
    let maxBottom = Math.max.apply(
        null,
        placed.map((r) => r.y + r.h)
    )
    if (maxBottom > bounds.h) {
        const byBottom = placed
            .slice()
            .sort((a, b) => b.y + b.h - (a.y + a.h))
        for (const r of byBottom) {
            if (maxBottom <= bounds.h || r.h <= CANVAS_MIN_H) continue
            const newH = snap(
                Math.max(CANVAS_MIN_H, r.h - (maxBottom - bounds.h))
            )
            maxBottom -= r.h - newH
            r.h = newH
        }
    }
    //persist (only when changed) and apply
    placed.forEach((r) => {
        const layout = getPanelLayout(r.id)
        if (
            layout.x !== r.x ||
            layout.y !== r.y ||
            layout.cw !== r.w ||
            layout.ch !== r.h
        )
            setPanelLayout(r.id, { x: r.x, y: r.y, cw: r.w, ch: r.h })
    })
    wrappers.forEach(({ wrapper, id }) => {
        const r = placed.find((p) => p.id === id)
        if (!r) return
        wrapper.style.left = r.x + "px"
        wrapper.style.top = r.y + "px"
        wrapper.style.width = r.w + "px"
        wrapper.style.height = r.h + "px"
    })
    updateCanvasOverflow(container)
}

//Resolve a panel drop on the canvas: when the panel center is over
//another panel, the two swap their position and size; otherwise the
//dropped panel is nudged out of any grazing overlap along the
//shortest axis - nothing ever flies to the bottom of the canvas
const resolveCanvasDrop = (container, panelId, drop, origin) => {
    if (!container) return
    const bounds = getCanvasBounds(container)
    const peers = getCanvasPeers(container, panelId)
    const cx = drop.x + drop.w / 2
    const cy = drop.y + drop.h / 2
    const target = peers.find(
        (p) => cx >= p.x && cx < p.x + p.w && cy >= p.y && cy < p.y + p.h
    )
    if (target) {
        //dropped onto another panel: swap position and size
        setPanelLayout(panelId, {
            x: target.x,
            y: target.y,
            cw: target.w,
            ch: target.h,
        })
        setPanelLayout(target.id, {
            x: origin.x,
            y: origin.y,
            cw: origin.w,
            ch: origin.h,
        })
    } else {
        //dropped on empty space: nudge out of any grazing overlap
        //along the shortest axis, then clamp inside the zone
        const a = { ...drop }
        let guard = 0
        let hit = true
        while (hit && guard++ < 20) {
            hit = false
            for (const p of peers) {
                if (!overlaps(a, p)) continue
                hit = true
                const moves = [
                    { d: p.x - (a.x + a.w), axis: "x" },
                    { d: p.x + p.w - a.x, axis: "x" },
                    { d: p.y - (a.y + a.h), axis: "y" },
                    { d: p.y + p.h - a.y, axis: "y" },
                ].sort((m, n) => Math.abs(m.d) - Math.abs(n.d))
                if (moves[0].axis === "x") a.x += moves[0].d
                else a.y += moves[0].d
            }
        }
        a.x = snap(Math.max(0, Math.min(a.x, Math.max(0, bounds.w - a.w))))
        a.y = snap(Math.max(0, Math.min(a.y, Math.max(0, bounds.h - a.h))))
        setPanelLayout(panelId, { x: a.x, y: a.y, cw: a.w, ch: a.h })
    }
    constrainCanvas(container)
}

const applyLayout = (panel) => {
    if (!panel || !panel.id || !panel.style) return
    const layout = getPanelLayout(panel.id)
    //borderless: per-panel class (on top of the optional global mode),
    //only meaningful on the canvas (see _panel.scss)
    panel.classList.toggle("panel-borderless", !!layout.b)
    //layout modes only apply to the dashboard
    if (!isDashboardPanel(panel)) return
    const gridItem = getGridItem(panel)
    if (getLayoutMode() === "canvas" && isDesktopLayout()) {
        ensureCanvasPosition(panel.id)
        const container = panel.closest(".panels-container")
        const bounds = getCanvasBounds(container)
        const current = getPanelLayout(panel.id)
        //clamp inside the visible zone (a stored layout may come from a
        //larger window)
        const w = Math.min(
            snap(current.cw || DEFAULT_CANVAS_W),
            Math.max(CANVAS_MIN_W, snap(bounds.w))
        )
        const h = Math.min(
            snap(current.ch || DEFAULT_CANVAS_H),
            Math.max(CANVAS_MIN_H, snap(bounds.h))
        )
        const x = Math.max(0, Math.min(snap(current.x || 0), Math.max(0, bounds.w - w)))
        const y = Math.max(0, Math.min(snap(current.y || 0), Math.max(0, bounds.h - h)))
        gridItem.style.position = "absolute"
        gridItem.style.left = x + "px"
        gridItem.style.top = y + "px"
        gridItem.style.width = w + "px"
        gridItem.style.height = h + "px"
        gridItem.style.gridColumn = ""
        panel.style.removeProperty("--panel-height")
        updateCanvasOverflow(container)
    } else {
        //grid (ardoise) mode: free width (column span), the height is
        //global (panelheight preference) and the grid wraps
        gridItem.style.position = ""
        gridItem.style.left = ""
        gridItem.style.top = ""
        gridItem.style.width = ""
        gridItem.style.height = ""
        gridItem.style.zIndex = ""
        gridItem.style.gridRow = ""
        panel.style.removeProperty("--panel-height")
        const columns = getColumnCount(panel)
        const width = parseInt(layout.w, 10)
        gridItem.style.gridColumn =
            width > 1 ? (width >= columns ? "1 / -1" : "span " + width) : ""
        const container = panel.closest(".panels-container")
        if (container && container.style) {
            container.style.minWidth = ""
            container.style.minHeight = ""
        }
    }
}

const clearLayouts = () => {
    saveLayouts({})
    document
        .querySelectorAll(".panels-container .panel[id]")
        .forEach((panel) => {
            panel.style.removeProperty("--panel-height")
            panel.classList.remove("panel-borderless")
            const gridItem = getGridItem(panel)
            if (gridItem && gridItem.style) {
                gridItem.style.gridColumn = ""
                gridItem.style.gridRow = ""
                gridItem.style.position = ""
                gridItem.style.left = ""
                gridItem.style.top = ""
                gridItem.style.width = ""
                gridItem.style.height = ""
                gridItem.style.zIndex = ""
            }
            const container = panel.closest(".panels-container")
            if (container && container.style) {
                container.style.minWidth = ""
                container.style.minHeight = ""
            }
        })
    eventBus.emit(CHANGE_EVENT, {})
}

/* ------------------------------------------------------------------ */
/* observers                                                           */
/* ------------------------------------------------------------------ */

//Re-apply persisted layouts to panels as they appear in the DOM
const startObserver = () => {
    const app = document.getElementById("app")
    if (!app) return
    const apply = (node) => {
        if (node.nodeType !== 1) return
        if (node.matches && node.matches(".panel[id]")) {
            applyLayout(node)
        } else if (node.querySelectorAll) {
            node.querySelectorAll(".panel[id]").forEach(applyLayout)
        }
    }
    const observer = new MutationObserver((mutations) => {
        for (let i = 0; i < mutations.length; i++) {
            const added = mutations[i].addedNodes
            for (let j = 0; j < added.length; j++) apply(added[j])
        }
    })
    observer.observe(app, { childList: true, subtree: true })
}

//Re-clamp panels when the window size changes: column spans in grid
//mode, the whole canvas in canvas mode (shrink / clamp / unpack)
const startResizeListener = () => {
    let timer = null
    window.addEventListener("resize", () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            if (getLayoutMode() === "canvas") {
                constrainCanvas(
                    document.querySelector("#dashboard .panels-container")
                )
                return
            }
            document
                .querySelectorAll("#dashboard .panels-container .panel[id]")
                .forEach(applyLayout)
        }, 200)
    })
}

let initialized = false

const initLayoutSupport = () => {
    if (initialized || typeof document === "undefined") return
    initialized = true
    try {
        localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch (e) {
        //storage may be unavailable
    }
    applyPanelsBorderless()
    startObserver()
    startResizeListener()
}

/* ------------------------------------------------------------------ */
/* panel visibility (shown / hidden), per device                       */
/* ------------------------------------------------------------------ */

const VISIBILITY_KEY = "esp3d-ui-visible-panels"

const getSavedVisibility = () => {
    try {
        const raw = localStorage.getItem(VISIBILITY_KEY)
        const data = raw ? JSON.parse(raw) : {}
        return data && typeof data === "object" ? data : {}
    } catch (e) {
        return {}
    }
}

//Persist which dashboard panels are shown / hidden on this device - the
//global default stays in the ESP settings (show / onstart preferences)
const saveVisibility = (panelsList, visiblesList) => {
    try {
        const data = {}
        const visibleIds = new Set(visiblesList.map((p) => p.id))
        panelsList.forEach((p) => {
            data[p.id] = visibleIds.has(p.id)
        })
        localStorage.setItem(VISIBILITY_KEY, JSON.stringify(data))
    } catch (e) {
        //storage may be unavailable
    }
}

//Apply the device visibility overrides on top of the settings defaults:
//a panel listed in the saved map follows it, an unknown panel (added
//since the save) keeps its settings default
const applyVisibilityOverrides = (panelsList) => {
    const saved = getSavedVisibility()
    return panelsList.filter((p) =>
        saved[p.id] !== undefined ? saved[p.id] : true
    )
}

export {
    initLayoutSupport,
    getPanelLayout,
    setPanelLayout,
    clearLayouts,
    applyLayout,
    getColumnCount,
    getLayoutMode,
    setLayoutMode,
    isDesktopLayout,
    getPanelsBorderless,
    setPanelsBorderless,
    constrainCanvas,
    resolveCanvasDrop,
    tileCanvasLayout,
    saveVisibility,
    applyVisibilityOverrides,
    overlaps,
    getCanvasPeers,
    getCanvasBounds,
    clampCanvasResize,
    snap,
    CHANGE_EVENT,
    SPAN_MIN,
    SPAN_MAX,
    CANVAS_MIN_W,
    CANVAS_MIN_H,
    CANVAS_MARGIN,
    CANVAS_SNAP,
}
