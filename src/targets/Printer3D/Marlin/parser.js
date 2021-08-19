/*
 Parser.js - ESP3D WebUI parser file

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
import { hslToHex } from "../../../components/Helpers";

/*
 * Local const
 *
 */
const temperatureRegHex =
  /([a-zA-Z]{1}-?\d*){1}:(-?\d+\.?\d*){1} *\/? *(\d*\.*\d*)?/gim;
const gcode = /([a-zA-Z]{1}\d+\.?\d*)[^: ]/gim;
const fullRegHex = /([\w-\/~\d]+.[\d\w]+)\s(\d+)/gim;
const isBlank = (line) =>
  line.trim() === "" || line === "\n" || line === "\r" || line === "\r\n";
const isComment = (line) => line.startsWith(";");
const isFileListBegin = (line) => line.startsWith("Begin file list");
const isFileListEnd = (line) => line.startsWith("End file list");
const isTemp = (line) => line.indexOf("T:") != -1;

class Parser {
  constructor() {
    this.fileListBuffer = [];
    this.isParsingFile = false;
    this.currentLine = "";
    this.results = [];
    this.parse = this.parse.bind(this);
    this.fileParser = this.fileParser.bind(this);
    this.returnFileList = this.returnFileList.bind(this);
  }

  parse(line) {
    if (isBlank(line) || isComment(line)) return null;
    if (isFileListBegin(line)) {
      this.isParsingFile = true;
      return null;
    }
    if (this.isParsingFile) {
      if (isFileListEnd(line)) {
        this.isParsingFile = false;
        const fileList = this.returnFileList();
        this.fileListBuffer = [];
        return fileList;
      }
      this.lineParser("files", line);
      return null;
    }

    if (isTemp(line)) return this.lineParser("temp", line);
    return null;
  }

  fileParser(line) {
    const FullMatch = [...line.matchAll(fullRegHex)];
    const [fullmatch, name, size] = FullMatch[0];
    this.fileListBuffer = fullmatch
      ? [...this.fileListBuffer, { name, size: parseInt(size) }]
      : [...this.fileListBuffer];
    return null;
  }

  returnFileList() {
    return {
      values: [...this.fileListBuffer],
      type: "files",
    };
  }

  lineParser(parserName, line) {
    if (parserName === "temp") return this.temperatureParser(line);
    if (parserName === "files") return this.fileParser(line);
  }

  temperatureParser(line) {
    const values = [...line.matchAll(temperatureRegHex)].map((temp, i, arr) => {
      const hue = Math.floor((360 / arr.length) * i); //generate hue depending on the number of sensors
      return {
        timestamp: Date.now(),
        id: temp[1],
        value: parseFloat(temp[2]),
        target: parseFloat(temp[3]),
        color: hslToHex(hue, 80, 70),
      };
    });
    return {
      values,
      type: "temp",
    };
  }
}

export { Parser };
