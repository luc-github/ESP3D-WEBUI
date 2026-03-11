/*
 extraContentItem.js - ESP3D WebUI navigation page file

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
import { Fragment, h } from "preact"
import { useState, useEffect, useCallback, useRef, useMemo } from "preact/hooks"
import { espHttpURL, dispatchToExtensions, parseEmbeddedManifest } from "../Helpers"
import { useHttpFn } from "../../hooks"
import { ButtonImg, ContainerHelper } from "../Controls"
import { T } from "../Translations"
import { Play, Pause, Aperture } from "preact-feather"
import { eventBus } from "../../hooks/eventBus"
import { useUiContextFn, useUiContext } from "../../contexts"
import { elementsCache } from "../../areas/elementsCache"
import { Target, targetCategory, webUIVersion } from "../../targets"

const visibilityState = {};
const isLoadedState = {};

const matchVersion = (version, pattern) => {
    if (!pattern || pattern === "*") return true
    const v = String(version).split(".")
    const p = String(pattern).split(".")
    for (let i = 0; i < Math.max(v.length, p.length); i++) {
        const pSeg = p[i] === undefined ? "*" : p[i]
        const vSeg = v[i] === undefined ? "0" : v[i]
        if (pSeg !== "*" && pSeg !== vSeg) return false
    }
    return true
}

const ExtraContentItem = ({
    id,
    source,
    type,
    name,
    target,
    refreshtime,
    isVisibleOnStart,
}) => {
    const [contentUrl, setContentUrl] = useState("")
    const [hasError, setHasError] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isPaused, setIsPaused] = useState(false)
    const { createNewRequest } = useHttpFn
    const { toasts } = useUiContext()
    const element_id = id.replace("extra_content_", type)
    const refreshIntervalRef = useRef(null)
    //console.log(`Rendering ExtraContentItem ${id} at ${Date.now()}`);
    if (visibilityState[id] === undefined) {
        visibilityState[id] = false;
        if (type=="extension" && isLoadedState[id]){    
            const iframeElement = element.querySelector('iframe.extensionContainer');
            if (iframeElement){
                iframeElement.contentWindow.postMessage(
                    { type: "notification", content: {isVisible: msg.isVisible}, id },
                    "*"
                )
            }
        }
    }
    if (isLoadedState[id] === undefined) {
        isLoadedState[id] = false;
    }

    const handleContentSuccess = useCallback((result) => {
        if (type === "extension") {
            const runCheck = (htmlText) => {
                const manifest = parseEmbeddedManifest(htmlText)
                if (manifest && manifest.supportedVersion != null && manifest.supportedVersion !== "" && manifest.targetSystem != null && manifest.targetSystem !== "") {
                    const categoryId = ({ Printer3D: "3d printer", CNC: "cnc", SandTable: "sand table" }[targetCategory] || (targetCategory || "").toLowerCase()).replace(/\s/g, "")
                    const targetId = (Target || "").toLowerCase().replace(/\s/g, "")
                    const list = String(manifest.targetSystem).toLowerCase().replace(/\s/g, "").split(",").map((s) => s.trim()).filter(Boolean)
                    const matchTarget = list.length === 0 || list.includes("*") || list.includes(categoryId) || list.includes(targetId)
                    if (!matchVersion(webUIVersion || "3.0", String(manifest.supportedVersion).trim()) || !matchTarget) {
                        toasts.addToast({ content: (T("S252") || "extension %s not compatible").replace("%s", name || id), type: "error" })
                        setHasError(true)
                        setIsLoading(false)
                        isLoadedState[id] = false
                        return
                    }
                }
                const blob = new Blob([result], { type: "text/html" })
                const url = URL.createObjectURL(blob)
                setContentUrl(url)
                setHasError(false)
                setIsLoading(false)
                isLoadedState[id] = true
            }
            if (typeof result === "string") {
                runCheck(result)
            } else if (result && typeof result.text === "function") {
                result.text().then(runCheck).catch(handleContentError)
            } else {
                const blob = new Blob([result], { type: "text/html" })
                const url = URL.createObjectURL(blob)
                setContentUrl(url)
                setHasError(false)
                setIsLoading(false)
                isLoadedState[id] = true
            }
            return
        }
        let blob
        switch (type) {
            case "camera":
            case "image":
                blob = new Blob([result], { type: "image/jpeg" })
                break
            case "content":
                blob = new Blob([result], { type: "text/html" })
                break
            default:
                blob = new Blob([result], { type: "text/plain" })
        }
        const url = URL.createObjectURL(blob)
        setContentUrl(url)
        setHasError(false)
        setIsLoading(false)
        isLoadedState[id] = true;
    }, [type, name, id, toasts])

    const handleContentError = useCallback((error) => {
        console.error(`Error loading content for ${id}:`, error)
        setHasError(true)
        setIsLoading(false)
        isLoadedState[id] = false;
    }, [id])

    const loadContent = useCallback(() => {
        if (isPaused || !visibilityState[id] || (target === "panel" && !useUiContextFn.panels.isVisible(elementsCache.getRootfromId(id)))) {
            return
        }
        if (source.startsWith("http")) {
            setContentUrl(source)
            setHasError(false)
            setIsLoading(false)
            isLoadedState[id] = true
        } else {
            if (isLoadedState[id] && !refreshIntervalRef.current) {
                return
            }
            setIsLoading(true)
            const idquery = type === "content" ? type + id : "download" + id
            let url = source
            if (url.endsWith(".gz")) {
                url = url.substring(0, url.length - 3)
            }
            createNewRequest(
                espHttpURL(url),
                { method: "GET", id: idquery, max: 1 },
                {
                    onSuccess: handleContentSuccess,
                    onFail: handleContentError,
                }
            )
        }
    }, [id, source, type, createNewRequest, handleContentSuccess, handleContentError, isPaused])

    useEffect(() => {
        loadContent()
    }, [loadContent])

    useEffect(() => {
        const listenerId = `listener_${id}`;
        const handleUpdateState = (msg) => {
            if (msg.id !== id) return
            const element = document.getElementById(id)
                if ( 'forceRefresh' in msg && msg.forceRefresh) {
                    //console.log(`Processing forceRefresh for ${id}`);
                    isLoadedState[id] = false;
                    loadContent()
                }
                if ('isVisible' in msg) {
                    if (element) {
                        //console.log("Updating visibility for element " + id + " to " + msg.isVisible)
                        element.style.display = msg.isVisible ? 'block' : 'none';
                        //is it the same as the current state?
                        if (visibilityState[id]!= msg.isVisible){
                            //if it is extension, check if the content is loaded
                            if (type=="extension" && isLoadedState[id]){    
                                const iframeElement = element.querySelector('iframe.extensionContainer');
                                if (iframeElement){
                                    iframeElement.contentWindow.postMessage(
                                        { type: "notification", content: {isVisible: msg.isVisible}, id },
                                        "*"
                                    )
                                }
                            }
                        }
                        visibilityState[id]= msg.isVisible;
                        if (!isLoadedState[id] && msg.isVisible) {
                            loadContent()
                            }

                    } else {
                        console.error("Element " + id + " doesn't exist")
                    }

                }
                if ('position' in msg) {
                    const el = document.getElementById(id)
                    if (el) {
                        el.style.top = `${msg.position.top}px`;
                        el.style.left = `${msg.position.left}px`;
                        el.style.width = `${msg.position.width}px`;
                        el.style.height = `${msg.position.height}px`;
                    }
                }
        }
        eventBus.on("updateState", handleUpdateState, listenerId)
        return () => {
            //console.log(`Removing listener ${listenerId} for ${id}`);
            //eventBus.off("updateState", handleUpdateState, listenerId)
        }
    }, [id, loadContent])

    useEffect(() => {
        if (refreshtime > 0 && (type === "camera" || type === "image") && visibilityState[id] && !isPaused) {
            //console.log("Updating refresh interval for " + id)
            if (!refreshIntervalRef.current){
                //console.log("Starting refresh interval for " + id+ " with refreshtime " + refreshtime)
                refreshIntervalRef.current = setInterval(loadContent, refreshtime)
            }
        }
        return () => {
            if (refreshIntervalRef.current) {
                //console.log("Stopping refresh interval for " + id)
                clearInterval(refreshIntervalRef.current)
                refreshIntervalRef.current = null
            }
        }
    }, [refreshtime, type, isPaused, loadContent])


    const handleError = () => {
        setHasError(true)
        setIsLoading(false)
        isLoadedState[id] = false;
    }

    const handleLoad = () => {
        setHasError(false)
        setIsLoading(false)
        isLoadedState[id] = true;
        const iframeElement = document.getElementById(element_id)
        if (type === "extension" && iframeElement) {
           
            const doc = iframeElement.contentWindow.document
            const body = doc.querySelector("body")
            if (!body){
                console.error("body not found")
                return
            } 
            body.classList.add("body-extension")
            const css = document.querySelectorAll("style")
            css.forEach((csstag) => {
                doc.head.appendChild(csstag.cloneNode(true))
            })
            if (iframeElement){
                iframeElement.contentWindow.postMessage(
                    { type: "notification", content: {isConnected: true, isVisible: visibilityState[id]}, id },
                    "*"
                )
            }
        }
    }

    const captureImage = useCallback(() => {
        if (type === "camera" || type === "image") {
            const image = document.getElementById(element_id);
            if (image && image.complete) {
                const canvas = document.createElement('canvas');
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);
                
                canvas.toBlob((blob) => {
                    const typeImage = type === "camera" ? "image/jpeg" : blob.type;
                    const filename = `snap.${typeImage.split("/")[1]}`;
                    
                    if (window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, filename);
                    } else {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.style.display = "none";
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        
                        setTimeout(() => {
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }, 100);
                    }
                }, type === "camera" ? "image/jpeg" : "image/png");
            } else {
                console.error("Image not loaded or not found");
            }
        }
    }, [type, element_id]);

    const togglePause = useCallback(() => {
        setIsPaused(prevPaused => {
            const newPausedState = !prevPaused;
            if (newPausedState) {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
            } else {
                if (refreshtime > 0 && (type === "camera" || type === "image") && visibilityState[id]) {
                    refreshIntervalRef.current = setInterval(loadContent, refreshtime);
                }
            }
            return newPausedState;
        });
    }, [refreshtime, type, loadContent]);

    const renderContent = useMemo(() => {
        if (isLoading && type !== "image" && type !== "camera") {
            return <div>Loading...</div>
        }

        if (hasError) {
            return (
                <div id={"fallback_" + element_id} class="fallback-content">
                    <p>Error loading {type}</p>
                    <p>Please check the URL</p>
                </div>
            )
        }

        if (type === "camera" || type === "image") {
            return (
                <div class="picture-container">
                <img
                    src={contentUrl}
                    alt={name ? name : "image jpeg"}
                    class={type === "camera" ? "cameraContainer" : "imageContainer"}
                    id={element_id}
                    onError={handleError}
                    onLoad={handleLoad}
                />
                </div>
            )
        } else {
            return (
                <iframe
                    src={contentUrl}
                    class={type === "extension" ? "extensionContainer" : "contentContainer"}
                    id={element_id}
                    onError={handleError}
                    onLoad={handleLoad}
                />
            )
        }
    }, [isLoading, hasError, type, contentUrl, name, element_id, handleError, handleLoad]);

    const RenderControls = useMemo(() => (
        <div class="m-2 image-button-bar">
            {(type === "camera" || type === "image") && (
                <ButtonImg
                    m1
                    tooltip
                    data-tooltip={T("S186")}
                    icon={<Aperture />}
                    onclick={captureImage}
                />
            )}
            {parseInt(refreshtime) > 0 && (type === "camera" || type === "image") && (
                <ButtonImg
                    m1
                    tooltip
                    data-tooltip={isPaused ? T("S185") : T("S184")}
                    icon={isPaused ? <Play /> : <Pause />}
                    onclick={togglePause}
                />
            )}
        </div>
    ), [type, refreshtime, isPaused, captureImage, togglePause]);
    return (
        <div id={id} class="extra-content-container">
            <ContainerHelper id={id} />
            {renderContent}
            {RenderControls}
        </div>
    )
}

export { ExtraContentItem }
