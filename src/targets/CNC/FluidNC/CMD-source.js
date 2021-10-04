/*
 CMD-source.js - ESP3D WebUI Target file

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
  const value = type == "entry" ? fullline.trim().split(":")[1].trim() : "";

  return { type, identation: s, label, value, initial: value };
};

const formatYamlLine = (acc, line) => {
  console.log(line);
  if (line.indexOf(":") != -1 && !line.startsWith("[")) {
    const prevLine = acc.length > 0 ? acc[acc.length - 1] : null;
    const data = getLineData(line);
    if (
      prevLine &&
      prevLine.type == "section" &&
      prevLine.identation >= data.identation
    ) {
      prevLine.type = "entry";
    }
    if (
      (prevLine && prevLine.identation > data.identation) ||
      (data.identation == 0 && data.type == "section")
    ) {
      if (prevLine.type == "section") {
        prevLine.type = "entry";
      }
      acc.push({ type: "newline", value: "", identation: 0 });
    }
    acc.push(data);
  }

  return acc;
};

const commands = {
  eeprom: () => {
    return { type: "cmd", cmd: "$CD" };
  },
  formatEeprom: (result) => {
    const res = result.reduce((acc, line) => {
      return formatYamlLine(acc, line);
    }, []);
    if (res.length > 0) {
      if (res[res.length - 1].type != "newline")
        if (res[res.length - 1].type == "section") {
          res[res.length - 1].type = "entry";
          if (
            res.length > 3 &&
            res[res.length - 2].type == "newline" &&
            res[res.length - 2].indentation == res[res.length - 1].indentation
          ) {
            res.splice(res.length - 2, 1);
          }
        }
    }
    return res;
  },
};

const responseSteps = {
  eeprom: {
    start: (data) => data.startsWith("[MSG: BeginData]"),
    end: (data) => data.startsWith("[MSG: EndData]"),
    error: (data) => {
      return data.startsWith("error:");
    },
  },
};

function capability() {
  const [cap, ...rest] = arguments;
  if (capabilities[cap]) return capabilities[cap](...rest);
  console.log("Unknow capability ", cap);
  return false;
}

function command() {
  const [cmd, ...rest] = arguments;
  if (commands[cmd]) return commands[cmd](...rest);
  console.log("Unknow command ", cmd);
  return { type: "error" };
}

const CMD = { capability, command, responseSteps };

export { CMD };
