import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { useSettingsContext } from "../contexts/";
import { espHttpURL } from "../components/Helpers";
import { useHttpQueue } from "../hooks/";
import { useUiContext } from "../contexts";

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
    console.log("get first esp3d data");
    createNewRequest(
      //TODO: add time parameter to setup time from PC
      espHttpURL("command", { cmd: "[ESP800]" }).toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          const jsonResult = JSON.parse(result);
          setSettings({ ...settingsState.current, connection: jsonResult });
        },
        onFail: (error) => {
          toasts.addToast({ content: error, type: "error" });
          //TODO display a modal with a retry button
        },
      }
    );
  };
  const getInterfaceSettings = () => {
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
          //use defaults and continue
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

  useEffect(() => {
    console.log("Use setting");
    getConnectionSettings();
    getInterfaceSettings();
    //TODO: do not do it here but only when go to setting pages
    getFeaturesSettings();
  }, []);

  return [
    settings.current,
    (settingsState) => {
      settings.current = settingsState;
    },
  ];
};

export { useSettings };
