/*
formatHelper.js - ESP3D WebUI helper file

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

const getFieldTypeName = ({ value, type, options }) => {
    if (options !== undefined && !(type === "M" || type === "X"))
        return "select" //boolean
    if (type === "B") return "number" //byte is input number
    if (type === "I") return "number" //integer is input number
    if (type === "F") return "number" //float is input number
    if (type === "S") return "text" //input text
    if (type === "M") return "mask" //bit mask
    if (type === "X") return "xmask" //exclusive bit mask = first bit enable/disable others bits edition
    return "text" //default
}

const generateFormattedSelectOptionList = (rawOpt) => {
    return [...rawOpt].map((opt) => {
        const key = Object.keys(opt)[0]
        return { label: key, value: opt[key] }
    })
}

const formatSettingItem = (settingItem) => {
    const { P, T, V, H, O: options, M, S, MS, R, U, E } = settingItem
    let settingFieldProps = {
        id: P,
        initial: V,
        label: H,
        type: T,
        value: V,
        cast: T,
        append: U,
        prec: E,
    }
    if (Array.isArray(options) && options !== undefined)
        settingFieldProps.options = generateFormattedSelectOptionList(options)
    if (R !== undefined) settingFieldProps.needRestart = R
    if (S !== undefined) settingFieldProps.max = parseInt(S)
    if (M !== undefined) {
        settingFieldProps.min = parseInt(M)
        if (MS !== undefined) {
            settingFieldProps.minSecondary = parseInt(MS)
            if (parseInt(MS) < parseInt(M)) {
                //be sure Min is small than Min Secondary
                settingFieldProps.min = parseInt(MS)
                settingFieldProps.minSecondary = parseInt(M)
            }
        }
    }
    if (T === "A") settingFieldProps.format = "ip"
    settingFieldProps.type = getFieldTypeName(settingFieldProps)
    return settingFieldProps
}

const formatStructure = (settings) =>
    settings.reduce((acc, curVal) => {
        const data = formatSettingItem(curVal)
        const [section, subSection] = curVal.F.split("/")
        if (Object.prototype.hasOwnProperty.call(acc, section)) {
            //if section exist
            if (
                Object.prototype.hasOwnProperty.call(acc[section], subSection)
            ) {
                // if subsection exist
                const fields = [...acc[section][subSection], data]
                return {
                    ...acc,
                    [section]: { ...acc[section], [subSection]: [...fields] },
                }
            }
            //else add subsection
            return {
                ...acc,
                [section]: { ...acc[section], [subSection]: [data] },
            }
        } //add new section
        return { ...acc, [section]: { [subSection]: [data] } }
    }, {})

export { formatStructure }
