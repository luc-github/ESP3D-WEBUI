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
import { Tool, Eye } from "preact-feather"
import { Setting, esp3dSettings } from "../app"
import { setSettingPage } from "./index"
import { ESP3DLogo } from "../images"
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
    let target = ""
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
        target = esp3dSettings.FWTarget
    }
    return (
        <center>
            <div class="list-left disable-select">
                <ul class="nav nav-pills">
                    <li
                        class={
                            currentPage == Setting.esp3d
                                ? "nav-link pill-link active"
                                : "nav-link pill-link"
                        }
                        onclick={onclickesp3d}
                    >
                      <ESP3DLogo height="1.2em"/> <span class="hide-low" >{T("S36")}</span>
                    </li>
                    <li
                        class={
                            currentPage == Setting.ui
                                ? "nav-link pill-link active"
                                : "nav-link pill-link"
                        }
                        onclick={onclickui}
                    >
                       <Eye/> <span class="hide-low" >{T("S17")}</span>
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
                         <Tool/><span class="hide-low" >{target}</span>
                    </li>
                </ul>
            </div>
        </center>
    )
}
