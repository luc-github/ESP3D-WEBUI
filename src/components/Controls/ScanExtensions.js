/*
ScanExtensions.js - ESP3D WebUI component file

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
import { useState, useEffect } from "preact/hooks"
import { useUiContext, useSettingsContextFn } from "../../contexts"
import { useHttpQueue } from "../../hooks"
import { espHttpURL } from "../Helpers"
import { T } from "../Translations"
import Loading from "./Loading"

// Same API as themes/language pack: GET with path, response { files: [ { name, size }, ... ] }.
// Try path=/extensions first (organized); on error retry path=/ and filter by esp3dext-* (small FS, no subdir).
const EXTENSIONS_NAME_REGEX = /^esp3dext-.+$/

// pathPrefix: "extensions/" when listing that dir, "" when listing root. Full path is saved; display name trims esp3dext-.
const parseAndFilter = (result, pathPrefix) => {
    try {
        const listFiles = JSON.parse(result)
        const raw = listFiles.files || []
        return raw
            .filter((e) => {
                const name = e && e.name
                if (!name || name === "." || name === "..") return false
                return EXTENSIONS_NAME_REGEX.test(name)
            })
            .map((e) => {
                const path = pathPrefix ? pathPrefix + e.name : e.name
                const displayName = e.name.replace(/^esp3dext-/, "")
                return { id: path, path, name: displayName, displayName: null }
            })
    } catch (_) {
        return []
    }
}

const ScanExtensionsList = ({ id, refreshfn }) => {
    const { modals, toasts } = useUiContext()
    const [extensionsList, setExtensionsList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { createNewRequest } = useHttpQueue()

    const scanExtensions = () => {
        setIsLoading(true)
        const base = useSettingsContextFn.getValue("HostUploadPath") || ""
        const extensionsPath = base.replace(/\/$/, "") + "/extensions"
        const rootPath = base || "/"

        createNewRequest(
            espHttpURL(useSettingsContextFn.getValue("HostTarget"), { path: extensionsPath }),
            { method: "GET" },
            {
                onSuccess: (result) => {
                    setIsLoading(false)
                    setExtensionsList(parseAndFilter(result, "extensions/"))
                },
                onFail: () => {
                    createNewRequest(
                        espHttpURL(useSettingsContextFn.getValue("HostTarget"), { path: rootPath }),
                        { method: "GET" },
                        {
                            onSuccess: (result) => {
                                setIsLoading(false)
                                setExtensionsList(parseAndFilter(result, ""))
                            },
                            onFail: (error) => {
                                setIsLoading(false)
                                toasts.addToast({ content: error, type: "error" })
                                setExtensionsList([])
                            },
                        }
                    )
                },
            }
        )
    }

    useEffect(() => {
        scanExtensions()
        if (refreshfn) refreshfn(scanExtensions)
    }, [])

    return (
        <Fragment>
            {isLoading && <Loading />}
            {!isLoading && (
            <div class="form-group" data-extra="extensions">
                <table class="table">
                    <thead class="hide-low">
                        <tr>
                            <th>{T("S121")}</th>
                            <th>{T("S129")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {extensionsList.length === 0 ? (
                            <tr>
                                <td colspan="2" class="text-gray">
                                    —
                                </td>
                            </tr>
                        ) : (
                            extensionsList.map((e) => (
                                <tr key={e.id}>
                                    <td>{e.name}</td>
                                    <td>{e.displayName ?? e.name}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            )}
        </Fragment>
    )
}

export { ScanExtensionsList }
