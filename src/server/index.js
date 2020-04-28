const express = require("express")
var path = require("path")
const fs = require("fs")
/*
 * Web Server for development
 * Web Socket server for development
 */

const WebSocket = require("ws")
var currentID = 0
const app = express()
const fileUpload = require("express-fileupload")
const machine = process.env.TARGET_ENV
/* repetier : "5"
 * repetier4davinci: "1"
 * marlin: "2"
 * marlinkimbra: "3"
 * smoothieware: "4"
 * grbl: "6"
 * unknown: "0"
 * */

let targetFW = machine == "grbl" ? "grbl" : "marlin"
let targetFWnb =
    machine == "grbl"
        ? "6"
        : targetFW == "repetier"
        ? "5"
        : targetFW == "marlin"
        ? "2"
        : targetFW == "smoothieware"
        ? "4"
        : "0"
const FSDir = "./public"
var WebSocketServer = require("ws").Server,
    wss = new WebSocketServer({ port: 81 })

app.use(fileUpload({ preserveExtension: true, debug: true }))

/*function SendBinary16(text){
    var buf = new ArrayBuffer(text.length*2);
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=text.length; i<strLen; i++) {
        bufView[i] = text.charCodeAt(i);
    }
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(buf)
        }
    })
}*/

function SendBinary(text) {
    const array = new Uint8Array(text.length)
    for (var i = 0; i < array.length; ++i) {
        array[i] = text.charCodeAt(i)
    }
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(array)
        }
    })
}

app.get("/command", function(req, res) {
    var url = req.originalUrl
    if (url.indexOf("M503") != -1) {
        if (targetFW == "repetier" || targetFW == "repetier4davinci")
            SendBinary(
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
        if (targetFW == "marlin" || targetFW == "marlinkimbra")
            SendBinary(
                "echo:  G21    ; Units in mm (mm)\n" +
                    "echo:; Filament settings: Disabled\n" +
                    "echo:  M200 D3.00\n" +
                    "echo:  M200 D0\n" +
                    "echo:; Steps per unit:\n" +
                    "echo: M92 X80.00 Y80.00 Z4000.00 E500.00\n" +
                    "echo:; Maximum feedrates (units/s):\n" +
                    "echo:  M203 X300.00 Y300.00 Z5.00 E25.00\n" +
                    "echo:; Maximum Acceleration (units/s2):\n" +
                    "echo:  M201 X3000.00 Y3000.00 Z100.00 E10000.00\n" +
                    "echo:; Acceleration (units/s2): P<print_accel> R T\n" +
                    "echo:  M204 P3000.00 R3000.00 T3000.00\n" +
                    "echo:; Advanced: B S T J\n" +
                    "echo:  M205 B20000.00 S0.00 T0.00 J0.01\n" +
                    "echo:; Home offset:\n" +
                    "echo:  M206 X0.00 Y0.00 Z0.00\n" +
                    "echo:; PID settings:\n" +
                    "echo:  M301 P22.20 I1.08 D114.00\n" +
                    "ok\n"
            )
        if (targetFW == "smoothieware") SendBinary("ok\n")
        if (targetFW == "grbl")
            SendBinary(
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

    if (url.indexOf("ESP800") != -1) {
        res.json({
            FWVersion: "3.0.0.a28",
            FWTarget: targetFW,
            SDConnection: "none",
            Authentication: "Disabled",
            WebCommunication: "Synchronous",
            WebSocketIP: "localhost",
            WebSocketport: "81",
            Hostname: "esp3d",
            WiFiMode: "STA",
            WebUpdate: "Enabled",
            Filesystem: "SPIFFS",
            Time: "none",
        })
        return
    }
    if (url.indexOf("ESP401") != -1) {
        console.log(url)
        let p1 = url.indexOf("P%3D")
        let p2 = url.indexOf("%20T%3D")
        let p = url.substring(p1 + 4, p2)
        if (p == "461") {
            p1 = url.indexOf("V%3D")
            let p3 = url.indexOf("&")
            p2 = url.substring(p1 + 4, p3)
            targetFWnb = p2
            switch (p2) {
                case "6":
                    targetFW = "grbl"
                    break
                case "5":
                    targetFW = "repetier"
                    break
                case "1":
                    targetFW = "repetier4davinci"
                    break
                case "2":
                    targetFW = "marlin"
                    break
                case "3":
                    targetFW = "marlinkimbra"
                    break
                case "4":
                    targetFW = "smoothieware"
                    break
                case "0":
                    targetFW = "unknown"
                    break
            }
        }
        //res.status(500).send("error " + p)
        res.send("ok " + p)
        return
    }
    if (url.indexOf("ESP420") != -1) {
        res.json({
            Status: [
                { id: "chip id", value: "38078" },
                { id: "CPU Freq", value: "240 Mhz" },
                { id: "CPU Temp", value: "50.6 C" },
                { id: "free mem", value: "217.50 KB" },
                { id: "SDK", value: "v3.3.1-61-g367c3c09c" },
                { id: "flash size", value: "4.00 MB" },
                { id: "size for update", value: "1.87 MB" },
                { id: "FS type", value: "SPIFFS" },
                { id: "FS usage", value: "39.95 KB/169.38 KB" },
                { id: "baud", value: "115200" },
                { id: "sleep mode", value: "none" },
                { id: "wifi", value: "ON" },
                { id: "hostname", value: "esp3d" },
                { id: "HTTP port", value: "80" },
                { id: "Telnet port", value: "23" },
                { id: "Ftp ports", value: "21, 20, 55600" },
                { id: "sta", value: "ON" },
                { id: "mac", value: "30:AE:A4:21:BE:94" },
                { id: "SSID", value: "WIFI_OFFICE_B2G" },
                { id: "signal", value: "100 %" },
                { id: "phy mode", value: "11n" },
                { id: "channel", value: "2" },
                { id: "ip mode", value: "dhcp" },
                { id: "ip", value: "192.168.1.43" },
                { id: "gw", value: "192.168.1.1" },
                { id: "msk", value: "255.255.255.0" },
                { id: "DNS", value: "192.168.1.1" },
                { id: "ap", value: "OFF" },
                { id: "mac", value: "30:AE:A4:21:BE:95" },
                { id: "serial", value: "ON" },
                { id: "notification", value: "OFF" },
                { id: "FW ver", value: "3.0.0.a28" },
                { id: "FW arch", value: "ESP32" },
            ],
        })
        return
    }

    if (url.indexOf("ESP410") != -1) {
        res.json({
            AP_LIST: [
                {
                    SSID: "HP-Setup>71-M277 LaserJet",
                    SIGNAL: "92",
                    IS_PROTECTED: "0",
                },
                { SSID: "WIFI_OFFICE_B2G", SIGNAL: "88", IS_PROTECTED: "1" },
                { SSID: "NETGEAR70", SIGNAL: "66", IS_PROTECTED: "1" },
                { SSID: "WIFI_OFFICE_A2G", SIGNAL: "48", IS_PROTECTED: "1" },
                { SSID: "Livebox-EF01", SIGNAL: "20", IS_PROTECTED: "1" },
                { SSID: "orange", SIGNAL: "20", IS_PROTECTED: "0" },
            ],
        })
        return
    }
    if (url.indexOf("ESP400") != -1) {
        res.json({
            Settings: [
                {
                    F: "network",
                    F2: "network",
                    P: "130",
                    T: "S",
                    V: "esp3d",
                    H: "hostname",
                    S: "32",
                    M: "1",
                },
                {
                    F: "network",
                    F2: "network",
                    P: "0",
                    T: "B",
                    V: "1",
                    H: "radio mode",
                    O: [{ none: "0" }, { sta: "1" }, { ap: "2" }],
                },
                {
                    F: "network",
                    F2: "sta",
                    P: "1",
                    T: "S",
                    V: "WIFI_OFFICE_B2G",
                    S: "32",
                    H: "SSID",
                    M: "1",
                },
                {
                    F: "network",
                    F2: "sta",
                    P: "34",
                    T: "S",
                    N: "1",
                    V: "********",
                    S: "64",
                    H: "pwd",
                    M: "8",
                },
                {
                    F: "network",
                    F2: "sta",
                    P: "99",
                    T: "B",
                    V: "1",
                    H: "ip mode",
                    O: [{ dhcp: "1" }, { static: "0" }],
                },
                {
                    F: "network",
                    F2: "sta",
                    P: "100",
                    T: "A",
                    V: "192.168.0.1",
                    H: "ip",
                },
                {
                    F: "network",
                    F2: "sta",
                    P: "108",
                    T: "A",
                    V: "192.168.0.1",
                    H: "gw",
                },
                {
                    F: "network",
                    F2: "sta",
                    P: "104",
                    T: "A",
                    V: "255.255.255.0",
                    H: "msk",
                },
                {
                    F: "network",
                    F2: "ap",
                    P: "218",
                    T: "S",
                    V: "ESP3D",
                    S: "32",
                    H: "SSID",
                    M: "1",
                },
                {
                    F: "network",
                    F2: "ap",
                    P: "251",
                    T: "S",
                    N: "1",
                    V: "********",
                    S: "64",
                    H: "pwd",
                    M: "8",
                },
                {
                    F: "network",
                    F2: "ap",
                    P: "316",
                    T: "A",
                    V: "192.168.0.1",
                    H: "ip",
                },
                {
                    F: "network",
                    F2: "ap",
                    P: "118",
                    T: "B",
                    V: "11",
                    H: "channel",
                    O: [
                        { "1": "1" },
                        { "2": "2" },
                        { "3": "3" },
                        { "4": "4" },
                        { "5": "5" },
                        { "6": "6" },
                        { "7": "7" },
                        { "8": "8" },
                        { "9": "9" },
                        { "10": "10" },
                        { "11": "11" },
                        { "12": "12" },
                        { "13": "13" },
                        { "14": "14" },
                    ],
                },
                {
                    F: "service",
                    F2: "http",
                    P: "328",
                    T: "B",
                    V: "1",
                    H: "enable",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service",
                    F2: "http",
                    P: "121",
                    T: "I",
                    V: "80",
                    H: "port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service",
                    F2: "telnetp",
                    P: "329",
                    T: "B",
                    V: "1",
                    H: "enable",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service",
                    F2: "telnetp",
                    P: "125",
                    T: "I",
                    V: "23",
                    H: "port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service",
                    F2: "ftp",
                    P: "1021",
                    T: "B",
                    V: "1",
                    H: "enable",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service",
                    F2: "ftp",
                    P: "1009",
                    T: "I",
                    V: "21",
                    H: "control port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service",
                    F2: "ftp",
                    P: "1013",
                    T: "I",
                    V: "20",
                    H: "active port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service",
                    F2: "ftp",
                    P: "1017",
                    T: "I",
                    V: "55600",
                    H: "passive port",
                    S: "65001",
                    M: "1",
                },
                {
                    F: "service",
                    F2: "notification",
                    P: "1004",
                    T: "B",
                    V: "1",
                    H: "auto notif",
                    O: [{ no: "0" }, { yes: "1" }],
                },
                {
                    F: "service",
                    F2: "notification",
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
                    F: "service",
                    F2: "notification",
                    P: "332",
                    T: "S",
                    V: "********",
                    S: "63",
                    H: "t1",
                    M: "0",
                },
                {
                    F: "service",
                    F2: "notification",
                    P: "396",
                    T: "S",
                    V: "********",
                    S: "63",
                    H: "t2",
                    M: "0",
                },
                {
                    F: "service",
                    F2: "notification",
                    P: "855",
                    T: "S",
                    V: " ",
                    S: "127",
                    H: "ts",
                    M: "0",
                },
                {
                    F: "system",
                    F2: "system",
                    P: "461",
                    T: "B",
                    V: targetFWnb,
                    H: "targetfw",
                    O: [
                        { repetier: "5" },
                        { repetier4davinci: "1" },
                        { marlin: "2" },
                        { marlinkimbra: "3" },
                        { smoothieware: "4" },
                        { grbl: "6" },
                        { unknown: "0" },
                    ],
                },
                {
                    F: "system",
                    F2: "system",
                    P: "112",
                    T: "I",
                    V: "115200",
                    H: "baud",
                    O: [
                        { "9600": "9600" },
                        { "19200": "19200" },
                        { "38400": "38400" },
                        { "57600": "57600" },
                        { "74880": "74880" },
                        { "115200": "115200" },
                        { "230400": "230400" },
                        { "250000": "250000" },
                        { "500000": "500000" },
                        { "921600": "921600" },
                    ],
                },
                {
                    F: "system",
                    F2: "system",
                    P: "320",
                    T: "I",
                    V: "10000",
                    H: "bootdelay",
                    S: "40000",
                    M: "0",
                },
                {
                    F: "system",
                    F2: "system",
                    P: "129",
                    T: "F",
                    V: "255",
                    H: "outputmsg",
                    O: [{ M117: "16" }, { serial: "1" }, { telnet: "2" }],
                },
            ],
        })
        return
    }
    res.json({ custom: "unknown query" })
})

function fileSizeString(size) {
    let s
    if (size < 1024) return size + " B"
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB"
    if (size < 1024 * 1024 * 1024)
        return (size / (1024 * 1024)).toFixed(2) + " MB"
    if (size < 1024 * 1024 * 1024 * 1024)
        return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB"
    return "X B"
}

function filesList(mypath) {
    let res = '{"files":['
    let totalused = getTotalSize(__dirname + "/public")
    let total = 1.31 * 1024 * 1024
    fs.readdirSync(__dirname + "/public" + mypath).forEach(fileelement => {
        let fst = fs.statSync(__dirname + "/public" + mypath + fileelement)
        let fsize = -1

        if (fst.isFile()) {
            fsize = fileSizeString(fst.size)
        }
        res += '{"name":"' + fileelement + '","size":"' + fsize + '"}'
    })
    res +=
        '],"path":"' +
        mypath +
        '","occupation":"' +
        (totalused / total).toFixed(0) +
        '","status":"ok","total":"' +
        fileSizeString(total) +
        '","used":"' +
        fileSizeString(totalused) +
        '"}'
    return res
}

const getAllFiles = function(dirPath, arrayOfFiles) {
    let files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(dirPath + "/" + file)
        }
    })

    return arrayOfFiles
}

const getTotalSize = function(directoryPath) {
    const arrayOfFiles = getAllFiles(directoryPath)

    let totalSize = 0

    arrayOfFiles.forEach(function(filePath) {
        totalSize += fs.statSync(filePath).size
    })

    return totalSize
}

app.all("/files", function(req, res) {
    let mypath = req.query.path
    if (typeof mypath == "undefined") mypath = "/"
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.send(filesList(mypath))
    }
    let myFile = req.files.myfile

    if (typeof myFile.length == "undefined") {
        console.log("one files")
        myFile.mv(__dirname + "/public" + mypath + myFile.name, function(err) {
            if (err) return res.status(500).send(err)
        })
    } else {
        console.log(myFile.length + " files")
        for (let i = 0; i < myFile.length; i++) {
            myFile[i].mv(__dirname + "/public/" + myFile[i].name, function(
                err
            ) {
                if (err) return res.status(500).send(err)
            })
        }
    }
    res.send(filesList(mypath))
})

app.listen(process.env.PORT || 8080, () =>
    console.log(`Listening on port ${process.env.PORT || 8080}!`)
)

wss.on("connection", function(ws) {
    console.log("New connection")
    ws.send(`currentID:${currentID}`)
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(`activeID:${currentID}`)
        }
    })
    currentID++
    ws.on("message", function(message) {
        //console.log("received: %s", message)
    })
})
