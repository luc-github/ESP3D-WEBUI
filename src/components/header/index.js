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
import { Page } from "../app"
import { ESP3DLogo, ESP3DBanner } from "../images"
import { Server, Settings } from "preact-feather"
import { T } from "../translations"
import { prefs } from "../settings"
import { esp3dSettings } from "../app"
import { useStoreon } from "storeon/preact"

/*
 * Header component
 *
 */
export const Header = () => {
    const { activePage } = useStoreon("activePage")
    const { dispatch } = useStoreon()
    if (typeof esp3dSettings == "undefined") return
    return (
        <nav class="navbar navbar-light navbar-expand fixed-top justify-content-left espheader">
            <div
                class={
                    activePage == Page.about ? "nav-item active" : "nav-item"
                }
                title={T("S12")}
                onClick={() => dispatch("setPage", Page.about)}
            >
                <ESP3DLogo />
            </div>
            <div
                class={
                    esp3dSettings.FWTarget == "unknown"
                        ? "d-none"
                        : activePage == Page.dashboard
                        ? "nav-item active"
                        : "nav-item"
                }
                title={T("S13")}
                onClick={() => dispatch("setPage", Page.dashboard)}
            >
                <Server />
                <span class="disable-select hide-low">&nbsp;{T("S13")}</span>
            </div>
            <div
                class={
                    activePage == Page.settings ? "nav-item active" : "nav-item"
                }
                title={T("S14")}
                onClick={() => dispatch("setPage", Page.settings)}
            >
                <Settings />
                <span class="disable-select hide-low">&nbsp;{T("S14")}</span>
            </div>
            <ESP3DBanner
                visible={prefs.banner}
                title={T("S15")}
                text={T("S11")}
            />
        </nav>
    )
}
