/*
 Toast.js - ESP3D WebUI component file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 
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
import { useUiContext,useUiContextFn } from "../../contexts"
import { Toast as SpectreToast } from "../Controls"
import { T } from "../Translations"
import { CheckCircle, XCircle, AlertTriangle, Info } from "preact-feather"

const toastIcons = {
    success: <CheckCircle size="16" />,
    error: <XCircle size="16" />,
    warning: <AlertTriangle size="16" />,
    primary: <Info size="16" />,
    notification: <Info size="16" />,
}

/*
 * Local const
 *
 */
const Toast = ({ index, type = "", children, timeout = 2000, remove }) => {
    useEffect(() => {
        let timer
        if (timeout) {
            timer = setTimeout(() => {
                remove(index)
            }, timeout)
            return () => clearTimeout(timer)
        }
    }, [])

    const icon = toastIcons[type]

    return (
        <SpectreToast {...{ [type]: true }}>
            {icon && <div class="alert-icon-wrap">{icon}</div>}
            <span class="toast-text">{children}</span>
            <SpectreToast.Close
                onClick={() => {
                    useUiContextFn.haptic()
                    remove(index)
                }}
            />
        </SpectreToast>
    )
}

const ToastsContainer = () => {
    const { toasts } = useUiContext()
    return (
        toasts.toastList && (
            <div class="toasts-container" >
                {toasts.toastList.map((toast) => {
                    const { id, type, content } = toast
                    return (
                        <Toast
                            remove={toasts.removeToast}
                            index={id}
                            type={type}
                            key={id}
                        >
                            {content && typeof content === "object" && content.title ? (
                                <div class="alert-body">
                                    <div class="alert-title">{content.title}</div>
                                    {content.extra && <div class="alert-msg">{content.extra}</div>}
                                </div>
                            ) : typeof content === "object" ? content : T(content)}
                        </Toast>
                    )
                })}
            </div>
        )
    )
}

export { ToastsContainer }
