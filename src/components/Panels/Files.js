/*
Files.js - ESP3D WebUI component file

 Copyright (c) 2021 Luc LEBOSSE. All rights reserved.

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public
 License as published by the Free Software Foundation; either
 version 3 of the License, or (at your option) any later version.

 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.

 You should have received a copy of the GNU General Public
 License along with This code; if not, see <https://www.gnu.org/licenses/>.
*/

import { Fragment, h } from "preact"
import { useEffect, useState, useRef } from "preact/hooks"
import { T } from "../Translations"
import { useHttpFn } from "../../hooks"
import { espHttpURL } from "../Helpers"
import { Loading, ButtonImg } from "../Controls"
import { useUiContext, useUiContextFn } from "../../contexts"
import { showModal, showConfirmationModal } from "../Modal"
import {
    HardDrive,
    Upload,
    RefreshCcw,
    FolderPlus,
    CornerRightUp,
    Edit3,
    XCircle,
} from "preact-feather"
import { files, processor } from "../../targets"
import { Menu as PanelMenu, PanelShell } from "./"
import { createFilesTransfer } from "./filesTransfer"
import { FileLine } from "./FileLine"
import { getFileDropHandlers } from "./fileDrop"
import { FilesFooter } from "./FilesFooter"

//Module-level state: survives hide/show cycles so the panel keeps its
//filesystem, path and cached list when reopened
let currentFS = ""
const currentPath = {}
const filesListCache = {}
let currentFSNeedInit = true

/*
 * Local const
 *
 */
const FilesPanel = () => {
    const valids = files.supported.reduce((acc, element) => {
        if (element.depend)
            if (element.depend()) {
                acc.push(element.value)
            }
        return acc
    }, [])
    if (currentFS == "") {
        currentFS = useUiContextFn.getValue("default_filesystem")
        if (typeof currentFS === "undefined" || !valids.includes(currentFS))
            currentFS = ""
    }
    const id = "filesPanel"
    const [filePath, setFilePath] = useState(currentPath[currentFS])
    const [isLoading, setIsLoading] = useState(false)
    const [fileSystem, setFileSystem] = useState(currentFS)
    const [filesList, setFilesList] = useState(filesListCache[currentFS])
    const [menu, setMenu] = useState(null)
    const { createNewRequest, abortRequest } = useHttpFn
    const { modals, toasts } = useUiContext()
    const fileref = useRef()
    const dropRef = useRef()
    const progressBar = {}
    const onCancel = () => {
        useUiContextFn.haptic()
        processor.stopCatchResponse()
        setIsLoading(false)
        toasts.addToast({ content: T("S175"), type: "error" })
        filesListCache[currentFS] = { files: [], status: "S22" }
        setFilesList(filesListCache[currentFS])
    }

    const sendSerialCmd = (command) => {
        const cmds = command.split(";")
        cmds.forEach((cmd) => {
            createNewRequest(
                espHttpURL("command", { cmd: cmd }),
                { method: "GET", echo: cmd },
                {
                    onSuccess: (result) => {
                        //Result is handled on ws so just do nothing
                    },
                    onFail: (error) => {
                        console.log(error)
                        processor.stopCatchResponse()
                        setIsLoading(false)
                        toasts.addToast({ content: error, type: "error" })
                    },
                }
            )
        })
    }

    const sendURLCmd = (cmd) => {
        createNewRequest(
            espHttpURL(cmd.url, cmd.args),
            { method: "GET" },
            {
                onSuccess: (result) => {
                    filesListCache[currentFS] = files.command(
                        currentFS,
                        "formatResult",
                        result
                    )
                    setFilesList(filesListCache[currentFS])
                    setIsLoading(false)
                },
                onFail: (error) => {
                    console.log(error)
                    setIsLoading(false)
                    toasts.addToast({ content: error, type: "error" })
                },
            }
        )
    }

    const processFeedback = (feedback) => {
        if (feedback.status) {
            if (feedback.command == "list") {
                if (feedback.status == "error") {
                    console.log("got error")
                    toasts.addToast({
                        content: T("S4"),
                        type: "error",
                    })
                    filesListCache[currentFS] = { files: [], status: "S22" }
                    setFilesList(filesListCache[currentFS])
                } else {
                    filesListCache[currentFS] = files.command(
                        currentFS,
                        "formatResult",
                        feedback
                    )
                    //check if flatFS and filter if necessary
                    if (files.capability(currentFS, "IsFlatFS")) {
                        setFilesList(
                            files.command(
                                currentFS,
                                "filterResult",
                                filesListCache[currentFS],
                                currentPath[currentFS]
                            )
                        )
                    } else {
                        setFilesList(filesListCache[currentFS])
                    }
                }
            } else {
                //this is affected only by serial commands
                if (
                    feedback.command == "delete" ||
                    feedback.command == "createdir"
                ) {
                    if (feedback.status == "error") {
                        console.log("got error")
                        toasts.addToast({
                            content:
                                feedback.command == "delete"
                                    ? T("S85").replace("%s", feedback.arg)
                                    : T("S84").replace("%s", feedback.arg),
                            type: "error",
                        })
                    }
                    //Refresh content either way, the list shows what is really there
                    onRefresh(null, false)
                    return
                }
            }
            setIsLoading(false)
        }
        setIsLoading(false)
    }

    const createDirectory = (name) => {
        const cmd = files.command(
            currentFS,
            "createdir",
            currentPath[currentFS],
            name
        )
        if (cmd.type == "url") {
            sendURLCmd(cmd)
        } else if (cmd.type == "cmd") {
            if (
                processor.startCatchResponse(
                    currentFS,
                    "createdir",
                    processFeedback,
                    name
                )
            ) {
                setIsLoading(true)
                sendSerialCmd(cmd.cmd)
            }
        }
    }

    const deleteCommand = (element) => {
        const cmd = files.command(
            currentFS,
            element.size == -1 ? "deletedir" : "delete",
            currentPath[currentFS],
            element.name
        )
        if (cmd.type == "url") {
            sendURLCmd(cmd)
        } else if (cmd.type == "cmd") {
            //do the catching

            if (
                processor.startCatchResponse(
                    currentFS,
                    "delete",
                    processFeedback,
                    element.name
                )
            ) {
                setIsLoading(true)
                sendSerialCmd(cmd.cmd)
            }
        }
    }
    const setupFileInput = () => {
        if (currentFS == "") return
        fileref.current.multiple = files.capability(currentFS, "UploadMultiple")
        if (files.capability(currentFS, "UseFilters")) {
            let f = useUiContextFn.getValue("filesfilter").trim()
            if (f.length > 0 && f != "*") {
                f = "." + f.replace(/;/g, ",.")
            } else f = "*"
            fileref.current.accept = f
        } else {
            fileref.current.accept = "*"
        }
    }
    const onSelectFS = (e, norefresh = false) => {
        if (e) currentFS = e.target.value
        setupFileInput()
        setFileSystem(currentFS)
        if (!currentPath[currentFS]) {
            currentPath[currentFS] = "/"
        }
        if (!norefresh) onRefresh(e, true)
    }

    const onRefresh = (e, usecache = false) => {
        if (e) useUiContextFn.haptic()
        setIsLoading(true)
        setFilePath(currentPath[currentFS])
        if (usecache && filesListCache[currentFS]) {
            if (files.capability(currentFS, "IsFlatFS")) {
                setFilesList(
                    files.command(
                        currentFS,
                        "filterResult",
                        filesListCache[currentFS],
                        currentPath[currentFS]
                    )
                )
            } else {
                setFilesList(filesListCache[currentFS])
            }
            setIsLoading(false)
        } else {
            const cmd = files.command(currentFS, "list", currentPath[currentFS])
            if (cmd.type == "url") {
                createNewRequest(
                    espHttpURL(cmd.url, cmd.args),
                    { method: "GET" },
                    {
                        onSuccess: (result) => {
                            filesListCache[currentFS] = files.command(
                                currentFS,
                                "formatResult",
                                result
                            )
                            setFilesList(filesListCache[currentFS])
                            setIsLoading(false)
                        },
                        onFail: (error) => {
                            console.log(error)
                            setIsLoading(false)
                            toasts.addToast({ content: error, type: "error" })
                        },
                    }
                )
            } else if (cmd.type == "cmd") {
                if (
                    processor.startCatchResponse(
                        currentFS,
                        "list",
                        processFeedback
                    )
                )
                    sendSerialCmd(cmd.cmd)
            }
        }
    }

    const { filesSelected, downloadFile } = createFilesTransfer({
        modals,
        toasts,
        createNewRequest,
        abortRequest,
        fileref,
        progressBar,
        currentPath,
        filesListCache,
        setFilesList,
        setIsLoading,
        getCurrentFS: () => currentFS,
        onRefresh,
    })

    const dropHandlers = getFileDropHandlers({
        dropRef,
        fileref,
        toasts,
        onFilesReady: filesSelected,
    })

    const ElementClicked = (e, line) => {
        if (line.size == -1) {
            currentPath[currentFS] =
                currentPath[currentFS] +
                (currentPath[currentFS] == "/" ? "" : "/") +
                line.name
            onRefresh(e, files.capability(currentFS, "IsFlatFS"))
        } else {
            if (files.capability(currentFS, "Download")) {
                const content = <li>{line.name}</li>
                showConfirmationModal({
                    modals,
                    title: T("S87"),
                    content,
                    button1: {
                        cb: () => {
                            downloadFile(line)
                        },
                        text: T("S27"),
                    },
                    button2: { text: T("S28") },
                })
            }
        }
    }

    useEffect(() => {
        if (currentFS == "") {
            const fs = files.supported.find((element) => {
                if (element.depend) if (element.depend()) return true
                return false
            })
            if (fs) {
                currentFS = fs.value
                onSelectFS(null, !useUiContextFn.getValue("autoload"))
                currentFSNeedInit = false
            }
        } else {
            if (currentFSNeedInit) {
                currentFSNeedInit = false
                onSelectFS(null, !useUiContextFn.getValue("autoload"))
            }
        }
        setupFileInput()
    }, [])
    const openFileUploadBrowser = () => {
        useUiContextFn.haptic()
        fileref.current.value = ""
        fileref.current.click()
    }
    const showCreateDirModal = () => {
        useUiContextFn.haptic()
        let name
        showModal({
            modals,
            title: T("S104"),
            button2: { text: T("S28") },
            button1: {
                cb: () => {
                    if (name.length > 0) createDirectory(name)
                },
                text: T("S106"),
            },
            icon: <Edit3 />,
            id: "inputName",
            content: (
                <Fragment>
                    <div>{T("S105")}</div>
                    <input
                        class="form-input"
                        onInput={(e) => {
                            name = e.target.value.trim()
                        }}
                    />
                </Fragment>
            ),
        })
    }

    useEffect(() => {
        const newMenu = () => {
            const rawMenuItems = [
                {
                    capability: "CreateDir",
                    label: T("S90"),
                    icon: (
                        <span class="feather-icon-container">
                            <FolderPlus size="0.8rem" />
                        </span>
                    ),
                    onClick: showCreateDirModal,
                },
                {
                    capability: "Upload",
                    label: T("S89"),
                    displayToggle: () => (
                        <span class="feather-icon-container">
                            <Upload size="0.8rem" />
                        </span>
                    ),
                    onClick: openFileUploadBrowser,
                },
                { divider: true },
                {
                    label: T("S50"),
                    onClick: onRefresh,
                    icon: (
                        <span class="feather-icon-container">
                            <RefreshCcw size="0.8rem" />
                        </span>
                    ),
                },
            ]
            const capabilities = ["CreateDir", "Upload"].filter((cap) =>
                files.capability(currentFS, cap)
            )

            return rawMenuItems.filter((item) => {
                if (item.capability)
                    return capabilities.includes(item.capability)
                if (item.divider && capabilities.length <= 0) return false
                return true
            })
        }
        setMenu(newMenu())
    }, [fileSystem])

    return (
        <PanelShell
            id={id}
            icon={<HardDrive />}
            title={T("S65")}
            headerRight={
                fileSystem != "" && !isLoading && <PanelMenu items={menu} />
            }
            beforeBody={
                <input
                    type="file"
                    ref={fileref}
                    class="d-none"
                    onChange={filesSelected}
                />
            }
            bodyClass="files-panel-body"
        >
            <div class="input-group">
                <div class="filesystem-select-wrap">
                    <select
                        class="form-select"
                        onchange={onSelectFS}
                        value={currentFS}
                    >
                        {files.supported.map((element) => {
                            if (element.depend)
                                if (element.depend())
                                    return (
                                        <option value={element.value}>
                                            {T(element.name)}
                                        </option>
                                    )
                        })}
                    </select>
                </div>
                <div class="form-control form-control-path">
                    {filePath ? filePath : ""}
                </div>
            </div>

            <div ref={dropRef} class="drop-zone files-list" {...dropHandlers}>
                {isLoading && fileSystem != "" && (
                    <Fragment>
                        <center>
                            <Loading class="m-2" />

                            <ButtonImg
                                donotdisable
                                icon={<XCircle />}
                                label={T("S28")}
                                btooltip
                                data-tooltip={T("S28")}
                                onClick={onCancel}
                            />
                        </center>
                    </Fragment>
                )}

                {!isLoading && fileSystem != "" && filesList && (
                    <Fragment>
                        {currentPath[currentFS] != "/" && (
                            <div
                                class="file-line file-line-name"
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    const newpath = currentPath[
                                        currentFS
                                    ].substring(
                                        0,
                                        currentPath[currentFS].lastIndexOf("/")
                                    )

                                    currentPath[currentFS] =
                                        newpath.length == 0 ? "/" : newpath
                                    onRefresh(
                                        e,
                                        files.capability(currentFS, "IsFlatFS")
                                    )
                                }}
                            >
                                <div class="form-control go-previous file-line-name file-line-action">
                                    <CornerRightUp />
                                    <label class="go-previous-text">...</label>
                                </div>
                            </div>
                        )}
                        {filesList.files.map((line) => (
                            <FileLine
                                line={line}
                                currentFS={currentFS}
                                path={currentPath[currentFS]}
                                modals={modals}
                                onOpen={ElementClicked}
                                onPlay={(line) => {
                                    const cmd = files.command(
                                        currentFS,
                                        "play",
                                        currentPath[currentFS],
                                        line.name
                                    )
                                    sendSerialCmd(cmd.cmd)
                                }}
                                onDelete={deleteCommand}
                            />
                        ))}
                    </Fragment>
                )}
            </div>
            <FilesFooter filesList={filesList} isLoading={isLoading} />
        </PanelShell>
    )
}

const FilesPanelElement = {
    id: "filesPanel",
    content: <FilesPanel />,
    name: "S65",
    icon: "HardDrive",
    show: "showfilespanel",
    onstart: "openfilesonstart",
    settingid: "files",
    hasMenu: true,
}

export { FilesPanel, FilesPanelElement }
