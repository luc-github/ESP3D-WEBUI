/*
 dashboard.js - ESP3D WebUI navigation page file

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
import { h } from "preact"
import { useEffect, useState } from "preact/hooks"
import {
    useUiContext,
    useUiContextFn,
    useSettingsContext,
} from "../../contexts"
import { T } from "../../components/Translations"
import { RotateCcw, Maximize, Minimize } from "preact-feather"
import { iconsFeather } from "../../components/Images"
import { defaultPanelsList, iconsTarget, QuickButtonsBar } from "../../targets"
import { showModal } from "../../components/Modal"
import { eventBus } from "../../hooks/eventBus"
import { CollapseAllToggle } from "../../components/Panels/CollapseAllToggle"
import {
    clearLayouts,
    getPanelLayout,
    getPanelsBorderless,
    setPanelsBorderless,
    applyLayout,
    tileCanvasLayout,
    constrainCanvas,
    saveVisibility,
} from "../../components/Panels/layoutHelper"
import {
    addKeyboardListener,
    removeKeyboardListener,
    showKeyboardHelp,
} from "./shortcuts"
import { useCanvasMode } from "./useCanvasMode"
import { initDashboardPanels, computeStartupPanels } from "./panelsInit"
import { buildExtraPanels } from "./extraPanels"
import { DashboardMenu } from "./DashboardMenu"
import { DashboardPanel } from "./DashboardPanel"
import { usePanelsOrder } from "./usePanelsOrder"

//Module-level mutables shared by every dashboard instance of the session:
//the fixed panels order is loaded once, the shortcuts init runs once
const fixedPanels = []
let intialisationDone = false

const Dashboard = () => {
    const iconsList = { ...iconsTarget, ...iconsFeather }
    const { modals, panels, uisettings, shortcuts } = useUiContext()
    const { interfaceSettings } = useSettingsContext()
    const isfixed = uisettings.getValue("fixedpanels")
    const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(
        shortcuts.enabled
    )
    const [incompatibleExtraIds, setIncompatibleExtraIds] = useState(
        () => new Set()
    )
    const [layoutEditMode, setLayoutEditMode] = useState(false)
    const [borderlessMode, setBorderlessMode] = useState(getPanelsBorderless)
    const {
        canvasMode,
        effectiveCanvasMode,
        isFullscreen,
        toggleCanvasMode,
        toggleFullscreen,
    } = useCanvasMode()
    const { reorderPanels } = usePanelsOrder({
        panels,
        uisettings,
        interfaceSettings,
    })

    //Ids of all panels enabled in the settings (visible or hidden), in
    //dashboard order - used to tile the canvas
    const getEnabledPanelIds = () =>
        panels.list
            .filter(
                (p) =>
                    uisettings.getValue(p.show) &&
                    (typeof p.onstart === "boolean"
                        ? p.onstart
                        : uisettings.getValue(p.onstart))
            )
            .map((p) => p.id)

    //Re-apply layouts to all dashboard panels when the mode changes
    //(grid <-> canvas); tile them when entering a fresh canvas (no
    //stored position yet)
    useEffect(() => {
        const container = document.querySelector("#dashboard .panels-container")
        if (!container) return
        const domPanels = container.querySelectorAll(".panel[id]")
        if (effectiveCanvasMode) {
            const hasStoredPosition = Array.from(domPanels).some(
                (panel) => getPanelLayout(panel.id).x != null
            )
            if (!hasStoredPosition && domPanels.length > 0) {
                tileCanvasLayout(container, getEnabledPanelIds())
            } else {
                domPanels.forEach(applyLayout)
            }
            //shrink / clamp / resolve the overlaps of stored layouts
            //(e.g. coming from a larger window or an old version)
            constrainCanvas(container)
        } else {
            domPanels.forEach(applyLayout)
        }
        //notify the cached extra contents (iframes) so they follow their
        //panel to its new position
        eventBus.emit("panelsLayoutChanged", {})
        //panels.visibles is a dependency so the layout is (re)applied
        //when panels appear after the mode was restored (F5) or when a
        //panel is shown again - the observer alone may miss them
    }, [effectiveCanvasMode, panels.visibles])

    //Persist the shown / hidden panels on this device (localStorage) -
    //the global default stays in the ESP settings
    useEffect(() => {
        if (!panels.initDone) return
        saveVisibility(panels.list, panels.visibles)
    }, [panels.visibles])

    //In canvas edition the cached extra contents (iframes) float above
    //the panels: make them translucent and transparent to pointer events
    //so the panel below receives the drag / resize gestures
    useEffect(() => {
        const app = document.getElementById("app")
        if (!app) return
        app.classList.toggle(
            "canvas-edit",
            layoutEditMode && effectiveCanvasMode
        )
        return () => app.classList.remove("canvas-edit")
    }, [layoutEditMode, effectiveCanvasMode])

    useEffect(() => {
        const handler = ({ id: rootId }) => {
            if (rootId)
                setIncompatibleExtraIds((prev) => new Set(prev).add(rootId))
        }
        const listenerId = eventBus.on("extraContentIncompatible", handler)
        return () => eventBus.off("extraContentIncompatible", listenerId)
    }, [])

    //Reset the panels layout and visibility, with a confirmation modal:
    //a misclick would otherwise be irreversible
    const doResetLayout = () => {
        clearLayouts()
        //restore the startup visibility (onstart panels), discarding the
        //device-local overrides: a reset must bring back a usable
        //dashboard even when every panel was closed
        panels.setVisibles(computeStartupPanels(panels.list, uisettings))
        //on the canvas, reset tiles the panels side by side with no
        //overlap - including the ones currently hidden but enabled in
        //the settings, so they fall in place when shown again
        if (effectiveCanvasMode) {
            tileCanvasLayout(
                document.querySelector("#dashboard .panels-container"),
                getEnabledPanelIds()
            )
        }
    }

    const confirmResetLayout = () => {
        useUiContextFn.haptic()
        showModal({
            modals,
            title: T("S26"),
            icon: <RotateCcw />,
            content: T("S270"),
            button1: {
                text: T("S27"),
                cb: doResetLayout,
            },
            button2: {
                text: T("S28"),
            },
        })
    }

    const toggleKeyboardShortcuts = () => {
        useUiContextFn.haptic()
        const state = !shortcuts.enabled
        shortcuts.enable(state)
        setIsKeyboardEnabled(state)
        if (state) {
            addKeyboardListener()
        } else {
            removeKeyboardListener()
        }
    }

    useEffect(() => {
        if (!intialisationDone) {
            intialisationDone = true
            setIsKeyboardEnabled(uisettings.getValue("enableshortcuts"))
            shortcuts.enable(uisettings.getValue("enableshortcuts"))
        }
    }, [])

    useEffect(() => {
        if (shortcuts.enabled) {
            addKeyboardListener()
        }
        return () => {
            if (shortcuts.enabled) {
                removeKeyboardListener()
            }
        }
    }, [shortcuts.enabled])

    //Load the saved panels order / compute the visible ones (runs on
    //every render until panels.initDone, then only prunes stale panels)
    useEffect(() => {
        initDashboardPanels({ panels, uisettings, isfixed, fixedPanels })
    })

    //(Re)build the panels list when the extra contents change
    useEffect(() => {
        const showExtra = uisettings.getValue("showextracontents")
        const extraContents = uisettings.getValue("extracontents")
        if (showExtra) {
            if (Array.isArray(extraContents)) {
                fixedPanels.length = 0
                panels.set([
                    ...defaultPanelsList,
                    ...buildExtraPanels(
                        extraContents,
                        incompatibleExtraIds,
                        defaultPanelsList
                    ),
                ])
            } else {
                panels.set([...defaultPanelsList])
            }
        } else {
            panels.set([...defaultPanelsList])
        }
        panels.visibles.forEach((element) => {
            if (!uisettings.getValue(element.show)) panels.hide(element.id)
        })
    }, [uisettings.current, incompatibleExtraIds])

    return (
        <div
            id="dashboard"
            class={effectiveCanvasMode ? "dashboard-canvas" : ""}
        >
            <div class="buttons-bar m-2">
                {panels.list.length > 0 && (
                    <DashboardMenu
                        panels={panels}
                        uisettings={uisettings}
                        iconsList={iconsList}
                        isfixed={isfixed}
                        isKeyboardEnabled={isKeyboardEnabled}
                        onToggleKeyboard={toggleKeyboardShortcuts}
                        onShowKeyboardHelp={() => showKeyboardHelp(modals)}
                        layoutEditMode={layoutEditMode}
                        onToggleLayoutEdit={() => {
                            useUiContextFn.haptic()
                            setLayoutEditMode(!layoutEditMode)
                        }}
                        onResetLayout={confirmResetLayout}
                        canvasMode={canvasMode}
                        effectiveCanvasMode={effectiveCanvasMode}
                        onToggleCanvasMode={() => {
                            useUiContextFn.haptic()
                            toggleCanvasMode()
                        }}
                        borderlessMode={borderlessMode}
                        onToggleBorderless={() => {
                            useUiContextFn.haptic()
                            const next = !borderlessMode
                            setPanelsBorderless(next)
                            setBorderlessMode(next)
                        }}
                    />
                )}
                {effectiveCanvasMode && (
                    <span
                        class="btn tooltip tooltip-right m-1"
                        tabindex="0"
                        data-tooltip={T("S269")}
                        aria-label={T("S269")}
                        onclick={toggleFullscreen}
                    >
                        {isFullscreen ? <Minimize /> : <Maximize />}
                    </span>
                )}
                {panels.visibles.length > 0 && (
                    <CollapseAllToggle containerSelector="#dashboard .panels-container" />
                )}
                <QuickButtonsBar />
            </div>
            <div
                class={`panels-container m-2${layoutEditMode ? " panels-layout-edit" : ""}${effectiveCanvasMode ? " panels-canvas" : ""}`}
            >
                {panels.visibles.map((panel) => (
                    <DashboardPanel
                        key={panel.id}
                        panel={panel}
                        isfixed={isfixed}
                        effectiveCanvasMode={effectiveCanvasMode}
                        layoutEditMode={layoutEditMode}
                        onReorder={reorderPanels}
                    />
                ))}
            </div>
        </div>
    )
}

export default Dashboard
