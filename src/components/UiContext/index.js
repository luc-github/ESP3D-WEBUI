import { h, createContext } from 'preact'
import { useState } from "preact/hooks"

const UiContext = createContext(null)
UiContext.displayName = 'uiContext'

const UiContextProvider = ({ children }) => {
    const [data, setData] = useState()
    const [modals, setModal] = useState([])
    const [toasts, setToasts] = useState([])

    const addToast = (newToast) => setToasts([...toasts, newToast])
    const removeToast = (toastIndex) => {
        const newToastList = toasts.filter((toast, index) => index !== toastIndex)
        setToasts(newToastList)
    }
    const addModal = (newModal) => setModal([...modals, newModal])
    const removeModal = (modalIndex) => {
        const newModalList = modals.filter((modal, index) => index !== modalIndex)
        setModal(newModalList)
    }

    const store = {
        data: [data, setData],
        modals: { modalList: modals, addModal, removeModal },
        toasts: { toastList: toasts, addToast, removeToast },
    }

    return (
        <UiContext.Provider value={store}>
            {children}
        </UiContext.Provider>
    )
}

export { UiContext, UiContextProvider }