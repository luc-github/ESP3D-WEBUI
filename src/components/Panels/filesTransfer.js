/*
 filesTransfer.js - ESP3D WebUI files panel upload / download

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
import { T } from "../Translations"
import { espHttpURL, getBrowserTime } from "../Helpers"
import { CenterLeft, Progress } from "../Controls"
import { showConfirmationModal, showProgressModal } from "../Modal"
import { files } from "../../targets"

//Upload / download logic of the files panel. The panel builds ctx with
//its live state: the module-level currentFS / currentPath / filesListCache
//survive hide/show cycles of the panel
const createFilesTransfer = (ctx) => {
    const {
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
        getCurrentFS,
        onRefresh,
    } = ctx

    const uploadFiles = () => {
        setIsLoading(true)
        const currentFS = getCurrentFS()
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

                let fileName = ""
                const needFormatFileName = files.command(
                    currentFS,
                    "needFormatFileName",
                    cmd.args.path,
                    fileref.current.files[i].name
                )
                if (
                    needFormatFileName.type != "error" &&
                    needFormatFileName.name
                ) {
                    fileName = needFormatFileName.name
                } else {
                    fileName = file.name
                }
                const arg =
                    cmd.args.path +
                    (cmd.args.path.endsWith("/") ? "" : "/") +
                    fileName +
                    "S"
                //append file size first to check updload is complete
                formData.append(arg, file.size)
                //append last modified time
                //no need timezone because will be saved as it is on FileSystem
                const time_string = getBrowserTime(file.lastModified)
                const argt = arg.substring(0, arg.length - 1) + "T"
                formData.append(argt, time_string)
                //append file
                formData.append(
                    "myfiles",
                    file,
                    cmd.args.path +
                        (cmd.args.path.endsWith("/") ? "" : "/") +
                        fileName
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
                        if (
                            progressBar.update &&
                            typeof progressBar.update === "function"
                        )
                            progressBar.update(e)
                    },
                }
            )
        }
    }

    const filesSelected = (e) => {
        const currentFS = getCurrentFS()
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
                toasts.addToast({ content: T(eMsg), type: "error" })
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
        const currentFS = getCurrentFS()
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
                    if (
                        progressBar.update &&
                        typeof progressBar.update === "function"
                    )
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
                    //name the file: over HTTP/2 there is no status text,
                    //so the raw error may be a bare "404"
                    toasts.addToast({
                        content: `${element.name}: ${error}`,
                        type: "error",
                    })
                },
                onProgress: (e) => {
                    if (
                        progressBar.update &&
                        typeof progressBar.update === "function"
                    )
                        progressBar.update(e)
                },
            }
        )
    }

    return { uploadFiles, filesSelected, downloadFile }
}

export { createFilesTransfer }
