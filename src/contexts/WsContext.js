/*
 WsContext.js - ESP3D WebUI context file

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
import { h, createContext } from "preact";
import {
  useState,
  useEffect,
  useRef,
  useReducer,
  useContext,
} from "preact/hooks";
import { Parser } from "../components/Targets";
import { limitArr } from "../components/Helpers";
import { useUiContext, useSettingsContext } from "../contexts";

/*
 * Local const
 *
 */
const WsContext = createContext("wsContext");
const useWsContext = () => useContext(WsContext);

const INITIAL_STATE = {
  temp: [],
  files: [],
};

const reducer = (state, action) => {
  if (!action) return INITIAL_STATE;
  switch (action.type) {
    case "temp":
      return {
        ...state,
        temp: limitArr([...state.temp, action.values], 400),
      };
    case "files":
      return {
        ...state,
        files: action.values,
      };
    default:
      return { ...INITIAL_STATE, ...state };
  }
};

const WsContextProvider = ({ children }) => {
  const { toasts, connection } = useUiContext();
  const [parsedValues, dispatch] = useReducer(reducer, INITIAL_STATE);
  const dataBuffer = useRef([]);
  const { settings } = useSettingsContext();
  const parser = useRef(new Parser());
  const [wsConnection, setWsConnection] = useState();
  const [wsData, setWsData] = useState([]);

  const splitArrayBufferByLine = (arrayBuffer) => {
    const bytes = new Uint8Array(arrayBuffer);
    return bytes.reduce(
      (acc, curr) => {
        if (curr == 10 || curr == 13) return [...acc, []];
        const i = Number(acc.length - 1);
        return [...acc.slice(0, i), [...acc[i], curr]];
      },
      [[]]
    );
  };

  const onMessageCB = (e) => {
    const { parse } = parser.current;
    //for binary messages used for terminal
    const stdOutData = e.data;
    if (stdOutData instanceof ArrayBuffer) {
      const newLines = splitArrayBufferByLine(stdOutData).map((line) => ({
        std: "out",
        value: line.reduce((acc, curr) => acc + String.fromCharCode(curr), ""),
      }));
      dataBuffer.current = [...dataBuffer.current, ...newLines];
      [...newLines].forEach((line) => {
        dispatch(parse(line.value));
      });
    } else {
      //others txt messages
      console.log(stdOutData);
      const eventLine = stdOutData.split(":");
      if (eventLine.length > 1) {
        switch (eventLine[0].toUpperCase()) {
          case "CURRENTID":
            settings.current.wsID = eventLine[1];
            break;
          case "ACTIVEID":
            if (eventLine[1] != settings.current.wsID) {
              connection.setConnectionState({ connected: false, page: 3 });
              //TODO: Stop all http query
              //TODO: Stop websocket
              if (wsConnection) wsConnection.close();
              else console.log("No wsConnection but I have ws events!!!!");
            }
            break;
          default:
            //unknow event
            break;
        }
      }
      dataBuffer.current = [
        ...dataBuffer.current,
        { std: "out", value: stdOutData },
      ];
      const parsedRes = parse(stdOutData);
      if (parsedRes) {
        dispatch(parsedRes);
      }
    }
    setWsData(dataBuffer.current);
  };

  const onCloseCB = (e) => {
    //TODO: Need to handle auto reconnect
    //TODO: Need to Handle forced disconnection
    //TODO:  Need to handle error disconnection
  };

  const onErrorCB = (e) => {
    toasts.addToast({ content: e, type: "error" });
    //TODO: Need to handle disconnection
  };

  const setupWS = () => {
    const path =
      settings.current.connection.WebCommunication === "Synchronous"
        ? ""
        : "/ws";
    const ws = new WebSocket(
      `ws://${settings.current.connection.WebSocketIP}:${settings.current.connection.WebSocketport}${path}`,
      ["arduino"]
    );
    ws.binaryType = "arraybuffer";
    setWsConnection(ws);

    //Handle msg of ws
    ws.onmessage = (e) => onMessageCB(e);
    ws.onclose = (e) => onCloseCB(e);
    ws.onerror = (e) => onErrorCB(e);
  };

  useEffect(() => {
    if (settings.current.connection) {
      setupWS();
    }

    return () => {
      if (wsConnection) ws.close();
    };
  }, [settings.current.connection]);

  const addData = (cmdLine) => {
    const newWsData = [...wsData, cmdLine];
    dataBuffer.current = newWsData;
    setWsData(newWsData);
  };
  const setData = (cmdLine) => {
    dataBuffer.current = cmdLine;
    setWsData(cmdLine);
  };

  const store = {
    ws: wsConnection,
    data: wsData,
    parsedValues,
    setData,
    addData,
  };

  return <WsContext.Provider value={store}>{children}</WsContext.Provider>;
};

export { WsContextProvider, useWsContext };
