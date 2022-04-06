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
import { h, createContext } from "preact";
import { useRef, useContext, useState } from "preact/hooks";
import {
  limitArr,
  dispatchToExtensions,
  beautifyJSONString,
} from "../../../components/Helpers";
import { useDatasContext } from "../../../contexts";
import { processor } from "./processor";
import { isVerboseOnly } from "./stream";
import {
  isTemperatures,
  getTemperatures,
  isPositions,
  getPositions,
} from "./filters";

/*
 * Local const
 *
 */
const TargetContext = createContext("TargetContext");
const useTargetContext = () => useContext(TargetContext);
const useTargetContextFn = {};

const TargetContextProvider = ({ children }) => {
  //format is x:value, y:value, z:value
  const [positions, setPositions] = useState({
    x: "?",
    y: "?",
    z: "?",
  });

  //format tool:["0":{current:xxx target:xxx}, "1":{current:xxx target:xxx}, ...]
  //index is same as printer
  //Cooler: [], //0->1 is only for laser so out of scope
  const [temperatures, setTemperaturess] = useState({
    T: [], //0->8 T0->T8 Extruders
    R: [], //0->1 R Redondant
    B: [], //0->1 B Bed
    C: [], //0->1  Chamber
    P: [], //0->1 Probe
    M: [], //0->1 M Board
    L: [], //0->1 L is only for laser so should beout of scope
  });

  const { terminal } = useDatasContext();
  const dataBuffer = useRef({
    stream: "",
    core: "",
    response: "",
    error: "",
    echo: "",
  });

  const dispatchInternally = (type, data) => {
    //files
    processor.handle(type, data);
    //sensors

    if (type === "stream") {
      if (isTemperatures(data)) {
        const t = getTemperatures(data);
        setTemperaturess(t);
      } else if (isPositions(data)) {
        const p = getPositions(data);
        setPositions(p);
      }
    }
    //etc...
  };

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
              );
              dispatchInternally(type, dataBuffer.current[type]);
              //format the output if needed
              if (dataBuffer.current[type].startsWith("{")) {
                const newbuffer = beautifyJSONString(dataBuffer.current[type]);
                if (newbuffer == "error")
                  terminal.add({
                    type,
                    content: dataBuffer.current[type],
                    isverboseOnly,
                  });
                else {
                  terminal.add({
                    type,
                    content: newbuffer,
                    isverboseOnly,
                  });
                }
              } else {
                //if not json
                terminal.add({
                  type,
                  content: dataBuffer.current[type],
                  isverboseOnly,
                });
              }

              dataBuffer.current[type] = "";
            }
          } else {
            dataBuffer.current[type] += element;
          }
        });
      } else if (type == "response") {
        const isverboseOnly = isVerboseOnly(type, data);
        dispatchInternally(type, data);
        //format the output if needed
        if (data.startsWith("{")) {
          const newbuffer = beautifyJSONString(data);
          if (newbuffer == "error")
            terminal.add({
              type,
              content: data,
              isverboseOnly,
            });
          else {
            terminal.add({
              type,
              content: newbuffer,
              isverboseOnly,
            });
          }
        } else {
          terminal.add({
            type,
            content: data,
            isverboseOnly,
          });
        }
      } else {
        const isverboseOnly = isVerboseOnly(type, data);
        terminal.add({ type, content: data, isverboseOnly });
        dispatchInternally(type, data);
      }
      dispatchToExtensions(type, data);
    }
  };

  useTargetContextFn.processData = processData;

  const store = {
    positions,
    temperatures,
    processData,
  };

  return (
    <TargetContext.Provider value={store}>{children}</TargetContext.Provider>
  );
};

export { TargetContextProvider, useTargetContext, useTargetContextFn };
