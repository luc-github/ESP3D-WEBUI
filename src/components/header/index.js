/*
 index.js - ESP3D WebUI header file

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
import { globaldispatch, Page, Action } from "../app"
import { ESP3DLogo, ESP3DBanner } from "../images"
import { Server, Settings } from "preact-feather"
import { T } from "../translations"

function showAbout() {
    globaldispatch({ type: Action.renderPage, activePage: Page.about })
}

function showDashboard() {
    globaldispatch({ type: Action.renderPage, activePage: Page.dashboard })
}

function showSettings() {
    globaldispatch({ type: Action.renderPage, activePage: Page.settings })
}

/*
 * Header component
 *
 */
export const Header = () => {
    return (
        <nav class="navbar navbar-light navbar-expand fixed-top justify-content-left espheader">
            <div class="nav-item active" title={T("S12")} onClick={showAbout}>
                <ESP3DLogo />
            </div>
            <div class="nav-item" title={T("S13")} onClick={showDashboard}>
                <Server />
                <span class="disable-select hide-low">&nbsp;{T("S13")}</span>
            </div>
            <div class="nav-item" title={T("S14")} onClick={showSettings}>
                <Settings />
                <span class="disable-select hide-low">&nbsp;{T("S14")}</span>
            </div>
            <ESP3DBanner visible={true} title={T("S15")} text={T("S11")} />
        </nav>
    )
}
