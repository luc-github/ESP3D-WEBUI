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
import { useState, useEffect, useCallback, useRef } from "preact/hooks"
import { useUiContext, useSettingsContextFn, useUiContextFn } from "../../contexts"
import { useHttpQueue } from "../../hooks"
import { espHttpURL, parseEmbeddedManifest, isExtensionCompatible, decompressGzipToText } from "../Helpers"
import { T } from "../Translations"
import Loading from "./Loading"
import { CheckCircle, PlusCircle, XCircle } from "preact-feather"

// Same API as themes/language pack: GET with path, response { files: [ { name, size }, ... ] }.
// Try path=/extensions first (organized); on error retry path=/ and filter by esp3dext-* (small FS, no subdir).
const EXTENSIONS_NAME_REGEX = /^esp3dext-.+\.html(?:\.gz)?$/i

// pathPrefix: "extensions/" when listing that dir, "" when listing root. Full path is saved; display name trims esp3dext-.
// Returns { items, pathError } when the API returned 200 but reported path missing (e.g. production firmware).
const parseAndFilter = (result, pathPrefix) => {
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
                if (e.size == -1) return /^esp3dext-.+/i.test(name)
                return EXTENSIONS_NAME_REGEX.test(name)
            })
            .map((e) => {
                const isDir = e.size == -1
                const basePath = pathPrefix ? pathPrefix + e.name : e.name
                const path = isDir ? basePath + "/" + e.name + ".html" : basePath
                const displayName = e.name.replace(/^esp3dext-/i, "").replace(/\.html(?:\.gz)?$/i, "")
                return { id: path, path, name: displayName, displayName: null, status: "loading", isDir }
            })
        return { items, pathError }
    } catch (_) {
        return { items: [], pathError: null }
    }
}

const ScanExtensionsList = ({ id, refreshfn, extensionCheckConfig, addedPaths = [], addSelectedRef }) => {
    const { modals, toasts } = useUiContext()
    const [extensionsList, setExtensionsList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState(new Set())
    const { createNewRequest } = useHttpQueue()

    const displayStatus = (e) => {
        if (e.status === "ok" && (addedPaths || []).includes(e.path)) return "installed"
        return e.status
    }

    useEffect(() => {
        if (!addSelectedRef) return
        addSelectedRef.current = {
            getSelectedItems: () =>
                extensionsList.filter(
                    (e) => selectedIds.has(e.id) && displayStatus(e) === "ok"
                ),
        }
    }, [addSelectedRef, extensionsList, selectedIds, addedPaths])

    const manifestUpdatesRef = useRef({})
    const manifestPendingRef = useRef(0)

    const fetchManifestsForItems = useCallback((items) => {
        if (!items.length) return
        const baseUrl = useSettingsContextFn.getValue("HostDownloadPath") || ""
        manifestUpdatesRef.current = {}
        manifestPendingRef.current = items.length
        const flushManifestUpdates = () => {
            if (manifestPendingRef.current !== 0) return
            const updates = manifestUpdatesRef.current
            setExtensionsList((prev) =>
                prev.map((x) => (updates[x.id] ? { ...x, ...updates[x.id] } : x))
            )
        }
        items.forEach((ext) => {
            const isGz = !ext.isDir && (ext.path.endsWith(".html.gz") || ext.path.endsWith(".htm.gz"))
            const entry = ext.isDir || ext.path.endsWith(".html") || ext.path.endsWith(".htm") || isGz
                ? ext.path
                : ext.path + "/index.html"
            const url = (baseUrl + (baseUrl.endsWith("/") ? "" : "/") + entry).replace(/\/+/g, "/")
            const requestId = isGz ? "download-manifest-" + ext.id : undefined
            const finalize = (manifest) => {
                const compatible = extensionCheckConfig
                    ? isExtensionCompatible(manifest, extensionCheckConfig)
                    : !!manifest
                manifestUpdatesRef.current[ext.id] = {
                    status: compatible ? "ok" : "incompatible",
                    displayName: manifest?.name ?? null,
                    supportedVersion: manifest?.supportedVersion ?? null,
                    targetSystem: manifest?.targetSystem ?? null,
                    icon: manifest?.icon ?? "Package",
                }
                manifestPendingRef.current -= 1
                flushManifestUpdates()
            }
            const applyManifest = (text) => {
                const manifest = parseEmbeddedManifest(typeof text === "string" ? text : "")
                if (manifest) {
                    finalize(manifest)
                    return
                }
                const sidecarEntry = entry.replace(/\.html(?:\.gz)?$/i, ".json")
                const sidecarUrl = (baseUrl + (baseUrl.endsWith("/") ? "" : "/") + sidecarEntry).replace(/\/+/g, "/")
                createNewRequest(espHttpURL(sidecarUrl), { method: "GET" }, {
                    onSuccess: (jsonResult) => {
                        let sidecarManifest = null
                        try { sidecarManifest = JSON.parse(typeof jsonResult === "string" ? jsonResult : "") } catch (_) {}
                        finalize(sidecarManifest)
                    },
                    onFail: () => finalize(null),
                })
            }
            createNewRequest(espHttpURL(url), { method: "GET", id: requestId }, {
                onSuccess: (result) => {
                    if (isGz && result && typeof result.stream === "function") {
                        decompressGzipToText(result)
                            .then(applyManifest)
                            .catch(() => {
                                manifestUpdatesRef.current[ext.id] = { status: "error" }
                                manifestPendingRef.current -= 1
                                flushManifestUpdates()
                            })
                    } else {
                        applyManifest(typeof result === "string" ? result : "")
                    }
                },
                onFail: () => {
                    manifestUpdatesRef.current[ext.id] = { status: "error" }
                    manifestPendingRef.current -= 1
                    flushManifestUpdates()
                },
            })
        })
    }, [createNewRequest, extensionCheckConfig])

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
                    const { items, pathError } = parseAndFilter(result, "extensions/")
                    if (pathError && items.length === 0) {
                        // Production: 200 but path does not exist → try root listing
                        createNewRequest(
                            espHttpURL(useSettingsContextFn.getValue("HostTarget"), { path: rootPath }),
                            { method: "GET" },
                            {
                                onSuccess: (rootResult) => {
                                    setIsLoading(false)
                                    const { items: rootItems, pathError: rootPathError } = parseAndFilter(rootResult, "")
                                    setExtensionsList(rootItems)
                                    setSelectedIds(new Set(rootItems.map((e) => e.id)))
                                    if (rootItems.length) fetchManifestsForItems(rootItems)
                                    if (rootPathError && rootItems.length === 0)
                                        toasts.addToast({ content: rootPathError, type: "error" })
                                },
                                onFail: (error) => {
                                    setIsLoading(false)
                                    toasts.addToast({ content: error, type: "error" })
                                    setExtensionsList([])
                                },
                            }
                        )
                        return
                    }
                    setIsLoading(false)
                    setExtensionsList(items)
                    setSelectedIds(new Set(items.map((e) => e.id)))
                    if (items.length) fetchManifestsForItems(items)
                },
                onFail: () => {
                    createNewRequest(
                        espHttpURL(useSettingsContextFn.getValue("HostTarget"), { path: rootPath }),
                        { method: "GET" },
                        {
                            onSuccess: (rootResult) => {
                                setIsLoading(false)
                                const { items: rootItems, pathError: rootPathError } = parseAndFilter(rootResult, "")
                                setExtensionsList(rootItems)
                                setSelectedIds(new Set(rootItems.map((e) => e.id)))
                                if (rootItems.length) fetchManifestsForItems(rootItems)
                                if (rootPathError && rootItems.length === 0)
                                    toasts.addToast({ content: rootPathError, type: "error" })
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

    const statusContent = (e) => {
        const status = displayStatus(e)
        if (status === "loading") return <span class="text-gray">—</span>
        const cell = (className, label, Icon) => (
            <div class={className} style="display:flex; flex-direction:column; align-items:center; gap:0.15rem;">
                <span>{label}</span>
                <span class="feather-icon-container"><Icon size={16} /></span>
            </div>
        )
        if (status === "installed") return cell("text-success", T("S248"), CheckCircle)
        if (status === "ok") return cell("text-warning", T("S250"), PlusCircle)
        if (status === "incompatible") return cell("text-error", "Unsupported", XCircle)
        return cell("text-gray", T("S249"), XCircle)
    }

    const toggleSelected = (extId) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(extId)) next.delete(extId)
            else next.add(extId)
            return next
        })
    }

    return (
        <Fragment>
            {isLoading && <Loading />}
            {!isLoading && (
            <div class="form-group" data-extra="extensions">
                <table class="table">
                    <thead class="hide-low">
                        <tr>
                            <th style="width:2rem;" />
                            <th>{T("S121")}</th>
                            <th style="text-align:center;">{T("S129")}</th>
                            <th style="text-align:center;">{T("S255")}</th>
                            <th style="text-align:center;">{T("system")}</th>
                            <th style="text-align:center;">{T("S247")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {extensionsList.length === 0 ? (
                            <tr>
                                <td colspan="6" class="text-gray">
                                    —
                                </td>
                            </tr>
                        ) : (
                            extensionsList.map((e) => {
                                const status = displayStatus(e)
                                const showCheckbox = status === "ok"
                                return (
                                    <tr key={e.id}>
                                        <td>
                                            {showCheckbox ? (
                                                <input
                                                    type="checkbox"
                                                    class="form-checkbox"
                                                    checked={selectedIds.has(e.id)}
                                                    onChange={() => {
                                                        useUiContextFn.haptic()
                                                        toggleSelected(e.id)
                                                    }}
                                                />
                                            ) : (
                                                <span />
                                            )}
                                        </td>
                                        <td>{e.name}</td>
                                        <td style="text-align:center;">{e.displayName || "—"}</td>
                                        <td style="text-align:center;">{e.supportedVersion ?? "—"}</td>
                                        <td style="text-align:center;">{e.targetSystem ?? "—"}</td>
                                        <td style="text-align:center;">{statusContent(e)}</td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
            )}
        </Fragment>
    )
}

export { ScanExtensionsList }
