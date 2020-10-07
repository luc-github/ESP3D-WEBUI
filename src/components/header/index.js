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
import { Page, customdata } from "../app"
import { ESP3DLogo, ESP3DBanner } from "../images"
import { Server, Settings, Eye, Lock } from "preact-feather"
import { T } from "../translations"
import { prefs } from "../settings"
import { esp3dSettings, disconnectPage } from "../app"
import { SubmitCredentials } from "../http"
import { useStoreon } from "storeon/preact"

function disconnectNow() {
    SubmitCredentials()
    disconnectPage()
}

/*
 * Header component
 *
 */
export const Header = () => {
    const { activePage } = useStoreon("activePage")
    const { dispatch } = useStoreon()
    if (typeof esp3dSettings == "undefined") return
    let titlebanner = T("S15")
    let textbanner = T("S11")
    let linkbanner =
        "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=Y8FFE7NA4LJWQ"
    let logo = <ESP3DLogo />
    if (customdata.text) {
        textbanner = customdata.text
    }
    if (customdata.title) {
        titlebanner = customdata.title
    }
    if (customdata.link) {
        linkbanner = customdata.link
    }
    if (customdata.logo) {
        let data = customdata.logo.replace("{height}", "'50px'")
        logo = (
            <div
                dangerouslySetInnerHTML={{
                    __html: data,
                }}
            ></div>
        )
    }
    return (
        <nav
            class="navbar navbar-light navbar-expand fixed-top justify-content-left espheader"
            id="headerbar"
        >
            <div
                class={
                    activePage == Page.about ? "nav-item active" : "nav-item"
                }
                title={T("S12")}
                onClick={() => dispatch("setPage", Page.about)}
            >
                {logo}
            </div>
            <div
                class={
                    esp3dSettings.FWTarget == "unknown"
                        ? "d-none"
                        : activePage == Page.notifications
                        ? "nav-item active  show-low"
                        : "nav-item  show-low"
                }
                id="notifficationButton"
                title={T("notification")}
                onClick={() => dispatch("setPage", Page.notifications)}
            >
                <Eye />
                <span class="disable-select hide-low">
                    &nbsp;{T("notification")}
                </span>
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
            <div
                class={
                    esp3dSettings.FWTarget == "unknown"
                        ? "d-none"
                        : esp3dSettings.Authentication == "Enabled"
                        ? "nav-item"
                        : "d-none"
                }
                title={T("S151")}
                onClick={disconnectNow}
            >
                <Lock />
                <span class="disable-select hide-low">&nbsp;{T("S151")}</span>
            </div>
            <ESP3DBanner
                visible={prefs.banner}
                title={titlebanner}
                text={textbanner}
                link={linkbanner}
            />
        </nav>
    )
}
