/*
 index.js - ESP3D WebUI dialog file

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
import { useEffect } from "preact/hooks"
import { AlertTriangle, Info } from "preact-feather"
import { T } from "../translations"
import { initApp } from "../settings"
import { useStoreon } from "storeon/preact"
import { Page } from "../app"

/*
 *Spin loader
 *
 */
const SpinLoader = ({ color }) => (
    <div class="lds-spinner" style={{ color }}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
)

/*
 * Ugly hack to avoid unwished tab stop to reach button not supposed to be accessed
 *
 */
function disableNode(node, state) {
    if (!node) return
    let nodeList = node.children
    if (nodeList) {
        for (var i = 0; i < nodeList.length; i++) {
            disableNode(nodeList[i], state)
        }
    }
    if (state) node.setAttribute("disabled", "true")
    else node.removeAttribute("disabled")
}

function showDialog(data) {
    const { dispatch } = useStoreon()
    if (typeof data.displayPage != "undefined") {
        if (data.displayPage) {
            const { activePage } = useStoreon("activePage")
            if (activePage == Page.none) dispatch("setPage", Page.dashboard)
        }
        dispatch("displayPage", data.displayPage)
    }
    if (typeof data.refreshPage != "undefined") {
        if (data.refreshPage) {
            dispatch("displayPage", false)
            dispatch("displayPage", true)
        }
    }
    dispatch("setDialog", data)
    if (typeof data.displayDialog != "undefined") {
        dispatch("displayDialog", data.showDialog)
    } else dispatch("displayDialog", true)
}

function updateProgress(data) {
    const { dispatch } = useStoreon()
    let { dialogData } = useStoreon("dialogData")
    //todo merge data
    dialogData.progress = data.progress
    dispatch("setDialog", dialogData)
}

function hideDialog() {
    const { dispatch } = useStoreon()
    dispatch("displayDialog", false)
}

/*
 * Dialog page
 *
 */
const DialogPage = () => {
    const { showDialog } = useStoreon("showDialog")
    const { dialogData } = useStoreon("dialogData")
    console.log(dialogData)
    if (!showDialog) {
        disableNode(document.getElementById("mainwindow"), false)
        return null
    }
    useEffect(() => {
        disableNode(document.getElementById("mainwindow"), true)
    })
    //console.log(dialogData)
    let classname = "modal d-block"
    let iconTitle, iconMsg
    let progressbar
    let title = dialogData.title
    if (
        dialogData.type == "error" ||
        (dialogData.type == "disconnect" && dialogData.numError)
    ) {
        iconTitle = <AlertTriangle color="red" />
        if (!dialogData.title) {
            title = T("S22")
        }
        if (!dialogData.button1text) {
            dialogData.button1text = T("S24")
        }
        if (dialogData.numError) {
            title += " (" + dialogData.numError + ")"
        }
    }
    if (dialogData.type == "loader") {
        iconMsg = <SpinLoader color="lightblue" />
    }
    if (dialogData.type == "progress") {
        progressbar = "width:" + dialogData.progress + "%"
    }
    if (
        dialogData.type == "message" ||
        (dialogData.type == "disconnect" && !dialogData.numError)
    ) {
        iconTitle = <Info color="blue" />
    }
    if (dialogData.type == "confirmation") {
        iconTitle = <Info color="blue" />
        if (!dialogData.button2text) dialogData.button2text = T("S28")
        classname += " greybg"
    }
    if (dialogData.type == "disconnect") classname += " greybg"
    return (
        <modal tabindex="-1" className={classname}>
            <div class="modal-dialog modal-dialog-centered ">
                <div class="modal-content">
                    <div class="modal-header">
                        <div>
                            {iconTitle} {title}
                        </div>
                    </div>
                    <div class="modal-body">
                        <div
                            class={
                                dialogData.type == "confirmation"
                                    ? "text-left"
                                    : "text-center"
                            }
                        >
                            {iconMsg}
                            <div
                                className={
                                    dialogData.type == "error"
                                        ? "d-none"
                                        : "d-block"
                                }
                            />
                            {dialogData.message}
                        </div>
                        <div
                            class={
                                dialogData.type == "progress"
                                    ? "progress d-block"
                                    : "d-none"
                            }
                        >
                            <div
                                class="progress-bar"
                                role="progressbar"
                                style={progressbar}
                                aria-valuenow={dialogData.progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            >
                                {dialogData.progress}%
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        {dialogData.footer}
                        <button
                            type="button"
                            className={
                                dialogData.type == "disconnect"
                                    ? "btn btn-primary d-block"
                                    : "d-none"
                            }
                            onClick={initApp}
                        >
                            {dialogData.button1text}
                        </button>
                        <button
                            type="button"
                            id="but1"
                            className={
                                dialogData.type == "error" ||
                                dialogData.type == "progress"
                                    ? "btn btn-danger d-block"
                                    : dialogData.type == "confirmation" ||
                                      (dialogData.type == "message" &&
                                          dialogData.button1text)
                                    ? "btn btn-secondary d-block"
                                    : "d-none"
                            }
                            onClick={() => {
                                if (dialogData.next) dialogData.next()
                                else hideDialog()
                            }}
                            focus
                        >
                            {dialogData.button1text}
                        </button>
                        <button
                            type="button"
                            id="but2"
                            className={
                                dialogData.type == "confirmation"
                                    ? "btn btn-primary d-block"
                                    : dialogData.type == "message" &&
                                      dialogData.button2text
                                    ? "btn btn-primary d-block"
                                    : "d-none"
                            }
                            onClick={() => {
                                if (dialogData.next2) dialogData.next2()
                                else hideDialog()
                            }}
                        >
                            {dialogData.button2text}
                        </button>
                    </div>
                </div>
            </div>
        </modal>
    )
}

export { showDialog, updateProgress, DialogPage }
