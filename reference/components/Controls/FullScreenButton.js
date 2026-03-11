/*
 FullScreenButton.js - ESP3D WebUI component file

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
import { useState, useEffect, useRef } from "preact/hooks"
import { Maximize, Minimize } from "preact-feather"
import { useUiContextFn } from "../../contexts"
import { ButtonImg } from "."
import { eventBus } from "../../hooks/eventBus"

const FullScreenButton = ({ elementId, hideOnFullScreen, asButton, onclick }) => {
    const isFullScreenModeRef = useRef(false)
    const [isFullScreenMode, setIsFullScreenMode] = useState(isFullScreenModeRef.current)

    // Set internal state to follow the document.fullscreenElement state
    function setFullScreenMode(value) {
        isFullScreenModeRef.current = value
        setIsFullScreenMode(value)
    }

    //Click handler
    const handleClick = () => {
        if (isFullScreenModeRef.current) {
            exitFullscreen()
        } else {
            enterFullscreen()
        }
        if (onclick) {
            onclick()
        }
    }

    //Handle fullscreen change event
    const handleFullscreenChange = () => {
        //we actuallyonly care about the event of exiting fullscreen because we control the entering one
        console.log("Fullscreen state changed to false for " + elementId)
        if (!document.fullscreenElement) {
            exitFullscreen()
        }
    }

    //Enter fullscreen mode
    function enterFullscreen() {
        const element = document.getElementById(elementId)
        if (element) {
            eventBus.emit("updateState", { id: elementId, isFullScreen: true, from: "fullScreenButton" })
            element.requestFullscreen()
            setFullScreenMode(true)
            document.addEventListener("fullscreenchange", handleFullscreenChange)
            console.log("Fullscreen activated for " + elementId)
        } else {
            console.log("Element " + elementId + " doesn't exist")
        }
    }

    //Exit fullscreen mode
    function exitFullscreen() {
        document.removeEventListener(
            "fullscreenchange",
            handleFullscreenChange
        )
        eventBus.emit("updateState", { id: elementId, isFullScreen: false, from: "fullScreenButton" })
        if (document.fullscreenElement) document.exitFullscreen()
        setFullScreenMode(false)
        console.log("Fullscreen deactivated for " + elementId)
    }

    //Hide the button if fullscreen mode is active and hideOnFullScreen is true
    if (hideOnFullScreen && isFullScreenModeRef.current) {
        return null
    }

    const commonProps = {
        icon: isFullScreenMode ? <Minimize size="0.8rem" /> : <Maximize size="0.8rem" />,
        m1: true,
    };

    const conditionalProps = asButton
        ? { id: "btn-screen" }
        : { xs: true, class: "btn btn-screen", nomin: "yes" };
        
    //display the button according to the props
    return (
        <ButtonImg
            {...commonProps}
            {...conditionalProps}
            onclick={(e) => {
                useUiContextFn.haptic();
                e.target.blur();
                handleClick();
            }}
        />
    );
}

export default FullScreenButton
