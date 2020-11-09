import { h } from 'preact'
import { useContext } from "preact/hooks";
import { UiContext } from '../UiContext'

export const Toast = () => {
    const { toasts } = useContext(UiContext)
    const { toastList, removeToast } = toasts

    return toastList && <div class="toaster-container">
        {toastList.map((toast, index) => {
            const toastType = (toast.type && toast.type !== '') ? `toast-${toast.type}` : ``
            return (
                <div className={`toast ${toastType}`}>
                    <button class="btn btn-clear float-right" onClick={() => removeToast(index)} />
        Content {toast.content}
                </div>
            )
        })}
    </div>

}