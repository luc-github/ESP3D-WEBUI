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
import { Fragment, h } from "preact"
import { useEffect, useState, useRef } from "preact/hooks"
import { useUiContext, useUiContextFn, useSettingsContext } from "../../contexts"
import { T } from "../../components/Translations"
import { List, CheckCircle, Circle, HelpCircle, Anchor } from "preact-feather"
import { iconsFeather } from "../../components/Images"
import { defaultPanelsList, iconsTarget, QuickButtonsBar } from "../../targets"
import { ExtraPanelElement } from "../../components/Panels/ExtraPanel"
import { showModal } from "../../components/Modal"
import { eventBus } from "../../hooks/eventBus"

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
    const [incompatibleExtraIds, setIncompatibleExtraIds] = useState(() => new Set())

    useEffect(() => {
        const handler = ({ id: rootId }) => {
            if (rootId) setIncompatibleExtraIds((prev) => new Set(prev).add(rootId))
        }
        const listenerId = eventBus.on("extraContentIncompatible", handler)
        return () => eventBus.off("extraContentIncompatible", listenerId)
    }, [])

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
                        const paneldesc = panels.list.filter(
                            (p) => p.settingid === panel.id
                        )
                        if (paneldesc.length > 0) acc.push(...paneldesc)
                        return acc
                    }, [])
                    panels.set([...newList])
                    const visibleList = newList.reduce((acc, curr) => {
                        if (
                            uisettings.getValue(curr.onstart) &&
                            uisettings.getValue(curr.show)
                        )
                            acc.push(curr)
                        return acc
                    }, [])
                    panels.setVisibles(visibleList)
                    const next = JSON.parse(
                        JSON.stringify(uisettings.current)
                    )
                    const el = useUiContextFn.getElement("panelsorder", next)
                    if (el && Array.isArray(el.value)) {
                        const reordered = newList.map((p, i) => ({
                            id: p.id,
                            value: [
                                { name: "name", value: p.settingid },
                                { name: "index", value: i },
                            ],
                            index: i,
                        }))
                        el.value = reordered
                        el.nb = reordered.length
                        el.hasmodified = true
                        reordered.forEach((item) => {
                            if (item.value && item.value[0])
                                item.value[0].hasmodified = true
                        })
                        uisettings.set(next)
                        if (interfaceSettings?.current)
                            interfaceSettings.current.settings = next
                    }
                } else {
                    const fallbackVisibles = panels.list.reduce((acc, curr) => {
                        if (
                            uisettings.getValue(curr.onstart) &&
                            uisettings.getValue(curr.show)
                        )
                            acc.push(curr)
                        return acc
                    }, [])
                    panels.setVisibles(fallbackVisibles)
                }
            } else {
                const elseVisibles = panels.list.reduce((acc, curr) => {
                    if (
                        uisettings.getValue(curr.onstart) &&
                        uisettings.getValue(curr.show)
                    )
                        acc.push(curr)
                    return acc
                }, [])
                panels.setVisibles(elseVisibles)
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
                const extraPanelsList = extraContents.reduce(
                    (acc, curr) => {
                        if (incompatibleExtraIds.has(curr.id)) return acc
                        const item = (curr.value || []).reduce(
                            (accumulator, current) => {
                                accumulator[current.name] = current.initial
                                return accumulator
                            },
                            {}
                        )
                        if (item.target === "panel")
                            acc.push(ExtraPanelElement(item, curr.id))
                        return acc
                    },
                    []
                )
                panels.set([
                    ...defaultPanelsList,
                    ...extraPanelsList,
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
        <div id="dashboard">
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
                <QuickButtonsBar />
            </div>
            <div
                class="panels-container m-2"
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
                            <Fragment key={panel.id}>
                                {panel.content}
                            </Fragment>
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
                        const next = JSON.parse(
                            JSON.stringify(uisettings.current)
                        )
                        const el = useUiContextFn.getElement(
                            "panelsorder",
                            next
                        )
                        if (el && Array.isArray(el.value)) {
                            const reordered = visibles.map((p, i) => {
                                const existing = el.value.find((item) => {
                                    const nameField =
                                        item.value &&
                                        item.value.find(
                                            (s) => s.name === "name"
                                        )
                                    return (
                                        nameField &&
                                        nameField.value === (p.settingid || p.id)
                                    )
                                })
                                if (existing) {
                                    existing.index = i
                                    const idxField =
                                        existing.value &&
                                        existing.value.find(
                                            (s) => s.name === "index"
                                        )
                                    if (idxField) idxField.value = i
                                    return existing
                                }
                                return {
                                    id: p.settingid || p.id,
                                    value: [
                                        {
                                            name: "name",
                                            value: p.settingid || p.id,
                                        },
                                        { name: "index", value: i },
                                    ],
                                    index: i,
                                }
                            })
                            el.value = reordered
                            el.nb = reordered.length
                            el.hasmodified = true
                            reordered.forEach((item) => {
                                if (item.value && item.value[0])
                                    item.value[0].hasmodified = true
                            })
                            uisettings.set(next)
                            if (interfaceSettings?.current)
                                interfaceSettings.current.settings = next
                        }
                    }
                    return (
                        <div
                            key={panel.id}
                            class={`panel-drag-wrapper${panel.hasMenu ? " panel-has-menu" : ""}${isExtraPanel ? " panel-extra-content" : ""}${dropIndicator.index === index ? ` panel-drop-indicator-${dropIndicator.side}` : ""}`}
                            draggable={true}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragEnd={handleDragEnd}
                            data-panel-index={index}
                        >
                            <span
                                class="panel-drag-handle tooltip tooltip-left"
                                data-tooltip={T("S256")}
                                draggable={true}
                                onDragStart={handleDragStart}
                                aria-label={T("S256")}
                            >
                                <Anchor size="1rem" />
                            </span>
                            {panel.content}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Dashboard
