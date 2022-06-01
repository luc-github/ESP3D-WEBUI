/*
 about.js - ESP3D WebUI navigation page file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.
 Original code inspiration : 2021 Alexandre Aussourd
 
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
import { useEffect, useState, useRef } from "preact/hooks"
import {
    ButtonImg,
    Loading,
    CenterLeft,
    Progress,
} from "../../components/Controls"
import { useHttpQueue } from "../../hooks"
import { espHttpURL } from "../../components/Helpers"
import { T } from "../../components/Translations"
import {
    useUiContext,
    useUiContextFn,
    useWsContext,
    useSettingsContext,
} from "../../contexts"
import { Esp3dVersion } from "../../components/App/version"
import { Github, RefreshCcw, UploadCloud, LifeBuoy, Info } from "preact-feather"
import { webUiUrl, fwUrl, Name, restartdelay } from "../../targets"
import {
    showConfirmationModal,
    showProgressModal,
} from "../../components/Modal"
let about = []

/*
 * Local const
 *
 */
const CustomEntry = () => {
    const { interfaceSettings } = useSettingsContext()
    let HelpEntry
    let InfoEntry
    if (
        interfaceSettings.current.custom &&
        (interfaceSettings.current.custom.help ||
            interfaceSettings.current.custom.information)
    ) {
        if (interfaceSettings.current.custom.help) {
            const onClickHelp = (e) => {
                useUiContextFn.haptic()
                window.open(interfaceSettings.current.custom.help, "_blank")
                e.target.blur()
            }
            HelpEntry = (
                <ButtonImg
                    mx2
                    icon={<LifeBuoy />}
                    label={T("S72")}
                    onClick={onClickHelp}
                />
            )
        }
        if (interfaceSettings.current.custom.information) {
            const onClickInfo = (e) => {
                useUiContextFn.haptic()
                window.open(
                    sinterfaceSettings.current.custom.information,
                    "_blank"
                )
                e.target.blur()
            }
            InfoEntry = (
                <ButtonImg
                    mx2
                    icon={<Info />}
                    label={T("S123")}
                    onClick={onClickInfo}
                />
            )
        }
        return (
            <li class="feather-icon-container">
                {HelpEntry} {InfoEntry}
            </li>
        )
    }
}

const About = () => {
    console.log("about")
    const { toasts, modals, uisettings } = useUiContext()
    const { Disconnect } = useWsContext()
    const { createNewRequest, abortRequest } = useHttpQueue()
    const { interfaceSettings } = useSettingsContext()
    const [isLoading, setIsLoading] = useState(true)
    const progressBar = {}
    const [props, setProps] = useState([...about])
    const [isFwUpdate, setIsFwUpdate] = useState(false)
    const inputFilesRef = useRef(0)
    const getProps = () => {
        setIsLoading(true)
        createNewRequest(
            espHttpURL("command", { cmd: "[ESP420]json=yes" }),
            { method: "GET" },
            {
                onSuccess: (result) => {
                    const jsonResult = JSON.parse(result)
                    if (
                        jsonResult.cmd != 420 ||
                        jsonResult.status == "error" ||
                        !jsonResult.data
                    ) {
                        toasts.addToast({ content: T("S194"), type: "error" })
                        setIsLoading(false)
                        return
                    }
                    setProps([...jsonResult.data])
                    about = [...jsonResult.data]
                    setIsLoading(false)
                },
                onFail: (error) => {
                    setIsLoading(false)
                    toasts.addToast({ content: error, type: "error" })
                    console.log(error)
                },
            }
        )
    }
    //from https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
    function getBrowserInformation() {
        var ua = navigator.userAgent,
            tem,
            M =
                ua.match(
                    /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
                ) || []
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || []
            return "IE " + (tem[1] || "")
        }
        if (M[1] === "Chrome") {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/)
            if (tem != null)
                return tem.slice(1).join(" ").replace("OPR", "Opera")
        }
        M = M[2]
            ? [M[1], M[2]]
            : [navigator.appName, navigator.appVersion, "-?"]
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1])
        return M.join(" ")
    }

    const onFWUpdate = (e) => {
        useUiContextFn.haptic()
        e.target.blur()
        setIsFwUpdate(true)
        inputFilesRef.current.value = ""
        inputFilesRef.current.accept = ".bin, .bin.gz"
        inputFilesRef.current.multiple = false
        inputFilesRef.current.click()
    }
    const onFWGit = (e) => {
        useUiContextFn.haptic()
        window.open(
            interfaceSettings.current.custom &&
                interfaceSettings.current.custom.fwurl
                ? interfaceSettings.current.custom.fwurl
                : fwUrl,
            "_blank"
        )
        e.target.blur()
    }
    const onWebUiUpdate = (e) => {
        useUiContextFn.haptic()
        e.target.blur()
        setIsFwUpdate(false)
        inputFilesRef.current.value = ""
        inputFilesRef.current.accept = "*"
        inputFilesRef.current.multiple = true
        inputFilesRef.current.click()
    }
    const onWebUiGit = (e) => {
        useUiContextFn.haptic()
        window.open(webUiUrl, "_blank")
        e.target.blur()
    }

    const uploadFiles = (e) => {
        const list = inputFilesRef.current.files
        const formData = new FormData()
        formData.append("path", "/")
        if (list.length > 0) {
            for (let i = 0; i < list.length; i++) {
                const file = list[i]
                const arg = "/" + file.name + "S"
                //append file size first to check updload is complete
                formData.append(arg, file.size)
                formData.append("myfiles", file, "/" + file.name)
            }
        }
        showProgressModal({
            modals,
            title: T("S32"),
            button1: { cb: abortRequest, text: T("S28") },
            content: <Progress progressBar={progressBar} max="100" />,
        })
        createNewRequest(
            isFwUpdate ? espHttpURL("updatefw") : espHttpURL("files"),
            { method: "POST", id: "upload", body: formData },
            {
                onSuccess: (result) => {
                    if (progressBar.update) progressBar.update(100)
                    modals.removeModal(modals.getModalIndex("upload"))
                    Disconnect(isFwUpdate ? "restart" : "connecting")
                    if (isFwUpdate) {
                        setTimeout(() => {
                            window.location.reload()
                        }, restartdelay * 1000)
                    } else window.location.reload()
                },
                onFail: (error) => {
                    modals.removeModal(modals.getModalIndex("upload"))
                    toasts.addToast({ content: error, type: "error" })
                },
                onProgress: (e) => {
                    progressBar.update(e)
                },
            }
        )
    }

    const filesSelected = (e) => {
        if (inputFilesRef.current.files.length > 0) {
            const titleConfirmation = isFwUpdate ? T("S30") : T("S31")
            const list = [...inputFilesRef.current.files]
            const content = (
                <CenterLeft>
                    <ul>
                        {list.reduce((accumulator, currentElement) => {
                            return [
                                ...accumulator,
                                <li>{currentElement.name}</li>,
                            ]
                        }, [])}
                    </ul>
                </CenterLeft>
            )
            showConfirmationModal({
                modals,
                title: titleConfirmation,
                content,
                button1: {
                    cb: () => {
                        uploadFiles()
                    },
                    text: T("S27"),
                },
                button2: {
                    text: T("S28"),
                },
            })
        }
    }

    useEffect(() => {
        if (about.length != 0) {
            setProps([...about])
            setIsLoading(false)
        } else {
            if (uisettings.getValue("autoload")) getProps()
            else setIsLoading(false)
        }
    }, [])

    return (
        <div id="about" class="container">
            <input
                ref={inputFilesRef}
                type="file"
                class="d-none"
                onChange={filesSelected}
            />
            <h4>
                {T("S12").replace(
                    "%s",
                    interfaceSettings.current &&
                        interfaceSettings.current.custom &&
                        interfaceSettings.current.custom.name
                        ? interfaceSettings.current.custom.name
                        : Name
                )}
            </h4>
            {isLoading && <Loading />}

            {!isLoading && props && (
                <div>
                    <hr />
                    <CenterLeft>
                        <ul>
                            <li>
                                <span class="text-primary">{T("S150")}: </span>
                                <span class="text-dark">
                                    <Esp3dVersion />
                                </span>
                                <ButtonImg
                                    sm
                                    mx2
                                    tooltip
                                    data-tooltip={T("S20")}
                                    icon={<Github />}
                                    onClick={onWebUiGit}
                                />
                                <ButtonImg
                                    sm
                                    mx2
                                    tooltip
                                    data-tooltip={T("S171")}
                                    icon={<UploadCloud />}
                                    label={T("S25")}
                                    onClick={onWebUiUpdate}
                                />
                            </li>
                            <li>
                                <span class="text-primary">
                                    {T("FW ver")}:{" "}
                                </span>
                                <span class="text-dark">
                                    {props.find(
                                        (element) => element.id == "FW ver"
                                    ) &&
                                        props.find(
                                            (element) => element.id == "FW ver"
                                        ).value}
                                </span>
                                <ButtonImg
                                    sm
                                    mx2
                                    tooltip
                                    data-tooltip={T("S20")}
                                    icon={<Github />}
                                    onClick={onFWGit}
                                />
                                <ButtonImg
                                    sm
                                    mx2
                                    tooltip
                                    data-tooltip={T("S172")}
                                    icon={<UploadCloud />}
                                    label={T("S25")}
                                    onClick={onFWUpdate}
                                />
                            </li>
                            <CustomEntry />
                            <li>
                                <span class="text-primary">{T("S18")}: </span>
                                <span class="text-dark">
                                    {getBrowserInformation()}
                                </span>
                            </li>
                            {props.map(({ id, value }) => {
                                if (id != "FW ver")
                                    return (
                                        <li>
                                            <span class="text-primary">
                                                {T(id)}:{" "}
                                            </span>
                                            <span class="text-dark">
                                                {T(value)}
                                            </span>
                                        </li>
                                    )
                            })}
                        </ul>
                    </CenterLeft>
                    <hr />
                    <center>
                        <ButtonImg
                            icon={<RefreshCcw />}
                            label={T("S50")}
                            tooltip
                            data-tooltip={T("S23")}
                            onClick={() => {
                                useUiContextFn.haptic()
                                getProps()
                            }}
                        />
                    </center>
                </div>
            )}
            <br />
        </div>
    )
}

export default About
