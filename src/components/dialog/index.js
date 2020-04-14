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
import { initApp } from "../uisettings"
import { globaldispatch, Action } from "../app"
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
 * Dialog page
 *
 */
export const DialogPage = ({ currentState }) => {
    if (!currentState.showDialog) {
        disableNode(document.getElementById("mainwindow"), false)
        return null
    }

    useEffect(() => {
        if (currentState.data.type == "confirmation")
            document.getElementById("but2").focus()
        disableNode(document.getElementById("mainwindow"), true)
    })
    let classname = "modal d-block"
    let iconTitle, iconMsg
    let progressbar
    let title = currentState.data.title
    if (
        currentState.data.type == "error" ||
        currentState.data.type == "error-blocking" ||
        (currentState.data.type == "disconnect" && currentState.error)
    ) {
        iconTitle = <AlertTriangle color="red" />
        if (!currentState.data.title) {
            title = T("S22")
        }
        if (!currentState.data.button1text) {
            currentState.data.button1text = T("S24")
        }
        if (currentState.error) {
            title += " (" + currentState.error + ")"
        }
    }
    if (currentState.data.type == "loader") {
        iconMsg = <SpinLoader color="lightblue" />
    }
    if (currentState.data.type == "progress") {
        progressbar = "width:" + currentState.data.progress + "%"
    }
    if (
        currentState.data.type == "message" ||
        (currentState.data.type == "disconnect" && !currentState.error)
    ) {
        iconTitle = <Info color="blue" />
    }
    if (currentState.data.type == "confirmation") {
        iconTitle = <Info color="blue" />
        if (!currentState.data.button2text)
            currentState.data.button2text = T("S28")
        classname += " greybg"
    }
    if (currentState.data.type == "disconnect") classname += " greybg"
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
                                currentState.data.type == "confirmation"
                                    ? "text-left"
                                    : "text-center"
                            }
                        >
                            {iconMsg}
                            <div
                                className={
                                    currentState.data.type == "error"
                                        ? "d-none"
                                        : "d-block"
                                }
                            />
                            {currentState.data.message}
                        </div>
                        <div
                            class={
                                currentState.data.type == "progress"
                                    ? "progress d-block"
                                    : "d-none"
                            }
                        >
                            <div
                                class="progress-bar"
                                role="progressbar"
                                style={progressbar}
                                aria-valuenow={currentState.data.progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            >
                                {currentState.data.progress}%
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        {currentState.data.footer}
                        <button
                            type="button"
                            className={
                                currentState.data.type == "disconnect"
                                    ? "btn btn-primary d-block"
                                    : "d-none"
                            }
                            onClick={initApp}
                        >
                            {currentState.data.button1text}
                        </button>
                        <button
                            type="button"
                            id="but1"
                            className={
                                currentState.data.type == "error" ||
                                currentState.data.type == "progress"
                                    ? "btn btn-danger d-block"
                                    : currentState.data.type ==
                                          "confirmation" ||
                                      (currentState.data.type == "message" &&
                                          currentState.data.button1text)
                                    ? "btn btn-secondary d-block"
                                    : "d-none"
                            }
                            onClick={() => {
                                console.log("close")
                                if (currentState.data.next)
                                    currentState.data.next()
                                else
                                    globaldispatch({
                                        type: Action.renderAll,
                                    })
                            }}
                            focus
                        >
                            {currentState.data.button1text}
                        </button>
                        <button
                            type="button"
                            id="but2"
                            className={
                                currentState.data.type == "confirmation"
                                    ? "btn btn-warning d-block"
                                    : currentState.data.type == "message" &&
                                      currentState.data.button2text
                                    ? "btn btn-primary d-block"
                                    : "d-none"
                            }
                            onClick={() => {
                                console.log("close")
                                if (currentState.data.next2)
                                    currentState.data.next2()
                                else
                                    globaldispatch({
                                        type: Action.renderAll,
                                    })
                            }}
                        >
                            {currentState.data.button2text}
                        </button>
                    </div>
                </div>
            </div>
        </modal>
    )
}
