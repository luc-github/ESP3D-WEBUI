/*
 elementsCache.js - ESP3D WebUI MainPage file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.
  Original code inspiration : 2021 Alexandre Aussourd

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
import { h, render } from "preact"
import { memo } from "preact/compat"
import { useState, useEffect } from "preact/hooks"
import { ExtraContentItem } from "../components/ExtraContent"
import { useUiContext, useUiContextFn, useSettingsContext } from "../contexts"
import { eventBus } from "../hooks/eventBus"
import { webUIVersion, Target, targetCategory } from "../targets"

/** Renders from stable contentData so sibling refresh does not remount/reload others */
const ElementsCacheList = memo(({ contentData, isVisibleOnStart }) => {
    if (!contentData?.length) return <div style="position: fixed; top: 0; left: 0; width: 0; height: 0; overflow: visible; z-index: 10000;" id="elementsCache" />
    return (
        <div style="position: fixed; top: 0; left: 0; width: 0; height: 0; overflow: visible; z-index: 10000;" id="elementsCache">
            {contentData.map((item) => (
                <ExtraContentItem
                    key={item.id}
                    {...item}
                    isVisibleOnStart={isVisibleOnStart}
                    extensionCheckConfig={{ webUIVersion, targetCategory, target: Target }}
                />
            ))}
        </div>
    )
})

const ElementsCacheInner = () => {
    const { ui } = useUiContext()
    const { interfaceSettings } = useSettingsContext()
    const [contentData, setContentData] = useState([])
    const isVisibleOnStart = useUiContextFn.getValue("openextrapanelsonstart")

    const extractValues = (entry) => {
        const result = { id: "extra_content_" + entry.id }
        entry.value.forEach((param) => {
            result[param.name] = param.value
        })
        return result
    }
    useEffect(() => {
        if (!ui.ready || !interfaceSettings.current?.settings?.extracontents) return
        if (!useUiContextFn.getValue("showextracontents")) return
        const extraContentSettings = interfaceSettings.current.settings.extracontents
        const extraContentsEntry = extraContentSettings.find((entry) => entry.id === "extracontents")
        if (!extraContentsEntry?.value?.length) return
        const newData = extraContentsEntry.value.map((entry) => extractValues(entry))
        setContentData(newData)
    }, [ui.ready, interfaceSettings])

    return <ElementsCacheList contentData={contentData} isVisibleOnStart={isVisibleOnStart} />
}

const ElementsCache = memo(ElementsCacheInner)
export default ElementsCache

const elementsCache = {

    isExtraContent: (id) => {
    const itemid = "extra_content_" + id
    return elementsCache.has(itemid)
    },

    getRootfromId: (id) => {
        return id.replace("extra_content_", "")
    },

    getIdFromRoot: (id) => {
        return "extra_content_" + id
    },

    has: (id) => {
        const cacheHost = document.getElementById("elementsCache")
        if (!cacheHost) return false
        return cacheHost.querySelector('#' + id) !== null
    },

    get: (id) => {
        const cacheHost = document.getElementById("elementsCache")
        if (!cacheHost) return null
        return cacheHost.querySelector('#' + id)
    }
}

export { ElementsCache, elementsCache }
