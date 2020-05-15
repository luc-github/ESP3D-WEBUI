/*
 index.js - ESP3D WebUI dashboard file

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
import { Page } from "../app"
import { TerminalPanel, updateTerminal } from "./terminal"
import { FilesPanel } from "./files"
const { JogPanel } = require(`../${process.env.TARGET_ENV}`)
import { preferences } from "../uisettings"
import { useStoreon } from "storeon/preact"
import { Terminal, Folder, X } from "preact-feather"

const DashboardToolBar = () => {
    const { showTerminal } = useStoreon("showTerminal")
    const { showFiles } = useStoreon("showFiles")
    const toogleTerminal = e => {
        const { dispatch } = useStoreon()
        dispatch("monitor/showterminal", !showTerminal)
    }
    const toogleFiles = e => {
        const { dispatch } = useStoreon()
        dispatch("monitor/showfiles", !showFiles)
    }
    return (
        <div class="d-flex flex-row no_wrap">
            <div class="p-1">
                <button
                    type="button"
                    class="btn btn-dark"
                    title={T("S74")}
                    onClick={toogleTerminal}
                >
                    <Terminal />
                    <span class="hide-low text-button">
                        {showTerminal ? T("S73") : T("S75")}
                    </span>
                </button>
            </div>
            <div class="p-1">
                <button
                    type="button"
                    class="btn btn-info"
                    title={T("S87")}
                    onClick={toogleFiles}
                >
                    <Folder />
                    <span class="hide-low text-button">
                        {showFiles ? T("S85") : T("S84")}
                    </span>
                </button>
            </div>
        </div>
    )
}

/*
 * Dashboard page
 *
 */
const DashboardPage = ({ currentState }) => {
    if (currentState.activePage != Page.dashboard) return null

    return (
        <div style="max-width:50rem">
            <DashboardToolBar />
            <TerminalPanel />
            <FilesPanel />
            <div class="p-1" />
            <JogPanel preferences={preferences.settings} />
            <br />
            <br />
        </div>
    )
}

export { DashboardPage, updateTerminal }
