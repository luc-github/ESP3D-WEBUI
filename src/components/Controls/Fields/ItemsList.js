/*
 ItemsList.js - ESP3D WebUI component file

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
import { ButtonImg } from "../../Controls"
import { T } from "../../Translations"
import { iconsFeather } from "../../Images"
import { iconsTarget } from "../../../targets"
import {
    generateUID,
    generateDependIds,
    checkDependencies,
} from "../../Helpers"
import { Field } from "../../Controls"
import { formatItem } from "../../../tabs/interface/importHelper"
import { useUiContextFn, useSettingsContext } from "../../../contexts"
import {
    Plus,
    ArrowUp,
    ArrowDown,
    Trash2,
    Minimize2,
    Flag,
} from "preact-feather"
import defaultPanel from "./def_panel.json"
import defaultMacro from "./def_macro.json"
import defaultPolling from "./def_polling.json"

/*
 * Local const
 *
 */
const ItemControl = ({
    itemData,
    index,
    completeList,
    idList,
    depend,
    setValue,
    validationfn,
    fixed,
    nodelete,
    editable,
    sorted,
}) => {
    const iconsList = { ...iconsTarget, ...iconsFeather }
    const { id, value, editionMode, ...rest } = itemData
    // Ensure value is always an array so rendering never crashes,
    // even if preferences data is malformed or not yet formatted.
    const safeValue = Array.isArray(value) ? value : []
    const indexIcon = safeValue.findIndex((element) => element.id == id + "-icon")
    const indexName = safeValue.findIndex((element) => element.id == id + "-name")
    const icon =
        safeValue.length > 0
            ? safeValue[indexIcon != -1 ? indexIcon : 0].value
            : null
    const name =
        safeValue.length > 0
            ? safeValue[indexName != -1 ? indexName : 0].value
            : null
    const controlIcon = iconsList[icon] ? iconsList[icon] : ""

    const onEdit = (state) => {
        completeList[index].editionMode = state
        setValue([...completeList])
    }
    const downItem = (e) => {
        e.target.blur()
        useUiContextFn.haptic()
        const item = completeList[index]
        completeList.splice(index, 1)
        completeList.splice(index + 1, 0, item)
        setValue(completeList)
    }
    const upItem = (e) => {
        e.target.blur()
        useUiContextFn.haptic()
        const item = completeList[index]
        completeList.splice(index, 1)
        completeList.splice(index - 1, 0, item)
        setValue(completeList)
    }
    const removeItem = (e) => {
        useUiContextFn.haptic()
        e.target.blur()
        completeList.splice(index, 1)
        setValue(completeList)
    }
    useEffect(() => {
        //to update state when import- but why ?
        if (setValue) setValue(null, true)
    }, [completeList])

    let colorStyle
    if (
        JSON.stringify(safeValue).includes('"hasmodified":true') ||
        JSON.stringify(itemData).includes('"newitem":true')
    )
        colorStyle =
            "box-shadow: 0 0 0 .2rem rgba(255, 183, 0, .4);margin-right:0.5rem!important"

    if (JSON.stringify(safeValue).includes('"haserror":true'))
        colorStyle =
            "box-shadow: 0 0 0 .2rem rgba(255, 0, 0, .4);margin-right:0.5rem!important"

    const val = safeValue.findIndex((e) => {
        return e.name == "key"
    })

    const VERBOSE_TYPE_KEYS = { startswith: "S229", endswith: "S230", contain: "S231", regex: "S232" }
    let labelBtn
    if (idList === "verbosefilters") {
        if (safeValue.length > 0) {
            const typeField = safeValue.find((e) => e.name === "type")
            const valueField = safeValue.find((e) => e.name === "value")
            const typeStr = typeField && typeField.value != null ? String(typeField.value) : ""
            const valueStr =
                valueField && valueField.value != null
                    ? (typeof valueField.value === "string" ? valueField.value : String(valueField.value))
                    : ""
            const typeLabel = VERBOSE_TYPE_KEYS[typeStr] ? T(VERBOSE_TYPE_KEYS[typeStr]) : typeStr
            labelBtn = typeStr !== "" || valueStr !== "" ? typeLabel + ": " + valueStr : id
        } else {
            const typeStr = itemData.type != null ? String(itemData.type) : ""
            const typeLabel = VERBOSE_TYPE_KEYS[typeStr] ? T(VERBOSE_TYPE_KEYS[typeStr]) : typeStr
            labelBtn =
                typeLabel + ": " + (itemData.value != null ? String(itemData.value) : "")
        }
    } else {
        labelBtn =
            val != -1
                ? T(name) +
                  (safeValue[val].value.length != 0
                      ? " [" + safeValue[val].value + "]"
                      : "")
                : T(name)
    }

    return (
        <Fragment>
            {!editionMode && (
                <div class="fields-line">
                    {((index > 0 && completeList.length > 1) ||
                        (index == 0 && completeList.length > 1)) &&
                        sorted && (
                            <div class="item-list-move">
                                {index > 0 && completeList.length > 1 && (
                                    <ButtonImg
                                        m1
                                        tooltip
                                        data-tooltip={T("S38")}
                                        icon={<ArrowUp />}
                                        onClick={upItem}
                                    />
                                )}
                                {completeList.length != 1 &&
                                    index < completeList.length - 1 && (
                                        <ButtonImg
                                            m1
                                            tooltip
                                            data-tooltip={T("S39")}
                                            icon={<ArrowDown />}
                                            onClick={downItem}
                                        />
                                    )}
                            </div>
                        )}

                    <div class="item-list-name">
                        {(!fixed || editable) && (
                            <ButtonImg
                                m2
                                tooltip
                                data-tooltip={T("S94")}
                                style={colorStyle}
                                label={labelBtn}
                                icon={controlIcon}
                                width="100px"
                                onClick={(e) => {
                                    useUiContextFn.haptic()
                                    e.target.blur()
                                    onEdit(true)
                                }}
                            />
                        )}
                        {fixed && !editable && (
                            <label class="m-1">{T(name)}</label>
                        )}
                    </div>

                    {!(fixed || nodelete) && (
                        <ButtonImg
                            m2
                            tooltip
                            data-tooltip={T("S37")}
                            icon={<Trash2 />}
                            onClick={removeItem}
                        />
                    )}
                </div>
            )}
            {editionMode && (
                <div class="itemEditor">
                    <div>
                        <ButtonImg
                            sm
                            tooltip
                            data-tooltip={T("S95")}
                            icon={<Minimize2 />}
                            onClick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                onEdit(false)
                            }}
                            class="float-right"
                        />
                        <div>
                            {index > 0 && completeList.length > 1 && sorted && (
                                <ButtonImg
                                    m1
                                    tooltip
                                    data-tooltip={T("S38")}
                                    icon={<ArrowUp />}
                                    onClick={upItem}
                                />
                            )}
                            {completeList.length != 1 &&
                                sorted &&
                                index < completeList.length - 1 && (
                                    <ButtonImg
                                        m1
                                        tooltip
                                        data-tooltip={T("S39")}
                                        icon={<ArrowDown />}
                                        onClick={downItem}
                                    />
                                )}

                            {!nodelete && (
                                <ButtonImg
                                    m2
                                    tooltip
                                    data-tooltip={T("S37")}
                                    icon={<Trash2 />}
                                    onClick={removeItem}
                                />
                            )}
                        </div>
                    </div>
                    <div class="m-1">
                        {safeValue &&
                            safeValue.map((item) => {
                                const {
                                    id,
                                    type,
                                    label,
                                    initial,
                                    options,
                                    ...rest
                                } = item
                                const [validation, setvalidation] = useState(
                                    validationfn(item)
                                )
                                // Avoid [object Object] when a sub-field value is object/array (e.g. malformed verbosefilters)
                                const valueIsObject =
                                    idList === "verbosefilters" &&
                                    item.name === "value" &&
                                    (typeof rest.value === "object" || Array.isArray(rest.value))
                                if (valueIsObject) item.value = ""
                                const safeRest = valueIsObject ? { ...rest, value: "" } : rest
                                //Do translation if necessary
                                const Options = options
                                    ? [...options].reduce((acc, curr) => {
                                          acc.push({
                                              label: T(curr.label),
                                              value: curr.value,
                                              depend: curr.depend,
                                          })
                                          return acc
                                      }, [])
                                    : null
                                if (idList == "keymap" && item.name == "name") {
                                    return
                                }
                                if (idList === "verbosefilters" && item.name === "index") {
                                    return
                                }
                                return (
                                    <Field
                                        id={item.id}
                                        label={
                                            idList == "keymap"
                                                ? T(itemData.id)
                                                : T(label)
                                        }
                                        type={type}
                                        options={Options}
                                        inline={
                                            type == "boolean" || type == "icon"
                                                ? true
                                                : false
                                        }
                                        {...safeRest}
                                        setValue={(val, update) => {
                                            if (!update) item.value = val
                                            setvalidation(validationfn(item))
                                            setValue(completeList, update)
                                        }}
                                        validation={validation}
                                    />
                                )
                            })}
                    </div>
                </div>
            )}
        </Fragment>
    )
}

const ItemsList = ({
    id,
    label,
    validationfn,
    validation,
    value,
    type,
    setValue,
    inline,
    fixed,
    sorted,
    depend,
    nodelete,
    editable,
    ...rest
}) => {
    const { interfaceSettings, connectionSettings } = useSettingsContext()
    const dependIds = generateDependIds(
        depend,
        interfaceSettings.current.settings
    )
    const addItem = (e) => {
        useUiContextFn.haptic()
        e.target.blur()
        let newItem
        if (id == "verbosefilters") {
            newItem = { id: "contain-" + (value ? value.length : 0), type: "contain", value: "" }
        } else {
            newItem = JSON.parse(
                JSON.stringify(
                    id == "macros"
                        ? defaultMacro
                        : id == "pollingcmds"
                          ? defaultPolling
                          : defaultPanel
                )
            )
            newItem.id = generateUID()
            newItem.name += " " + newItem.id
        }
        const formatedNewItem = formatItem(newItem, -1, id)
        formatedNewItem.editionMode = true
        formatedNewItem.newItem = true
        value.unshift(formatedNewItem)
        setValue(value)
    }

    useEffect(() => {
        //to update state when import- but why ?
        if (setValue) setValue(null, true)
    }, [value])

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

    return (
        <fieldset
            id={id}
            class={
                "fieldset-top-separator fieldset-bottom-separator field-group" +
                (id === "verbosefilters" ? " items-list-top-separator" : "")
            }
        >
            <legend>
                {!fixed && (
                    <ButtonImg
                        m2
                        label={
                            id == "macros"
                                ? T("S128")
                                : id == "pollingcmds"
                                  ? T("S207")
                                  : id == "verbosefilters"
                                    ? T("S228")
                                    : T("S156")
                        }
                        tooltip
                        data-tooltip={
                            id == "macros"
                                ? T("S128")
                                : id == "pollingcmds"
                                  ? T("S207")
                                  : id == "verbosefilters"
                                    ? T("S228")
                                    : T("S156")
                        }
                        icon={<Plus />}
                        onClick={addItem}
                    />
                )}
                {fixed && <label class="m-2">{T(label)}</label>}
            </legend>
            <div class="m-1" />
            <div class="items-group-content">
                {value &&
                    value.map((element, index, completeList) => {
                        return (
                            <ItemControl
                                itemData={element}
                                index={index}
                                completeList={completeList}
                                idList={id}
                                validationfn={validationfn}
                                setValue={setValue}
                                fixed={fixed}
                                sorted={sorted}
                                nodelete={nodelete}
                                editable={editable}
                            />
                        )
                    })}
            </div>
        </fieldset>
    )
}

export default ItemsList
