/*
 collapseHelper.js - ESP3D WebUI collapsible panels support

 Copyright (c) 2026 Luc Lebosse. All rights reserved.

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

/**
 * Collapsible panels support (mobile / single-column view)
 *
 * - Tap / click on a panel navbar toggles the `panel-collapsed` class on the
 *   panel root element. The CSS (see _panel.scss) only makes this effective
 *   when the UI is in mobile mode (`#app.mobile-view`) or on narrow screens.
 * - Collapsed state is persisted locally (localStorage), per panel id, so it
 *   is a property of the device/display, not of the ESP firmware settings.
 * - Works for dashboard panels, settings tabs panels and extra content panels
 *   without modifying each panel: a delegated click listener toggles the
 *   state, and a MutationObserver re-applies persisted states to panels as
 *   they are (re)rendered.
 */
import { useUiContextFn } from "../../contexts"
import { eventBus } from "../../hooks/eventBus"

const STORAGE_KEY = "esp3d-ui-collapsed-panels"
const CHANGE_EVENT = "panelsCollapseChanged"

const getCollapsedIds = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const ids = raw ? JSON.parse(raw) : []
        return Array.isArray(ids) ? ids : []
    } catch (e) {
        return []
    }
}

const saveCollapsedIds = (ids) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch (e) {
        //storage may be unavailable (private mode, quota) - collapse still
        //works for the session, it just won't persist
    }
}

//Collapse is only active when the UI is displayed as a single column:
//either the user enabled the mobile view preference, or the screen is narrow
const isCollapseModeActive = () => {
    if (typeof document === "undefined") return false
    const app = document.getElementById("app")
    if (app && app.classList.contains("mobile-view")) return true
    return !!(
        window.matchMedia && window.matchMedia("(max-width: 768px)").matches
    )
}

const applyCollapsedState = (panel) => {
    if (!panel || !panel.id || !panel.classList) return
    const collapsed = getCollapsedIds().indexOf(panel.id) !== -1
    panel.classList.toggle("panel-collapsed", collapsed)
}

const togglePanel = (panel) => {
    const collapsed = panel.classList.toggle("panel-collapsed")
    const ids = getCollapsedIds()
    const index = ids.indexOf(panel.id)
    if (collapsed && index === -1) ids.push(panel.id)
    if (!collapsed && index !== -1) ids.splice(index, 1)
    saveCollapsedIds(ids)
    eventBus.emit(CHANGE_EVENT, {})
    if (useUiContextFn.haptic) useUiContextFn.haptic()
}

//Collapse / expand a list of panels at once (collapse all / expand all)
const setPanelsCollapsed = (ids, collapsed) => {
    const current = getCollapsedIds()
    ids.forEach((id) => {
        const index = current.indexOf(id)
        if (collapsed && index === -1) current.push(id)
        if (!collapsed && index !== -1) current.splice(index, 1)
        const element = document.getElementById(id)
        if (element && element.classList)
            element.classList.toggle("panel-collapsed", collapsed)
    })
    saveCollapsedIds(current)
    eventBus.emit(CHANGE_EVENT, {})
    if (useUiContextFn.haptic) useUiContextFn.haptic()
}

//Elements inside the navbar that must keep their own behavior
//(buttons, dropdown menus, links, inputs)
const isInteractiveTarget = (target) =>
    !!target.closest(
        "button, a, input, select, textarea, label, .btn, .dropdown, .menu"
    )

const handleClick = (e) => {
    if (!isCollapseModeActive()) return
    //Do not interfere with fullscreen panels
    if (document.fullscreenElement) return
    const navbar = e.target.closest && e.target.closest(".navbar")
    if (!navbar) return
    const panel = navbar.parentElement
    if (!panel || !panel.classList || !panel.classList.contains("panel"))
        return
    if (!panel.id) return
    if (isInteractiveTarget(e.target)) return
    togglePanel(panel)
}

//Re-apply persisted collapsed state to panels as they appear in the DOM
//(dashboard panels shown/hidden, tab switches, extra content panels, ...)
//and notify listeners (e.g. CollapseAllToggle) when panels appear or
//disappear so global controls can refresh their state
const startObserver = () => {
    const app = document.getElementById("app")
    if (!app) return
    const containsPanel = (node) => {
        if (node.nodeType !== 1) return false
        return !!(
            (node.matches && node.matches(".panel[id]")) ||
            (node.querySelector && node.querySelector(".panel[id]"))
        )
    }
    const apply = (node) => {
        if (node.nodeType !== 1) return
        if (node.matches && node.matches(".panel[id]")) {
            applyCollapsedState(node)
        } else if (node.querySelectorAll) {
            node.querySelectorAll(".panel[id]").forEach(applyCollapsedState)
        }
    }
    const observer = new MutationObserver((mutations) => {
        let panelsChanged = false
        for (let i = 0; i < mutations.length; i++) {
            const added = mutations[i].addedNodes
            for (let j = 0; j < added.length; j++) {
                if (containsPanel(added[j])) panelsChanged = true
                apply(added[j])
            }
            if (!panelsChanged) {
                const removed = mutations[i].removedNodes
                for (let j = 0; j < removed.length; j++) {
                    if (containsPanel(removed[j])) panelsChanged = true
                }
            }
        }
        if (panelsChanged) eventBus.emit(CHANGE_EVENT, {})
    })
    observer.observe(app, { childList: true, subtree: true })
}

let initialized = false

const initCollapseSupport = () => {
    if (initialized || typeof document === "undefined") return
    initialized = true
    document.addEventListener("click", handleClick, false)
    startObserver()
}

export { initCollapseSupport, setPanelsCollapsed, getCollapsedIds, CHANGE_EVENT }
