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
import { h } from "preact";
import { useRef, useEffect } from "preact/hooks";
import { espHttpURL } from "../../components/Helpers";
import { useHttpQueue } from "../../hooks";

const ExtraPage = ({ id, source, refreshtime, label, type }) => {
  const { createNewRequest } = useHttpQueue();
  const element = useRef(null);
  const loadContent = () => {
    if (source.startsWith("http")) {
      switch (type) {
        case "image":
          if (element.current) element.current.src = source;
          break;
        default:
          if (element.current) element.current.src = source;
      }
    } else {
      const idquery = type == "content" ? type : "download";
      createNewRequest(
        espHttpURL(source).toString(),
        { method: "GET", id: idquery },
        {
          onSuccess: (result) => {
            switch (type) {
              case "image":
                if (element.current)
                  element.current.src = URL.createObjectURL(result);
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
  useEffect(() => {
    //load using internal http manager
    if (!source.startsWith("http")) loadContent();
    //init timer if any
    let timerid = 0;
    if (refreshtime != 0) {
      timerid = setInterval(loadContent, refreshtime);
    }

    return () => {
      //cleanup
      if (refreshtime != 0) {
        clearInterval(timerid);
      }
    };
  }, [id]);
  switch (type) {
    case "camera":
      return (
        <div class="container">
          <img
            ref={element}
            id={"page_content_" + id}
            style="border:none;width:100%"
            src={source.startsWith("http") ? source : ""}
            alt={label}
          />
        </div>
      );
    case "image":
      return (
        <div class="container">
          <img
            ref={element}
            id={"page_content_" + id}
            style="border:none;width:100%"
            src={source.startsWith("http") ? source : ""}
            alt={label}
          />
        </div>
      );
    default:
      return (
        <iframe
          ref={element}
          id={"page_content_" + id}
          style="border:none; display: block;"
          height="100%"
          width="100%"
          src={source.startsWith("http") ? source : ""}
          alt={label}
        ></iframe>
      );
  }
};

export default ExtraPage;
