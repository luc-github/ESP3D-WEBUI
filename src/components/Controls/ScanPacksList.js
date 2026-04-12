/*
ScanPacksList.js - ESP3D WebUI component file

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
import { ButtonImg, Loading } from "./../Controls"
import { useHttpQueue } from "../../hooks"
import { espHttpURL } from "../../components/Helpers"
import {
    useUiContext,
    useUiContextFn,
    useSettingsContextFn,
} from "../../contexts"
import { T, getLanguageName } from "./../Translations"
import { CheckCircle } from "preact-feather"

const LANG_REGEX = /^lang-\w+\.json(\.gz)?$/
const THEME_REGEX = /^theme-\w+(\.json)?(\.gz)?$/

// Try subdir first (themes/ or languages/), then root. pathPrefix for save: "themes/" or "languages/" or "".
// Returns { items, pathError } when the API returned 200 but reported path missing (e.g. production firmware).
const parseAndFilter = (result, pathPrefix, isLanguage) => {
    try {
        const listFiles = JSON.parse(result)
        const raw = listFiles.files || []
        const pathError =
            typeof listFiles.status === "string" &&
            listFiles.status.length > 0 &&
            (listFiles.status.toLowerCase().includes("does not exist") ||
                listFiles.status.toLowerCase().includes("not exist"))
                ? listFiles.status
                : null
        const items = raw
            .filter((e) => {
                const name = e && e.name
                if (!name || name === "." || name === "..") return false
                return isLanguage ? LANG_REGEX.test(name) : THEME_REGEX.test(name)
            })
            .map((e) => {
                const nameNoGz = e.name.replace(/\.gz$/i, "")
                const path = pathPrefix ? pathPrefix + nameNoGz : nameNoGz
                const displayName = isLanguage
                    ? getLanguageName(nameNoGz)
                    : nameNoGz.replace(/^theme-/, "")
                return { path, displayName, rawName: e.name }
            })
        return { items, pathError }
    } catch (_) {
        return { items: [], pathError: null }
    }
}

const ScanPacksList = ({ id, setValue, refreshfn }) => {
    const { modals, toasts } = useUiContext()
    const [packsList, setPacksList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { createNewRequest } = useHttpQueue()
    const isLanguage = id === "languagePickup"

    const ScanPacks = () => {
        setIsLoading(true)
        const base = useSettingsContextFn.getValue("HostUploadPath") || ""
        const subdir = isLanguage ? "languages" : "themes"
        const subdirPath = base.replace(/\/$/, "") + "/" + subdir
        const rootPath = base || "/"

        createNewRequest(
            espHttpURL(useSettingsContextFn.getValue("HostTarget"), { path: subdirPath }),
            { method: "GET" },
            {
                onSuccess: (result) => {
                    const { items, pathError } = parseAndFilter(result, subdir + "/", isLanguage)
                    if (pathError && items.length === 0) {
                        createNewRequest(
                            espHttpURL(useSettingsContextFn.getValue("HostTarget"), { path: rootPath }),
                            { method: "GET" },
                            {
                                onSuccess: (rootResult) => {
                                    setIsLoading(false)
                                    const { items: rootItems, pathError: rootPathError } =
                                        parseAndFilter(rootResult, "", isLanguage)
                                    setPacksList(rootItems)
                                    if (rootPathError && rootItems.length === 0)
                                        toasts.addToast({ content: rootPathError, type: "error" })
                                },
                                onFail: (error) => {
                                    setIsLoading(false)
                                    toasts.addToast({ content: error, type: "error" })
                                    setPacksList([])
                                },
                            }
                        )
                        return
                    }
                    setIsLoading(false)
                    setPacksList(items)
                },
                onFail: () => {
                    createNewRequest(
                        espHttpURL(useSettingsContextFn.getValue("HostTarget"), { path: rootPath }),
                        { method: "GET" },
                        {
                            onSuccess: (rootResult) => {
                                setIsLoading(false)
                                const { items: rootItems, pathError: rootPathError } =
                                    parseAndFilter(rootResult, "", isLanguage)
                                setPacksList(rootItems)
                                if (rootPathError && rootItems.length === 0)
                                    toasts.addToast({ content: rootPathError, type: "error" })
                            },
                            onFail: (error) => {
                                setIsLoading(false)
                                toasts.addToast({ content: error, type: "error" })
                                setPacksList([])
                            },
                        }
                    )
                },
            }
        )
    }

    useEffect(() => {
        ScanPacks()
        refreshfn(ScanPacks)
    }, [])

    return (
        <Fragment>
            {isLoading && <Loading />}

            {!isLoading && (
                <table class="table">
                    <thead class="hide-low">
                        <tr>
                            <th>
                                {isLanguage ? T("S67") : T("S183")}
                            </th>
                            <th>{T("S178")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {isLanguage
                                    ? T("lang", true)
                                    : T("none")}
                            </td>
                            <td>
                                <ButtonImg
                                    m2
                                    ltooltip
                                    data-tooltip={
                                        isLanguage ? T("S179") : T("S180")
                                    }
                                    icon={<CheckCircle />}
                                    onClick={() => {
                                        useUiContextFn.haptic()
                                        setValue("default")
                                        modals.removeModal(
                                            modals.getModalIndex(id)
                                        )
                                    }}
                                />
                            </td>
                        </tr>
                        {packsList.map((e) => (
                            <tr key={e.path}>
                                <td>
                                    <span
                                        class="tooltip tooltip-right"
                                        data-tooltip={e.path}
                                    >
                                        {e.displayName}
                                    </span>
                                </td>
                                <td>
                                    <ButtonImg
                                        m2
                                        ltooltip
                                        data-tooltip={isLanguage ? T("S179") : T("S180")}
                                        icon={<CheckCircle />}
                                        onClick={() => {
                                            useUiContextFn.haptic()
                                            setValue(e.path)
                                            modals.removeModal(
                                                modals.getModalIndex(id)
                                            )
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Fragment>
    )
}
export { ScanPacksList }
