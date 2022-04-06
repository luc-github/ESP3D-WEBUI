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


/*
 * Local variables
 */
let wpos = [];

/*
 * Local const
 *
 */
const TargetContext = createContext("TargetContext");
const useTargetContext = () => useContext(TargetContext);
const useTargetContextFn = {};

const TargetContextProvider = ({ children }) => {
  const [positions, setPositions] = useState({
    x: "?",
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
    //status
    if (type === "stream") {
      //format is : <...>
      const status_patern = /<?(.*)>/;
      if (status_patern.test(data)) {
        const mpos_pattern = /\|MPos:(\s*([+,-]?[0-9]*\.?[0-9]+)?[,\|>])*/i;
        const WCO_pattern = /\|WCO:(\s*([+,-]?[0-9]*\.?[0-9]+)?[,\|>])*/i;
        let result = null;
        //Machine positions
        if ((result = mpos_pattern.exec(data)) !== null) {
          try {
            const mpos_array = result[0].split(":")[1].split("|")[0].split(",");
            const precision = mpos_array[0].split(".")[1].length;
            const pos = mpos_array.map((e) =>
              parseFloat(e).toFixed(precision).toString()
            );

            //Work coordinates
            if ((result = WCO_pattern.exec(data)) !== null) {
              try {
                const wpos_array = result[0]
                  .split(":")[1]
                  .split("|")[0]
                  .split(",");
                wpos = wpos_array.map((e, index) =>
                  (parseFloat(pos[index]) - parseFloat(e))
                    .toFixed(precision)
                    .toString()
                );
              } catch (e) {
                console.error(e);
              }
            }
            setPositions({
              x: pos[0],
              y: pos.length > 1 ? pos[1] : undefined,
              z: pos.length > 2 ? pos[2] : undefined,
              a: pos.length > 3 ? pos[3] : undefined,
              b: pos.length > 4 ? pos[4] : undefined,
              c: pos.length > 5 ? pos[5] : undefined,
              wx: wpos.length > 0 ? wpos[0] : undefined,
              wy: wpos.length > 1 ? wpos[1] : undefined,
              wz: wpos.length > 2 ? wpos[2] : undefined,
              wa: wpos.length > 3 ? wpos[3] : undefined,
              wb: wpos.length > 4 ? wpos[4] : undefined,
              wc: wpos.length > 5 ? wpos[5] : undefined,
            });
          } catch (e) {
            console.error(e);
          }
        }
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
    processData,
  };

  return (
    <TargetContext.Provider value={store}>{children}</TargetContext.Provider>
  );
};

export { TargetContextProvider, useTargetContext, useTargetContextFn };
