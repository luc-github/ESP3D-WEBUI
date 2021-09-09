/*
 files.js - ESP3D WebUI Target file

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
import { useUiContextFn } from "../../../contexts";
import {
  compareStrings,
  formatFileSizeToString,
} from "../../../components/Helpers";

//List of supported files systems
const supportedFileSystems = [
  { value: "FLASH", name: "S137", depend: "showfilespanel" },
  { value: "SD", name: "S190", depend: "sd" },
  { value: "SDEXT", name: "S191", depend: "sdext" },
  { value: "TFTSD", name: "S188", depend: "tftsd" },
  { value: "TFTUSB", name: "S189", depend: "tftusb" },
];

//sort files alphabeticaly then folders alphabeticaly
//TODO: move this to helper ?
const sortedFilesList = (filesList) => {
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

//Check if filename is a file to be processed based on extension
//TODO: move this to a helper ?
const canProcessFile = (filename) => {
  const filters = useUiContextFn.getValue("filesfilter").split(";");
  for (let index = 0; index < filters.length; index++) {
    if (
      filters[index] == "*" ||
      filename.trim().endsWith("." + filters[index])
    ) {
      return true;
    }
  }
  return false;
};

//Extract information from string - specific to FW / source
const formatFileSerialLine = (acc, line) => {
  const elements = line.split(" ");
  if (elements.length != 2) return acc;
  //TODO: check it is valid file name / size
  //check size is number ?
  //filename ?
  acc.push({ name: elements[0], size: formatFileSizeToString(elements[1]) });
  return acc;
};

//Filter array of flat FS file list based on path
const filterResultFiles = (files, path) => {
  const folderList = [];
  return files.reduce((acc, element) => {
    if (path == "/") {
      if (element.name.indexOf("/") == -1) acc.push(element);
      else {
        //it is directory
        const name = element.name.substring(
          element.name[0] == "/" ? 1 : 0,
          element.name.indexOf("/", 1)
        );
        if (!folderList.includes(name)) {
          folderList.push(name);
          acc.push({ name, size: "-1" });
        }
      }
    } else {
      //it is sub file
      const p = path.substring(1);
      const name = element.name.substring(element.name[0] == "/" ? 1 : 0);
      if (name.startsWith(p + "/")) {
        let newpath = name.substring(p.length + 1);
        //it is file or subfile ?
        if (newpath.indexOf("/") == -1) {
          //file
          acc.push({ name: newpath, size: element.size });
        } else {
          //subdir
          const foldername = newpath.substring(0, newpath.indexOf("/"));
          if (!folderList.includes(foldername)) {
            folderList.push(foldername);
            acc.push({ name: foldername, size: "-1" });
          }
        }
      }
    }

    return acc;
  }, []);
};

//Format status
const formatStatus = (status) => {
  if (status.toUpperCase().indexOf("OK") != -1) return "S126";
  if (status.toUpperCase().indexOf("ERROR") != -1) return "S22";
  return status;
};

const capabilities = {
  FLASH: {
    Process: () => false,
    UseFilters: () => false,
    IsFlatFS: () => false,
    Upload: () => {
      return true;
    },
    Mount: () => {
      return false;
    },
    UploadMultiple: () => {
      return true;
    },
    Download: () => {
      return true;
    },
    DeleteFile: () => {
      return true;
    },
    DeleteDir: () => {
      return true;
    },
    CreateDir: () => {
      return true;
    },
  },

  SD: {
    Process: (path, filename) => {
      return canProcessFile(filename);
    },
    UseFilters: () => true,
    IsFlatFS: () => true,
    Upload: (path, filename, eMsg = false) => {
      if (eMsg) return "E1";
      //TODO
      //check 8.1 if become true
      return false;
    },
    UploadMultiple: () => {
      return false;
    },
    Download: () => {
      return false;
    },
    DeleteFile: () => {
      return true;
    },
    DeleteDir: () => {
      return false;
    },
    CreateDir: () => {
      return false;
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
    upload: (path, filename) => {
      return {
        type: "url",
        url: "files",
        args: { path },
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
      return { type: "cmd", cmd: "M21\nM20" };
    },
    formatResult: (result) => {
      const res = {};
      const files = result.content.reduce((acc, line) => {
        return formatFileSerialLine(acc, line);
      }, []);
      res.files = sortedFilesList(files);
      res.status = formatStatus(result.status);
      return res;
    },
    filterResult: (data, path) => {
      const res = {};
      res.files = sortedFilesList(filterResultFiles(data.files, path));
      res.status = formatStatus(data.status);
      return res;
    },
    play: (path, filename) => {
      return {
        type: "cmd",
        cmd: "M23 " + path + (path == "/" ? "" : "/") + filename + "\nM24",
      };
    },
    delete: (path, filename) => {
      return {
        type: "cmd",
        cmd: "M30 " + path + (path == "/" ? "" : "/") + filename,
      };
    },
  },
  SDEXT: {
    list: (path, filename) => {
      return { type: "cmd", cmd: "M20" };
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

function capability() {
  const [filesystem, cap, ...rest] = arguments;
  if (capabilities[filesystem] && capabilities[filesystem][cap])
    return capabilities[filesystem][cap](...rest);
  console.log("Unknow capability ", cmd, " for ", filesystem);
  return false;
}

function command() {
  const [filesystem, cmd, ...rest] = arguments;
  if (commands[filesystem] && commands[filesystem][cmd])
    return commands[filesystem][cmd](...rest);
  console.log("Unknow command ", cmd, " for ", filesystem);
  return { type: "error" };
}

//everything in one object
const files = {
  command,
  capability,
  supported: supportedFileSystems,
};

export { files };
