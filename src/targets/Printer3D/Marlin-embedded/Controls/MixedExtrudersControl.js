/*
 MixedExtrudersControl.js - ESP3D WebUI Target file

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
import { Plus, Minus, Lock, Unlock } from "preact-feather"
import { useState } from "preact/hooks"
import { useUiContext, useUiContextFn } from "../../../../contexts"
import { T } from "../../../../components/Translations"
import { ButtonImg, Field } from "../../../../components/Controls"
import { useHttpFn } from "../../../../hooks"
import { espHttpURL } from "../../../../components/Helpers"

const hasError = []

const extrudeDistance = []
const mixedExtrudersWeight = []

const MixedExtrudersControl = ({ feedrate }) => {
    const { toasts } = useUiContext()
    const { createNewRequest } = useHttpFn
    if (mixedExtrudersWeight.length == 0) {
        let enumber = useUiContextFn.getValue("enumber")
        if (!enumber) enumber = 1
        const colors = useUiContextFn.getValue("ecolors")
        const colorsList = colors.split(";")
        for (let i = 0; i < enumber; i++) {
            mixedExtrudersWeight.push({
                value: 0,
                locked: false,
                color: colorsList[i] ? colorsList[i] : "blue",
            })
        }
        mixedExtrudersWeight[0].value = 100
    }
    const [weights, setWeights] = useState(mixedExtrudersWeight)

    const distancesList = () => {
        const list = useUiContextFn.getValue("extruderdistance")
        if (list)
            return list.split(";").map((item) => {
                return { display: item + T("P16"), value: item }
            })

        return ""
    }

    const distances = distancesList()

    if (extrudeDistance[0] === undefined) {
        extrudeDistance[0] = distances[0].value
    }
    const totalLocked = mixedExtrudersWeight.reduce(
        (acc, cur) => (cur.locked ? (acc += cur.value) : acc),
        0
    )

    const adjustWeights = (index, newValue) => {
        let diff =
            parseFloat(newValue) - parseFloat(mixedExtrudersWeight[index].value)
        const totalAdjust = mixedExtrudersWeight.reduce(
            (acc, cur) => acc + parseFloat(cur.value),
            0
        )
        if (totalAdjust > 100) {
            return false
        }
        mixedExtrudersWeight[index].value = newValue
        //nothing to do return
        if (diff == 0) return false

        //parse until no diff or out of boundaries
        //as we should noit have to parse more than array length X array length
        for (let j = 0; j < mixedExtrudersWeight.length; j++) {
            //loop all weights
            for (let i = 0; i < mixedExtrudersWeight.length && diff != 0; i++) {
                const saved = parseFloat(mixedExtrudersWeight[i].value)
                //lets ignore locked values and current index
                if (i == index || mixedExtrudersWeight[i].locked) continue
                if (diff > 0) {
                    if (mixedExtrudersWeight[i].value - diff >= 0) {
                        mixedExtrudersWeight[i].value -= diff
                        diff = 0
                    } else {
                        diff = diff - parseFloat(mixedExtrudersWeight[i].value)
                        mixedExtrudersWeight[i].value = 0
                    }
                }
                if (diff < 0) {
                    mixedExtrudersWeight[i].value += -diff
                    diff = 0
                }
            }
        }
        return true
    }

    const mixSetCommand = () => {
        let cmd = "M165"
        for (let i = 0; i < mixedExtrudersWeight.length; i++) {
            cmd +=
                " " +
                String.fromCharCode(65 + i) +
                parseFloat(mixedExtrudersWeight[i].value) / 100
        }
        return cmd
    }

    const sendCommand = (command) => {
        createNewRequest(
            espHttpURL("command", { cmd: command }),
            { method: "GET", echo: command },
            {
                onSuccess: (result) => {},
                onFail: (error) => {
                    toasts.addToast({ content: error, type: "error" })
                    console.log(error)
                },
            }
        )
    }

    const [validation, setvalidation] = useState({
        message: null,
        valid: true,
        modified: false,
    })
    const generateValidation = (index) => {
        let validation = {
            message: null,
            valid: true,
            modified: false,
        }
        if (extrudeDistance[index] == 0 || extrudeDistance[index] <= 0) {
            //No error message to keep all control aligned
            //may be have a better way ?
            // validation.message = T("S42");
            validation.valid = false
        }
        return validation
    }

    return (
        <div class="mixed-extruders-container">
            {weights.map((item, index) => {
                const [locked, setLocked] = useState(item.locked)
                const [validation, setvalidation] = useState({
                    message: null,
                    valid: true,
                    modified: false,
                })
                item.validate = setvalidation
                const generateValidation = (index) => {
                    let validation = {
                        message: null,
                        valid: true,
                        modified: false,
                    }
                    if (
                        mixedExtrudersWeight[index].value < 0 ||
                        mixedExtrudersWeight[index].value.length == 0
                    ) {
                        validation.valid = false
                    }
                    const total = mixedExtrudersWeight.reduce((acc, cur) => {
                        return acc + parseFloat(cur.value)
                    }, 0)
                    if (total != 100) validation.valid = false
                    hasError[index] = !validation.valid
                    return validation
                }
                return (
                    <div class="mixed-extruder-control m-1">
                        <div
                            class="mixed-extruder-control-header"
                            style={
                                "background-color:" +
                                mixedExtrudersWeight[index].color
                            }
                        >
                            <div class="label">
                                {String.fromCharCode(65 + index)}
                            </div>
                        </div>
                        {mixedExtrudersWeight.length > 2 && (
                            <ButtonImg
                                className={item.locked ? "btn-primary" : ""}
                                icon={locked ? <Lock /> : <Unlock />}
                                onclick={(e) => {
                                    useUiContextFn.haptic()
                                    const nblocked =
                                        mixedExtrudersWeight.reduce(
                                            (acc, value) => {
                                                return value.locked
                                                    ? acc + 1
                                                    : acc
                                            },
                                            0
                                        )
                                    if (
                                        mixedExtrudersWeight.length - 2 <=
                                            nblocked &&
                                        !mixedExtrudersWeight[index].locked
                                    )
                                        return
                                    mixedExtrudersWeight[index].locked =
                                        !mixedExtrudersWeight[index].locked
                                    setWeights(mixedExtrudersWeight)
                                    setLocked(
                                        mixedExtrudersWeight[index].locked
                                    )
                                }}
                            />
                        )}

                        <Field
                            disabled={item.locked}
                            type="number"
                            width="4rem"
                            disable
                            min="0"
                            max="100"
                            step="1"
                            value={item.value}
                            setValue={(val, update) => {
                                let diff = 0

                                if (
                                    totalLocked == 100 ||
                                    (hasError.reduce(
                                        (acc, cur) => acc || cur,
                                        false
                                    ) &&
                                        !hasError[index])
                                ) {
                                    item.value =
                                        mixedExtrudersWeight[index].value
                                } else {
                                    if (!update) {
                                        const save =
                                            mixedExtrudersWeight[index].value

                                        if (adjustWeights(index, val)) {
                                            if (
                                                100 <
                                                mixedExtrudersWeight.reduce(
                                                    (acc, cur) =>
                                                        acc +
                                                        parseFloat(cur.value),
                                                    0
                                                )
                                            ) {
                                                item.value = save
                                                mixedExtrudersWeight[
                                                    index
                                                ].value = save
                                            }
                                        } else {
                                            console.log(
                                                "adjustWeights error",
                                                mixedExtrudersWeight.reduce(
                                                    (acc, cur) =>
                                                        acc +
                                                        parseFloat(cur.value),
                                                    0
                                                )
                                            )
                                            console.log(hasError)
                                        }
                                    }
                                }
                                setWeights(mixedExtrudersWeight)
                                mixedExtrudersWeight.map((item, index) =>
                                    item.validate(generateValidation(index))
                                )
                            }}
                            validation={validation}
                        />
                    </div>
                )
            })}

            <div
                class={
                    hasError.reduce((acc, cur) => acc || cur, false)
                        ? "d-none"
                        : "extruder-extrude-controls-container m-2"
                }
            >
                <Field
                    inline
                    label={T("P55")}
                    id={"input-extruder-mixed"}
                    type="number"
                    value={extrudeDistance[0]}
                    min="0"
                    step="0.5"
                    width="4rem"
                    extra="dropList"
                    append={T("P16")}
                    options={distances}
                    setValue={(val, update) => {
                        if (!update) extrudeDistance[0] = val
                        setvalidation(generateValidation(0))
                    }}
                    validation={validation}
                />
            </div>
            <div
                class={
                    hasError.reduce((acc, cur) => acc || cur, false)
                        ? "d-none"
                        : "extruder-extrude-controls-container"
                }
            >
                <ButtonImg
                    tooltip
                    icon={<Plus />}
                    label={T("P53")}
                    data-tooltip={T("P53")}
                    onClick={(e) => {
                        useUiContextFn.haptic()
                        e.target.blur()
                        const cmd =
                            mixSetCommand() +
                            "\nG91\nG1 E" +
                            extrudeDistance[0] +
                            " F" +
                            feedrate.value +
                            "\nG90"
                        const cmds = cmd.split("\n")
                        cmds.forEach((cmd) => {
                            sendCommand(cmd)
                        })
                    }}
                />
                <ButtonImg
                    tooltip
                    icon={<Minus />}
                    label={T("P54")}
                    data-tooltip={T("P54")}
                    onClick={(e) => {
                        useUiContextFn.haptic()
                        e.target.blur()
                        const cmd =
                            mixSetCommand() +
                            "\nG91\nG1 E-" +
                            extrudeDistance[0] +
                            " F" +
                            feedrate.value +
                            "\nG90"
                        const cmds = cmd.split("\n")
                        cmds.forEach((cmd) => {
                            sendCommand(cmd)
                        })
                    }}
                />
            </div>
        </div>
    )
}

export { MixedExtrudersControl }
