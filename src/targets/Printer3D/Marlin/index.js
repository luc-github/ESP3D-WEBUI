/*
 index.js - ESP3D WebUI Target file

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
import { Fan, Bed, FeedRate, FlowRate, Extruder } from "./icons";
import { FilesPanelElement } from "../../../components/Panel/Files";
import { MacrosPanelElement } from "../../../components/Panel/Macros";
import { TerminalPanelElement } from "../../../components/Panel/Terminal";
import {
  TargetContextProvider,
  useTargetContext,
  useTargetContextFn,
} from "./TargetContext";

const Target = "Marlin";
const Name = "ESP3D";
const fwUrl = "https://github.com/luc-github/ESP3D/tree/3.0";
const iconsTarget = {
  Fan: <Fan />,
  Bed: <Bed />,
  FeedRate: <FeedRate />,
  FlowRate: <FlowRate />,
  Extruder: <Extruder />,
};

const defaultPanelsList = [
  FilesPanelElement,
  TerminalPanelElement,
  MacrosPanelElement,
];

const restartdelay = 30;

const startJobCmd = (target, filename) => {
  switch (target) {
    case "SD":
      return "M23 " + filename + "\nM24";
      break;
    default:
      console.log("no idea sorry");
      break;
  }
};

const getFSCommand = (command, filesystem, path, filename) => {
  console.log(
    "Command:",
    command,
    " Filesystem:",
    filesystem,
    " Path:",
    path,
    "Filename:",
    filename
  );
  switch (filesystem) {
    case "FLASH":
      switch (command) {
        case "list":
          return { type: "url", cmd: "/files?path=" + path + "&action=list" };
        default:
          console.log("Wrong command");
          return { type: "error" };
      }
      return { type: "url", cmd: "/files?path=" + path + "&action=list" };
    default:
      console.log("Wrong filesystem");
      return { type: "error" };
  }
};

const canProcess = (filesystem, path, filename) => {
  switch (filesystem) {
    case "FLASH":
    default:
      return false;
  }
};

const canUpload = (filesystem, path, filename) => {
  switch (filesystem) {
    case "FLASH":
      return { upload: true, type: "multiple" };
    default:
      return { upload: false };
  }
};

const canDownload = (filesystem, path, filename) => {
  switch (filesystem) {
    case "FLASH":
      return true;
    default:
      return false;
  }
};

const canDeleteFile = (filesystem, path, filename) => {
  switch (filesystem) {
    case "FLASH":
      return true;
    default:
      return false;
  }
};

const canDeleteDir = (filesystem, path, filename) => {
  switch (filesystem) {
    case "FLASH":
      return true;
    default:
      return false;
  }
};

const canCreateDir = (filesystem, path, filename) => {
  switch (filesystem) {
    case "FLASH":
      return true;
    default:
      return false;
  }
};

const supportedFileSystems = [
  { value: "FLASH", name: "S137", depend: "showfilespanel" },
  { value: "SD", name: "S190", depend: "sd" },
  { value: "SDEXT", name: "S191", depend: "sdext" },
  { value: "TFTSD", name: "S188", depend: "tftsd" },
  { value: "TFTUSB", name: "S189", depend: "tftusb" },
];

const files = {
  getFSCommand,
  canProcess,
  canUpload,
  canDownload,
  canDeleteFile,
  canDeleteDir,
  canCreateDir,
  supported: supportedFileSystems,
};

export {
  Target,
  fwUrl,
  Name,
  files,
  iconsTarget,
  restartdelay,
  defaultPanelsList,
  TargetContextProvider,
  useTargetContext,
  useTargetContextFn,
  startJobCmd,
};
