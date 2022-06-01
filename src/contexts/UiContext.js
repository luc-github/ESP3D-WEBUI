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
import { useContext, useState, useRef, useEffect } from "preact/hooks"
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
    const [visiblePanelsList, setVisiblePanelsList] = useState([])
    const uiRefreshPaused = useRef({})
    const timersList = useRef({})
    const [initPanelsVisibles, setInitPanelsVisibles] = useState(false)
    const [uiSettings, setUISettings] = useState()
    const [modals, setModal] = useState([])
    const [toasts, setToasts] = useState([])
    const isNotificationsAutoScroll = useRef(true)
    const isNotificationsAutoScrollPaused = useRef(false)
    const [notifications, setNotifications] = useState([])
    const [needLogin, setNeedLogin] = useState(false)
    const [showKeepConnected, setShowKeepConnected] = useState(false)
    const [connectionState, setConnectionState] = useState({
        connected: false,
        authenticate: true,
        page: "connecting",
    })

    const toastsRef = useRef(toasts)
    toastsRef.current = toasts
    const notificationsRef = useRef(notifications)
    notificationsRef.current = notifications

    const removeFromVisibles = (id) => {
        setVisiblePanelsList(
            visiblePanelsList.filter((element) => element.id != id)
        )
    }

    const addToVisibles = (id) => {
        setVisiblePanelsList([
            ...panelsList.filter((element) => element.id == id),
            ...visiblePanelsList.filter((element) => element.id != id),
        ])
    }

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
        const removedIds = removeEntriesByIDs(toastsRef.current, uids)
        setToasts([...removedIds])
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
    useUiContextFn.panels = { hide: removeFromVisibles }

    useEffect(() => {
        initAudio()
    }, [])

    const store = {
        timerIDs: timersList,
        panels: {
            list: panelsList,
            set: setPanelsList,
            visibles: visiblePanelsList,
            setVisibles: setVisiblePanelsList,
            hide: removeFromVisibles,
            show: addToVisibles,
            initDone: initPanelsVisibles,
            setInitDone: setInitPanelsVisibles,
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
    }

    return <UiContext.Provider value={store}>{children}</UiContext.Provider>
}

export { UiContextProvider, useUiContext, useUiContextFn }
