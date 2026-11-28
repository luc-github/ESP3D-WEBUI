/*
 MarlinMount-source-factory.js - ESP3D WebUI shared Target file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.
 LGPL v2.1

 Factory for Marlin-mounted storage sources (LCD SD / LCD USB).
*/
import { SD } from "./SD-source"
import { useUiContextFn } from "../../../contexts"
import {
    formatFileSizeToString,
    sortedFilesList,
    formatStatus,
    filterResultFiles,
} from "../../../components/Helpers"

const formatMountFileLines = (lines) => {
    const files = []

    for (let i = 0; i < lines.length; i++) {
        const text = lines[i]?.trim()
        if (
            !text ||
            text.startsWith("Begin file list") ||
            text.startsWith("End file list") ||
            text.startsWith("echo:") ||
            text.startsWith("ok")
        ) continue

        const combinedMatch = text.match(/^([^\s]*~\d+[^\s]*)\s+(\d+)\s+(.+)$/i)
        if (combinedMatch) {
            const longName = combinedMatch[3].replace(/^\//, "").trim()
            if (longName) {
                files.push({ name: longName, size: formatFileSizeToString(combinedMatch[2]) })
                continue
            }
        }

        const shortMatch = text.match(/^([^\s]*~\d+[^\s]*)\s+(\d+)\s*$/i)
        if (shortMatch) {
            const nextText = lines[i + 1]?.trim().replace(/^\//, "")
            if (nextText && !/^(echo:|ok|Begin file list|End file list)/i.test(nextText)) {
                const nextMatch = nextText.match(/^(.*?)\s+(\d+)\s*$/)
                const longName = nextMatch ? nextMatch[1].trim() : nextText
                if (longName && !/~\d+/i.test(longName)) {
                    files.push({ name: longName, size: formatFileSizeToString(shortMatch[2]) })
                    i++
                    continue
                }
            }
        }

        const match = text.match(/^(.*?)\s+(\d+)\s*$/)
        if (match) {
            files.push({
                name: match[1].replace(/^\//, ""),
                size: formatFileSizeToString(match[2]),
            })
        }
    }

    return files
}

const makeMarlinMountSource = ({ sortKey, listCommand, playCommand, deleteCommand }) => {
    const source = {
        ...SD,
        capabilities: { ...SD.capabilities },
        commands: { ...SD.commands },
        responseSteps: { ...SD.responseSteps },
    }

    source.commands.list = () => ({
        type: "cmd",
        cmd: useUiContextFn.getValue(listCommand),
    })
    source.commands.play = (path, filename) => {
        const spath = (path + (path == "/" ? "" : "/") + filename).replaceAll("//", "/")
        return {
            type: "cmd",
            cmd: useUiContextFn.getValue(playCommand).replace("#", spath),
        }
    }
    source.commands.delete = (path, filename) => {
        const spath = (path + (path == "/" ? "" : "/") + filename).replaceAll("//", "/")
        return {
            type: "cmd",
            cmd: useUiContextFn.getValue(deleteCommand).replace("#", spath),
        }
    }
    source.commands.formatResult = (result) => {
        const files = formatMountFileLines(result.content)
        const isSorted = useUiContextFn.getValue(sortKey)
        return {
            files: isSorted ? sortedFilesList(files, false) : files,
            status: formatStatus(result.status),
        }
    }
    source.commands.filterResult = (data, path) => {
        const filtered = filterResultFiles(data.files, path)
        const isSorted = useUiContextFn.getValue(sortKey)
        return {
            files: isSorted ? sortedFilesList(filtered, false) : filtered,
            status: formatStatus(data.status),
        }
    }

    return source
}

const LCDSD = makeMarlinMountSource({
    sortKey: "sort_lcdsd_files",
    listCommand: "lcdsdlistcmd",
    playCommand: "lcdsdplaycmd",
    deleteCommand: "lcdsddeletecmd",
})

const USB = makeMarlinMountSource({
    sortKey: "sort_usb_files",
    listCommand: "usblistcmd",
    playCommand: "usbplaycmd",
    deleteCommand: "usbdeletecmd",
})

export { makeMarlinMountSource, LCDSD, USB }
