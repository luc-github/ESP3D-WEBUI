/*
 UiContext.js - ESP3D WebUI context file

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
import { useContext, useState, useRef } from "preact/hooks";
import {
  generateUID,
  removeEntriesByIDs,
  disableNode,
} from "../components/Helpers";
import { useSettings } from "../hooks";

/*
 * Local const
 *
 */
const UiContext = createContext("uiContext");
const useUiContext = () => useContext(UiContext);
const UiContextProvider = ({ children }) => {
  const [data, setData] = useState();
  const [uiSettings, setUISettings] = useState();
  const [modals, setModal] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [needLogin, setNeedLogin] = useState(false);
  const [showKeepConnected, setShowKeepConnected] = useState(false);
  const [connectionState, setConnectionState] = useState({
    connected: false,
    authenticate: true,
    page: "connecting",
  });
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const addToast = (newToast) => {
    setToasts([...toastsRef.current, { ...newToast, id: generateUID() }]);
  };

  const removeToast = (uids) => {
    const removedIds = removeEntriesByIDs(toastsRef.current, uids);

    setToasts([...removedIds]);
  };

  const addModal = (newModal) =>
    setModal([
      ...modals,
      { ...newModal, id: newModal.id ? newModal.id : generateUID() },
    ]);
  const getModalIndex = (id) => {
    return modals.findIndex((element) => element.id == id);
  };
  const removeModal = (modalIndex) => {
    const newModalList = modals.filter((modal, index) => index !== modalIndex);
    setModal(newModalList);
    if (newModalList.length == 0)
      disableNode(document.getElementById("main"), false);
    disableNode(document.getElementById("info"), false);
    disableNode(document.getElementById("menu"), false);
  };

  const clearModals = () => {
    setModal([]);
  };

  const getValue = (Id, base = null) => {
    const settingsobject = base ? base : uiSettings;
    if (settingsobject) {
      for (let key in settingsobject) {
        if (Array.isArray(settingsobject[key])) {
          for (let index = 0; index < settingsobject[key].length; index++) {
            if (settingsobject[key][index].id == Id) {
              return settingsobject[key][index].value;
            }
          }
        } else {
          for (let subkey in settingsobject[key]) {
            if (Array.isArray(settingsobject[key][subkey])) {
              for (
                let index = 0;
                index < settingsobject[key][subkey].length;
                index++
              ) {
                if (settingsobject[key][subkey][index].id == Id) {
                  return settingsobject[key][subkey][index].value;
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
    uisettings: { current: uiSettings, set: setUISettings, getValue },
    data: [data, setData],
    modals: {
      modalList: modals,
      addModal,
      removeModal,
      getModalIndex,
      clearModals,
    },
    toasts: { toastList: toasts, addToast, removeToast },
    connection: {
      connectionState,
      setConnectionState,
    },

    dialogs: {
      needLogin,
      setNeedLogin,
      showKeepConnected,
      setShowKeepConnected,
    },
  };

  return <UiContext.Provider value={store}>{children}</UiContext.Provider>;
};

export { UiContextProvider, useUiContext };
