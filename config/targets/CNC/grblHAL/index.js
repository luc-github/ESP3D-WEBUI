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
let change = false
const emulationESP400 = false

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
                "<Idle|WPos:0.000,0.000,0.000,1.000,1.000|FS:0,0|WCO:0.000,0.000,0.000,1.000,1.000>\n"
            )
        if (countStatus == 2)
            SendWS(
                "<Run|WPos:0.000,0.000,0.000,1.000,1.000|SD:0.1,pcb_zebra.gcode||FS:0,0|Ov:100,100,100|Pn:XYZV>\n"
            )
        if (countStatus > 2 && countStatus < 8)
            SendWS(
                "<Run|WPos:0.000,0.000,0.000,1.000,1.000|SD:0.2,pcb_zebra.gcode|FS:0,0|A:S|Pn:P>\n"
            )
        if (countStatus >= 8)
            SendWS(
                "<Run|WPos:0.000,0.000,0.000,1.000,1.000|SD:100.0,pcb_zebra.gcode|FS:0,0|A:S|Pn:P>\n"
            )
        if (countStatus == 10) countStatus = 0

        res.send("")
        return
    }

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
                FWTarget: "grblhal",
                FWTargetID: "80",
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
                HostPath: "/www",
                Time: "none",
                Axisletters: "XYZUV",
            },
        })
        return
    }
    if (url.indexOf("ESP111") != -1) {
        res.send("192.168.1.111")
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

    if (url.indexOf("ESP410") != -1) {
        res.json({
            cmd: "410",
            status: "ok",
            data: [{ SSID: "luc-ext1", SIGNAL: "52", IS_PROTECTED: "1" }],
        })
        return
    }

    if (url.indexOf("$G") != -1) {
        change = !change
        //SendWS("[GC:G0 G54 G17 G21 G90 G94 M5 M9 T0 F0.0 S0]\n")
        if (change) {
            SendWS(
                "[GC:G0 G54 G17 G21 G90 G92 G94 G49 G98 G51:5 M5 M6 M9 T0 F0 S0.]\n"
            )
        } else {
            SendWS("[GC:G0 G54 G17 G21 G90 G94 G49 G98 M56 M5 M9 T0 F0 S0.]\n")
        }

        res.send("")
        return
    }

    if (url.indexOf("$I") != -1) {
        SendWS("[VER:1.1f.20170801:]\n" + "[OPT:VZHTL,15,128]\n")
        res.send("")
        return
    }

    if (url.indexOf("\x18") != -1) {
        SendWS("Grbl 1.1f ['$' for help]\n")
        res.send("")
        return
    }

    if (url.indexOf("$#") != -1) {
        SendWS(
            "[G54:4.000,0.000,0.000]\n" +
                "[G55:4.000,6.000,7.000]\n" +
                "[G56:0.000,0.000,0.000]\n" +
                "[G57:0.000,0.000,0.000]\n" +
                "[G58:0.000,0.000,0.000]\n" +
                "[G59:0.000,0.000,0.000]\n" +
                "[G28:1.000,2.000,0.000]\n" +
                "[G30:4.000,6.000,0.000]\n" +
                "[G92:0.000,0.000,0.000]\n" +
                "[TLO:0.000]\n" +
                "[PRB:0.000,0.000,0.000:1]\n"
        )
        res.send("")
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
        res.send("")
        return
    }

    /* grblHAL without emulation*/
    if (url.indexOf("ESP400") != -1 && !emulationESP400) {
        res.json({
            cmd: "400",
            status: "ok",
            data: [
                {
                    F: "General/General",
                    P: "10",
                    T: "M",
                    V: "511",
                    H: "Status report options",
                    O: [
                        {
                            "Position in machine coordinate": "0",
                        },
                        {
                            "Buffer state": "1",
                        },
                        {
                            "Line numbers": "2",
                        },
                        {
                            "Feed & speed": "3",
                        },
                        {
                            "Pin state": "4",
                        },
                        {
                            "Work coordinate offset": "5",
                        },
                        {
                            Overrides: "6",
                        },
                        {
                            "Probe coordinates": "7",
                        },
                        {
                            "Buffer sync on WCO change": "8",
                        },
                        {
                            "Parser state": "9",
                        },
                        {
                            "Alarm substatus": "10",
                        },
                        {
                            "Run substatus": "11",
                        },
                    ],
                },
                {
                    F: "General/General",
                    P: "11",
                    T: "F",
                    V: "0.010",
                    H: "Junction deviation",
                    U: "mm",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "General/General",
                    P: "12",
                    T: "F",
                    V: "0.002",
                    H: "Arc tolerance",
                    U: "mm",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "General/General",
                    P: "13#0",
                    T: "B",
                    V: "0",
                    H: "Report in inches",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "General/General",
                    P: "28",
                    T: "F",
                    V: "0.100",
                    H: "G73 Retract distance",
                    U: "mm",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "General/General",
                    P: "32",
                    T: "B",
                    V: "0",
                    H: "Mode of operation",
                    O: [
                        {
                            Normal: "0",
                        },
                        {
                            "Laser mode": "1",
                        },
                        {
                            "Lathe mode": "2",
                        },
                    ],
                },
                {
                    F: "General/General",
                    P: "39#0",
                    T: "B",
                    V: "1",
                    H: "Enable legacy RT commands",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "General/General",
                    P: "62#0",
                    T: "B",
                    V: "0",
                    H: "Sleep enable",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "General/General",
                    P: "63",
                    T: "M",
                    V: "2",
                    H: "Feed hold actions",
                    O: [
                        {
                            "Disable laser during hold": "0",
                        },
                        {
                            "Restore spindle and coolant state on resume": "1",
                        },
                    ],
                },
                {
                    F: "General/General",
                    P: "64#0",
                    T: "B",
                    V: "0",
                    H: "Force init alarm",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "General/General",
                    P: "384#0",
                    T: "B",
                    V: "0",
                    H: "Disable G92 persistence",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "General/General",
                    P: "396",
                    T: "I",
                    V: "30",
                    H: "WebUI timeout",
                    U: "minutes",
                    M: "0",
                    S: "999",
                },
                {
                    F: "General/General",
                    P: "397",
                    T: "I",
                    V: "3000",
                    H: "WebUI auto report interval",
                    U: "milliseconds",
                    R: "1",
                    M: "0",
                    S: "9999",
                },
                {
                    F: "Control signals/Control signals",
                    P: "14",
                    T: "M",
                    V: "0",
                    H: "Invert control pins",
                    O: [
                        {
                            Reset: "0",
                        },
                        {
                            "Feed hold": "1",
                        },
                        {
                            "Cycle start": "2",
                        },
                    ],
                },
                {
                    F: "Control signals/Control signals",
                    P: "17",
                    T: "M",
                    V: "0",
                    H: "Pullup disable control pins",
                    O: [
                        {
                            Reset: "0",
                        },
                        {
                            "Feed hold": "1",
                        },
                        {
                            "Cycle start": "2",
                        },
                    ],
                },
                {
                    F: "Limits/Limits",
                    P: "5",
                    T: "M",
                    V: "0",
                    H: "Invert limit pins",
                    O: [
                        {
                            X: "0",
                        },
                        {
                            Y: "1",
                        },
                        {
                            Z: "2",
                        },
                    ],
                },
                {
                    F: "Limits/Limits",
                    P: "18",
                    T: "M",
                    V: "0",
                    H: "Pullup disable limit pins",
                    O: [
                        {
                            X: "0",
                        },
                        {
                            Y: "1",
                        },
                        {
                            Z: "2",
                        },
                    ],
                },
                {
                    F: "Limits/Limits",
                    P: "20#0",
                    T: "B",
                    V: "0",
                    H: "Soft limits enable",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "Limits/Limits",
                    P: "21",
                    T: "X",
                    V: "0",
                    H: "Hard limits enable",
                    O: [
                        {
                            Enable: "0",
                        },
                        {
                            "Strict mode": "1",
                        },
                    ],
                },
                {
                    F: "Coolant/Coolant",
                    P: "15",
                    T: "M",
                    V: "0",
                    H: "Invert coolant pins",
                    O: [
                        {
                            Flood: "0",
                        },
                        {
                            Mist: "1",
                        },
                    ],
                },
                {
                    F: "Spindle/Spindle",
                    P: "9",
                    T: "X",
                    V: "1",
                    H: "PWM Spindle",
                    O: [
                        {
                            Enable: "0",
                        },
                        {
                            "RPM controls spindle enable signal": "1",
                        },
                    ],
                },
                {
                    F: "Spindle/Spindle",
                    P: "16",
                    T: "M",
                    V: "0",
                    H: "Invert spindle signals",
                    O: [
                        {
                            "Spindle enable": "0",
                        },
                        {
                            PWM: "2",
                        },
                    ],
                },
                {
                    F: "Spindle/Spindle",
                    P: "30",
                    T: "F",
                    V: "1000.000",
                    H: "Maximum spindle speed",
                    U: "RPM",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "Spindle/Spindle",
                    P: "31",
                    T: "F",
                    V: "0.000",
                    H: "Minimum spindle speed",
                    U: "RPM",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "Spindle/Spindle",
                    P: "33",
                    T: "F",
                    V: "5000.0",
                    H: "Spindle PWM frequency",
                    U: "Hz",
                    E: "0",
                    M: "0",
                    S: "999999",
                },
                {
                    F: "Spindle/Spindle",
                    P: "34",
                    T: "F",
                    V: "0.0",
                    H: "Spindle PWM off value",
                    U: "percent",
                    E: "1",
                    M: "0",
                    S: "100",
                },
                {
                    F: "Spindle/Spindle",
                    P: "35",
                    T: "F",
                    V: "0.0",
                    H: "Spindle PWM min value",
                    U: "percent",
                    E: "1",
                    M: "0",
                    S: "100",
                },
                {
                    F: "Spindle/Spindle",
                    P: "36",
                    T: "F",
                    V: "100.0",
                    H: "Spindle PWM max value",
                    U: "percent",
                    E: "1",
                    M: "0",
                    S: "100",
                },
                {
                    F: "Tool change/Tool change",
                    P: "341",
                    T: "B",
                    V: "0",
                    H: "Tool change mode",
                    O: [
                        {
                            Normal: "0",
                        },
                        {
                            "Manual touch off": "1",
                        },
                        {
                            "Manual touch off @ G59.3": "2",
                        },
                        {
                            "Automatic touch off @ G59.3": "3",
                        },
                        {
                            "Ignore M6": "4",
                        },
                    ],
                },
                {
                    F: "Tool change/Tool change",
                    P: "342",
                    T: "F",
                    V: "30.0",
                    H: "Tool change probing distance",
                    U: "mm",
                    E: "1",
                    M: "0",
                    S: "999999.9",
                },
                {
                    F: "Tool change/Tool change",
                    P: "343",
                    T: "F",
                    V: "25.0",
                    H: "Tool change locate feed rate",
                    U: "mm/min",
                    E: "1",
                    M: "0",
                    S: "999999.9",
                },
                {
                    F: "Tool change/Tool change",
                    P: "344",
                    T: "F",
                    V: "200.0",
                    H: "Tool change search seek rate",
                    U: "mm/min",
                    E: "1",
                    M: "0",
                    S: "999999.9",
                },
                {
                    F: "Tool change/Tool change",
                    P: "345",
                    T: "F",
                    V: "100.0",
                    H: "Tool change probe pull-off rate",
                    U: "mm/min",
                    E: "1",
                    M: "0",
                    S: "999999.9",
                },
                {
                    F: "Homing/Homing",
                    P: "22",
                    T: "X",
                    V: "0",
                    H: "Homing cycle",
                    O: [
                        {
                            Enable: "0",
                        },
                        {
                            "Enable single axis commands": "1",
                        },
                        {
                            "Homing on startup required": "2",
                        },
                        {
                            "Set machine origin to 0": "3",
                        },
                        {
                            "Two switches shares one input pin": "4",
                        },
                        {
                            "Allow manual": "5",
                        },
                        {
                            "Override locks": "6",
                        },
                        {
                            "Keep homed status on reset": "7",
                        },
                    ],
                },
                {
                    F: "Homing/Homing",
                    P: "23",
                    T: "M",
                    V: "0",
                    H: "Homing direction invert",
                    O: [
                        {
                            X: "0",
                        },
                        {
                            Y: "1",
                        },
                        {
                            Z: "2",
                        },
                    ],
                },
                {
                    F: "Homing/Homing",
                    P: "24",
                    T: "F",
                    V: "25.0",
                    H: "Homing locate feed rate",
                    U: "mm/min",
                    E: "1",
                    M: "0",
                    S: "999999.9",
                },
                {
                    F: "Homing/Homing",
                    P: "25",
                    T: "F",
                    V: "500.0",
                    H: "Homing search seek rate",
                    U: "mm/min",
                    E: "1",
                    M: "0",
                    S: "999999.9",
                },
                {
                    F: "Homing/Homing",
                    P: "26",
                    T: "I",
                    V: "250",
                    H: "Homing switch debounce delay",
                    U: "milliseconds",
                    M: "0",
                    S: "999",
                },
                {
                    F: "Homing/Homing",
                    P: "27",
                    T: "F",
                    V: "1.000",
                    H: "Homing switch pull-off distance",
                    U: "mm",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "Homing/Homing",
                    P: "43",
                    T: "I",
                    V: "1",
                    H: "Homing passes",
                    M: "1",
                    S: "128",
                },
                {
                    F: "Homing/Homing",
                    P: "44",
                    T: "M",
                    V: "4",
                    H: "Axes homing, first pass",
                    O: [
                        {
                            X: "0",
                        },
                        {
                            Y: "1",
                        },
                        {
                            Z: "2",
                        },
                    ],
                },
                {
                    F: "Homing/Homing",
                    P: "45",
                    T: "M",
                    V: "3",
                    H: "Axes homing, second pass",
                    O: [
                        {
                            X: "0",
                        },
                        {
                            Y: "1",
                        },
                        {
                            Z: "2",
                        },
                    ],
                },
                {
                    F: "Homing/Homing",
                    P: "46",
                    T: "M",
                    V: "0",
                    H: "Axes homing, third pass",
                    O: [
                        {
                            X: "0",
                        },
                        {
                            Y: "1",
                        },
                        {
                            Z: "2",
                        },
                    ],
                },
                {
                    F: "Probing/Probing",
                    P: "6#0",
                    T: "B",
                    V: "0",
                    H: "Invert probe pin",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "Probing/Probing",
                    P: "19#0",
                    T: "B",
                    V: "0",
                    H: "Pullup disable probe pin",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "Probing/Probing",
                    P: "65#0",
                    T: "B",
                    V: "0",
                    H: "Probing feed override",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "Jogging/Jogging",
                    P: "40#0",
                    T: "B",
                    V: "0",
                    H: "Limit jog commands",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "Networking/Networking",
                    P: "70",
                    T: "M",
                    V: "7",
                    H: "Network Services",
                    R: "1",
                    O: [
                        {
                            Telnet: "0",
                        },
                        {
                            Websocket: "1",
                        },
                        {
                            HTTP: "2",
                        },
                        {
                            FTP: "3",
                        },
                        {
                            WebDAV: "7",
                        },
                    ],
                },
                {
                    F: "Networking/Networking",
                    P: "300",
                    T: "S",
                    V: "Grbl",
                    H: "Hostname",
                    R: "1",
                    S: "64",
                },
                {
                    F: "Networking/Networking",
                    P: "302",
                    T: "A",
                    V: "192.168.5.1",
                    H: "IP Address",
                    R: "1",
                },
                {
                    F: "Networking/Networking",
                    P: "303",
                    T: "A",
                    V: "192.168.5.1",
                    H: "Gateway",
                    R: "1",
                },
                {
                    F: "Networking/Networking",
                    P: "304",
                    T: "A",
                    V: "255.255.255.0",
                    H: "Netmask",
                    R: "1",
                },
                {
                    F: "Networking/Networking",
                    P: "305",
                    T: "I",
                    V: "23",
                    H: "Telnet port",
                    R: "1",
                    M: "1",
                    S: "65535",
                },
                {
                    F: "Networking/Networking",
                    P: "306",
                    T: "I",
                    V: "80",
                    H: "HTTP port",
                    R: "1",
                    M: "1",
                    S: "65535",
                },
                {
                    F: "Networking/Networking",
                    P: "307",
                    T: "I",
                    V: "81",
                    H: "Websocket port",
                    R: "1",
                    M: "1",
                    S: "65535",
                },
                {
                    F: "Networking/Networking",
                    P: "310",
                    T: "S",
                    V: "GrblAP",
                    H: "Hostname (AP)",
                    R: "1",
                    S: "64",
                },
                {
                    F: "Networking/Networking",
                    P: "312",
                    T: "A",
                    V: "192.168.5.1",
                    H: "IP Address (AP)",
                    R: "1",
                },
                {
                    F: "Networking/Networking",
                    P: "313",
                    T: "A",
                    V: "192.168.5.1",
                    H: "Gateway (AP)",
                    R: "1",
                },
                {
                    F: "Networking/Networking",
                    P: "314",
                    T: "A",
                    V: "255.255.255.0",
                    H: "Netmask (AP)",
                    R: "1",
                },
                {
                    F: "WiFi/WiFi",
                    P: "73",
                    T: "B",
                    V: "1",
                    H: "WiFi Mode",
                    O: [
                        {
                            Off: "0",
                        },
                        {
                            Station: "1",
                        },
                        {
                            "Access Point": "2",
                        },
                        {
                            "Access Point/Station": "3",
                        },
                    ],
                },
                {
                    F: "WiFi/WiFi",
                    P: "74",
                    T: "S",
                    V: "luc-ext1",
                    H: "WiFi Station (STA) SSID",
                    S: "64",
                },
                {
                    F: "WiFi/WiFi",
                    P: "75",
                    T: "S",
                    V: "********",
                    H: "WiFi Station (STA) Password",
                    S: "32",
                },
                {
                    F: "WiFi/WiFi",
                    P: "76",
                    T: "S",
                    V: "GRBL",
                    H: "WiFi Access Point (AP) SSID",
                    S: "64",
                },
                {
                    F: "WiFi/WiFi",
                    P: "77",
                    T: "S",
                    V: "********",
                    H: "WiFi Access Point (AP) Password",
                    S: "32",
                },
                {
                    F: "Stepper/Stepper",
                    P: "0",
                    T: "F",
                    V: "10.0",
                    H: "Step pulse time",
                    U: "microseconds",
                    E: "1",
                    M: "2.0",
                    S: "99.9",
                },
                {
                    F: "Stepper/Stepper",
                    P: "1",
                    T: "I",
                    V: "25",
                    H: "Step idle delay",
                    U: "milliseconds",
                    M: "0",
                    S: "65535",
                },
                {
                    F: "Stepper/Stepper",
                    P: "2",
                    T: "M",
                    V: "0",
                    H: "Step pulse invert",
                    O: [
                        {
                            X: "0",
                        },
                        {
                            Y: "1",
                        },
                        {
                            Z: "2",
                        },
                    ],
                },
                {
                    F: "Stepper/Stepper",
                    P: "3",
                    T: "M",
                    V: "0",
                    H: "Step direction invert",
                    O: [
                        {
                            X: "0",
                        },
                        {
                            Y: "1",
                        },
                        {
                            Z: "2",
                        },
                    ],
                },
                {
                    F: "Stepper/Stepper",
                    P: "4",
                    T: "M",
                    V: "7",
                    H: "Invert stepper enable pin(s)",
                    O: [
                        {
                            X: "0",
                        },
                        {
                            Y: "1",
                        },
                        {
                            Z: "2",
                        },
                    ],
                },
                {
                    F: "Stepper/Stepper",
                    P: "29",
                    T: "F",
                    V: "0.0",
                    H: "Pulse delay",
                    U: "microseconds",
                    E: "1",
                    M: "0",
                    S: "10",
                },
                {
                    F: "Stepper/Stepper",
                    P: "37",
                    T: "M",
                    V: "0",
                    H: "Steppers deenergize",
                    O: [
                        {
                            X: "0",
                        },
                        {
                            Y: "1",
                        },
                        {
                            Z: "2",
                        },
                    ],
                },
                {
                    F: "X-axis/X-axis",
                    P: "100",
                    T: "F",
                    V: "250.000",
                    H: "axis travel resolution",
                    U: "step/mm",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "Y-axis/Y-axis",
                    P: "100",
                    T: "F",
                    V: "250.000",
                    H: "axis travel resolution",
                    U: "step/mm",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "Z-axis/Z-axis",
                    P: "100",
                    T: "F",
                    V: "250.000",
                    H: "axis travel resolution",
                    U: "step/mm",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "X-axis/X-axis",
                    P: "110",
                    T: "F",
                    V: "500.000",
                    H: "axis maximum rate",
                    U: "mm/min",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "Y-axis/Y-axis",
                    P: "110",
                    T: "F",
                    V: "500.000",
                    H: "axis maximum rate",
                    U: "mm/min",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "Z-axis/Z-axis",
                    P: "110",
                    T: "F",
                    V: "500.000",
                    H: "axis maximum rate",
                    U: "mm/min",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "X-axis/X-axis",
                    P: "120",
                    T: "F",
                    V: "10.000",
                    H: "axis acceleration",
                    U: "mm/sec^2",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "Y-axis/Y-axis",
                    P: "120",
                    T: "F",
                    V: "10.000",
                    H: "axis acceleration",
                    U: "mm/sec^2",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "Z-axis/Z-axis",
                    P: "120",
                    T: "F",
                    V: "10.000",
                    H: "axis acceleration",
                    U: "mm/sec^2",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "X-axis/X-axis",
                    P: "130",
                    T: "F",
                    V: "200.000",
                    H: "axis maximum travel",
                    U: "mm",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "Y-axis/Y-axis",
                    P: "130",
                    T: "F",
                    V: "200.000",
                    H: "axis maximum travel",
                    U: "mm",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
                {
                    F: "Z-axis/Z-axis",
                    P: "130",
                    T: "F",
                    V: "200.000",
                    H: "axis maximum travel",
                    U: "mm",
                    E: "3",
                    M: "0",
                    S: "999999.999",
                },
            ],
        })
        return
    }

    /* grblHAL with emulation
    if (url.indexOf("ESP400") != -1 && emulationESP400) {
        res.json({
            cmd: "400",
            status: "ok",
            data: [
                {
                    F: "Stepper/Stepper",
                    P: "0",
                    T: "F",
                    V: "10.0",
                    H: "Step pulse time",
                    M: "2.0",
                },
                {
                    F: "Stepper/Stepper",
                    P: "1",
                    T: "I",
                    V: "25",
                    H: "Step idle delay",
                    S: "65535",
                },
                {
                    F: "Step pulse invert/Stepper",
                    P: "2#0",
                    T: "B",
                    V: "0",
                    H: "X",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Step pulse invert/Stepper",
                    P: "2#1",
                    T: "B",
                    V: "0",
                    H: "Y",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Step pulse invert/Stepper",
                    P: "2#2",
                    T: "B",
                    V: "0",
                    H: "Z",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Step direction invert/Stepper",
                    P: "3#0",
                    T: "B",
                    V: "0",
                    H: "X",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Step direction invert/Stepper",
                    P: "3#1",
                    T: "B",
                    V: "0",
                    H: "Y",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Step direction invert/Stepper",
                    P: "3#2",
                    T: "B",
                    V: "0",
                    H: "Z",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Invert stepper enable pin(s)/Stepper",
                    P: "4#0",
                    T: "B",
                    V: "1",
                    H: "X",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Invert stepper enable pin(s)/Stepper",
                    P: "4#1",
                    T: "B",
                    V: "1",
                    H: "Y",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Invert stepper enable pin(s)/Stepper",
                    P: "4#2",
                    T: "B",
                    V: "1",
                    H: "Z",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Invert limit pins/Limits",
                    P: "5#0",
                    T: "B",
                    V: "0",
                    H: "X",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Invert limit pins/Limits",
                    P: "5#1",
                    T: "B",
                    V: "0",
                    H: "Y",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Invert limit pins/Limits",
                    P: "5#2",
                    T: "B",
                    V: "0",
                    H: "Z",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Probing/Probing",
                    P: "6#0",
                    T: "B",
                    V: "0",
                    H: "Invert probe pin",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "Spindle/Spindle",
                    P: "9",
                    T: "X",
                    V: "1",
                    H: "PWM Spindle",
                    O: [
                        {
                            Enable: "0",
                        },
                        {
                            "RPM controls spindle enable signal": "1",
                        },
                    ],
                },
                {
                    F: "Status report options/General",
                    P: "10#0",
                    T: "B",
                    V: "1",
                    H: "Position in machine coordinate",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Status report options/General",
                    P: "10#1",
                    T: "B",
                    V: "1",
                    H: "Buffer state",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Status report options/General",
                    P: "10#2",
                    T: "B",
                    V: "1",
                    H: "Line numbers",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Status report options/General",
                    P: "10#3",
                    T: "B",
                    V: "1",
                    H: "Feed & speed",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Status report options/General",
                    P: "10#4",
                    T: "B",
                    V: "1",
                    H: "Pin state",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Status report options/General",
                    P: "10#5",
                    T: "B",
                    V: "1",
                    H: "Work coordinate offset",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Status report options/General",
                    P: "10#6",
                    T: "B",
                    V: "1",
                    H: "Overrides",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Status report options/General",
                    P: "10#7",
                    T: "B",
                    V: "1",
                    H: "Probe coordinates",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Status report options/General",
                    P: "10#8",
                    T: "B",
                    V: "1",
                    H: "Buffer sync on WCO change",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Status report options/General",
                    P: "10#9",
                    T: "B",
                    V: "0",
                    H: "Parser state",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Status report options/General",
                    P: "10#10",
                    T: "B",
                    V: "0",
                    H: "Alarm substatus",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Status report options/General",
                    P: "10#11",
                    T: "B",
                    V: "0",
                    H: "Run substatus",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "General/General",
                    P: "11",
                    T: "F",
                    V: "0.010",
                    H: "Junction deviation",
                },
                {
                    F: "General/General",
                    P: "12",
                    T: "F",
                    V: "0.002",
                    H: "Arc tolerance",
                },
                {
                    F: "General/General",
                    P: "13#0",
                    T: "B",
                    V: "0",
                    H: "Report in inches",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "Invert control pins/Control signals",
                    P: "14#0",
                    T: "B",
                    V: "0",
                    H: "Reset",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Invert control pins/Control signals",
                    P: "14#1",
                    T: "B",
                    V: "0",
                    H: "Feed hold",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Invert control pins/Control signals",
                    P: "14#2",
                    T: "B",
                    V: "0",
                    H: "Cycle start",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Invert coolant pins/Coolant",
                    P: "15#0",
                    T: "B",
                    V: "0",
                    H: "Flood",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Invert coolant pins/Coolant",
                    P: "15#1",
                    T: "B",
                    V: "0",
                    H: "Mist",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Invert spindle signals/Spindle",
                    P: "16#0",
                    T: "B",
                    V: "0",
                    H: "Spindle enable",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Invert spindle signals/Spindle",
                    P: "16#2",
                    T: "B",
                    V: "0",
                    H: "PWM",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Pullup disable control pins/Control signals",
                    P: "17#0",
                    T: "B",
                    V: "0",
                    H: "Reset",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Pullup disable control pins/Control signals",
                    P: "17#1",
                    T: "B",
                    V: "0",
                    H: "Feed hold",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Pullup disable control pins/Control signals",
                    P: "17#2",
                    T: "B",
                    V: "0",
                    H: "Cycle start",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Pullup disable limit pins/Limits",
                    P: "18#0",
                    T: "B",
                    V: "0",
                    H: "X",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Pullup disable limit pins/Limits",
                    P: "18#1",
                    T: "B",
                    V: "0",
                    H: "Y",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Pullup disable limit pins/Limits",
                    P: "18#2",
                    T: "B",
                    V: "0",
                    H: "Z",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Probing/Probing",
                    P: "19#0",
                    T: "B",
                    V: "0",
                    H: "Pullup disable probe pin",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "Limits/Limits",
                    P: "20#0",
                    T: "B",
                    V: "0",
                    H: "Soft limits enable",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "Limits/Limits",
                    P: "21",
                    T: "X",
                    V: "0",
                    H: "Hard limits enable",
                    O: [
                        {
                            Enable: "0",
                        },
                        {
                            "Strict mode": "1",
                        },
                    ],
                },
                {
                    F: "Homing/Homing",
                    P: "22",
                    T: "X",
                    V: "0",
                    H: "Homing cycle",
                    O: [
                        {
                            Enable: "0",
                        },
                        {
                            "Enable single axis commands": "1",
                        },
                        {
                            "Homing on startup required": "2",
                        },
                        {
                            "Set machine origin to 0": "3",
                        },
                        {
                            "Two switches shares one input pin": "4",
                        },
                        {
                            "Allow manual": "5",
                        },
                        {
                            "Override locks": "6",
                        },
                        {
                            "Keep homed status on reset": "7",
                        },
                    ],
                },
                {
                    F: "Homing direction invert/Homing",
                    P: "23#0",
                    T: "B",
                    V: "0",
                    H: "X",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Homing direction invert/Homing",
                    P: "23#1",
                    T: "B",
                    V: "0",
                    H: "Y",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Homing direction invert/Homing",
                    P: "23#2",
                    T: "B",
                    V: "0",
                    H: "Z",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Homing/Homing",
                    P: "24",
                    T: "F",
                    V: "25.0",
                    H: "Homing locate feed rate",
                },
                {
                    F: "Homing/Homing",
                    P: "25",
                    T: "F",
                    V: "500.0",
                    H: "Homing search seek rate",
                },
                {
                    F: "Homing/Homing",
                    P: "26",
                    T: "I",
                    V: "250",
                    H: "Homing switch debounce delay",
                },
                {
                    F: "Homing/Homing",
                    P: "27",
                    T: "F",
                    V: "1.000",
                    H: "Homing switch pull-off distance",
                },
                {
                    F: "General/General",
                    P: "28",
                    T: "F",
                    V: "0.100",
                    H: "G73 Retract distance",
                },
                {
                    F: "Stepper/Stepper",
                    P: "29",
                    T: "F",
                    V: "0.0",
                    H: "Pulse delay",
                    S: "10",
                },
                {
                    F: "Spindle/Spindle",
                    P: "30",
                    T: "F",
                    V: "1000.000",
                    H: "Maximum spindle speed",
                },
                {
                    F: "Spindle/Spindle",
                    P: "31",
                    T: "F",
                    V: "0.000",
                    H: "Minimum spindle speed",
                },
                {
                    F: "General/General",
                    P: "32",
                    T: "B",
                    V: "0",
                    H: "Mode of operation",
                    O: [
                        {
                            Normal: "0",
                        },
                        {
                            "Laser mode": "1",
                        },
                        {
                            "Lathe mode": "2",
                        },
                    ],
                },
                {
                    F: "Spindle/Spindle",
                    P: "33",
                    T: "F",
                    V: "5000.0",
                    H: "Spindle PWM frequency",
                },
                {
                    F: "Spindle/Spindle",
                    P: "34",
                    T: "F",
                    V: "0.0",
                    H: "Spindle PWM off value",
                    S: "100",
                },
                {
                    F: "Spindle/Spindle",
                    P: "35",
                    T: "F",
                    V: "0.0",
                    H: "Spindle PWM min value",
                    S: "100",
                },
                {
                    F: "Spindle/Spindle",
                    P: "36",
                    T: "F",
                    V: "100.0",
                    H: "Spindle PWM max value",
                    S: "100",
                },
                {
                    F: "Steppers deenergize/Stepper",
                    P: "37#0",
                    T: "B",
                    V: "0",
                    H: "X",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Steppers deenergize/Stepper",
                    P: "37#1",
                    T: "B",
                    V: "0",
                    H: "Y",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Steppers deenergize/Stepper",
                    P: "37#2",
                    T: "B",
                    V: "0",
                    H: "Z",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "General/General",
                    P: "39#0",
                    T: "B",
                    V: "1",
                    H: "Enable legacy RT commands",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "Jogging/Jogging",
                    P: "40#0",
                    T: "B",
                    V: "0",
                    H: "Limit jog commands",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "Homing/Homing",
                    P: "43",
                    T: "I",
                    V: "1",
                    H: "Homing passes",
                    M: "1",
                    S: "128",
                },
                {
                    F: "Axes homing, first pass/Homing",
                    P: "44#0",
                    T: "B",
                    V: "0",
                    H: "X",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Axes homing, first pass/Homing",
                    P: "44#1",
                    T: "B",
                    V: "0",
                    H: "Y",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Axes homing, first pass/Homing",
                    P: "44#2",
                    T: "B",
                    V: "1",
                    H: "Z",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Axes homing, second pass/Homing",
                    P: "45#0",
                    T: "B",
                    V: "1",
                    H: "X",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Axes homing, second pass/Homing",
                    P: "45#1",
                    T: "B",
                    V: "1",
                    H: "Y",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Axes homing, second pass/Homing",
                    P: "45#2",
                    T: "B",
                    V: "0",
                    H: "Z",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Axes homing, third pass/Homing",
                    P: "46#0",
                    T: "B",
                    V: "0",
                    H: "X",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Axes homing, third pass/Homing",
                    P: "46#1",
                    T: "B",
                    V: "0",
                    H: "Y",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Axes homing, third pass/Homing",
                    P: "46#2",
                    T: "B",
                    V: "0",
                    H: "Z",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "General/General",
                    P: "62#0",
                    T: "B",
                    V: "0",
                    H: "Sleep enable",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "Feed hold actions/General",
                    P: "63#0",
                    T: "B",
                    V: "0",
                    H: "Disable laser during hold",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Feed hold actions/General",
                    P: "63#1",
                    T: "B",
                    V: "1",
                    H: "Restore spindle and coolant state on resume",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "General/General",
                    P: "64#0",
                    T: "B",
                    V: "0",
                    H: "Force init alarm",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "Probing/Probing",
                    P: "65#0",
                    T: "B",
                    V: "0",
                    H: "Probing feed override",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "X-axis/X-axis",
                    P: "100",
                    T: "F",
                    V: "250.000",
                    H: "axis travel resolution",
                },
                {
                    F: "Y-axis/Y-axis",
                    P: "100",
                    T: "F",
                    V: "250.000",
                    H: "axis travel resolution",
                },
                {
                    F: "Z-axis/Z-axis",
                    P: "100",
                    T: "F",
                    V: "250.000",
                    H: "axis travel resolution",
                },
                {
                    F: "X-axis/X-axis",
                    P: "110",
                    T: "F",
                    V: "500.000",
                    H: "axis maximum rate",
                },
                {
                    F: "Y-axis/Y-axis",
                    P: "110",
                    T: "F",
                    V: "500.000",
                    H: "axis maximum rate",
                },
                {
                    F: "Z-axis/Z-axis",
                    P: "110",
                    T: "F",
                    V: "500.000",
                    H: "axis maximum rate",
                },
                {
                    F: "X-axis/X-axis",
                    P: "120",
                    T: "F",
                    V: "10.000",
                    H: "axis acceleration",
                },
                {
                    F: "Y-axis/Y-axis",
                    P: "120",
                    T: "F",
                    V: "10.000",
                    H: "axis acceleration",
                },
                {
                    F: "Z-axis/Z-axis",
                    P: "120",
                    T: "F",
                    V: "10.000",
                    H: "axis acceleration",
                },
                {
                    F: "X-axis/X-axis",
                    P: "130",
                    T: "F",
                    V: "200.000",
                    H: "axis maximum travel",
                },
                {
                    F: "Y-axis/Y-axis",
                    P: "130",
                    T: "F",
                    V: "200.000",
                    H: "axis maximum travel",
                },
                {
                    F: "Z-axis/Z-axis",
                    P: "130",
                    T: "F",
                    V: "200.000",
                    H: "axis maximum travel",
                },
                {
                    F: "Tool change/Tool change",
                    P: "341",
                    T: "B",
                    V: "0",
                    H: "Tool change mode",
                    O: [
                        {
                            Normal: "0",
                        },
                        {
                            "Manual touch off": "1",
                        },
                        {
                            "Manual touch off @ G59.3": "2",
                        },
                        {
                            "Automatic touch off @ G59.3": "3",
                        },
                        {
                            "Ignore M6": "4",
                        },
                    ],
                },
                {
                    F: "Tool change/Tool change",
                    P: "342",
                    T: "F",
                    V: "30.0",
                    H: "Tool change probing distance",
                },
                {
                    F: "Tool change/Tool change",
                    P: "343",
                    T: "F",
                    V: "25.0",
                    H: "Tool change locate feed rate",
                },
                {
                    F: "Tool change/Tool change",
                    P: "344",
                    T: "F",
                    V: "200.0",
                    H: "Tool change search seek rate",
                },
                {
                    F: "Tool change/Tool change",
                    P: "345",
                    T: "F",
                    V: "100.0",
                    H: "Tool change probe pull-off rate",
                },
                {
                    F: "General/General",
                    P: "384#0",
                    T: "B",
                    V: "0",
                    H: "Disable G92 persistence",
                    O: [
                        {
                            Enabled: "1",
                        },
                        {
                            Disabled: "0",
                        },
                    ],
                },
                {
                    F: "Network Services/Networking",
                    P: "70#0",
                    T: "B",
                    V: "1",
                    H: "Telnet",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Network Services/Networking",
                    P: "70#1",
                    T: "B",
                    V: "1",
                    H: "Websocket",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "Network Services/Networking",
                    P: "70#2",
                    T: "B",
                    V: "1",
                    H: "HTTP",
                    O: [
                        {
                            On: "1",
                        },
                        {
                            Off: "0",
                        },
                    ],
                },
                {
                    F: "WiFi/WiFi",
                    P: "74",
                    T: "S",
                    V: "",
                    H: "WiFi Station (STA) SSID",
                    S: "64",
                },
                {
                    F: "WiFi/WiFi",
                    P: "75",
                    T: "S",
                    V: "********",
                    H: "WiFi Station (STA) Password",
                    S: "32",
                },
                {
                    F: "Networking/Networking",
                    P: "300",
                    T: "S",
                    V: "Grbl",
                    H: "Hostname",
                    S: "64",
                },
                {
                    F: "Networking/Networking",
                    P: "302",
                    T: "A",
                    V: "192.168.5.1",
                    H: "IP Address",
                },
                {
                    F: "Networking/Networking",
                    P: "303",
                    T: "A",
                    V: "192.168.5.1",
                    H: "Gateway",
                },
                {
                    F: "Networking/Networking",
                    P: "304",
                    T: "A",
                    V: "255.255.255.0",
                    H: "Netmask",
                },
                {
                    F: "WiFi/WiFi",
                    P: "73",
                    T: "B",
                    V: "2",
                    H: "WiFi Mode",
                    O: [
                        {
                            Off: "0",
                        },
                        {
                            Station: "1",
                        },
                        {
                            "Access Point": "2",
                        },
                        {
                            "Access Point/Station": "3",
                        },
                    ],
                },
                {
                    F: "WiFi/WiFi",
                    P: "76",
                    T: "S",
                    V: "GRBL",
                    H: "WiFi Access Point (AP) SSID",
                    S: "64",
                },
                {
                    F: "WiFi/WiFi",
                    P: "77",
                    T: "S",
                    V: "********",
                    H: "WiFi Access Point (AP) Password",
                    S: "32",
                },
                {
                    F: "Networking/Networking",
                    P: "310",
                    T: "S",
                    V: "GrblAP",
                    H: "Hostname (AP)",
                    S: "64",
                },
                {
                    F: "Networking/Networking",
                    P: "312",
                    T: "A",
                    V: "192.168.5.1",
                    H: "IP Address (AP)",
                },
                {
                    F: "Networking/Networking",
                    P: "313",
                    T: "A",
                    V: "192.168.5.1",
                    H: "Gateway (AP)",
                },
                {
                    F: "Networking/Networking",
                    P: "314",
                    T: "A",
                    V: "255.255.255.0",
                    H: "Netmask (AP)",
                },
                {
                    F: "Networking/Networking",
                    P: "305",
                    T: "I",
                    V: "23",
                    H: "Telnet port",
                    M: "1",
                    S: "65535",
                },
                {
                    F: "Networking/Networking",
                    P: "306",
                    T: "I",
                    V: "80",
                    H: "HTTP port",
                    M: "1",
                    S: "65535",
                },
                {
                    F: "Networking/Networking",
                    P: "307",
                    T: "I",
                    V: "81",
                    H: "Websocket port",
                    M: "1",
                    S: "65535",
                },
            ],
        })
        return
    }*/
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
