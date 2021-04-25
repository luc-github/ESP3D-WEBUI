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

const FeaturesTab = () => {
  const { toasts, modals } = useUiContext();
  const { createNewRequest, abortRequest } = useHttpQueue();
  const { settings } = useSettingsContext();
  const [isLoading, setIsLoading] = useState(true);
  const progressValue = useRef(0);
  const progressValueDisplay = useRef(0);
  const [features, setFeatures] = useState([]);
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
            setFeatures(Status.Settings);
            console.log(Status);
            settings.current.features = formatStructure(Status.Settings);
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
    const { name, value } = e.target;
    /*const isValid = true //for dev purpose, handeValidation todo
    const validation = { valid: isValid, message: 'test message' }
    const newValue = { [name]: { ...formState[name], value: value, validation } }
    setFormState({ ...formState, ...newValue })
    if (isValid.valid) setUpdatableSettingsState({ ...updatableSettingsState, [name]: value })*/
  };

  useEffect(() => {
    console.log(settings);
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
      <h2>{T("S36")}</h2>
      {isLoading && <Loading />}

      {!isLoading && (
        <Fragment>
          {settings.current.features && (
            <div class="flex-wrap">
              {Object.keys(settings.current.features).map((sectionId) => {
                const section = settings.current.features[sectionId];
                return (
                  <Fragment>
                    {Object.keys(section).map((subsectionId) => {
                      const subSection = section[subsectionId];
                      return (
                        <div className="column col-sm-12 col-md-6 col-4 mb-2">
                          <div class="panel mb-2 panel-features">
                            <div class="navbar">
                              <span class="navbar-section label label-secondary">
                                <strong>{T(subsectionId)}</strong>
                              </span>
                              <span class="navbar-section">
                                <span class="label label-primary">
                                  {T(sectionId)}
                                </span>
                              </span>
                            </div>

                            <div class="panel-body panel-body-features">
                              {subSection.map((fieldData) => {
                                {
                                  /* console.log({ ...formState[fieldId] }) */
                                }
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
                                    onChange={(e) => {
                                      handleChange(e);
                                    }}
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
            {settings.current.features && (
              <Fragment>
                <ButtonImg
                  mx2
                  label={T("S54")}
                  tooltip
                  data-tooltip={T("S55")}
                  icon={<Download />}
                  onClick={() => {}}
                />
                <ButtonImg
                  mx2
                  label={T("S52")}
                  tooltip
                  data-tooltip={T("S53")}
                  icon={<ExternalLink />}
                  onClick={() => {}}
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
