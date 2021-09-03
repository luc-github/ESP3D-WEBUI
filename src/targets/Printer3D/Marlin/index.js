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
import { useUiContextFn } from "../../../contexts";

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

const canProcess = (filename) => {
  const filters = useUiContextFn.getValue("filesfilter").split(";");
  filters.forEach((element) => {
    if (element == "*" || filename.endsWith("." + element)) return true;
  });
  return false;
};

const supportedFileSystems = [
  { value: "FLASH", name: "S137", depend: "showfilespanel" },
  { value: "SD", name: "S190", depend: "sd" },
  { value: "SDEXT", name: "S191", depend: "sdext" },
  { value: "TFTSD", name: "S188", depend: "tftsd" },
  { value: "TFTUSB", name: "S189", depend: "tftusb" },
];

const capabilities = {
  FLASH: {
    canProcess: false,
    Upload: (path, filename) => {
      return true;
    },
    UploadMultiple: (path, filename) => {
      return true;
    },
    Download: (path, filename) => {
      return true;
    },
    DeleteFile: (path, filename) => {
      return true;
    },
    DeleteDir: (path, filename) => {
      return true;
    },
    CreateDir: (path, filename) => {
      return true;
    },
  },

  SD: {
    Process: (path, filename) => {
      return canProcess(filename);
    },
    Upload: (path, filename) => {
      return true;
    },
    UploadMultiple: (path, filename) => {
      return true;
    },
    Download: (path, filename) => {
      return true;
    },
    DeleteFile: (path, filename) => {
      return true;
    },
    DeleteDir: (path, filename) => {
      return true;
    },
    CreateDir: (path, filename) => {
      console.log("Here");
      return true;
    },
  },
  SDEXT: {
    Process: (path, filename) => {
      return canProcess(filename);
    },
  },
  TFTUSB: {
    Process: (path, filename) => {
      return canProcess(filename);
    },
  },
  TFTSD: {
    Process: (path, filename) => {
      return canProcess(filename);
    },
  },
};

const commands = {
  FLASH: {
    list: (path, filename) => {
      return { type: "url", cmd: "/files?path=" + path + "&action=list" };
    },
  },
  SD: {
    list: (path, filename) => {
      return { type: "cmd", cmd: "M20 " + path };
    },
  },
  SDEXT: {
    list: (path, filename) => {
      return { type: "cmd", cmd: "M20 " + path };
    },
  },
  TFTUSB: {
    list: (path, filename) => {
      return { type: "cmd", cmd: "M20 USB:" + path };
    },
  },
  TFTSD: {
    list: (path, filename) => {
      return { type: "cmd", cmd: "M20 SD:" + path };
    },
  },
};

const capability = (filesystem, cap, path, filename) => {
  if (capabilities[filesystem] && capabilities[filesystem][cap])
    return capabilities[filesystem][cap](path, filename);
  return false;
};

const command = (filesystem, cmd, path, filename) => {
  if (commands[filesystem] && capabilities[filesystem][cmd])
    return commands[filesystem][cmd](path, filename);
  return undefined;
};

const files = {
  command,
  capability,
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
