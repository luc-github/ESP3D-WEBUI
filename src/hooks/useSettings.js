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
import { espHttpURL, getBrowserTime } from "../components/Helpers";
import { useHttpQueue } from "../hooks/";
import { useUiContext, useRouterContext } from "../contexts";
import { defaultPreferences } from "../components/Targets";
import {
  importPreferences,
  formatPreferences,
} from "../tabs/interface/importHelper";
import { Frown } from "preact-feather";

/*
 * Local const
 *
 */
const useSettings = () => {
  const { createNewRequest } = useHttpQueue();
  const { toasts, connection } = useUiContext();
  const { settings, getInterfaceValue } = useSettingsContext();
  const { defaultRoute, setActiveRoute } = useRouterContext();
  const [settingsState, setSettingsState] = useState(settings);
  const setSettings = (_settingsState) => {
    settings.current = _settingsState;
    setSettingsState(_settingsState);
  };

  const getConnectionSettings = () => {
    createNewRequest(
      espHttpURL("command", {
        cmd: "[ESP800]",
        time: getBrowserTime(),
      }).toString(),
      { method: "GET", id: "connection" },
      {
        onSuccess: (result) => {
          const jsonResult = JSON.parse(result);
          setSettings({ ...settingsState.current, connection: jsonResult });
          document.title = jsonResult.Hostname;
          connection.setConnectionState({
            connected: true,
            authenticate: true,
            page: "connecting",
          });
          if (jsonResult.FWTarget == 0) {
            setActiveRoute("/settings");
            defaultRoute.current = "/settings";
          } else {
            setActiveRoute("/dashboard");
            defaultRoute.current = "/dashboard";
          }
        },
        onFail: (error) => {
          connection.setConnectionState({
            connected: false,
            authenticate: false,
            page: "error",
          });
          if (!error.startsWith("401"))
            toasts.addToast({ content: error, type: "error" });
        },
      }
    );
  };
  const getInterfaceSettings = (setLoading) => {
    setSettings({ ...settingsState.current, interface: defaultPreferences });
    createNewRequest(
      espHttpURL("preferences.json").toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          const jsonResult = JSON.parse(result);
          const [preferences, haserrors] = importPreferences(
            defaultPreferences,
            jsonResult
          );
          formatPreferences(preferences.settings);
          if (haserrors) {
            toasts.addToast({
              content: (
                <span class="feather-icon-container">
                  <Frown />
                  <span class="m-1">preferences.json</span>
                </span>
              ),
              type: "error",
            });
          }
          setSettings({ ...settingsState.current, interface: preferences });
          if (setLoading) {
            setLoading(false);
          }
        },
        onFail: (error) => {
          if (setLoading) {
            setLoading(false);
          }
          toasts.addToast({
            content: error + " preferences.json",
            type: "error",
          });
          console.log("No valid preferences.json");
        },
      }
    );
  };

  return {
    settings: settings.current,
    setSettings: (settingsState) => {
      settings.current = settingsState;
    },
    getInterfaceSettings,
    getConnectionSettings,
    getInterfaceValue: getInterfaceValue,
  };
};

export { useSettings };
