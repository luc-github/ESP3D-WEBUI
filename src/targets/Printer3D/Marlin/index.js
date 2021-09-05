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
import { compareStrings } from "../../../components/Helpers";
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

const canProcessFile = (filename) => {
  const filters = useUiContextFn.getValue("filesfilter").split(";");
  filters.forEach((element) => {
    if (element == "*" || filename.endsWith("." + element)) return true;
  });
  return false;
};

const sortedFilesList = (filesList) => {
  //files alphabeticaly then folders alphabeticaly
  filesList.sort(function (a, b) {
    return compareStrings(a.name, b.name);
  });
  filesList.sort(function (a, b) {
    return a.size == -1 && b.size != -1
      ? 1
      : a.size != -1 && b.size == -1
      ? -1
      : 0;
  });
  return filesList;
};

const formatStatus = (status) => {
  if (status == "ok") return "S126";
  return status;
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
    Process: (path, filename) => false,
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
      return canProcessFile(filename);
    },
    Upload: (path, filename) => {
      return true;
    },
    UploadMultiple: (path, filename) => {
      return false;
    },
    Download: (path, filename) => {
      return false;
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
  SDEXT: {
    Process: (path, filename) => {
      return canProcessFile(filename);
    },
  },
  TFTUSB: {
    Process: (path, filename) => {
      return canProcessFile(filename);
    },
  },
  TFTSD: {
    Process: (path, filename) => {
      return canProcessFile(filename);
    },
  },
};

const commands = {
  FLASH: {
    list: (path, filename) => {
      return {
        type: "url",
        url: "files",
        args: { path, action: "list" },
      };
    },
    formatResult: (resultTxT) => {
      const res = JSON.parse(resultTxT);
      res.files = sortedFilesList(res.files);
      res.status = formatStatus(res.status);
      return res;
    },
    deletedir: (path, filename) => {
      return {
        type: "url",
        url: "files",
        args: { path, action: "deletedir", filename },
      };
    },
    delete: (path, filename) => {
      return {
        type: "url",
        url: "files",
        args: { path, action: "delete", filename },
      };
    },
    createdir: (path, filename) => {
      return {
        type: "url",
        url: "files",
        args: { path, action: "createdir", filename },
      };
    },
    download: (path, filename) => {
      return {
        type: "url",
        url: path + (path.endsWith("/") ? "" : "/") + filename,
        args: {},
      };
    },
  },
  SD: {
    list: (path, filename) => {
      return { type: "cmd", cmd: "M20 " + path };
    },
    formatResult: (resultTxT) => {
      return { status: "ok" };
    },
    play: (path, filename) => {
      return { type: "cmd", cmd: "M23 " + path + filename + "\nM24" };
    },
  },
  SDEXT: {
    list: (path, filename) => {
      return { type: "cmd", cmd: "M20 " + path };
    },
    formatResult: (resultTxT) => {
      return { status: "ok" };
    },
  },
  TFTUSB: {
    list: (path, filename) => {
      return { type: "cmd", cmd: "M20 USB:" + path };
    },
    formatResult: (resultTxT) => {
      return { status: "ok" };
    },
  },
  TFTSD: {
    list: (path, filename) => {
      return { type: "cmd", cmd: "M20 SD:" + path };
    },
    formatResult: (resultTxT) => {
      return { status: "ok" };
    },
  },
};

const capability = (filesystem, cap, path, filename) => {
  if (capabilities[filesystem] && capabilities[filesystem][cap])
    return capabilities[filesystem][cap](path, filename);
  return false;
};

const command = (filesystem, cmd, path, filename) => {
  if (commands[filesystem] && commands[filesystem][cmd])
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
};
