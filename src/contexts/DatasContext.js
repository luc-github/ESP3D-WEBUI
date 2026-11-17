/*
 DatasContext.js - ESP3D WebUI context file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 Modified by Luc LEBOSSE 2021
 
 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public
 License as published by the Free Software Foundation; either
 version 3 of the License, or (at your option) any later version.
 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.
 You should have received a copy of the GNU General Public
 License along with This code; if not, see <https://www.gnu.org/licenses/>.
*/
import { h, createContext } from "preact"
import { useRef, useContext, useState } from "preact/hooks"
import { limitArr, useStoredState } from "../components/Helpers"

/*
 * Local const
 *
 */
const DatasContext = createContext("DatasContext")
const useDatasContext = () => useContext(DatasContext)

const DatasContextProvider = ({ children }) => {
    const isAutoScroll = useRef(true)
    const isAutoScrollPaused = useRef(undefined)
    const isVerbose = useRef(undefined)
    const terminalBuffer = useRef([])
    const terminalBufferQuiet = useRef([])
    const [terminalContent, setTerminalContent] = useState([])
    const [terminalInputHistory, setTerminalInputHistory] = useStoredState(
        "terminalInputHistory",
        []
    )
    const terminalInput = useRef()

    const clearTerminal = () => {
        terminalBuffer.current = []
        terminalBufferQuiet.current = []
        setTerminalContent([])
    }

    const addTerminalContent = (element) => {
        //console.log(element)
        //console.log(
        //    'isVerbose',
        //    terminalBuffer.current.length,
        //    'Quiet',
        //    terminalBufferQuiet.current.length
        //)
        const newData = {}
        newData.verbose = limitArr(
            [...terminalBuffer.current, element],
            isAutoScrollPaused.current ? 600 : isAutoScroll.current ? 300 : 400
        )
        terminalBuffer.current = newData.verbose
        newData.quiet = terminalBufferQuiet.current
        if (!element.isverboseOnly) {
            //console.log("quiet command", element)
            newData.quiet = limitArr(
                [...terminalBufferQuiet.current, element],
                isAutoScrollPaused.current
                    ? 600
                    : isAutoScroll.current
                      ? 300
                      : 400
            )
            terminalBufferQuiet.current = newData.quiet
        }
        if (isVerbose.current) setTerminalContent(terminalBuffer.current)
        else setTerminalContent(terminalBufferQuiet.current)
    }

    const addTerminalInputHistory = (element) => {
        setTerminalInputHistory(
            limitArr([...terminalInputHistory, element], 50)
        )
    }

    const syncContentToVerboseMode = () => {
        if (isVerbose.current) setTerminalContent([...terminalBuffer.current])
        else setTerminalContent([...terminalBufferQuiet.current])
    }

    const store = {
        terminal: {
            input: terminalInput,
            content: terminalContent,
            add: addTerminalContent,
            clear: clearTerminal,
            inputHistory: terminalInputHistory,
            addInputHistory: addTerminalInputHistory,
            isAutoScroll,
            isVerbose,
            isAutoScrollPaused,
            syncContentToVerboseMode,
        },
    }

    return (
        <DatasContext.Provider value={store}>{children}</DatasContext.Provider>
    )
}

export { DatasContextProvider, useDatasContext }
