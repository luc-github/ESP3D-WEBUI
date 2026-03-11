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
function disableNode(node, state, ignore) {
    if (!node) return
    if (node.id == ignore) return
    let nodeList = node.children
    if (nodeList) {
        for (var i = 0; i < nodeList.length; i++) {
            if (!nodeList[i].classList.contains("do-not-disable"))
                disableNode(nodeList[i], state, ignore)
        }
    }
    if (state) {
        node.setAttribute("disabled", "true")
        //this is a hack to avoid tab stop on dropdown-toggle when disabled
        if (node.classList.contains("dropdown-toggle")) {
            node.tabIndex = "-1"
        }
    } else {
        node.removeAttribute("disabled")
        //remove the hack to avoid tab stop on dropdown-toggle when disabled
        if (node.classList.contains("dropdown-toggle")) {
            node.tabIndex = "0"
        }
    }
}

function disableUI(state = true, ignore) {
    disableNode(document.getElementById("main"), state, ignore)
    disableNode(document.getElementById("info"), state, ignore)
    disableNode(document.getElementById("menu"), state, ignore)
}

const generateDependIds = (depend, settings) => {
    const dependIds = [];
    if (Array.isArray(depend)) {
        depend.forEach((d) => {
            if (d.id) {
                const element = useUiContextFn.getElement(d.id, settings);
                if (element) dependIds.push(element.value);
            }
            if (d.orGroups) {
                d.orGroups.forEach(group => {
                    dependIds.push(...generateDependIds(group, settings));
                });
            }
        });
    }
    return dependIds;
}

//this won't change as it is initalised with [ESP800] which is call at start
const connectionDepend = (depend, connectionsettings) => {
    if (Array.isArray(depend)) {
        return depend.every(d => {
            if (d.connection_id && connectionsettings[d.connection_id]) {
                const quote = d.value && d.value.trim().endsWith("'") ? "'" : "";
                if (d.value) {
                    return eval(quote + connectionsettings[d.connection_id] + quote + d.value);
                } else if (d.contains) {
                    return eval("'" + connectionsettings[d.connection_id] + "'" + ".indexOf('" + d.contains + "')!=-1");
                }
            }
            return true;
        });
    }
    return true;
}
//this is dynamic as it is depending on the preferences settings
const settingDepend = (depend, settings, connectionsettings) => {
    if (Array.isArray(depend)) {
        return depend.every(d => {
            if (d.id) {
                const element = useUiContextFn.getElement(d.id, settings);
                if (typeof d.value !== "undefined") {
                    return element ? element.value === d.value : false === d.value;
                } else if (typeof d.notvalue !== "undefined") {
                    return element ? element.value !== d.notvalue : false !== d.notvalue;
                }
            }
            if (d.orGroups) {
                return d.orGroups.some(group => 
                    checkDependencies(group, settings, connectionsettings)
                );
            }
            return true;
        });
    }
    return true;
}

const checkDependencies = (depend, settings, connectionsettings) => {
    if (Array.isArray(depend)) {
        return depend.every(d => {
            if (d.id) {
                return settingDepend([d], settings, connectionsettings);
            }
            if (d.connection_id) {
                return connectionDepend([d], connectionsettings);
            }
            if (d.orGroups) {
                return d.orGroups.some(group => 
                    checkDependencies(group, settings, connectionsettings)
                );
            }
            return true;
        });
    }
    return true;
}

export {
    createComponent,
    disableNode,
    disableUI,
    generateUID,
    getColClasses,
    generateDependIds,
    connectionDepend,
    checkDependencies
}
