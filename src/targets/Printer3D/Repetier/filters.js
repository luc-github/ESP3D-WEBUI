/*
 filters.js - ESP3D WebUI helper file

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

//Repetier Temperatures
//T:50.88 /0 B:50.88 /0 B@:0 @:0
//T:-50.88 /0 B:-50.88 /0 B@:0 @:0
//T:50.88 /100 B:50.88 /0 B@:0 @:255
//busy:processing
//busy:heating
//extruder 0: temp sensor defect
//heated bed: temp sensor defect marked defect
//fatal:Heater/sensor error - Printer stopped and heaters disabled due to this error. Fix error and restart with M999.

const isTemperatures = (str) => {
  const regex_search = /T:.*\s@:[0-2]/g;
  return regex_search.test(str);
};

const getTemperatures = (str) => {
  let result = null;
  const response = {
    T: [], //0->8 T0->T8 Extruders
    R: [], //0->1 R Redondant
    B: [], //0->1 B Bed
    C: [], //0->1  Chamber
    P: [], //0->1 Probe
    M: [], //0->1 M Board
    L: [], //0->1 L is only for laser so should beout of scope
  };
  const regex_search =
    /(B|T|C|P|R)([\d]*):([+|-]?[0-9]*\.?[0-9]+|inf)? \/([+]?[0-9]*\.?[0-9]+)/g;
  //result[0] = full match
  //result[1] = tool
  //result[2] = index if multiple
  //result[3] = current
  //result[4] = target
  //Note :on multiple extruders T is the active one, it will be erased by the next T0
  while ((result = regex_search.exec(str)) !== null) {
    response[result[1]][result[2] == "" ? 0 : result[2]] = {
      current: result[3],
      target: result[4],
    };
  }
  return response;
};

//Repetier positions
//X:0.00 Y:0.00 Z:0.00 E:0.00
const isPositions = (str) => {
  const regex_search =
    /X:\s*[+,-]?[0-9]*\.?[0-9]+?\s*Y:\s*[+,-]?[0-9]*\.?[0-9]+?\s*Z:\s*[+,-]?[0-9]*\.?[0-9]+?\s*E/;
  return regex_search.test(str);
};

const getPositions = (str) => {
  let result = null;
  const regex_search =
    /X:\s*([+,-]?[0-9]*\.?[0-9]+)?\s*Y:\s*([+,-]?[0-9]*\.?[0-9]+)?\s*Z:\s*([+,-]?[0-9]*\.?[0-9]+)?\s*E/;
  if ((result = regex_search.exec(str)) !== null) {
    return { x: result[1], y: result[2], z: result[3] };
  }
  return null;
};

export { isTemperatures, getTemperatures, isPositions, getPositions };
