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

import { h, Fragment } from "preact"
import { useEffect } from "preact/hooks"
import {
    useUiContext,
    useUiContextFn,
    useSettingsContext,
} from "../../../contexts"
import {
    generateDependIds,
    connectionDepend,
    settingsDepend,
} from "../../Helpers"
import Input from "./Input"

/*
 * Local const
 *
 */
const Slider = ({
    id,
    label,
    validation,
    value = false,
    type,
    depend,
    setValue,
    append,
    inline,
    ...rest
}) => {
    const onInput = (e) => {
        if (e) useUiContextFn.haptic()
        if (setValue) setValue(e.target.value)
    }
    const { interfaceSettings, connectionSettings } = useSettingsContext()
    const dependIds = generateDependIds(
        depend,
        interfaceSettings.current.settings
    )
    const canshow = connectionDepend(depend, connectionSettings.current)

    useEffect(() => {
        let visible =
            canshow &&
            settingsDepend(depend, interfaceSettings.current.settings)
        document.getElementById(id).style.display = visible ? "block" : "none"
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
        <Fragment>
            <div class="slider-ctrl text-center hide-low">
                <label>{value}%</label>
                <input
                    class="slider"
                    id={id}
                    value={value}
                    onInput={onInput}
                    type="range"
                    min="0"
                    max="100"
                />
            </div>
            <Input
                id={id}
                label={label}
                validation={validation}
                depend={depend}
                setValue={setValue}
                append={append}
                value={value}
                type="number"
                inline={inline}
                {...rest}
                class="show-low form-input text-center"
            />
        </Fragment>
    )
}

export default Slider
