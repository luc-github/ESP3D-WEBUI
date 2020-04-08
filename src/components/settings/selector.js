/*
 index.js - ESP3D WebUI settings file

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
import { T } from "../translations"
import { initApp } from "../uisettings"
import { RotateCcw, Upload } from "preact-feather"
import { Setting, esp3dSettings } from "../app"
import { setSettingPage } from "./index"

/*
 * Local variables
 *
 */
let esp3dFWSettings //full esp3d settings (ESP400)

/*
 * Settings page
 *
 */
export const Selector = ({ currentPage }) => {
    let visible = false
    function onclickesp3d() {
        setSettingPage(Setting.esp3d)
    }
    function onclickui() {
        setSettingPage(Setting.ui)
    }
    function onclickmachine() {
        setSettingPage(Setting.machine)
    }
    if (
        !esp3dSettings ||
        !esp3dSettings.FWTarget ||
        esp3dSettings.FWTarget == "???"
    ) {
        visible = false
    } else {
        visible = true
    }
    return (
        <center>
            <div class="list-left">
                <ul class="nav nav-pills">
                    <li
                        class={
                            currentPage == Setting.esp3d
                                ? "nav-link pill-link active"
                                : "nav-link pill-link"
                        }
                        onclick={onclickesp3d}
                    >
                        ESP3D
                    </li>
                    <li
                        class={
                            currentPage == Setting.ui
                                ? "nav-link pill-link active"
                                : "nav-link pill-link"
                        }
                        onclick={onclickui}
                    >
                        UI
                    </li>
                    <li
                        class={
                            visible
                                ? currentPage == Setting.machine
                                    ? "nav-link pill-link active"
                                    : "nav-link pill-link"
                                : "d-none"
                        }
                        onclick={onclickmachine}
                    >
                        Machine
                    </li>
                </ul>
            </div>
        </center>
    )
}
