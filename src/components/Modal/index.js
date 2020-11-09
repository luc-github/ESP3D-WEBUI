import { h, Fragment } from 'preact'
import { useContext } from "preact/hooks";
import { UiContext } from '../UiContext'

export const Modal = () => {
    const { modals } = useContext(UiContext)
    const { modalList, removeModal } = modals
    return modalList && modalList.length > 0 && (
        modalList.map((modal, index) => {
            const modalSize = (modal.size && modal.size !== '') ? `modal-${modal.size}` : ``
            return (
                <div className={`modal ${modalSize} active`} id="modal-id" key={index}>
                    <div className="modal-overlay" aria-label="Close" onClick={() => removeModal(index)} />
                    <div className="modal-container">
                        <div className="modal-header">
                            <button
                                className="btn btn-clear float-right"
                                aria-label="Close"
                                onClick={() => removeModal(index)} />
                            <div className="modal-title h5">{modal.title && modal.title}</div>
                        </div>
                        <div className="modal-body">
                            <div className="content">{modal.content && modal.content}</div>
                        </div>
                        {modal.footer && <div className="modal-footer">{modal.footer}</div>}
                    </div>
                </div>
            )
        })

    )
}