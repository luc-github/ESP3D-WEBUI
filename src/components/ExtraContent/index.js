/*
 extracontent.js - ESP3D WebUI navigation page file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

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
import { useRef, useEffect, useCallback, useState } from "preact/hooks"
import { elementsCache } from "../../areas/elementsCache"
import { ExtraContentItem } from "./extraContentItem"
import { eventBus } from "../../hooks/eventBus"
import {
    ButtonImg,
    FullScreenButton,
    CloseButton,
} from "../Controls"
import { T } from "../Translations"
import { RefreshCcw } from "preact-feather"
import { iconsFeather } from "../Images"
import { iconsTarget } from "../../targets"
import { useUiContextFn, useUiContext } from "../../contexts"

const ExtraContent = ({ id, source, refreshtime, label, type, target, icon }) => {
    const [isFullScreen, setIsFullScreen] = useState(false)
    const { panels } = useUiContext()
    const extra_content_id = `extra_content_${id}`
    const target_id = `target_${id}`
    const iconsList = { ...iconsTarget, ...iconsFeather }

    const updateContentPosition = () => {
        if (!useUiContextFn.panels.isVisible(id)&& target=="panel") {
            //console.log("Not updating position for element " + extra_content_id, "in target", target_id, " of panel ", id, " because it is not visible")
            return
        }
        //console.log("Updating position for element " + extra_content_id, "in target", target_id, " of panel ", id)
        const container = document.getElementById(target_id)
        if (container) {
            const rect = container.getBoundingClientRect()
            //use the content box so any padding (e.g. the one added under
            //the floating menu button in borderless mode) stays clear
            const cs = window.getComputedStyle(container)
            const pt = parseFloat(cs.paddingTop) || 0
            const pl = parseFloat(cs.paddingLeft) || 0
            const pr = parseFloat(cs.paddingRight) || 0
            const pb = parseFloat(cs.paddingBottom) || 0
            let top = rect.top + container.clientTop + pt
            let left = rect.left + container.clientLeft + pl
            let width = container.clientWidth - pl - pr
            let height = container.clientHeight - pt - pb
            //never cover the canvas overlay scrollbars: they live above
            //the overlay content but below the floating contents
            const overlay = container.closest("#dashboard")
            if (overlay && overlay.classList.contains("dashboard-canvas")) {
                const overlayRect = overlay.getBoundingClientRect()
                const minTop = overlayRect.top
                const minLeft = overlayRect.left
                const maxRight = minLeft + overlay.clientWidth
                const maxBottom = minTop + overlay.clientHeight
                if (left + width > maxRight)
                    width = Math.max(0, maxRight - left)
                if (top + height > maxBottom)
                    height = Math.max(0, maxBottom - top)
                if (left < minLeft) {
                    width = Math.max(0, width - (minLeft - left))
                    left = minLeft
                }
                if (top < minTop) {
                    height = Math.max(0, height - (minTop - top))
                    top = minTop
                }
            }
            //console.log("New Position for element " + extra_content_id + ":", top, left, width, height)
            eventBus.emit('updateState', { id: extra_content_id, position: { top, left, width, height }, isVisible: true, from: "extraContent(position)" })
        }
    }

    const handleScrollAndResize = useCallback(() => {
        requestAnimationFrame(updateContentPosition);
    }, [updateContentPosition]);

    //the cached content must follow its target: page scroll (#main),
    //dashboard scroll (fixed layout fullscreen), window resize and any
    //panel layout change (move / resize / mode switch)
    const layoutListenerId = `layout_${id}`
    const attachPositionListeners = () => {
        const main = document.getElementById("main")
        if (main) {
            main.addEventListener('scroll', handleScrollAndResize)
            main.addEventListener('resize', handleScrollAndResize)
        }
        const dashboard = document.getElementById("dashboard")
        if (dashboard) {
            dashboard.addEventListener('scroll', handleScrollAndResize)
        }
        window.addEventListener('resize', handleScrollAndResize)
        eventBus.on("panelsLayoutChanged", handleScrollAndResize, layoutListenerId)
    }
    const detachPositionListeners = () => {
        const main = document.getElementById("main")
        if (main) {
            main.removeEventListener('scroll', handleScrollAndResize)
            main.removeEventListener('resize', handleScrollAndResize)
        }
        const dashboard = document.getElementById("dashboard")
        if (dashboard) {
            dashboard.removeEventListener('scroll', handleScrollAndResize)
        }
        window.removeEventListener('resize', handleScrollAndResize)
        eventBus.off("panelsLayoutChanged", layoutListenerId)
    }
    
    useEffect(() => {
        //console.log("Updating element " + extra_content_id + " because visible list changed")
        if (useUiContextFn.panels.isVisible(id)) {
            detachPositionListeners()
            attachPositionListeners()
            updateContentPosition()
    }
    }, [panels.updateTrigger])

    useEffect(() => {
        //console.log("Mount element " + id)
        if (!elementsCache.has(extra_content_id)) {
            console.error("Error display element " + extra_content_id, " because it doesn't exist")
        } else {
            //console.log("Updating element " + extra_content_id + " because it already exists")
            if (target=="page"){
                updateContentPosition()
            }
        }

        attachPositionListeners()


        return () => {
            detachPositionListeners()
            //console.log("Hiding element " + id)
            eventBus.emit('updateState', { id: extra_content_id, isVisible: false, from: "extraContent(return)" })
        }
    }, [])


const handleRefresh = () => {
    useUiContextFn.haptic()
    eventBus.emit('extraContentRefresh', { id: extra_content_id })
    updateContentPosition()
}



const PanelRenderControls = () => (
    <span class="full-height">

        <ButtonImg
            xs
            m1
            className="btn-header"
            nomin="yes"
            icon={<RefreshCcw size="0.8rem" />}
            onclick={handleRefresh}
        />
        <FullScreenButton
            elementId={extra_content_id}
        />
        <CloseButton
            elementId={id}
            hideOnFullScreen={true}
        />


    </span>
)

const PageRenderControls = () => (
    <div class="m-2 image-button-bar">
        <ButtonImg
            m1
            nomin="yes"
            icon={<RefreshCcw size="0.8rem" />}
            onclick={handleRefresh}
        />

        <FullScreenButton
            elementId={extra_content_id}
            asButton={true}
        />

    </div>
)

if (target === "page") {
    //console.log("Rendering page element " + extra_content_id)
    //console.log("Page Id " + id)
    return (
        <div class="page-container" id={id}>
            <div id={target_id} class="page-target-container">
                {/* content should fit this container */}
            </div>
            <PageRenderControls />
        </div>
    )
}

if (target === "panel") {
    // console.log("Rendering panel element " + extra_content_id)
    //console.log("Panel Id " + id)
    const displayIcon = iconsList[icon] || ""
    return (
        <Fragment>
            <div class="panel panel-dashboard" id={id}>

                <div class="navbar">
                    <span class="navbar-section feather-icon-container">
                        {displayIcon}
                        <strong class="text-ellipsis">{T(label)}</strong>
                    </span>
                    <span class="navbar-section">
                        {PanelRenderControls()}
                    </span>
                </div>
                <div class="panel-body panel-body-dashboard no-margin-no-padding panel-target-container" id={target_id}>
                    {/* content should fit this container */}
                </div>
            </div>

        </Fragment>
    )
}
}

export { ExtraContent, ExtraContentItem }