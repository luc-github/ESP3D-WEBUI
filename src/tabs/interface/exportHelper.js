/*
exportHelper.js - ESP3D WebUI helper file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 Modified by Luc LEBOSSE 2021

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

import { defaultPreferences } from "../../targets"

function deepEqual(a, b) {
    if (a === b) return true
    if (a == null || b == null || typeof a !== "object" || typeof b !== "object") return false
    return JSON.stringify(a) === JSON.stringify(b)
}

/** Keys that must always be included when present (required for extra contents / extensions to load). */
const ALWAYS_INCLUDE_KEYS = ["showextracontents", "openextrapanelsonstart", "extracontents"]

/** Return a copy of settings with only keys that differ from default (reduces file size). */
function omitDefaultSettings(settings, defaultSettings) {
    const out = {}
    for (const k of Object.keys(settings)) {
        const alwaysInclude = ALWAYS_INCLUDE_KEYS.includes(k)
        const differs = defaultSettings[k] === undefined || !deepEqual(settings[k], defaultSettings[k])
        if (alwaysInclude || differs) {
            out[k] = settings[k]
        }
    }
    return out
}

function exportPreferencesSection(interfaceSettingsDataSection, asFile = true, initial_value = false) {
    const section = {}
    for (let key in interfaceSettingsDataSection) {
        for (let subkey in interfaceSettingsDataSection[key]) {
            if (interfaceSettingsDataSection[key][subkey].id) {
                if (interfaceSettingsDataSection[key][subkey].type == "group") {
                    const groupValue = Array.isArray(interfaceSettingsDataSection[key][subkey].value)
                        ? interfaceSettingsDataSection[key][subkey].value
                        : []
                    groupValue.forEach((element) => {
                        const val = asFile ? (element.initial ?? element.value) : element.value
                        section[element.id] = val
                    })
                } else if (
                    interfaceSettingsDataSection[key][subkey].type == "list"
                ) {
                    const listEl = interfaceSettingsDataSection[key][subkey]
                    const listId = listEl.id
                    const listValue = Array.isArray(listEl.value) ? listEl.value : []
                    const extensionMetadataKeys = ["owner", "version", "github", "description", "supportedVersion", "targetSystem"]
                    const itemsList = []
                    listValue.forEach((element) => {
                        const item = { id: element.id }
                        const itemValue = Array.isArray(element.value) ? element.value : []
                        if (itemValue.length > 0) {
                            itemValue.forEach((setting) => {
                                item[setting.name] = asFile ? (setting.initial ?? setting.value) : setting.value
                            })
                        } else {
                            // Flat form (e.g. default panelsorder: { id: "Files", name: "files" })
                            Object.keys(element).forEach((k) => {
                                if (k !== "id" && k !== "value" && k !== "index") item[k] = element[k]
                            })
                        }
                        if (listId === "extracontents") {
                            extensionMetadataKeys.forEach((k) => delete item[k])
                        }
                        itemsList.push(item)
                    })
                    section[listId] = itemsList
                } else {
                    const el = interfaceSettingsDataSection[key][subkey]
                    section[el.id] = asFile || initial_value ? (el.initial ?? el.value) : el.value
                }
            }
        }
    }
    return section
}

function exportPreferences(interfaceSettingsData, asFile = true) {
    console.log("exportPreferences for")
    console.log(JSON.parse(JSON.stringify(interfaceSettingsData)))
    const preferences = {}
    const filename = "preferences.json"
    preferences.settings = {}
    if (interfaceSettingsData.custom)
        preferences.custom = interfaceSettingsData.custom
    if (interfaceSettingsData.extensions)
        preferences.extensions = interfaceSettingsData.extensions
    const fullSettings = exportPreferencesSection(interfaceSettingsData.settings, asFile)
    const defaultSettings = exportPreferencesSection(defaultPreferences.settings, true)
    preferences.settings = omitDefaultSettings(fullSettings, defaultSettings)
    if (asFile) {
        const file = new Blob([JSON.stringify(preferences)], {
            type: "application/json",
        })
        if (window.navigator.msSaveOrOpenBlob)
            // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename)
        else {
            // Others
            const a = document.createElement("a")
            const url = URL.createObjectURL(file)
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            setTimeout(function () {
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
            }, 0)
        }
    }
    console.log("exportPreferences done")
    console.log(preferences)
    return preferences
}

export { exportPreferences, exportPreferencesSection, omitDefaultSettings }
