/*
 extracontent.js - ESP3D WebUI navigation page file

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
import { Fragment, h } from "preact"
import { useRef, useEffect, useState } from "preact/hooks"
import { espHttpURL } from "../Helpers"
import { useUiContextFn } from "../../contexts"
import { useHttpFn } from "../../hooks"
import { Play, Pause, Aperture, RefreshCcw } from "preact-feather"
import { ButtonImg } from "../Controls"
import { T } from "../Translations"
import { iconsFeather } from "../Images"
import { iconsTarget } from "../../targets"

const contentCache = {}
const refreshPausedList = {}
const timerIDs = {}

const ExtraContent = ({
    id,
    source,
    refreshtime,
    label,
    type,
    target,
    icon,
}) => {
    const { createNewRequest } = useHttpFn
    const panels = useUiContextFn.panels
    const [refreshPaused, setRefreshPaused] = useState(refreshPausedList[id])
    const element = useRef(null)
    const imageCache = useRef(null)
    const pageSource = type == "camera" ? "/snap" : source
    const iconsList = { ...iconsTarget, ...iconsFeather }
    const loadContent = (init = false) => {
        if (!init && refreshPausedList[id]) {
            return
        }
        if (pageSource.startsWith("http")) {
            switch (type) {
                case "image":
                    if (element.current) element.current.src = pageSource
                    break
                default:
                    if (element.current) element.current.src = pageSource
            }
        } else {
            if (
                (type == "image" || type == "extension") &&
                contentCache[id] != undefined
            ) {
                element.current.classList.remove("d-block")
                element.current.classList.add("d-none")
                element.current.onload = () => {
                    URL.revokeObjectURL(element.current.src)
                    if (type == "extension") {
                        const doc = element.current.contentWindow.document
                        const body = doc.querySelector("body")
                        body.classList.add("body-extension")
                        const css = document.querySelectorAll("style")
                        //inject css
                        css.forEach((csstag) => {
                            doc.head.appendChild(csstag.cloneNode(true))
                        }) //to avoid the flickering when apply css
                    }
                    element.current.classList.remove("d-none")
                    element.current.classList.add("d-block")
                }
                element.current.src = URL.createObjectURL(contentCache[id])
            } else {
                const idquery = type == "content" ? type + id : "download" + id
                createNewRequest(
                    espHttpURL(pageSource),
                    { method: "GET", id: idquery, max: 2 },
                    {
                        onSuccess: (result) => {
                            switch (type) {
                                case "camera":
                                case "image":
                                    if (element.current) {
                                        imageCache.current = result
                                        element.current.onload = () => {
                                            URL.revokeObjectURL(
                                                element.current.src
                                            )
                                        }
                                        contentCache[id] = result
                                        element.current.src =
                                            URL.createObjectURL(
                                                contentCache[id]
                                            )
                                    }
                                    break
                                //cannot be used because this way disable javascript in iframe
                                case "extension":
                                    element.current.onload = () => {
                                        URL.revokeObjectURL(element.current.src)
                                        const doc =
                                            element.current.contentWindow
                                                .document
                                        const body = doc.querySelector("body")
                                        body.classList.add("body-extension")
                                        const css =
                                            document.querySelectorAll("style")
                                        //inject css
                                        css.forEach((csstag) => {
                                            doc.head.appendChild(
                                                csstag.cloneNode(true)
                                            )
                                        })
                                        //to avoid the flickering when apply css
                                        element.current.classList.remove(
                                            "d-none"
                                        )
                                        element.current.classList.add("d-block")
                                    }
                                    contentCache[id] = result
                                    element.current.src = URL.createObjectURL(
                                        contentCache[id]
                                    )
                                    //todo inject css
                                    break
                                default:
                                    if (
                                        element.current &&
                                        element.current.contentWindow
                                    )
                                        element.current.contentWindow.document.body.innerHTML =
                                            result
                            }
                        },
                        onFail: (error) => {
                            //TODO:Need to do something ? TBD
                            console.log("Error", error)
                        },
                    }
                )
            }
        }
    }
    const ControlButtons = () => {
        return (
            <Fragment>
                {parseInt(refreshtime) == 0 && target == "page" && (
                    <div class="m-2 image-button-bar">
                        <ButtonImg
                            m1
                            icon={<RefreshCcw size="0.8rem" />}
                            onclick={() => {
                                loadContent()
                            }}
                        />
                    </div>
                )}
                {parseInt(refreshtime) > 0 && type != "extension" && (
                    <div class="m-2 image-button-bar">
                        <ButtonImg
                            m1
                            tooltip
                            data-tooltip={refreshPaused ? T("S185") : T("S184")}
                            icon={refreshPaused ? <Play /> : <Pause />}
                            onclick={() => {
                                useUiContextFn.haptic()
                                setRefreshPaused(!refreshPaused)
                                refreshPausedList[id] = !refreshPaused
                            }}
                        />
                        {type != "content" && (
                            <ButtonImg
                                m1
                                tooltip
                                data-tooltip={T("S186")}
                                icon={<Aperture />}
                                onclick={() => {
                                    useUiContextFn.haptic()
                                    const typeImage =
                                        type == "camera"
                                            ? "image/jpeg"
                                            : imageCache.current.type
                                    const filename =
                                        "snap." + typeImage.split("/")[1]
                                    const file = new Blob(
                                        [imageCache.current],
                                        {
                                            type: typeImage,
                                        }
                                    )
                                    if (window.navigator.msSaveOrOpenBlob)
                                        // IE10+
                                        window.navigator.msSaveOrOpenBlob(
                                            file,
                                            filename
                                        )
                                    else {
                                        // Others
                                        const a = document.createElement("a")
                                        const url = URL.createObjectURL(file)
                                        a.href = url
                                        a.download = filename
                                        a.onload = () => {
                                            URL.revokeObjectURL(a.href)
                                        }
                                        document.body.appendChild(a)
                                        a.click()
                                        setTimeout(function () {
                                            document.body.removeChild(a)
                                            window.URL.revokeObjectURL(url)
                                        }, 0)
                                    }
                                }}
                            />
                        )}
                    </div>
                )}
            </Fragment>
        )
    }

    const MainContent = () => {
        switch (type) {
            case "camera":
                return (
                    <img
                        class="mt-2"
                        ref={element}
                        id={"page_content_" + id}
                        src={pageSource.startsWith("http") ? pageSource : ""}
                        alt={label}
                    />
                )
            case "image":
                return (
                    <img
                        class="mt-2"
                        ref={element}
                        id={"page_content_" + id}
                        src={pageSource.startsWith("http") ? pageSource : ""}
                        alt={label}
                    />
                )
            default:
                return (
                    <iframe
                        style="z-index:0!important"
                        class={
                            type == "extension"
                                ? "extensionContainer d-none"
                                : "content-container d-block"
                        }
                        ref={element}
                        id={"page_content_" + id}
                        src={pageSource.startsWith("http") ? pageSource : ""}
                        alt={label}
                    ></iframe>
                )
        }
    }

    useEffect(() => {
        //load using internal http manager
        if (!pageSource.startsWith("http")) loadContent(true)
        //init timer if any

        if (refreshtime != 0 && type != "extension") {
            clearInterval(timerIDs[id])
            timerIDs[id] = setInterval(loadContent, refreshtime)
        }

        return () => {
            //cleanup
            if (refreshtime != 0 && type != "extension") {
                clearInterval(timerIDs[id])
            }
        }
    })
    if (target == "page")
        return (
            <Fragment>
                <MainContent />
                <ControlButtons />
            </Fragment>
        )
    if (target == "panel") {
        const displayIcon = iconsList[icon] ? iconsList[icon] : ""
        return (
            <div class="panel panel-dashboard">
                <div class="navbar">
                    <span class="navbar-section  feather-icon-container">
                        {displayIcon}
                        <strong class="text-ellipsis">{T(label)}</strong>
                    </span>
                    <span class="navbar-section">
                        {refreshtime == 0 && (
                            <ButtonImg
                                xs
                                m1
                                nomin="yes"
                                icon={<RefreshCcw size="0.8rem" />}
                                onclick={() => {
                                    useUiContextFn.haptic()
                                    if (contentCache[id])
                                        contentCache[id] = undefined
                                    loadContent()
                                }}
                            />
                        )}
                        <span style="height: 100%;">
                            <button
                                class="btn btn-clear btn-close m-1"
                                aria-label="Close"
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    panels.hide(id)
                                    clearInterval(timerIDs[id])
                                }}
                            />
                        </span>
                    </span>
                </div>
                <div
                    class="panel-body panel-body-dashboard"
                    style="margin:0px 0px; padding: 0px 0px"
                >
                    <MainContent />
                </div>
                {parseInt(refreshtime) > 0 && type != "extension" && (
                    <div class="panel-footer">
                        <ControlButtons />
                    </div>
                )}
            </div>
        )
    }
}

export default ExtraContent
