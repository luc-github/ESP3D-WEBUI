/*
 Select.js - ESP3D WebUI component file

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
import { useEffect, useRef } from "preact/hooks"
import { ChevronDown } from "preact-feather"
import { useSettingsContext, useUiContextFn } from "../../../contexts"
import { T } from "../../Translations"
import {
    generateDependIds,
    checkDependencies
} from "../../Helpers"

const Select = ({
    label = "",
    id = "",
    options = [],
    depend,
    inline,
    setValue,
    value,
    help,
    button,
    ...rest
}) => {
    const toggleRef = useRef()
    const { interfaceSettings, connectionSettings } = useSettingsContext()
    const dependIds = generateDependIds(
        depend,
        interfaceSettings.current.settings
    )
    options.forEach((option) => {
        if (option.depend) {
            const deps = generateDependIds(
                option.depend,
                interfaceSettings.current.settings
            )
            dependIds.push(...deps)
        }
    })

    useEffect(() => {
        let visible = checkDependencies(depend, interfaceSettings.current.settings, connectionSettings.current)
        if (document.getElementById(id))
            document.getElementById(id).style.display = visible ? "block" : "none"
        if (document.getElementById("group-" + id))
            document.getElementById("group-" + id).style.display = visible ? "block" : "none"
        if (setValue) setValue(null, true)
    }, [...dependIds])

    useEffect(() => {
        if (setValue) setValue(null, true)
    }, [value])

    // Build visible options (dependency + camera filter)
    const visibleOptions = options.filter((option) => {
        if (option.value === "camera") return !!connectionSettings.current.CameraName
        if (!option.depend) return true
        return checkDependencies(option.depend, interfaceSettings.current.settings, connectionSettings.current)
    })

    const getOptionLabel = (option) =>
        option.value === "camera"
            ? connectionSettings.current.CameraName
            : T(option.label)

    const currentOption = visibleOptions.find((o) => o.value === value)
    const currentLabel = currentOption ? getOptionLabel(currentOption) : ""

    const onSelect = (val) => {
        useUiContextFn.haptic()
        if (setValue) setValue(val)
        if (toggleRef.current) toggleRef.current.blur()
    }

    return (
        <div
            class={`${inline ? "column" : ""} ${help ? "tooltip tooltip-top" : ""}`}
            data-tooltip={T(help)}
        >
            <div id={id} class="dropdown">
                <span
                    class="dropdown-toggle btn"
                    tabindex="0"
                    ref={toggleRef}
                >
                    {currentLabel}
                    <ChevronDown size="0.8rem" />
                </span>
                <ul class="menu">
                    {visibleOptions.map((option) => (
                        <li class={`menu-item${value === option.value ? " active" : ""}`}>
                            <div
                                class="menu-entry"
                                onclick={() => onSelect(option.value)}
                            >
                                {getOptionLabel(option)}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {button}
        </div>
    )
}
export default Select
