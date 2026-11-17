/*
 fileDrop.js - ESP3D WebUI files panel drop zone

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
import { T } from "../Translations"

//Drop zone handlers of the files panel: visual feedback, rejects multiple
//files when the filesystem does not support it, and directories
const getFileDropHandlers = ({ dropRef, fileref, toasts, onFilesReady }) => {
    const removeOver = () =>
        dropRef.current.classList.remove("drop-zone--over")
    const onDragOver = (e) => {
        dropRef.current.classList.add("drop-zone--over")
        e.preventDefault()
    }
    const onDragLeave = (e) => {
        removeOver()
        e.preventDefault()
    }
    const onDragEnd = (e) => {
        removeOver()
        e.preventDefault()
    }
    const onDrop = (e) => {
        removeOver()
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

        onFilesReady(e)
        e.preventDefault()
    }
    return { onDragOver, onDragLeave, onDragEnd, onDrop }
}

export { getFileDropHandlers }
