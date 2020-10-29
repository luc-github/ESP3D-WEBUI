/*
 macros.js - ESP3D WebUI macro file

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
import { T } from "../translations"
import { useState, useEffect } from "preact/hooks"
import { SendGetHttp } from "../http"
import { useStoreon } from "storeon/preact"
import { showDialog } from "../dialog"
import { preferences, getPanelIndex } from "../app"
import { X } from "preact-feather"
const { getIcon } = require(`../${process.env.TARGET_ENV}`)

/*
 * Local variables
 *
 */

let timeoutpanel = []

/*
 * Local constants
 *
 */

/*
 * ButtonExtraPanel
 */
const ButtonExtraPanel = ({ data }) => {
    const onClick = e => {
        const { dispatch } = useStoreon()
        dispatch("panel/showextra", { visible: false, id: data.id })
        dispatch("panel/showextra", { visible: true, id: data.id })
    }
    return (
        <div class="p-1">
            <button
                type="button"
                class="btn overlay"
                style={
                    "min-height:2.5em!important;min-width:2.5em!important;" +
                    "background-color:" +
                    data.color +
                    ";color:" +
                    data.textcolor
                }
                title={data.name}
                onClick={onClick}
            >
                <div class="d-flex align-items-center">
                    {data.icon != "None" ? getIcon(data.icon) : null}
                    <span
                        class="hide-low text-button no_wrap"
                        style="max-width:8em;overflow: hidden;text-overflow: ellipsis;"
                    >
                        {data.name}
                    </span>
                </div>
            </button>
        </div>
    )
}

/*
 * ExtraPanelButtons
 */
const ExtraPanelsButtons = () => {
    if (!preferences.settings.showextrapanels) return null

    let buttonlist = []
    for (let i = 0; i < preferences.settings.extrapanels.length; i++) {
        if (preferences.settings.extrapanels[i].target == "panel") {
            buttonlist.push(
                <ButtonExtraPanel data={preferences.settings.extrapanels[i]} />
            )
        }
    }
    return <Fragment>{buttonlist}</Fragment>
}

function isVisible(id) {
    const { extraPanels } = useStoreon("extraPanels")
    console.log(extraPanels)
    for (let i = 0; i < extraPanels.length; i++) {
        if (extraPanels[i].id == id) {
            return extraPanels[i].visible
        }
    }
    return false
}

const ExtraPanel = ({ data }) => {
    const { panelsOrder } = useStoreon("panelsOrder")
    let index = getPanelIndex(panelsOrder, data.id)
    if (!isVisible(data.id)) return null
    const toogle = e => {
        const { dispatch } = useStoreon()
        dispatch("panel/showextra", { visible: false, id: data.id })
    }
    let panelClass = "order-" + index + " w-100 panelCard"
    let source = ""
    let content = []
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
        content.push(
            <iframe
                class="w-100 h-100 d-inline-block mw-100"
                id={"panel_content_" + data.id}
                style="width:100%;border:none;"
                src={source}
            ></iframe>
        )
    } else {
        content.push(
            <img
                id={"panel_content_" + data.id}
                class="w-100"
                width="100%"
                src={source}
            ></img>
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
                    document.getElementById("panel_content_" + data.id) != null
                ) {
                    if (source.indexOf("?") == -1)
                        src = source + "?esp3d=" + new Date().getTime()
                    else src = source + "&esp3d=" + new Date().getTime()
                    document.getElementById(
                        "panel_content_" + data.id
                    ).src = src
                    document.getElementById("panel_content_" + data.id).width =
                        "100%"
                    console.log(
                        "refresh for " +
                            document.getElementById("panel_content_" + data.id)
                    )
                }
            }, data.refreshtime * 1000)
        } else {
            if (source.length > 0) {
                timeoutpanel[data.id] = setInterval(() => {
                    let src
                    if (
                        document.getElementById("panel_content_" + data.id) !=
                        null
                    ) {
                        if (source.indexOf("?") == -1)
                            src = source + "?esp3d=" + new Date().getTime()
                        else src = source + "&esp3d=" + new Date().getTime()

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
                                    ).src = URL.createObjectURL(response)
                                    document.getElementById(
                                        "panel_content_" + data.id
                                    ).width = "100%"
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
        <div class={panelClass}>
            <div class="p-2 ">
                <div class="border rounded p-2 panelCard">
                    <div class="w-100">
                        <div class="d-flex flex-wrap">
                            <div class="p-1">
                                {getIcon(data.icon)}
                                <span class="hide-low control-like text-button">
                                    {data.name}
                                </span>
                            </div>
                            <div class="p-1" />
                            <div class="ml-auto text-right">
                                <button
                                    type="button"
                                    class="btn btn-light btn-sm red-hover"
                                    title={T("S86")}
                                    onClick={toogle}
                                >
                                    <X />
                                </button>
                            </div>
                        </div>
                        <div style="height: 400px;">{content}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/*
 * Extra Panels
 *
 */
const ExtraPanels = () => {
    if (!preferences.settings.showextrapanels) return null
    let panels = []
    for (let i = 0; i < preferences.settings.extrapanels.length; i++) {
        if (preferences.settings.extrapanels[i].target == "panel") {
            if (isVisible(preferences.settings.extrapanels[i].id))
                panels.push(
                    <ExtraPanel data={preferences.settings.extrapanels[i]} />
                )
        }
    }
    console.log(panels.length + " extra panels")
    return <Fragment>{panels}</Fragment>
}

export { ExtraPanels, ExtraPanelsButtons }
