/*
 ItemsList.js - ESP3D WebUI component file

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
import { useState, useEffect, useRef } from "preact/hooks"
import { ButtonImg } from "../../Controls"
import { T } from "../../Translations"
import { iconsFeather } from "../../Images"
import { iconsTarget, verboseMatchers, Target, targetCategory, webUIVersion } from "../../../targets"
import {
    generateUID,
    generateDependIds,
    checkDependencies,
    espHttpURL,
    parseEmbeddedManifest,
} from "../../Helpers"
import { Field } from "../../Controls"
import { formatItem } from "../../../tabs/interface/importHelper"
import { useUiContextFn, useSettingsContext, useSettingsContextFn, useUiContext } from "../../../contexts"
import { useHttpQueue } from "../../../hooks"
import { Loading } from "../../Controls"
import {
    Plus,
    ArrowUp,
    ArrowDown,
    Trash2,
    Minimize2,
    List,
    CheckCircle,
    XCircle,
    PlusCircle,
} from "preact-feather"
import { showModal } from "../../Modal"
import defaultPanel from "./def_panel.json"
import defaultMacro from "./def_macro.json"
import defaultPolling from "./def_polling.json"
import defaultVerboseFilter from "./def_verbose_filter.json"

/** Table with checkboxes for available extensions; selectedRef is kept in sync for the parent "Add selected" button */
const ExtensionsPreviewTable = ({ rows, selectedRef, T }) => {
    const availableSources = rows.filter((r) => r.status === "available").map((r) => r.source)
    const [selectedSet, setSelectedSet] = useState(() => new Set(availableSources))

    const syncRef = (nextSet) => {
        selectedRef.current = nextSet
    }

    const toggle = (source) => {
        setSelectedSet((prev) => {
            const next = new Set(prev)
            if (next.has(source)) next.delete(source)
            else next.add(source)
            syncRef(next)
            return next
        })
    }

    const selectAllAvailable = () => {
        const next = new Set(availableSources)
        setSelectedSet(next)
        syncRef(next)
    }

    const availableCount = availableSources.length
    const selectedCount = selectedSet.size

    return (
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th style={{ width: "2.5rem" }}>
                            {availableCount > 0 && (
                                <input
                                    type="checkbox"
                                    checked={selectedCount === availableCount}
                                    onChange={(e) => {
                                        if (e.target.checked) selectAllAvailable()
                                        else {
                                            const next = new Set()
                                            setSelectedSet(next)
                                            syncRef(next)
                                        }
                                    }}
                                    title={T("S254")}
                                />
                            )}
                        </th>
                        <th>{T("S253")}</th>
                        <th>{T("S243")}</th>
                        <th>{T("S244")}</th>
                        <th>{T("S245")}</th>
                        <th>{T("S246")}</th>
                        <th>{T("S247")}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.source}>
                            <td>
                                {r.status === "available" && (
                                    <input
                                        type="checkbox"
                                        checked={selectedSet.has(r.source)}
                                        onChange={() => toggle(r.source)}
                                        aria-label={r.name}
                                    />
                                )}
                            </td>
                            <td>{r.filename}</td>
                            <td>{r.name}</td>
                            <td>{r.version}</td>
                            <td>{r.supportedVersion}</td>
                            <td>{r.targetSystem}</td>
                            <td>
                                {r.status === "added" && <span class="text-success"><CheckCircle size={18} /> {T("S248")}</span>}
                                {r.status === "rejected" && <span class="text-error"><XCircle size={18} /> {T("S249")}</span>}
                                {r.status === "available" && <span class="text-warning"><PlusCircle size={18} /> {T("S250")}</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/*
 * Local const
 *
 */
const ItemControl = ({
    itemData,
    index,
    completeList,
    idList,
    depend,
    setValue,
    validationfn,
    fixed,
    nodelete,
    editable,
    sorted,
    interfaceSettings,
}) => {
    const iconsList = { ...iconsTarget, ...iconsFeather }
    const { id, editionMode, ...rest } = itemData
    const value = Array.isArray(itemData.value) ? itemData.value : []
    const indexIcon = value.findIndex((element) => element.id == id + "-icon")
    const indexName = value.findIndex((element) => element.id == id + "-name")
    const indexMatch = value.findIndex((element) => element.id == id + "-match")
    const indexText = value.findIndex((element) => element.id == id + "-text")
    const getVal = (fallbackIdx, idx) => { const el = value[idx !== -1 ? idx : fallbackIdx]; return el && el.value !== undefined ? el.value : null }
    const icon = getVal(0, indexIcon)
    const name = getVal(0, indexName)
    const match = getVal(0, indexMatch)
    const text = getVal(0, indexText)
    const controlIcon = iconsList[icon] ? iconsList[icon] : ""

    const onEdit = (state) => {
        completeList[index].editionMode = state
        setValue([...completeList])
    }
    const markListOrderModified = (list) => {
        if (idList === "panelsorder" && Array.isArray(list)) {
            list.forEach((it) => {
                if (it.value && it.value[0]) it.value[0].hasmodified = true
            })
        }
        return list
    }
    const downItem = (e) => {
        e.target.blur()
        useUiContextFn.haptic()
        const item = completeList[index]
        completeList.splice(index, 1)
        completeList.splice(index + 1, 0, item)
        setValue(markListOrderModified(completeList))
    }
    const upItem = (e) => {
        e.target.blur()
        useUiContextFn.haptic()
        const item = completeList[index]
        completeList.splice(index, 1)
        completeList.splice(index - 1, 0, item)
        setValue(markListOrderModified(completeList))
    }
    const removeItem = (e) => {
        useUiContextFn.haptic()
        e.target.blur()
        completeList.splice(index, 1)
        setValue(completeList)
    }
    useEffect(() => {
        //to update state when import- but why ?
        if (setValue) setValue(null, true)
    }, [completeList])

    let colorStyle
    if (
        JSON.stringify(value).includes('"hasmodified":true') ||
        JSON.stringify(itemData).includes('"newitem":true')
    )
        colorStyle =
            "box-shadow: 0 0 0 .2rem rgba(255, 183, 0, .4);margin-right:0.5rem!important"

    if (JSON.stringify(value).includes('"haserror":true'))
        colorStyle =
            "box-shadow: 0 0 0 .2rem rgba(255, 0, 0, .4);margin-right:0.5rem!important"

    const val = value.findIndex((e) => {
        return e.name == "key"
    })

    const matcher = idList == "verbosefilters" && match ? verboseMatchers?.find((m) => m.id === match) : null
    const matchLabel = matcher?.display ? T(matcher.display) : (idList == "verbosefilters" && match ? match : null)
    let panelDisplayName = name
    if (idList === "panelsorder" && name && String(name).startsWith("extracontents_")) {
        const rootId = String(name).replace("extracontents_", "")
        const settings = interfaceSettings?.current?.settings ?? null
        let extraList = null
        if (settings?.extracontents && Array.isArray(settings.extracontents)) {
            const extraEntry = settings.extracontents.find((e) => e.id === "extracontents")
            extraList = extraEntry?.value
        }
        if (!Array.isArray(extraList) && settings) {
            extraList = useUiContextFn.getValue("extracontents", settings) ?? null
        }
        if (Array.isArray(extraList)) {
            const entry = extraList.find((e) => e.id === rootId || e.id === name || (e.value && e.value.find((s) => s.name === "name")?.value === name))
            if (entry) {
                const nameField = entry.value?.find((s) => s.name === "name")
                const displayVal = nameField?.value
                panelDisplayName = (displayVal != null && displayVal !== name) ? displayVal : (entry.name != null ? entry.name : name)
            }
        }
    }
    const labelBtn =
        idList == "verbosefilters"
            ? (matchLabel != null ? matchLabel : T("S156")) +
              (text && text.length != 0 ? " [" + text + "]" : "")
            : idList === "panelsorder"
              ? (panelDisplayName !== name ? panelDisplayName : T(name))
              : val != -1 && value[val]
                ? T(name) +
                  (value[val].value && value[val].value.length != 0
                      ? " [" + value[val].value + "]"
                      : "")
                : T(name)

    return (
        <Fragment>
            {!editionMode && (
                <div class="fields-line">
                    {((index > 0 && completeList.length > 1) ||
                        (index == 0 && completeList.length > 1)) &&
                        sorted && (
                            <div class="item-list-move">
                                {index > 0 && completeList.length > 1 && (
                                    <ButtonImg
                                        m1
                                        tooltip
                                        data-tooltip={T("S38")}
                                        icon={<ArrowUp />}
                                        onClick={upItem}
                                    />
                                )}
                                {completeList.length != 1 &&
                                    index < completeList.length - 1 && (
                                        <ButtonImg
                                            m1
                                            tooltip
                                            data-tooltip={T("S39")}
                                            icon={<ArrowDown />}
                                            onClick={downItem}
                                        />
                                    )}
                            </div>
                        )}

                    <div class="item-list-name">
                        {(!fixed || editable) && (
                            <ButtonImg
                                m2
                                tooltip
                                data-tooltip={T("S94")}
                                style={colorStyle}
                                label={labelBtn}
                                icon={controlIcon}
                                width="100px"
                                onClick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    onEdit(true)
                                }}
                            />
                        )}
                        {fixed && !editable && (
                            <label class="m-1">{T(name)}</label>
                        )}
                    </div>

                    {!(fixed || nodelete) && (
                        <ButtonImg
                            m2
                            tooltip
                            data-tooltip={T("S37")}
                            icon={<Trash2 />}
                            onClick={removeItem}
                        />
                    )}
                </div>
            )}
            {editionMode && (
                <div class="itemEditor">
                    <div>
                        <ButtonImg
                            sm
                            tooltip
                            data-tooltip={T("S95")}
                            icon={<Minimize2 />}
                            onClick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                onEdit(false)
                            }}
                            class="float-right"
                        />
                        <div>
                            {index > 0 && completeList.length > 1 && sorted && (
                                <ButtonImg
                                    m1
                                    tooltip
                                    data-tooltip={T("S38")}
                                    icon={<ArrowUp />}
                                    onClick={upItem}
                                />
                            )}
                            {completeList.length != 1 &&
                                sorted &&
                                index < completeList.length - 1 && (
                                    <ButtonImg
                                        m1
                                        tooltip
                                        data-tooltip={T("S39")}
                                        icon={<ArrowDown />}
                                        onClick={downItem}
                                    />
                                )}

                            {!nodelete && (
                                <ButtonImg
                                    m2
                                    tooltip
                                    data-tooltip={T("S37")}
                                    icon={<Trash2 />}
                                    onClick={removeItem}
                                />
                            )}
                        </div>
                    </div>
                    <div class="m-1">
                        {value &&
                            value.map((item) => {
                                const {
                                    id,
                                    type,
                                    label,
                                    initial,
                                    options,
                                    ...rest
                                } = item
                                const [validation, setvalidation] = useState(
                                    validationfn(item)
                                )
                                //Do translation if necessary
                                const Options = options
                                    ? [...options].reduce((acc, curr) => {
                                          acc.push({
                                              label: T(curr.label),
                                              value: curr.value,
                                              depend: curr.depend,
                                          })
                                          return acc
                                      }, [])
                                    : null
                                if (idList == "keymap" && item.name == "name") {
                                    return
                                }
                                return (
                                    <Field
                                        id={item.id}
                                        label={
                                            idList == "keymap"
                                                ? T(itemData.id)
                                                : T(label)
                                        }
                                        type={type}
                                        options={Options}
                                        inline={
                                            type == "boolean" || type == "icon"
                                                ? true
                                                : false
                                        }
                                        {...rest}
                                        setValue={(val, update) => {
                                            if (!update) item.value = val
                                            setvalidation(validationfn(item))
                                            setValue(completeList, update)
                                        }}
                                        validation={validation}
                                    />
                                )
                            })}
                    </div>
                </div>
            )}
        </Fragment>
    )
}

const ItemsList = ({
    id,
    label,
    validationfn,
    validation,
    value,
    type,
    setValue,
    inline,
    fixed,
    sorted,
    depend,
    nodelete,
    editable,
    ...rest
}) => {
    const { interfaceSettings, connectionSettings } = useSettingsContext()
    const { toasts, modals } = useUiContext()
    const { createNewRequest } = useHttpQueue()
    const previewRowsRef = useRef([])
    const previewSelectedRef = useRef(new Set())
    const dependIds = generateDependIds(
        depend,
        interfaceSettings.current.settings
    )
    const [isPreviewLoading, setIsPreviewLoading] = useState(false)
    const [previewRows, setPreviewRows] = useState([])

    const openExtensionsPreview = (e) => {
        e?.target?.blur()
        useUiContextFn.haptic()
        const basePath = (useSettingsContextFn.getValue("HostUploadPath") || "/").replace(/\/$/, "") || "/"
        const existingSources = (value || []).map((el) => {
            const v = Array.isArray(el.value) && el.value.find((x) => x.name === "source")
            return v && v.value != null ? v.value : null
        }).filter(Boolean)
        setIsPreviewLoading(true)
        setPreviewRows([])
        createNewRequest(
            espHttpURL(useSettingsContextFn.getValue("HostTarget"), { path: useSettingsContextFn.getValue("HostUploadPath") }),
            { method: "GET" },
            {
                onSuccess: (result) => {
                    try {
                        const listFiles = JSON.parse(result)
                        const allEntries = listFiles.files || []
                        const extFiles = allEntries.filter((line) => line.name && line.size !== -1 && line.name.toLowerCase().includes("esp3dext") && (line.name.endsWith(".html") || line.name.endsWith(".html.gz")))
                        if (extFiles.length === 0) {
                            setIsPreviewLoading(false)
                            showModal({ modals, title: T("S242"), id: "extensionsPreview", content: <p>{T("S22")}</p>, button1: { text: T("S24"), cb: () => modals.removeModal(modals.getModalIndex("extensionsPreview")) } })
                            return
                        }
                        const matchVersion = (version, pattern) => {
                            if (!pattern || pattern === "*") return true
                            const v = String(version).split(".")
                            const p = String(pattern).split(".")
                            for (let i = 0; i < Math.max(v.length, p.length); i++) {
                                const pSeg = p[i] === undefined ? "*" : p[i]
                                const vSeg = v[i] === undefined ? "0" : v[i]
                                if (pSeg !== "*" && pSeg !== vSeg) return false
                            }
                            return true
                        }
                        const categoryId = ({ Printer3D: "3d printer", CNC: "cnc", SandTable: "sand table" }[targetCategory] || (targetCategory || "").toLowerCase()).replace(/\s/g, "")
                        const targetId = (Target || "").toLowerCase().replace(/\s/g, "")
                        const matchTargetSystem = (manifestVal) => {
                            if (manifestVal == null || manifestVal === "" || manifestVal === "*") return true
                            const list = Array.isArray(manifestVal) ? manifestVal.map((x) => String(x).toLowerCase().replace(/\s/g, "")) : [String(manifestVal).toLowerCase().replace(/\s/g, "")]
                            if (list.includes("*")) return true
                            return list.includes(categoryId) || list.includes(targetId)
                        }
                        // Required for scan: name, target, supportedVersion, targetSystem (owner/version/github/description are optional per API)
                        const hasRequiredFields = (m) => m &&
                            [m.name, m.target, m.supportedVersion].every((v) => v != null && String(v).trim() !== "") &&
                            m.targetSystem != null
                        const rows = []
                        let index = 0
                        const tryNext = () => {
                            if (index >= extFiles.length) {
                                setIsPreviewLoading(false)
                                previewRowsRef.current = rows
                                setPreviewRows(rows)
                                const availableCount = rows.filter((r) => r.status === "available").length
                                previewSelectedRef.current = new Set(rows.filter((r) => r.status === "available").map((r) => r.source))
                                showModal({
                                    modals,
                                    title: T("S242"),
                                    id: "extensionsPreview",
                                    content: <ExtensionsPreviewTable rows={rows} selectedRef={previewSelectedRef} T={T} />,
                                    button1: { text: T("S24"), cb: () => modals.removeModal(modals.getModalIndex("extensionsPreview")) },
                                    button2: availableCount > 0 ? {
                                        text: T("S254"),
                                        cb: () => {
                                            const selected = previewRowsRef.current.filter((r) => r.status === "available" && r.manifest && previewSelectedRef.current.has(r.source))
                                            const newItems = []
                                            selected.forEach((r) => {
                                                const manifest = r.manifest
                                                const newItem = JSON.parse(JSON.stringify(defaultPanel))
                                                newItem.id = generateUID()
                                                newItem.name = manifest.name.trim()
                                                newItem.source = r.source
                                                newItem.type = "extension"
                                                newItem.target = manifest.target === "page" || manifest.target === "panel" ? manifest.target : "panel"
                                                newItem.icon = (manifest && manifest.icon) || "Meh"
                                                newItem.refreshtime = (manifest && (manifest.refreshtime != null && manifest.refreshtime !== "")) ? String(manifest.refreshtime) : "0"
                                                const formatted = formatItem(newItem, -1, "extracontents")
                                                formatted.editionMode = false
                                                formatted.newitem = true
                                                if (Array.isArray(formatted.value)) {
                                                    formatted.value = formatted.value.map((v) => ({ ...v, hasmodified: true }))
                                                }
                                                newItems.push(formatted)
                                            })
                                            if (newItems.length) {
                                                setValue([...newItems, ...(value || [])])
                                                toasts.addToast({ content: T("S237") + ": " + newItems.length + " " + T("S96"), type: "success" })
                                            }
                                            modals.removeModal(modals.getModalIndex("extensionsPreview"))
                                        },
                                    } : null,
                                })
                                return
                            }
                            const line = extFiles[index++]
                            const filename = line.name
                            const source = (basePath + "/" + line.name).replace(/\/+/g, "/")
                            const displayName = line.name.replace(/\.(html|html\.gz)$/i, "")
                            const manifestPath = (basePath + "/" + line.name).replace(/\.(html|html\.gz)$/i, ".json").replace(/\/+/g, "/")
                            const pushRow = (manifest) => {
                                const status = existingSources.includes(source) ? "added" : !hasRequiredFields(manifest) || !matchVersion(webUIVersion || "3.0", (manifest && manifest.supportedVersion) ? String(manifest.supportedVersion).trim() : "") || (manifest?.targetSystem != null && manifest?.targetSystem !== "" && !matchTargetSystem(manifest.targetSystem)) ? "rejected" : "available"
                                rows.push({
                                    filename,
                                    name: (manifest && manifest.name) || displayName,
                                    version: (manifest && manifest.version) || "-",
                                    supportedVersion: (manifest && manifest.supportedVersion) || "-",
                                    targetSystem: (manifest && (Array.isArray(manifest.targetSystem) ? manifest.targetSystem.join(", ") : manifest.targetSystem)) || "-",
                                    source,
                                    status,
                                    manifest,
                                    displayName,
                                })
                                tryNext()
                            }
                            const processHtml = (htmlText) => {
                                const embedded = parseEmbeddedManifest(htmlText)
                                if (embedded !== null) {
                                    pushRow(embedded)
                                } else {
                                    createNewRequest(
                                        espHttpURL(manifestPath, {}),
                                        { method: "GET", responseType: "text" },
                                        {
                                            onSuccess: (manifestResult) => {
                                                let manifest = null
                                                try { manifest = JSON.parse(typeof manifestResult === "string" ? manifestResult : "") } catch (_) {}
                                                pushRow(manifest)
                                            },
                                            onFail: () => {
                                                rows.push({ filename, name: displayName, version: "-", supportedVersion: "-", targetSystem: "-", source, status: "rejected", manifest: null, displayName })
                                                tryNext()
                                            },
                                        }
                                    )
                                }
                            }
                            createNewRequest(
                                espHttpURL(source, {}),
                                { method: "GET", responseType: "text" },
                                {
                                    onSuccess: (htmlResult) => {
                                        if (typeof htmlResult === "string") {
                                            processHtml(htmlResult)
                                        } else if (htmlResult && typeof htmlResult.text === "function") {
                                            htmlResult.text().then(processHtml).catch(() => {
                                                rows.push({ filename, name: displayName, version: "-", supportedVersion: "-", targetSystem: "-", source, status: "rejected", manifest: null, displayName })
                                                tryNext()
                                            })
                                        } else {
                                            rows.push({ filename, name: displayName, version: "-", supportedVersion: "-", targetSystem: "-", source, status: "rejected", manifest: null, displayName })
                                            tryNext()
                                        }
                                    },
                                    onFail: () => {
                                        rows.push({ filename, name: displayName, version: "-", supportedVersion: "-", targetSystem: "-", source, status: "rejected", manifest: null, displayName })
                                        tryNext()
                                    },
                                }
                            )
                        }
                        tryNext()
                    } catch (err) {
                        setIsPreviewLoading(false)
                        toasts.addToast({ content: T("S22"), type: "error" })
                    }
                },
                onFail: () => {
                    setIsPreviewLoading(false)
                    toasts.addToast({ content: T("S22"), type: "error" })
                },
            }
        )
    }

    const addItem = (e) => {
        useUiContextFn.haptic()
        e.target.blur()
        const newItem = JSON.parse(
            JSON.stringify(
                id == "macros"
                    ? defaultMacro
                    : id == "pollingcmds"
                      ? defaultPolling
                      : id == "verbosefilters"
                        ? defaultVerboseFilter
                      : defaultPanel
            )
        )
        newItem.id = generateUID()
        if (typeof newItem.name !== "undefined") {
            newItem.name += " " + newItem.id
        }
        const formatedNewItem = formatItem(newItem, -1, id)
        formatedNewItem.editionMode = true
        formatedNewItem.newItem = true
        value.unshift(formatedNewItem)
        setValue(value)
    }

    useEffect(() => {
        //to update state when import- but why ?
        if (setValue) setValue(null, true)
    }, [value])

    useEffect(() => {
        let visible = checkDependencies(depend, interfaceSettings.current.settings, connectionSettings.current)
        if (document.getElementById(id))
            document.getElementById(id).style.display = visible
                ? "block"
                : "none"
        if (document.getElementById("group-" + id))
            document.getElementById("group-" + id).style.display = visible
                ? "block"
                : "none"
    }, [...dependIds])

    const listHasModified = id === "panelsorder" && value && JSON.stringify(value).includes('"hasmodified":true')
    return (
        <Fragment>
            <fieldset
                id={id}
                class={`fieldset-top-separator fieldset-bottom-separator field-group${id === "verbosefilters" ? " fieldset-in-group" : ""}`}
                style={listHasModified ? "box-shadow: 0 0 0 .2rem rgba(255, 183, 0, .4);" : undefined}
            >
                <legend>
                    {!fixed && (
                        <Fragment>
                            <ButtonImg
                                m2
                                label={
                                    id == "macros"
                                        ? T("S128")
                                        : id == "pollingcmds"
                                          ? T("S207")
                                          : id == "verbosefilters"
                                            ? T("S227")
                                            : T("S156")
                                }
                                tooltip
                                data-tooltip={
                                    id == "macros"
                                        ? T("S128")
                                        : id == "pollingcmds"
                                          ? T("S207")
                                          : id == "verbosefilters"
                                            ? T("S227")
                                            : T("S156")
                                }
                                icon={<Plus />}
                                onClick={addItem}
                            />
                            {id === "extracontents" && (
                                <Fragment>
                                    {isPreviewLoading && <Loading />}
                                    <ButtonImg
                                        m2
                                        label={T("S242")}
                                        tooltip
                                        data-tooltip={T("S242")}
                                        icon={<List />}
                                        onClick={openExtensionsPreview}
                                        disabled={isPreviewLoading}
                                    />
                                </Fragment>
                            )}
                        </Fragment>
                    )}
                    {fixed && <label class="m-2">{T(label)}</label>}
                </legend>
                <div class="m-1" />
                <div class="items-group-content">
                    {value &&
                        value.map((element, index, completeList) => {
                            return (
                                <ItemControl
                                    itemData={element}
                                    index={index}
                                    completeList={completeList}
                                    idList={id}
                                    validationfn={validationfn}
                                    setValue={setValue}
                                    fixed={fixed}
                                    sorted={sorted}
                                    nodelete={nodelete}
                                    editable={editable}
                                    interfaceSettings={interfaceSettings}
                                />
                            )
                        })}
                </div>
            </fieldset>
            {listHasModified && (
                <div class="m-1 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="#ffb700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                    </svg>
                </div>
            )}
        </Fragment>
    )
}

export default ItemsList
