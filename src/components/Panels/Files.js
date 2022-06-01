/*
Files.js - ESP3D WebUI component file

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

import { Fragment, h } from "preact"
import { useEffect, useState, useRef } from "preact/hooks"
import { T } from "../Translations"
import { useHttpFn } from "../../hooks"
import { espHttpURL } from "../Helpers"
import { Loading, ButtonImg, CenterLeft, Progress } from "../Controls"
import { useUiContext, useUiContextFn } from "../../contexts"
import { showModal, showConfirmationModal, showProgressModal } from "../Modal"
import {
    HardDrive,
    Upload,
    RefreshCcw,
    FolderPlus,
    CornerRightUp,
    Edit3,
    XCircle,
} from "preact-feather"
import { files, processor, useTargetContextFn } from "../../targets"
import { Folder, File, Trash2, Play } from "preact-feather"
import { Menu as PanelMenu } from "./"

let currentFS = ""
const currentPath = {}
const filesListCache = {}

/*
 * Local const
 *
 */
const FilesPanel = () => {
    const { panels, uisettings } = useUiContext()
    const id = "filesPanel"
    const [filePath, setFilePath] = useState(currentPath[currentFS])
    const [isLoading, setIsLoading] = useState(false)
    const [fileSystem, setFileSystem] = useState(currentFS)
    const [filesList, setFilesList] = useState(filesListCache[currentFS])
    const [menu, setMenu] = useState(null)
    const { createNewRequest, abortRequest } = useHttpFn
    const { processData } = useTargetContextFn
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

    const sendSerialCmd = (cmd) => {
        createNewRequest(
            espHttpURL("command", { cmd: cmd }),
            { method: "GET", echo: cmd },
            {
                onSuccess: (result) => {
                    //Result is handled on ws so just do nothing
                },
                onFail: (error) => {
                    console.log(error)
                    processor.startCatchResponse()
                    setIsLoading(false)
                    toasts.addToast({ content: error, type: "error" })
                },
            }
        )
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
                    } else {
                        //Success now refresh content"
                        onRefresh(null, false)
                        return
                    }
                }
            }
            setIsLoading(false)
        }
        setIsLoading(false)
    }

    const uploadFiles = () => {
        setIsLoading(true)
        const cmd = files.command(currentFS, "upload", currentPath[currentFS])
        const list = fileref.current.files
        if (list.length > 0) {
            showProgressModal({
                modals,
                title: T("S32"),
                button1: {
                    cb: abortRequest,
                    text: T("S28"),
                },
                content: <Progress progressBar={progressBar} max="100" />,
            })
            //prepare POST data
            const formData = new FormData()
            formData.append("path", currentPath[currentFS])
            for (let i = 0; i < list.length; i++) {
                const file = list[i]
                const arg =
                    currentPath[currentFS] +
                    (currentPath[currentFS] == "/" ? "" : "/") +
                    file.name +
                    "S"
                //append file size first to check updload is complete
                formData.append(arg, file.size)
                formData.append(
                    "myfiles",
                    file,
                    currentPath[currentFS] +
                        (currentPath[currentFS] == "/" ? "" : "/") +
                        file.name
                )
            }
            //now do request
            createNewRequest(
                espHttpURL(cmd.url),
                { method: "POST", id: "upload", body: formData },
                {
                    onSuccess: (result) => {
                        modals.removeModal(modals.getModalIndex("upload"))
                        const cmdpost = files.command(
                            currentFS,
                            "postUpload",
                            currentPath[currentFS],
                            fileref.current.files[0].name
                        )
                        if (cmdpost.type == "error" || cmdpost.type == "none") {
                            filesListCache[currentFS] = files.command(
                                currentFS,
                                "formatResult",
                                result
                            )
                            setFilesList(filesListCache[currentFS])
                            setIsLoading(false)
                        } else {
                            if (cmdpost.type == "refresh") {
                                //this is needed because the board is still busy
                                setTimeout(() => {
                                    onRefresh(null, cmdpost.arg)
                                }, cmdpost.timeOut)
                            }
                        }
                    },
                    onFail: (error) => {
                        modals.removeModal(modals.getModalIndex("upload"))
                        toasts.addToast({ content: error, type: "error" })
                        setIsLoading(false)
                    },
                    onProgress: (e) => {
                        if (progressBar.update) progressBar.update(e)
                    },
                }
            )
        }
    }

    const filesSelected = (e) => {
        const content = []
        const length = fileref.current.files.length
        for (let index = 0; index < length; index++) {
            content.push(<li>{fileref.current.files[index].name}</li>)
            if (
                !files.capability(
                    currentFS,
                    "Upload",
                    currentPath[currentFS],
                    fileref.current.files[index].name
                )
            ) {
                const eMsg = files.capability(
                    currentFS,
                    "Upload",
                    currentPath[currentFS],
                    fileref.current.files[index].name,
                    true
                )
                toasts.add({ content: T(eMsg), type: "error" })
            }
        }

        showConfirmationModal({
            modals,
            title: T("S31"),
            content: <CenterLeft>{content}</CenterLeft>,
            button1: {
                cb: uploadFiles,
                text: T("S27"),
            },
            button2: { text: T("S28") },
        })
    }

    const downloadFile = (element) => {
        const cmd = files.command(
            currentFS,
            "download",
            currentPath[currentFS],
            element.name
        )
        showProgressModal({
            modals,
            title: T("S108"),
            button1: {
                cb: abortRequest,
                text: T("S28"),
            },
            content: <Progress progressBar={progressBar} max="100" />,
        })
        createNewRequest(
            espHttpURL(cmd.url, cmd.args),
            { method: "GET", id: "download" },
            {
                onSuccess: (result) => {
                    progressBar.update(100)
                    setTimeout(() => {
                        modals.removeModal(modals.getModalIndex("progression"))
                    }, 2000)

                    const file = new Blob([result], {
                        type: "application/octet-stream",
                    })
                    if (window.navigator.msSaveOrOpenBlob)
                        // IE10+
                        window.navigator.msSaveOrOpenBlob(file, element.name)
                    else {
                        // Others
                        let a = document.createElement("a"),
                            url = URL.createObjectURL(file)
                        a.href = url
                        a.download = element.name
                        document.body.appendChild(a)
                        a.click()
                        setTimeout(function () {
                            document.body.removeChild(a)
                            window.URL.revokeObjectURL(url)
                        }, 0)
                    }
                },
                onFail: (error) => {
                    modals.removeModal(modals.getModalIndex("progression"))
                    toasts.addToast({ content: error, type: "error" })
                },
                onProgress: (e) => {
                    if (progressBar.update) progressBar.update(e)
                },
            }
        )
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
    const onSelectFS = (e) => {
        if (e) currentFS = e.target.value
        setupFileInput()
        setFileSystem(currentFS)
        if (!currentPath[currentFS]) {
            currentPath[currentFS] = "/"
        }
        onRefresh(e, true)
    }

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

    useEffect(() => {
        if (useUiContextFn.getValue("autoload") && currentFS == "") {
            currentFS = "FLASH"
            onSelectFS()
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

    console.log(id)
    return (
        <div class="panel panel-dashboard">
            <input
                type="file"
                ref={fileref}
                class="d-none"
                onChange={filesSelected}
            />
            <div class="navbar">
                <span class="navbar-section  feather-icon-container">
                    <HardDrive />
                    <strong class="text-ellipsis">{T("S65")}</strong>
                </span>

                <span class="navbar-section">
                    <span style="height: 100%;">
                        {fileSystem != "" && !isLoading && (
                            <PanelMenu items={menu} />
                        )}
                        <span
                            class="btn btn-clear btn-close m-1"
                            aria-label="Close"
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                panels.hide(id)
                            }}
                        />
                    </span>
                </span>
            </div>
            <div class="input-group m-2">
                <div>
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
                <div class="form-control m-1">{filePath ? filePath : ""}</div>
            </div>

            <div
                ref={dropRef}
                class="panel drop-zone panel-body-dashboard"
                onDragOver={(e) => {
                    dropRef.current.classList.add("drop-zone--over")
                    e.preventDefault()
                }}
                onDragLeave={(e) => {
                    dropRef.current.classList.remove("drop-zone--over")
                    e.preventDefault()
                }}
                onDragEnd={(e) => {
                    dropRef.current.classList.remove("drop-zone--over")
                    e.preventDefault()
                }}
                onDrop={(e) => {
                    dropRef.current.classList.remove("drop-zone--over")
                    if (e.dataTransfer.files.length) {
                        const length = e.dataTransfer.items.length
                        if (!fileref.current.multiple && length > 1) {
                            toasts.addToast({
                                content: T("S193"),
                                type: "error",
                            })
                            console.log("Multiple detected abort")
                            e.preventDefault()
                            return
                        }
                        //webkitGetAsEntry seems experimental
                        if (
                            e.dataTransfer.items &&
                            e.dataTransfer.items[0].webkitGetAsEntry()
                        ) {
                            for (let i = 0; i < length; i++) {
                                const entry =
                                    e.dataTransfer.items[i].webkitGetAsEntry()
                                if (entry.isDirectory) {
                                    toasts.addToast({
                                        content: T("S192"),
                                        type: "error",
                                    })
                                    console.log("Directory detected abort")
                                    e.preventDefault()
                                    return
                                }
                            }
                        }
                    }

                    fileref.current.files = e.dataTransfer.files

                    filesSelected(e)
                    e.preventDefault()
                }}
            >
                <div class="panel-body panel-body-dashboard files-list m-1">
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
                                            currentPath[currentFS].lastIndexOf(
                                                "/"
                                            )
                                        )

                                        currentPath[currentFS] =
                                            newpath.length == 0 ? "/" : newpath
                                        onRefresh(
                                            e,
                                            files.capability(
                                                currentFS,
                                                "IsFlatFS"
                                            )
                                        )
                                    }}
                                >
                                    <div
                                        class="form-control  file-line-name file-line-action"
                                        style="height:2rem!important"
                                    >
                                        <CornerRightUp />{" "}
                                        <label class="p-2">...</label>
                                    </div>
                                </div>
                            )}
                            {filesList.files.map((line) => {
                                return (
                                    <div class="file-line form-control">
                                        <div
                                            class={`feather-icon-container file-line-name ${
                                                files.capability(
                                                    fileSystem,
                                                    "Download"
                                                ) || line.size == -1
                                                    ? "file-line-action"
                                                    : ""
                                            }`}
                                            onclick={(e) => {
                                                useUiContextFn.haptic()
                                                ElementClicked(e, line)
                                            }}
                                        >
                                            {line.size == -1 ? (
                                                <Folder />
                                            ) : (
                                                <File />
                                            )}
                                            <label>{line.name}</label>
                                        </div>
                                        <div class="file-line-controls">
                                            {line.size != -1 && (
                                                <Fragment>
                                                    <div>{line.size}</div>
                                                    {files.capability(
                                                        currentFS,
                                                        "Process",
                                                        currentPath[currentFS],
                                                        line.name
                                                    ) && (
                                                        <ButtonImg
                                                            m1
                                                            ltooltip
                                                            data-tooltip={T(
                                                                "S74"
                                                            )}
                                                            icon={<Play />}
                                                            onClick={(e) => {
                                                                e.target.blur()
                                                                useUiContextFn.haptic()
                                                                const cmd =
                                                                    files.command(
                                                                        currentFS,
                                                                        "play",
                                                                        currentPath[
                                                                            currentFS
                                                                        ],
                                                                        line.name
                                                                    )
                                                                sendSerialCmd(
                                                                    cmd.cmd
                                                                )
                                                            }}
                                                        />
                                                    )}
                                                    {!files.capability(
                                                        currentFS,
                                                        "Process",
                                                        currentPath[currentFS],
                                                        line.name
                                                    ) && (
                                                        <div style="width:2rem" />
                                                    )}
                                                </Fragment>
                                            )}
                                            {files.capability(
                                                currentFS,
                                                line.size == -1
                                                    ? "DeleteDir"
                                                    : "DeleteFile",
                                                currentPath[currentFS],
                                                line.name
                                            ) && (
                                                <ButtonImg
                                                    m1
                                                    ltooltip
                                                    data-tooltip={
                                                        line.size == -1
                                                            ? T("S101")
                                                            : T("S100")
                                                    }
                                                    icon={<Trash2 />}
                                                    onClick={(e) => {
                                                        useUiContextFn.haptic()
                                                        e.target.blur()
                                                        const content = (
                                                            <Fragment>
                                                                <div>
                                                                    {line.size ==
                                                                    -1
                                                                        ? T(
                                                                              "S101"
                                                                          )
                                                                        : T(
                                                                              "S100"
                                                                          )}
                                                                    :
                                                                </div>
                                                                <center>
                                                                    <li>
                                                                        {
                                                                            line.name
                                                                        }
                                                                    </li>
                                                                </center>
                                                            </Fragment>
                                                        )
                                                        showConfirmationModal({
                                                            modals,
                                                            title: T("S26"),
                                                            content,
                                                            button1: {
                                                                cb: () => {
                                                                    deleteCommand(
                                                                        line
                                                                    )
                                                                },
                                                                text: T("S27"),
                                                            },
                                                            button2: {
                                                                text: T("S28"),
                                                            },
                                                        })
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </Fragment>
                    )}
                </div>
            </div>
            <div class="files-list-footer">
                {!isLoading && filesList && filesList.occupation && (
                    <div style=" display: flex; align-items:center; flex-wrap: wrap; justify-content: space-between;">
                        <div class="flex-pack">
                            {T("S98")}:{filesList.total}
                        </div>
                        <div class="m-1">-</div>
                        <div class="flex-pack m-2">
                            {T("S99")}:{filesList.used}
                        </div>
                        <div class="flex-pack hide-low m-1">
                            <div class="bar bar-sm" style="width:4rem">
                                <div
                                    class="bar-item"
                                    role="progressbar"
                                    style={`width:${filesList.occupation}%`}
                                    aria-valuenow={filesList.occupation}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>

                            <span class="m-1">{filesList.occupation}%</span>
                        </div>
                    </div>
                )}
                {!isLoading && filesList && filesList.status && (
                    <div class="file-status">{T(filesList.status)}</div>
                )}
            </div>
        </div>
    )
}

const FilesPanelElement = {
    id: "filesPanel",
    content: <FilesPanel />,
    name: "S65",
    icon: "HardDrive",
    show: "showfilespanel",
    onstart: "openfilesonstart",
}

export { FilesPanel, FilesPanelElement }
