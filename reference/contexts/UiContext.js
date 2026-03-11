/*
 UiContext.js - ESP3D WebUI context file

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
import { h, createContext } from "preact"
import { useContext, useState, useRef, useEffect, useCallback } from "preact/hooks"
import {
    generateUID,
    removeEntriesByIDs,
    disableUI,
} from "../components/Helpers"

const useUiContextFn = {}
const audio = {}
/*
 * Local const
 *
 */
const UiContext = createContext("uiContext")
const useUiContext = () => useContext(UiContext)
const UiContextProvider = ({ children }) => {
    const [panelsList, setPanelsList] = useState([])
    const [panelsOrder, setPanelsOrder] = useState([])
    const visiblePanelsListRef = useRef([]);
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const uiRefreshPaused = useRef({})
    const timersList = useRef({})
    const [initPanelsVisibles, setInitPanelsVisibles] = useState(false)
    const [uiSettings, setUISettings] = useState()
    const [modals, setModal] = useState([])
    const [toasts, setToasts] = useState([])
    const isNotificationsAutoScroll = useRef(true)
    const isNotificationsAutoScrollPaused = useRef(false)
    const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [needLogin, setNeedLogin] = useState(false)
    const [showKeepConnected, setShowKeepConnected] = useState(false)
    const [connectionState, setConnectionState] = useState({
        connected: false,
        authenticate: true,
        page: "connecting",
    })
    const [uiSetup, setUiSetup] = useState(false)
    const toastsRef = useRef(toasts)
    toastsRef.current = toasts
    const notificationsRef = useRef(notifications)
    notificationsRef.current = notifications

    const removeFromVisibles = useCallback((id) => {
        visiblePanelsListRef.current = visiblePanelsListRef.current.filter(
            (element) => element.id != id
        );
        setUpdateTrigger(prev => prev + 1);
    }, []);

    const addToVisibles = useCallback((id, fixed) => {
        if (fixed && panelsOrder.length > 0) {
            const unSortedVisiblePanelsList = [
                ...visiblePanelsListRef.current.filter((element) => element.id != id),
                ...panelsList.filter((element) => element.id == id),
            ];
            visiblePanelsListRef.current = panelsOrder.reduce((acc, panel) => {
                const paneldesc = unSortedVisiblePanelsList.filter(
                    (p) => p.settingid == panel.id
                );
                if (paneldesc.length > 0) acc.push(...paneldesc);
                return acc;
            }, []);
        } else {
            visiblePanelsListRef.current = [
                ...panelsList.filter((element) => element.id == id),
                ...visiblePanelsListRef.current.filter((element) => element.id != id),
            ];
        }
        setUpdateTrigger(prev => prev + 1);
    }, [panelsList, panelsOrder]);

    const isPanelVisible = useCallback((id) => {
        //console.log("Checking visibility for panel " + id)
        //console.log(visiblePanelsListRef.current)
        return visiblePanelsListRef.current.some((element) => element.id == id);
    }, []);

    const addToast = (newToast) => {
        const id = generateUID()
        const now = new Date()
        const time =
            now.getHours().toString().padStart(2, "0") +
            ":" +
            now.getMinutes().toString().padStart(2, "0") +
            ":" +
            now.getSeconds().toString().padStart(2, "0")

        setToasts([...toastsRef.current, { ...newToast, id }])
        setNotifications([
            ...notificationsRef.current,
            { ...newToast, id, time },
        ])
    }

    const clearNotifications = () => {
        setNotifications([])
    }

    const removeToast = (uids) => {
        const remainingIds = removeEntriesByIDs(toastsRef.current, uids)
        toastsRef.current = remainingIds
        setToasts([...remainingIds])
    }

    const addModal = (newModal) =>
        setModal([
            ...modals,
            { ...newModal, id: newModal.id ? newModal.id : generateUID() },
        ])
    const getModalIndex = (id) => {
        return modals.findIndex((element) => element.id == id)
    }
    const removeModal = (modalIndex) => {
        const newModalList = modals.filter(
            (modal, index) => index !== modalIndex
        )
        setModal(newModalList)
        if (newModalList.length == 0) disableUI(false)
    }

    const clearModals = () => {
        setModal([])
    }

    const getElement = (Id, base = null) => {
        const settingsobject = base ? base : uiSettings
        if (settingsobject) {
            for (let key in settingsobject) {
                if (Array.isArray(settingsobject[key])) {
                    for (
                        let index = 0;
                        index < settingsobject[key].length;
                        index++
                    ) {
                        if (settingsobject[key][index].id == Id) {
                            return settingsobject[key][index]
                        }
                        if (Array.isArray(settingsobject[key][index].value)) {
                            for (
                                let subindex = 0;
                                subindex <
                                settingsobject[key][index].value.length;
                                subindex++
                            ) {
                                if (
                                    settingsobject[key][index].value[subindex]
                                        .id == Id
                                ) {
                                    return settingsobject[key][index].value[
                                        subindex
                                    ]
                                }
                            }
                        }
                    }
                } else {
                    for (let subkey in settingsobject[key]) {
                        if (Array.isArray(settingsobject[key][subkey])) {
                            for (
                                let index = 0;
                                index < settingsobject[key][subkey].length;
                                index++
                            ) {
                                if (
                                    settingsobject[key][subkey][index].id == Id
                                ) {
                                    return settingsobject[key][subkey][index]
                                }
                            }
                        }
                    }
                }
            }
        }
        return undefined
    }

    const getValue = (Id, base = null) => {
        if (!Id) return undefined
        const settingsobject = base ? base : uiSettings
        if (settingsobject) {
            for (let key in settingsobject) {
                if (Array.isArray(settingsobject[key])) {
                    for (
                        let index = 0;
                        index < settingsobject[key].length;
                        index++
                    ) {
                        if (settingsobject[key][index].id == Id) {
                            return settingsobject[key][index].value
                        }
                        if (Array.isArray(settingsobject[key][index].value)) {
                            for (
                                let subindex = 0;
                                subindex <
                                settingsobject[key][index].value.length;
                                subindex++
                            ) {
                                if (
                                    settingsobject[key][index].value[subindex]
                                        .id == Id
                                ) {
                                    return settingsobject[key][index].value[
                                        subindex
                                    ].value
                                }
                            }
                        }
                    }
                } else {
                    for (let subkey in settingsobject[key]) {
                        if (Array.isArray(settingsobject[key][subkey])) {
                            for (
                                let index = 0;
                                index < settingsobject[key][subkey].length;
                                index++
                            ) {
                                if (
                                    settingsobject[key][subkey][index].id == Id
                                ) {
                                    return settingsobject[key][subkey][index]
                                        .value
                                }
                            }
                        }
                    }
                }
            }
        }
        return undefined
    }

    useUiContextFn.getValue = getValue
    useUiContextFn.getElement = getElement

    const haptic = () => {
        if (getValue("audiofeedback")) {
            play([{ f: 1000, d: 100 }])
        }
        if (!window || !window.navigator || !window.navigator.vibrate) return
        if (getValue("hapticfeedback")) {
            window.navigator.vibrate(200)
            //console.log("haptic feedback")
        }
    }

    useUiContextFn.haptic = haptic

    const initAudio = () => {
        if (typeof window.AudioContext !== "undefined") {
            audio.context = new window.AudioContext()
        } else if (typeof window.webkitAudioContext() !== "undefined") {
            audio.context = new window.webkitAudioContext()
        } else if (typeof window.audioContext !== "undefined") {
            audio.context = new window.audioContext()
        }
    }
    audio.list = []
    const play = (sequence) => {
        if (sequence && audio.list.length > 0) {
            return
        }
        if (getValue("audio")) {
            if (!audio.context) {
                initAudio()
            }
            if (sequence) {
                audio.list = [...sequence]
            }
            if (audio.list.length > 0 && audio.context) {
                if (audio.context.state === "suspended") audio.context.resume()
                if (audio.oscillator) audio.oscillator.stop()
                audio.oscillator = audio.context.createOscillator()
                audio.oscillator.type = "square"
                audio.oscillator.connect(audio.context.destination)
                const current = audio.list.shift()
                audio.oscillator.frequency.value = current.f
                audio.oscillator.start()
                if (current.d) {
                    setTimeout(() => {
                        audio.oscillator.stop()
                        play()
                    }, current.d)
                } else {
                    audio.oscillator.stop()
                    play()
                }
            }
        }
    }

    //play sequence
    useUiContextFn.playSound = play
    //beep
    useUiContextFn.beep = () => {
        play([
            { f: 1046, d: 150 },
            { f: 1318, d: 150 },
            { f: 1567, d: 150 },
        ])
    }
    //beep error
    useUiContextFn.beepError = () => {
        play([
            { f: 400, d: 150 },
            { f: 200, d: 200 },
            { f: 100, d: 300 },
        ])
    }
    //sequence
    useUiContextFn.beepSeq = (seq) => {
        if (!seq) return
        play(seq)
    }


    useUiContextFn.toasts = { addToast, removeToast, toastList: toasts }
    useUiContextFn.panels = { hide: removeFromVisibles,isVisible: isPanelVisible }


    useEffect(() => {
        initAudio()
    }, [])

    const store = {
        timerIDs: timersList,
        panels: {
            list: panelsList,
            set: setPanelsList,
            visibles: visiblePanelsListRef.current,
            setVisibles: (newList) => {
                visiblePanelsListRef.current = newList;
                setUpdateTrigger(prev => prev + 1);
            },
            hide: removeFromVisibles,
            show: addToVisibles,
            isVisible: isPanelVisible,
            initDone: initPanelsVisibles,
            setInitDone: setInitPanelsVisibles,
            setPanelsOrder: setPanelsOrder,
            updateTrigger: updateTrigger,
        },
        shortcuts: {
            enabled: isKeyboardEnabled,
            enable: setIsKeyboardEnabled,
        },
        uisettings: {
            current: uiSettings,
            set: setUISettings,
            getValue,
            refreshPaused: uiRefreshPaused.current,
        },
        toasts: { toastList: toasts, addToast, removeToast },
        notifications: {
            list: notifications,
            clear: clearNotifications,
            isAutoScroll: isNotificationsAutoScroll,
            isAutoScrollPaused: isNotificationsAutoScrollPaused,
        },
        modals: {
            modalList: modals,
            addModal,
            removeModal,
            getModalIndex,
            clearModals,
        },
        connection: {
            connectionState,
            setConnectionState,
        },

        dialogs: {
            needLogin,
            setNeedLogin,
            showKeepConnected,
            setShowKeepConnected,
        },
        ui: {
            ready:uiSetup,
            setReady:setUiSetup,
        },
    }

    return <UiContext.Provider value={store}>{children}</UiContext.Provider>
}

export { UiContextProvider, useUiContext, useUiContextFn }
