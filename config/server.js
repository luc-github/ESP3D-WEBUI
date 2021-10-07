const express = require("express");
const chalk = require("chalk");
let path = require("path");
const fs = require("fs");
const port = 8080;
/*
 * Web Server for development
 * Web Socket server for development
 */
const wscolor = chalk.cyan;
const expresscolor = chalk.green;
const commandcolor = chalk.white;
const WebSocket = require("ws");
let currentID = 0;
const app = express();
const fileUpload = require("express-fileupload");

const serverpath = path.normalize(__dirname + "/../server/public/");
const subtarget = process.env.SUBTARGET_ENV
  ? process.env.SUBTARGET_ENV
  : "Marlin";
const target = process.env.TARGET_ENV ? process.env.TARGET_ENV : "Printer3D";

const {
  commandsQuery,
  configURI,
  getLastconnection,
  hasEnabledAuthentication,
} = require(path.normalize(
  __dirname + "/targets/" + target + "/" + subtarget + "/index.js"
));

const WebSocketServer = require("ws").Server,
  wss = new WebSocketServer({ port: 81 });
app.use("/", express.static(serverpath));
app.use(fileUpload({ preserveExtension: true, debug: false }));

app.listen(port, () => console.log("Env:", subtarget, ":", target));
app.timeout = 2000;

//app.use(express.urlencoded({ extended: false }));

function SendBinary(text) {
  const array = new Uint8Array(text.length);
  for (let i = 0; i < array.length; ++i) {
    array[i] = text.charCodeAt(i);
  }
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(array);
    }
  });
}

app.post("/login", function (req, res) {
  loginURI(req, res);
});

app.get("/config", function (req, res) {
  configURI(req, res);
});

app.get("/command", function (req, res) {
  commandsQuery(req, res, SendBinary);
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

function filesList(mypath) {
  let res = '{"files":[';
  let nb = 0;
  let total = 1.31 * 1024 * 1024;
  let totalused = getTotalSize(serverpath);
  let currentpath = path.normalize(serverpath + mypath);
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
  res.send("ok");
});

app.all("/files", function (req, res) {
  let mypath = req.query.path;
  let url = req.originalUrl;
  let filepath = path.normalize(serverpath + mypath + "/" + req.query.filename);
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
    return res.send(filesList(mypath));
  }
  let myFile = req.files.myfiles;
  if (typeof myFile.length == "undefined") {
    let fullpath = path.normalize(serverpath + mypath + myFile.name);
    console.log("[server]one file:" + fullpath);
    myFile.mv(fullpath, function (err) {
      if (err) return res.status(500).send(err);
      res.send(filesList(mypath));
    });
    return;
  } else {
    console.log(myFile.length + " files");
    for (let i = 0; i < myFile.length; i++) {
      let fullpath = path.normalize(serverpath + mypath + myFile[i].name);
      console.log(fullpath);
      myFile[i].mv(fullpath).then(() => {
        if (i == myFile.length - 1) res.send(filesList(mypath));
      });
    }
  }
});

wss.on("connection", (socket, request) => {
  console.log(wscolor("[ws] New connection"));
  console.log(wscolor(`[ws] currentID:${currentID}`));
  socket.send(`currentID:${currentID}`);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(`activeID:${currentID}`);
    }
  });
  currentID++;
  socket.on("message", (message) => {
    console.log(wscolor("[ws] received:", message));
    if (hasEnabledAuthentication() && message.startsWith("PING:")) {
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          let t = hasEnableAuthentication()
            ? sessiontTime - (Date.now() - getLastconnection())
            : 60000;
          let remainingtime = t < 0 ? 0 : t;
          console.log("remain:", remainingtime, "millisec");
          client.send(`PING:${remainingtime}:60000`);
        }
      });
    }
  });
});
wss.on("error", (error) => {
  console.log(wscolor("[ws] Error:", error));
});
