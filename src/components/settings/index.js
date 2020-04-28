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
import { useState } from "preact/hooks"
import { T } from "../translations"
import { Page, Setting } from "../app"
import { Selector } from "./selector"
const { MachineSettings } = require(`../${process.env.TARGET_ENV}`)
import { WebUISettings, prefs, setcurrentprefs } from "./webui"
import { Esp3DSettings } from "./esp3d"

/*
 * Local variables
 *
 */

let currentSettingPage
let setSettingPage

/*
 * Settings page
 *
 */
const SettingsPage = ({ currentState }) => {
    ;[currentSettingPage, setSettingPage] = useState(Setting.machine)
    if (currentState.activePage != Page.settings) {
        return null
    }
    return (
        <div>
            <br />
            <Selector currentPage={currentSettingPage} />
            <Esp3DSettings currentPage={currentSettingPage} />
            <WebUISettings currentPage={currentSettingPage} />
            <MachineSettings currentPage={currentSettingPage} />
        </div>
    )
}

export { SettingsPage, prefs, setcurrentprefs, setSettingPage }
