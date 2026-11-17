/*
 shortcuts.js - ESP3D WebUI dashboard keyboard shortcuts

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

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
import { h } from "preact"
import { HelpCircle } from "preact-feather"
import { useUiContextFn } from "../../contexts"
import { T } from "../../components/Translations"
import { showModal } from "../../components/Modal"

const keyTracker = {
    keybListenerCounter: 0,
    keyState: 0,
    lastcall: new Date(),
    lastkey: "",
}

//Handlers live at module level to be sure add/remove always use same address
const keyboardEventHandlerUp = (e) => {
    keyTracker.keyState = 0
}

const keyboardEventHandlerDown = (e) => {
    // Bail if User is actively typing text.  We don't want to disrupt them entering gcode.
    if (
        document.activeElement &&
        document.activeElement.tagName == "INPUT" &&
        (document.activeElement.type == "text" ||
            document.activeElement.type == "number")
    ) {
        return
    }

    let keyval = ""
    if (e.ctrlKey) keyval += "Control+"
    if (e.altKey) keyval += "Alt+"
    if (e.shiftKey) keyval += "Shift+"
    if (e.metaKey) keyval += "Meta+"
    if (
        !(
            e.key == "Control" ||
            e.key == "Alt" ||
            e.key == "Shift" ||
            e.key == "Meta"
        )
    )
        keyval += e.key.toUpperCase()
    let cmdMatch = null
    const keysRefs = ["keymap", "macros"]
    keysRefs.forEach((list) => {
        const keyMapObj = useUiContextFn.getValue(list)
        if (keyMapObj) {
            keyMapObj.forEach((element) => {
                element.value.forEach((sub) => {
                    if (
                        sub.name == "key" &&
                        sub.value &&
                        sub.value.length > 0 &&
                        sub.value?.toUpperCase() == keyval?.toUpperCase() &&
                        document.getElementById(element.id)
                    ) {
                        cmdMatch = element.id
                    }
                })
            })
        }
    })

    if (cmdMatch) {
        e.preventDefault()
        const autorepeat = useUiContextFn.getValue("enableautorepeat")
        if (keyTracker.keyState == 1 && !autorepeat) {
            return
        }
        keyTracker.keyState = 1
        const delay = useUiContextFn.getValue("autorepeatdelay")
        if (delay && autorepeat && keyTracker.lastkey == keyval) {
            let t = new Date()
            if (t.getTime() - keyTracker.lastcall.getTime() < delay) {
                return
            }
            keyTracker.lastcall = new Date()
        }
        keyTracker.lastkey = keyval

        document.getElementById(cmdMatch).click()
    }
}

//Add keyboard listener
const addKeyboardListener = () => {
    if (keyTracker.keybListenerCounter == 0) {
        window.addEventListener("keydown", keyboardEventHandlerDown, true)
        window.addEventListener("keyup", keyboardEventHandlerUp, true)
        keyTracker.keybListenerCounter++
    }
}

//Remove keyboard listener
const removeKeyboardListener = () => {
    if (keyTracker.keybListenerCounter != 0) {
        window.removeEventListener("keydown", keyboardEventHandlerDown, true)
        window.removeEventListener("keyup", keyboardEventHandlerUp, true)
        keyTracker.keybListenerCounter--
    }
}

//Show keyboard mapped keys
const showKeyboardHelp = (modals) => {
    useUiContextFn.haptic()
    const keysRefs = ["keymap", "macros"]
    const helpKeyboardJog = []
    keysRefs.forEach((list) => {
        const keyMapObj = useUiContextFn.getValue(list)

        if (keyMapObj) {
            keyMapObj.forEach((element) => {
                const help = {}
                element.value.forEach((sub) => {
                    if (sub.name == "key") {
                        help.key = sub.value
                    }
                    if (sub.name == "name") {
                        help.name = sub.value
                    }
                })

                if (document.getElementById(element.id))
                    helpKeyboardJog.push(
                        <tr>
                            <td> {T(help.name)}</td>
                            <td> [{T(help.key)}]</td>
                        </tr>
                    )
            })
        }
    })

    showModal({
        modals,
        title: T("S216"),
        button1: {
            text: T("S24"),
        },
        icon: <HelpCircle />,
        content: <table class="table">{helpKeyboardJog}</table>,
    })
}

export { addKeyboardListener, removeKeyboardListener, showKeyboardHelp }
