/*
 ExtraControls.js - ESP3D WebUI component file

 Copyright (c) 2021 Luc LEBOSSE. All rights reserved.

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
import { useEffect, useRef, useState } from "preact/hooks"
import { T } from "../Translations"
import { Sliders } from "preact-feather"
import { useUiContext } from "../../contexts"

/*
 * Local const
 *
 */
const ExtraControlsPanel = () => {
    const { panels, uisettings } = useUiContext()

    const id = "extraControlsPanel"

    const hidePanel = () => {
        panels.hide(id)
    }

    console.log("Extra Controls panel")

    return (
        <div class="panel panel-dashboard">
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    <Sliders />
                    <strong class="text-ellipsis">{T("P96")}</strong>
                </span>
                <span class="navbar-section">
                    <span style="height: 100%;">
                        <span
                            class="btn btn-clear btn-close m-1"
                            aria-label="Close"
                            onclick={hidePanel}
                        />
                    </span>
                </span>
            </div>
            <div class="panel-body panel-body-dashboard"></div>
        </div>
    )
}

const ExtraControlsPanelElement = {
    id: "extraControlsPanel",
    content: <ExtraControlsPanel />,
    name: "P96",
    icon: "Sliders",
    show: "showextracontrolspanel",
    onstart: "openextracontrolsonstart",
}

export { ExtraControlsPanel, ExtraControlsPanelElement }