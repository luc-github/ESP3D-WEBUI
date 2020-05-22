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
import { Page } from "../app"
import { TerminalPanel, updateTerminal } from "./terminal"
const { JogPanel } = require(`../${process.env.TARGET_ENV}`)
const { FilesPanel } = require(`../${process.env.TARGET_ENV}`)
import { preferences } from "../settings"
import { useStoreon } from "storeon/preact"
import { Terminal, Folder } from "preact-feather"

const DashboardToolBar = () => {
    const { showTerminal } = useStoreon("showTerminal")
    const { showFiles } = useStoreon("showFiles")
    const toogleTerminal = e => {
        const { dispatch } = useStoreon()
        dispatch("panel/showterminal", !showTerminal)
    }
    const toogleFiles = e => {
        const { dispatch } = useStoreon()
        dispatch("panel/showfiles", !showFiles)
    }
    return (
        <div class="d-flex flex-row no_wrap">
            <div
                class={
                    preferences.settings.showterminalpanel ? "p-1" : "d-none"
                }
            >
                <button
                    type="button"
                    class={
                        showTerminal ? "btn btn-dark reduce-90" : "btn btn-dark"
                    }
                    title={T("S74")}
                    onClick={toogleTerminal}
                >
                    <Terminal />
                    <span class="hide-low text-button">
                        {showTerminal ? T("S73") : T("S75")}
                    </span>
                </button>
            </div>
            <div class={preferences.settings.showfilespanel ? "p-1" : "d-none"}>
                <button
                    type="button"
                    class={
                        showFiles ? "btn btn-info reduce-90" : "btn btn-info"
                    }
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
const DashboardPage = () => {
    const { activePage } = useStoreon("activePage")
    if (activePage != Page.dashboard) return null
    if (typeof preferences == "undefined") return
    return (
        <div>
            <DashboardToolBar />
            <div class="d-flex flex-wrap">
                <TerminalPanel />
                <FilesPanel />

                <JogPanel />
            </div>
        </div>
    )
}

export { DashboardPage, updateTerminal }
