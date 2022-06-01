/*
 arrays.js - ESP3D WebUI helpers file

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

const removeEntriesByIDs = (src, uid) =>
    src.filter(({ id }) => !uid.includes(id))

const limitArr = (arr, limit) =>
    arr.slice(
        arr.length - (arr.length <= limit ? arr.length : limit),
        arr.length
    )

const splitArrayByLines = (arrayBuffer) => {
    const bytes = new Uint8Array(arrayBuffer)
    return bytes.reduce(
        (acc, curr) => {
            if (curr == 10 || curr == 13) return [...acc, []]
            const i = Number(acc.length - 1)
            return [...acc.slice(0, i), [...acc[i], curr]]
        },
        [[]]
    )
}

//Merge 2 JSON in generic way
//based on https://gist.github.com/sinemetu1/1732896#gistcomment-2571586
function mergeJSON(o1, o2) {
    let tempNewObj = o1
    if (o1.length === undefined && typeof o1 !== "number") {
        for (let key in o2) {
            let value = o2[key]
            if (o1[key] === undefined) {
                tempNewObj[key] = value
            } else {
                tempNewObj[key] = mergeJSON(o1[key], o2[key])
            }
        }
    } else if (o1.length > 0 && typeof o1 !== "string") {
        for (let index in o2) {
            if (JSON.stringify(o1).indexOf(JSON.stringify(o2[index])) === -1) {
                //look for existing id in same section
                let i = tempNewObj.findIndex(
                    (element) => element.id == o2[index].id
                )
                if (i == -1) tempNewObj.push(o2[index])
                else {
                    if (Array.isArray(tempNewObj[i].value)) {
                        //need to check if id is already in array
                        for (let v in o2[index].value) {
                            let j = tempNewObj[i].value.findIndex(
                                (element) => element.id == o2[index].value[v].id
                            )
                            if (j == -1) {
                                tempNewObj[i].value.push(o2[index].value[v])
                            } else {
                                tempNewObj[i].value[j] = o2[index].value[v]
                            }
                        }
                    } else tempNewObj[i].value = o2[index].value
                }
            }
        }
    } else {
        tempNewObj = o2
    }
    return tempNewObj
}

export { limitArr, mergeJSON, removeEntriesByIDs, splitArrayByLines }
