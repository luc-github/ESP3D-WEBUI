/*
 TargetContext.js - ESP3D WebUI context file

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
import { useRef, useContext, useState } from "preact/hooks"
import {
    limitArr,
    dispatchToExtensions,
    beautifyJSONString,
} from "../../../components/Helpers"
import { useDatasContext } from "../../../contexts"
import { processor } from "./processor"
import { isVerboseOnly } from "./stream"
import {
    isStatus,
    getStatus,
    isStates,
    getStates,
    isMessage,
    getMessage,
    isAlarm,
    getAlarm,
    isError,
    getError,
    isGcodeParameter,
    getGcodeParameter,
    isVersion,
    getVersion,
    isOptions,
    getOptions,
} from "./filters"

let lastStatus = null

/*
 * Local const
 *
 */
const TargetContext = createContext("TargetContext")
const useTargetContext = () => useContext(TargetContext)
const useTargetContextFn = {}

const TargetContextProvider = ({ children }) => {
    const [positions, setPositions] = useState({
        x: "?",
    })
    const [status, setStatus] = useState({})
    const [states, setStates] = useState({})
    const [message, setMessage] = useState()
    const [alarmCode, setAlarmCode] = useState(0)
    const [errorCode, setErrorCode] = useState(0)
    const [gcodeParameters, setGcodeParameters] = useState({})
    const [grblVersion, setGrblVersion] = useState({})
    const [grblSettings, setGrblSettings] = useState({})
    const gcodeParametersRef = useRef({})
    const { terminal } = useDatasContext()
    const dataBuffer = useRef({
        stream: "",
        core: "",
        response: "",
        error: "",
        echo: "",
    })

    const dispatchInternally = (type, data) => {
        //files
        processor.handle(type, data)
        //sensors
        //status
        if (type === "stream") {
            //status
            if (isStatus(data)) {
                const response = getStatus(data)
                if (response.positions) {
                    setPositions(response.positions)
                }
                if (response.status) {
                    setStatus(response.status)
                    if (lastStatus !== response.status) {
                        lastStatus = response.status
                        if (
                            !(
                                response.status.state == "Alarm" ||
                                response.status.state == "Idle" ||
                                response.status.state == "Sleep"
                            )
                        )
                            setMessage("")
                        if (
                            !(
                                response.status.state == "Alarm" ||
                                response.status.state == "Error"
                            )
                        ) {
                            setAlarmCode(0)
                            setErrorCode(0)
                        }
                    }
                }
                //more to set+
                //....
            }
            //ALARM
            if (isAlarm(data)) {
                const response = getAlarm(data)
                setAlarmCode(response)
                setErrorCode(0)
                setMessage("")
                setStatus({ state: "Alarm" })
            }

            //error
            if (isError(data)) {
                const response = getError(data)
                setErrorCode(response)
                setAlarmCode(0)
                setMessage("")
                setStatus({ state: "Error" })
            }
            //prefiltering
            if (data[0] === "[") {
                if (isStates(data)) {
                    const response = getStates(data)
                    setStates(response)
                }

                if (isMessage(data)) {
                    const response = getMessage(data)
                    console.log("message", response)
                    setMessage(response)
                }
                if (isGcodeParameter(data)) {
                    const response = getGcodeParameter(data)
                    gcodeParametersRef.current[response.code] = {
                        data: [...response.data],
                    }
                    if (typeof response.success !== "undefined") {
                        gcodeParametersRef.current[response.code].success =
                            response.success
                    }
                    setGcodeParameters(gcodeParametersRef.current)
                }
                if (isVersion(data)) {
                    const response = getVersion(data)
                    setGrblVersion(response)
                }
                if (isOptions(data)) {
                    const response = getOptions(data)
                    console.log("options", response)
                    setGrblSettings(response)
                }
            }
        }
        //etc...
    }
    const processData = (type, data) => {
        if (data.length > 0) {
            if (type == "stream") {
                //TODO
                //need to handle \r \n and even not having some
                //this will split by char
                data.split("").forEach((element, index) => {
                    if (element == "\n" || element == "\r") {
                        if (dataBuffer.current[type].length > 0) {
                            const isverboseOnly = isVerboseOnly(
                                type,
                                dataBuffer.current[type]
                            )
                            dispatchInternally(type, dataBuffer.current[type])
                            //format the output if needed
                            if (dataBuffer.current[type].startsWith("{")) {
                                const newbuffer = beautifyJSONString(
                                    dataBuffer.current[type]
                                )
                                if (newbuffer == "error")
                                    terminal.add({
                                        type,
                                        content: dataBuffer.current[type],
                                        isverboseOnly,
                                    })
                                else {
                                    terminal.add({
                                        type,
                                        content: newbuffer,
                                        isverboseOnly,
                                    })
                                }
                            } else {
                                //if not json
                                terminal.add({
                                    type,
                                    content: dataBuffer.current[type],
                                    isverboseOnly,
                                })
                            }

                            dataBuffer.current[type] = ""
                        }
                    } else {
                        dataBuffer.current[type] += element
                    }
                })
            } else if (type == "response") {
                //ignore such answer unless need to check response
                //this response is to workaround some response lost when no response
                if (data.startsWith("ESP3D says:")) return
                const isverboseOnly = isVerboseOnly(type, data)
                dispatchInternally(type, data)
                //format the output if needed
                if (data.startsWith("{")) {
                    const newbuffer = beautifyJSONString(data)
                    if (newbuffer == "error")
                        terminal.add({
                            type,
                            content: data,
                            isverboseOnly,
                        })
                    else {
                        terminal.add({
                            type,
                            content: newbuffer,
                            isverboseOnly,
                        })
                    }
                } else {
                    terminal.add({
                        type,
                        content: data,
                        isverboseOnly,
                    })
                }
            } else {
                const isverboseOnly = isVerboseOnly(type, data)
                terminal.add({ type, content: data, isverboseOnly })
                dispatchInternally(type, data)
            }
            dispatchToExtensions(type, data)
        }
    }

    useTargetContextFn.processData = processData

    const store = {
        positions,
        status,
        states,
        message,
        alarmCode,
        errorCode,
        gcodeParameters,
        grblVersion,
        grblSettings,
        processData,
    }

    return (
        <TargetContext.Provider value={store}>
            {children}
        </TargetContext.Provider>
    )
}

export { TargetContextProvider, useTargetContext, useTargetContextFn }
