/*
 filters.js - ESP3D WebUI Target file

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
import { compareStrings } from "./strings"

//sort files alphabeticaly then folders alphabeticaly
const sortedFilesList = (filesList, alphabeticaly) => {
    //console.log('Sorting files list', alphabeticaly)
    if (typeof filesList == "undefined") return []
    if (typeof alphabeticaly == "undefined") {
        alphabeticaly = true
    }
    if (alphabeticaly) {
        //console.log('Sorting alphabetically')
        filesList.sort(function (a, b) {
            return compareStrings(a.name, b.name)
        })
    }
    filesList.sort(function (a, b) {
        return a.size == -1 && b.size != -1
            ? 1
            : a.size != -1 && b.size == -1
              ? -1
              : 0
    })
    return filesList
}

//Filter array of flat FS file list based on path
const filterResultFiles = (files, path) => {
    const folderList = []
    return files.reduce((acc, element) => {
        if (path == "/") {
            if (element.name.indexOf("/") == -1) acc.push(element)
            else {
                //it is directory
                const name = element.name.substring(
                    element.name[0] == "/" ? 1 : 0,
                    element.name.indexOf("/", 1)
                )
                if (!folderList.includes(name)) {
                    folderList.push(name)
                    acc.push({ name, size: "-1" })
                }
            }
        } else {
            //it is sub file
            const p = path.substring(1)
            const name = element.name.substring(element.name[0] == "/" ? 1 : 0)
            if (name.startsWith(p + "/")) {
                let newpath = name.substring(p.length + 1)
                //it is file or subfile ?
                if (newpath.indexOf("/") == -1 && newpath.length > 0) {
                    //file
                    acc.push({ name: newpath, size: element.size })
                } else {
                    //subdir
                    const foldername = newpath.substring(
                        0,
                        newpath.indexOf("/")
                    )
                    if (
                        !folderList.includes(foldername) &&
                        foldername.length > 0
                    ) {
                        folderList.push(foldername)
                        acc.push({ name: foldername, size: "-1" })
                    }
                }
            }
        }

        return acc
    }, [])
}

export { sortedFilesList, filterResultFiles }
