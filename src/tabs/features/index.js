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
import {
  useUiContext,
  useDatasContext,
  useSettingsContext,
} from "../../contexts";
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
            settings.current.features = Status.Settings;
          } catch (e) {
            console.log(e);
            toasts.addToast({ content: errorMsg, type: "error" });
          } finally {
            setIsLoading(false);
          }
        },
        onFail: (error) => {
          setIsLoading(false);
          toasts.addToast({ content: error, type: "error" });
        },
      }
    );
  };

  useEffect(() => {
    console.log(settings);
    if (settings.current.features && settings.current.features.length != 0) {
      setFeatures([...settings.current.features]);
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
          {JSON.stringify(settings.current.features)}
          <center>
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
    </div>
  );
};

export { FeaturesTab };
