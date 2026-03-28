/*
Positions.js - ESP3D WebUI component file

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
import { Crosshair } from "preact-feather"
import { T } from "../Translations"
import { ContainerHelper, PanelHeader } from "../Controls"
import { PositionsControls } from "./Jog"
import { useUiContextFn } from "../../contexts"
import { StatusControls, StatusButtons } from "./Status"

const PositionsPanel = () => {
    const id = "positionsPanel"
    return (
        <div class="panel panel-dashboard" id={id}>
            <ContainerHelper id={id} />
            <PanelHeader
                id={id}
                icon={<Crosshair />}
                title={T("S116")}
            />
            <div class="panel-body panel-body-dashboard">
                <PositionsControls />
                <StatusControls />
                <StatusButtons />
            </div>
        </div>
    )
}

const PositionsPanelElement = {
    id: "positionsPanel",
    content: <PositionsPanel />,
    name: "S116",
    icon: "Crosshair",
    show: "showpositionspanel",
    onstart: "openpositionsonstart",
    settingid: "positions",
}

export { PositionsPanel, PositionsPanelElement }
