/*
 components.js - ESP3D WebUI helpers file

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
import { useUiContextFn } from "../../contexts"

const getColClasses = ({ col, ...responsive }) => {
    const responsiveClasses = Object.keys(responsive).reduce(
        (acc, key, i) =>
            i == 0 ? acc : `${acc} col-${key}-${responsive[key]}`,
        ""
    )
    return `col-${col} ${responsiveClasses}`
}

const generateUID = () => Math.random().toString(36).substr(2, 9)

const createComponent =
    (is, className, classModifier = {}) =>
    ({ is: Tag = is, class: c = "", id = "", ...props }) => {
        const splittedArgs = Object.keys(props).reduce(
            (acc, curr) => {
                if (Object.keys(classModifier).includes(curr))
                    return {
                        classes: [...acc.classes, classModifier[curr]],
                        ...acc.props,
                    }
                return {
                    classes: [...acc.classes],
                    props: { ...acc.props, [curr]: props[curr] },
                }
            },
            { classes: [], props: {} }
        )
        const classNames = `${className} ${splittedArgs.classes.join(
            " "
        )} ${c}`.trim()
        return <Tag class={classNames} id={id} {...splittedArgs.props} />
    }

/*
 * Ugly hack to avoid unwished tab stop to reach button not supposed to be accessed
 *
 */
function disableNode(node, state) {
    if (!node) return
    let nodeList = node.children
    if (nodeList) {
        for (var i = 0; i < nodeList.length; i++) {
            if (!nodeList[i].classList.contains("do-not-disable"))
                disableNode(nodeList[i], state)
        }
    }
    if (state) node.setAttribute("disabled", "true")
    else node.removeAttribute("disabled")
}

function disableUI(state = true) {
    disableNode(document.getElementById("main"), state)
    disableNode(document.getElementById("info"), state)
    disableNode(document.getElementById("menu"), state)
}

const generateDependIds = (depend, settings) => {
    const dependIds = []
    if (Array.isArray(depend)) {
        depend.forEach((d) => {
            if (d.id) {
                const element = useUiContextFn.getElement(d.id, settings)
                if (element) dependIds.push(element.value)
            }
            if (d.ids) {
                dependIds.push(...generateDependIds(d.ids, settings))
            }
        })
    }
    return dependIds
}
//this won't change as it is initalised with [ESP800] which is call at start
const connectionDepend = (depend, settings) => {
    if (Array.isArray(depend)) {
        return depend.reduce((acc, d) => {
            if (d.connection_id && settings[d.connection_id]) {
                const quote = d.value && d.value.trim().endsWith("'") ? "'" : ""
                if (d.value)
                    return (
                        acc &&
                        eval(
                            quote + settings[d.connection_id] + quote + d.value
                        )
                    )
                else if (d.contains) {
                    return (
                        acc &&
                        eval(
                            "'" +
                                settings[d.connection_id] +
                                "'" +
                                ".indexOf('" +
                                d.contains +
                                "')!=-1"
                        )
                    )
                }
            }
            return acc
        }, true)
    }
    return true
}

//this is dynamic as it is depending on the preferences settings
const settingsDepend = (depend, settings, isOr) => {
    if (Array.isArray(depend)) {
        return depend.reduce(
            (acc, d) => {
                if (d.id) {
                    const element = useUiContextFn.getElement(d.id, settings)
                    if (isOr) {
                        if (element) return acc || element.value === d.value
                        return acc || false === d.value
                    } else {
                        if (element) return acc && element.value === d.value
                        else return acc && false === d.value
                    }
                }
                if (d.ids) {
                    return acc && settingsDepend(d.ids, settings, true)
                }
                return acc
            },
            isOr ? false : true
        )
    }
    return true
}

export {
    createComponent,
    disableNode,
    disableUI,
    generateUID,
    getColClasses,
    generateDependIds,
    connectionDepend,
    settingsDepend,
}
