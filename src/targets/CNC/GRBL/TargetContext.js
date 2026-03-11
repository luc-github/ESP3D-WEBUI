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
import { eventsList, variablesList } from "."
import {
    isOk,
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
    isReset,
    isStreamingStatus,
    getStreamingStatus,
} from "./filters"

const lastStatus = {}
const lastStates = {}
const lastPins = {}

/*
 * Local const
 *
 */
const TargetContext = createContext("TargetContext")
const useTargetContext = () => useContext(TargetContext)
const useTargetContextFn = {}

useTargetContextFn.isStaId = (subsectionId, label, fieldData) => {
    if (subsectionId == "sta" && label == "SSID") return true
    return false
}

const TargetContextProvider = ({ children }) => {
    const [positions, setPositions] = useState({
        x: "?",
    })
    const [status, setStatus] = useState({ state: "?" })
    const [overrides, setOverrides] = useState({})
    const [pinsStates, setPinStates] = useState(lastPins)
    const [states, setStates] = useState({})
    const [streamStatus, setStreamStatus] = useState({})
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
            if (isOk(data)) {
                //just ignore this one so we can continue
            } else if (isStatus(data)) {
                //status
                const response = getStatus(data)
                //For Pn we need to keep the last value to keep trace the pin is detected or not,
                //so we can display the pin icon when disabled even no data is received
                if (
                    Object.keys(lastPins).length > 0 ||
                    Object.keys(response.pn).length > 0
                ) {
                    Object.keys(response.pn).forEach((key) => {
                        lastPins[key] = response.pn[key]
                    })
                    Object.keys(lastPins).forEach((key) => {
                        if (!response.pn[key]) {
                            lastPins[key] = false
                        }
                    })
                }
                setPinStates(lastPins)
                if (response.positions) {
                    setPositions(response.positions)
                    const names = [
                        "x",
                        "y",
                        "z",
                        "a",
                        "b",
                        "c",
                        "wx",
                        "wy",
                        "wz",
                        "wa",
                        "wb",
                        "wc",
                    ]
                    names.forEach((element) => {
                        let name = "#pos_" + element + "#"
                        variablesList.addCommand({
                            name: name,
                            value: parseFloat(
                                response.positions[element]
                                    ? response.positions[element]
                                    : 0
                            ),
                        })
                    })
                }
                if (response.status) {
                    setStatus(response.status)
                    if (lastStatus.current !== response.status) {
                        lastStatus.current = response.status
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
                if (response.ov) {
                    setOverrides(response.ov)
                }
                if (response.f) {
                    //Update state accordingly
                    if (!lastStates.current) lastStates.current = {}
                    if (typeof response.f.value != "undefined")
                        lastStates.current.feed_rate = {
                            value: response.f.value,
                        }
                    if (typeof response.rpm.value != "undefined")
                        lastStates.current.spindle_speed = {
                            value: response.rpm.value,
                        }
                    setStates(lastStates.current)
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
                eventsList.emit("alarm", data)
            }

            //error
            if (isError(data)) {
                const response = getError(data)
                setErrorCode(response)
                setAlarmCode(0)
                setMessage("")
                setStatus({ state: "Error" })
                eventsList.emit("error", data)
            }
            //prefiltering
            if (data[0] === "[") {
                if (isStates(data)) {
                    lastStates.current = getStates(data)
                    setStates(lastStates.current)
                }

                if (isMessage(data)) {
                    const response = getMessage(data)
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
                    if (gcodeParametersRef.current.PRB) {
                        //the PRB is x y z even
                        gcodeParametersRef.current.PRB.data.map(
                            (value, index) => {
                                let name =
                                    "#prb_" +
                                    String.fromCharCode(120 + index) +
                                    "#"
                                variablesList.addCommand({
                                    name: name,
                                    value: parseFloat(value),
                                })
                            }
                        )
                    }
                    setGcodeParameters(gcodeParametersRef.current)
                }
                if (isVersion(data)) {
                    const response = getVersion(data)
                    setGrblVersion(response)
                }
                if (isOptions(data)) {
                    const response = getOptions(data)
                    setGrblSettings(response)
                }
            }
            if (isReset(data)) {
                eventsList.emit("reset", data)
            }
        }
        if (type === "response") {
            //check if the response is a command answer
            if (data[0] === "{") {
                if (isStreamingStatus(data)) {
                    const status = getStreamingStatus(data)
                    setStreamStatus(status)
                }
            }
        }
        //etc...
    }
    const processData = (type, data, noecho = false) => {
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
                        if (!noecho)
                            terminal.add({
                                type,
                                content: newbuffer,
                                isverboseOnly,
                            })
                    }
                } else {
                    if (!noecho)
                        terminal.add({
                            type,
                            content: data,
                            isverboseOnly,
                        })
                }
            } else {
                if (type != "core") {
                    const isverboseOnly = isVerboseOnly(type, data)
                    terminal.add({ type, content: data, isverboseOnly })
                }
                dispatchInternally(type, data)
            }
            dispatchToExtensions(type, data)
        }
    }

    useTargetContextFn.processData = processData

    const store = {
        positions,
        streamStatus,
        status,
        states,
        pinsStates,
        message,
        alarmCode,
        errorCode,
        overrides,
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
