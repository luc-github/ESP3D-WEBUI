/*
 useHttpQueue.js - ESP3D WebUI hooks file

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
import { h } from "preact"
import { useState, useRef } from "preact/hooks"
import { useHttpQueueContext } from "../contexts"
import { generateUID } from "../components/Helpers"

const useHttpFn = {}

/*
 * Local const
 *
 */
const useHttpQueue = () => {
    const {
        addInQueue,
        addInTopQueue,
        removeRequests,
        getCurrentRequest,
        processRequests,
    } = useHttpQueueContext()
    const [killOnUnmount, setKillOnUnmount] = useState(true)
    const localRequests = useRef([])

    const createNewTopRequest = (url, params, callbacks = {}) => {
        const {
            onSuccess: onSuccessCb,
            onFail: onFailCb,
            onProgress: onProgressCb,
        } = callbacks
        const id = params.id ? params.id : generateUID()
        localRequests.current = [...localRequests.current, id]
        addInTopQueue({
            id,
            url,
            params,
            onSuccess: (result) => {
                if (onSuccessCb) onSuccessCb(result)
            },
            onProgress: (e) => {
                if (onProgressCb) onProgressCb(e)
            },
            onFail: onFailCb
                ? (error) => {
                      if (onFailCb) onFailCb(error)
                  }
                : null,
        })
    }

    const createNewRequest = (url, params, callbacks = {}) => {
        const {
            onSuccess: onSuccessCb,
            onFail: onFailCb,
            onProgress: onProgressCb,
        } = callbacks
        const id = params.id ? params.id : generateUID()

        if (params.max != undefined) {
            const totalInQueue = localRequests.current.reduce(
                (total, current) => {
                    if (id == current) return total + 1
                    else return total
                },
                0
            )
            if (totalInQueue >= params.max) return
        }
        localRequests.current = [...localRequests.current, id]
        addInQueue({
            id,
            url,
            params,
            onSuccess: (result) => {
                if (onSuccessCb) onSuccessCb(result)
                localRequests.current.splice(
                    localRequests.current.indexOf(id),
                    1
                )
            },
            onProgress: (e) => {
                if (onProgressCb) onProgressCb(e)
            },
            onFail: (error) => {
                localRequests.current.splice(
                    localRequests.current.indexOf(id),
                    1
                )
                if (onFailCb) onFailCb(error)
            },
        })
    }

    const abortRequest = (id) => {
        if (id) {
            removeRequests(id)
        }
        const currentRequest = getCurrentRequest()
        if (currentRequest) {
            currentRequest.abort()
        } else {
            // Toaster no current request
        }
    }

    const processRequestsNow = () => {
        processRequests()
    }

    useHttpFn.createNewRequest = createNewRequest
    useHttpFn.abortRequest = abortRequest

    return {
        createNewRequest,
        processRequestsNow,
        createNewTopRequest,
        abortRequest,
        setKillOnUnmount,
    }
}

export { useHttpQueue, useHttpFn }
