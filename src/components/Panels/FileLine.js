/*
 FileLine.js - ESP3D WebUI files panel file line

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
import { h, Fragment } from "preact"
import { Folder, File, Trash2, Play } from "preact-feather"
import { T } from "../Translations"
import { ButtonImg } from "../Controls"
import { showConfirmationModal } from "../Modal"
import { useUiContextFn } from "../../contexts"
import { files } from "../../targets"

//One line of the files list: folder/file name (clickable), optional play
//and delete actions according to the current filesystem capabilities
const FileLine = ({ line, currentFS, path, modals, onOpen, onPlay, onDelete }) => {
    const isDir = line.size == -1
    const canProcess =
        !isDir && files.capability(currentFS, "Process", path, line.name)
    const canDelete = files.capability(
        currentFS,
        isDir ? "DeleteDir" : "DeleteFile",
        path,
        line.name
    )
    const askDeleteConfirmation = () => {
        const content = (
            <Fragment>
                <div>{isDir ? T("S101") : T("S100")}:</div>
                <center>
                    <li>{line.name}</li>
                </center>
            </Fragment>
        )
        showConfirmationModal({
            modals,
            title: T("S26"),
            content,
            button1: {
                cb: () => {
                    onDelete(line)
                },
                text: T("S27"),
            },
            button2: {
                text: T("S28"),
            },
        })
    }
    return (
        <div class="file-line form-control">
            <div
                class={`feather-icon-container file-line-name ${
                    files.capability(currentFS, "Download") || isDir
                        ? "file-line-action"
                        : ""
                }`}
                onclick={(e) => {
                    useUiContextFn.haptic()
                    onOpen(e, line)
                }}
            >
                {isDir ? <Folder /> : <File />}
                <label>{line.name}</label>
            </div>
            <div class="file-line-controls">
                {!isDir && (
                    <Fragment>
                        <div>{line.size}</div>
                        {canProcess && (
                            <ButtonImg
                                m1
                                ltooltip
                                data-tooltip={T("S74")}
                                icon={<Play />}
                                onClick={(e) => {
                                    e.target.blur()
                                    useUiContextFn.haptic()
                                    onPlay(line)
                                }}
                            />
                        )}
                        {!canProcess && <div style="width:2rem" />}
                    </Fragment>
                )}
                {canDelete && (
                    <ButtonImg
                        m1
                        ltooltip
                        data-tooltip={isDir ? T("S101") : T("S100")}
                        icon={<Trash2 />}
                        onClick={(e) => {
                            useUiContextFn.haptic()
                            e.target.blur()
                            askDeleteConfirmation()
                        }}
                    />
                )}
            </div>
        </div>
    )
}

export { FileLine }
