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
import {
  useUiContext,
  useRouterContext,
  useTranslationsContext,
} from "../contexts";
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
  const { toasts, connection, uisettings } = useUiContext();
  const { interfaceSettings, connectionSettings, activity } =
    useSettingsContext();
  const { defaultRoute, setActiveRoute } = useRouterContext();
  const { currentLanguage, baseLangRessource, setCurrentLanguage } =
    useTranslationsContext();
  const getConnectionSettings = (next) => {
    createNewRequest(
      espHttpURL("command", {
        cmd: "[ESP800]",
        time: getBrowserTime(),
      }).toString(),
      { method: "GET", id: "connection" },
      {
        onSuccess: (result) => {
          const jsonResult = JSON.parse(result);
          connectionSettings.current = jsonResult;
          document.title = jsonResult.Hostname;
          //SetupWs
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
          if (!error.startsWith("401")) {
            toasts.addToast({ content: error, type: "error" });
            console.log("Error");
          }
        },
      }
    );
  };

  const getInterfaceSettings = (setLoading, next) => {
    interfaceSettings.current = { ...defaultPreferences };
    function loadTheme() {
      const themepack = uisettings.getValue("theme");
      const elem = document.getElementById("themestyle");
      if (elem) elem.parentNode.removeChild(elem);
      if (themepack != "default") {
        createNewRequest(
          espHttpURL(themepack).toString(),
          { method: "GET" },
          {
            onSuccess: (result) => {
              var styleItem = document.createElement("style");
              styleItem.type = "text/css";
              styleItem.id = "themestyle";
              styleItem.innerHTML = result;
              document.head.appendChild(styleItem);
              if (next) next();
              if (setLoading) {
                setLoading(false);
              }
            },
            onFail: (error) => {
              if (next) next();
              if (setLoading) {
                setLoading(false);
              }
              console.log("error");
              toasts.addToast({
                content: error + " " + themepack,
                type: "error",
              });
            },
          }
        );
      } else {
        const elem = document.getElementById("themestyle");
        if (elem) elem.parentNode.removeChild(elem);
        if (next) next();
        if (setLoading) {
          setLoading(false);
        }
      }
    }
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
          uisettings.set(JSON.parse(JSON.stringify(preferences.settings)));
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
            console.log("error");
          }
          interfaceSettings.current = preferences;
          //to force refresh of full UI
          /*connection.setConnectionState({
            connected: connection.connectionState.connected,
            authenticate: connection.connectionState.authenticate,
            page: connection.connectionState.page,
            updating: true,
          });*/
          //polling commands
          activity.startPolling(() => {
            const cmdsString = uisettings
              .getValue("pollingcommands", preferences.settings)
              .trim();
            if (cmdsString.length > 0) {
              let cmdsList = cmdsString.split(";");
              for (let cmd of cmdsList) {
                cmd = cmd.trim();
                if (cmd.length > 0) {
                  createNewRequest(
                    espHttpURL("command", { cmd }).toString(),
                    { method: "GET" },
                    {
                      onSuccess: (result) => {
                        //TODO:TBD
                      },
                      onFail: (error) => {
                        toasts.addToast({ content: error, type: "error" });
                        console.log("error");
                      },
                    }
                  );
                }
              }
            }
          });

          //Mobile view
          if (uisettings.getValue("mobileview", preferences.settings))
            document.getElementById("app").classList.add("mobile-view");
          else document.getElementById("app").classList.remove("mobile-view");
          //language
          const languagepack = uisettings.getValue(
            "language",
            preferences.settings
          );
          //set default first
          setCurrentLanguage(baseLangRessource);
          if (!(languagepack == "default" || languagepack == undefined)) {
            if (setLoading) {
              setLoading(false);
            }
            createNewRequest(
              espHttpURL(languagepack).toString(),
              { method: "GET" },
              {
                onSuccess: (result) => {
                  const langjson = JSON.parse(result);
                  setCurrentLanguage(langjson);
                  loadTheme();
                },
                onFail: (error) => {
                  loadTheme();
                  console.log("Error");
                  toasts.addToast({
                    content: error + " " + languagepack,
                    type: "error",
                  });
                },
              }
            );
          } else {
            loadTheme();
          }
        },
        onFail: (error) => {
          formatPreferences(defaultPreferences.settings);
          uisettings.set(
            JSON.parse(JSON.stringify(defaultPreferences.settings))
          );
          if (setLoading) {
            setLoading(false);
          }
          toasts.addToast({
            content: error + " preferences.json",
            type: "error",
          });
          console.log("No valid preferences.json");
          loadTheme();
        },
      }
    );
  };
  return {
    getInterfaceSettings,
    getConnectionSettings,
  };
};

export { useSettings };
