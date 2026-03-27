/*
 SimpleExtruderControl.js - ESP3D WebUI Target file

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
import { Plus, Minus } from "preact-feather"
import { useUiContext, useUiContextFn } from "../../../contexts"
import { T } from "../../../components/Translations"
import { ButtonImg } from "../../../components/Controls"
import { useHttpFn } from "../../../hooks"
import { espHttpURL } from "../../../components/Helpers"

const SimpleExtruderControl = () => {
    const { toasts } = useUiContext()
    const { createNewRequest } = useHttpFn

    const sendCommand = (command) => {
        createNewRequest(
            espHttpURL("command", { cmd: command }),
            { method: "GET", echo: command },
            {
                onSuccess: () => {},
                onFail: (error) => {
                    toasts.addToast({ content: error, type: "error" })
                },
            }
        )
    }

    const extrude = (dir) => {
        useUiContextFn.haptic()
        const feedrate = useUiContextFn.getValue("efeedrate")
        ;["G91", "G1 E" + dir + "1 F" + feedrate, "G90"].forEach(sendCommand)
    }

    const resetE = () => {
        useUiContextFn.haptic()
        sendCommand("G92 E0")
    }

    return (
        <div class="jog-extruder-ctrl">
            <ButtonImg
                m1
                icon={<Minus />}
                tooltip
                data-tooltip={T("P54")}
                onclick={() => extrude("-")}
            />
            <button class="btn btn-sm m-1" onclick={resetE}>
                E=0
            </button>
            <ButtonImg
                m1
                icon={<Plus />}
                tooltip
                data-tooltip={T("P53")}
                onclick={() => extrude("")}
            />
        </div>
    )
}

export { SimpleExtruderControl }
