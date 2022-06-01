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
    isTemperatures,
    getTemperatures,
    isPositions,
    getPositions,
    isPrintStatus,
    getPrintStatus,
    isPrintFileName,
    getPrintFileName,
    isStatus,
    getStatus,
    isFlowRate,
    getFlowRate,
    isFeedRate,
    getFeedRate,
    isSensor,
    getSensor,
    isFanSpeed,
    getFanSpeed,
} from "./filters"

/*
 * Local const
 *
 */
const TargetContext = createContext("TargetContext")
const useTargetContext = () => useContext(TargetContext)
const useTargetContextFn = {}

const TargetContextProvider = ({ children }) => {
    //format is x:value, y:value, z:value
    const [positions, setPositions] = useState({
        x: "?",
        y: "?",
        z: "?",
    })
    const MAX_TEMPERATURES_LIST_SIZE = 400

    const globalStatus = useRef({
        printState: { status: "Unknown", printing: false, progress: 0 },
        filename: "",
        state: "",
    })
    const fansSpeed = useRef([])
    const flowsRate = useRef([])
    const feedsRate = useRef([])

    //format is value is set in indexed value of array
    //fan / flowRate follow extruders but not feedRate, but keep indexed array also
    const [fanSpeed, setFanSpeed] = useState(fansSpeed.current)
    const [flowRate, setFlowRate] = useState(flowsRate.current)
    const [feedRate, setFeedRate] = useState(feedsRate.current)

    //status has 3 scope : print status, printing filename, state of printer
    const [status, setStatus] = useState(globalStatus.current)

    //format tool:["0":{current:xxx target:xxx}, "1":{current:xxx target:xxx}, ...]
    //index is same as printer
    //Cooler: [], //0->1 is only for laser so out of scope
    const [temperatures, setTemperatures] = useState({
        T: [], //0->8 T0->T8 Extruders
        R: [], //0->1 R Redondant
        B: [], //0->1 B Bed
        C: [], //0->1  Chamber
        P: [], //0->1 Probe
        M: [], //0->1 M Board
        L: [], //0->1 L is only for laser so should beout of scope
    })

    const [temperaturesList, setTemperaturesList] = useState([])
    const temperaturesListRef = useRef(temperaturesList)
    temperaturesListRef.current = temperaturesList
    const add2TemperaturesList = (temperaturesSet) => {
        if (temperaturesListRef.current.length >= MAX_TEMPERATURES_LIST_SIZE) {
            temperaturesListRef.current.shift()
        }
        temperaturesListRef.current =
            temperaturesListRef.current.concat(temperaturesSet)
        setTemperaturesList(temperaturesListRef.current)
    }

    const clearTemperaturesList = () => {
        temperaturesListRef.current = []
        setTemperaturesList([])
    }
    //Sensor
    const [sensorData, setSensorData] = useState({ S: [] })

    const [sensorDataList, setSensorDataList] = useState([])
    const sensorDataListRef = useRef(sensorDataList)
    sensorDataListRef.current = sensorDataList
    const add2SensorDataList = (sensorDataSet) => {
        if (sensorDataListRef.current.length >= MAX_TEMPERATURES_LIST_SIZE) {
            sensorDataListRef.current.shift()
        }
        sensorDataListRef.current =
            sensorDataListRef.current.concat(sensorDataSet)
        setSensorDataList(sensorDataListRef.current)
    }

    const clearSensorDataList = () => {
        sensorDataListRef.current = []
        setSensorDataList([])
    }

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

        if (type === "stream") {
            if (isTemperatures(data)) {
                const t = getTemperatures(data)
                setTemperatures(t)
                add2TemperaturesList({ temperatures: t, time: new Date() })
            } else if (isPositions(data)) {
                const p = getPositions(data)
                setPositions(p)
            } else if (isPrintStatus(data)) {
                const p = getPrintStatus(data)
                globalStatus.current.printState = p
                setStatus(globalStatus.current)
            } else if (isPrintFileName(data)) {
                const p = getPrintFileName(data)
                //Todo: do some sanity check, update
                globalStatus.current.filename = p
                setStatus(globalStatus.current)
            } else if (isStatus(data)) {
                const p = getStatus(data)
                globalStatus.current.state = p
                setStatus(globalStatus.current)
            } else if (isFlowRate(data)) {
                const p = getFlowRate(data)
                flowsRate.current[p.index] = p.value
                setFlowRate(flowsRate.current)
            } else if (isFeedRate(data)) {
                const p = getFeedRate(data)
                feedsRate.current[p.index] = p.value
                setFeedRate(feedsRate.current)
            } else if (isFanSpeed(data)) {
                const p = getFanSpeed(data)
                fansSpeed.current[p.index] = p.value
                setFanSpeed(fansSpeed.current)
            }
        } else if (type === "core") {
            if (isSensor(data)) {
                const result = getSensor(data)
                setSensorData({ S: result })
                add2SensorDataList({
                    temperatures: { S: result },
                    time: new Date(),
                })
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
        temperatures,
        temperaturesList: {
            current: temperaturesList,
            clear: clearTemperaturesList,
        },
        fanSpeed: {
            current: fanSpeed,
            set: (index, value) => {
                console.log("set fan speed", index, "=", value)
                fansSpeed[index] = value
                setFanSpeed(fanSpeed)
            },
        },
        flowRate: {
            current: flowRate,
            set: (index, value) => {
                flowsRate[index] = value
                setFlowRate(fanSpeed)
            },
        },
        feedRate: {
            current: feedRate,
            set: (index, value) => {
                feedsRate[index] = value
                setFeedRate(fanSpeed)
            },
        },
        sensor: sensorData,
        sensorList: {
            current: sensorDataList,
            clear: clearSensorDataList,
        },
        status: status,
        processData,
    }

    return (
        <TargetContext.Provider value={store}>
            {children}
        </TargetContext.Provider>
    )
}

export { TargetContextProvider, useTargetContext, useTargetContextFn }
