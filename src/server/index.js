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
/* repetier : "5"
 * marlin: "2"
 * marlinkimbra: "3"
 * smoothieware: "4"
 * grbl: "1"
 * unknown: "0"
 * */

let sensorInterval = null
let tempInterval = null
let waitInterval = null
let feedrate = 100

let targetFW = "marlin"

let targetFWnb =
    targetFW == "grbl"
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

function sendTemperature() {
    let T = Number(Math.floor(Math.random() * 215).toFixed(2))
    let T1 = Number(Math.floor(Math.random() * 215).toFixed(2))
    let B = Number(Math.floor(Math.random() * 45).toFixed(2))
    if (targetFW == "repetier") {
        SendBinary(
            "T:" +
                T +
                " /200 B:" +
                B +
                " / 0 B@:0 @:0 T0:" +
                T +
                " / 0 @0:0 T1:" +
                T1 +
                " / 0 @1:0\nok\n"
        )
    }
    if (targetFW == "marlin" || targetFW == "marlinkimbra") {
        SendBinary(
            "ok T:" +
                T +
                " /200 R:" +
                T * 1.1 +
                " /200 B:" +
                B +
                " / 0 B1:" +
                T +
                " / 0 P:" +
                B * 1.3 +
                " / 0 C:" +
                B * 2 +
                " / 0 T1:" +
                T1 +
                " / 0 @1:0\n"
        )
    }
}

function sendSensorData() {
    let T = Number(Math.floor(Math.random() * 25).toFixed(2))
    let Pa = Number(Math.floor(Math.random() * 1500).toFixed(2))
    let H = Number(Math.floor(Math.random() * 100).toFixed(2))
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send("SENSOR:" + T + "[C] " + Pa + "[Pa] " + H + "[%]")
        }
    })
}

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

app.post("/login", function (req, res) {
    res.send("")
    return
})

app.get("/command", function (req, res) {
    var url = req.originalUrl
    var urldecoded = decodeURI(decodeURI(url))
    console.log(url)
    if (url.indexOf("config-set") != -1) {
        SendBinary("ok\n")
        res.send("")
        return
    }
    console.log("Command:" + urldecoded)
    if (urldecoded.indexOf("ECHO%3A") != -1) {
        let command = urldecoded
            .substring(urldecoded.indexOf("ECHO%3A") + 7)
            .trim()
        command = command.replace(/%3A/g, ":")
        command = command.replace(/%2F/g, "/")
        SendBinary(command.split("&")[0] + "\n")
        res.send("")
        return
    }
    if (url.indexOf("AUTOWAIT") != -1) {
        if (url.indexOf("ON") != -1) {
            if (waitInterval == null) {
                waitInterval = setInterval(function () {
                    SendBinary("wait\n")
                }, 1000)
            }
        }
        if (url.indexOf("OFF") != -1) {
            clearInterval(waitInterval)
            waitInterval = null
        }
        sendTemperature()
        res.send("")
        return
    }
    if (url.indexOf("M408") != -1) {
        let T = Number(Math.floor(Math.random() * 215).toFixed(2))
        let T1 = Number(Math.floor(Math.random() * 215).toFixed(2))
        let B = Number(Math.floor(Math.random() * 45).toFixed(2))
        SendBinary(
            '{"status": "I","heaters":[' +
                B +
                "," +
                T +
                '],"active":[0.000000,0.000000],"standby":[0.000000,0.000000],"hstat":[0,0],"pos":[0.000000,0.000000,0.000000],"extr":[' +
                T +
                '],"sfactor":100,"efactor":[100],"tool":0,"probe":1000,"fanPercent":[0.000000],"homed":[0,0,0],"coords": {"axesHomed":[0,0,0],"extr":[0.000000],"xyz":[0.000000,0.000000,0.000000]},"currentTool":0,"params": {"atxPower":1,"fanPercent":[0.000000],"speedFactor":100,"extrFactors":[100]},"temps": {"bed": {"current":' +
                B +
                ',"active":0.000000,"state":1},"heads": {"current": [' +
                T +
                '],"active": [0.000000],"state": [1]}},"time":23005}\n'
        )
        res.send("")
        return
    }
    if (url.indexOf("M114") != -1) {
        SendBinary("X:100.0 Y:200.0 Z:0.00\nok\n")
        res.send("")
        return
    }
    if (url.indexOf("M105") != -1) {
        console.info("M105 detected")
        if (url.indexOf("M105%20ON") != -1) {
            if (tempInterval == null) {
                tempInterval = setInterval(function () {
                    sendTemperature()
                }, 3000)
            }
        }
        if (url.indexOf("M105%20OFF") != -1) {
            clearInterval(tempInterval)
            tempInterval = null
        }
        sendTemperature()
        res.send("")
        return
    }

    if (url.indexOf("SENSOR%20ON") != -1) {
        console.log("Activate sensor")
        if (sensorInterval == null) {
            sensorInterval = setInterval(function () {
                sendSensorData()
            }, 3000)
        }
    }

    if (url.indexOf("SENSOR%20OFF") != -1) {
        if (sensorInterval) {
            clearInterval(sensorInterval)
            sensorInterval = null
        }
    }

    if (url.indexOf("M205") != -1) {
        if (targetFW == "repetier")
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
        res.send("")
        return
    }
    if (url.indexOf("M20%20SD%3A") != -1) {
        if (targetFW == "repetier")
            SendBinary(
                "Begin file list\n" +
                    "mcodeL.gco\n" +
                    "mycode4.gco\n" +
                    "mycode5.gco\n" +
                    "/Mydir/\n" +
                    "/Mydir2/\n" +
                    "End file list\n" +
                    "ok\n"
            )
        res.send("")
        return
    }
    if (url.indexOf("M20%20U%3A") != -1) {
        if (targetFW == "repetier")
            SendBinary(
                "Begin file list\n" +
                    "mycodeL.gco\n" +
                    "mycode3.gco\n" +
                    "/Mysubdir/\n" +
                    "/Zaerd 2018 SP0.1 Full Premium Multilanguage Integrated x64/\n" +
                    "End file list\n" +
                    "ok\n"
            )
        res.send("")
        return
    }
    if (url.indexOf("M20") != -1) {
        if (targetFW == "repetier")
            SendBinary(
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
        if (targetFW == "marlin")
            SendBinary(
                "Begin file list\n" +
                    "COOL_V~1.GCO 66622272\n" +
                    "415%VA~1.GCO 66622272\n" +
                    "/ARCHIEVE/TWISTY~1.GCO 1040\n" +
                    "/ARCHIEVE/STEEL-~1.GCO 2040\n" +
                    "/ARCHIEVE/STEEL_~1.GCO 2040\n" +
                    "/ARCHIEVE/RET229~1.GCO 2050\n" +
                    "/ARCHIEVE/FILE__~1.GCO 1050\n" +
                    "/ARCHIEVE/FILE__~2.GCO 1050\n" +
                    "/ARCHIEVE/FILE__~3.GCO 1050\n" +
                    "/ARCHIEVE/FILE__~4.GCO 1050\n" +
                    "/ARCHIEVE/FILE__~5.GCO 1050\n" +
                    "End file list\n" +
                    "ok\n"
            )
        res.send("")
        return
    }

    if (url.indexOf("M21") != -1) {
        console.info("M21 detected")
        if (targetFW == "repetier") {
            SendBinary("ok\n")
        }
        if (targetFW == "marlin") {
            SendBinary("SD card ok\n")
        }
        res.send("")
        return
    }

    if (url.indexOf("=%24%24") != -1) {
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
    if (url.indexOf("=M220") != -1) {
        if (url.indexOf("=M220%20S") != -1) {
            let p = url.indexOf("=M220%20S")
            let f = url.substring(p + 9)
            let t = f.split("&")
            feedrate = parseInt(t[0])
        }
        SendBinary("FR:" + feedrate + "%\nok\n")
        res.send("")
        return
    }
    if (url.indexOf("=M503") != -1) {
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
        if (targetFW == "smoothieware")
            SendBinary(
                "; config override present: /sd/config-override\n" +
                    ";Steps per unit:\n" +
                    "M92 X80.00000 Y80.00000 Z1637.79529 \n" +
                    ";Acceleration mm/sec^2:\n" +
                    "M204 S1000.00000 \n" +
                    ";X- Junction Deviation, Z- Z junction deviation, S - Minimum Planner speed mm/sec:\n" +
                    "M205 X0.05000 Z-1.00000 S0.00000\n" +
                    ";Max cartesian feedrates in mm/sec:\n" +
                    "M203 X16.66667 Y16.66667 Z1.00000 S-1.00000\n" +
                    ";Max actuator feedrates in mm/sec:\n" +
                    "M203.1 X16.66667 Y16.66667 Z1.00000 \n" +
                    ";E Steps per mm:\n" +
                    "M92 E1.0000 P57988\n" +
                    ";E Filament diameter:\n" +
                    "M200 D0.0000 P57988\n" +
                    ";E retract length, feedrate:\n" +
                    "M207 S3.0000 F2700.0000 Z0.0000 Q6000.0000 P57988\n" +
                    ";E retract recover length, feedrate:\n" +
                    "M208 S0.0000 F480.0000 P57988\n" +
                    ";E acceleration mm/sec²:\n" +
                    "M204 E1000.0000 P57988\n" +
                    ";E max feed rate mm/sec:\n" +
                    "M203 E1000.0000 P57988\n" +
                    ";E Steps per mm:\n" +
                    "M92 E140.0000 P39350\n" +
                    ";E Filament diameter:\n" +
                    "M200 D0.0000 P39350\n" +
                    ";E retract length, feedrate:\n" +
                    "M207 S3.0000 F2700.0000 Z0.0000 Q6000.0000 P39350\n" +
                    ";E retract recover length, feedrate:\n" +
                    "M208 S0.0000 F480.0000 P39350\n" +
                    ";E acceleration mm/sec²:\n" +
                    "M204 E500.0000 P39350\n" +
                    ";E max feed rate mm/sec:\n" +
                    "M203 E50.0000 P39350\n" +
                    ";Home offset (mm):\n" +
                    "M206 X0.00 Y0.00 Z0.00 \n" +
                    "ok\n"
            )
        res.send("")
        return
    }

    if (url.indexOf("=cat") != -1) {
        if (targetFW == "smoothieware")
            SendBinary(
                "# Robot module configurations : general handling of movement G-codes and slicing into moves\n" +
                    "default_feed_rate                            1000             # Default rate ( mm/minute ) for G1/G2/G3 moves\n" +
                    "default_seek_rate                            1000             # Default rate ( mm/minute ) for G0 moves\n" +
                    "mm_per_arc_segment                           0.5              # Arcs are cut into segments ( lines ), this is the length for these segments.  Smaller values mean more resolution, higher values mean faster computation\n" +
                    "#mm_per_line_segment                          5                # Lines can be cut into segments ( not usefull with cartesian coordinates robots ).\n" +
                    "\n" +
                    "# Arm solution configuration : Cartesian robot. Translates mm positions into stepper positions\n" +
                    "alpha_steps_per_mm                           80               # Steps per mm for alpha stepper\n" +
                    "beta_steps_per_mm                            80               # Steps per mm for beta stepper\n" +
                    "gamma_steps_per_mm                           1637.7953        # Steps per mm for gamma stepper\n" +
                    "\n" +
                    "# Planner module configuration : Look-ahead and acceleration configuration\n" +
                    "planner_queue_size                           32               # DO NOT CHANGE THIS UNLESS YOU KNOW EXACTLY WHAT YOUR ARE DOING\n" +
                    "acceleration                                 1000             # Acceleration in mm/second/second.\n" +
                    "#z_acceleration                              60              # Acceleration for Z only moves in mm/s^2, 0 disables it, disabled by default. DO NOT SET ON A DELTA\n" +
                    "acceleration_ticks_per_second                1000             # Number of times per second the speed is updated\n" +
                    'junction_deviation                           0.05             # Similar to the old "max_jerk", in millimeters, see : https://github.com/grbl/grbl/blob/master/planner.c#L409\n' +
                    "                                                              # and https://github.com/grbl/grbl/wiki/Configuring-Grbl-v0.8 . Lower values mean being more careful, higher values means being faster and have more jerk\n" +
                    "\n" +
                    "# Stepper module configuration\n" +
                    "microseconds_per_step_pulse                  1                # Duration of step pulses to stepper drivers, in microseconds\n" +
                    "base_stepping_frequency                      100000           # Base frequency for stepping\n" +
                    "\n" +
                    '# Stepper module pins ( ports, and pin numbers, appending "!" to the number will invert a pin )\n' +
                    "alpha_step_pin                               2.1              # Pin for alpha stepper step signal\n" +
                    "alpha_dir_pin                                0.11             # Pin for alpha stepper direction\n" +
                    "alpha_en_pin                                 0.10            # Pin for alpha enable pin 0.10\n" +
                    "alpha_current                                1.0              # X stepper motor current\n" +
                    "x_axis_max_speed                             1000            # mm/min\n" +
                    "alpha_max_rate                               1000.0          # mm/min actuator max speed\n" +
                    "\n" +
                    "beta_step_pin                                2.2              # Pin for beta stepper step signal\n" +
                    "beta_dir_pin                                 0.20             # Pin for beta stepper direction\n" +
                    "beta_en_pin                                  0.19             # Pin for beta enable\n" +
                    "beta_current                                 1.0              # Y stepper motor current\n" +
                    "y_axis_max_speed                             1000            # mm/min\n" +
                    "beta_max_rate                                1000.0          # mm/min actuator max speed\n" +
                    "\n" +
                    "gamma_step_pin                               2.3              # Pin for gamma stepper step signal\n" +
                    "gamma_dir_pin                                0.22             # Pin for gamma stepper direction\n" +
                    "gamma_en_pin                                 0.21             # Pin for gamma enable\n" +
                    "gamma_current                                1.0              # Z stepper motor current\n" +
                    "z_axis_max_speed                             60              # mm/min\n" +
                    "gamma_max_rate                               60.0            # mm/min actuator max speed\n" +
                    "\n" +
                    "# Serial communications configuration ( baud rate default to 9600 if undefined )\n" +
                    "uart0.baud_rate                              115200           # Baud rate for the default hardware serial port\n" +
                    "second_usb_serial_enable                     false            # This enables a second usb serial port (to have both pronterface and a terminal connected)\n" +
                    "msd_disable                                 true            # disable the MSD (USB SDCARD) when set to true\n" +
                    "\n" +
                    "\n" +
                    "# Extruder module configuration\n" +
                    "extruder.hotend.enable                          true             # Whether to activate the extruder module at all. All configuration is ignored if false\n" +
                    "#extruder.hotend.steps_per_mm                    140              # Steps per mm for extruder stepper\n" +
                    "#extruder.hotend.default_feed_rate               600              # Default rate ( mm/minute ) for moves where only the extruder moves\n" +
                    "#extruder.hotend.acceleration                    500              # Acceleration for the stepper motor mm/sec²\n" +
                    "#extruder.hotend.max_speed                       50               # mm/s\n" +
                    "\n" +
                    "#extruder.hotend.step_pin                        2.0              # Pin for extruder step signal\n" +
                    "#extruder.hotend.dir_pin                         0.5             # Pin for extruder dir signal\n" +
                    "#extruder.hotend.en_pin                          0.4             # Pin for extruder enable signal\n" +
                    "\n" +
                    "# extruder offset\n" +
                    "#extruder.hotend.x_offset                        0                # x offset from origin in mm\n" +
                    "#extruder.hotend.y_offset                        0                # y offset from origin in mm\n" +
                    "#extruder.hotend.z_offset                        0                # z offset from origin in mm\n" +
                    "\n" +
                    "# firmware retract settings when using G10/G11, these are the defaults if not defined, must be defined for each extruder if not using the defaults\n" +
                    "#extruder.hotend.retract_length                  3               # retract length in mm\n" +
                    "#extruder.hotend.retract_feedrate                45              # retract feedrate in mm/sec\n" +
                    "#extruder.hotend.retract_recover_length          0               # additional length for recover\n" +
                    "#extruder.hotend.retract_recover_feedrate        8               # recover feedrate in mm/sec (should be less than retract feedrate)\n" +
                    "#extruder.hotend.retract_zlift_length            0               # zlift on retract in mm, 0 disables\n" +
                    "#extruder.hotend.retract_zlift_feedrate          6000            # zlift feedrate in mm/min (Note mm/min NOT mm/sec)\n" +
                    "delta_current                                1.0              # Extruder stepper motor current\n" +
                    "\n" +
                    "# Second extruder module configuration\n" +
                    "extruder.hotend2.enable                          true             # Whether to activate the extruder module at all. All configuration is ignored if false\n" +
                    "extruder.hotend2.steps_per_mm                    140              # Steps per mm for extruder stepper\n" +
                    "extruder.hotend2.default_feed_rate               600              # Default rate ( mm/minute ) for moves where only the extruder moves\n" +
                    "extruder.hotend2.acceleration                    500              # Acceleration for the stepper motor, as of 0.6, arbitrary ratio\n" +
                    "extruder.hotend2.max_speed                       50               # mm/s\n" +
                    "\n" +
                    "extruder.hotend2.step_pin                        2.8              # Pin for extruder step signal\n" +
                    "extruder.hotend2.dir_pin                         2.13             # Pin for extruder dir signal\n" +
                    "extruder.hotend2.en_pin                          4.29             # Pin for extruder enable signal\n" +
                    "\n" +
                    "extruder.hotend2.x_offset                        0                # x offset from origin in mm\n" +
                    "extruder.hotend2.y_offset                        25.0             # y offset from origin in mm\n" +
                    "extruder.hotend2.z_offset                        0                # z offset from origin in mm\n" +
                    "epsilon_current                              1.5              # Second extruder stepper motor current\n" +
                    "\n" +
                    "\n" +
                    "\n" +
                    "# Laser module configuration\n" +
                    "laser_module_enable                          false            # Whether to activate the laser module at all. All configuration is ignored if false.\n" +
                    "laser_module_pin                             2.7              # this pin will be PWMed to control the laser\n" +
                    "laser_module_max_power                       0.8              # this is the maximum duty cycle that will be applied to the laser\n" +
                    "laser_module_tickle_power                    0.0              # this duty cycle will be used for travel moves to keep the laser active without actually burning\n" +
                    "\n" +
                    "# Hotend temperature control configuration\n" +
                    'temperature_control.hotend.enable            true             # Whether to activate this ( "hotend" ) module at all. All configuration is ignored if false.\n' +
                    "#temperature_control.hotend.thermistor_pin    0.23             # Pin for the thermistor to read\n" +
                    "#temperature_control.hotend.heater_pin        2.5              # Pin that controls the heater\n" +
                    "#temperature_control.hotend.thermistor        EPCOS100K        # see http://smoothieware.org/temperaturecontrol#toc5\n" +
                    "#temperature_control.hotend.beta             4066             # or set the beta value\n" +
                    "\n" +
                    "#temperature_control.hotend.set_m_code        104              #\n" +
                    "#temperature_control.hotend.set_and_wait_m_code 109            #\n" +
                    "#temperature_control.hotend.designator        T                #\n" +
                    "\n" +
                    "#temperature_control.hotend.p_factor          13.7             #\n" +
                    "#temperature_control.hotend.i_factor          0.097            #\n" +
                    "#temperature_control.hotend.d_factor          24               #\n" +
                    "\n" +
                    "#temperature_control.hotend.max_pwm          64               # max pwm, 64 is a good value if driving a 12v resistor with 24v.\n" +
                    "\n" +
                    "# Hotend2 temperature control configuration\n" +
                    'temperature_control.hotend2.enable            false             # Whether to activate this ( "hotend" ) module at all. All configuration is ignored if false.\n' +
                    "\n" +
                    "#temperature_control.hotend2.thermistor_pin    0.25             # Pin for the thermistor to read\n" +
                    "#temperature_control.hotend2.heater_pin        2.4             # Pin that controls the heater\n" +
                    "#temperature_control.hotend2.thermistor        EPCOS100K        # see http://smoothieware.org/temperaturecontrol#toc5\n" +
                    "##temperature_control.hotend2.beta             4066             # or set the beta value\n" +
                    "#temperature_control.hotend2.set_m_code        104             #\n" +
                    "#temperature_control.hotend2.set_and_wait_m_code 109            #\n" +
                    "#temperature_control.hotend2.designator        T1               #\n" +
                    "\n" +
                    "#temperature_control.hotend2.p_factor          13.7           # permanently set the PID values after an auto pid\n" +
                    "#temperature_control.hotend2.i_factor          0.097          #\n" +
                    "#temperature_control.hotend2.d_factor          24             #\n" +
                    "\n" +
                    "#temperature_control.hotend2.max_pwm          64               # max pwm, 64 is a good value if driving a 12v resistor with 24v.\n" +
                    "\n" +
                    "temperature_control.bed.enable               false            #\n" +
                    "#temperature_control.bed.thermistor_pin       0.24             #\n" +
                    "#temperature_control.bed.heater_pin           2.7              #\n" +
                    "#temperature_control.bed.thermistor           EPCOS100K    # see http://smoothieware.org/temperaturecontrol#toc5\n" +
                    "#temperature_control.bed.beta                4066             # or set the beta value\n" +
                    "\n" +
                    "#temperature_control.bed.set_m_code           140              #\n" +
                    "#temperature_control.bed.set_and_wait_m_code  190              #\n" +
                    "#temperature_control.bed.designator           B                #\n" +
                    "\n" +
                    "#temperature_control.bed.max_pwm             64               # max pwm, 64 is a good value if driving a 12v resistor with 24v.\n" +
                    "\n" +
                    "# Switch module for led control\n" +
                    "switch.led.enable                            true             #\n" +
                    "switch.led.\n" +
                    "switch.led.input_on_command                  M800            #\n" +
                    "switch.led.input_off_command                 M801             #\n" +
                    "switch.led.output_pin                        2.5              #\n" +
                    "switch.led.output_type                       digital              #\n" +
                    "switch.led.startup_value                       1              #\n" +
                    "switch.led.startup_state                       true             #\n" +
                    "\n" +
                    "switch.misc.enable                           false            #\n" +
                    "switch.misc.input_on_command                 M42              #\n" +
                    "switch.misc.input_off_command                M43              #\n" +
                    "switch.misc.output_pin                       2.4              #\n" +
                    "\n" +
                    "# automatically toggle a switch at a specified temperature. Different ones of these may be defined to monitor different temperatures and switch different swithxes\n" +
                    "# useful to turn on a fan or water pump to cool the hotend\n" +
                    "#temperatureswitch.hotend.enable                true             #\n" +
                    "#temperatureswitch.hotend.designator          T                # first character of the temperature control designator to use as the temperature sensor to monitor\n" +
                    "#temperatureswitch.hotend.switch              misc             # select which switch to use, matches the name of the defined switch\n" +
                    "#temperatureswitch.hotend.threshold_temp      60.0             # temperature to turn on (if rising) or off the switch\n" +
                    "#temperatureswitch.hotend.heatup_poll         15               # poll heatup at 15 sec intervals\n" +
                    "#temperatureswitch.hotend.cooldown_poll       60               # poll cooldown at 60 sec intervals\n" +
                    "\n" +
                    "# filament out detector\n" +
                    "#filament_detector.enable                     true             #\n" +
                    "#filament_detector.encoder_pin                0.26             # must be interrupt enabled pin (0.26, 0.27, 0.28)\n" +
                    "#filament_detector.seconds_per_check          2                # may need to be longer\n" +
                    "#filament_detector.pulses_per_mm              1 .0             # will need to be tuned\n" +
                    "#filament_detector.bulge_pin                  0.27             # optional bulge detector switch and/or manual suspend\n" +
                    "\n" +
                    "# Switch module for spindle control\n" +
                    "#switch.spindle.enable                        false            #\n" +
                    "\n" +
                    "# Endstops\n" +
                    "endstops_enable                              true             # the endstop module is enabled by default and can be disabled here\n" +
                    "#corexy_homing                               false            # set to true if homing on a hbit or corexy\n" +
                    "alpha_min_endstop                            1.24^            # add a ! to invert if endstop is NO connected to ground\n" +
                    "#alpha_max_endstop                           1.24^            #\n" +
                    "alpha_homing_direction                       home_to_min      # or set to home_to_max and set alpha_max\n" +
                    "alpha_min                                    0                # this gets loaded after homing when home_to_min is set\n" +
                    "alpha_max                                    380              # this gets loaded after homing when home_to_max is set\n" +
                    "beta_min_endstop                             1.26^            #\n" +
                    "#beta_max_endstop                            1.26^            #\n" +
                    "beta_homing_direction                        home_to_min      #\n" +
                    "beta_min                                     0                #\n" +
                    "beta_max                                     440              #\n" +
                    "gamma_min_endstop                            1.29^            #\n" +
                    "#gamma_max_endstop                           1.29^            #\n" +
                    "gamma_homing_direction                       home_to_min      #\n" +
                    "gamma_min                                    0                #\n" +
                    "gamma_max                                    180              #\n" +
                    "\n" +
                    "# optional enable limit switches, actions will stop if any enabled limit switch is triggered\n" +
                    "#alpha_limit_enable                          false            # set to true to enable X min and max limit switches\n" +
                    "#beta_limit_enable                           false            # set to true to enable Y min and max limit switches\n" +
                    "#gamma_limit_enable                          false            # set to true to enable Z min and max limit switches\n" +
                    "\n" +
                    "#probe endstop\n" +
                    "#probe_pin                                   1.29             # optional pin for probe\n" +
                    "\n" +
                    "alpha_fast_homing_rate_mm_s                  50               # feedrates in mm/second\n" +
                    'beta_fast_homing_rate_mm_s                   50               # "\n' +
                    'gamma_fast_homing_rate_mm_s                  4                # "\n' +
                    'alpha_slow_homing_rate_mm_s                  25               # "\n' +
                    'beta_slow_homing_rate_mm_s                   25               # "\n' +
                    'gamma_slow_homing_rate_mm_s                  2                # "\n' +
                    "\n" +
                    "alpha_homing_retract_mm                      5                # distance in mm\n" +
                    'beta_homing_retract_mm                       5                # "\n' +
                    'gamma_homing_retract_mm                      5                # "\n' +
                    "\n" +
                    "#endstop_debounce_count                       100              # uncomment if you get noise on your endstops, default is 100\n" +
                    "\n" +
                    "# optional Z probe\n" +
                    "zprobe.enable                                false           # set to true to enable a zprobe\n" +
                    "#zprobe.probe_pin                             1.29!^          # pin probe is attached to if NC remove the !\n" +
                    "#zprobe.slow_feedrate                         5               # mm/sec probe feed rate\n" +
                    "#zprobe.debounce_count                       100             # set if noisy\n" +
                    "#zprobe.fast_feedrate                         100             # move feedrate mm/sec\n" +
                    "#zprobe.probe_height                          5               # how much above bed to start probe\n" +
                    "\n" +
                    "# associated with zprobe the leveling strategy to use\n" +
                    "#leveling-strategy.three-point-leveling.enable         true        # a leveling strategy that probes three points to define a plane and keeps the Z parallel to that plane\n" +
                    "#leveling-strategy.three-point-leveling.point1         100.0,0.0   # the first probe point (x,y) optional may be defined with M557\n" +
                    "#leveling-strategy.three-point-leveling.point2         200.0,200.0 # the second probe point (x,y)\n" +
                    "#leveling-strategy.three-point-leveling.point3         0.0,200.0   # the third probe point (x,y)\n" +
                    "#leveling-strategy.three-point-leveling.home_first     true        # home the XY axis before probing\n" +
                    "#leveling-strategy.three-point-leveling.tolerance      0.03        # the probe tolerance in mm, anything less that this will be ignored, default is 0.03mm\n" +
                    "#leveling-strategy.three-point-leveling.probe_offsets  0,0,0       # the probe offsets from nozzle, must be x,y,z, default is no offset\n" +
                    "#leveling-strategy.three-point-leveling.save_plane     false       # set to true to allow the bed plane to be saved with M500 default is false\n" +
                    "\n" +
                    "\n" +
                    "# Pause button\n" +
                    "pause_button_enable                          true             #\n" +
                    "\n" +
                    "# Panel See http://smoothieware.org/panel\n" +
                    "panel.enable                                 true            # set to true to enable the panel code\n" +
                    "\n" +
                    "# Example viki2 config for an azteeg miniV2 with IDC cable\n" +
                    "panel.lcd                                    viki2             # set type of panel\n" +
                    "panel.spi_channel                            0                 # set spi channel to use P0_18,P0_15 MOSI,SCLK\n" +
                    "panel.spi_cs_pin                             0.16              # set spi chip select\n" +
                    "panel.encoder_a_pin                          3.25!^            # encoder pin\n" +
                    "panel.encoder_b_pin                          3.26!^            # encoder pin\n" +
                    "panel.click_button_pin                       2.11!^            # click button\n" +
                    "panel.a0_pin                                 2.6               # st7565 needs an a0\n" +
                    "panel.contrast                              8                 # override contrast setting (default is 9)\n" +
                    "panel.encoder_resolution                    4                 # override number of clicks to move 1 item (default is 4)\n" +
                    "#panel.button_pause_pin                      1.22^             # kill/pause set one of these for the auxilliary button on viki2\n" +
                    "#panel.back_button_pin                       1.22!^            # back button recommended to use this on EXP1\n" +
                    "panel.buzz_pin                               1.30              # pin for buzzer on EXP2\n" +
                    "panel.red_led_pin                            0.26               # pin for red led on viki2 on EXP1\n" +
                    "panel.blue_led_pin                           1.21              # pin for blue led on viki2 on EXP1\n" +
                    "panel.external_sd                            true              # set to true if there is an extrernal sdcard on the panel\n" +
                    "panel.external_sd.spi_channel                0                 # set spi channel the sdcard is on\n" +
                    "panel.external_sd.spi_cs_pin                 1.23              # set spi chip select for the sdcard\n" +
                    "panel.external_sd.sdcd_pin                   1.31!^            # sd detect signal (set to nc if no sdcard detect)\n" +
                    "panel.menu_offset                            1                 # some panels will need 1 here\n" +
                    "\n" +
                    "\n" +
                    "# Example miniviki2 config\n" +
                    "#panel.lcd                                    mini_viki2        # set type of panel\n" +
                    "#panel.spi_channel                            0                 # set spi channel to use P0_18,P0_15 MOSI,SCLK\n" +
                    "#panel.spi_cs_pin                             0.16              # set spi chip select\n" +
                    "#panel.encoder_a_pin                          3.25!^            # encoder pin\n" +
                    "#panel.encoder_b_pin                          3.26!^            # encoder pin\n" +
                    "#panel.click_button_pin                       2.11!^            # click button\n" +
                    "#panel.a0_pin                                 2.6               # st7565 needs an a0\n" +
                    "##panel.contrast                               18                # override contrast setting (default is 18)\n" +
                    "##panel.encoder_resolution                     2                 # override number of clicks to move 1 item (default is 2)\n" +
                    "#panel.menu_offset                            1                 # here controls how sensitive the menu is. some panels will need 1\n" +
                    "\n" +
                    "panel.alpha_jog_feedrate                     1000              # x jogging feedrate in mm/min\n" +
                    "panel.beta_jog_feedrate                      1000              # y jogging feedrate in mm/min\n" +
                    "panel.gamma_jog_feedrate                     4               # z jogging feedrate in mm/min\n" +
                    "\n" +
                    "#panel.hotend_temperature                     185               # temp to set hotend when preheat is selected\n" +
                    "#panel.T1_temperature                     185               # temp to set hotend when preheat is selected\n" +
                    "#panel.bed_temperature                        60                # temp to set bed when preheat is selected\n" +
                    "\n" +
                    "# Example of a custom menu entry, which will show up in the Custom entry.\n" +
                    "# NOTE _ gets converted to space in the menu and commands, | is used to separate multiple commands\n" +
                    "custom_menu.power_on.enable                true              #\n" +
                    "custom_menu.power_on.name                  Light_on          #\n" +
                    "custom_menu.power_on.command               M800               #\n" +
                    "\n" +
                    "custom_menu.power_off.enable               true              #\n" +
                    "custom_menu.power_off.name                 Light_off         #\n" +
                    "custom_menu.power_off.command M801 #\n" +
                    "\n" +
                    "# RE-ARM specific settings do not change\n" +
                    "currentcontrol_module_enable                 false            #\n" +
                    "digipot_max_current                          2.4             # max current\n" +
                    "digipot_factor                               106.0           # factor for converting current to digipot value\n" +
                    "leds_disable                                 true             # disable using leds after config loaded\n" +
                    "\n" +
                    "# network settings\n" +
                    "network.enable                               false            # enable the ethernet network services\n" +
                    "#network.webserver.enable                     true             # enable the webserver\n" +
                    "#network.telnet.enable                        true             # enable the telnet server\n" +
                    "#network.plan9.enable                         true             # enable the plan9 network filesystem\n" +
                    "#network.ip_address                           auto             # the IP address\n" +
                    "#network.ip_mask                             255.255.255.0    # the ip mask\n" +
                    "#network.ip_gateway                          192.168.3.1      # the gateway address\n" +
                    "\n" +
                    "return_error_on_unhandled_gcode              false            #\n" +
                    "ok\n"
            )

        res.send("")
        return
    }

    if (url.indexOf("ESP800") != -1) {
        console.log(targetFW)
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
            Cam_ID: "4",
            Cam_name: "ESP32 Cam",
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
                case "10":
                    targetFW = "grbl"
                    break
                case "50":
                    targetFW = "repetier"
                    break
                case "20":
                    targetFW = "marlin"
                    break
                case "35":
                    targetFW = "marlinkimbra"
                    break
                case "40":
                    targetFW = "smoothieware"
                    console.log("smoothieware")
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
                { SSID: "ZenFone6&#39;luc", SIGNAL: "48", IS_PROTECTED: "1" },
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
                },
                {
                    F: "network/sta",
                    P: "1",
                    T: "S",
                    V: "WIFI_OFFICE_B2G",
                    S: "32",
                    H: "SSID",
                    M: "1",
                },
                {
                    F: "network/sta",
                    P: "34",
                    T: "S",
                    N: "1",
                    V: "********",
                    S: "64",
                    H: "pwd",
                    M: "8",
                },
                {
                    F: "network/sta",
                    P: "99",
                    T: "B",
                    V: "1",
                    H: "ip mode",
                    O: [{ dhcp: "1" }, { static: "0" }],
                },
                {
                    F: "network/sta",
                    P: "100",
                    T: "A",
                    V: "192.168.0.1",
                    H: "ip",
                },
                {
                    F: "network/sta",
                    P: "108",
                    T: "A",
                    V: "192.168.0.1",
                    H: "gw",
                },
                {
                    F: "network/sta",
                    P: "104",
                    T: "A",
                    V: "255.255.255.0",
                    H: "msk",
                },
                {
                    F: "network/ap",
                    P: "218",
                    T: "S",
                    V: "ESP3D",
                    S: "32",
                    H: "SSID",
                    M: "1",
                },
                {
                    F: "network/ap",
                    P: "251",
                    T: "S",
                    N: "1",
                    V: "********",
                    S: "64",
                    H: "pwd",
                    M: "8",
                },
                {
                    F: "network/ap",
                    P: "316",
                    T: "A",
                    V: "192.168.0.1",
                    H: "ip",
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
                    V: targetFWnb,
                    H: "targetfw",
                    O: [
                        { repetier: "50" },
                        { marlin: "20" },
                        { marlinkimbra: "35" },
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
                {
                    F: "system/system",
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
    SendBinary("ok\n")
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
    let nb = 0
    let totalused = getTotalSize(__dirname + "/public")
    let total = 1.31 * 1024 * 1024
    fs.readdirSync(__dirname + "/public" + mypath).forEach((fileelement) => {
        let fst = fs.statSync(
            __dirname +
                "/public" +
                mypath +
                (mypath.length > 0 ? "/" : "") +
                fileelement
        )
        let fsize = -1

        if (fst.isFile()) {
            fsize = fileSizeString(fst.size)
        }
        if (nb > 0) res += ","
        res += '{"name":"' + fileelement + '","size":"' + fsize + '"}'
        nb++
    })
    res +=
        '],"path":"' +
        mypath +
        '","occupation":"' +
        ((100 * totalused) / total).toFixed(0) +
        '","status":"ok","total":"' +
        fileSizeString(total) +
        '","used":"' +
        fileSizeString(totalused) +
        '"}'
    return res
}

const getAllFiles = function (dirPath, arrayOfFiles) {
    let files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(dirPath + "/" + file)
        }
    })

    return arrayOfFiles
}

const getTotalSize = function (directoryPath) {
    const arrayOfFiles = getAllFiles(directoryPath)

    let totalSize = 0

    arrayOfFiles.forEach(function (filePath) {
        totalSize += fs.statSync(filePath).size
    })

    return totalSize
}

function deleteFolderRecursive(path) {
    if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file

            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath)
            } else {
                // delete file
                fs.unlinkSync(curPath)
            }
        })

        console.log(`Deleting directory "${path}"...`)
        if (fs.existsSync(path)) fs.rmdirSync(path)
    } else console.log(`No directory "${path}"...`)
}

app.all("/updatefw", function (req, res) {
    res.send("ok")
})

app.all("/files", function (req, res) {
    let mypath = req.query.path
    var url = req.originalUrl

    if (url.indexOf("action=deletedir") != -1) {
        let filename = req.query.filename
        let filepath =
            __dirname +
            "/public" +
            mypath +
            (mypath == "/" ? "" : "/") +
            filename
        console.log("delete directory " + filepath)
        deleteFolderRecursive(filepath)
        fs.readdirSync(mypath)
    } else if (url.indexOf("action=delete") != -1) {
        let filename = req.query.filename
        let filepath =
            __dirname +
            "/public" +
            mypath +
            (mypath == "/" ? "" : "/") +
            filename
        fs.unlinkSync(filepath)
        console.log("delete file " + filepath)
    }
    if (url.indexOf("action=createdir") != -1) {
        let filename = req.query.filename
        let filepath =
            __dirname +
            "/public" +
            mypath +
            (mypath == "/" ? "" : "/") +
            filename
        fs.mkdirSync(filepath)
        console.log("new directory " + filepath)
    }
    if (typeof mypath == "undefined") {
        if (typeof req.body.path == "undefined") {
            console.log("path is not defined")
            mypath = "/"
        } else {
            mypath = req.body.path + "/"
        }
    }
    console.log("path is " + mypath)
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.send(filesList(mypath))
    }
    let myFile = req.files.myfile
    if (typeof myFile.length == "undefined") {
        console.log("one files")
        myFile.mv(__dirname + "/public" + mypath + myFile.name, function (err) {
            if (err) return res.status(500).send(err)
        })
    } else {
        console.log(myFile.length + " files")
        for (let i = 0; i < myFile.length; i++) {
            console.log(__dirname + "/public/" + mypath + myFile[i].name)
            myFile[i].mv(
                __dirname + "/public/" + mypath + myFile[i].name,
                function (err) {
                    if (err) return res.status(500).send(err)
                }
            )
        }
    }
    res.send(filesList(mypath))
})

app.listen(process.env.PORT || 8080, () =>
    console.log(`Listening on port ${process.env.PORT || 8080}!`)
)

setInterval

wss.on("connection", function (ws) {
    console.log("New connection")
    ws.send(`currentID:${currentID}`)
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(`activeID:${currentID}`)
        }
    })
    currentID++
    ws.on("message", function (message) {
        console.log("received: %s", message)
    })
})
