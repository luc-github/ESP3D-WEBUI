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

import { h, Fragment } from "preact"
import { Page, customdata } from "../app"
import { ESP3DLogo, ESP3DBanner } from "../images"
import { Server, Settings, Eye, Lock } from "preact-feather"
import { T } from "../translations"
import { prefs } from "../settings"
import { SendGetHttp } from "../http"
import { esp3dSettings, disconnectPage } from "../app"
import { SubmitCredentials } from "../http"
import { showDialog } from "../dialog"
import { useStoreon } from "storeon/preact"
const { getIcon } = require(`../${process.env.TARGET_ENV}`)

/*
 * Local variables
 *
 */

let timeoutpanel = []

/*
 * Force disconnection
 *
 */
function disconnectNow() {
    SubmitCredentials()
    disconnectPage()
}

function confirmDisconnection() {
    showDialog({
        type: "confirmation",
        message: T("S152"),
        title: T("S26"),
        button1text: T("S27"),
        next1: disconnectNow,
    })
}

/*
 * ButtonExtraPage
 */
const ButtonExtraPage = ({ data }) => {
    const { activePage } = useStoreon("activePage")
    const onClick = e => {
        const { dispatch } = useStoreon()
        dispatch("setPage", data.id)
    }
    return (
        <div
            class={activePage == data.id ? "nav-item active" : "nav-item"}
            title={data.name}
            onClick={onClick}
        >
            {data.icon != "None" ? getIcon(data.icon) : null}
            <span class="disable-select hide-low">&nbsp;{data.name}</span>
        </div>
    )
}

/*
 * ExtraPagesButtons
 */
const ExtraPagesButtons = () => {
    let buttonlist = []
    for (let i = 0; i < prefs.extrapanels.length; i++) {
        if (prefs.extrapanels[i].target == "page") {
            buttonlist.push(<ButtonExtraPage data={prefs.extrapanels[i]} />)
        }
    }
    return <Fragment>{buttonlist}</Fragment>
}

/*
 * ExtraPages
 */
const ExtraPages = () => {
    const { activePage } = useStoreon("activePage")
    for (let i = 0; i < prefs.extrapanels.length; i++) {
        if (prefs.extrapanels[i].target == "page") {
            if (activePage == prefs.extrapanels[i].id) {
                let source = ""
                let content = []
                let data = prefs.extrapanels[i]
                //small sanity check to avoid end loop
                //need to improve check here
                if (data.source != "/") {
                    source = data.source
                }
                if (typeof timeoutpanel[data.id] == "undefined") {
                    timeoutpanel[data.id] = null
                }
                if (timeoutpanel[data.id]) {
                    clearInterval(timeoutpanel[data.id])
                }
                if (data.type == "content") {
                    let d = 0
                    if (document.getElementById("notif").clientHeight) {
                        if (
                            document.getElementById("notif").getClientRects()[0]
                        ) {
                            d =
                                document.getElementById("notif").clientHeight +
                                document
                                    .getElementById("notif")
                                    .getClientRects()[0].top
                        }
                    }
                    content.push(
                        <iframe
                            class="w-100 mw-100"
                            id={"panel_content_" + data.id}
                            style={
                                "border:none; height:calc(100vh - " + d + "px);"
                            }
                            src={source}
                        ></iframe>
                    )
                } else {
                    content.push(<div class="p-2" />)
                    content.push(
                        <div class="w-100" width="100%">
                            <img
                                id={"panel_content_" + data.id}
                                src={source}
                            ></img>
                        </div>
                    )
                }
                if (data.refreshtime != 0) {
                    console.log(
                        "setup interval " +
                            data.refreshtime +
                            " for " +
                            document.getElementById("panel_content_" + data.id)
                    )
                    if (data.type != "camera") {
                        timeoutpanel[data.id] = setInterval(() => {
                            let src
                            if (
                                document.getElementById(
                                    "panel_content_" + data.id
                                ) != null
                            ) {
                                if (source.indexOf("?") == -1)
                                    src =
                                        source +
                                        "?esp3d=" +
                                        new Date().getTime()
                                else
                                    src =
                                        source +
                                        "&esp3d=" +
                                        new Date().getTime()

                                console.log(
                                    "refresh for " +
                                        document.getElementById(
                                            "panel_content_" + data.id
                                        )
                                )
                            }
                        }, data.refreshtime * 1000)
                    } else {
                        if (source.length > 0) {
                            timeoutpanel[data.id] = setInterval(() => {
                                let src
                                if (
                                    document.getElementById(
                                        "panel_content_" + data.id
                                    ) != null
                                ) {
                                    if (source.indexOf("?") == -1)
                                        src =
                                            source +
                                            "?esp3d=" +
                                            new Date().getTime()
                                    else
                                        src =
                                            source +
                                            "&esp3d=" +
                                            new Date().getTime()

                                    SendGetHttp(
                                        src,
                                        response => {
                                            if (
                                                document.getElementById(
                                                    "panel_content_" + data.id
                                                ) != null
                                            ) {
                                                document.getElementById(
                                                    "panel_content_" + data.id
                                                ).src = URL.createObjectURL(
                                                    response
                                                )
                                            }
                                        },
                                        (errorcode, response) => {
                                            console.log("fail getting image")
                                        },
                                        null,
                                        "download",
                                        5
                                    )
                                    console.log(
                                        "refresh for " +
                                            document.getElementById(
                                                "panel_content_" + data.id
                                            )
                                    )
                                }
                            }, data.refreshtime * 1000)
                        }
                    }
                }
                return (
                    <Fragment>
                        {content}
                        <div class="p-2" />
                    </Fragment>
                )
            }
        }
    }
    return null
}

/*
 * Header component
 *
 */
const Header = () => {
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
            <ExtraPagesButtons />
            <div
                class={
                    esp3dSettings.FWTarget == "unknown"
                        ? "d-none"
                        : esp3dSettings.Authentication == "Enabled"
                        ? "nav-item"
                        : "d-none"
                }
                title={T("S151")}
                onClick={confirmDisconnection}
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

export { ExtraPages, Header }
