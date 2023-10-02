/*
 HttpQueueContext.js - ESP3D WebUI context file

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
import { useContext, useRef } from "preact/hooks"
import { httpAdapter } from "../adapters"
import { useUiContext } from "./UiContext"
import { useWsContext } from "./WsContext"
import { useTargetContext } from "../targets"

let counterNoAnswer = 0
const MaxNoAnswerNb = 4

/*
 * Local const
 *
 */
const HttpQueueContext = createContext("HttpQueueContext")
const useHttpQueueContext = () => useContext(HttpQueueContext)

const HttpQueueContextProvider = ({ children }) => {
    const { processData } = useTargetContext()
    const { Disconnect } = useWsContext()
    const requestQueue = useRef([]) // Http queue for every components
    const isBusy = useRef(false)
    const currentRequest = useRef()
    const { dialogs, connection } = useUiContext()
    //Add new Request to queue
    const addInQueue = (newRequest) => {
        requestQueue.current = [...requestQueue.current, newRequest]
        if (!isBusy.current) executeHttpCall()
    }
    //Add new Request to top of queue
    const addInTopQueue = (newRequest) => {
        requestQueue.current = [newRequest, ...requestQueue.current]
        if (!isBusy.current) executeHttpCall()
    }
    //Remove finished request from queue
    const removeRequestDone = () => {
        requestQueue.current = [...requestQueue.current].slice(1)
        currentRequest.current = null
    }
    //Remove finished request from queue
    const removeRequests = (requestIds) => {
        const updatedRequestQueue = [...requestQueue.current].filter(
            ({ id }) => {
                return !requestIds.includes(id)
            }
        )
        requestQueue.current = updatedRequestQueue
    }
    //Get current active request in queue
    const getCurrentRequest = () => {
        return currentRequest.current
    }

    //Remove all request from queue
    const removeAllRequests = () => {
        if (currentRequest.current) currentRequest.current.abort()
        requestQueue.current = []
        currentRequest.current = null
    }
    //Process requests from queue
    const processRequests = () => {
        executeHttpCall()
    }

    //Process query in queue
    const executeHttpCall = async () => {
        if (!isBusy.current) isBusy.current = true
        const { url, params, onSuccess, onFail, onProgress } =
            requestQueue.current[0]
        let is401Error = false
        try {
            currentRequest.current = httpAdapter(url, params, onProgress)
            if (params.echo) {
                processData("echo", params.echo)
            }
            const response = await currentRequest.current.response
            onSuccess(response)
            counterNoAnswer = 0
        } catch (e) {
            if (e.code == 401) {
                is401Error = true
                connection.setConnectionState({
                    connected: connection.connectionState.connected,
                    authenticate: false,
                    page: "notauthenticated",
                })
            } else if (e.code == 499) {
                //just do not raise error screen
            } else {
                if (!e.code) {
                    counterNoAnswer++
                    console.log("Connection lost ?", counterNoAnswer)
                    if (counterNoAnswer > MaxNoAnswerNb) {
                        Disconnect("connectionlost")
                    }
                }
            }
            if (onFail) {
                onFail(e.message) //to-check
            }
        } finally {
            //check if need to remove or not
            if (!is401Error) {
                removeRequestDone()
                if (requestQueue.current.length > 0) {
                    executeHttpCall()
                } else {
                    isBusy.current = false
                }
            } else {
                removeRequests("login")
                currentRequest.current = null
                dialogs.setNeedLogin(true)
            }
        }
    }

    return (
        <HttpQueueContext.Provider
            value={{
                addInQueue,
                addInTopQueue,
                removeRequests,
                getCurrentRequest,
                removeAllRequests,
                processRequests,
            }}
        >
            {children}
        </HttpQueueContext.Provider>
    )
}

export { HttpQueueContextProvider, useHttpQueueContext }
