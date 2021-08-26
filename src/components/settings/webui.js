/*
 webui.js - ESP3D WebUI settings file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

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
import { setLang, T } from "../translations"
import {
    RefreshCcw,
    ExternalLink,
    Save,
    Globe,
    Download,
    Edit,
    PlusSquare,
    Trash2,
    ArrowUp,
    ArrowDown,
} from "preact-feather"
import { esp3dSettings, Setting, applyConfig, setCustomdata } from "../app"
import {
    SendCommand,
    cancelCurrentQuery,
    SendGetHttp,
    SendPostHttp,
    clearCommandList,
} from "../http"
import { useStoreon } from "storeon/preact"
import { useEffect } from "preact/hooks"
const {
    MachineUIPreferences,
    MachineFilesPreferences,
    initMachine,
    MachinePollingPreferences,
    resetPrefsErrors,
    getIcon,
    iconsList,
} = require(`../${process.env.TARGET_ENV}`)
import LangListRessource from "../../languages/language-list.json"
import { showDialog, updateProgress } from "../dialog"
import { setupWebSocket } from "../websocket"
import { showWizard, isWizardActive } from "./wizard"

/*
 * Local variables
 *
 */
let preferences
let prefs
let initdone = false
let pollingInterval = null
let needReload = false
let macros
let hasError = []
let panel_hasError = []
let selectedIcon = null

/*
 * Some constants
 */
const default_preferences =
    '{"settings":{"language":"en",\
    "banner": true,\
    "autoload" : true,\
    "sound" : true,\
    "mobileview" : false,\
    "showterminalpanel":true,\
    "openterminalonstart":false,\
    "showmacros":true,\
    "showextrapanels":false,\
    "extrapanels":[],\
    "expandmacrosbuttonsonstart":true,\
    "verbose":true,\
    "autoscroll":true,\
    "showfilespanel":true,\
    "openfilesonstart":false,\
    "showjogpanel":true},\
    "macros":[] }'
const preferencesFileName = "preferences.json"

/*
 * Polling commands
 */
function pollingFunction() {
    if (prefs.pollingcommands.length > 0) {
        let tcmd = prefs.pollingcommands.split(";")
        for (let cmd of tcmd) {
            cmd = cmd.trim()
            if (cmd.length > 0) SendCommand(cmd)
        }
    }
}

/*
 * Start polling query
 */
function startPolling() {
    stopPolling()
    console.log("Start polling")
    if (prefs.enablepolling) {
        pollingInterval = setInterval(
            pollingFunction,
            prefs.pollingrefresh * 1000
        )
    }
}

/*
 * Stop polling query
 */
function stopPolling() {
    if (pollingInterval != null) {
        clearInterval(pollingInterval)
    }
    pollingInterval = null
    console.log("Stop polling")
}

/*
 * Apply Preferences
 */
function updateUI() {
    const { dispatch } = useStoreon()
    let allkey = Object.keys(prefs)
    for (let p = 0; p < allkey.length; p++) {
        setState(allkey[p], "default")
    }
    if (typeof prefs.showmacros == "undefined") {
        prefs.showmacros = true
    }
    if (typeof prefs.showextrapanels == "undefined") {
        prefs.showextrapanels = true
    }
    if (typeof prefs.extrapanels == "undefined") {
        prefs.extrapanels = []
    }
    if (typeof prefs.mobileview == "undefined") {
        prefs.mobileview = false
    }
    if (typeof prefs.sound == "undefined") {
        prefs.sound = true
    }
    if (typeof prefs.expandmacrosbuttonsonstart == "undefined") {
        prefs.expandmacrosbuttonsonstart = true
    }
    if (typeof prefs.showterminalpanel == "undefined") {
        prefs.showterminalpanel = true
    }
    if (typeof prefs.showjogpanel == "undefined") {
        prefs.showjogpanel = true
    }
    if (typeof prefs.openterminalonstart == "undefined") {
        prefs.openterminalonstart = false
    }
    if (typeof prefs.autoscroll == "undefined") {
        prefs.autoscroll = false
    }
    if (typeof prefs.verbose == "undefined") {
        prefs.verbose = false
    }
    if (typeof prefs.showfilespanel == "undefined") {
        prefs.showfilespanel = true
    }
    if (typeof prefs.openfilesonstart == "undefined") {
        prefs.openterminalonstart = false
    }
    let pos = 0
    for (let p = 0; p < document.getElementsByTagName("Meta").length; p++) {
        if (document.getElementsByTagName("Meta")[p].content) {
            pos = p
        }
    }
    if (preferences.settings.mobileview == true) {
        document
            .getElementsByTagName("Meta")
            [pos].setAttribute("content", "width=575")
    } else {
        document
            .getElementsByTagName("Meta")
            [pos].setAttribute(
                "content",
                "initial-scale=1, maximum-scale=1, shrink-to-fit=yes"
            )
    }
    initMachine()
    loadLanguage(prefs.language)
    if (prefs.showterminalpanel == true) {
        dispatch("panel/showterminal", prefs.openterminalonstart)
    } else dispatch("panel/showterminal", false)
    if (prefs.showfilespanel == true) {
        dispatch("panel/showfiles", prefs.openfilesonstart)
    } else dispatch("panel/showfiles", false)
    showDialog({ displayDialog: false, refreshPage: true })
    startPolling()
}

/*
 * Got custom file
 */
function loadOEMSuccess(responseText) {
    try {
        let oemdata = JSON.parse(responseText)
        setCustomdata(oemdata)
    } catch (err) {
        console.log("invalid oem file")
    }
}

/*
 * Did nit get custom file so ignore it
 */
function loadOEMError(errorCode, responseText) {}

/*
 * Customize UI out of index
 */
function loadOEMfile() {
    const url = "/oem.json"
    SendGetHttp(url, loadOEMSuccess, loadOEMError)
}

/*
 * Function starting initialization
 */
function initApp() {
    preferences = JSON.parse(default_preferences)
    document.title = document.location.host
    showDialog({ type: "loader" })
    loadOEMfile()
    loadPreferences()
}

/*
 * To copy new preferences
 */
function setPreferences(data) {
    if (!data.settings) return false
    preferences = data
    if (typeof preferences.macros == "undefined") preferences.macros = []
    return true
}

/*
 * Load Preferences
 */
function loadPreferences() {
    const url = "/preferences.json?" + Date.now()
    SendGetHttp(url, loadPreferencesSuccess, loadPreferencesError)
    console.log("load preferences")
}

/*
 * Load Preferences query success
 */
function loadPreferencesSuccess(responseText) {
    try {
        let pref = JSON.parse(responseText)
        if (setPreferences(pref)) {
            prefs = JSON.parse(JSON.stringify(preferences.settings))
            if (typeof preferences.macros != "undefined") {
                macros = JSON.parse(JSON.stringify(preferences.macros))
            } else macros = []
            resetPrefsErrors()
            resetControlsErrors()
            updateUI()
        } else {
            showDialog({ type: "error", numError: 500, message: T("S21") })
        }
    } catch (err) {
        console.log("error")
        showDialog({ type: "error", numError: err, message: T("S7") })
    }
}

/*
 * Load Preferences query error
 */
function loadPreferencesError(errorCode, responseText) {
    console.log("no valid " + preferencesFileName + ", use default")
    if (errorCode == 404) {
        prefs = JSON.parse(JSON.stringify(preferences.settings))
        if (typeof preferences.macros != "undefined") {
            macros = JSON.parse(JSON.stringify(preferences.macros))
        } else macros = []
        updateUI()
    } else {
        showDialog({ type: "error", numError: errorCode, message: T("S7") })
    }
}

/*
 * Load language pack
 */
function loadLanguage(lang = "en") {
    const url = "/" + lang + ".json" + "?" + Date.now()
    if (lang == "en") {
        loadLanguageSuccess("en")
        return
    }
    SendGetHttp(url, loadLanguageSuccess, loadLanguageError)
    console.log("load language file " + "/" + lang + ".json")
}

/*
 * Load Language query success
 */
function loadLanguageSuccess(responseText) {
    hasError["ui"] = []
    try {
        if (responseText == "en") {
            setLang("en")
        } else {
            let langressource = JSON.parse(responseText)
            setLang(prefs.language, langressource)
        }
        const { dispatch } = useStoreon()
        hasError["ui"].language = false
        dispatch("errorcontrols/set", hasControlError())
        if (initdone) {
            updateState("language")
            if (isWizardActive()) {
                console.log("wizard on going")
                showWizard()
            } else showDialog({ displayDialog: false, refreshPage: true })
        } else {
            initdone = true
            loadConfig()
        }
    } catch (err) {
        console.log("error")
        console.error(responseText)
        if (initdone) {
            if (isWizardActive()) {
                showDialog({
                    type: "error",
                    numError: err,
                    message: T("S7"),
                    next1: showWizard,
                })
            } else
                showDialog({ type: "error", numError: err, message: T("S7") })
            setState("language", "error")

            hasError["ui"].language = true
            dispatch("errorcontrols/set", hasControlError())
        } else {
            initdone = true
            showDialog({
                type: "error",
                numError: err,
                message: T("S7"),
                next1: loadConfig,
            })
        }
    }
}

/*
 * Load Language query error
 */
function loadLanguageError(errorCode, responseText) {
    console.log("no valid /" + prefs.language + ".json.gz file, use default")
    if (initdone) {
        const { dispatch } = useStoreon()
        hasError["ui"] = []
        hasError["ui"].language = true
        dispatch("errorcontrols/set", hasControlError())
        if (isWizardActive()) {
            showDialog({
                type: "error",
                numError: errorCode,
                message: T("S67"),
                next1: showWizard,
            })
        } else
            showDialog({
                type: "error",
                numError: errorCode,
                message: T("S67"),
            })
        setState("language", "error")
    } else {
        initdone = true
        showDialog({
            type: "error",
            numError: err,
            message: T("S7"),
            next1: loadConfig,
        })
    }
}

/*
 * Load Firmware settings
 */
function loadConfig() {
    var d = new Date()
    var PCtime =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0") +
        "-" +
        String(d.getHours()).padStart(2, "0") +
        "-" +
        String(d.getMinutes()).padStart(2, "0") +
        "-" +
        String(d.getSeconds()).padStart(2, "0")
    const cmd = "[ESP800]" + "time=" + PCtime
    showDialog({ type: "loader", message: T("S1") })
    console.log("load FW config")
    SendCommand(cmd, loadConfigSuccess, loadConfigError, null, "noterminal")
}

/*
 * Load Firmware settings query success
 */
function loadConfigSuccess(responseText) {
    var data = {}
    try {
        data = JSON.parse(responseText)
        applyConfig(data)
        if (data.WebSocketIP && data.WebCommunication && data.WebSocketport) {
            setupWebSocket(
                data.WebCommunication,
                document.location.hostname,
                data.WebSocketport
            )
        }
    } catch (e) {
        console.log("Parsing error:", e)
        console.log(responseText)
        showDialog({ type: "error", numError: e, message: T("S4") })
    }
}

/*
 * Load Firmware settings query error
 */
function loadConfigError(errorCode, responseText) {
    showDialog({ type: "error", numError: errorCode, message: T("S5") })
}

/*
 * Load Import File
 *
 */
function loadImportFile() {
    let importFile = document.getElementById("importPControl").files
    let reader = new FileReader()
    reader.onload = function (e) {
        var contents = e.target.result
        console.log(contents)
        try {
            let pref = JSON.parse(contents)
            if (setPreferences(pref)) {
                prefs = JSON.parse(JSON.stringify(preferences.settings))
                if (typeof preferences.macros != "undefined") {
                    macros = JSON.parse(JSON.stringify(preferences.macros))
                } else macros = []
                savePreferences()
                updateUI()
            } else {
                showDialog({ type: "error", message: T("S21") })
            }
        } catch (e) {
            document.getElementById("importPControl").value = ""
            console.error("Parsing error:", e)
            showDialog({ type: "error", numError: e, message: T("S21") })
        }
    }
    reader.readAsText(importFile[0])
    closeImport()
}

/*
 * Cancel import
 *
 */
function cancelImport() {
    showDialog({ displayDialog: false })
    console.log("stopping import")
}

/*
 * Close import
 *
 */
function closeImport() {
    document.getElementById("importPControl").value = ""
    showDialog({ displayDialog: false })
}

/*
 * Prepare Settings Import
 *
 */
function importSettings() {
    document.getElementById("importPControl").click()
    document.getElementById("importPControl").onchange = () => {
        let importFile = document.getElementById("importPControl").files
        let fileList = []
        let message = []
        fileList.push(<div>{T("S56")}</div>)
        fileList.push(<br />)
        for (let i = 0; i < importFile.length; i++) {
            fileList.push(<li>{importFile[i].name}</li>)
        }
        message.push(
            <center>
                <div style="text-align: left; display: inline-block; overflow: hidden;text-overflow: ellipsis;">
                    <ul>{fileList}</ul>
                </div>
            </center>
        )
        showDialog({
            type: "confirmation",
            message: message,
            title: T("S26"),
            button1text: T("S27"),
            next1: loadImportFile,
            next2: closeImport,
        })
    }
}

/*
 * Saves Preferences
 */
function saveAndApply() {
    savePreferences()
}

/*
 * Close dialog
 *
 */
function closeDialog() {
    showDialog({ refreshPage: true, displayDialog: false })
    if (needReload) document.location.reload(true)
}

/*
 * Upload sucess
 *
 */
function successUpload(response) {
    prefs = JSON.parse(JSON.stringify(preferences.settings))
    if (typeof preferences.macros != "undefined") {
        macros = JSON.parse(JSON.stringify(preferences.macros))
    } else macros = []
    let allkey = Object.keys(prefs)
    for (let p = 0; p < allkey.length; p++) {
        setState(allkey[p], "success")
    }

    for (let p = 0; p < macros.length; p++) {
        setState("name", "success", p)
        setState("color", "success", p)
        setState("textcolor", "success", p)
        setState("icon", "success", p)
        setState("target", "success", p)
        setState("parameter", "success", p)
    }
    for (let p = 0; p < prefs.extrapanels.length; p++) {
        setState("name", "success", p, "panel")
        setState("color", "success", p, "panel")
        setState("textcolor", "success", p, "panel")
        setState("icon", "success", p, "panel")
        setState("target", "success", p, "panel")
        setState("source", "success", p, "panel")
        setState("refreshtime", "success", p, "panel")
        setState("type", "success", p, "panel")
    }
    startPolling()
    updateProgress({ progress: 100 })
    setTimeout(closeDialog, 2000)
}

/*
 * Cancel upload silently
 * e.g: user pressed cancel before upload
 */
function cancelUpload() {
    cancelCurrentQuery()
    showDialog({ displayDialog: false })
}

/*
 * Upload failed
 *
 */
function errorUpload(errorCode, response) {
    console.log("error upload code : " + lastError.code + " " + errorCode)
    clearUploadInformation()
    if (!lastError.code && errorCode == 0) {
        cancelCurrentQuery(errorCode, response)
    }
}

/*
 * Upload progress
 *
 */
function progressUpload(oEvent) {
    if (oEvent.lengthComputable) {
        var percentComplete = (oEvent.loaded / oEvent.total) * 100
        console.log(percentComplete.toFixed(0) + "%")
        updateProgress({ progress: percentComplete.toFixed(0) })
    } else {
        // Impossible because size is unknown
    }
}

/*
 * Save Preferences query
 */
function savePreferences() {
    if (prefs.mobileview != preferences.settings.mobileview) needReload = true
    // do some sanity check
    preferences.settings = JSON.parse(JSON.stringify(prefs))
    preferences.macros = JSON.parse(JSON.stringify(macros))
    var blob = new Blob([JSON.stringify(preferences, null, " ")], {
        type: "application/json",
    })
    let progressDlg = {
        type: "progress",
        title: T("S32"),
        button1text: T("S28"),
        next1: cancelUpload,
        progress: 0,
    }
    var file = new File([blob], preferencesFileName)
    var formData = new FormData()
    var url = "/files"
    formData.append("path", "/")
    formData.append("myfile", file, preferencesFileName)
    SendPostHttp(
        url,
        formData,
        successUpload,
        errorUpload,
        progressUpload,
        progressDlg
    )
}

/*
 * Export Settings
 *
 */
function exportSettings() {
    let data, file
    let p = 0
    const filename = preferencesFileName
    file = new Blob([JSON.stringify(preferences, null, " ")], {
        type: "application/json",
    })
    if (window.navigator.msSaveOrOpenBlob)
        // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename)
    else {
        // Others
        let a = document.createElement("a"),
            url = URL.createObjectURL(file)
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

/*
 *Set state of control
 */
function setState(entry, state, index = null, target = "macro") {
    let controlId
    let controlIdLabel
    let controlIdUnit
    let controlIdButton

    if (index != null) {
        const { dispatch } = useStoreon()
        if (target == "macro") {
            hasError[index][entry] = state == "error"
            dispatch("errorcontrols/set", hasControlError())
            if (document.getElementById(entry + "_" + index + "-UI-input")) {
                controlId = document.getElementById(
                    entry + "_" + index + "-UI-input"
                )
            }
            if (document.getElementById(entry + "_" + index + "-UI-label")) {
                controlIdLabel = document.getElementById(
                    entry + "_" + index + "-UI-label"
                )
            }
            if (document.getElementById(entry + "_" + index + "-UI-select")) {
                controlId = document.getElementById(
                    entry + "_" + index + "-UI-select"
                )
                controlIdLabel = document.getElementById(
                    entry + "_" + index + "-UI-label"
                )
            }
        } else {
            panel_hasError[index][entry] = state == "error"
            dispatch("errorcontrols/set", hasControlError())
            if (
                document.getElementById(
                    "panel_" + entry + "_" + index + "-UI-input"
                )
            ) {
                controlId = document.getElementById(
                    "panel_" + entry + "_" + index + "-UI-input"
                )
            }
            if (
                document.getElementById(
                    "panel_" + entry + "_" + index + "-UI-label"
                )
            ) {
                controlIdLabel = document.getElementById(
                    "panel_" + entry + "_" + index + "-UI-label"
                )
            }
            if (
                document.getElementById(
                    "panel_" + entry + "_" + index + "-UI-unit"
                )
            ) {
                controlIdUnit = document.getElementById(
                    "panel_" + entry + "_" + index + "-UI-unit"
                )
            }
            if (
                document.getElementById(
                    "panel_" + entry + "_" + index + "-UI-select"
                )
            ) {
                controlId = document.getElementById(
                    "panel_" + entry + "_" + index + "-UI-select"
                )
            }
        }
    } else {
        if (document.getElementById(entry + "-UI-checkbox"))
            controlId = document.getElementById(entry + "-UI-checkbox")
        if (document.getElementById(entry + "-UI-input")) {
            controlId = document.getElementById(entry + "-UI-input")
            controlIdLabel = document.getElementById(entry + "-UI-label")
            controlIdUnit = document.getElementById(entry + "-UI-unit")
        }
        if (document.getElementById(entry + "-UI-select")) {
            controlId = document.getElementById(entry + "-UI-select")
            controlIdLabel = document.getElementById(entry + "-UI-label")
        }
    }
    if (controlId) {
        controlId.classList.remove("is-valid")
        controlId.classList.remove("is-changed")
        controlId.classList.remove("is-invalid")
        switch (state) {
            case "modified":
                controlId.classList.add("is-changed")
                break
            case "success":
                controlId.classList.add("is-valid")
                break
            case "error":
                controlId.classList.add("is-invalid")
                break
            default:
                break
        }
    }
    if (controlIdLabel) {
        controlIdLabel.classList.remove("error")
        controlIdLabel.classList.remove("success")
        controlIdLabel.classList.remove("bg-warning")
        switch (state) {
            case "modified":
                controlIdLabel.classList.add("bg-warning")
                break
            case "success":
                controlIdLabel.classList.add("success")
                break
            case "error":
                controlIdLabel.classList.add("error")
                break
            default:
                break
        }
    }
    if (controlIdUnit) {
        controlIdUnit.classList.remove("error")
        controlIdUnit.classList.remove("success")
        controlIdUnit.classList.remove("bg-warning")
        switch (state) {
            case "modified":
                controlIdUnit.classList.add("bg-warning")
                break
            case "success":
                controlIdUnit.classList.add("success")
                break
            case "error":
                controlIdUnit.classList.add("error")
                break
            default:
                break
        }
    }
}

/*
 * Change state of control according context / check
 */
function updateState(entry, index = null, target = "macro") {
    let state = "default"
    if (index == null) {
        if (preferences.settings[entry] != prefs[entry]) {
            console.log(entry)
            state = "modified"
        }
        if (entry == "language") {
            if (hasError["ui"].language) state = "error"
        }
    } else {
        if (target == "macro") {
            //macros

            if (typeof preferences.macros[index] == "undefined") {
                state = "modified"
            } else if (
                preferences.macros[index][entry] != macros[index][entry]
            ) {
                state = "modified"
            }
            if (macros[index][entry].length == 0) {
                state = "error"
            }
            if (document.getElementById(entry + "_" + index + "-UI-select")) {
                if (
                    document.getElementById(entry + "_" + index + "-UI-select")
                        .value.length == 0
                )
                    state = "error"
            }
        } else {
            //panel

            if (typeof preferences.settings.extrapanels[index] == "undefined") {
                state = "modified"
            } else if (
                preferences.settings.extrapanels[index][entry] !=
                prefs.extrapanels[index][entry]
            ) {
                state = "modified"
            }
            if (
                !prefs.extrapanels[index][entry] ||
                prefs.extrapanels[index][entry].length == 0
            ) {
                state = "error"
            }
            if (entry == "refreshtime") {
                if (prefs.extrapanels[index][entry] < 0) {
                    state = "error"
                }
            }
            if (
                document.getElementById(
                    "panel_" + entry + "_" + index + "-UI-select"
                )
            ) {
                if (
                    document.getElementById(
                        "panel_" + entry + "_" + index + "-UI-select"
                    ).value.length == 0
                )
                    state = "error"
            }
        }
    }
    setState(entry, state, index, target)
}

/*
 * Check box control
 */
const CheckboxControl = ({ entry, title, label }) => {
    const toggleCheckbox = (e) => {
        prefs[entry] = e.target.checked
        showDialog({ displayDialog: false, refreshPage: true })
    }
    let id = entry + "-UI-checkbox"
    useEffect(() => {
        updateState(entry)
    }, [prefs[entry]])
    return (
        <label class="checkbox-control" id={id} title={title}>
            {label}
            <input
                type="checkbox"
                checked={prefs[entry]}
                onChange={toggleCheckbox}
            />
            <span class="checkmark"></span>
        </label>
    )
}

/*
 * Generate a select control
 */
const LanguageSelection = () => {
    let optionList = []
    const onChange = (e) => {
        prefs.language = e.target.value
        loadLanguage(prefs.language)
    }
    useEffect(() => {
        updateState("language")
    }, [prefs.language])
    let key = Object.keys(LangListRessource)
    let val = Object.values(LangListRessource)
    for (let p = 0; p < key.length; p++) {
        let st = null
        optionList.push(
            <option value={key[p]} style={st}>
                {val[p]}
            </option>
        )
    }
    return (
        <div style="margin-bottom: 15px" title={T("S69")}>
            <div class="input-group">
                <div class="input-group-prepend">
                    <span id="language-UI-label" class="input-group-text">
                        <Globe />
                        <span class="hide-low text-button">{T("S68")}</span>
                    </span>
                </div>

                <select
                    id="language-UI-select"
                    class="form-control"
                    value={prefs.language}
                    onChange={onChange}
                >
                    {optionList}
                </select>
            </div>
        </div>
    )
}

/*
 * Copy preferences settings to prefs
 *
 */
function setcurrentprefs(preferences) {
    //lets make a copy
    prefs = JSON.parse(JSON.stringify(preferences.settings))
    if (typeof preferences.macros != "undefined") {
        macros = JSON.parse(JSON.stringify(preferences.macros))
    } else macros = []
}

/*
 * Check if any error
 *
 */
function hasControlError() {
    for (let index = 0; index < hasError.length; index++) {
        if (
            hasError[index].name ||
            hasError[index].parameter ||
            hasError[index].target
        )
            return true
    }
    for (let index = 0; index < panel_hasError.length; index++) {
        if (
            panel_hasError[index].name ||
            panel_hasError[index].source ||
            panel_hasError[index].refreshtime ||
            panel_hasError[index].target ||
            panel_hasError[index].type
        )
            return true
    }
    if (typeof hasError["ui"] != "undefined") {
        if (hasError["ui"].language) {
            console.log("we have error on language")
            return true
        }
    }
    return false
}

/*
 * Reset  macros errors
 *
 */
function resetControlsErrors() {
    hasError = []
    panel_hasError = []
    const { dispatch } = useStoreon()
    dispatch("errorcontrols/set", hasControlError())
}

/*
 * Add macro function
 */
function addMacro() {
    let newindex = macros.length
    let macroname = T("S127") + (newindex + 1)
    macros.push({
        name: macroname,
        target: "FS",
        color: "#C0C0C0",
        textcolor: "#000000",
        icon: "Globe",
        parameter: "/",
    })
    showDialog({ displayDialog: false, refreshPage: true })
}

/*
 * Add panel function
 */
function addPanel() {
    let newindex = prefs.extrapanels.length
    let panelname = T("S157") + (newindex + 1)
    prefs.extrapanels.push({
        id: Date.now(),
        name: panelname,
        color: "#C0C0C0",
        textcolor: "#000000",
        icon: "Globe",
        target: "panel",
        source: "http://127.0.0.1",
        refreshtime: "0",
        type: "content",
    })
    showDialog({ displayDialog: false, refreshPage: true })
}

/*
 * Icon Macro for selection
 */
const IconUIEntry = ({ index, name, target }) => {
    const selectControlIcon = (e) => {
        if (target == "panel") {
            prefs.extrapanels[index].icon = name
        } else {
            macros[index].icon = name
        }
        showDialog({ refreshPage: true, displayDialog: false })
    }
    return (
        <div class="p-1 hotspotControl border" onclick={selectControlIcon}>
            {iconsList[name]}
        </div>
    )
}

/*
 * MacroUISelectTarget
 */
const MacroUISelectTarget = ({ index, id, label }) => {
    const onChange = (e) => {
        macros[index][id] = e.target.value
        updateState(id, index)
    }
    const onFocus = (e) => {
        document
            .getElementById(id + "_" + index + "-UI-label")
            .classList.remove("d-none")
    }
    const onFocusOut = (e) => {
        document
            .getElementById(id + "_" + index + "-UI-label")
            .classList.add("d-none")
    }
    useEffect(() => {
        updateState(id, index)
    }, [macros[index][id], prefs.tftusb, prefs.tftsd, prefs.printersd])
    let options = []
    if (
        esp3dSettings.SDConnection == "direct" ||
        esp3dSettings.SDConnection == "shared" ||
        prefs.printersd
    )
        options.push(
            <option
                value="TARGETSD"
                title={process.env.TARGET_ENV == "grbl" ? T("S144") : T("S143")}
            >
                {process.env.TARGET_ENV == "grbl" ? T("S144") : T("S143")}
            </option>
        )
    if (prefs.tftsd)
        options.push(
            <option value="TFTSD" title="TFT SD">
                TFT SD
            </option>
        )
    if (prefs.tftusb)
        options.push(
            <option value="TFTUSB" title="TFT USB">
                TFT USB
            </option>
        )
    return (
        <div class="p-1 hotspotControl" title={label}>
            <div class="input-group">
                <div class="input-group-prepend">
                    <span
                        class="input-group-text d-none"
                        id={id + "_" + index + "-UI-label"}
                    >
                        {label}
                    </span>
                </div>

                <select
                    id={id + "_" + index + "-UI-select"}
                    class="form-control"
                    value={macros[index][id]}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onFocusOut}
                >
                    <option value="FS" title={T("S137")}>
                        {T("S137")}
                    </option>
                    {options}
                    <option value="URI" title={T("S139")}>
                        URI
                    </option>
                    <option value="CMD" title={T("S140")}>
                        {T("S142")}
                    </option>
                </select>
                <div
                    class="invalid-feedback text-center"
                    style="text-align:center!important"
                >
                    {T("S42")}
                </div>
            </div>
        </div>
    )
}

/*
 * PanelUISelectControl
 */
const PanelUISelectControl = ({ index, id, label, options }) => {
    const onChange = (e) => {
        prefs.extrapanels[index][id] = e.target.value
        if (id == "type" && e.target.value == "camera") {
            if (!prefs.extrapanels[index]["source"].startsWith("/snap")) {
                prefs.extrapanels[index]["source"] = "/snap"
                document.getElementById(
                    "panel_source_" + index + "-UI-input"
                ).value = "/snap"
            }
        }
        updateState(id, index, "panel")
    }
    const onFocus = (e) => {
        document
            .getElementById("panel_" + id + "_" + index + "-UI-label")
            .classList.remove("d-none")
    }
    const onFocusOut = (e) => {
        document
            .getElementById("panel_" + id + "_" + index + "-UI-label")
            .classList.add("d-none")
    }
    useEffect(() => {
        updateState(id, index, "panel")
    }, [prefs.extrapanels[index][id]])
    return (
        <div class="p-1 hotspotControl" title={label}>
            <div class="input-group">
                <div class="input-group-prepend">
                    <span
                        class="input-group-text d-none"
                        id={"panel_" + id + "_" + index + "-UI-label"}
                    >
                        {label}
                    </span>
                </div>

                <select
                    id={"panel_" + id + "_" + index + "-UI-select"}
                    class="form-control"
                    value={prefs.extrapanels[index][id]}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onFocusOut}
                >
                    {options}
                </select>
                <div
                    class="invalid-feedback text-center"
                    style="text-align:center!important"
                >
                    {T("S42")}
                </div>
            </div>
        </div>
    )
}

/*
 * MacroUIEntry
 */
const MacroUIEntry = ({ index, id, label }) => {
    const onInput = (e) => {
        macros[index][id] = e.target.value
        updateState(id, index)
    }
    const onFocus = (e) => {
        document
            .getElementById(id + "_" + index + "-UI-label")
            .classList.remove("d-none")
    }
    const onFocusOut = (e) => {
        document
            .getElementById(id + "_" + index + "-UI-label")
            .classList.add("d-none")
    }
    const showListIcons = (e) => {
        let list = []
        let message = []
        let allkey = Object.keys(iconsList)
        for (let n = 0; n < allkey.length; n++) {
            list.push(
                <IconUIEntry index={index} name={allkey[n]} target="macro" />
            )
        }
        message.push(<div class="d-flex flex-wrap">{list}</div>)
        selectedIcon = null
        showDialog({
            type: "custom",
            message: message,
            title: T("S134"),
            button1text: T("S28"),
        })
    }
    if (typeof hasError[index] == "undefined") hasError[index] = []
    useEffect(() => {
        updateState(id, index)
    }, [macros[index][id]])
    if (id == "icon") {
        return (
            <div class="p-1 hotspotControl">
                <div
                    class="input-group-text p-1"
                    id={id + "_" + index + "-UI-label"}
                >
                    <button
                        class="btn btn-sm"
                        style={
                            "background-color:" +
                            macros[index].color +
                            ";color:" +
                            macros[index].textcolor
                        }
                        onclick={showListIcons}
                    >
                        {getIcon(macros[index].icon)}
                    </button>
                </div>
            </div>
        )
    } else if (id == "color" || id == "textcolor") {
        return (
            <div class="p-1 hotspotControl">
                <div
                    class="input-group-text p-1"
                    id={id + "_" + index + "-UI-label"}
                >
                    <input
                        title={label}
                        style="width:1.4em;heigth:1.4em"
                        id={id + "_" + index + "-UI-input"}
                        onInput={onInput}
                        type="color"
                        value={macros[index][id]}
                    />
                </div>
            </div>
        )
    } else {
        let desc = label
        if (id != "name") {
            if (macros[index].target == "CMD") desc = T("S140")
            else if (macros[index].target == "URI") desc = T("S139")
            else desc = T("S141")
        }
        return (
            <div class="p-1 hotspotControl">
                <div class="input-group" title={desc}>
                    <div class="input-group-prepend">
                        <span
                            class="input-group-text d-none"
                            id={id + "_" + index + "-UI-label"}
                        >
                            {desc}
                        </span>
                    </div>
                    <input
                        id={id + "_" + index + "-UI-input"}
                        onInput={onInput}
                        onFocus={onFocus}
                        onBlur={onFocusOut}
                        type="text"
                        style="max-width:8em"
                        class="form-control rounded-right"
                        placeholder={T("S41")}
                        value={macros[index][id]}
                    />
                    <div
                        class="invalid-feedback text-center"
                        style="text-align:center!important"
                    >
                        {T("S42")}
                    </div>
                </div>
            </div>
        )
    }
}

/*
 * PanelUIEntry
 */
const PanelUIEntry = ({ index, id, label }) => {
    const onInput = (e) => {
        prefs.extrapanels[index][id] = e.target.value
        updateState(id, index, "panel")
    }
    const onFocus = (e) => {
        document
            .getElementById("panel_" + id + "_" + index + "-UI-label")
            .classList.remove("d-none")
    }
    const onFocusOut = (e) => {
        document
            .getElementById("panel_" + id + "_" + index + "-UI-label")
            .classList.add("d-none")
    }
    const showListIcons = (e) => {
        let list = []
        let message = []
        let allkey = Object.keys(iconsList)
        for (let n = 0; n < allkey.length; n++) {
            list.push(
                <IconUIEntry index={index} name={allkey[n]} target="panel" />
            )
        }
        message.push(<div class="d-flex flex-wrap">{list}</div>)
        selectedIcon = null
        showDialog({
            type: "custom",
            message: message,
            title: T("S134"),
            button1text: T("S28"),
        })
    }
    if (typeof panel_hasError[index] == "undefined") panel_hasError[index] = []
    useEffect(() => {
        updateState(id, index, "panel")
    }, [prefs.extrapanels[index][id]])
    if (id == "icon") {
        return (
            <div class="p-1 hotspotControl">
                <div
                    class="input-group-text p-1"
                    id={"panel_" + id + "_" + index + "-UI-label"}
                >
                    <button
                        class="btn btn-sm"
                        style={
                            "background-color:" +
                            prefs.extrapanels[index].color +
                            ";color:" +
                            prefs.extrapanels[index].textcolor
                        }
                        onclick={showListIcons}
                    >
                        {getIcon(prefs.extrapanels[index].icon)}
                    </button>
                </div>
            </div>
        )
    } else if (id == "color" || id == "textcolor") {
        return (
            <div class="p-1 hotspotControl">
                <div
                    class="input-group-text p-1"
                    id={"panel_" + id + "_" + index + "-UI-label"}
                >
                    <input
                        title={label}
                        style="width:1.4em;heigth:1.4em"
                        id={"panel_" + id + "_" + index + "-UI-input"}
                        onInput={onInput}
                        type="color"
                        value={prefs.extrapanels[index][id]}
                    />
                </div>
            </div>
        )
    } else {
        return (
            <div class="p-1 hotspotControl">
                <div class="input-group" title={label}>
                    <div class="input-group-prepend">
                        <span
                            class="input-group-text d-none"
                            id={"panel_" + id + "_" + index + "-UI-label"}
                        >
                            {label}
                        </span>
                    </div>
                    <input
                        id={"panel_" + id + "_" + index + "-UI-input"}
                        onInput={onInput}
                        onFocus={onFocus}
                        onBlur={onFocusOut}
                        min="0"
                        type={id == "refreshtime" ? "number" : "text"}
                        style={
                            id == "refreshtime"
                                ? "max-width:6em"
                                : "max-width:8em"
                        }
                        class="form-control rounded-right"
                        placeholder={T("S41")}
                        value={prefs.extrapanels[index][id]}
                    />
                    <div
                        class={
                            id == "refreshtime"
                                ? "input-group-append"
                                : "d-none"
                        }
                    >
                        <span
                            class="input-group-text hide-low rounded-right"
                            id={"panel_" + id + "_" + index + "-UI-unit"}
                        >
                            {T("S114")}
                        </span>
                    </div>
                    <div
                        class="invalid-feedback text-center"
                        style="text-align:center!important"
                    >
                        {T("S42")}
                    </div>
                </div>
            </div>
        )
    }
}

/*
 * ControlListLine
 */
const ControlListLine = ({ data, index, target }) => {
    let border_bottom = ""
    const deleteControlLine = (e) => {
        let newlinetmp = []
        let listsize
        if (target == "panel") {
            listsize = prefs.extrapanels.length
        } else {
            listsize = macros.length
        }
        for (let p = 0; p < listsize; p++) {
            if (p != index) {
                if (target == "panel") {
                    newlinetmp.push(prefs.extrapanels[p])
                } else {
                    newlinetmp.push(macros[p])
                }
            }
        }
        if (target == "panel") {
            prefs.extrapanels = JSON.parse(JSON.stringify(newlinetmp))
        } else {
            macros = JSON.parse(JSON.stringify(newlinetmp))
        }
        showDialog({ displayDialog: false, refreshPage: true })
    }
    const upControlLine = (e) => {
        let newlinetmp = []
        let listsize
        if (target == "panel") {
            listsize = prefs.extrapanels.length
        } else {
            listsize = macros.length
        }
        for (let p = 0; p < listsize; p++) {
            if (p == index) {
                let prevline = newlinetmp.pop()
                if (target == "panel") {
                    newlinetmp.push(prefs.extrapanels[p])
                } else {
                    newlinetmp.push(macros[p])
                }
                newlinetmp.push(prevline)
            } else {
                if (target == "panel") {
                    newlinetmp.push(prefs.extrapanels[p])
                } else {
                    newlinetmp.push(macros[p])
                }
            }
        }
        if (target == "panel") {
            prefs.extrapanels = JSON.parse(JSON.stringify(newlinetmp))
        } else {
            macros = JSON.parse(JSON.stringify(newlinetmp))
        }
        showDialog({ displayDialog: false, refreshPage: true })
    }
    const downControlLine = (e) => {
        let newlinetmp = []
        let listsize
        if (target == "panel") {
            listsize = prefs.extrapanels.length
        } else {
            listsize = macros.length
        }
        for (let p = 0; p < listsize; p++) {
            if (p == index) {
                p++
                if (target == "panel") {
                    newlinetmp.push(prefs.extrapanels[p])
                    newlinetmp.push(prefs.extrapanels[p - 1])
                } else {
                    newlinetmp.push(macros[p])
                    newlinetmp.push(macros[p - 1])
                }
            } else {
                if (target == "panel") {
                    newlinetmp.push(prefs.extrapanels[p])
                } else {
                    newlinetmp.push(macros[p])
                }
            }
        }
        if (target == "panel") {
            prefs.extrapanels = JSON.parse(JSON.stringify(newlinetmp))
        } else {
            macros = JSON.parse(JSON.stringify(newlinetmp))
        }
        showDialog({ displayDialog: false, refreshPage: true })
    }
    let listsize
    let content = []
    if (target == "panel") {
        listsize = prefs.extrapanels.length
        let optionstarget = []
        let optionstype = []
        optionstarget.push(
            <option value="panel" title={T("S157")}>
                {T("S157")}
            </option>
        )
        optionstarget.push(
            <option value="page" title={T("S158")}>
                {T("S158")}
            </option>
        )
        optionstype.push(
            <option value="image" title={T("S160")}>
                {T("S160")}
            </option>
        )
        optionstype.push(
            <option value="content" title={T("S161")}>
                {T("S161")}
            </option>
        )
        if (typeof esp3dSettings.Cam_name != "undefined") {
            optionstype.push(
                <option value="camera" title={T("S162")}>
                    {esp3dSettings.Cam_name}
                </option>
            )
        }
        content.push(<PanelUIEntry index={index} id="name" label={T("S129")} />)
        content.push(
            <PanelUIEntry index={index} id="color" label={T("S130")} />
        )
        content.push(
            <PanelUIEntry index={index} id="textcolor" label={T("S131")} />
        )
        content.push(<PanelUIEntry index={index} id="icon" label={T("S132")} />)
        content.push(
            <PanelUISelectControl
                index={index}
                id="target"
                label={T("S159")}
                options={optionstarget}
            />
        )
        content.push(
            <PanelUISelectControl
                index={index}
                id="type"
                label={T("S135")}
                options={optionstype}
            />
        )
        content.push(
            <PanelUIEntry index={index} id="source" label={T("S139")} />
        )
        content.push(
            <PanelUIEntry index={index} id="refreshtime" label={T("S113")} />
        )
    } else {
        listsize = macros.length
        content.push(<MacroUIEntry index={index} id="name" label={T("S129")} />)
        content.push(
            <MacroUIEntry index={index} id="color" label={T("S130")} />
        )
        content.push(
            <MacroUIEntry index={index} id="textcolor" label={T("S131")} />
        )
        content.push(<MacroUIEntry index={index} id="icon" label={T("S132")} />)
        content.push(
            <MacroUISelectTarget index={index} id="target" label={T("S136")} />
        )
        content.push(
            <MacroUIEntry index={index} id="parameter" label={T("S141")} />
        )
    }
    if (index != listsize - 1) border_bottom = " border-bottom"
    return (
        <div class={"d-flex flex-wrap p-1 align-items-center " + border_bottom}>
            <div class="p-1 hotspotControl">
                <button
                    type="button"
                    class="btn btn-outline-danger  btn-sm"
                    onclick={deleteControlLine}
                >
                    <Trash2 />
                </button>
            </div>
            <div class="d-flex flex-column">
                <div class={index != 0 ? "hotspotControl p-1" : "d-none"}>
                    <button
                        type="button"
                        class="btn btn-outline-secondary  btn-sm"
                        onclick={upControlLine}
                    >
                        <ArrowUp />
                    </button>
                </div>
                <div
                    class={
                        index != listsize - 1 ? "hotspotControl p-1" : "d-none"
                    }
                >
                    <button
                        type="button"
                        class="btn btn-outline-secondary btn-sm"
                        onclick={downControlLine}
                    >
                        <ArrowDown />
                    </button>
                </div>
            </div>
            <div class="d-flex flex-wrap  align-items-center justify-content-around">
                {content}
            </div>
        </div>
    )
}

const MacroListControl = () => {
    let content = []
    let contentList = []
    for (let i = 0; i < macros.length; i++) {
        contentList.push(
            <ControlListLine data={macros[i]} index={i} target="macro" />
        )
    }
    useEffect(() => {}, [macros])
    return <div class="macrolist d-flex flex-column">{contentList}</div>
}

const PanelListControl = () => {
    let content = []
    let contentList = []
    for (let i = 0; i < prefs.extrapanels.length; i++) {
        contentList.push(
            <ControlListLine
                data={prefs.extrapanels[i]}
                index={i}
                target="panel"
            />
        )
    }
    useEffect(() => {}, [prefs.extrapanels])
    return <div class="panellist d-flex flex-column">{contentList}</div>
}

/*
 * Settings page
 *
 */
const WebUISettings = ({ currentPage }) => {
    const { preferences_error } = useStoreon("preferences_error")
    const { controls_error } = useStoreon("controls_error")
    if (currentPage != Setting.ui) return null
    if (typeof prefs == "undefined") {
        console.log("render undefined")
    }
    return (
        <div>
            <hr />
            <center>
                <div class="list-left">
                    <LanguageSelection />
                    <CheckboxControl
                        entry="banner"
                        title={T("S65")}
                        label={T("S63")}
                    />
                    <CheckboxControl
                        entry="autoload"
                        title={T("S66")}
                        label={T("S64")}
                    />
                    <CheckboxControl
                        entry="sound"
                        title={T("S169")}
                        label={T("S170")}
                    />
                    <CheckboxControl
                        entry="mobileview"
                        title={T("S122")}
                        label={T("S122")}
                    />
                    <div class="p-2" />
                    <MachinePollingPreferences />
                    <div class="p-2" />
                    <div class="card">
                        <div class="card-header">
                            <CheckboxControl
                                entry="showterminalpanel"
                                title={T("S92")}
                                label={T("S92")}
                            />
                        </div>
                        <div
                            class={
                                prefs["showterminalpanel"]
                                    ? "card-body"
                                    : "d-none"
                            }
                        >
                            <CheckboxControl
                                entry="openterminalonstart"
                                title={T("S93")}
                                label={T("S93")}
                            />
                            <div class="p-1" />
                            <CheckboxControl
                                entry="verbose"
                                title={T("S76")}
                                label={T("S76")}
                            />
                            <CheckboxControl
                                entry="autoscroll"
                                title={T("S77")}
                                label={T("S77")}
                            />
                            <div class="p-1" />
                        </div>
                    </div>
                    <div class="p-2" />
                    <div class="card">
                        <div class="card-header">
                            <CheckboxControl
                                entry="showfilespanel"
                                title={T("S95")}
                                label={T("S95")}
                            />
                        </div>
                        <div
                            class={
                                prefs["showfilespanel"] ? "card-body" : "d-none"
                            }
                        >
                            <CheckboxControl
                                entry="openfilesonstart"
                                title={T("S93")}
                                label={T("S93")}
                            />
                            <div class="p-1" />
                            <MachineFilesPreferences />
                        </div>
                    </div>
                    <div class="p-2" />
                    <div class="card">
                        <div class="card-header">
                            <CheckboxControl
                                entry="showmacros"
                                title={T("S119")}
                                label={T("S119")}
                            />
                        </div>
                        <div
                            class={prefs["showmacros"] ? "card-body" : "d-none"}
                        >
                            <CheckboxControl
                                entry="expandmacrosbuttonsonstart"
                                title={T("S120")}
                                label={T("S120")}
                            />
                            <div class="p-1" />
                            <button
                                type="button"
                                class="btn btn-primary"
                                title={T("S128")}
                                onClick={addMacro}
                            >
                                <PlusSquare />
                                <span class="hide-low text-button">
                                    {T("S128")}
                                </span>
                            </button>
                            <div class="p-1" />
                            <MacroListControl />
                        </div>
                    </div>
                    <div class="p-2" />
                    <MachineUIPreferences />
                    <div class="p-2" />
                    <div class="card">
                        <div class="card-header">
                            <CheckboxControl
                                entry="showextrapanels"
                                title={T("S155")}
                                label={T("S155")}
                            />
                        </div>
                        <div
                            class={
                                prefs["showextrapanels"]
                                    ? "card-body"
                                    : "d-none"
                            }
                        >
                            <button
                                type="button"
                                class="btn btn-primary"
                                title={T("S156")}
                                onClick={addPanel}
                            >
                                <PlusSquare />
                                <span class="hide-low text-button">
                                    {T("S156")}
                                </span>
                            </button>
                            <div class="p-1" />
                            <PanelListControl />
                        </div>
                    </div>
                </div>
            </center>

            <hr />
            <center>
                <span class="text-button-setting">
                    <button
                        type="button"
                        class="btn btn-primary"
                        title={T("S23")}
                        onClick={loadPreferences}
                    >
                        <RefreshCcw />
                        <span class="hide-low text-button">{T("S50")}</span>
                    </button>
                </span>
                <span
                    class={
                        preferences.settings ? "text-button-setting" : " d-none"
                    }
                >
                    <button
                        type="button"
                        class="btn btn-primary"
                        title={T("S55")}
                        onClick={importSettings}
                    >
                        <Download />
                        <span class="hide-low text-button">{T("S54")}</span>
                    </button>
                </span>
                <span
                    class={
                        preferences.settings
                            ? preferences_error
                                ? "d-none"
                                : controls_error
                                ? "d-none"
                                : "text-button-setting"
                            : " d-none"
                    }
                >
                    <button
                        type="button"
                        class="btn btn-primary"
                        title={T("S53")}
                        onClick={exportSettings}
                    >
                        <ExternalLink />
                        <span class="hide-low text-button">{T("S52")}</span>
                    </button>
                </span>
                <span
                    class={
                        preferences_error
                            ? "d-none"
                            : controls_error
                            ? "d-none"
                            : "text-button-setting"
                    }
                >
                    <button
                        type="button"
                        class="btn btn-danger"
                        title={T("S62")}
                        onClick={saveAndApply}
                    >
                        <Save />
                        <span class="hide-low text-button">{T("S61")}</span>
                    </button>
                </span>
                <br />
                <br />
            </center>
            <input type="file" class="d-none" id="importPControl" />
        </div>
    )
}

export {
    initApp,
    preferences,
    CheckboxControl,
    setcurrentprefs,
    prefs,
    WebUISettings,
    stopPolling,
    startPolling,
    macros,
    LanguageSelection,
}
