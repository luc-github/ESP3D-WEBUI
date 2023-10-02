/*
 PickUp.js - ESP3D WebUI component file

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
import { useEffect, useState } from "preact/hooks"
import { Search } from "preact-feather"
import { showModal } from "../../Modal"
import { ScanPacksList } from "../ScanPacksList"
import { useUiContext, useUiContextFn } from "../../../contexts"
import { T, getLanguageName } from "../../Translations"

const PickUp = ({ label = "", id = "", inline, setValue, value, ...rest }) => {
    const props = {
        id,
        name: id,
    }
    const [displayValue, setDisplayValue] = useState(
        id == "language" ? T("lang") : T("none")
    )
    const { modals } = useUiContext()
    const defaultDisplayValue = id == "language" ? T("lang", true) : T("none")
    const onChange = (value) => {
        if (setValue) setValue(value)

        setDisplayValue(
            value == "default"
                ? defaultDisplayValue
                : id == "language"
                ? getLanguageName(value)
                : value.replace("theme-", "").replace(".gz", "")
        )
    }

    let ScanPacks = null
    const refreshList = () => {
        if (ScanPacks) ScanPacks()
    }
    useEffect(() => {
        //to update state
        if (setValue) setValue(null, true)
        setDisplayValue(
            value == "default"
                ? defaultDisplayValue
                : id == "language"
                ? getLanguageName(value)
                : value.replace("theme-", "").replace(".gz", "")
        )
    }, [value])

    return (
        <div class={`input-group ${inline ? "column" : ""} `}>
            <span
                class="form-input"
                style="cursor: pointer;"
                readonly
                value={id == "language" ? T("lang") : T("none")}
                onClick={(e) => {
                    useUiContextFn.haptic()
                    e.target.blur()
                    const modalId = `${id}Pickup`
                    showModal({
                        modals,
                        title: id == "language" ? T("S177") : T("S182"),
                        button2: { text: T("S24") },
                        button1: {
                            cb: refreshList,
                            text: T("S50"),
                            noclose: true,
                        },
                        icon: <Search />,
                        id: modalId,
                        content: (
                            <ScanPacksList
                                id={modalId}
                                setValue={onChange}
                                refreshfn={(scanpacks) =>
                                    (ScanPacks = scanpacks)
                                }
                            />
                        ),
                    })
                }}
            >
                {displayValue}
            </span>
        </div>
    )
}
export default PickUp
