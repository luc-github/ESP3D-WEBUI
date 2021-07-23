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
import { useRef, useContext } from "preact/hooks";
import { useUiContext } from "./UiContext";

/*
 * Local const
 *
 */
const SettingsContext = createContext("SettingsContext");
const useSettingsContext = () => useContext(SettingsContext);

const SettingsContextProvider = ({ children }) => {
  const interfaceValues = useRef({});
  const connectionValues = useRef({});
  const featuresValues = useRef({});
  const pollingInterval = useRef({});
  //TODO: this should be more generic !!!
  const getInterfaceValue = (Id) => {
    if (interfaceValues.current) {
      for (let key in interfaceValues.current) {
        if (Array.isArray(interfaceValues.current[key])) {
          for (
            let index = 0;
            index < interfaceValues.current[key].length;
            index++
          ) {
            if (interfaceValues.current[key][index].id == Id) {
              return interfaceValues.current[key][index].value;
            }
          }
        } else {
          for (let subkey in interfaceValues.current[key]) {
            if (Array.isArray(interfaceValues.current[key][subkey])) {
              for (
                let index = 0;
                index < interfaceValues.current[key][subkey].length;
                index++
              ) {
                if (interfaceValues.current[key][subkey][index].id == Id) {
                  return interfaceValues.current[key][subkey][index].value;
                }
              }
            }
          }
        }
      }
    }
    return undefined;
  };

  function startPolling(pollingFunction) {
    stopPolling();
    if (getInterfaceValue("enablepolling")) {
      if (pollingFunction)
        pollingInterval.current = setInterval(
          pollingFunction,
          getInterfaceValue("pollingrefresh")
        );
    }
  }

  /*
   * Stop polling query
   */
  function stopPolling() {
    if (pollingInterval.current != null) {
      clearInterval(pollingInterval.current);
    }
    pollingInterval.current = null;
  }

  const store = {
    interfaceSettings: interfaceValues,
    connectionSettings: connectionValues,
    featuresSettings: featuresValues,
    getInterfaceValue,
    activity: { startPolling, stopPolling },
  };

  return (
    <SettingsContext.Provider value={store}>
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContextProvider, useSettingsContext };
