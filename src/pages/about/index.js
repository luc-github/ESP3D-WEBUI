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
import { useEffect, useState } from "preact/hooks";
import { Loading, Button } from "../../components/Spectre";
import { useHttpQueue } from "../../hooks";
import { espHttpURL } from "../../components/Helpers";
import { T } from "../../components/Translations";
import { useUiContext, useDatasContext } from "../../contexts";
import { Esp3dVersion } from "../../components/App/version";
import { Github, RefreshCcw, UploadCloud } from "preact-feather";
import { webUiUrl, fwUrl } from "../../components/Targets";

/*
 * Local const
 *
 */
//TODO: need to cache the information -> only query if empty or manual refresh

const About = () => {
  const { toasts } = useUiContext();
  const { createNewRequest } = useHttpQueue();
  const [isLoading, setIsLoading] = useState(true);
  const [props, setProps] = useState([]);
  const { data } = useDatasContext();

  const getProps = () => {
    setIsLoading(true);
    createNewRequest(
      espHttpURL("command", { cmd: "[ESP420]" }).toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          const { Status } = JSON.parse(result);
          setProps([...Status]);
          data.current.about = [...Status];
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

    console.log("Update");
  };

  const onFWGit = (e) => {
    window.open(fwUrl, "_blank");
    e.target.blur();
  };
  const onWebUiUpdate = (e) => {
    e.target.blur();
    console.log("Update");
  };

  const onWebUiGit = (e) => {
    window.open(webUiUrl, "_blank");
    e.target.blur();
  };
  useEffect(() => {
    if (data.current.about.length != 0) {
      setProps([...data.current.about]);
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
          <hr />
          <center>
            <div style="display: inline-block;text-align: left;">
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
                    {" "}
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
            </div>
            <hr />
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
