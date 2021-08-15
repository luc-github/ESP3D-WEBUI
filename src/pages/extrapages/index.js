/*
 extrapage.js - ESP3D WebUI navigation page file

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
import { Fragment, h } from "preact";
import { useRef, useEffect, useState } from "preact/hooks";
import { espHttpURL } from "../../components/Helpers";
import { useUiContext } from "../../contexts";
import { useHttpQueue } from "../../hooks";
import { Play, Pause, Aperture } from "preact-feather";
import { ButtonImg } from "../../components/Spectre";
import { T } from "../../components/Translations";

const ExtraPage = ({ id, source, refreshtime, label, type }) => {
  const { createNewRequest } = useHttpQueue();
  const { uisettings } = useUiContext();
  const [refreshPaused, setRefreshPaused] = useState(
    uisettings.refreshPaused.id
  );
  const element = useRef(null);
  const imageCache = useRef(null);
  const pageSource = type == "camera" ? "/snap" : source;
  const loadContent = (init = false) => {
    if (!init && uisettings.refreshPaused.id) {
      return;
    }
    if (pageSource.startsWith("http") || type == "extension") {
      switch (type) {
        case "image":
          if (element.current) element.current.src = pageSource;
          break;
        case "extension":
          if (element.current) {
            element.current.src = pageSource;
            element.current.onload = () => {
              const doc = element.current.contentWindow.document;
              const css = document.querySelectorAll("style");
              //inject css
              css.forEach((element) => {
                doc.head.appendChild(element.cloneNode(true));
              });
              //to avoid the flickering when apply css
              element.current.classList.remove("d-none");
              element.current.classList.add("d-block");
            };
          }
        default:
          if (element.current) element.current.src = pageSource;
      }
    } else {
      const idquery =
        type == "content" || type == "extension" ? type + id : "download" + id;
      createNewRequest(
        espHttpURL(pageSource).toString(),
        { method: "GET", id: idquery, max: 2 },
        {
          onSuccess: (result) => {
            switch (type) {
              case "camera":
              case "image":
                if (element.current) {
                  imageCache.current = result;
                  element.current.src = URL.createObjectURL(result);
                }

                break;
                //cannot be used because this way disable javascript in iframe
                /* case "extension":
                if (element.current && element.current.contentWindow) {
                  const doc = element.current.contentWindow.document;
                  const css = document.querySelector("style");
                  doc.body.innerHTML = result;
                  //inject css
                  doc.head.appendChild(css.cloneNode(true));
                }*/

                //todo inject css
                break;
              default:
                if (element.current && element.current.contentWindow)
                  element.current.contentWindow.document.body.innerHTML =
                    result;
            }
          },
          onFail: (error) => {
            //TODO:Need to do something ? TBD
            console.log("Error", error);
          },
        }
      );
    }
  };
  const ControlButtons = () => {
    return (
      <Fragment>
        {parseInt(refreshtime) > 0 && type != "extension" && (
          <div class="m-2 image-button-bar">
            <ButtonImg
              m1
              tooltip
              data-tooltip={refreshPaused ? T("S185") : T("S184")}
              icon={refreshPaused ? <Play /> : <Pause />}
              onclick={() => {
                setRefreshPaused(!refreshPaused);
                uisettings.refreshPaused.id = !refreshPaused;
              }}
            />
            {type != "content" && (
              <ButtonImg
                m1
                tooltip
                data-tooltip={T("S186")}
                icon={<Aperture />}
                onclick={() => {
                  const typeImage =
                    type == "camera" ? "image/jpeg" : imageCache.current.type;
                  const filename = "snap." + typeImage.split("/")[1];
                  const file = new Blob([imageCache.current], {
                    type: typeImage,
                  });
                  if (window.navigator.msSaveOrOpenBlob)
                    // IE10+
                    window.navigator.msSaveOrOpenBlob(file, filename);
                  else {
                    // Others
                    const a = document.createElement("a");
                    const url = URL.createObjectURL(file);
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function () {
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }, 0);
                  }
                }}
              />
            )}
          </div>
        )}
      </Fragment>
    );
  };
  useEffect(() => {
    //load using internal http manager
    if (!pageSource.startsWith("http")) loadContent(true);
    //init timer if any
    let timerid = 0;
    if (refreshtime != 0 && type != "extension") {
      timerid = setInterval(loadContent, refreshtime);
    }

    return () => {
      //cleanup
      if (refreshtime != 0 && type != "extension") {
        clearInterval(timerid);
      }
    };
  }, [id]);
  switch (type) {
    case "camera":
      return (
        <div class="camera-container">
          <img
            ref={element}
            id={"page_content_" + id}
            src={pageSource.startsWith("http") ? pageSource : ""}
            alt={label}
          />
          <ControlButtons />
        </div>
      );
    case "image":
      return (
        <div class="image-container">
          <img
            ref={element}
            id={"page_content_" + id}
            src={pageSource.startsWith("http") ? pageSource : ""}
            alt={label}
          />
          <ControlButtons />
        </div>
      );
    default:
      return (
        <Fragment>
          <iframe
            class={
              type == "extension"
                ? "extensionContainer d-none"
                : "content-container d-block"
            }
            ref={element}
            id={"page_content_" + id}
            src={
              pageSource.startsWith("http") || type == "extension"
                ? pageSource
                : ""
            }
            alt={label}
          ></iframe>
          <ControlButtons />
        </Fragment>
      );
  }
};

export default ExtraPage;
