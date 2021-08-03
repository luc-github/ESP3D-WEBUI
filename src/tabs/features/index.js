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
import { Loading, ButtonImg } from "../../components/Spectre";
import { useHttpQueue } from "../../hooks";
import { espHttpURL } from "../../components/Helpers";
import { T } from "../../components/Translations";
import { useUiContext, useSettingsContext, useWsContext } from "../../contexts";
import {
  RefreshCcw,
  RotateCcw,
  Save,
  ExternalLink,
  Flag,
  Download,
} from "preact-feather";
import {
  showConfirmationModal,
  showProgressModal,
} from "../../components/Modal";
import { Field } from "../../components/Controls";
import { formatStructure } from "./formatHelper";
import { exportFeatures } from "./exportHelper";
import { importFeatures } from "./importHelper";

const FeaturesTab = () => {
  const { toasts, modals, uisettings } = useUiContext();
  const { Disconnect } = useWsContext();
  const { createNewRequest, abortRequest } = useHttpQueue();
  const { featuresSettings } = useSettingsContext();
  const [isLoading, setIsLoading] = useState(true);
  const [showSave, setShowSave] = useState(true);
  const progressValue = useRef(0);
  const progressValueDisplay = useRef(0);
  const [features, setFeatures] = useState(featuresSettings.current);
  const inputFile = useRef(null);
  const errorMsg = T("S21");
  const errorValidationMsg = T("S42");
  const title = T("S58");
  const yes = T("S27");
  const cancel = T("S28");
  const content = T("S59");
  const titleupdate = T("S91");
  const contentrestart = T("S174");
  const usercancel = T("S175");

  const Progression = () => {
    return (
      <center>
        <progress ref={progressValue} value="0" max="100" />
        <label style="margin-left:15px" ref={progressValueDisplay}></label>
      </center>
    );
  };

  const getFeatures = () => {
    setIsLoading(true);
    createNewRequest(
      espHttpURL("command", { cmd: "[ESP400]" }).toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          try {
            const Status = JSON.parse(result);
            const feat = formatStructure(Status.Settings);
            featuresSettings.current = { ...feat };
            setFeatures(featuresSettings.current);
          } catch (e) {
            console.log(e, errorMsg);
            toasts.addToast({ content: errorMsg, type: "error" });
          } finally {
            setIsLoading(false);
          }
        },
        onFail: (error) => {
          setIsLoading(false);
          console.log(error);
          toasts.addToast({ content: error, type: "error" });
        },
      }
    );
  };

  function abortSave() {
    abortRequest("ESP401");
    toasts.addToast({ content: usercancel, type: "error" });
    endProgression(false);
  }

  function updateProgression(index, total) {
    if (typeof progressValue.current.value != undefined) {
      progressValue.current.value = (((index + 1) * 100) / total).toFixed(0);
      progressValueDisplay.current.innerHTML = index + 1 + " / " + total;
    }
  }

  function endProgression(needrestart) {
    modals.removeModal(modals.getModalIndex("progression"));
    setIsLoading(false);
    if (needrestart) {
      showConfirmationModal({
        modals,
        title,
        content: contentrestart,
        button1: { cb: reStartBoard, text: yes },
        button2: { text: cancel },
      });
    }
  }

  function saveEntry(entry, index, total, needrestart) {
    let cmd =
      "[ESP401]P=" + entry.id + " T=" + entry.cast + " V=" + entry.value;
    createNewRequest(
      espHttpURL("command", { cmd }).toString(),
      { method: "GET", id: "ESP401" },
      {
        onSuccess: (result) => {
          updateProgression(index, total);
          try {
            entry.initial = entry.value;
          } catch (e) {
            console.log(e);
            toasts.addToast({ content: e, type: "error" });
          } finally {
            if (index == total - 1) {
              endProgression(needrestart);
            }
          }
        },
        onFail: (error) => {
          updateProgression(index, total);
          console.log(error);
          toasts.addToast({ content: error, type: "error" });
          if (index == total - 1) {
            endProgression(needrestart);
          }
        },
      }
    );
  }

  function SaveSettings() {
    let needrestart = false;
    let index = 0;
    let total = 0;
    setIsLoading(true);
    showProgressModal({
      modals,
      title: titleupdate,
      button1: { cb: abortSave, text: cancel },
      content: <Progression />,
    });

    Object.keys(features).map((sectionId) => {
      const section = features[sectionId];
      Object.keys(section).map((subsectionId) => {
        const subsection = section[subsectionId];
        Object.keys(subsection).map((entryId) => {
          const entry = subsection[entryId];
          if (entry.initial != entry.value) total++;
          if (entry.needRestart == "1") needrestart = true;
        });
      });
    });
    Object.keys(features).map((sectionId) => {
      const section = features[sectionId];
      Object.keys(section).map((subsectionId) => {
        const subsection = section[subsectionId];
        Object.keys(subsection).map((entryId) => {
          const entry = subsection[entryId];
          if (entry.initial != entry.value) {
            saveEntry(entry, index, total, needrestart);
            index++;
          }
        });
      });
    });
  }

  function checkSaveStatus() {
    let stringified = JSON.stringify(features);
    let hasmodified =
      stringified.indexOf('"hasmodified":true') == -1 ? false : true;
    let haserrors = stringified.indexOf('"haserror":true') == -1 ? false : true;
    if (haserrors || !hasmodified) return false;
    return true;
  }

  function reStartBoard() {
    Disconnect("restart");
    setTimeout(() => {
      window.location.reload();
    }, 40000);
    console.log("restart");
  }

  const fileSelected = () => {
    let haserrors = false;
    if (inputFile.current.files.length > 0) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = function (e) {
        const importFile = e.target.result;
        try {
          const importData = JSON.parse(importFile);
          [featuresSettings.current, haserrors] = importFeatures(
            featuresSettings.current,
            importData
          );
          if (haserrors) {
            toasts.addToast({ content: "S56", type: "error" });
          }
          setFeatures(featuresSettings.current);
        } catch (e) {
          console.log(e);
          console.log("Error");
          toasts.addToast({ content: "S56", type: "error" });
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(inputFile.current.files[0]);
    }
  };

  const generateValidation = (fieldData) => {
    let validation = {
      message: <Flag size="1rem" />,
      valid: true,
      modified: true,
    };
    if (fieldData.type == "text") {
      if (fieldData.cast == "A") {
        if (
          !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
            fieldData.value
          )
        )
          validation.valid = false;
      } else {
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
      }
    } else if (fieldData.type == "number") {
      if (fieldData.max) {
        if (fieldData.value > fieldData.max) {
          validation.valid = false;
        }
      }
      if (fieldData.min) {
        if (fieldData.value < fieldData.min) {
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

  useEffect(() => {
    if (
      featuresSettings.current &&
      Object.keys(featuresSettings.current).length != 0
    ) {
      setFeatures(featuresSettings.current);
      setIsLoading(false);
    } else {
      if (uisettings.getValue("autoload")) {
        getFeatures();
      } else setIsLoading(false);
    }
  }, []);
  console.log("feature");
  return (
    <div id="features">
      <input
        ref={inputFile}
        type="file"
        class="d-none"
        accept=".json"
        onChange={fileSelected}
      />
      <h4>{T("S36")}</h4>
      {isLoading && <Loading large />}

      {!isLoading && (
        <Fragment>
          {Object.keys(features).length != 0 && (
            <div class="flex-wrap">
              {Object.keys(features).map((sectionId) => {
                const section = features[sectionId];
                return (
                  <Fragment>
                    {Object.keys(section).map((subsectionId) => {
                      const subSection = section[subsectionId];
                      return (
                        <div className="column col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-3 mb-2">
                          <div class="panel mb-2 panel-features">
                            <div class="navbar">
                              <span class="navbar-section label label-secondary text-ellipsis">
                                <strong class="text-ellipsis">
                                  {T(subsectionId)}
                                </strong>
                              </span>
                              <span class="navbar-section">
                                <span style="height: 100%;">
                                  <span class="label label-primary align-top">
                                    {T(sectionId)}
                                  </span>
                                </span>
                              </span>
                            </div>

                            <div class="panel-body panel-body-features">
                              {subSection.map((fieldData) => {
                                const [validation, setvalidation] = useState();
                                const { label, options, initial, ...rest } =
                                  fieldData;
                                const Options = options
                                  ? options.reduce((acc, curval) => {
                                      return [
                                        ...acc,
                                        {
                                          label: T(curval.label),
                                          value: curval.value,
                                        },
                                      ];
                                    }, [])
                                  : null;
                                return (
                                  <Field
                                    label={T(label)}
                                    options={Options}
                                    extra={
                                      subsectionId == "sta" && label == "SSID"
                                        ? "scan"
                                        : null
                                    }
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
                      );
                    })}
                  </Fragment>
                );
              })}
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
              onClick={getFeatures}
            />
            {Object.keys(features).length != 0 && (
              <Fragment>
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
                    exportFeatures(featuresSettings.current);
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

                <ButtonImg
                  m2
                  tooltip
                  data-tooltip={T("S59")}
                  label={T("S58")}
                  icon={<RotateCcw />}
                  onClick={(e) => {
                    e.target.blur();
                    showConfirmationModal({
                      modals,
                      title,
                      content,
                      button1: { cb: reStartBoard, text: yes },
                      button2: { text: cancel },
                    });
                  }}
                />
              </Fragment>
            )}
          </center>
        </Fragment>
      )}
      <br />
    </div>
  );
};

export { FeaturesTab };
