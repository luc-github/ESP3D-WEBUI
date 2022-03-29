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

const chalk = require("chalk");
const wscolor = chalk.cyan;
const expresscolor = chalk.green;
const commandcolor = chalk.white;
const enableAuthentication = false;
let lastconnection = Date.now();
let logindone = false;
const sessiontTime = 60000;

function getLastconnection() {
  return lastconnection;
}

function hasEnabledAuthentication() {
  return enableAuthentication;
}

function sendTemperatures() {
  let T = Number(Math.floor(Math.random() * 215).toFixed(2));
  let T1 = Number(Math.floor(Math.random() * 215).toFixed(2));
  let B = Number(Math.floor(Math.random() * 45).toFixed(2));
  return (
    "ok T:" +
    T +
    " /200 R:" +
    (T * 1.1).toFixed(2) +
    " /200 B:" +
    B +
    " / 0 B1:" +
    T +
    " / 0 P:" +
    (B * 1.3).toFixed(2) +
    " / 0 C:" +
    B * 2 +
    " / 0 T1:" +
    T1 +
    " / 0 @1:0\n"
  );
}

const commandsQuery = (req, res, SendWS) => {
  let url = req.query.cmd ? req.query.cmd : req.originalUrl;
  if (req.query.cmd)
    console.log(commandcolor(`[server]/command params: ${req.query.cmd}`));
  else console.log(commandcolor(`[server]/command : ${url}`));
  if (url.indexOf("PING") != -1) {
    lastconnection = Date.now();
    res.status(200);
    res.send("ok\n");
    console.log(commandcolor(`[server]/command :PING`));
    return;
  }

  if (!logindone && enableAuthentication) {
    res.status(401);
    return;
  }
  lastconnection = Date.now();
  if (url.indexOf("M20") != -1) {
    SendWS(
      "Begin file list\n" +
        "CUBE2.GCO 210240\n" +
        "CUBE01.GCO 2089832\n" +
        "SUPPORT2.GCO 4613256\n" +
        "ARCHIVE/CUBE.GCO 210240\n" +
        "ARCHIVE/CUBE-C~1.GCO 210240\n" +
        "NEWFOL~1/SUPPORT2.GCO 4613256\n" +
        "End file list\n" +
        "ok\n"
    );
    /* SendWS(
      "Begin file list\n" +
        "COOL_V~1.GCO 66622272\n" +
        "415%VA~1.GCO 66622272\n" +
        "/ARCHIEVE/SUBDIR/TWISTY~1.GCO 1040\n" +
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
    );*/
    res.send("");
    return;
  }

  if (url.indexOf("M30") != -1) {
    const name = url.split(" ");
    SendWS(
      //"Deletion failed, File:" + name[1].substring(1) + ".\n" + "ok\n"
      "File deleted:" + name[1].substring(1) + "\n" + "ok\n"
    );

    res.send("");
    return;
  }
  if (url.indexOf("M115") != -1) {
    SendWS(
      "FIRMWARE_NAME:Marlin 2.0.9.1 (Sep  8 2021 17:07:06) SOURCE_CODE_URL:github.com/MarlinFirmware/Marlin PROTOCOL_VERSION:1.0 MACHINE_TYPE:MRR ESPA EXTRUDER_COUNT:1 UUID:cede2a2f-41a2-4748-9b12-c55c62f367ff\n" +
        "Cap:SERIAL_XON_XOFF:0\n" +
        "Cap:BINARY_FILE_TRANSFER:0\n" +
        "Cap:EEPROM:0\n" +
        "Cap:VOLUMETRIC:1\n" +
        "Cap:AUTOREPORT_POS:0\n" +
        "Cap:AUTOREPORT_TEMP:1\n" +
        "Cap:PROGRESS:0\n" +
        "Cap:PRINT_JOB:1\n" +
        "Cap:AUTOLEVEL:0\n" +
        "Cap:RUNOUT:0\n" +
        "Cap:Z_PROBE:0\n" +
        "Cap:LEVELING_DATA:0\n" +
        "Cap:BUILD_PERCENT:0\n" +
        "Cap:SOFTWARE_POWER:0\n" +
        "Cap:TOGGLE_LIGHTS:0\n" +
        "Cap:CASE_LIGHT_BRIGHTNESS:0\n" +
        "Cap:EMERGENCY_PARSER:0\n" +
        "Cap:HOST_ACTION_COMMANDS:0\n" +
        "Cap:PROMPT_SUPPORT:0\n" +
        "Cap:SDCARD:1\n" +
        "Cap:REPEAT:0\n" +
        "Cap:SD_WRITE:1\n" +
        "Cap:AUTOREPORT_SD_STATUS:0\n" +
        "Cap:LONG_FILENAME:1\n" +
        "Cap:THERMAL_PROTECTION:1\n" +
        "Cap:MOTION_MODES:0\n" +
        "Cap:ARCS:1\n" +
        "Cap:BABYSTEPPING:0\n" +
        "Cap:CHAMBER_TEMPERATURE:0\n" +
        "Cap:COOLER_TEMPERATURE:0\n" +
        "Cap:MEATPACK:0\n" +
        "ok\n"
    );
    res.send("");
    return;
  }
  if (url.indexOf("M503") != -1) {
    SendWS(
      "echo:  G21    ; Units in mm (mm)\n" +
        "      \n" +
        "echo:; Filament settings: Disabled\n" +
        "echo:  M200 S0 D1.75\n" +
        "echo:; Steps per unit:\n" +
        "echo: M92 X80.00 Y80.00 Z400.00 E500.00\n" +
        "echo:; Maximum feedrates (units/s):\n" +
        "echo:  M203 X300.00 Y300.00 Z5.00 E25.00\n" +
        "echo:; Maximum Acceleration (units/s2):\n" +
        "echo:  M201 X3000.00 Y3000.00 Z100.00 E10000.00\n" +
        "echo:; Acceleration (units/s2): P<print_accel> R<retract_accel> T<travel_accel>\n" +
        "echo:  M204 P3000.00 R3000.00 T3000.00\n" +
        "echo:; Advanced: B<min_segment_time_us> S<min_feedrate> T<min_travel_feedrate> J<junc_dev>\n" +
        "echo:  M205 B20000.00 S0.00 T0.00 J0.01\n" +
        "echo:; Home offset:\n" +
        "echo:  M206 X0.00 Y0.00 Z0.00\n" +
        "echo:; PID settings:\n" +
        "echo:  M301 P22.20 I1.08 D114.00\n" +
        "ok\n"
    );
    res.send("");
    return;
  }

  if (url.indexOf("M105") != -1) {
    SendWS(sendTemperatures());
    res.send("");
    return;
  }

  if (url.indexOf("ESP800") != -1) {
    res.json({
      cmd: "800",
      status: "ok",
      data: {
        FWVersion: "3.0.0.a111",
        FWTarget: "reprap",
        FWTargetID: "70",
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
        FileSystem: "LittleFS",
        Time: "none",
      },
    });
    return;
  }
  if (url.indexOf("ESP111") != -1) {
    res.send("192.168.1.111");
    return;
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
        { id: "targetfw", value: "reprap" },
        { id: "FW ver", value: "3.0.0.a111" },
        { id: "FW arch", value: "ESP32" },
      ],
    });
    return;
  }

  if (url.indexOf("ESP410") != -1) {
    res.json({
      cmd: "410",
      status: "ok",
      data: [{ SSID: "luc-ext1", SIGNAL: "52", IS_PROTECTED: "1" }],
    });
    return;
  }

  if (url.indexOf("ESP600") != -1) {
    const text = url.substring(8);
    SendWS(text, false);
    return;
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
          O: [{ none: "0" }, { pushover: "1" }, { email: "2" }, { line: "3" }],
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
          V: "40",
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
      ],
    });
    return;
  }
  SendWS("ok\n");
  res.send("");
};

const loginURI = (req, res) => {
  if (req.body.DISCONNECT == "Yes") {
    res.status(401);
    logindone = false;
  } else if (req.body.USER == "admin" && req.body.PASSWORD == "admin") {
    logindone = true;
    lastconnection = Date.now();
  } else {
    res.status(401);
    logindone = false;
  }
  res.send("");
};

const configURI = (req, res) => {
  if (!logindone && enableAuthentication) {
    res.status(401);
    return;
  }
  lastconnection = Date.now();
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
  );
};

module.exports = {
  commandsQuery,
  configURI,
  loginURI,
  getLastconnection,
  hasEnabledAuthentication,
};
