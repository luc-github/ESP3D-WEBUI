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

/*
 * Local const
 *
 */
const SettingsContext = createContext("SettingsContext");
const useSettingsContext = () => useContext(SettingsContext);

const SettingsContextProvider = ({ children }) => {
  const settingsValues = useRef({});
  //TODO: this should be more generic !!!
  const getInterfaceValue = (Id) => {
    if (settingsValues.current.interface) {
      for (let key in settingsValues.current.interface) {
        if (Array.isArray(settingsValues.current.interface[key])) {
          for (
            let index = 0;
            index < settingsValues.current.interface[key].length;
            index++
          ) {
            if (settingsValues.current.interface[key][index].id == Id) {
              return settingsValues.current.interface[key][index].value;
            }
          }
        } else {
          for (let subkey in settingsValues.current.interface[key]) {
            if (Array.isArray(settingsValues.current.interface[key][subkey])) {
              for (
                let index = 0;
                index < settingsValues.current.interface[key][subkey].length;
                index++
              ) {
                if (
                  settingsValues.current.interface[key][subkey][index].id == Id
                ) {
                  return settingsValues.current.interface[key][subkey][index]
                    .value;
                }
              }
            }
          }
        }
      }
    }
    return undefined;
  };

  const store = {
    settings: settingsValues,
    getInterfaceValue,
  };

  return (
    <SettingsContext.Provider value={store}>
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContextProvider, useSettingsContext };
