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

import { Fragment, h } from "preact"
import { useState, useEffect } from "preact/hooks"
import { Plus, Minus, ChevronDown, Edit3 } from "preact-feather"
import { useUiContext, useUiContextFn } from "../../../contexts"
import { T } from "../../../components/Translations"
import { ButtonImg } from "../../../components/Controls"
import { useHttpFn } from "../../../hooks"
import { espHttpURL } from "../../../components/Helpers"
import { showModal } from "../../../components/Modal"

// Module-level persistent state (same pattern as Extruders.js)
const extruderFeedRate = { value: 0 }
let extrudeDistanceCurrent = null

const ExtruderIcon = ({ height = "0.75rem" }) => (
    <svg
        height={height}
        width={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        style="flex-shrink:0;color:var(--a)"
    >
        <path d="M 5.5108428,3.0201537 V 12.513419 L 11.945,17.625177 18.379157,12.513419 V 3.0201537 c 0,-1.6355649 0.359833,-1.4605023 -1.608539,-1.4605023 H 7.1193821 c -1.7843037,0 -1.6085393,-0.2230737 -1.6085393,1.4605023 z" />
        <path
            stroke-width="1.7"
            d="m 7.834991,23.424736 c 2.412836,-0.06532 4.825672,-0.239232 7.238507,-0.195931 1.465686,0.01977 1.442125,-2.339926 0.01534,-2.409951 -1.415249,-0.03439 -3.09084,0.108892 -3.123288,-2.135273 0,-0.171004 -0.0137,0.07621 -0.02055,-1.058404"
        />
        <line x1="1.4550858" y1="9.8125" x2="22.294914" y2="9.8125" />
        <line x1="1.517586" y1="5.375" x2="22.357414" y2="5.375" />
    </svg>
)

const distancesList = () => {
    const list = useUiContextFn.getValue("extruderdistance")
    if (list)
        return list.split(";").map((item) => ({
            display: item + T("P16"),
            value: item,
        }))
    return []
}

const SimpleExtruderControl = ({ extruderCount = 1, setFeedrateRef }) => {
    const { modals, toasts } = useUiContext()
    const { createNewRequest } = useHttpFn

    if (!!useUiContextFn.getValue("ismixedextruder")) return null

    if (!extruderFeedRate.value)
        extruderFeedRate.value = useUiContextFn.getValue("efeedrate")

    const distances = distancesList()
    if (extrudeDistanceCurrent === null && distances.length > 0)
        extrudeDistanceCurrent = distances[0].value

    const [activeExtruder, setActiveExtruder] = useState(0)
    const [distance, setDistance] = useState(extrudeDistanceCurrent || "1")
    const [distDropOpen, setDistDropOpen] = useState(false)
    const [extDropOpen, setExtDropOpen] = useState(false)

    const isValid = () => {
        const v = parseFloat(distance)
        return !isNaN(v) && v > 0
    }

    const sendCommand = (cmd) => {
        createNewRequest(
            espHttpURL("command", { cmd }),
            { method: "GET", echo: cmd },
            {
                onSuccess: () => {},
                onFail: (err) =>
                    toasts.addToast({ content: err, type: "error" }),
            }
        )
    }

    const extrude = (dir) => {
        useUiContextFn.haptic()
        const dist = dir === "+" ? distance : `-${distance}`
        const cmds =
            extruderCount > 1
                ? [
                      `T${activeExtruder}`,
                      "G91",
                      `G1 E${dist} F${extruderFeedRate.value}`,
                      "G90",
                  ]
                : ["G91", `G1 E${dist} F${extruderFeedRate.value}`, "G90"]
        cmds.forEach(sendCommand)
    }

    const showFeedrateModal = () => {
        useUiContextFn.haptic()
        let value = extruderFeedRate.value
        showModal({
            modals,
            title: T("P50"),
            button2: { text: T("S28") },
            button1: {
                cb: () => {
                    if (parseFloat(value) > 0) extruderFeedRate.value = value
                },
                text: T("S43"),
                id: "applyFrBtn",
                class: "btn-warning",
            },
            icon: <Edit3 />,
            id: "inputFeedrate",
            content: (
                <Fragment>
                    <label class="form-label">{T("P50")}</label>
                    <input
                        class="form-input"
                        type="number"
                        step="0.1"
                        value={value}
                        onInput={(e) => {
                            value = e.target.value.trim()
                            const btn = document.getElementById("applyFrBtn")
                            if (btn) btn.disabled = parseFloat(value) < 0.1
                        }}
                    />
                </Fragment>
            ),
        })
    }

    useEffect(() => {
        if (setFeedrateRef) setFeedrateRef.current = showFeedrateModal
    }, [])

    return (
        <div class="jog-extruder-ctrl">
          <div class="jog-extruder-title">{T("P55")}</div>
          <div class="jog-extruder-row">
            <ExtruderIcon />
            {extruderCount > 1 && (
                <div
                    class="temp-preset-dropdown"
                    tabIndex={-1}
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget))
                            setExtDropOpen(false)
                    }}
                >
                    <button
                        class={
                            "temp-preset-toggle" +
                            (extDropOpen ? " active" : "")
                        }
                        onclick={() => setExtDropOpen(!extDropOpen)}
                    >
                        {T("P41").replace("$", activeExtruder + 1)}
                        <ChevronDown size="0.7em" />
                    </button>
                    {extDropOpen && (
                        <div class="temp-preset-list">
                            {Array.from({ length: extruderCount }, (_, i) => (
                                <button
                                    class="temp-preset-item"
                                    onclick={() => {
                                        setActiveExtruder(i)
                                        setExtDropOpen(false)
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <div class="jog-step-wrap">
                <input
                    class="temp-input"
                    type="number"
                    min="0"
                    step="0.5"
                    value={distance}
                    onInput={(e) => {
                        extrudeDistanceCurrent = e.target.value
                        setDistance(e.target.value)
                    }}
                />
                <span class="jog-step-unit">{T("P16")}</span>
            </div>
            {distances.length > 0 && (
                <div
                    class="temp-preset-dropdown"
                    tabIndex={-1}
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget))
                            setDistDropOpen(false)
                    }}
                >
                    <button
                        class={
                            "temp-preset-toggle" +
                            (distDropOpen ? " active" : "")
                        }
                        onclick={() => setDistDropOpen(!distDropOpen)}
                    >
                        <ChevronDown size="0.7em" />
                    </button>
                    {distDropOpen && (
                        <div class="temp-preset-list">
                            {distances.map((d) => (
                                <button
                                    class="temp-preset-item"
                                    onclick={() => {
                                        extrudeDistanceCurrent = d.value
                                        setDistance(d.value)
                                        setDistDropOpen(false)
                                    }}
                                >
                                    {d.display}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
          </div>
          <div class="jog-extruder-actions">
            <ButtonImg
                m1
                className="jog-extrude-btn btn-primary"
                label={T("P53")}
                icon={<Plus />}
                onclick={() => {
                    if (isValid()) extrude("+")
                }}
            />
            <ButtonImg
                m1
                className="jog-extrude-btn btn-primary"
                label={T("P54")}
                icon={<Minus />}
                onclick={() => {
                    if (isValid()) extrude("-")
                }}
            />
          </div>
        </div>
    )
}

export { SimpleExtruderControl, ExtruderIcon }
