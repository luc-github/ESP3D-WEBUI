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

    if (req.query.cmd && req.query.cmd == "?") {
        countStatus++
        if (countStatus == 1)
            SendWS(
                "<Idle|MPos:0.000,0.000,0.000,1.000,1.000|FS:0,0|WCO:0.000,0.000,0.000,1.000,1.000>\n"
            )
        if (countStatus == 2)
            SendWS(
                "<Idle|MPos:0.000,0.000,0.000,1.000,1.000|FS:0,0|Ov:100,100,100>\n"
            )
        if (countStatus > 2)
            SendWS("<Idle|MPos:0.000,0.000,0.000,1.000,1.000|FS:0,0>\n")
        if (countStatus == 10) countStatus = 0
        res.send("")
        return
    }

    if (url.indexOf("ESP800") != -1) {
        res.json({
            cmd: "800",
            status: "ok",
            data: {
                FWVersion: "3.0.0.a111",
                FWTarget: "grbl",
                FWTargetID: "10",
                Setup: "Enabled",
                SDConnection: "shared",
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
                CameraID: "4",
                CameraName: "ESP32 Cam",
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
                { id: "targetfw", value: "grbl" },
                { id: "FW ver", value: "3.0.0.a111" },
                { id: "FW arch", value: "ESP32" },
            ],
        })
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

    if (url.indexOf("$$") != -1) {
        SendWS(
            "$0=3\n" +
                "$1=250\n" +
                "$2=0\n" +
                "$3=0\n" +
                "$4=0\n" +
                "$5=1\n" +
                "$6=0\n" +
                "$10=1\n" +
                "$11=0.010\n" +
                "$12=0.002\n" +
                "$13=0\n" +
                "$20=0\n" +
                "$21=0\n" +
                "$22=0\n" +
                "$23=3\n" +
                "$24=200.000\n" +
                "$25=2000.000\n" +
                "$26=250\n" +
                "$27=1.000\n" +
                "$30=1000.000\n" +
                "$31=0.000\n" +
                "$32=0\n" +
                "$100=100.000\n" +
                "$101=100.000\n" +
                "$102=100.000\n" +
                "$103=100.000\n" +
                "$104=100.000\n" +
                "$105=100.000\n" +
                "$110=1000.000\n" +
                "$111=1000.000\n" +
                "$112=1000.000\n" +
                "$113=1000.000\n" +
                "$114=1000.000\n" +
                "$115=1000.000\n" +
                "$120=200.000\n" +
                "$121=200.000\n" +
                "$122=200.000\n" +
                "$123=200.000\n" +
                "$124=200.000\n" +
                "$125=200.000\n" +
                "$130=300.000\n" +
                "$131=300.000\n" +
                "$132=300.000\n" +
                "$133=300.000\n" +
                "$134=300.000\n" +
                "$135=300.000\n" +
                "ok\n"
        )
        res.send("")
        return
    }

    if (url.indexOf("ESP600") != -1) {
        const text = url.substring(8)
        SendWS(text, false)
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
                    P: "1208",
                    T: "B",
                    V: "1",
                    H: "enable",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service/ftp",
                    P: "1196",
                    T: "I",
                    V: "21",
                    H: "control port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service/ftp",
                    P: "1200",
                    T: "I",
                    V: "20",
                    H: "active port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service/ftp",
                    P: "1204",
                    T: "I",
                    V: "55600",
                    H: "passive port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service/notification",
                    P: "1191",
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
                    S: "250",
                    H: "t1",
                    M: "0",
                },
                {
                    F: "service/notification",
                    P: "583",
                    T: "S",
                    V: "********",
                    S: "63",
                    H: "t2",
                    M: "0",
                },
                {
                    F: "service/notification",
                    P: "1042",
                    T: "S",
                    V: " ",
                    S: "127",
                    H: "ts",
                    M: "0",
                },
                {
                    F: "system/system",
                    P: "648",
                    T: "B",
                    V: "10",
                    H: "targetfw",
                    O: [
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
