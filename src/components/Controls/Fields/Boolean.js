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
    const dependId = []
    const dependValue = []
    const dependCondition = []
    const dependElement = []
    const { interfaceSettings, connectionSettings } = useSettingsContext()
    if (depend) {
        depend.forEach((d) => {
            if (d.id) {
                const element = useUiContextFn.getElement(
                    d.id,
                    interfaceSettings.current.settings
                )
                if (element) {
                    dependElement.push(element)
                    dependId.push(element.value)
                    dependValue.push(d.value)
                }
            }
            if (d.connection_id) {
                if (connectionSettings.current[d.connection_id]) {
                    const quote = d.value.trim().endsWith("'") ? "'" : ""
                    dependCondition.push({
                        value: eval(
                            quote +
                                connectionSettings.current[d.connection_id] +
                                quote +
                                d.value
                        ),
                    })
                }
            }
        })
    }

    useEffect(() => {
        //if any dependId is true then visible is true
        if (dependId.length > 0 || dependCondition.length > 0) {
            let visible = false
            dependElement.forEach((d, index) => {
                if (d.value == dependValue[index]) visible = true
            })
            //if dependCondition is false when visible is true (dependId) => visible is false
            //if dependCondition is true when visible is false and no dependId => visible is true
            dependCondition.forEach((d) => {
                if (dependId.length == 0) {
                    if (d.value) visible = true
                } else {
                    if (!d.value) visible = false
                }
            })
            document.getElementById(id).style.display = visible
                ? "block"
                : "none"
            if (document.getElementById("group-" + id))
                document.getElementById("group-" + id).style.display = visible
                    ? "block"
                    : "none"
        }
    }, [...dependId])

    useEffect(() => {
        //to update state
        if (setValue) setValue(null, true)
    }, [value])
    return (
        <label class="form-switch">
            <input
                type="checkbox"
                {...inputCheckboxProps}
                onChange={onChange}
            />
            <i class="form-icon" />{" "}
            <span class={inline ? "text-dark" : "d-none"}>{label}</span>
        </label>
    )
}

export default Boolean
