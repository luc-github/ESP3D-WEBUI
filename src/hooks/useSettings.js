/*
 useSettings.js - ESP3D WebUI hooks file

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
import { h } from "preact";
import { useState } from "preact/hooks";
import { useSettingsContext } from "../contexts/";
import { espHttpURL } from "../components/Helpers";
import { useHttpQueue } from "../hooks/";
import { useUiContext } from "../contexts";
import { defaultPreferences } from "../components/Targets";

/*
 * Local const
 *
 */
const useSettings = () => {
  const { createNewRequest } = useHttpQueue();
  const { toasts } = useUiContext();
  const { settings } = useSettingsContext();

  const [settingsState, setSettingsState] = useState(settings);

  const setSettings = (_settingsState) => {
    settings.current = _settingsState;
    setSettingsState(_settingsState);
  };

  const getConnectionSettings = () => {
    function getPCTime() {
      function padNumber(num, size) {
        const s = num.toString().padStart(size, "0");
        return s;
      }
      const d = new Date();
      return `${d.getFullYear()}-${padNumber(d.getMonth() + 1, 2)}-${padNumber(
        d.getDate(),
        2
      )}-${padNumber(d.getHours(), 2)}-${padNumber(
        d.getMinutes(),
        2
      )}-${padNumber(d.getSeconds(), 2)}`;
    }
    createNewRequest(
      espHttpURL("command", { cmd: "[ESP800]", time: getPCTime() }).toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          const jsonResult = JSON.parse(result);
          setSettings({ ...settingsState.current, connection: jsonResult });
          console.log("Connection done");
        },
        onFail: (error) => {
          toasts.addToast({ content: error, type: "error" });
          //TODO display a modal with a retry button
        },
      }
    );
  };
  const getInterfaceSettings = () => {
    setSettings({ ...settingsState.current, interface: defaultPreferences });
    createNewRequest(
      espHttpURL("preferences.json").toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          //TODO:
          //Handle corrupted preference.json
          const jsonResult = JSON.parse(result);
          setSettings({ ...settingsState.current, interface: jsonResult });
        },
        onFail: (error) => {
          toasts.addToast({
            content: error + " preferences.json",
            type: "error",
          });
          console.log("No valid preferences.json");
        },
      }
    );
  };
  const getFeaturesSettings = () => {
    createNewRequest(
      espHttpURL("command", { cmd: "[ESP400]" }).toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          const jsonResult = JSON.parse(result);
          setSettings({ ...settingsState.current, features: jsonResult });
        },
        onFail: (error) => {
          toasts.addToast({ content: error, type: "error" });
        },
      }
    );
  };

  return {
    settings: settings.current,
    setSettings: (settingsState) => {
      settings.current = settingsState;
    },
    getFeaturesSettings,
    getInterfaceSettings,
    getConnectionSettings,
  };
};

export { useSettings };
