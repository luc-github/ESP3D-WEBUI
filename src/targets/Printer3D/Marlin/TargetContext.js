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
import { Terminal } from "preact-feather";
import { useRef, useContext, useState } from "preact/hooks";
import { limitArr, dispatchData } from "../../../components/Helpers";
import { useDatasContext } from "../../../contexts";

/*
 * Local const
 *
 */
const TargetContext = createContext("TargetContext");
const useTargetContext = () => useContext(TargetContext);

const TargetContextProvider = ({ children }) => {
  const { terminal } = useDatasContext();

  const isVerbose = (type, data) => {
    if (data.startsWith("ok") || data.startsWith("M105")) return true;
    else return false;
  };
  const processData = (type, data) => {
    if (data.length > 0) {
      if (type == "stream") {
        //need to handle \r \n and even not having some
        dispatchData(type, data);
      }
      if (type == "response") {
        //need to handle \r \n and even not having some
        dispatchData(type, data);
      }
      const isverbose = isVerbose(type, data);
      terminal.add({ type, content: data, isverbose });

      console.log("Processing:", type, ":", data);
    }
  };

  const store = {
    processData,
  };

  return (
    <TargetContext.Provider value={store}>{children}</TargetContext.Provider>
  );
};

export { TargetContextProvider, useTargetContext };
