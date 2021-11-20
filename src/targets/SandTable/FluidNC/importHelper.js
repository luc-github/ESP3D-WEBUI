/*
 importHelper.js - ESP3D WebUI Target file

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

const getLineData = (fullline) => {
  let s;
  for (let p = 0; p < fullline.length; p++) {
    if (fullline[p] != " ") {
      s = p;
      break;
    }
  }
  const type =
    fullline.trim().split(":").length == 1 ||
    fullline.trim().split(":")[1].trim().length == 0
      ? "section"
      : "entry";
  const label = fullline.trim().split(":")[0].trim();
  const value =
    type == "entry"
      ? fullline.trim().split(":")[1].trim()
      : type == "section"
      ? label
      : "";

  return { type, indentation: s, label, value, initial: value, path: "" };
};

const getPreviousData = (acc) => {
  if (acc.length == 0) return null;
  for (let i = acc.length - 1; i >= 0; i--) {
    if (!(acc[i].type == "comment" || acc[i].type == "newline")) return acc[i];
  }
  return null;
};

const formatYamlLine = (acc, line) => {
  const prevLine = getPreviousData(acc);
  if (line.trim().startsWith("#")) {
    acc.push({
      type: "comment",
      value: line.trim().substring(1),
      indentation: 0,
    });
  } else if (line.indexOf(":") != -1) {
    const data = getLineData(line);
    if (
      prevLine &&
      prevLine.type == "section" &&
      prevLine.indentation >= data.indentation
    ) {
      prevLine.type = "entry";
      prevLine.value = "";
      prevLine.initial = "";
    }
    if (
      (prevLine && prevLine.indentation > data.indentation) ||
      (data.indentation == 0 && data.type == "section")
    ) {
      if (prevLine && prevLine.type == "section") {
        prevLine.type = "entry";
        prevLine.value = "";
        prevLine.initial = "";
      }
      acc.push({ type: "newline", value: "", indentation: 0 });
    }
    acc.push(data);
  }
  return acc;
};

const formatArrayYamlToFormatedArray = (arrayData) => {
  const res = arrayData.reduce((acc, line) => {
    return formatYamlLine(acc, line);
  }, []);
  if (res.length > 0) {
    if (res[res.length - 1].type != "newline")
      if (res[res.length - 1].type == "section") {
        res[res.length - 1].type = "entry";
        res[res.length - 1].value = "";
        res[res.length - 1].initial = "";
        if (
          res.length > 3 &&
          res[res.length - 2].type == "newline" &&
          res[res.length - 2].indentation == res[res.length - 1].indentation
        ) {
          res.splice(res.length - 2, 1);
        }
      }
  }
  if (res.length > 0 && res[0].type == "newline") res.splice(0, 1);
  //generate path
  let path = [];
  let currentIndentation = 0;
  for (let i = 0; i < res.length; i++) {
    if (res[i].type == "newline" || res[i].type == "comment") continue;
    if (currentIndentation <= res[i].indentation) {
      if (res[i].type == "section") {
        res[i].path = path.join(":");
        path.push(res[i].label);
      } else {
        res[i].path = path.join(":");
      }
    } else {
      while (currentIndentation > res[i].indentation) {
        let p = path.pop();
        currentIndentation -= 2;
        if (currentIndentation < 0) currentIndentation = 0;
      }
      if (res[i].type == "section") {
        res[i].path = path.join(":");
        path.push(res[i].label);
      } else {
        res[i].path = path.join(":");
      }
    }

    currentIndentation = res[i].indentation;
  }
  return res;
};

const formatYamlToFormatedArray = (stringYaml) => {
  const ar = stringYaml.replaceAll("\r", "\n").split("\n");
  return formatArrayYamlToFormatedArray(ar);
};

export { formatYamlToFormatedArray, formatArrayYamlToFormatedArray };
