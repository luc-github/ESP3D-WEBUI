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
import { useUiContext, useUiContextFn } from "../../contexts"
import { T } from "../../components/Translations"
import { List } from "preact-feather"
import { iconsFeather } from "../../components/Images"
import { defaultPanelsList, iconsTarget, QuickButtonsBar } from "../../targets"
import { ExtraPanelElement } from "../../components/Panels/ExtraPanel"

const Dashboard = () => {
    console.log("Dashboard")
    const iconsList = { ...iconsTarget, ...iconsFeather }
    const { panels, uisettings } = useUiContext()
    const menuPanelsList = useRef()

    useEffect(() => {
        if (!panels.initDone && panels.list.length != 0) {
            panels.setVisibles(
                panels.list.reduce((acc, curr) => {
                    if (
                        uisettings.getValue(curr.onstart) &&
                        uisettings.getValue(curr.show)
                    )
                        acc.push(curr)
                    return acc
                }, [])
            )

            panels.setInitDone(true)
        } else {
            //now remove if any visible that is not in list
            panels.visibles.forEach((element) => {
                if (!panels.list.find((panel) => panel.id == element.id))
                    panels.hide(element.id)
            })
        }
    })
    useEffect(() => {
        if (uisettings.getValue("showextracontents")) {
            const extraContents = uisettings.getValue("extracontents")
            const extraPanelsList = extraContents.reduce((acc, curr) => {
                const item = curr.value.reduce((accumulator, current) => {
                    accumulator[current.name] = current.initial
                    return accumulator
                }, {})

                if (item.target == "panel") {
                    acc.push(ExtraPanelElement(item, "EXTRAPANEL-" + curr.id))
                }
                return acc
            }, [])
            panels.set([...defaultPanelsList, ...extraPanelsList])
        } else {
            panels.set([...defaultPanelsList])
        }
        //now remove if any visible that is not in list
        panels.visibles.forEach((element) => {
            if (!uisettings.getValue(element.show)) panels.hide(element.id)
        })
    }, [])

    return (
        <div id="dashboard">
            <div class="buttons-bar m-2">
                {panels.list.length > 0 && (
                    <div class="dropdown">
                        <span
                            class="dropdown-toggle btn tooltip tooltip-right m-1"
                            tabindex="0"
                            style="z-index: 10000"
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
                                                    panels.show(panel.id)
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
            <div class="panels-container m-2">
                {panels.visibles.map((panel) => {
                    return <Fragment>{panel.content}</Fragment>
                })}
            </div>
        </div>
    )
}

export default Dashboard
