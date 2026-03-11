/*
 FieldGroup.js - ESP3D WebUI component file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved
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
import {
    useUiContext,
    useUiContextFn,
    useSettingsContext,
} from "../../contexts"
import { generateDependIds, checkDependencies } from "../Helpers"

const FieldGroup = ({ className, children, label, id, depend }) => {
    const { interfaceSettings, connectionSettings } = useSettingsContext()
    const canshow = checkDependencies(depend,interfaceSettings.current.settings ,connectionSettings.current)
    if (!canshow) {
        return null
    }
    return (
        <fieldset
            class={
                `${className ? className + " " : ""}` +
                `${
                    label
                        ? "fieldset-top-separator"
                        : "fieldset-no-top-separator"
                }` +
                " fieldset-bottom-separator field-group"
            }
            id={id}
        >
            <legend>
                <label class="m-1">{label}</label>
            </legend>
            <div class="field-group-content">{children}</div>
        </fieldset>
    )
}

export default FieldGroup
