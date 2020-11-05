/*
wizard.js - ESP3D WebUI settings file

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
import { T } from "../translations"
import { Save, Wifi, Globe, Check } from "preact-feather"
import { esp3dSettings, Setting } from "../app"
import { SendCommand } from "../http"
import { useStoreon } from "storeon/preact"
const { getIcon, iconsList } = require(`../${process.env.TARGET_ENV}`)
import { showDialog } from "../dialog"
import { LanguageSelection } from "./webui"

/*
 * Local variables
 *
 */

let currentStep = 0
let totalSteps = 0

/*
 * Some constants
 */

const stepstart = 1
const stepwifi = 2
const stepfinal = 3

function getTotalSteps() {
    let val = 3
}

/*
 * Connecting line
 */
const ConnectingLine = ({
    useClass = "",
    width = "24",
    height = "24",
    strokeWidth = "2",
    color = "currentColor",
}) => {
    return (
        <span class={useClass + "  hide-low"}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={height}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                stroke-width={strokeWidth}
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <line x1="0" y1="12" x2="24" y2="12"></line>
            </svg>
        </span>
    )
}

/*
 * WizardPill
 */
const WizardPill = ({ type, icon }) => {
    let typeclass = "border btn wizardPill rounded-circle "
    console.log(type)
    switch (type) {
        case "active":
            typeclass += " bg-blue text-light border-blue"
            break
        case "done":
            typeclass += " bg-light text-blue border-blue  hide-low"
            break
        default:
            typeclass += " bg-default text-secondary border-default  hide-low"
    }
    return <span class={typeclass}>{icon} </span>
}

/*
 * Title wizard with steps
 */ LanguageSelection
function wizardTitle(type) {
    let content = []
    content.push(
        <WizardPill
            icon={<Globe size="1.5rem" />}
            type={
                currentStep == stepstart
                    ? "active"
                    : currentStep > stepstart
                    ? "done"
                    : "default"
            }
        />
    )
    content.push(
        <ConnectingLine
            useClass={currentStep >= stepwifi ? "text-blue" : "text-default"}
        />
    )
    content.push(
        <WizardPill
            icon={<Wifi size="1.5rem" />}
            type={
                currentStep == stepwifi
                    ? "active"
                    : currentStep > stepwifi
                    ? "done"
                    : "default"
            }
        />
    )
    content.push(
        <ConnectingLine
            useClass={currentStep >= stepfinal ? "text-blue" : "text-default"}
        />
    )
    content.push(
        <WizardPill
            icon={<Check size="1.5rem" />}
            type={
                currentStep == stepfinal
                    ? "active"
                    : currentStep > stepfinal
                    ? "done"
                    : "default"
            }
        />
    )
    content.push(<span class="show-inline-low p-3">{T("S165")}</span>)
    return content
}

/*
 * Start wizard function
 */
function startWizard() {
    currentStep = stepstart
    totalSteps = getTotalSteps()
    const { dispatch } = useStoreon()
    const { activeSetting } = useStoreon("activeSetting")
    let activesetting = activeSetting
    if (typeof activeSetting == "undefined") activesetting = Setting.esp3d
    dispatch("setSettingTab", "$" + activesetting)
    showWizard()
}

function stepWiFi() {
    currentStep = stepwifi
    showWizard()
}

function stepFinal() {
    currentStep = stepfinal
    showWizard()
}

function finalizeSetup() {
    const { dispatch } = useStoreon()
    console.log("Save setup done")
    esp3dSettings.Setup == "Disabled"
    SendCommand("[ESP800]setup=1")
    dispatch("displayDialog", false)
}

function endWizard() {
    const { dispatch } = useStoreon()
    const { activeSetting } = useStoreon("activeSetting")

    if (typeof activeSetting != "undefined") {
        dispatch("setSettingTab", activeSetting.substring(1))
    } else dispatch("setSettingTab", Setting.esp3d)
    if (esp3dSettings.Setup == "Enabled") {
        showDialog({
            type: "confirmation",
            message: T("S166"),
            title: T("S26"),
            button1text: T("S167"),
            button1color: "btn-primary",
            button2color: "btn-secondary",
            next2: finalizeSetup,
            button2text: T("S168"),
        })
    } else dispatch("displayDialog", false)
}

/*
 * Show wizard function
 */
function showWizard() {
    let data
    let title = wizardTitle()
    //<LanguageSelection />
    switch (currentStep) {
        case 1:
            data = {
                icontitle: null,
                type: "custom",
                message: <div>select language</div>,
                title: title,
                button2text: T("S163"),
                next2: stepWiFi,
                button3text: T("S24"),
                next3: endWizard,
                background: "grey",
            }
            break
        case 2:
            data = {
                icontitle: null,
                type: "custom",
                message: <div>WiFi</div>,
                title: title,
                button1text: T("S164"),
                next1: startWizard,
                button2text: T("S163"),
                next2: stepFinal,
                button3text: T("S24"),
                next3: endWizard,
                background: "grey",
            }
            break
        case 3:
            data = {
                icontitle: null,
                type: "custom",
                message: <div>Final</div>,
                title: title,
                button2text: T("S164"),
                next2: stepWiFi,
                button3text: T("S24"),
                next3: endWizard,
                background: "grey",
            }
            break
        default:
            return
    }
    showDialog(data)
}

export { startWizard }
