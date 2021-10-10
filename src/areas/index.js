/*
 index.js - ESP3D WebUI areas file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

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
import { h, Fragment } from "preact";
import { Menu } from "./menu";
import { Informations } from "./informations";
import { ConnectionContainer } from "./connection";
import { MainContainer } from "./main";
import { useUiContext, useUiContextFn } from "../contexts/UiContext";
import { useSettings, useHttpQueue } from "../hooks";
import { useEffect } from "preact/hooks";
import { showLogin, showKeepConnected, showModal } from "../components/Modal";
import { espHttpURL, dispatchToExtensions } from "../components/Helpers";
import { T } from "../components/Translations";
import { HelpCircle, Layout } from "preact-feather";
/*
 * Local const
 *
 */

const ViewContainer = () => {
  const { connection, dialogs } = useUiContext();
  if (dialogs.needLogin == true) {
    dialogs.setNeedLogin(false);
    showLogin();
  }
  if (dialogs.showKeepConnected == true) {
    dialogs.setShowKeepConnected(false);
    showKeepConnected();
  }
  if (
    connection.connectionState.connected &&
    connection.connectionState.authenticate &&
    !connection.connectionState.updating
  )
    return (
      <Fragment>
        <Menu />
        <Informations type="panel" />
        <MainContainer />
      </Fragment>
    );
  else {
    return <ConnectionContainer />;
  }
};

const ContentContainer = () => {
  const { getConnectionSettings, getInterfaceSettings } = useSettings();
  const { createNewRequest } = useHttpQueue();
  const { toasts, modals } = useUiContext();

  const processExtensionMessage = (eventMsg) => {
    if (eventMsg.data.type && eventMsg.data.target == "webui") {
      switch (eventMsg.data.type) {
        case "response":
          //TBD: if need real both way communication
          //between iFrame and Main UI
          break;
        case "cmd":
          createNewRequest(
            espHttpURL("command", { cmd: eventMsg.data.content }).toString(),
            { method: "GET" },
            {
              onSuccess: (result) => {
                if (!eventMsg.data.noDispatch)
                  dispatchToExtensions(
                    "response",
                    { response: result, cmd: eventMsg.data.content },
                    eventMsg.data.id
                  );
              },
              onFail: (error) => {
                toasts.addToast({ content: error, type: "error" });
                console.log(error);
                if (!eventMsg.data.noDispatch)
                  dispatchToExtensions(
                    "error",
                    { error, cmd: eventMsg.data.content },
                    eventMsg.data.id
                  );
              },
            }
          );
          break;
        case "query":
          createNewRequest(
            espHttpURL(eventMsg.data.url, eventMsg.data.args).toString(),
            { method: "GET" },
            {
              onSuccess: (result) => {
                if (!eventMsg.data.noDispatch)
                  dispatchToExtensions(
                    "query",
                    {
                      status: "success",
                      response: result,
                      query: eventMsg.data.url,
                    },
                    eventMsg.data.id
                  );
              },
              onFail: (error) => {
                toasts.addToast({ content: error, type: "error" });
                console.log(error);
                if (!eventMsg.data.noDispatch)
                  dispatchToExtensions(
                    "query",
                    { status: "error", error, query: eventMsg.data.url },
                    eventMsg.data.id
                  );
              },
            }
          );
          break;
        case "upload":
          const formData = new FormData();
          const file = new File(
            [eventMsg.data.content],
            eventMsg.data.filename
          );
          formData.append("path", eventMsg.data.path);
          formData.append(eventMsg.data.filename + "S", eventMsg.data.size);
          formData.append("myfiles", file, eventMsg.data.filename);
          createNewRequest(
            espHttpURL("files").toString(),
            { method: "POST", id: "preferences", body: formData },
            {
              onSuccess: (result) => {
                if (!eventMsg.data.noDispatch)
                  dispatchToExtensions(
                    "upload",
                    {
                      status: "success",
                      response: result,
                      filename: eventMsg.data.filename,
                    },
                    eventMsg.data.id
                  );
              },
              onFail: (error) => {
                toasts.addToast({ content: error, type: "error" });
                if (!eventMsg.data.noDispatch)
                  dispatchToExtensions(
                    "upload",
                    {
                      status: "error",
                      error,
                      filename: eventMsg.data.filename,
                    },
                    eventMsg.data.id
                  );
              },
              onProgress: (e) => {
                if (!eventMsg.data.noDispatch)
                  dispatchToExtensions(
                    "upload",
                    {
                      status: "progress",
                      progress: e,
                      filename: eventMsg.data.filename,
                    },
                    eventMsg.data.id
                  );
              },
            }
          );
          break;

        case "download":
          createNewRequest(
            espHttpURL(eventMsg.data.url, eventMsg.data.args).toString(),
            { method: "GET", id: "download" },
            {
              onSuccess: (result) => {
                if (!eventMsg.data.noDispatch)
                  dispatchToExtensions(
                    "download",
                    {
                      status: "success",
                      blob: result,
                      url: eventMsg.data.url,
                    },
                    eventMsg.data.id
                  );
              },
              onFail: (error) => {
                toasts.addToast({ content: error, type: "error" });
                if (!eventMsg.data.noDispatch)
                  dispatchToExtensions(
                    "download",
                    { status: "error", error, url: eventMsg.data.url },
                    eventMsg.data.id
                  );
              },
              onProgress: (e) => {
                if (!eventMsg.data.noDispatch)
                  dispatchToExtensions(
                    "download",
                    { status: "progress", progress: e, url: eventMsg.data.url },
                    eventMsg.data.id
                  );
              },
            }
          );
          break;
        case "toast":
          toasts.addToast({
            content: eventMsg.data.toast.content,
            type: eventMsg.data.toast.type,
          });
          break;
        case "modal":
          let inputData = "";
          const cb1 = () => {
            setTimeout(() => {
              dispatchToExtensions(
                "modal",
                {
                  response: eventMsg.data.modal.response1,
                  style: eventMsg.data.modal.style,
                  inputData,
                  id: eventMsg.data.modal.id,
                },
                eventMsg.data.id
              );
            }, 500);
          };
          const cb2 = () => {
            setTimeout(() => {
              dispatchToExtensions(
                "modal",
                {
                  response: eventMsg.data.modal.response2,
                  inputData,
                  style: eventMsg.data.modal.style,
                  id: eventMsg.data.modal.id,
                },
                eventMsg.data.id
              );
            }, 500);
          };

          showModal({
            modals,
            title: T(eventMsg.data.modal.title),
            button2: eventMsg.data.modal.bt2Txt
              ? {
                  cb: cb2,
                  text: T(eventMsg.data.modal.bt2Txt),
                }
              : null,
            button1: eventMsg.data.modal.bt1Txt
              ? {
                  cb: cb1,
                  text: T(eventMsg.data.modal.bt1Txt),
                }
              : null,
            icon:
              eventMsg.data.modal.style == "question" ? (
                <HelpCircle />
              ) : (
                <Layout />
              ),
            id: eventMsg.data.modal.id,
            content: (
              <Fragment>
                <div>{T(eventMsg.data.modal.text)}</div>
                {eventMsg.data.modal.style == "input" && (
                  <input
                    class="form-input"
                    onInput={(e) => {
                      inputData = e.target.value.trim();
                    }}
                  />
                )}
              </Fragment>
            ),
            hideclose: eventMsg.data.modal.hideclose,
            overlay: eventMsg.data.modal.overlay,
          });
          break;
        case "beep":
          console.log(eventMsg.data);
          if (eventMsg.data.sound == "beep") useUiContextFn.beep();
          if (eventMsg.data.sound == "error") useUiContextFn.beepError();
          if (eventMsg.data.sound == "seq")
            useUiContextFn.beepSeq(eventMsg.data.seq);
          break;
        case "translate":
          if (!eventMsg.data.noDispatch)
            dispatchToExtensions(
              "translate",
              {
                initial: eventMsg.data.content,
                translated: T(eventMsg.data.content),
              },
              eventMsg.data.id
            );
          break;

        default:
          //core and stream are only supposed to come from ESP3D or main FW
          return;
      }
    }
  };

  useEffect(() => {
    //To init settings
    //to get language first
    getInterfaceSettings(null, getConnectionSettings);
    window.addEventListener("message", processExtensionMessage, false);
  }, []);
  return <ViewContainer />;
};

export { ContentContainer };
