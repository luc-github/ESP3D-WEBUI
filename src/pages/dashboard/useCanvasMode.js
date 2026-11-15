/*
 useCanvasMode.js - ESP3D WebUI dashboard canvas / fullscreen state

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
import { useEffect, useState } from "preact/hooks"
import { useUiContextFn } from "../../contexts"
import {
    getLayoutMode,
    setLayoutMode,
    isDesktopLayout,
} from "../../components/Panels/layoutHelper"

//Canvas mode + browser fullscreen state of the dashboard
const useCanvasMode = () => {
    const [canvasMode, setCanvasMode] = useState(
        () => getLayoutMode() === "canvas"
    )
    //layout modes are desktop-only
    const effectiveCanvasMode = canvasMode && isDesktopLayout()
    const [isFullscreen, setIsFullscreen] = useState(
        () => typeof document !== "undefined" && !!document.fullscreenElement
    )

    //track the browser fullscreen state for the toggle button icon
    useEffect(() => {
        const onFullscreenChange = () =>
            setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener("fullscreenchange", onFullscreenChange)
        return () =>
            document.removeEventListener("fullscreenchange", onFullscreenChange)
    }, [])

    //Browser fullscreen on #app (not #dashboard: the cached extension
    //contents live outside #dashboard and must stay visible). This is the
    //tap-friendly alternative to ESC for touch devices
    const toggleFullscreen = () => {
        useUiContextFn.haptic()
        try {
            if (document.fullscreenElement) {
                const result = document.exitFullscreen()
                if (result && result.catch) result.catch(() => {})
            } else {
                const element =
                    document.getElementById("app") || document.documentElement
                const result = element.requestFullscreen()
                if (result && result.catch) result.catch(() => {})
            }
        } catch (e) {
            //fullscreen may be refused (unsupported context)
        }
    }

    //Canvas mode acts as a fullscreen view: the dashboard covers the
    //viewport as a fixed overlay. The Fullscreen API is deliberately not
    //used: the cached extension contents (iframes) live in #elementsCache
    //outside #dashboard and would be hidden by the browser in real
    //fullscreen
    useEffect(() => {
        const app = document.getElementById("app")
        const element = document.getElementById("dashboard")
        if (!app || !element) return
        if (effectiveCanvasMode) {
            app.classList.add("canvas-fullscreen")
            //use the page background so themes apply seamlessly
            element.style.backgroundColor = window.getComputedStyle(
                document.body
            ).backgroundColor
        } else {
            app.classList.remove("canvas-fullscreen")
            element.style.backgroundColor = ""
        }
    }, [effectiveCanvasMode])

    //ESC leaves the canvas mode (unless a modal or a dropdown is open)
    useEffect(() => {
        if (!effectiveCanvasMode) return
        const onKeyDown = (e) => {
            if (
                e.key === "Escape" &&
                !document.querySelector(".modal.active") &&
                !document.querySelector(".dropdown.active")
            ) {
                setLayoutMode("grid")
                setCanvasMode(false)
            }
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [effectiveCanvasMode])

    const toggleCanvasMode = () => {
        const next = !canvasMode
        setLayoutMode(next ? "canvas" : "grid")
        setCanvasMode(next)
    }

    return {
        canvasMode,
        effectiveCanvasMode,
        isFullscreen,
        toggleCanvasMode,
        toggleFullscreen,
    }
}

export { useCanvasMode }
