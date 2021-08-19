/*
 MacroButton.js - ESP3D WebUI component file

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

import { h } from "preact";
import { useEffect } from "preact/hooks";
import { useUiContext } from "../../../contexts";

import { iconsList } from "../../Images";
import { ButtonImg } from "../../Controls";
import { T } from "./../../Translations";

/*
 * Local const
 *
 */
const MacroButton = ({ itemData }) => {
  const onClick = (e) => {
    console.log("Click");
  };

  const controlIcon = iconsList[itemData.icon] ? iconsList[itemData.icon] : "";
  useEffect(() => {}, []);
  return (
    <ButtonImg
      m1
      icon={controlIcon}
      label={itemData.name}
      onClick={onClick}
      style="max-width:2rem;"
    />
  );
};

export default MacroButton;
