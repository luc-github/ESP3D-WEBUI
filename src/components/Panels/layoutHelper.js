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
 * - "canvas" (fixe): the dashboard is a fixed full-screen-like canvas.
 *   Each panel has an absolute position (x, y) and size (cw, ch) in
 *   pixels and keeps it whatever the window size is - the page scrolls
 *   instead of reflowing.
 *
 * - Both modes support per-panel borderless display (class
 *   panel-borderless) on top of the global borderless mode
 *   (class panels-borderless on #app).
 *
 * Everything is persisted locally (localStorage): positions and sizes
 * are a property of the device/display, not of the ESP firmware.
 * A MutationObserver re-applies persisted layouts to panels as they
 * are (re)rendered, and a resize listener re-clamps column spans in
 * grid mode.
 */
import { eventBus } from "../../hooks/eventBus"

const STORAGE_KEY = "esp3d-ui-panel-layout-v2"
const LEGACY_STORAGE_KEY = "esp3d-ui-panel-layout"
const BORDERLESS_KEY = "esp3d-ui-panels-borderless"
const MODE_KEY = "esp3d-ui-layout-mode"
const CHANGE_EVENT = "panelsLayoutChanged"

const SPAN_MIN = 1
const SPAN_MAX = 8
const CANVAS_MARGIN = 16
const CANVAS_SNAP = 10
const DEFAULT_CANVAS_W = 380
const DEFAULT_CANVAS_H = 550
const CANVAS_MIN_W = 240
const CANVAS_MIN_H = 150

//Snap a position or size to the magnetic grid
const snap = (value) => Math.round(value / CANVAS_SNAP) * CANVAS_SNAP

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

//Assign a position to a panel that has none yet in canvas mode:
//it goes on a new row below the current content, so panels never
//overlap
const ensureCanvasPosition = (id) => {
    const layout = getPanelLayout(id)
    if (layout.x != null && layout.y != null) return
    let maxBottom = 0
    Object.values(getLayouts()).forEach((entry) => {
        if (entry && entry.y != null) {
            maxBottom = Math.max(
                maxBottom,
                entry.y + (entry.ch || DEFAULT_CANVAS_H)
            )
        }
    })
    setPanelLayout(id, {
        x: CANVAS_MARGIN,
        y: maxBottom > 0 ? maxBottom + CANVAS_MARGIN : CANVAS_MARGIN,
        cw: DEFAULT_CANVAS_W,
        ch: DEFAULT_CANVAS_H,
    })
}

//Tile panels side by side on the canvas, at the default size, with no
//overlap - used as the default / reset canvas layout.
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
    const width = container.clientWidth || 1200
    //default tile size: capped so a tile fits the available width and at
    //least two rows fit the screen height (keeps the resize grip of the
    //first rows reachable without scrolling)
    const screenHeight =
        typeof window !== "undefined" ? window.innerHeight : 800
    const tileW = snap(
        Math.max(
            CANVAS_MIN_W,
            Math.min(DEFAULT_CANVAS_W, width - 2 * CANVAS_MARGIN)
        )
    )
    const tileH = snap(
        Math.max(
            CANVAS_MIN_H,
            Math.min(
                DEFAULT_CANVAS_H,
                Math.floor((screenHeight - 3 * CANVAS_MARGIN) / 2)
            )
        )
    )
    const columns = Math.max(
        1,
        Math.floor((width - CANVAS_MARGIN) / (tileW + CANVAS_MARGIN))
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

//Resize the canvas container so every panel stays reachable
//(fixed positions: the page scrolls instead of reflowing)
const reflowCanvas = (container) => {
    if (!container || getLayoutMode() !== "canvas") return
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
    container.style.minWidth = maxX > 0 ? maxX + CANVAS_MARGIN + "px" : ""
    container.style.minHeight = maxY > 0 ? maxY + CANVAS_MARGIN + "px" : ""
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
        const current = getPanelLayout(panel.id)
        gridItem.style.position = "absolute"
        gridItem.style.left = snap(current.x || 0) + "px"
        gridItem.style.top = snap(current.y || 0) + "px"
        gridItem.style.width = snap(current.cw || DEFAULT_CANVAS_W) + "px"
        gridItem.style.height = snap(current.ch || DEFAULT_CANVAS_H) + "px"
        //stacking order: a moved panel stays above the following ones
        gridItem.style.zIndex = current.z ? String(current.z) : ""
        gridItem.style.gridColumn = ""
        panel.style.removeProperty("--panel-height")
        reflowCanvas(panel.closest(".panels-container"))
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

//Re-clamp grid column spans when the column count changes (window resize)
//canvas mode keeps fixed positions by design
const startResizeListener = () => {
    let timer = null
    window.addEventListener("resize", () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            if (getLayoutMode() !== "grid") return
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
    reflowCanvas,
    tileCanvasLayout,
    saveVisibility,
    applyVisibilityOverrides,
    snap,
    CHANGE_EVENT,
    SPAN_MIN,
    SPAN_MAX,
    CANVAS_MIN_W,
    CANVAS_MIN_H,
    CANVAS_MARGIN,
    CANVAS_SNAP,
}
