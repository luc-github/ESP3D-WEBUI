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
import { memo } from "preact/compat"
import { useState, useEffect, useCallback, useRef, useMemo } from "preact/hooks"
import { espHttpURL, dispatchToExtensions } from "../Helpers"
import { useHttpFn } from "../../hooks"
import { ButtonImg, ContainerHelper } from "../Controls"
import { T } from "../Translations"
import { Play, Pause, Aperture } from "preact-feather"
import { eventBus } from "../../hooks/eventBus"
import { useUiContextFn } from "../../contexts"
import { elementsCache } from "../../areas/elementsCache"

const visibilityState = {};
const isLoadedState = {};

/** Inline: extract manifest from <script id="esp3dext-manifest"> in extension HTML */
function getEmbeddedManifest(htmlText) {
    if (!htmlText || typeof htmlText !== "string") return null
    const m = htmlText.match(/<script[^>]*\sid=["']esp3dext-manifest["'][^>]*>([\s\S]*?)<\/script>/i)
    if (!m || !m[1]) return null
    try {
        return JSON.parse(m[1].trim())
    } catch (_) {
        return null
    }
}

function matchVersion(version, pattern) {
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

/** Memoized frame; src is set only in useEffect when contentUrl changes to avoid reload on re-render */
const ContentFrame = memo(({ contentUrl, className, frameId, onErrorRef, onLoadRef }) => {
    const iframeRef = useRef(null)
    useEffect(() => {
        const el = iframeRef.current
        if (!el || !contentUrl) return
        const needSet = (el.src || "") !== contentUrl
        if (needSet) el.src = contentUrl
    }, [contentUrl, frameId])
    return (
        <iframe
            ref={iframeRef}
            class={className}
            id={frameId}
            onError={() => onErrorRef.current?.()}
            onLoad={() => onLoadRef.current?.()}
        />
    )
})

const ExtraContentItemInner = ({
    id,
    source,
    type,
    name,
    target,
    refreshtime,
    isVisibleOnStart,
    extensionCheckConfig,
}) => {
    const [contentUrl, setContentUrl] = useState("")
    const [hasError, setHasError] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isPaused, setIsPaused] = useState(false)
    const { createNewRequest } = useHttpFn
    const element_id = id.replace("extra_content_", type)
    const refreshIntervalRef = useRef(null)
    const idRef = useRef(id)
    const loadContentRef = useRef(() => {})
    const handleErrorRef = useRef(() => {})
    const handleLoadRef = useRef(() => {})
    const hasContentRef = useRef(false)
    idRef.current = id
    if (visibilityState[id] === undefined) {
        visibilityState[id] = false
    }
    if (isLoadedState[id] === undefined) {
        isLoadedState[id] = false;
    }

    const handleContentSuccess = useCallback((result) => {
        const applyHtmlContent = (htmlText) => {
            const blob = new Blob([htmlText], { type: "text/html" })
            const url = URL.createObjectURL(blob)
            hasContentRef.current = true
            setContentUrl(url)
            setHasError(false)
            setIsLoading(false)
            isLoadedState[id] = true
        }
        const failExtension = (message) => {
            useUiContextFn.toasts.addToast({ content: message, type: "error" })
            setHasError(true)
            setIsLoading(false)
            isLoadedState[id] = false
            eventBus.emit("extraContentIncompatible", { id: elementsCache.getRootfromId(id) })
        }
        const getHtmlThen = (htmlText) => {
            if (type === "extension" && extensionCheckConfig) {
                const manifest = getEmbeddedManifest(htmlText)
                const hasValidManifest =
                    manifest &&
                    manifest.supportedVersion != null &&
                    String(manifest.supportedVersion).trim() !== "" &&
                    manifest.targetSystem != null &&
                    String(manifest.targetSystem).trim() !== ""
                if (!hasValidManifest) {
                    failExtension(`${name || id}: extension not compatible (no valid manifest)`)
                    return
                }
                const { webUIVersion: wv, targetCategory: tc, target: tgt } = extensionCheckConfig
                const categoryId = ({ Printer3D: "3d printer", CNC: "cnc", SandTable: "sand table" }[tc] || (tc || "").toLowerCase()).replace(/\s/g, "")
                const targetId = (tgt || "").toLowerCase().replace(/\s/g, "")
                const list = String(manifest.targetSystem).toLowerCase().replace(/\s/g, "").split(",").map((s) => s.trim()).filter(Boolean)
                const matchTarget = list.length === 0 || list.includes("*") || list.includes(categoryId) || list.includes(targetId)
                if (!matchVersion(wv || "3.0", String(manifest.supportedVersion).trim()) || !matchTarget) {
                    failExtension(`${name || id}: extension not compatible`)
                    return
                }
            }
            applyHtmlContent(htmlText)
        }
        if (type === "camera" || type === "image") {
            const blob =
                result instanceof Blob
                    ? result.type
                        ? result
                        : new Blob([result], { type: "image/jpeg" })
                    : new Blob([result], { type: "image/jpeg" })
            const url = URL.createObjectURL(blob)
            hasContentRef.current = true
            setContentUrl(url)
            setHasError(false)
            setIsLoading(false)
            isLoadedState[id] = true
            return
        }
            if (type === "content" || type === "extension") {
            if (typeof result === "string") {
                getHtmlThen(result)
            } else if (result && typeof result.text === "function") {
                result.text().then(getHtmlThen).catch((err) => {
                    console.error("ExtraContent result.text() failed", id, err)
                    setHasError(true)
                    setIsLoading(false)
                    isLoadedState[id] = false
                    if (type === "extension") eventBus.emit("extraContentIncompatible", { id: elementsCache.getRootfromId(id) })
                })
            } else {
                if (type === "extension") failExtension(`${name || id}: extension not compatible (no valid manifest)`)
                else { setHasError(true); setIsLoading(false); isLoadedState[id] = false }
            }
            return
        }
        const blob = new Blob([result], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        hasContentRef.current = true
        setContentUrl(url)
        setHasError(false)
        setIsLoading(false)
        isLoadedState[id] = true
    }, [type, id, name, extensionCheckConfig])

    const handleContentError = useCallback((error) => {
        console.error(`Error loading content for ${id}:`, error)
        setHasError(true)
        setIsLoading(false)
        isLoadedState[id] = false;
    }, [id])

    const loadContent = useCallback(() => {
        if (target=="page"){
            //console.log("Loading content for page " + id)
            //console.log(useUiContextFn.panels.isVisible(elementsCache.getRootfromId(id)))
        }

        if (isPaused || !visibilityState[id] ||  (target=="panel" && !useUiContextFn.panels.isVisible(elementsCache.getRootfromId(id)))) {
           //console.log("Not loading content for " + id + " because it is paused or not visible")
            return
        }
        //console.log("Loading content for " + id)
        if (source.startsWith("http")) {
            hasContentRef.current = true
            setContentUrl(source)
            setHasError(false)
            setIsLoading(false)
            isLoadedState[id] = true
        } else {
            if (isLoadedState[id] && !refreshIntervalRef.current){
                //console.log("Already loaded")
                return
            }
            const isRefresh = hasContentRef.current
            if (!isRefresh) setIsLoading(true)
            const idquery = type === "content" ? "content" + id : "download" + id
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

    loadContentRef.current = loadContent

    useEffect(() => {
        loadContentRef.current()
    }, [id])

    useEffect(() => {
        const listenerId = `listener_${id}`
        const handleUpdateState = (msg) => {
            const myId = idRef.current
            if (msg.id !== myId) return
            const element = document.getElementById(myId)
            if ('isVisible' in msg) {
                if (element) {
                    element.style.display = msg.isVisible ? 'block' : 'none'
                    if (visibilityState[myId] !== msg.isVisible) {
                        if (type === "extension" && isLoadedState[myId]) {
                            const iframeElement = element.querySelector('iframe.extensionContainer')
                            if (iframeElement) {
                                iframeElement.contentWindow.postMessage(
                                    { type: "notification", content: { isVisible: msg.isVisible }, id: myId },
                                    "*"
                                )
                            }
                        }
                    }
                    visibilityState[myId] = msg.isVisible
                    if (!isLoadedState[myId] && msg.isVisible) {
                        loadContentRef.current()
                    }
                } else {
                    console.error("Element " + myId + " doesn't exist")
                }
            }
            if ('position' in msg && element) {
                element.style.top = `${msg.position.top}px`
                element.style.left = `${msg.position.left}px`
                element.style.width = `${msg.position.width}px`
                element.style.height = `${msg.position.height}px`
            }
        }
        const handleRefreshOnly = (msg) => {
            if (msg.id !== idRef.current) return
            isLoadedState[idRef.current] = false
            loadContentRef.current()
        }
        eventBus.on("updateState", handleUpdateState, listenerId)
        const refreshListenerId = `refresh_${id}`
        eventBus.on("extraContentRefresh", handleRefreshOnly, refreshListenerId)
        return () => {
            eventBus.off("updateState", listenerId)
            eventBus.off("extraContentRefresh", refreshListenerId)
        }
    }, [id])

    useEffect(() => {
        if (refreshtime > 0 && (type === "camera" || type === "image") && visibilityState[id] && !isPaused) {
            //console.log("Updating refresh interval for " + id)
            if (!refreshIntervalRef.current){
                //console.log("Starting refresh interval for " + id+ " with refreshtime " + refreshtime)
                refreshIntervalRef.current = setInterval(() => loadContentRef.current(), refreshtime)
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


    const handleError = useCallback(() => {
        setHasError(true)
        setIsLoading(false)
        isLoadedState[id] = false
    }, [id])

    handleErrorRef.current = handleError

    const handleLoad = useCallback(() => {
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
    }, [type, element_id, id])

    handleLoadRef.current = handleLoad

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
                    refreshIntervalRef.current = setInterval(() => loadContentRef.current(), refreshtime);
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
                <ContentFrame
                    key={id}
                    contentUrl={contentUrl}
                    className={type === "extension" ? "extensionContainer" : "contentContainer"}
                    frameId={element_id}
                    onErrorRef={handleErrorRef}
                    onLoadRef={handleLoadRef}
                />
            )
        }
    }, [id, isLoading, hasError, type, contentUrl, name, element_id]);

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

const ExtraContentItem = memo(ExtraContentItemInner)
export { ExtraContentItem }
