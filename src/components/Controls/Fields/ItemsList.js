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
import { generateUID } from "../../Helpers"
import { Field } from "../../Controls"
import { formatItem } from "../../../tabs/interface/importHelper"
import { useUiContextFn } from "../../../contexts"
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

/*
 * Local const
 *
 */
const ItemControl = ({
    itemData,
    index,
    completeList,
    idList,
    setValue,
    validationfn,
}) => {
    const iconsList = { ...iconsTarget, ...iconsFeather }
    const { id, value, editionMode, ...rest } = itemData
    const icon =
        value[value.findIndex((element) => element.id == id + "-icon")].value
    const name =
        value[value.findIndex((element) => element.id == id + "-name")].value
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
        JSON.stringify(value).includes('"hasmodified":true') ||
        JSON.stringify(itemData).includes('"newitem":true')
    )
        colorStyle =
            "box-shadow: 0 0 0 .2rem rgba(255, 183, 0, .4);margin-right:0.5rem!important"

    if (JSON.stringify(value).includes('"haserror":true'))
        colorStyle =
            "box-shadow: 0 0 0 .2rem rgba(255, 0, 0, .4);margin-right:0.5rem!important"
    return (
        <Fragment>
            {!editionMode && (
                <div class="fields-line">
                    {((index > 0 && completeList.length > 1) ||
                        (index == 0 && completeList.length > 1)) && (
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
                        <ButtonImg
                            m2
                            tooltip
                            data-tooltip={T("S94")}
                            style={colorStyle}
                            label={name}
                            icon={controlIcon}
                            width="100px"
                            onClick={(e) => {
                                useUiContextFn.haptic()
                                e.target.blur()
                                onEdit(true)
                            }}
                        />
                    </div>

                    <ButtonImg
                        m2
                        tooltip
                        data-tooltip={T("S37")}
                        icon={<Trash2 />}
                        onClick={removeItem}
                    />
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

                            <ButtonImg
                                m2
                                tooltip
                                data-tooltip={T("S37")}
                                icon={<Trash2 />}
                                onClick={removeItem}
                            />
                        </div>
                    </div>
                    <div class="m-1">
                        {value &&
                            value.map((item) => {
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
                                //Do translation if necessary
                                const Options = options
                                    ? [...options].reduce((acc, curr) => {
                                          acc.push({
                                              label: T(curr.label),
                                              value: curr.value,
                                          })
                                          return acc
                                      }, [])
                                    : null
                                return (
                                    <Field
                                        id={item.id}
                                        label={T(label)}
                                        type={type}
                                        options={Options}
                                        inline={
                                            type == "boolean" || type == "icon"
                                                ? true
                                                : false
                                        }
                                        {...rest}
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
    ...rest
}) => {
    const addItem = (e) => {
        useUiContextFn.haptic()
        e.target.blur()
        const newItem = JSON.parse(
            JSON.stringify(id == "macros" ? defaultMacro : defaultPanel)
        )
        newItem.id = generateUID()
        newItem.name += " " + newItem.id
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
    const content = (
        <ButtonImg
            m2
            label={id == "macros" ? T("S128") : T("S156")}
            tooltip
            data-tooltip={id == "macros" ? T("S128") : T("S156")}
            icon={<Plus />}
            onClick={addItem}
        />
    )
    return (
        <fieldset class="fieldset-top-separator fieldset-bottom-separator">
            <legend>
                <ButtonImg
                    m2
                    label={id == "macros" ? T("S128") : T("S156")}
                    tooltip
                    data-tooltip={id == "macros" ? T("S128") : T("S156")}
                    icon={<Plus />}
                    onClick={addItem}
                />
            </legend>

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
                            />
                        )
                    })}
            </div>
        </fieldset>
    )
}

export default ItemsList
