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
const roomTemperature = 20
const temperatures = {
    T: [
        {
            value: roomTemperature,
            target: 0,
            lastTime: -1,
            heatspeed: 0.6,
            coolspeed: 0.8,
            variation: 0.5,
        },
        {
            value: 20,
            target: 0,
            lastTime: -1,
            heatspeed: 0.6,
            coolspeed: 0.8,
            variation: 0.5,
        },
    ],
    B: [
        {
            value: roomTemperature,
            target: 0,
            lastTime: -1,
            heatspeed: 0.2,
            coolspeed: 0.8,
            variation: 0.5,
        },
    ],
    C: [
        {
            value: roomTemperature,
            target: 0,
            lastTime: -1,
            heatspeed: 0.6,
            coolspeed: 0.8,
            variation: 0.5,
        },
    ],
    P: [{ value: roomTemperature, sameas: "T", lastTime: -1, variation: 0.5 }], //let say probe is 50% of extruder temperature
    R: [{ value: roomTemperature, sameas: "T", lastTime: -1, variation: 1 }], //the redondant is same as extruder 0
    M: [{ value: roomTemperature, lastTime: -1, variation: 1 }], //the motherboard is same as room temperature +5/10 degres
}

const updateTemperature = (entry, time) => {
    if (entry.lastTime == -1) {
        entry.lastTime = time
    }

    const v = Math.random() * 5
    //heater
    if (typeof entry.target != "undefined") {
        const target = entry.target == 0 ? roomTemperature : entry.target
        if (entry.value + 5 < target) {
            entry.value =
                entry.value + (entry.heatspeed * (time - entry.lastTime)) / 1000
        } else if (entry.value - 5 > target) {
            entry.value =
                entry.value - (entry.coolspeed * (time - entry.lastTime)) / 1000
        } else if (target - 2 < entry.value && entry.value < target + 2) {
            entry.value = target + entry.variation * (Math.random() - 0.5)
        } else if (entry.value < target) {
            entry.value =
                entry.value +
                ((entry.heatspeed / 3) * (time - entry.lastTime)) / 1000
        } else {
            entry.value =
                entry.value -
                ((entry.coolspeed / 3) * (time - entry.lastTime)) / 1000
        }
    }
    //sensor
    else if (typeof entry.sameas != "undefined") {
        if (
            entry.sameas == "T" &&
            entry.variation == 0.5 &&
            entry.value < 2 * roomTemperature
        ) {
            //probe is same as room temperature if under 40 degres
            entry.value =
                v > 2.5 ? roomTemperature + v / 2 : roomTemperature - v / 2
        } else {
            entry.value =
                v > 2.5
                    ? temperatures[entry.sameas][0].value * entry.variation +
                      v / 4
                    : temperatures[entry.sameas][0].value * entry.variation -
                      v / 4
        }
    } else {
        entry.value =
            v > 2.5 ? roomTemperature + v / 2 : roomTemperature - v / 2
    }
    entry.lastTime = time
}

function getLastconnection() {
    return lastconnection
}

function hasEnabledAuthentication() {
    return enableAuthentication
}

function Temperatures() {
    Object.keys(temperatures).map((tool) => {
        temperatures[tool].map((entry) => {
            updateTemperature(entry, new Date())
        })
    })
    const result =
        "T:" +
        Number(temperatures["T"][0].value).toFixed(2) +
        " /" +
        Number(temperatures["T"][0].target).toFixed(2) +
        " B:" +
        Number(temperatures["B"][0].value).toFixed(2) +
        " /" +
        Number(temperatures["B"][0].target).toFixed(2) +
        " T0:" +
        Number(temperatures["T"][0].value).toFixed(2) +
        " /" +
        Number(temperatures["T"][0].target).toFixed(2) +
        " T1:" +
        Number(temperatures["T"][1].value).toFixed(2) +
        " /" +
        Number(temperatures["T"][1].target).toFixed(2) +
        " @:0 B@:0 @:0\nok\n"
    console.log(result)
    return result
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

    if (url.indexOf("M114") != -1) {
        let X = Number(Math.random() * 200.12).toFixed(2)
        let Y = Number(Math.random() * 200.12).toFixed(2)
        let Z = Number(Math.random() * 200.12).toFixed(2)
        SendWS(`X:${X} Y:${Y} Z:${Z} E:0.0000\nok\n`)
        res.send("")
        return
    }
    if (url.indexOf("SIM:") != -1) {
        const response = url.substring(url.indexOf("SIM:") + 4)
        SendWS(response + "\n" + "ok\n")
        res.send("")
        return
    }

    if (url.indexOf("M205") != -1) {
        SendWS(
            "EPR:0 1028 0 Language\n" +
                "EPR:2 75 230400 Baudrate\n" +
                "EPR:0 1125 1 Display Mode:\n" +
                "EPR:0 1119 1 Light On:\n" +
                "EPR:0 1127 1 Keep Light On:\n" +
                "EPR:0 1126 0 Filament Sensor On:\n" +
                "EPR:0 1176 0 Top Sensor On:\n" +
                "EPR:0 1120 1 Sound On:\n" +
                "EPR:0 1177 1 Wifi On:\n" +
                "EPR:3 129 16.065 Filament printed [m]\n" +
                "EPR:2 125 21576 Printer active [s]\n" +
                "EPR:2 79 0 Max. inactive time [ms,0=off]\n" +
                "EPR:2 83 360000 Stop stepper after inactivity [ms,0=off]\n" +
                "EPR:2 1121 0 Powersave after [ms,0=off]:\n" +
                "EPR:3 1160 180.000 Temp Ext PLA:\n" +
                "EPR:3 1164 230.000 Temp Ext ABS:\n" +
                "EPR:3 1168 60.000 Temp Bed PLA:\n" +
                "EPR:3 1172 90.000 Temp Bed ABS:\n" +
                "EPR:3 1179 2.000 Load Feed Rate:\n" +
                "EPR:3 1183 4.000 Unload Feed Rate:\n" +
                "EPR:3 1187 60.000 Unload/Load Distance:\n" +
                "EPR:3 3 80.0000 X-axis steps per mm\n" +
                "EPR:3 7 80.0000 Y-axis steps per mm\n" +
                "EPR:3 11 2560.0000 Z-axis steps per mm\n" +
                "EPR:3 15 200.000 X-axis max. feedrate [mm/s]\n" +
                "EPR:3 19 200.000 Y-axis max. feedrate [mm/s]\n" +
                "EPR:3 23 5.000 Z-axis max. feedrate [mm/s]\n" +
                "EPR:3 27 40.000 X-axis homing feedrate [mm/s]\n" +
                "EPR:3 31 40.000 Y-axis homing feedrate [mm/s]\n" +
                "EPR:3 35 4.000 Z-axis homing feedrate [mm/s]\n" +
                "EPR:3 39 20.000 Max. jerk [mm/s]\n" +
                "EPR:3 47 0.342 Max. Z-jerk [mm/s]\n" +
                "EPR:3 133 0.000 X min pos [mm]\n" +
                "EPR:3 137 0.000 Y min pos [mm]\n" +
                "EPR:3 141 0.000 Z min pos [mm]\n" +
                "EPR:3 145 199.000 X max length [mm]\n" +
                "EPR:3 149 204.000 Y max length [mm]\n" +
                "EPR:3 153 200.000 Z max length [mm]\n" +
                "EPR:3 51 1000.000 X-axis acceleration [mm/s^2]\n" +
                "EPR:3 55 1000.000 Y-axis acceleration [mm/s^2]\n" +
                "EPR:3 59 100.000 Z-axis acceleration [mm/s^2]\n" +
                "EPR:3 63 1000.000 X-axis travel acceleration [mm/s^2]\n" +
                "EPR:3 67 1000.000 Y-axis travel acceleration [mm/s^2]\n" +
                "EPR:3 71 150.000 Z-axis travel acceleration [mm/s^2]\n" +
                "EPR:3 1024 0.000 Coating thickness [mm]\n" +
                "EPR:3 1128 100.000 Manual-probe X1 [mm]\n" +
                "EPR:3 1132 180.000 Manual-probe Y1 [mm]\n" +
                "EPR:3 1136 100.000 Manual-probe X2 [mm]\n" +
                "EPR:3 1140 10.000 Manual-probe Y2 [mm]\n" +
                "EPR:3 1144 50.000 Manual-probe X3 [mm]\n" +
                "EPR:3 1148 95.000 Manual-probe Y3 [mm]\n" +
                "EPR:3 1152 150.000 Manual-probe X4 [mm]\n" +
                "EPR:3 1156 95.000 Manual-probe Y4 [mm]\n" +
                "EPR:3 808 0.280 Z-probe height [mm]\n" +
                "EPR:3 929 5.000 Max. z-probe - bed dist. [mm]\n" +
                "EPR:3 812 1.000 Z-probe speed [mm/s]\n" +
                "EPR:3 840 30.000 Z-probe x-y-speed [mm/s]\n" +
                "EPR:3 800 0.000 Z-probe offset x [mm]\n" +
                "EPR:3 804 0.000 Z-probe offset y [mm]\n" +
                "EPR:3 816 36.000 Z-probe X1 [mm]\n" +
                "EPR:3 820 -7.000 Z-probe Y1 [mm]\n" +
                "EPR:3 824 36.000 Z-probe X2 [mm]\n" +
                "EPR:3 828 203.000 Z-probe Y2 [mm]\n" +
                "EPR:3 832 171.000 Z-probe X3 [mm]\n" +
                "EPR:3 836 203.000 Z-probe Y3 [mm]\n" +
                "EPR:3 1036 0.000 Z-probe bending correction A [mm]\n" +
                "EPR:3 1040 0.000 Z-probe bending correction B [mm]\n" +
                "EPR:3 1044 0.000 Z-probe bending correction C [mm]\n" +
                "EPR:0 880 0 Autolevel active (1/0)\n" +
                "EPR:0 106 2 Bed Heat Manager [0-3]\n" +
                "EPR:0 107 255 Bed PID drive max\n" +
                "EPR:0 124 80 Bed PID drive min\n" +
                "EPR:3 108 196.000 Bed PID P-gain\n" +
                "EPR:3 112 33.000 Bed PID I-gain\n" +
                "EPR:3 116 290.000 Bed PID D-gain\n" +
                "EPR:0 120 255 Bed PID max value [0-255]\n" +
                "EPR:0 1020 0 Enable retraction conversion [0/1]\n" +
                "EPR:3 992 3.000 Retraction length [mm]\n" +
                "EPR:3 996 13.000 Retraction length extruder switch [mm]\n" +
                "EPR:3 1000 40.000 Retraction speed [mm/s]\n" +
                "EPR:3 1004 0.000 Retraction z-lift [mm]\n" +
                "EPR:3 1008 0.000 Extra extrusion on undo retract [mm]\n" +
                "EPR:3 1012 0.000 Extra extrusion on undo switch retract [mm]\n" +
                "EPR:3 1016 20.000 Retraction undo speed\n" +
                "EPR:3 200 99.000 Extr.1 steps per mm\n" +
                "EPR:3 204 50.000 Extr.1 max. feedrate [mm/s]\n" +
                "EPR:3 208 20.000 Extr.1 start feedrate [mm/s]\n" +
                "EPR:3 212 5000.000 Extr.1 acceleration [mm/s^2]\n" +
                "EPR:0 216 1 Extr.1 heat manager [0-3]\n" +
                "EPR:0 217 230 Extr.1 PID drive max\n" +
                "EPR:0 245 40 Extr.1 PID drive min\n" +
                "EPR:3 218 3.0000 Extr.1 PID P-gain/dead-time\n" +
                "EPR:3 222 2.0000 Extr.1 PID I-gain\n" +
                "EPR:3 226 40.0000 Extr.1 PID D-gain\n" +
                "EPR:0 230 255 Extr.1 PID max value [0-255]\n" +
                "EPR:2 231 0 Extr.1 X-offset [steps]\n" +
                "EPR:2 235 0 Extr.1 Y-offset [steps]\n" +
                "EPR:2 290 0 Extr.1 Z-offset [steps]\n" +
                "EPR:1 239 1 Extr.1 temp. stabilize time [s]\n" +
                "EPR:1 250 150 Extr.1 temp. for retraction when heating [C]\n" +
                "EPR:1 252 0 Extr.1 distance to retract when heating [mm]\n" +
                "EPR:0 254 255 Extr.1 extruder cooler speed [0-255]\n" +
                "EPR:3 246 0.000 Extr.1 advance L [0=off]\n" +
                "EPR:3 300 99.000 Extr.2 steps per mm\n" +
                "EPR:3 304 50.000 Extr.2 max. feedrate [mm/s]\n" +
                "EPR:3 308 20.000 Extr.2 start feedrate [mm/s]\n" +
                "EPR:3 312 5000.000 Extr.2 acceleration [mm/s^2]\n" +
                "EPR:0 316 3 Extr.2 heat manager [0-3]\n" +
                "EPR:0 317 230 Extr.2 PID drive max\n" +
                "EPR:0 345 40 Extr.2 PID drive min\n" +
                "EPR:3 318 3.0000 Extr.2 PID P-gain/dead-time\n" +
                "EPR:3 322 2.0000 Extr.2 PID I-gain\n" +
                "EPR:3 326 40.0000 Extr.2 PID D-gain\n" +
                "EPR:0 330 255 Extr.2 PID max value [0-255]\n" +
                "EPR:2 331 -2852 Extr.2 X-offset [steps]\n" +
                "EPR:2 335 12 Extr.2 Y-offset [steps]\n" +
                "EPR:2 390 0 Extr.2 Z-offset [steps]\n" +
                "EPR:1 339 1 Extr.2 temp. stabilize time [s]\n" +
                "EPR:1 350 150 Extr.2 temp. for retraction when heating [C]\n" +
                "EPR:1 352 0 Extr.2 distance to retract when heating [mm]\n" +
                "EPR:0 354 255 Extr.2 extruder cooler speed [0-255]\n" +
                "EPR:3 346 0.000 Extr.2 advance L [0=off]\n" +
                "wait\n"
        )
        res.send("")
        return
    }

    if (url.indexOf("M206") != -1) {
        SendWS("wait\n")
        res.send("")
        return
    }
    if (url.indexOf("M104") != -1) {
        const reg_ex_temp = /S([0-9]*\.?[0-9]*)/
        const reg_ex_index = /T([0-9])/
        const result_target = reg_ex_temp.exec(url)
        const result_index = reg_ex_index.exec(url)
        console.log(result_target[1], result_index[1])
        temperatures["T"][result_index[1]].target = parseFloat(result_target[1])
        res.send("")
        return
    }

    if (url.indexOf("M140") != -1) {
        const reg_ex_temp = /S([0-9]*\.?[0-9]*)/
        const result_target = reg_ex_temp.exec(url)
        temperatures["B"][0].target = parseFloat(result_target[1])
        res.send("")
        return
    }

    if (url.indexOf("M20") != -1) {
        SendWS(
            "ok 0\n" +
                "Begin file list\n" +
                "TEST.ZIP 66622272\n" +
                "ad_check_0001 2400\n" +
                "Machine_Life.dat 0\n" +
                "SOUND8.G 992\n" +
                "eeprom.bin 4096\n" +
                "FW_upgrade.dat 0\n" +
                "MYFOLDER/\n" +
                "MYFOLDER/sound.g 1040\n" +
                "MYFOLDER/Lucdir/\n" +
                "M33.G 90\n" +
                "M3.G 90\n" +
                "SUPPOR~1.GCO 1226740\n" +
                "TEST1~1.GCO 113\n" +
                "T1.G 21\n" +
                "smal.gco 81\n" +
                "testgcode.gco 14\n" +
                "fr.json 0\n" +
                "End file list\n" +
                "wait\n"
        )
        res.send("")
        return
    }

    if (url.indexOf("M32") != -1) {
        const name = url.split(" ")
        SendWS(
            //"Creation failed\n"
            "Directory created\n"
        )

        res.send("")
        return
    }

    if (url.indexOf("M30") != -1) {
        const name = url.split(" ")
        SendWS(
            //"Deletion failed, File:" + name[1].substring(1) + ".\n" + "ok\n"
            "File deleted:" + name[1].substring(1) + "\n" + "ok\n"
        )

        res.send("")
        return
    }
    if (url.indexOf("M115") != -1) {
        SendWS(
            "FIRMWARE_NAME:Repetier_0.92.10 FIRMWARE_URL:https://github.com/luc-github/Repetier-Firmware-0.92/ PROTOCOL_VERSION:1.0 MACHINE_TYPE:DaVinci EXTRUDER_COUNT:2 REPETIER_PROTOCOL:3\n" +
                "Cap:PROGRESS:1\n" +
                "Cap:AUTOREPORT_TEMP:1\n" +
                "Cap:EEPROM:0\n" +
                "Cap:TOGGLE_LIGHTS:1\n" +
                "Printed filament:19.23m Printing time:0 days 6 hours 43 min\n"
        )
        res.send("")
        return
    }

    if (url.indexOf("M105") != -1) {
        SendWS(Temperatures())
        res.send("")
        return
    }

    if (url.indexOf("ESP800") != -1) {
        res.json({
            cmd: "800",
            status: "ok",
            data: {
                FWVersion: "3.0.0.a111",
                FWTarget: "repetier",
                FWTargetID: "50",
                Setup: "Enabled",
                SDConnection: "shared",
                SerialProtocol: "Socket",
                Authentication: enableAuthentication ? "Enabled" : "Disabled",
                WebCommunication: "Synchronous",
                WebSocketIP: "localhost",
                WebSocketPort: "81",
                Hostname: "esp3d",
                WiFiMode: "STA",
                WebUpdate: "Enabled",
                FileSystem: "LittleFS",
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
                { id: "sd", value: "shared(SDFat - 2.1.2)" },
                { id: "targetfw", value: "repetier" },
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
                    V: "50",
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
    if (req.body.DISCONNECT == "Yes") {
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
            "Target Fw: repetier<br/>" +
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
