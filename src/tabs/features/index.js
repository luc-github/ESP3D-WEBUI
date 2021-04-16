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
import { useState } from "preact/hooks";
import { Field } from "../../components/Controls";

const FeaturesTab = () => {
  const [val, setVal] = useState(true);
  const [validation, setValidation] = useState(null);
  const [valI, setValI] = useState("test");
  const [validationI, setValidationI] = useState(null);
  const [valS, setValS] = useState(1);
  const [validationS, setValidationS] = useState(null);
  const setValueS = (val) => {
    setValS(val);
    if (val == 2)
      setValidationS({ message: "modified", valid: true, modified: true });
    else if (val == 3)
      setValidationS({ message: "error", valid: false, modified: true });
    else if (val == 4)
      setValidationS({ message: "success", valid: true, modified: false });
    else setValidationS(null);
  };
  const setValue = (val) => {
    setVal(val);
    if (val)
      setValidation({ message: "modified", valid: true, modified: true });
    else setValidation(null);
  };
  const setValueI = (val) => {
    setValI(val);
    if (val != "yes")
      setValidationI({ message: "modified", valid: true, modified: false });
    else setValidationI(null);
  };
  return (
    <div id="features">
      <h2>Features</h2>
      <Field
        type="boolean"
        label="my check"
        id="checkbox"
        value={val}
        style="width:15rem"
        setValue={setValue}
        validation={validation}
      />
      <Field
        type="password"
        label="my input"
        id="password"
        value={valI}
        style="width:15rem"
        setValue={setValueI}
        validation={validationI}
      />
      <Field
        type="select"
        label="my selection"
        id="selector"
        value={valS}
        options={[
          { label: "value 1", value: 1 },
          { label: "value 2", value: 2 },
          { label: "value 3", value: 3 },
          { label: "value 4", value: 4 },
        ]}
        style="width:15rem"
        setValue={setValueS}
        validation={validationS}
        inline
      />
    </div>
  );
};

export { FeaturesTab };
