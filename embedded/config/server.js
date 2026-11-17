const express = require("express");
const chalk = require("chalk");
let path = require("path");
const fs = require("fs");
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
/*
 * Web Server for development
 * Web Socket server for development
 *
 * Secure test mode (`npm run dev secure`): Caddy terminates TLS in front of
 * this mock (config/Caddyfile), like the webui dev flow:
 *   https://localhost:8443 -> webpack dev server 8088 (dev bundle)
 *   https://localhost:8445 -> this mock 8080 (packaged page + /ws upgrade)
 *   wss://localhost:8444   -> this mock's WebSocket 81
 * The launcher sets WS_PUBLIC_PORT=8444 so [ESP800] reports the secure port.
 * No native TLS here on purpose: a self-signed certificate cannot be accepted
 * for a WebSocket connection (the wss handshake has no browser error UI), so
 * the test server would create failures to manage instead of running tests -
 * Caddy's local CA is installed in the OS trust store and avoids the issue.
 * WEBCOMM=Asynchronous switches the reported [ESP800] WebCommunication.
 */
const wscolor = chalk.cyan;
const expresscolor = chalk.green;
const commandcolor = chalk.white;
const WebSocket = require("ws");
let currentID = 0;
const app = express();
const fileUpload = require("express-fileupload");
let serverpath = path.normalize(__dirname + "/../server/public/");
let sdpath = path.normalize(__dirname + "/../server/sd/");

//Optional host path, like the firmware HostPath (e.g. "/www" on grblHAL):
//the /files query API and the default document are rooted at it, while
//static URLs and uploads use absolute FS paths. Set it as first CLI
//argument (npm run server -- /www) or with the HOSTPATH env var
//(default "/"); fixtures must then live under server/public/www/.
//See docs/hostpath_files_api.md
let hostPathValue = process.argv[2] || process.env.HOSTPATH || "/";
//Git Bash mangles leading-/ arguments into Windows paths - reject with a
//hint rather than rooting the FS at a nonsense location
if (/^[A-Za-z]:[\\/]/.test(hostPathValue)) {
    console.log(
        `[server] Invalid hostPath "${hostPathValue}" - in Git Bash use //www instead of /www, or use PowerShell`
    );
    process.exit(1);
}
if (!hostPathValue.startsWith("/")) hostPathValue = "/" + hostPathValue;
const hostPath = hostPathValue.replace(/\/+$/, "") || "/";
const filesRoot =
    hostPath == "/" ? serverpath : path.join(serverpath, "." + hostPath);

//Authentication simulation (dev.js `auth` flag / AUTH=1 env var): same
//convention as the main mock - admin/admin, DISCONNECT=YES to log out
const enableAuthentication = process.env.AUTH === "1";
let logindone = false;
const checkAuthentication = (req, res) => {
    if (enableAuthentication && !logindone) {
        res.status(401).send("Authentication required");
        return false;
    }
    return true;
};

let WebSocketServer = require("ws").Server;
// All WebSocket endpoints share one connection handler and one broadcast
// list:
//  - standalone ws on 81 (wss://localhost:8444 via Caddy in secure mode)
//  - /ws upgrade on the HTTP page port, like the firmware
//    ("Asynchronous" mode connects to window.location.host + /ws)
const wsServers = [];
function registerWsServer(server, label) {
    wsServers.push(server);
    server.on("connection", onWsConnection);
    server.on("error", (error) => {
        console.log(wscolor(`[ws] Error (${label}):`), error);
    });
}
function forEachWsClient(callback) {
    wsServers.forEach((server) => server.clients.forEach(callback));
}
registerWsServer(
    new WebSocketServer({
        port: 81,
        handleProtocols: function (protocol) {
            console.log("protocol received from client " + protocol);
            return "webui-v3";
        },
    }),
    "81"
);
app.use(fileUpload({ preserveExtension: true, debug: false }));

// Like the firmware: serve the packaged page from the "flash" dir, looking
// at the FS root first, then under the host path. Brotli is only used when
// the browser advertises it in Accept-Encoding - which browsers only do
// over HTTPS, matching the firmware behavior
app.use("/", (req, res, next) => {
    if (req.method !== "GET" || /\.(gz|br)$/.test(req.path)) return next();
    const relPath = !req.path || req.path === "/" ? "index.html" : req.path;
    const acceptsBr = /\bbr\b/.test(req.headers["accept-encoding"] || "");
    const candidates = [path.join(serverpath, relPath)];
    if (hostPath != "/")
        candidates.push(path.join(serverpath, "." + hostPath, relPath));
    for (const base of candidates) {
        for (const [ext, encoding] of acceptsBr
            ? [[".br", "br"], [".gz", "gzip"]]
            : [[".gz", "gzip"]]) {
            const file = base + ext;
            if (fs.existsSync(file) && fs.statSync(file).isFile()) {
                res.setHeader("Content-Type", "text/html");
                res.setHeader("Content-Encoding", encoding);
                res.setHeader("Vary", "Accept-Encoding");
                console.log(
                    `[server] ${relPath} -> ${path.basename(file)} (Accept-Encoding: ${req.headers["accept-encoding"] || "none"})`
                );
                return res.sendFile(path.resolve(file));
            }
        }
    }
    next();
});
app.use("/", express.static(serverpath));

const httpServer = app.listen(port, () =>
    console.log(
        expresscolor(
            `[express] Listening on port ${port}!` +
                (hostPath == "/" ? "" : ` (HostPath: ${hostPath})`) +
                (enableAuthentication ? " (auth: admin/admin)" : "")
        )
    )
);
registerWsServer(
    new WebSocketServer({ server: httpServer, path: "/ws" }),
    "http/ws"
);

//app.use(express.urlencoded({ extended: false }));

function SendBinary(text) {
    const array = new Uint8Array(text.length);
    for (let i = 0; i < array.length; ++i) {
        array[i] = text.charCodeAt(i);
    }
    forEachWsClient(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(array);
        }
    });
}

app.post("/login", function (req, res) {
    if (req.body.DISCONNECT == "YES") {
        logindone = false;
        res.status(401);
    } else if (
        !enableAuthentication ||
        (req.body.USER == "admin" && req.body.PASSWORD == "admin")
    ) {
        logindone = true;
    } else {
        logindone = false;
        res.status(401);
    }
    res.send("");
    return;
});

app.get("/config", function (req, res) {
    if (!checkAuthentication(req, res)) return;
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
    return;
});

app.get("/command", function (req, res) {
    if (!checkAuthentication(req, res)) return;
    console.log(commandcolor(`[server]/command params: ${req.query.cmd}`));
    let url = req.query.cmd;
    if (url.startsWith("[ESP800]json")) {
        res.json({
            cmd: "800",
            status: "ok",
            data: {
                FWVersion: "3.0.0.a28",
                FWTarget: 40,
                SDConnection: "none",
                Authentication: enableAuthentication ? "Enabled" : "Disabled",
                WebCommunication: process.env.WEBCOMM || "Synchronous",
                WebSocketIP: "localhost",
                WebSocketPort: process.env.WS_PUBLIC_PORT || "81",
                Hostname: "esp3d",
                WiFiMode: "STA",
                WebUpdate: "Enabled",
                FlashFileSystem: "LittleFs",
                HostPath: hostPath,
                Time: "none",
                Cam_ID: "4",
                Cam_name: "ESP32 Cam",
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
        });
        return;
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
        });
        return;
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
                        { 1000000: "1000000" },
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
        });
        return;
    }
    SendBinary("ok\n");
    res.send("");
});

function fileSizeString(size) {
    let s;
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
    if (size < 1024 * 1024 * 1024)
        return (size / (1024 * 1024)).toFixed(2) + " MB";
    if (size < 1024 * 1024 * 1024 * 1024)
        return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    return "X B";
}

function filesList(mypath, mainpath) {
    let res = '{"files":[';
    let nb = 0;
    let total = sdpath == mainpath ? 4096 * 1024 * 1024 : 1.2 * 1024 * 1024;
    let totalused = getTotalSize(mainpath);
    let currentpath = path.normalize(mainpath + mypath);
    console.log("[path]" + currentpath);
    fs.readdirSync(currentpath).forEach((fileelement) => {
        let fullpath = path.normalize(currentpath + "/" + fileelement);
        let fst = fs.statSync(fullpath);
        let fsize = -1;

        if (fst.isFile()) {
            fsize = fileSizeString(fst.size);
        }
        if (nb > 0) res += ",";
        res += '{"name":"' + fileelement + '","size":"' + fsize + '"}';
        nb++;
    });
    res +=
        '],"path":"' +
        mypath +
        '","occupation":"' +
        ((100 * totalused) / total).toFixed(0) +
        '","status":"ok","total":"' +
        fileSizeString(total) +
        '","used":"' +
        fileSizeString(totalused) +
        '"}';
    return res;
}

const getAllFiles = function (dirPath, arrayOfFiles) {
    let files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(dirPath + "/" + file);
        }
    });

    return arrayOfFiles;
};

const getTotalSize = function (directoryPath) {
    const arrayOfFiles = getAllFiles(directoryPath);

    let totalSize = 0;

    arrayOfFiles.forEach(function (filePath) {
        totalSize += fs.statSync(filePath).size;
    });

    return totalSize;
};

function deleteFolderRecursive(path) {
    if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
        fs.readdirSync(path).forEach(function (file, index) {
            let curPath = path + "/" + file;

            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });

        console.log(`[server]Deleting directory "${path}"...`);
        if (fs.existsSync(path)) fs.rmdirSync(path);
    } else console.log(`[server]No directory "${path}"...`);
}

app.all("/updatefw", function (req, res) {
    if (!checkAuthentication(req, res)) return;
    res.send("ok");
});

app.all("/sdfiles", function (req, res) {
    if (!checkAuthentication(req, res)) return;
    let mypath = req.query.path;
    let url = req.originalUrl;
    let filepath = path.normalize(sdpath + mypath + "/" + req.query.filename);
    if (url.indexOf("action=deletedir") != -1) {
        console.log("[server]delete directory " + filepath);
        deleteFolderRecursive(filepath);
        fs.readdirSync(mypath);
    } else if (url.indexOf("action=delete") != -1) {
        fs.unlinkSync(filepath);
        console.log("[server]delete file " + filepath);
    }
    if (url.indexOf("action=createdir") != -1) {
        fs.mkdirSync(filepath);
        console.log("[server]new directory " + filepath);
    }
    if (typeof mypath == "undefined") {
        if (typeof req.body.path == "undefined") {
            console.log("[server]path is not defined");
            mypath = "/";
        } else {
            mypath = (req.body.path == "/" ? "" : req.body.path) + "/";
        }
    }
    console.log("[server]path is " + mypath);
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.send(filesList(mypath, sdpath));
    }
    let myFile = req.files.myfiles;
    if (typeof myFile.length == "undefined") {
        let fullpath = path.normalize(sdpath + mypath + myFile.name);
        console.log("[server]one file:" + fullpath);
        myFile.mv(fullpath, function (err) {
            if (err) return res.status(500).send(err);
            res.send(filesList(mypath, sdpath));
        });
        return;
    } else {
        console.log(myFile.length + " files");
        for (let i = 0; i < myFile.length; i++) {
            let fullpath = path.normalize(sdpath + mypath + myFile[i].name);
            console.log(fullpath);
            myFile[i].mv(fullpath).then(() => {
                if (i == myFile.length - 1) res.send(filesList(mypath, sdpath));
            });
        }
    }
});

app.all("/files", function (req, res) {
    if (!checkAuthentication(req, res)) return;
    let mypath = req.query.path;
    let url = req.originalUrl;
    //Query-driven actions (list/delete/createdir) use paths relative to the
    //host path; uploads use absolute FS paths - docs/hostpath_files_api.md
    let filepath = path.normalize(
        filesRoot + (mypath || "/") + "/" + req.query.filename
    );
    if (url.indexOf("action=deletedir") != -1) {
        console.log("[server]delete directory " + filepath);
        deleteFolderRecursive(filepath);
    } else if (url.indexOf("action=delete") != -1) {
        fs.unlinkSync(filepath);
        console.log("[server]delete file " + filepath);
    }
    if (url.indexOf("action=createdir") != -1) {
        fs.mkdirSync(filepath);
        console.log("[server]new directory " + filepath);
    }
    if (typeof mypath == "undefined") {
        if (typeof req.body.path == "undefined") {
            console.log("[server]path is not defined");
            mypath = "/";
        } else {
            mypath = (req.body.path == "/" ? "" : req.body.path) + "/";
        }
    }
    console.log("[server]path is " + mypath);
    //uploads report their directory as an absolute FS path ("/www/...") -
    //bring it back to a host-path-relative path for the listing response
    const listPath =
        hostPath != "/" && mypath.startsWith(hostPath + "/")
            ? mypath.substring(hostPath.length)
            : mypath;
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.send(filesList(listPath, filesRoot));
    }
    let myFile = req.files.myfiles;
    //the multipart filename is the absolute FS path - use it as-is when it
    //is under the host path, fall back to the (host-path-relative) upload
    //directory otherwise
    const toAbsolute = (name) =>
        name && hostPath != "/" && name.startsWith(hostPath + "/")
            ? path.normalize(serverpath + name)
            : path.normalize(filesRoot + listPath + name);
    if (typeof myFile.length == "undefined") {
        let fullpath = toAbsolute(myFile.name);
        console.log("[server]one file:" + fullpath);
        myFile.mv(fullpath, function (err) {
            if (err) return res.status(500).send(err);
            res.send(filesList(listPath, filesRoot));
        });
        return;
    } else {
        console.log(myFile.length + " files");
        for (let i = 0; i < myFile.length; i++) {
            let fullpath = toAbsolute(myFile[i].name);
            console.log(fullpath);
            myFile[i].mv(fullpath).then(() => {
                if (i == myFile.length - 1)
                    res.send(filesList(listPath, filesRoot));
            });
        }
    }
});

function onWsConnection(socket, request) {
    console.log(wscolor("[ws] New connection"));
    console.log(wscolor(`[ws] currentID:${currentID}`));
    socket.send(`currentID:${currentID}`);
    forEachWsClient(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(`activeID:${currentID}`);
        }
    });
    currentID++;
    socket.on("message", (message) => {
        console.log(wscolor("[ws] received: %s", message));
    });
}
