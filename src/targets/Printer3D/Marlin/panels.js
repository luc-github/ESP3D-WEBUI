/*
 panels.js - ESP3D WebUI Target file

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
import { FilesPanelElement } from "../../../components/Panels/Files"
import { MacrosPanelElement } from "../../../components/Panels/Macros"
import { TerminalPanelElement } from "../../../components/Panels/Terminal"
import { JogPanelElement } from "../../../components/Panels/Jog"
import { ExtrudersPanelElement } from "../../../components/Panels/Extruders"
import { TemperaturesPanelElement } from "../../../components/Panels/Temperatures"
import { NotificationsPanelElement } from "../../../components/Panels/Notifications"
import { ChartsPanelElement } from "../../../components/Panels/Charts"
import { StatusPanelElement } from "../../../components/Panels/Status"
import { ExtraControlsPanelElement } from "../../../components/Panels/ExtraControls"

const defaultPanelsList = [
    FilesPanelElement,
    TerminalPanelElement,
    MacrosPanelElement,
    JogPanelElement,
    ExtrudersPanelElement,
    TemperaturesPanelElement,
    NotificationsPanelElement,
    ChartsPanelElement,
    StatusPanelElement,
    ExtraControlsPanelElement,
]

export { defaultPanelsList }
