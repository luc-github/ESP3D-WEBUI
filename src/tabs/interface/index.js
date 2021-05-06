/*
 index.js - ESP3D WebUI navigation tab file

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
import { useEffect, useState, useRef } from "preact/hooks";
import {
  useUiContext,
  useSettingsContext,
  useDatasContext,
} from "../../contexts";

import { Loading, ButtonImg } from "../../components/Spectre";
import { useHttpQueue, useSettings } from "../../hooks";
import { espHttpURL } from "../../components/Helpers";
import { T } from "../../components/Translations";
import { RefreshCcw, Save, ExternalLink, Flag, Download } from "preact-feather";
import {
  showConfirmationModal,
  showProgressModal,
} from "../../components/Modal";
import { Field } from "../../components/Controls";
import { exportPreferences } from "./exportHelper";
import { importPreferences } from "./importHelper";

const InterfaceTab = () => {
  const { toasts, modals } = useUiContext();
  const { datas } = useDatasContext();
  const { createNewRequest, abortRequest } = useHttpQueue();
  const { getInterfaceSettings } = useSettings();
  const { settings } = useSettingsContext();
  const [isLoading, setIsLoading] = useState(true);
  const [webUi, setWebUi] = useState();
  const [showSave, setShowSave] = useState(true);
  const progressValue = useRef(0);
  const progressValueDisplay = useRef(0);
  const inputFile = useRef(null);
  const errorValidationMsg = T("S42");

  const [mobileView, setMobileView] = useState(false);
  const toggle = (e) => {
    if (mobileView) {
      console.log("Now desktop view");
      e.target.innerHTML = " On";
      document.getElementById("app").classList.remove("mobile-view");
    } else {
      console.log("Now mobile view");
      e.target.innerHTML = " Off";
      document.getElementById("app").classList.add("mobile-view");
    }
    setMobileView(!mobileView);
  };

  const generateValidation = (fieldData) => {
    const validation = {
      message: <Flag size="1rem" />,
      valid: true,
      modified: true,
    };
    if (fieldData.type == "text") {
      if (typeof fieldData.min != undefined) {
        if (fieldData.value.trim().length < fieldData.min) {
          validation.valid = false;
        } else if (typeof fieldData.minSecondary != undefined) {
          if (
            fieldData.value.trim().length < fieldData.minSecondary &&
            fieldData.value.trim().length > fieldData.min
          ) {
            validation.valid = false;
          }
        }
      }

      if (fieldData.max) {
        if (fieldData.value.trim().length > fieldData.max) {
          validation.valid = false;
        }
      }
    } else if (fieldData.type == "number") {
      if (fieldData.max) {
        if (fieldData.value > parseInt(fieldData.max)) {
          console.log("max");
          validation.valid = false;
        }
      }
      if (fieldData.min) {
        if (fieldData.value < parseInt(fieldData.min)) {
          validation.valid = false;
        }
      }
    } else if (fieldData.type == "select") {
      const index = fieldData.options.findIndex(
        (element) => element.value == parseInt(fieldData.value)
      );
      if (index == -1) {
        validation.valid = false;
      }
    }
    if (!validation.valid) {
      validation.message = errorValidationMsg;
    }
    fieldData.haserror = !validation.valid;
    if (fieldData.value == fieldData.initial) {
      fieldData.hasmodified = false;
    } else {
      fieldData.hasmodified = true;
    }
    setShowSave(checkSaveStatus());
    if (!fieldData.hasmodified && !fieldData.haserror) return null;
    return validation;
  };

  function checkSaveStatus() {
    let stringified = JSON.stringify(settings.current.interface.settings);
    let hasmodified =
      stringified.indexOf('"hasmodified":true') == -1 ? false : true;
    let haserrors = stringified.indexOf('"haserror":true') == -1 ? false : true;
    if (haserrors || !hasmodified) return false;
    return true;
  }

  const getInterface = () => {
    setIsLoading(true);
    getInterfaceSettings(setIsLoading);
  };

  const fileSelected = () => {
    let haserrors = false;
    if (inputFile.current.files.length > 0) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = function (e) {
        const importFile = e.target.result;
        try {
          const importData = JSON.parse(importFile);
          [settings.current.interface, haserrors] = importPreferences(
            settings.current.interface,
            importData
          );
          if (haserrors) {
            toasts.addToast({ content: "S56", type: "error" });
          }
        } catch (e) {
          console.log(e);
          toasts.addToast({ content: "S56", type: "error" });
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(inputFile.current.files[0]);
    }
  };

  const SaveSettings = () => {
    //TODO
    console.log("Save Preferences");
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);
  return (
    <div id="interface">
      <input
        ref={inputFile}
        type="file"
        class="d-none"
        accept=".json"
        onChange={fileSelected}
      />
      <h2>{T("S17")}</h2>
      {isLoading && <Loading large />}

      {!isLoading && settings.current.interface.settings && (
        <Fragment>
          {settings.current.interface && (
            <div class="flex-wrap">
              {Object.keys(settings.current.interface.settings).map(
                (sectionId) => {
                  const section =
                    settings.current.interface.settings[sectionId];
                  return (
                    <Fragment>
                      <div className="column col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-3 mb-2">
                        <div class="panel mb-2 panel-features">
                          <span class="navbar-section label label-secondary text-ellipsis">
                            <strong class="text-ellipsis">
                              {T(sectionId)}
                            </strong>
                          </span>
                          <div class="panel-body panel-body-features">
                            {Object.keys(section).map((subsectionId) => {
                              const fieldData = section[subsectionId];
                              const {
                                label,
                                initial,
                                type,
                                ...rest
                              } = fieldData;
                              const [validation, setvalidation] = useState();
                              return (
                                <Field
                                  label={T(label)}
                                  type={type}
                                  inline={type == "boolean" ? true : false}
                                  {...rest}
                                  setValue={(val, update) => {
                                    if (!update) fieldData.value = val;
                                    setvalidation(
                                      generateValidation(fieldData)
                                    );
                                  }}
                                  validation={validation}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </Fragment>
                  );
                }
              )}
            </div>
          )}
          <center>
            <br />
            <ButtonImg
              m2
              label={T("S50")}
              tooltip
              data-tooltip={T("S23")}
              icon={<RefreshCcw />}
              onClick={getInterface}
            />
            <ButtonImg
              m2
              label={T("S54")}
              tooltip
              data-tooltip={T("S55")}
              icon={<Download />}
              onClick={(e) => {
                e.target.blur();
                inputFile.current.value = "";
                inputFile.current.click();
              }}
            />
            <ButtonImg
              m2
              label={T("S52")}
              tooltip
              data-tooltip={T("S53")}
              icon={<ExternalLink />}
              onClick={(e) => {
                e.target.blur();
                exportPreferences(settings.current.interface);
              }}
            />
            {showSave && (
              <ButtonImg
                m2
                tooltip
                data-tooltip={T("S62")}
                label={T("S61")}
                icon={<Save />}
                onClick={(e) => {
                  e.target.blur();
                  SaveSettings();
                }}
              />
            )}
          </center>
        </Fragment>
      )}
    </div>
  );
};

export { InterfaceTab };
