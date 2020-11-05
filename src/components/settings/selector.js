/*
 selector.js - ESP3D WebUI settings file

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
import { Tool, Eye, Flag } from "preact-feather"
import { Setting, esp3dSettings, customdata } from "../app"
import { ESP3DLogo } from "../images"
import { startWizard } from "./wizard"
import { useStoreon } from "storeon/preact"
const { firmwareName } = require(`../${process.env.TARGET_ENV}`)
/*
 * Local variables
 *
 */
let esp3dFWSettings //full esp3d settings (ESP400)

/*
 * Settings page
 *
 */
export const Selector = ({ currentSetting }) => {
    let visible = false
    let target = ""
    const { dispatch } = useStoreon()
    let logo = <ESP3DLogo height="1.2em" />
    if (customdata.logo) {
        let data = customdata.logo.replace("{height}", "'1.2em'")
        logo = (
            <span
                dangerouslySetInnerHTML={{
                    __html: data,
                }}
            ></span>
        )
    }
    function onclickesp3d() {
        dispatch("setSettingTab", Setting.esp3d)
    }
    function onclickui() {
        dispatch("setSettingTab", Setting.ui)
    }
    function onclickmachine() {
        dispatch("setSettingTab", Setting.machine)
    }
    function onclicksetup() {
        startWizard()
    }
    if (
        !esp3dSettings ||
        !esp3dSettings.FWTarget ||
        esp3dSettings.FWTarget == "unknown"
    ) {
        visible = false
    } else {
        visible = true
        target = firmwareName(esp3dSettings.FWTarget)
    }
    return (
        <center>
            <div class="list-left disable-select">
                <ul class="nav nav-pills">
                    <li
                        title={T("S37")}
                        class={
                            currentSetting == Setting.esp3d
                                ? "nav-link pill-link active"
                                : "nav-link pill-link"
                        }
                        onclick={onclickesp3d}
                    >
                        {logo}
                        <span class="hide-low text-button">{T("S36")}</span>
                    </li>
                    <li
                        title={T("S38")}
                        class={
                            currentSetting == Setting.ui
                                ? "nav-link pill-link active"
                                : "nav-link pill-link"
                        }
                        onclick={onclickui}
                    >
                        <Eye />
                        <span class="hide-low text-button">{T("S17")}</span>
                    </li>
                    <li
                        title={
                            process.env.TARGET_ENV == "printer"
                                ? T("S39")
                                : T("40")
                        }
                        class={
                            visible
                                ? currentSetting == Setting.machine
                                    ? "nav-link pill-link active"
                                    : "nav-link pill-link"
                                : "d-none"
                        }
                        onclick={onclickmachine}
                    >
                        <Tool />
                        <span class="hide-low text-button">{target}</span>
                    </li>
                    <li
                        title={T("S165")}
                        class="nav-link pill-link"
                        onclick={onclicksetup}
                    >
                        <Flag />
                        <span class="hide-low text-button">{T("S165")}</span>
                    </li>
                </ul>
            </div>
        </center>
    )
}
