/*
 logginModal.js - ESP3D WebUI component file

 Copyright (c) 2021 Luc LEBOSSE. All rights reserved.
 
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
import { useRef } from "preact/hooks"
import { Lock } from "preact-feather"
import { Field } from "../Controls"
import { useUiContext, useUiContextFn } from "../../contexts"
import { useHttpQueue } from "../../hooks"
import { T } from "../../components/Translations"
import { espHttpURL } from "../../components/Helpers"

/*
 * Local const
 *
 */
const showLogin = () => {
    const { modals, connection } = useUiContext()
    const { createNewTopRequest, processRequestsNow } = useHttpQueue()
    const id = "login"
    const loginValue = useRef("")
    const passwordValue = useRef("")
    const setLogin = (val) => {
        loginValue.current = val ? val.trim() : ""
    }
    const setPassword = (val) => {
        passwordValue.current = val ? val.trim() : ""
    }
    const clickLogin = () => {
        console.log("login", loginValue.current, passwordValue.current)
        useUiContextFn.haptic()
        const formData = new FormData()
        formData.append("SUBMIT", "YES")
        formData.append("USER", loginValue.current)
        formData.append("PASSWORD", passwordValue.current)
        createNewTopRequest(
            espHttpURL("login"),
            { method: "POST", id: id, body: formData },
            {
                onSuccess: (result) => {
                    window.location.reload()
                },
                onFail: (error) => {
                    //TODO:Need to do something ? TBD
                },
            }
        )
        passwordValue.current = ""
        connection.setConnectionState({
            connected: connection.connectionState.connected,
            authenticate: false,
            page: "connecting",
        })
        modals.removeModal(modals.getModalIndex(id))
        processRequestsNow()
    }
    const clickCancel = () => {
        useUiContextFn.haptic()
        modals.removeModal(modals.getModalIndex(id))
    }
    if (modals.getModalIndex(id) == -1)
        modals.addModal({
            id: id,
            title: (
                <div
                    class="text-primary feather-icon-container"
                    style="line-height:24px!important"
                >
                    <Lock />
                    <label>{T("S145")}</label>
                </div>
            ),
            content: (
                <div class="form-horizontal">
                    <Field
                        type="text"
                        id="login"
                        value={loginValue.current}
                        label={T("S146")}
                        style="width:15rem"
                        setValue={setLogin}
                        inline
                        onkeydown={(e) => {
                            if (
                                e.keyCode === 13 &&
                                document.getElementById("password")
                            ) {
                                document.getElementById("password").focus()
                            }
                        }}
                    />
                    <Field
                        type="password"
                        label={T("S147")}
                        id="password"
                        value={passwordValue.current}
                        style="width:15rem"
                        setValue={setPassword}
                        inline
                        onkeydown={(e) => {
                            if (
                                e.keyCode === 13 &&
                                document.getElementById("loginbtn")
                            ) {
                                document.getElementById("loginbtn").click()
                            }
                        }}
                    />
                    {loginValue.current && loginValue.current.length > 0 && (
                        <div class="error-login-message">{T("S201")}</div>
                    )}
                </div>
            ),
            footer: (
                <div>
                    <button id="loginbtn" class="btn mx-2" onClick={clickLogin}>
                        {T("S148")}
                    </button>
                    <button class="btn mx-2" onClick={clickCancel}>
                        {T("S28")}
                    </button>
                </div>
            ),
            //overlay: true,
            hideclose: true,
        })
}

export { showLogin }
