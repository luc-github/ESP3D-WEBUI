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

import { Fragment, h } from "preact"
import { useEffect } from "preact/hooks"
import { useSettingsContext, useUiContextFn } from "../../../contexts"
import { T } from "../../Translations"
import {
    generateDependIds,
    checkDependencies
} from "../../Helpers"

const Option = ({ label, depend, ...props }) => {
    const { interfaceSettings, connectionSettings } = useSettingsContext()
    if (depend) {
        const canshow = checkDependencies(
            depend,
            interfaceSettings.current.settings,
            connectionSettings.current
        )
        if (!canshow) return null
    }
    //Condition for camera - no need to display if none setup
    if (props.value == "camera") {
        if (connectionSettings.current.CameraName) {
            return (
                <option {...props}>
                    {connectionSettings.current.CameraName}
                </option>
            )
        } else return null
    }
    return <option {...props}>{T(label)}</option>
}

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
    const props = {
        id,
        name: id,
    }
    const onChange = (e) => {
        if (e) useUiContextFn.haptic()
        if (setValue) setValue(e.target.value)
    }
    const { interfaceSettings, connectionSettings } = useSettingsContext()
    const dependIds = generateDependIds(
        depend,
        interfaceSettings.current.settings
    )
    const optionList = options.map((option) => {
        return <Option {...option} />
    })
    options.map((option) => {
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
            document.getElementById(id).style.display = visible
                ? "block"
                : "none"
        if (document.getElementById("group-" + id))
            document.getElementById("group-" + id).style.display = visible
                ? "block"
                : "none"
        if (setValue) setValue(null, true)
    }, [...dependIds])

    useEffect(() => {
        //to update state
        if (setValue) setValue(null, true)
    }, [value])

    return (
        <div class={`${inline ? "column" : ""} ${help ? "tooltip tooltip-top" : ""}`}
                data-tooltip={T(help)}>
            <select
                class={`form-select  ${inline ? "column" : ""}`}
                {...props}
                {...rest}
                value={value}
                onChange={onChange}
            >
                {optionList}
            </select>
            {button}
        </div>
    )
}
export default Select
