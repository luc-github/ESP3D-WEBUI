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
import { h } from "preact";
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
  return (
    <div id="features">
      <h2>{T("S36")}</h2>{" "}
      <center>
        <ButtonImg label={T("S50")} icon={<RefreshCcw />} onClick={() => {}} />
      </center>
    </div>
  );
};

export { FeaturesTab };
