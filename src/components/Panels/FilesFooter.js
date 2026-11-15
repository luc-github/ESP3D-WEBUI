/*
 FilesFooter.js - ESP3D WebUI files panel footer

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

//Footer of the files panel: occupation bar and status line
const FilesFooter = ({ filesList, isLoading }) => {
    if (isLoading || !filesList) return null
    return (
        <div class="files-list-footer">
            {filesList.occupation && (
                <div class="filelist-occupation">
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
            {filesList.status && (
                <div class="file-status">{T(filesList.status)}</div>
            )}
        </div>
    )
}

export { FilesFooter }
