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
import { useState, useEffect } from "preact/hooks"
import { AlertTriangle, Info, HelpCircle, Eye, EyeOff } from "preact-feather"
import { T } from "../translations"
import { useStoreon } from "storeon/preact"
import { Page, reloadPage, beepError, disconnectPage } from "../app"
import { SubmitCredentials } from "../http"

/*
 * Local variables
 *
 */
let loginvalue = ""
let passwordvalue = ""
let timeouthandle

/*
 * Some constants
 */

/*
 * Login function
 *
 */
function goLogIn() {
    hideDialog()
    SubmitCredentials(loginvalue, passwordvalue)
    passwordvalue = ""
}

/*
 * Login entry
 *
 */
const LoginEntry = () => {
    const onInput = e => {
        loginvalue = e.target.value
    }
    const onKeyUp = e => {
        if (e.keyCode == 13) {
            document.getElementById("passwordInput").focus()
        }
    }
    return (
        <div class="input-group">
            <label class="p-1 align-middle">{T("S146")}:</label>
            <input
                class="form-control"
                style="width:8em"
                type="text"
                value={loginvalue}
                placeholder={T("S41")}
                onInput={onInput}
                onkeyup={onKeyUp}
            />
        </div>
    )
}

/*
 * Login entry
 *
 */
const PasswordEntry = () => {
    const [isvisible, setVisible] = useState(false)
    const onInput = e => {
        passwordvalue = e.target.value
    }
    const onToggle = e => {
        setVisible(!isvisible)
        showDialog({ displayDialog: false })
        showDialog({ type: "login" })
    }
    const onKeyUp = e => {
        if (e.keyCode == 13) {
            goLogIn()
        }
    }
    return (
        <div class="input-group">
            <label class="p-1 align-middle">{T("S147")}:</label>
            <input
                id="passwordInput"
                class="form-control"
                type={isvisible ? "text" : "password"}
                style="width:8em"
                value={passwordvalue}
                placeholder={T("S41")}
                onInput={onInput}
                onkeyup={onKeyUp}
            />
            <div class="input-group-append ">
                <button
                    class={
                        isvisible
                            ? "d-none"
                            : "btn btn-light form-control border rounded-right"
                    }
                    onclick={onToggle}
                >
                    <Eye size="1.0em" />
                </button>
                <button
                    class={
                        isvisible
                            ? "btn btn-light form-control border rounded-right"
                            : "d-none"
                    }
                    onclick={onToggle}
                >
                    <EyeOff size="1.0em" />
                </button>
            </div>
        </div>
    )
}

/*
 * Progress bar with auto update between update
 *
 */
const ProgressionDisconnectBar = ({ remaining }) => {
    clearTimeout(timeouthandle)
    let remainValue = parseInt(remaining)
    function update() {
        if (document.getElementById("disconnectbar")) {
            timeouthandle = setTimeout(update, 250)
            remainValue -= 250
            document.getElementById("disconnectbar").style.width =
                100 * ((28000 - (remainValue - 2000)) / 28000) + "%"
            console.log("Now " + remainValue + "ms")
        }
    }
    useEffect(() => {
        setTimeout(update, 250)
    })
    return (
        <div class="progress">
            <div
                class="progress-bar bg-danger"
                id="disconnectbar"
                role="progressbar"
                style={
                    "width:" +
                    100 * ((28000 - (remaining - 2000)) / 28000) +
                    "%;"
                }
            ></div>
        </div>
    )
}

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

/*
 * showDialog function
 *
 */
function showDialog(data) {
    const { dispatch } = useStoreon()
    if (typeof dispatch == "undefined") {
        console.log("Dispatch is not found")
        return
    }
    if (typeof data.displayPage != "undefined") {
        if (data.displayPage) {
            const { activePage } = useStoreon("activePage")
            if (activePage == Page.none) dispatch("setPage", Page.notifications)
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

/*
 * Update dialog
 *
 */
function updateProgress(data) {
    const { dispatch } = useStoreon()
    let { dialogData } = useStoreon("dialogData")
    if (typeof data != "undefined" && typeof dialogData != "undefined") {
        dialogData.progress = data.progress
        dispatch("setDialog", dialogData)
    } else {
        console.log(
            "updateProgress failed: data:" +
                typeof data +
                " dialogdata:" +
                typeof dialogData
        )
    }
}

/*
 * Hide dialog
 *
 */
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
    if (!dialogData) return null
    console.log(dialogData)
    if (!showDialog) {
        disableNode(document.getElementById("mainwindow"), false)
        return null
    }
    useEffect(() => {
        disableNode(document.getElementById("mainwindow"), true)
    })
    console.log(dialogData)
    let classname = "modal d-block"
    let iconTitle, iconMsg
    let progressbar
    let title = dialogData.title
    if (dialogData.type == "notification") {
        if (!dialogData.button1text) {
            dialogData.button1text = T("S24")
        }
        if (!dialogData.title) {
            title = T("S123")
        }
    }
    if (dialogData.type == "login") {
        title = T("S145")
        classname += " greybg"
        dialogData.message = (
            <div>
                <LoginEntry />
                <div class="p-1" />
                <PasswordEntry />
            </div>
        )
        dialogData.button1text = T("S148")
        dialogData.button2text = T("S28")
        dialogData.next = goLogIn
        dialogData.next2 = disconnectPage
    }
    if (typeof dialogData.icontitle != "undefined")
        iconTitle = dialogData.icontitle
    if (
        typeof title != "undefined" &&
        typeof dialogData.icontitle == "undefined"
    )
        iconTitle = <Info color="blue" />
    if (
        dialogData.type == "error" ||
        (dialogData.type == "disconnect" && dialogData.numError)
    ) {
        iconTitle = <AlertTriangle color="red" />
        beepError()
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
        iconTitle = <HelpCircle color="blue" />
        if (!dialogData.button2text) dialogData.button2text = T("S28")
        classname += " greybg"
    }
    if (dialogData.type == "custom") {
        if (dialogData.background == "grey") classname += " greybg"
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
                                    dialogData.type == "error" ? "d-none" : ""
                                }
                            />
                            {dialogData.message}
                        </div>
                        <div
                            class={
                                dialogData.type == "progress"
                                    ? "progress"
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
                                    ? "btn btn-primary"
                                    : "d-none"
                            }
                            onClick={reloadPage}
                        >
                            {dialogData.button1text}
                        </button>
                        <button
                            type="button"
                            id="but1"
                            className={
                                dialogData.type == "notification" ||
                                dialogData.type == "error" ||
                                dialogData.type == "progress"
                                    ? "btn btn-danger"
                                    : dialogData.type == "login" ||
                                      dialogData.type == "confirmation" ||
                                      ((dialogData.type == "message" ||
                                          dialogData.type == "custom") &&
                                          dialogData.button1text)
                                    ? "btn btn-secondary"
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
                                    ? "btn btn-primary"
                                    : (dialogData.type == "login" ||
                                          dialogData.type == "message" ||
                                          dialogData.type == "custom") &&
                                      dialogData.button2text
                                    ? "btn btn-primary"
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

export { showDialog, updateProgress, DialogPage, ProgressionDisconnectBar }
