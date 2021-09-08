/*
 strings.js - ESP3D WebUI helpers file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 Modified by Luc LEBOSSE 2021
 
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

const capitalize = (s) =>
  typeof s === "string" ? s.charAt(0).toUpperCase() + s.slice(1) : "";

function compareStrings(a, b) {
  // case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return a < b ? -1 : a > b ? 1 : 0;
}

function formatFileSizeToString(size) {
  var lsize = parseInt(size);
  var value = 0.0;
  var tsize = "";
  if (lsize < 1024) {
    tsize = lsize + " B";
  } else if (lsize < 1024 * 1024) {
    value = lsize / 1024.0;
    tsize = value.toFixed(2) + " KB";
  } else if (lsize < 1024 * 1024 * 1024) {
    value = lsize / 1024.0 / 1024.0;
    tsize = value.toFixed(2) + " MB";
  } else {
    value = lsize / 1024.0 / 1024.0 / 1024.0;
    tsize = value.toFixed(2) + " GB";
  }
  return tsize;
}

const hslToHex = (h, s, l) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const beautifyJSONString = (jsonstring) => {
  try {
    return JSON.stringify(JSON.parse(jsonstring), null, " ");
  } catch (e) {
    return "error";
  }
};

export {
  capitalize,
  hslToHex,
  beautifyJSONString,
  compareStrings,
  formatFileSizeToString,
};
