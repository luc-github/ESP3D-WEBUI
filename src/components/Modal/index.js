/*
 Modal.js - ESP3D WebUI component file

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
import { useUiContext, useUiContextFn } from "../../contexts"
import { Modal as SpectreModal } from "../Controls"
import { disableUI } from "../Helpers"
import { showConfirmationModal } from "./confirmModal"
import { showKeepConnected } from "./keepConnectedModal"
import { showLogin } from "./logginModal"
import { showProgressModal } from "./progressModal"
import { showModal } from "./genericModal"

/*
 * Local const
 *
 */
const Modal = () => {
    const { modals } = useUiContext()
    if (modals.modalList && modals.modalList.length > 0) {
        disableUI(true)
    }

    return (
        modals.modalList &&
        modals.modalList.length > 0 &&
        modals.modalList.map((modal, index) => {
            const modalSize = modal.size || "sm"
            return (
                <SpectreModal
                    class={`active`}
                    id={"modal-" + modal.id}
                    style="z-index:20000"
                    key={index}
                >
                    <SpectreModal.Overlay
                        aria-label="Close"
                        onClick={() => {
                            useUiContextFn.haptic()
                            if (modal.overlay) modals.removeModal(index)
                        }}
                    />
                    <SpectreModal.Container>
                        <SpectreModal.Header>
                            <button
                                className={
                                    modal.hideclose
                                        ? "d-none"
                                        : "btn btn-clear float-right btn-close"
                                }
                                aria-label="Close"
                                onClick={() => {
                                    useUiContextFn.haptic()
                                    modals.removeModal(index)
                                }}
                            />
                            <div className="modal-title h5">
                                {modal.title && modal.title}
                            </div>
                        </SpectreModal.Header>
                        <SpectreModal.Body>
                            <div className="content">
                                {modal.content && modal.content}
                            </div>
                        </SpectreModal.Body>
                        {modal.footer && (
                            <SpectreModal.Footer>
                                {modal.footer}
                            </SpectreModal.Footer>
                        )}
                    </SpectreModal.Container>
                </SpectreModal>
            )
        })
    )
}

export {
    Modal,
    showConfirmationModal,
    showKeepConnected,
    showLogin,
    showProgressModal,
    showModal,
}
