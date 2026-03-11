/*
 Input.js - ESP3D WebUI component file

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

import { h } from "preact"
import { useRef, useState, useEffect } from "preact/hooks"
import {
    Eye,
    EyeOff,
    Search,
    ChevronDown,
    HelpCircle,
    XCircle,
} from "preact-feather"
import { ButtonImg } from "../../Controls"
import { ScanApList } from "../ScanAp"
import { T } from "./../../Translations"
import { showModal } from "../../Modal"
import {
    useUiContext,
    useUiContextFn,
    useSettingsContext,
} from "../../../contexts"
import {
    generateDependIds,
    checkDependencies,
} from "../../Helpers"

const Reveal = ({ applyTo }) => {
    const [reveal, setReveal] = useState(false)
    const clickReveal = () => {
        useUiContextFn.haptic()
        setReveal(!reveal)
        //note: reveal is not yet updated so need to upside down compare to use effect
        applyTo.current.type = reveal ? "password" : "text"
    }
    useEffect(() => {
        //for consistency in case of redraw
        applyTo.current.type = reveal ? "text" : "password"
    }, [])
    return (
        <div class="form-icon passwordReveal" onCLick={clickReveal}>
            {reveal ? (
                <EyeOff
                    size="1rem"
                    class="has-error icon-reveal"
                />
            ) : (
                <Eye size="1rem" class="has-error icon-reveal" />
            )}
        </div>
    )
}

const ClearText = ({ setValue }) => {
    const clickClear = () => {
        useUiContextFn.haptic()
        if (setValue) setValue("")
    }
    useEffect(() => {}, [])
    return (
        <div class="form-icon clearShortkey" onCLick={clickClear}>
            <XCircle size="1rem" class="icon-clear" />
        </div>
    )
}

const Input = ({
    label = "",
    type = "text",
    id = "",
    value = "",
    width,
    setValue,
    options = [],
    extra,
    inline,
    append,
    depend,
    help,
    button,
    disabled,
    prec,
    shortkey,
    ...rest
}) => {
    const { interfaceSettings, connectionSettings } = useSettingsContext()
    const dependIds = generateDependIds(
        depend,
        interfaceSettings.current.settings
    )
    const { step } = rest
    const inputref = useRef()
    const appendtooltip = prec ? "tooltip tooltip-left" : ""
    const appendtooltipdata = prec ? T("S208").replace("$", prec) : ""

    const onKeyPress = (e) => {
        if (!shortkey) return
        e.preventDefault()
        let v = ""
        let k = ""
        if (
            !(
                e.key == "Control" ||
                e.key == "Alt" ||
                e.key == "Shift" ||
                e.key == "Meta"
            )
        )
            k = e.key.toUpperCase()

        if (e.ctrlKey) v += "Control+"
        if (e.altKey) v += "Alt+"
        if (e.shiftKey) v += "Shift+"
        if (e.metaKey) v += "Meta+"
        e.target.value = v + k
        if (setValue) {
            setValue(e.target.value)
        }
    }
    const onInput = (e) => {
        if (shortkey) return
        if (setValue) {
            setValue(e.target.value)
        }
    }
    const { modals } = useUiContext()
    const props = {
        type,
        id,
        name: id,
        value,
        step: step ? step : "any",
    }
    let ScanNetworks = null
    const refreshList = () => {
        if (ScanNetworks) ScanNetworks()
    }

    useEffect(() => {
        let visible =checkDependencies(depend, interfaceSettings.current.settings, connectionSettings.current)
        if (document.getElementById(id))
            document.getElementById(id).style.display = visible
                ? "block"
                : "none"
        if (document.getElementById("group-" + id))
            document.getElementById("group-" + id).style.display = visible
                ? "block"
                : "none"
    }, [...dependIds])

    useEffect(() => {
        //to update state when import- but why ?
        if (setValue) setValue(null, true)
    }, [value])
    if (shortkey) {
        return (
            <div class={`has-icon-right ${inline ? "column" : ""}`} {...rest}>
                <input
                    spellcheck="false"
                    autocorrect="off"
                    autocomplete="off"
                    ref={inputref}
                    class="form-input"
                    {...props}
                    placeholder=""
                    {...rest}
                    onInput={onInput}
                    onKeyDown={onKeyPress}
                />
                <ClearText setValue={setValue} />
            </div>
        )
    }
    if (type === "password")
        return (
            <div class={`has-icon-right ${inline ? "column" : ""}`} {...rest}>
                <input
                    spellcheck="false"
                    autocorrect="off"
                    autocomplete="off"
                    ref={inputref}
                    class="form-input"
                    {...props}
                    placeholder=""
                    {...rest}
                    onInput={onInput}
                />
                <Reveal applyTo={inputref} />
            </div>
        )
    if (extra == "dropList") {
        return (
            <div class={`input-group ${inline ? "column" : ""} `}>
                <input
                    spellcheck="false"
                    autocorrect="off"
                    autocomplete="off"
                    lang="en-US"
                    ref={inputref}
                    style={width ? "width:" + width : ""}
                    id={id}
                    class="form-input"
                    {...props}
                    placeholder=""
                    {...rest}
                    onInput={onInput}
                />
                {append && (
                    <span
                        class={`input-group-addon ${appendtooltip}`}
                        data-tooltip={appendtooltipdata}
                    >
                        {T(append)}
                    </span>
                )}
                {options.length > 0 && (
                    <ButtonImg
                        class="input-group-btn"
                        icon={<ChevronDown color="blue" />}
                        data-tooltip={T(help)}
                        onClick={(e) => {
                            useUiContextFn.haptic()
                            e.target.blur()
                            const modalId = "list" + id
                            showModal({
                                modals,
                                title: T("S198"),
                                button2: { text: T("S24") },
                                icon: <HelpCircle />,
                                id: modalId,
                                content: (
                                    <ul class="selection-list">
                                        {options.map((option) => {
                                            return (
                                                <li
                                                    class="item-selection-list"
                                                    onclick={(e) => {
                                                        useUiContextFn.haptic()
                                                        setValue(option.value)
                                                        modals.removeModal(
                                                            modals.getModalIndex(
                                                                modalId
                                                            )
                                                        )
                                                    }}
                                                >
                                                    {option.display}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                ),
                            })
                        }}
                    />
                )}
            </div>
        )
    }
    if (extra == "scan") {
        return (
            <div class={`input-group ${inline ? "column" : ""} `}>
                <input
                    spellcheck="false"
                    autocorrect="off"
                    autocomplete="off"
                    ref={inputref}
                    id="ssid_sta"
                    class="form-input"
                    {...props}
                    placeholder=""
                    {...rest}
                    onInput={onInput}
                />
                <ButtonImg
                    class="input-group-btn nested-button"
                    ltooltip
                    data-tooltip={T("S40")}
                    icon={<Search />}
                    onClick={(e) => {
                        useUiContextFn.haptic()
                        e.target.blur()
                        const modalId = "scan"
                        showModal({
                            modals,
                            title: T("S45"),
                            button2: { text: T("S24") },
                            button1: {
                                cb: refreshList,
                                text: T("S50"),
                                noclose: true,
                            },
                            icon: <Search />,
                            id: modalId,
                            content: (
                                <ScanApList
                                    id={modalId}
                                    setValue={setValue}
                                    refreshfn={(scannetwork) =>
                                        (ScanNetworks = scannetwork)
                                    }
                                />
                            ),
                        })
                    }}
                />
            </div>
        )
    }
    //we can do a better way to remove class by doing a split a fitter on several key name and then join
    //but this is a quick fix
    let classAddition = ""
    if (rest.class) classAddition = rest.class.replace("form-input", "")
    return (
        <div
            class={`input-group ${inline ? "column" : ""} ${
                button ? "has-button-submit" : "no-button-submit"
            } ${help ? "tooltip" : ""}`}
            data-tooltip={T(help)}
        >
            <input
                disabled={disabled}
                spellcheck="false"
                autocorrect="off"
                autocomplete="off"
                class="form-input"
                {...props}
                {...rest}
                onInput={onInput}
            />
            {append && (
                <span
                    class={`input-group-addon  ${appendtooltip} ${classAddition}`}
                    data-tooltip={appendtooltipdata}
                >
                    {T(append)}
                </span>
            )}
            {button}
        </div>
    )
}

export default Input
