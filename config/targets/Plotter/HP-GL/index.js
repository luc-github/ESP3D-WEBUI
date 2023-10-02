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

const chalk = require("chalk")
const wscolor = chalk.cyan
const expresscolor = chalk.green
const commandcolor = chalk.white
const enableAuthentication = false
let lastconnection = Date.now()
let logindone = false
const sessiontTime = 60000
let countStatus = 0

function getLastconnection() {
    return lastconnection
}

function hasEnabledAuthentication() {
    return enableAuthentication
}

let posx = 0
let posy = 0
let pendown = 0

const commandsQuery = (req, res, SendWS) => {
    let url = req.query.cmd ? req.query.cmd : req.originalUrl
    if (req.query.cmd)
        console.log(commandcolor(`[server]/command params: ${req.query.cmd}`))
    else console.log(commandcolor(`[server]/command : ${url}`))
    if (url.indexOf("PING") != -1) {
        lastconnection = Date.now()
        res.status(200)
        res.send("ok\n")
        console.log(commandcolor(`[server]/command :PING`))
        return
    }

    if (!logindone && enableAuthentication) {
        res.status(401)
        return
    }
    lastconnection = Date.now()

    if (url.indexOf("SIM:") != -1) {
        const response = url.substring(url.indexOf("SIM:") + 4)
        SendWS(response + "\n" + "ok\n")
        res.send("")
        return
    }

    if (url.indexOf("ESP800") != -1) {
        res.json({
            cmd: "800",
            status: "ok",
            data: {
                FWVersion: "3.0.0.a111",
                FWTarget: "hp_gl",
                FWTargetID: "90",
                Setup: "Enabled",
                SDConnection: "direct",
                SerialProtocol: "Socket",
                Authentication: "Disabled",
                WebCommunication: "Synchronous",
                WebSocketIP: "localhost",
                WebSocketPort: "81",
                Hostname: "esp3d",
                WiFiMode: "STA",
                WebUpdate: "Enabled",
                FlashFileSystem: "LittleFS",
                HostPath: "/",
                Time: "none",
            },
        })
        return
    }
    if (url.indexOf("ESP111") != -1) {
        res.send("192.168.1.111")
        return
    }

    if (url.indexOf("ESP401") != -1) {
        const reg_search1 = /P=(?<pos>[^\s]*)/i
        let posres = null
        if ((posres = reg_search1.exec(url)) == null) {
            console.log("Cannot find P= in url")
        }
        res.json({
            cmd: "401",
            status: "ok",
            data: posres.groups.pos ? posres.groups.pos : "Unknown position",
        })
        return
    }

    if (url.indexOf("ESP420") != -1) {
        res.json({
            cmd: "420",
            status: "ok",
            data: [
                { id: "chip id", value: "18569" },
                { id: "CPU Freq", value: "240Mhz" },
                { id: "CPU Temp", value: "54.4C" },
                { id: "free mem", value: "201.86 KB" },
                { id: "SDK", value: "v4.4-beta1-308-gf3e0c8bc41" },
                { id: "flash size", value: "4.00 MB" },
                { id: "size for update", value: "1.25 MB" },
                { id: "FS type", value: "LittleFS" },
                { id: "FS usage", value: "64.00 KB/1.44 MB" },
                { id: "sleep mode", value: "none" },
                { id: "wifi", value: "ON" },
                { id: "hostname", value: "esp3d" },
                { id: "HTTP port", value: "80" },
                { id: "Telnet port", value: "23" },
                { id: "sta", value: "ON" },
                { id: "mac", value: "24:6F:28:4C:89:48" },
                { id: "SSID", value: "luc-ext1" },
                { id: "signal", value: "60%" },
                { id: "phy mode", value: "11n" },
                { id: "channel", value: "3" },
                { id: "ip mode", value: "dhcp" },
                { id: "ip", value: "192.168.2.215" },
                { id: "gw", value: "192.168.2.1" },
                { id: "msk", value: "255.255.255.0" },
                { id: "DNS", value: "192.168.2.1" },
                { id: "ap", value: "OFF" },
                { id: "mac", value: "24:6F:28:4C:89:49" },
                { id: "notification", value: "ON(line)" },
                { id: "targetfw", value: "hp_gl" },
                { id: "FW ver", value: "3.0.0.a111" },
                { id: "FW arch", value: "ESP32" },
            ],
        })
        return
    }
    if (url.indexOf("701") != -1) {
        if (url.indexOf("json") != -1) {
            res.json({
                cmd: "701",
                status: "ok",
                data: {
                    status: "processing",
                    total: "1000",
                    processed: "100",
                    type: "SD",
                    name: "test.gcode",
                    code: 3,
                },
            })
            /*res.json({
                cmd: "701",
                status: "ok",
                data: "no stream",
            })*/
        } else {
            res.send("no stream\n")
        }
        return
    }
    if (url.indexOf("ESP410") != -1) {
        res.json({
            cmd: "410",
            status: "ok",
            data: [{ SSID: "luc-ext1", SIGNAL: "52", IS_PROTECTED: "1" }],
        })
        return
    }

    if (url.indexOf("OA") != -1) {
        SendWS(`${posx},${posy},${pendown}\n`)
        res.send("")
        return
    }

    if (url.indexOf("PR") != -1) {
        const pos_pattern = /PR(?<xrel>[+|-]?\d+),(?<yrel>[+|-]?\d+)/i
        let posres = pos_pattern.exec(url)
        posx = posx + parseInt(posres.groups.xrel)
        posy = posy + parseInt(posres.groups.yrel)
        //SendWS(`${posx},${posy},${pendown}\n`)
        res.send("")
        return
    }

    if (url.indexOf("PD") != -1) {
        pendown = 1
        //SendWS(`${posx},${posy},${pendown}\n`)
        res.send("")
        return
    }
    if (url.indexOf("PU") != -1) {
        pendown = 0
        //SendWS(`${posx},${posy},${pendown}\n`)
        res.send("")
        return
    }

    if (url.indexOf(String.fromCharCode(27) + ".") != -1) {
        //it is esc command ESC.
        //SendWS("EScape command\n")
        res.send("")
        return
    }

    if (url.indexOf("ESP600") != -1) {
        const text = url.substring(8)
        SendWS(text, false)
        res.send("")
        return
    }

    if (url.indexOf("ESP400") != -1) {
        res.json({
            cmd: "400",
            status: "ok",
            data: [
                {
                    F: "network/network",
                    P: "130",
                    T: "S",
                    V: "esp3d",
                    H: "hostname",
                    S: "32",
                    M: "1",
                },
                {
                    F: "network/network",
                    P: "0",
                    T: "B",
                    V: "1",
                    H: "radio mode",
                    O: [{ none: "0" }, { sta: "1" }, { ap: "2" }],
                    R: "1",
                },
                {
                    F: "network/sta",
                    P: "1",
                    T: "S",
                    V: "WIFI_OFFICE_B2G",
                    S: "32",
                    H: "SSID",
                    M: "1",
                    R: "1",
                },
                {
                    F: "network/sta",
                    P: "34",
                    T: "S",
                    N: "1",
                    V: "********",
                    S: "64",
                    H: "pwd",
                    M: "0",
                    MS: "8",
                    R: "1",
                },
                {
                    F: "network/sta",
                    P: "99",
                    T: "B",
                    V: "1",
                    H: "ip mode",
                    O: [{ dhcp: "1" }, { static: "0" }],
                    R: "1",
                },
                {
                    F: "network/sta",
                    P: "100",
                    T: "A",
                    V: "192.168.0.1",
                    H: "ip",
                    R: "1",
                },
                {
                    F: "network/sta",
                    P: "108",
                    T: "A",
                    V: "192.168.0.1",
                    H: "gw",
                    R: "1",
                },
                {
                    F: "network/sta",
                    P: "104",
                    T: "A",
                    V: "255.255.255.0",
                    H: "msk",
                    R: "1",
                },
                {
                    F: "network/ap",
                    P: "218",
                    T: "S",
                    V: "ESP3D",
                    S: "32",
                    H: "SSID",
                    M: "1",
                    R: "1",
                },
                {
                    F: "network/ap",
                    P: "251",
                    T: "S",
                    N: "1",
                    V: "********",
                    S: "64",
                    H: "pwd",
                    M: "0",
                    MS: "8",
                    R: "1",
                },
                {
                    F: "network/ap",
                    P: "316",
                    T: "A",
                    V: "192.168.0.1",
                    H: "ip",
                    R: "1",
                },
                {
                    F: "network/ap",
                    P: "118",
                    T: "B",
                    V: "11",
                    H: "channel",
                    O: [
                        { 1: "1" },
                        { 2: "2" },
                        { 3: "3" },
                        { 4: "4" },
                        { 5: "5" },
                        { 6: "6" },
                        { 7: "7" },
                        { 8: "8" },
                        { 9: "9" },
                        { 10: "10" },
                        { 11: "11" },
                        { 12: "12" },
                        { 13: "13" },
                        { 14: "14" },
                    ],
                    R: "1",
                },
                {
                    F: "service/http",
                    P: "328",
                    T: "B",
                    V: "1",
                    H: "enable",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service/http",
                    P: "121",
                    T: "I",
                    V: "80",
                    H: "port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service/telnetp",
                    P: "329",
                    T: "B",
                    V: "1",
                    H: "enable",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service/telnetp",
                    P: "125",
                    T: "I",
                    V: "23",
                    H: "port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service/ftp",
                    P: "1021",
                    T: "B",
                    V: "1",
                    H: "enable",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service/ftp",
                    P: "1009",
                    T: "I",
                    V: "21",
                    H: "control port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service/ftp",
                    P: "1013",
                    T: "I",
                    V: "20",
                    H: "active port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service/ftp",
                    P: "1017",
                    T: "I",
                    V: "55600",
                    H: "passive port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service/notification",
                    P: "1004",
                    T: "B",
                    V: "1",
                    H: "auto notif",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service/notification",
                    P: "116",
                    T: "B",
                    V: "0",
                    H: "notification",
                    O: [
                        { none: "0" },
                        { pushover: "1" },
                        { email: "2" },
                        { line: "3" },
                    ],
                },
                {
                    F: "service/notification",
                    P: "332",
                    T: "S",
                    V: "********",
                    S: "63",
                    H: "t1",
                    M: "0",
                },
                {
                    F: "service/notification",
                    P: "396",
                    T: "S",
                    V: "********",
                    S: "63",
                    H: "t2",
                    M: "0",
                },
                {
                    F: "service/notification",
                    P: "855",
                    T: "S",
                    V: " ",
                    S: "127",
                    H: "ts",
                    M: "0",
                },
                {
                    F: "system/system",
                    P: "461",
                    T: "B",
                    V: "90",
                    H: "targetfw",
                    O: [
                        { hp_gl: "90" },
                        { repetier: "50" },
                        { marlin: "20" },
                        { smoothieware: "40" },
                        { grbl: "10" },
                        { unknown: "0" },
                    ],
                },
                {
                    F: "system/system",
                    P: "112",
                    T: "I",
                    V: "115200",
                    H: "baud",
                    O: [
                        { 9600: "9600" },
                        { 19200: "19200" },
                        { 38400: "38400" },
                        { 57600: "57600" },
                        { 74880: "74880" },
                        { 115200: "115200" },
                        { 230400: "230400" },
                        { 250000: "250000" },
                        { 500000: "500000" },
                        { 921600: "921600" },
                    ],
                },
                {
                    F: "system/system",
                    P: "320",
                    T: "I",
                    V: "10000",
                    H: "bootdelay",
                    S: "40000",
                    M: "0",
                },
            ],
        })
        return
    }
    SendWS("ok\n")
    res.send("")
}

const loginURI = (req, res) => {
    if (req.body.DISCONNECT == "YES") {
        res.status(401)
        logindone = false
    } else if (req.body.USER == "admin" && req.body.PASSWORD == "admin") {
        logindone = true
        lastconnection = Date.now()
    } else {
        res.status(401)
        logindone = false
    }
    res.send("")
}

const configURI = (req, res) => {
    if (!logindone && enableAuthentication) {
        res.status(401)
        return
    }
    lastconnection = Date.now()
    res.send(
        "chip id: 56398\nCPU Freq: 240 Mhz<br/>" +
            "CPU Temp: 58.3 C<br/>" +
            "free mem: 212.36 KB<br/>" +
            "SDK: v3.2.3-14-gd3e562907<br/>" +
            "flash size: 4.00 MB<br/>" +
            "size for update: 1.87 MB<br/>" +
            "FS type: LittleFS<br/>" +
            "FS usage: 104.00 KB/192.00 KB<br/>" +
            "baud: 115200<br/>" +
            "sleep mode: none<br/>" +
            "wifi: ON<br/>" +
            "hostname: esp3d<br/>" +
            "HTTP port: 80<br/>" +
            "Telnet port: 23<br/>" +
            "WebDav port: 8383<br/>" +
            "sta: ON<br/>" +
            "mac: 80:7D:3A:C4:4E:DC<br/>" +
            "SSID: WIFI_OFFICE_A2G<br/>" +
            "signal: 100 %<br/>" +
            "phy mode: 11n<br/>" +
            "channel: 11<br/>" +
            "ip mode: dhcp<br/>" +
            "ip: 192.168.1.61<br/>" +
            "gw: 192.168.1.1<br/>" +
            "msk: 255.255.255.0<br/>" +
            "DNS: 192.168.1.1<br/>" +
            "ap: OFF<br/>" +
            "mac: 80:7D:3A:C4:4E:DD<br/>" +
            "serial: ON<br/>" +
            "notification: OFF<br/>" +
            "Target Fw: grbl<br/>" +
            "FW ver: 3.0.0.a91<br/>" +
            "FW arch: ESP32 "
    )
}

module.exports = {
    commandsQuery,
    configURI,
    loginURI,
    getLastconnection,
    hasEnabledAuthentication,
}
