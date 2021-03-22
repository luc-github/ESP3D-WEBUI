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
import { Loading } from "../../components/Spectre";
import { useHttpQueue } from "../../hooks";
import { espHttpURL } from "../../components/Helpers";
import { T } from "../../components/Translations";

/*
 * Local const
 *
 */
const About = () => {
  const { createNewRequest } = useHttpQueue();
  const [isLoading, setIsLoading] = useState(true);
  const [props, setProps] = useState([]);
  const getProps = () => {
    setIsLoading(true);
    createNewRequest(
      espHttpURL("command", { cmd: "[ESP420]" }).toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          const { Status } = JSON.parse(result);
          console.log(Status);
          setProps([...Status]);
          setIsLoading(false);
        },
        onFail: (error) => {
          setIsLoading(false);
          //toasts.addToast({ content: error, type: 'error' })
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
  useEffect(() => {
    getProps();
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
                  <span class="text-primary">{T("S18")} </span> :{" "}
                  <span class="text-dark">{getBrowserInformation()}</span>
                </li>
                {props.map(({ id, value }) => (
                  <li>
                    <span class="text-primary">{T(id)} </span> :{" "}
                    <span class="text-dark">{value}</span>
                  </li>
                ))}
              </ul>{" "}
            </div>
            <hr />
            <button
              className="btn"
              onClick={() => {
                getProps();
              }}
            >
              {T("S50")}
            </button>
          </center>
        </div>
      )}
    </div>
  );
};

export default About;
