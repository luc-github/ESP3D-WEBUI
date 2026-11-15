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
import { useEffect, useState, useRef } from "preact/hooks"
import {
    useUiContext,
    useUiContextFn,
    useSettingsContext,
} from "../../contexts"
import { T } from "../../components/Translations"
import {
    List,
    CheckCircle,
    Circle,
    HelpCircle,
    Anchor,
    RotateCcw,
    Maximize,
    Minimize,
} from "preact-feather"
import { iconsFeather } from "../../components/Images"
import { clone, applyPanelsOrder } from "../../components/Helpers"
import { defaultPanelsList, iconsTarget, QuickButtonsBar } from "../../targets"
import { ExtraPanelElement } from "../../components/Panels/ExtraPanel"
import { showModal } from "../../components/Modal"
import { eventBus } from "../../hooks/eventBus"
import { CollapseAllToggle } from "../../components/Panels/CollapseAllToggle"
import { PanelLayoutControls } from "../../components/Panels/PanelLayoutControls"
import {
    clearLayouts,
    getPanelLayout,
    getPanelsBorderless,
    setPanelsBorderless,
    getLayoutMode,
    setLayoutMode,
    isDesktopLayout,
    applyLayout,
    tileCanvasLayout,
    saveVisibility,
    applyVisibilityOverrides,
} from "../../components/Panels/layoutHelper"

const fixedPanels = []
const keyTracker = {
    keybListenerCounter: 0,
    keyState: 0,
    lastcall: new Date(),
    lastkey: "",
}

//Need to put outside of Dashboard object to be sure add/remove alsways use same address
const keyboardEventHandlerUp = (e) => {
    keyTracker.keyState = 0
}

const keyboardEventHandlerDown = (e) => {
    // Bail if User is actively typing text.  We don't want to disrupt them entering gcode.
    if (
        document.activeElement &&
        document.activeElement.tagName == "INPUT" &&
        (document.activeElement.type == "text" ||
            document.activeElement.type == "number")
    ) {
        return
    }

    let keyval = ""
    if (e.ctrlKey) keyval += "Control+"
    if (e.altKey) keyval += "Alt+"
    if (e.shiftKey) keyval += "Shift+"
    if (e.metaKey) keyval += "Meta+"
    if (
        !(
            e.key == "Control" ||
            e.key == "Alt" ||
            e.key == "Shift" ||
            e.key == "Meta"
        )
    )
        keyval += e.key.toUpperCase()
    let cmdMatch = null
    const keysRefs = ["keymap", "macros"]
    keysRefs.forEach((list) => {
        const keyMapObj = useUiContextFn.getValue(list)
        if (keyMapObj) {
            keyMapObj.forEach((element) => {
                element.value.forEach((sub) => {
                    if (
                        sub.name == "key" &&
                        sub.value &&
                        sub.value.length > 0 &&
                        sub.value?.toUpperCase() == keyval?.toUpperCase() &&
                        document.getElementById(element.id)
                    ) {
                        cmdMatch = element.id
                    }
                })
            })
        }
    })

    if (cmdMatch) {
        e.preventDefault()
        const autorepeat = useUiContextFn.getValue("enableautorepeat")
        if (keyTracker.keyState == 1 && !autorepeat) {
            return
        }
        keyTracker.keyState = 1
        const delay = useUiContextFn.getValue("autorepeatdelay")
        if (delay && autorepeat && keyTracker.lastkey == keyval) {
            let t = new Date()
            if (t.getTime() - keyTracker.lastcall.getTime() < delay) {
                return
            }
            keyTracker.lastcall = new Date()
        }
        keyTracker.lastkey = keyval

        document.getElementById(cmdMatch).click()
    }
}
let intialisationDone = false

const Dashboard = () => {
    const iconsList = { ...iconsTarget, ...iconsFeather }
    const { modals, panels, uisettings, shortcuts } = useUiContext()
    const { interfaceSettings } = useSettingsContext()
    const menuPanelsList = useRef()
    const isfixed = uisettings.getValue("fixedpanels")
    const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(
        shortcuts.enabled
    )
    const [dropIndicator, setDropIndicator] = useState({
        index: null,
        side: null,
    })
    const [incompatibleExtraIds, setIncompatibleExtraIds] = useState(
        () => new Set()
    )
    const [layoutEditMode, setLayoutEditMode] = useState(false)
    const [borderlessMode, setBorderlessMode] = useState(getPanelsBorderless)
    const [canvasMode, setCanvasMode] = useState(
        () => getLayoutMode() === "canvas"
    )
    //layout modes are desktop-only
    const effectiveCanvasMode = canvasMode && isDesktopLayout()
    const [isFullscreen, setIsFullscreen] = useState(
        () => typeof document !== "undefined" && !!document.fullscreenElement
    )

    //track the browser fullscreen state for the toggle button icon
    useEffect(() => {
        const onFullscreenChange = () =>
            setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener("fullscreenchange", onFullscreenChange)
        return () =>
            document.removeEventListener("fullscreenchange", onFullscreenChange)
    }, [])

    //Browser fullscreen on #app (not #dashboard: the cached extension
    //contents live outside #dashboard and must stay visible). This is the
    //tap-friendly alternative to ESC for touch devices
    const toggleFullscreen = () => {
        useUiContextFn.haptic()
        try {
            if (document.fullscreenElement) {
                const result = document.exitFullscreen()
                if (result && result.catch) result.catch(() => {})
            } else {
                const element =
                    document.getElementById("app") || document.documentElement
                const result = element.requestFullscreen()
                if (result && result.catch) result.catch(() => {})
            }
        } catch (e) {
            //fullscreen may be refused (unsupported context)
        }
    }

    //Canvas mode acts as a fullscreen view: the dashboard covers the
    //viewport as a fixed overlay. The Fullscreen API is deliberately not
    //used: the cached extension contents (iframes) live in #elementsCache
    //outside #dashboard and would be hidden by the browser in real
    //fullscreen
    useEffect(() => {
        const app = document.getElementById("app")
        const element = document.getElementById("dashboard")
        if (!app || !element) return
        if (effectiveCanvasMode) {
            app.classList.add("canvas-fullscreen")
            //use the page background so themes apply seamlessly
            element.style.backgroundColor = window.getComputedStyle(
                document.body
            ).backgroundColor
        } else {
            app.classList.remove("canvas-fullscreen")
            element.style.backgroundColor = ""
        }
    }, [effectiveCanvasMode])

    //ESC leaves the canvas mode (unless a modal or a dropdown is open)
    useEffect(() => {
        if (!effectiveCanvasMode) return
        const onKeyDown = (e) => {
            if (
                e.key === "Escape" &&
                !document.querySelector(".modal.active") &&
                !document.querySelector(".dropdown.active")
            ) {
                setLayoutMode("grid")
                setCanvasMode(false)
            }
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [effectiveCanvasMode])

    const toggleCanvasMode = () => {
        const next = !canvasMode
        setLayoutMode(next ? "canvas" : "grid")
        setCanvasMode(next)
    }

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

    //Reset the panels layout, with a confirmation modal: a misclick
    //would otherwise be irreversible
    const doResetLayout = () => {
        clearLayouts()
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

    //Show keyboard mapped keys
    const showKeyboarHelp = () => {
        useUiContextFn.haptic()
        const keysRefs = ["keymap", "macros"]
        const helpKeyboardJog = []
        keysRefs.forEach((list) => {
            const keyMapObj = useUiContextFn.getValue(list)

            if (keyMapObj) {
                keyMapObj.forEach((element) => {
                    const help = {}
                    element.value.forEach((sub) => {
                        if (sub.name == "key") {
                            help.key = sub.value
                        }
                        if (sub.name == "name") {
                            help.name = sub.value
                        }
                    })

                    if (document.getElementById(element.id))
                        helpKeyboardJog.push(
                            <tr>
                                <td> {T(help.name)}</td>
                                <td> [{T(help.key)}]</td>
                            </tr>
                        )
                })
            }
        })

        showModal({
            modals,
            title: T("S216"),
            button1: {
                text: T("S24"),
            },
            icon: <HelpCircle />,
            content: <table class="table">{helpKeyboardJog}</table>,
        })
    }

    //Add keyboard listener
    const AddKeyboardListener = () => {
        if (keyTracker.keybListenerCounter == 0) {
            window.addEventListener("keydown", keyboardEventHandlerDown, true)
            window.addEventListener("keyup", keyboardEventHandlerUp, true)
            keyTracker.keybListenerCounter++
        }
    }

    //Remove keyboard listener
    const RemoveKeyboardListener = () => {
        if (keyTracker.keybListenerCounter != 0) {
            window.removeEventListener(
                "keydown",
                keyboardEventHandlerDown,
                true
            )
            window.removeEventListener("keyup", keyboardEventHandlerUp, true)
            keyTracker.keybListenerCounter--
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
            AddKeyboardListener()
        }
        return () => {
            if (shortcuts.enabled) {
                RemoveKeyboardListener()
            }
        }
    }, [shortcuts.enabled])

    useEffect(() => {
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
                    const visibleList = newList.reduce((acc, curr) => {
                        if (
                            (typeof curr.onstart === "boolean"
                                ? curr.onstart
                                : uisettings.getValue(curr.onstart)) &&
                            uisettings.getValue(curr.show)
                        )
                            acc.push(curr)
                        return acc
                    }, [])
                    panels.setVisibles(applyVisibilityOverrides(visibleList))
                    /* Do not write back to uisettings here: we are only loading
                       the saved order. Writing would set hasmodified and mark
                       panel order as modified when user just opened dashboard. */
                } else {
                    const fallbackVisibles = panels.list.reduce((acc, curr) => {
                        if (
                            (typeof curr.onstart === "boolean"
                                ? curr.onstart
                                : uisettings.getValue(curr.onstart)) &&
                            uisettings.getValue(curr.show)
                        )
                            acc.push(curr)
                        return acc
                    }, [])
                    panels.setVisibles(
                        applyVisibilityOverrides(fallbackVisibles)
                    )
                }
            } else {
                const elseVisibles = panels.list.reduce((acc, curr) => {
                    if (
                        (typeof curr.onstart === "boolean"
                            ? curr.onstart
                            : uisettings.getValue(curr.onstart)) &&
                        uisettings.getValue(curr.show)
                    )
                        acc.push(curr)
                    return acc
                }, [])
                panels.setVisibles(applyVisibilityOverrides(elseVisibles))
            }
            panels.setInitDone(true)
        } else if (panels.initDone) {
            panels.visibles.forEach((element) => {
                if (!panels.list.find((panel) => panel.id === element.id))
                    panels.hide(element.id)
            })
        }
    })

    useEffect(() => {
        const showExtra = uisettings.getValue("showextracontents")
        const extraContents = uisettings.getValue("extracontents")
        if (showExtra) {
            if (Array.isArray(extraContents)) {
                fixedPanels.length = 0
                //extra content entries may share the same id (e.g. two
                //extensions with the same name): ensure every panel gets
                //a unique id so edition / layout / collapse features can
                //address each panel individually
                const usedIds = new Set(defaultPanelsList.map((p) => p.id))
                const extraPanelsList = extraContents.reduce((acc, curr) => {
                    if (incompatibleExtraIds.has(curr.id)) return acc
                    const item = (curr.value || []).reduce(
                        (accumulator, current) => {
                            accumulator[current.name] = current.initial
                            return accumulator
                        },
                        {}
                    )
                    if (item.target === "panel") {
                        let uniqueId = curr.id || item.name || "extrapanel"
                        if (usedIds.has(uniqueId)) {
                            let suffix = 2
                            while (usedIds.has(`${uniqueId}_${suffix}`))
                                suffix++
                            uniqueId = `${uniqueId}_${suffix}`
                        }
                        usedIds.add(uniqueId)
                        acc.push(ExtraPanelElement(item, uniqueId))
                    }
                    return acc
                }, [])
                panels.set([...defaultPanelsList, ...extraPanelsList])
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
                    <div class="dropdown">
                        <span
                            class="dropdown-toggle btn tooltip tooltip-right m-1"
                            tabindex="0"
                            style="z-index: 1000"
                            data-tooltip={T("S187")}
                            onclick={() => {
                                useUiContextFn.haptic()
                            }}
                        >
                            <List />
                        </span>
                        <ul class="menu" ref={menuPanelsList}>
                            <li class="menu-item">
                                <div
                                    class="menu-entry"
                                    onclick={(e) => {
                                        useUiContextFn.haptic()
                                        let state = !shortcuts.enabled
                                        shortcuts.enable(state)
                                        setIsKeyboardEnabled(state)
                                        if (state) {
                                            AddKeyboardListener()
                                        } else {
                                            RemoveKeyboardListener()
                                        }
                                    }}
                                >
                                    <div class="menu-panel-item">
                                        <span class="text-menu-item">
                                            {T("S215")}
                                        </span>
                                        <span class="feather-icon-container">
                                            {isKeyboardEnabled ? (
                                                <CheckCircle size="0.8rem" />
                                            ) : (
                                                <Circle size="0.8rem" />
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </li>
                            {isKeyboardEnabled && (
                                <li class="menu-item">
                                    <div
                                        class="menu-entry"
                                        onclick={showKeyboarHelp}
                                    >
                                        <div class="menu-panel-item">
                                            <span class="text-menu-item">
                                                {T("S216")}
                                            </span>
                                            <span class="feather-icon-container">
                                                <HelpCircle size="0.8rem" />
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            )}
                            <li class="menu-item hide-low">
                                <div
                                    class="menu-entry"
                                    onclick={(e) => {
                                        useUiContextFn.haptic()
                                        setLayoutEditMode(!layoutEditMode)
                                    }}
                                >
                                    <div class="menu-panel-item">
                                        <span class="text-menu-item">
                                            {T("S263")}
                                        </span>
                                        <span class="feather-icon-container">
                                            {layoutEditMode ? (
                                                <CheckCircle size="0.8rem" />
                                            ) : (
                                                <Circle size="0.8rem" />
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </li>
                            {layoutEditMode && (
                                <li class="menu-item hide-low">
                                    <div
                                        class="menu-entry"
                                        onclick={confirmResetLayout}
                                    >
                                        <div class="menu-panel-item">
                                            <span class="text-menu-item">
                                                {T("S264")}
                                            </span>
                                            <span class="feather-icon-container">
                                                <RotateCcw size="0.8rem" />
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            )}
                            {layoutEditMode && (
                                <li class="menu-item hide-low">
                                    <div
                                        class="menu-entry"
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            toggleCanvasMode()
                                        }}
                                    >
                                        <div class="menu-panel-item">
                                            <span class="text-menu-item">
                                                {T("S268")}
                                            </span>
                                            <span class="feather-icon-container">
                                                {canvasMode ? (
                                                    <CheckCircle size="0.8rem" />
                                                ) : (
                                                    <Circle size="0.8rem" />
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            )}
                            {layoutEditMode && effectiveCanvasMode && (
                                <li class="menu-item hide-low">
                                    <div
                                        class="menu-entry"
                                        onclick={(e) => {
                                            useUiContextFn.haptic()
                                            const next = !borderlessMode
                                            setPanelsBorderless(next)
                                            setBorderlessMode(next)
                                        }}
                                    >
                                        <div class="menu-panel-item">
                                            <span class="text-menu-item">
                                                {T("S266")}
                                            </span>
                                            <span class="feather-icon-container">
                                                {borderlessMode ? (
                                                    <CheckCircle size="0.8rem" />
                                                ) : (
                                                    <Circle size="0.8rem" />
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            )}
                            <li class="divider"></li>
                            <li class="menu-item">
                                <div
                                    class="menu-entry"
                                    onclick={(e) => {
                                        useUiContextFn.haptic()
                                        panels.setVisibles([])
                                    }}
                                >
                                    <div class="menu-panel-item">
                                        <span class="text-menu-item">
                                            {T("S117")}
                                        </span>
                                        <span
                                            class="btn btn-clear"
                                            aria-label="Close"
                                        />
                                    </div>
                                </div>
                            </li>
                            {panels.list.map((panel) => {
                                if (!uisettings.getValue(panel.show)) return
                                const displayIcon = iconsList[panel.icon]
                                    ? iconsList[panel.icon]
                                    : ""
                                const isvisible = panels.visibles.find(
                                    (element) => element.id == panel.id
                                )
                                const [isVisible, setVisible] =
                                    useState(isvisible)
                                useEffect(() => {
                                    setVisible(
                                        panels.visibles.find(
                                            (element) => element.id == panel.id
                                        )
                                    )
                                }, [panels.visibles])
                                return (
                                    <li class="menu-item">
                                        <div
                                            class="menu-entry"
                                            onclick={(e) => {
                                                useUiContextFn.haptic()
                                                if (isVisible) {
                                                    panels.hide(panel.id)
                                                } else {
                                                    panels.show(
                                                        panel.id,
                                                        isfixed
                                                    )
                                                }
                                                setVisible(!isVisible)
                                            }}
                                        >
                                            <div class="menu-panel-item">
                                                <span class="menu-panel-item feather-icon-container">
                                                    {displayIcon}
                                                    <span class="text-menu-item">
                                                        {T(panel.name)}
                                                    </span>
                                                </span>
                                                {isVisible && (
                                                    <span
                                                        class="btn btn-clear mt-2"
                                                        aria-label="Close"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
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
                onDragLeave={(e) => {
                    if (
                        !e.relatedTarget ||
                        !e.currentTarget.contains(e.relatedTarget)
                    )
                        setDropIndicator({ index: null, side: null })
                }}
            >
                {panels.visibles.map((panel, index) => {
                    if (!isfixed) {
                        return (
                            <div key={panel.id} class="panel-layout-wrapper">
                                {panel.content}
                                {layoutEditMode && (
                                    <PanelLayoutControls
                                        panelId={panel.id}
                                        mode={
                                            effectiveCanvasMode
                                                ? "canvas"
                                                : "grid"
                                        }
                                    />
                                )}
                            </div>
                        )
                    }
                    const isExtraPanel =
                        panel.settingid &&
                        panel.settingid.startsWith("extracontents_")
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
                            e.clientX < rect.left + rect.width / 2
                                ? "before"
                                : "after"
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
                        const { index: dropIndex, side: dropSide } =
                            dropIndicator
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
                        const el = useUiContextFn.getElement(
                            "panelsorder",
                            next
                        )
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
                    return (
                        <div
                            key={panel.id}
                            class={`panel-drag-wrapper${panel.hasMenu ? " panel-has-menu" : ""}${isExtraPanel ? " panel-extra-content" : ""}${dropIndicator.index === index ? ` panel-drop-indicator-${dropIndicator.side}` : ""}`}
                            draggable={!effectiveCanvasMode}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragEnd={handleDragEnd}
                            data-panel-index={index}
                        >
                            <span
                                class="panel-drag-handle tooltip tooltip-left"
                                data-tooltip={T("S256")}
                                draggable={!effectiveCanvasMode}
                                onDragStart={handleDragStart}
                                aria-label={T("S256")}
                            >
                                <Anchor size="0.8rem" />
                            </span>
                            {panel.content}
                            {layoutEditMode && (
                                <PanelLayoutControls
                                    panelId={panel.id}
                                    mode={
                                        effectiveCanvasMode ? "canvas" : "grid"
                                    }
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Dashboard
