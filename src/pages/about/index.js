/*
 about.js - ESP3D WebUI navigation page file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.
 Original code inspiration : 2021 Alexandre Aussourd
 
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
import { useEffect, useState, useRef } from "preact/hooks";
import { Loading, Button, CenterLeft } from "../../components/Spectre";
import { useHttpQueue } from "../../hooks";
import { espHttpURL } from "../../components/Helpers";
import { T } from "../../components/Translations";
import { useUiContext, useDatasContext, useWsContext } from "../../contexts";
import { Esp3dVersion } from "../../components/App/version";
import { Github, RefreshCcw, UploadCloud } from "preact-feather";
import { webUiUrl, fwUrl } from "../../components/Targets";
import {
  showConfirmationModal,
  showProgressModal,
} from "../../components/Modal";

/*
 * Local const
 *
 */
//TODO: need to cache the information -> only query if empty or manual refresh

const About = () => {
  const { toasts, modals } = useUiContext();
  const { Disconnect } = useWsContext();
  const { createNewRequest, abortRequest } = useHttpQueue();
  const [isLoading, setIsLoading] = useState(true);
  const progressValue = useRef(0);
  const progressValueDisplay = useRef(0);
  const [props, setProps] = useState([]);
  const [isFwUpdate, setIsFwUpdate] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showProgression, setShowProgression] = useState(false);
  const { datas } = useDatasContext();
  const inputFiles = useRef(null);
  const getProps = () => {
    setIsLoading(true);
    createNewRequest(
      espHttpURL("command", { cmd: "[ESP420]" }).toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          const { Status } = JSON.parse(result);
          setProps([...Status]);
          datas.current.about = [...Status];
          setIsLoading(false);
        },
        onFail: (error) => {
          setIsLoading(false);
          toasts.addToast({ content: error, type: "error" });
        },
      }
    );
  };
  //from https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
  function getBrowserInformation() {
    var ua = navigator.userAgent,
      tem,
      M =
        ua.match(
          /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
        ) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return "IE " + (tem[1] || "");
    }
    if (M[1] === "Chrome") {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null) return tem.slice(1).join(" ").replace("OPR", "Opera");
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(" ");
  }

  const onFWUpdate = (e) => {
    e.target.blur();
    setIsFwUpdate(true);
    inputFiles.current.value = "";
    inputFiles.current.setAttribute("accept", ".bin, .bin.gz");
    inputFiles.current.setAttribute("multiple", "false");
    inputFiles.current.click();
  };
  const onFWGit = (e) => {
    window.open(fwUrl, "_blank");
    e.target.blur();
  };
  const onWebUiUpdate = (e) => {
    setIsFwUpdate(false);
    inputFiles.current.value = "";
    inputFiles.current.setAttribute("accept", "*");
    inputFiles.current.setAttribute("multiple", "true");
    inputFiles.current.click();
    e.target.blur();
  };
  const onWebUiGit = (e) => {
    window.open(webUiUrl, "_blank");
    e.target.blur();
  };

  const uploadFiles = () => {
    const list = inputFiles.current.files;
    const formData = new FormData();
    formData.append("path", "/");
    if (list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const arg = "/" + file.name + "S";
        //append file size first to check updload is complete
        formData.append(arg, file.size);
        formData.append("myfiles", file, "/" + file.name);
      }
    }

    createNewRequest(
      isFwUpdate ? espHttpURL("updatefw") : espHttpURL("files"),
      { method: "POST", id: "upload", body: formData },
      {
        onSuccess: (result) => {
          modals.removeModal(modals.getModalIndex("upload"));
          Disconnect(isFwUpdate ? "restart" : "connecting");
          if (isFwUpdate) {
            setTimeout(() => {
              window.location.reload();
            }, 40000);
          } else window.location.reload();
        },
        onFail: (error) => {
          modals.removeModal(modals.getModalIndex("upload"));
          toasts.addToast({ content: error, type: "error" });
        },
        onProgress: (e) => {
          progressValue.current.value = e;
          progressValueDisplay.current.innerHTML = e + "%";
        },
      }
    );

    setShowProgression(true);
  };

  const filesSelected = () => {
    if (inputFiles.current.files.length > 0) {
      setShowConfirmation(true);
    }
  };

  const Progression = () => {
    return (
      <CenterLeft>
        <progress ref={progressValue} value="0" max="100" />
        <label style="margin-left:15px" ref={progressValueDisplay}></label>
      </CenterLeft>
    );
  };

  if (showProgression) {
    const title = T("S32");
    const cancel = T("S28");
    showProgressModal({
      modals,
      title,
      button1: { cb: abortRequest, text: cancel },
      content: <Progression />,
    });
    setShowProgression(false);
  }

  if (showConfirmation) {
    const title = isFwUpdate ? T("S30") : T("S31");
    const yes = T("S27");
    const cancel = T("S28");
    const list = [...inputFiles.current.files];
    const content = (
      <CenterLeft>
        <ul>
          {list.reduce((accumulator, currentElement) => {
            return [...accumulator, <li>{currentElement.name}</li>];
          }, [])}
        </ul>
      </CenterLeft>
    );
    showConfirmationModal({
      modals,
      title,
      content,
      button1: { cb: uploadFiles, text: yes },
      button2: { text: cancel },
    });
    setShowConfirmation(false);
  }

  useEffect(() => {
    if (datas.current.about.length != 0) {
      setProps([...datas.current.about]);
      setIsLoading(false);
    } else {
      getProps();
    }
  }, []);

  return (
    <div id="about" class="container">
      <h2>{T("S12")}</h2>
      {isLoading && <Loading />}

      {!isLoading && props && (
        <div>
          <input
            ref={inputFiles}
            type="file"
            class="d-none"
            onChange={filesSelected}
          />
          <hr />
          <CenterLeft>
            <ul>
              <li>
                <span class="text-primary">{T("S150")}: </span>
                <span class="text-dark">
                  <Esp3dVersion />
                </span>
                <Button
                  class="mx-2 tooltip"
                  sm
                  data-tooltip={T("S20")}
                  onClick={onWebUiGit}
                >
                  <Github />
                </Button>
                <Button
                  class="mx-2 tooltip feather-icon-container"
                  sm
                  data-tooltip={T("S171")}
                  onClick={onWebUiUpdate}
                >
                  <UploadCloud />
                  <label class="hide-low">{T("S25")}</label>
                </Button>
              </li>
              <li>
                <span class="text-primary">{T("FW ver")}: </span>
                <span class="text-dark">
                  {props.find((element) => element.id == "FW ver").value}
                </span>
                <Button
                  class="mx-2 tooltip"
                  sm
                  data-tooltip={T("S20")}
                  onClick={onFWGit}
                >
                  <Github />
                </Button>
                <Button
                  class="mx-2 tooltip feather-icon-container"
                  sm
                  onClick={onFWUpdate}
                  data-tooltip={T("S172")}
                >
                  <UploadCloud />
                  <label class="hide-low">{T("S25")}</label>
                </Button>
              </li>
              <li>
                <span class="text-primary">{T("S18")}: </span>
                <span class="text-dark">{getBrowserInformation()}</span>
              </li>
              {props.map(({ id, value }) => {
                if (id != "FW ver")
                  return (
                    <li>
                      <span class="text-primary">{T(id)}: </span>
                      <span class="text-dark">{T(value)}</span>
                    </li>
                  );
              })}
            </ul>
          </CenterLeft>
          <hr />
          <center>
            <Button
              class="feather-icon-container"
              onClick={() => {
                getProps();
              }}
            >
              <RefreshCcw />
              <label class="hide-low">{T("S50")}</label>
            </Button>
          </center>
        </div>
      )}
      <br />
    </div>
  );
};

export default About;
