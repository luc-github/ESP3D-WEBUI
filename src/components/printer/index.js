/*
 index.js - ESP3D WebUI 3D printer specific code / UI

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
import { Setting, esp3dSettings } from "../app"

function firmwareName(shortname) {
    switch (shortname) {
        case "repetier":
            return "Repetier"
        case "repetier4davinci":
            return "Repetier for Davinci"
        case "marlin-embedded":
            return "Marlin ESP32"
        case "marlin":
            return "Marlin"
        case "marlinkimbra":
            return "Marlin Kimbra"
        case "smoothieware":
            return "Smoothieware"
        default:
            return "Unknow"
    }
}

const MachineSettings = ({ currentPage }) => {
    if (
        currentPage != Setting.machine ||
        !esp3dSettings ||
        !esp3dSettings.FWTarget ||
        esp3dSettings.FWTarget == "unknown"
    )
        return null
    return (
        <div>
            <br />
            <center>
                3D Printer
                <br />
                <div class="list-left">To be implemented!</div>
            </center>
        </div>
    )
}

export { MachineSettings, firmwareName }
