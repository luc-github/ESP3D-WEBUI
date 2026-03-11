/*
 CloseButton.js - ESP3D WebUI component file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.

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
import { useState, useEffect } from "preact/hooks"
import { useUiContext, useUiContextFn } from "../../contexts"
import { eventBus } from "../../hooks/eventBus"
import { elementsCache } from "../../areas/elementsCache"


const CloseButton = ({elementId, hideOnFullScreen, onclick }) => {
    const { panels } = useUiContext()
    const [isFullScreenMode, setIsFullScreenMode] = useState(false)
    //at each render, check if the element is fullscreen
    useEffect(() => {
        //Handle fullscreen change event
        const handleFullScreenChange = () => {
            const element =document.getElementById(elementId)
            if ( document.getElementById(elementId)) {
            //console.log("Button close Fullscreen state changed for " + elementId)
            setIsFullScreenMode(document.fullscreenElement==element)
            }
        }
         //Add event listener to handle fullscreen change
        document.addEventListener("fullscreenchange", handleFullScreenChange)
        //Remove event listener on unmount
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullScreenChange
            )
        }
    })
    //Hide the button if fullscreen mode is active and hideOnFullScreen is true
    if (hideOnFullScreen && isFullScreenMode) {
        return null
    }
    //display the button according to the props
    return (
        <span
            class="btn btn-clear btn-close m-1"
            aria-label="Close"
            onclick={(e) => {
                useUiContextFn.haptic()
                panels.hide(elementId)
                console.log("Close button clicked for element " + elementId)
                if (elementsCache.isExtraContent(elementId)) { 
                    console.log("emit for root element " + elementsCache.getIdFromRoot(elementId), " isVisible: false")
                    eventBus.emit('updateState', {id: elementsCache.getIdFromRoot(elementId), isVisible: false, from: "closeButton"})
                } else {
                    console.log("emit for element " + elementId, " isVisible: false")
                    eventBus.emit('updateState', {id: elementId, isVisible: false, from: "closeButton"})
                    
                }
                if (onclick) {
                    onclick()
                }
            }}
        />
    )
}

export default CloseButton
