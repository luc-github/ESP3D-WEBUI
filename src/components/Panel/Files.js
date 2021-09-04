/*
Files.js - ESP3D WebUI component file

 Copyright (c) 2021 Luc LEBOSSE. All rights reserved.

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
import { useEffect, useState } from "preact/hooks";
import { T } from "../Translations";
import { useHttpFn } from "../../hooks";
import { espHttpURL } from "../Helpers";
import { Loading, ButtonImg } from "../Controls";
import {
  ChevronDown,
  HardDrive,
  Upload,
  RefreshCcw,
  FolderPlus,
} from "preact-feather";
import { useUiContext } from "../../contexts";
import { files } from "../../targets";
import { Folder, File, Trash2, Play } from "preact-feather";

let currentFS = "";
const currentPath = {};
const filesListCache = {};

/*
 * Local const
 *
 */
const FilesPanel = () => {
  const { panels, uisettings } = useUiContext();
  const id = "filesPanel";
  const [filePath, setFilePath] = useState(currentPath[currentFS]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileSystem, setFileSystem] = useState(currentFS);
  const [filesList, setFilesList] = useState(filesListCache[currentFS]);
  const { createNewRequest } = useHttpFn;
  const onSelectFS = (e) => {
    currentFS = e.target.value;
    setFileSystem(currentFS);
    if (!currentPath[currentFS]) {
      currentPath[currentFS] = "/";
      setFilePath(currentPath[currentFS]);
    }
    onRefresh(e);
    console.log(e.target.value, "Path:", currentPath[currentFS]);
  };

  const onRefresh = (e) => {
    setIsLoading(true);
    const cmd = files.command(currentFS, "list", currentPath[currentFS]);
    createNewRequest(
      espHttpURL(cmd.url, cmd.args).toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          filesListCache[currentFS] = files.command(
            currentFS,
            "formatResult",
            result
          );
          setFilesList(filesListCache[currentFS]);
          setIsLoading(false);
          //TODO:Need to do something ? TBD
        },
        onFail: (error) => {
          console.log(error);
          setIsLoading(false);
          //TODO:Need to do something ? TBD
        },
      }
    );
    console.log("List:", cmd);
  };

  useEffect(() => {
    //show current FS
  }, []);

  console.log(id);
  return (
    <div className="column col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-3 mb-2">
      <div class="panel mb-2 panel-dashboard">
        <div class="navbar">
          <span class="navbar-section  feather-icon-container">
            <HardDrive />
            <strong class="text-ellipsis">{T("S65")}</strong>
          </span>

          <span class="navbar-section">
            <span style="height: 100%;">
              {fileSystem != "" && !isLoading && (
                <div class="dropdown dropdown-right">
                  <span
                    class="dropdown-toggle btn btn-xs btn-header m-1"
                    tabindex="0"
                  >
                    <ChevronDown size="0.8rem" />
                  </span>

                  <ul class="menu">
                    {files.capability(fileSystem, "CreateDir") && (
                      <li class="menu-item">
                        <div
                          class="menu-entry"
                          onclick={(e) => {
                            console.log("Create directory");
                          }}
                        >
                          <div class="menu-panel-item">
                            <span class="text-menu-item">{T("S90")}</span>
                            <span class="feather-icon-container">
                              <FolderPlus size="0.8rem" />
                            </span>
                          </div>
                        </div>
                      </li>
                    )}
                    {files.capability(fileSystem, "Upload") && (
                      <li class="menu-item">
                        <div
                          class="menu-entry"
                          onclick={(e) => {
                            console.log("Upload clicked");
                          }}
                        >
                          <div class="menu-panel-item">
                            <span class="text-menu-item">{T("S89")}</span>
                            <span class="feather-icon-container">
                              <Upload size="0.8rem" />
                            </span>
                          </div>
                        </div>
                      </li>
                    )}
                    {(files.capability(fileSystem, "Upload") ||
                      files.capability(fileSystem, "CreateDir")) && (
                      <li class="divider" />
                    )}
                    <li class="menu-item">
                      <div class="menu-entry" onclick={onRefresh}>
                        <div class="menu-panel-item">
                          <span class="text-menu-item">{T("S50")}</span>
                          <span class="feather-icon-container">
                            <RefreshCcw size="0.8rem" />
                          </span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              )}
              <span
                class="btn btn-clear btn-close m-1"
                aria-label="Close"
                onclick={(e) => {
                  panels.hide(id);
                }}
              />
            </span>
          </span>
        </div>
        <div class="input-group m-2">
          <span>
            <select class="form-select" onchange={onSelectFS} value={currentFS}>
              {files.supported.map((element) => {
                if (uisettings.getValue(element.depend))
                  return (
                    <option value={element.value}>{T(element.name)}</option>
                  );
              })}
            </select>
          </span>
          <span class="form-control m-1">{filePath ? filePath : ""}</span>
        </div>
        <div class="panel-body panel-body-dashboard files-list m-2">
          {isLoading && fileSystem != "" && <Loading />}

          {!isLoading &&
            fileSystem != "" &&
            filesList &&
            filesList.files.map((line) => {
              return (
                <div
                  style=" display: -ms-flexbox;
  display: flex; justify-content:space-between; align-items:center;flex-wrap:wrap"
                >
                  <div
                    class="feather-icon-container"
                    style="display: flex; flex-wrap:nowrap"
                  >
                    {line.size == -1 ? <Folder /> : <File />}
                    <label>{line.name}</label>
                  </div>
                  <div style="display: flex; flex-wrap:nowrap; align-items:center">
                    {line.size != -1 && (
                      <Fragment>
                        <span>{line.size}</span>

                        <ButtonImg
                          m1
                          ltooltip
                          data-tooltip={T("S74")}
                          icon={<Play />}
                          onClick={(e) => {
                            e.target.blur();
                          }}
                        />
                      </Fragment>
                    )}
                    <ButtonImg
                      m1
                      ltooltip
                      data-tooltip={line.size == -1 ? T("S101") : T("S100")}
                      icon={<Trash2 />}
                      onClick={(e) => {
                        e.target.blur();
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
        <div class="panel-footer files-list-footer">
          {!isLoading && filesList && filesList.occupation && (
            <div>{filesList.occupation}</div>
          )}
          {!isLoading && filesList && filesList.status && (
            <div>{filesList.status}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const FilesPanelElement = {
  id: "filesPanel",
  content: <FilesPanel />,
  name: "S65",
  icon: "HardDrive",
  show: "showfilespanel",
  onstart: "openfilesonstart",
};

export { FilesPanel, FilesPanelElement };
