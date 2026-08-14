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
import { h } from "preact"
import { useUiContextFn } from "../contexts"

//Check if filename is a file to be processed based on extension
const canProcessFile = (filename) => {
    const filters = useUiContextFn.getValue("filesfilter").split(";")
    for (let index = 0; index < filters.length; index++) {
        if (
            filters[index] == "*" ||
            filename.trim().endsWith("." + filters[index])
        ) {
            return true
        }
    }
    return false
}

const normalizeEsp3dFilePath = (filePath) => {
    if (!filePath) {
        return ""
    }

    let normalizedPath = filePath.trim().replaceAll("\\", "/")
    if (!normalizedPath.startsWith("/")) {
        normalizedPath = "/" + normalizedPath
    }

    normalizedPath = normalizedPath.replace(/^\/(sd|fs)(?=\/|$)/i, (_, root) => {
        return "/" + root.toUpperCase()
    })

    return normalizedPath.replace(/\/+/g, "/")
}

const buildEsp700Command = (filePath) => {
    return "[ESP700]" + normalizeEsp3dFilePath(filePath)
}

const buildEsp700CommandFromParts = (rootPath, path, filename) => {
    const basePath = rootPath + path + (path.endsWith("/") ? "" : "/") + filename
    return buildEsp700Command(basePath)
}

export {
    canProcessFile,
    normalizeEsp3dFilePath,
    buildEsp700Command,
    buildEsp700CommandFromParts,
}
