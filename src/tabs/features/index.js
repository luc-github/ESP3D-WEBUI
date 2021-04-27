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
import { useUiContext, useSettingsContext } from "../../contexts";
import {
  RefreshCcw,
  RotateCcw,
  Save,
  Search,
  Lock,
  CheckCircle,
  ExternalLink,
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
  const { toasts, modals } = useUiContext();
  const { createNewRequest, abortRequest } = useHttpQueue();
  const { settings } = useSettingsContext();
  const [isLoading, setIsLoading] = useState(true);
  const progressValue = useRef(0);
  const progressValueDisplay = useRef(0);
  const [features, setFeatures] = useState();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showProgression, setShowProgression] = useState(false);
  const inputFile = useRef(null);
  const errorMsg = T("S21");
  const getFeatures = () => {
    setIsLoading(true);
    createNewRequest(
      espHttpURL("command", { cmd: "[ESP400]" }).toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          try {
            const Status = JSON.parse(result);
            settings.current.features = formatStructure(Status.Settings);
            setFeatures(settings.current.features);
          } catch (e) {
            console.log(e);
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

  const handleChange = (e) => {
    /*console.log(section);
    const { name, value, initial } = e;
    if (value != initial) {
      console.log("change", value, "for ", section, ".", e.subsection);
      console.log(features);
      e.validation = { message: "modified", valid: true, modified: true };
    }*/
    /*const isValid = true //for dev purpose, handeValidation todo
    const validation = { valid: isValid, message: 'test message' }
    const newValue = { [name]: { ...formState[name], value: value, validation } }
    setFormState({ ...formState, ...newValue })
    if (isValid.valid) setUpdatableSettingsState({ ...updatableSettingsState, [name]: value })*/
  };

  const fileSelected = () => {
    let haserrors = false;
    if (inputFile.current.files.length > 0) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const importFile = e.target.result;
        try {
          const importData = JSON.parse(importFile);
          [settings.current.features, haserrors] = importFeatures(
            settings.current.features,
            importData
          );
          if (haserrors) {
            toasts.addToast({ content: "S56", type: "error" });
          }
          setFeatures(settings.current.features);
        } catch (e) {
          console.log(e);
          toasts.addToast({ content: "S56", type: "error" });
        }
      };
      reader.readAsText(inputFile.current.files[0]);
    }
  };

  useEffect(() => {
    if (settings.current.features && settings.current.features.length != 0) {
      setFeatures(settings.current.features);
      setIsLoading(false);
    } else {
      if (settings.current.interface.settings.autoload) getFeatures();
      else setIsLoading(false);
    }
  }, []);

  return (
    <div id="features">
      <input
        ref={inputFile}
        type="file"
        class="d-none"
        accept=".json"
        onChange={fileSelected}
      />
      <h2>{T("S36")}</h2>
      {isLoading && <Loading />}

      {!isLoading && (
        <Fragment>
          {features && (
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
                                const { label, options, ...rest } = fieldData;
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
                                    {...rest}
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
              mx2
              label={T("S50")}
              tooltip
              data-tooltip={T("S23")}
              icon={<RefreshCcw />}
              onClick={getFeatures}
            />
            {features && (
              <Fragment>
                <ButtonImg
                  mx2
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
                  mx2
                  label={T("S52")}
                  tooltip
                  data-tooltip={T("S53")}
                  exportFeatures
                  onClick={(e) => {
                    e.target.blur();
                    exportFeatures(settings.current.features);
                  }}
                />
                <ButtonImg
                  mx2
                  tooltip
                  data-tooltip={T("S62")}
                  label={T("S61")}
                  icon={<Save />}
                  onClick={() => {}}
                />
                <ButtonImg
                  mx2
                  tooltip
                  data-tooltip={T("S59")}
                  label={T("S58")}
                  icon={<RotateCcw />}
                  onClick={() => {}}
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
