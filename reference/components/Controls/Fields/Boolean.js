/*
 Boolean.js - ESP3D WebUI component file

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
import { useEffect } from "preact/hooks"
import {
    useUiContext,
    useUiContextFn,
    useSettingsContext,
} from "../../../contexts"
import {
    generateDependIds,
    checkDependencies,
} from "../../Helpers"

import { T } from "./../../Translations"

/*
 * Local const
 *
 */
const Boolean = ({
    id,
    label,
    validation,
    value = false,
    type,
    help,
    depend,
    setValue,
    inline,
    ...rest
}) => {
    const inputCheckboxProps = {
        name: id,
        id,
        checked: value,
        ...rest,
    }

    const onChange = (e) => {
        if (e) useUiContextFn.haptic()
        if (setValue) setValue(e.target.checked)
    }

    const { interfaceSettings, connectionSettings } = useSettingsContext()
    const dependIds = generateDependIds(
        depend,
        interfaceSettings.current.settings
    )
   

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
    }, [...dependIds])

    useEffect(() => {
        //to update state
        if (setValue) setValue(null, true)
    }, [value])
    return (
        <label 
        class={`form-switch ${help ? "tooltip tooltip-right" : ""}`}
        data-tooltip={T(help)}
        >
            <input
                type="checkbox"
                {...inputCheckboxProps}
                onChange={onChange}
            />
            <i class="form-icon" />
            <span class={inline ? "text-dark" : "d-none"}>{label}</span>
            
        </label>
    )
}

export default Boolean
