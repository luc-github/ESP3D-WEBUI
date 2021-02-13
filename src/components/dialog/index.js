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
    console.log("Go login");
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
    let classname = "modal d-block"
    let iconTitle = dialogData.icontitle
    let iconMsg
    let progressbar
    let title = dialogData.title
    let btn1Txt = dialogData.button1text
    let btn2Txt = dialogData.button2text
    let btn3Txt = dialogData.button3text
    let btn1Fn = dialogData.next1
    let btn2Fn = dialogData.next2
    let btn3Fn = dialogData.next3
    let btn1Col = dialogData.button1color
    let btn2Col = dialogData.button2color
    let btn3Col = dialogData.button3color
    let dialogmsg = dialogData.message
    let progress = dialogData.progress
    let messageclass = "text-center"

    switch (dialogData.type) {
        case "confirmation":
            if (!iconTitle) iconTitle = <HelpCircle color="blue" />
            if (!btn2Txt) btn2Txt = T("S28")
            classname += " greybg"
            messageclass = "text-left"
            if (!btn1Col) btn1Col = "btn-secondary"
            break
        case "custom":
            if (dialogData.background == "grey") classname += " greybg"
            break
        case "disconnect":
            if (!btn1Fn) btn1Fn = reloadPage
            classname += " greybg"
            if (dialogData.numError) {
                iconTitle = <AlertTriangle color="red" />
                beepError()
                if (!title) title = T("S22")
                if (!btn1Txt) btn1Txt = T("S24")
                if (!btn1Col) btn1Col = "btn-primary"
                if (dialogData.numError) {
                    title += " (" + dialogData.numError + ")"
                }
            } else {
                if (!iconTitle) iconTitle = <Info color="blue" />
            }
            break
        case "error":
            if (!btn1Col) btn1Col = "btn-danger"
            if (!iconTitle) iconTitle = <AlertTriangle color="red" />
            beepError()
            if (!title) title = T("S22")
            if (!btn1Txt) btn1Txt = T("S24")
            if (dialogData.numError) {
                title += " (" + dialogData.numError + ")"
            }
            break
        case "loader":
            if (!iconMsg) iconMsg = <SpinLoader color="lightblue" />
            break
        case "login":
            classname += " greybg"
            if (!title) {
                title = T("S145")
            }
            dialogmsg = (
                <div>
                    <LoginEntry />
                    <div class="p-1" />
                    <PasswordEntry />
                </div>
            )
            btn1Txt = T("S148")
            if (!btn1Col) btn1Col = "btn-secondary"
            btn2Txt = T("S28")
            btn1Fn= goLogIn
            btn2Fn= disconnectPage
            break
        case "message":
            if (!iconTitle) iconTitle = <Info color="blue" />
            if (!btn1Col) btn1Col = "btn-secondary"
            break
        case "notification":
            if (!btn1Txt) btn1Txt = T("S24")
            if (!title) title = T("S123")
            if (!btn1Col) btn1Col = "btn-danger"
            if (!iconTitle) iconTitle = <Info color="blue" />
            break
        case "progress":
            if (!btn1Col) btn1Col = "btn-danger"
            if (!iconTitle) iconTitle = <Info color="blue" />
            progressbar = (
                <div class="progress">
                    <div
                        class="progress-bar"
                        role="progressbar"
                        style={"width:" + dialogData.progress + "%"}
                        aria-valuenow={dialogData.progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                        {dialogData.progress}%
                    </div>
                </div>
            )
            break
        default:
            console.log("Unknow dialog type")
            return null
    }
    if (!btn1Fn) btn1Fn = hideDialog
    if (!btn2Fn) btn2Fn = hideDialog
    if (!btn3Fn) btn3Fn = hideDialog
    if (!btn1Col) btn1Col = "btn-primary"
    if (!btn2Col) btn2Col = "btn-primary"
    if (!btn3Col) btn3Col = "btn-danger"
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
                        <div class={messageclass}>
                            {iconMsg}
                            <br />
                            {dialogmsg}
                        </div>
                        {progressbar}
                    </div>
                    <div class="modal-footer">
                        {dialogData.footer}
                        <button
                            id="but1"
                            type="button"
                            className={btn1Txt ? "btn " + btn1Col : "d-none"}
                            onClick={btn1Fn}
                            focus
                        >
                            {btn1Txt}
                        </button>
                        <button
                            id="but2"
                            type="button"
                            className={btn2Txt ? "btn " + btn2Col : "d-none"}
                            onClick={btn2Fn}
                        >
                            {btn2Txt}
                        </button>
                        <button
                            id="but3"
                            type="button"
                            className={btn3Txt ? "btn " + btn3Col : "d-none"}
                            onClick={btn3Fn}
                        >
                            {btn3Txt}
                        </button>
                    </div>
                </div>
            </div>
        </modal>
    )
}

export { showDialog, updateProgress, DialogPage, ProgressionDisconnectBar }
