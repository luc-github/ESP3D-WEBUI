# ESP3D-WEBUI 3.0

using Preact per @aganov suggestion  
Rewrite per @alxblog suggestion to use proper Preactjs API and lighter code: use spectre.css instead of bootstrap 4.x

## In development / alpha stage / Ready to test

Only compatible with [ESP3DLib 3.0](https://github.com/luc-github/ESP3DLib/tree/3.0) , [ESP3D 3.0](https://github.com/luc-github/ESP3D/tree/3.0), [grblHAL](https://github.com/grblHAL)

[Latest development version ![Development Version](https://img.shields.io/badge/Devt-v3.0-yellow?style=plastic)](https://github.com/luc-github/ESP3D-WEBUI/tree/3.0) ![GitHub last commit (branch)](https://img.shields.io/github/last-commit/luc-github/ESP3D-WEBUI/3.0?style=plastic) [![Travis (.org) branch](https://img.shields.io/travis/luc-github/ESP3D-WEBUI/3.0?style=plastic)](https://travis-ci.org/github/luc-github/ESP3D-WEBUI) [![Project Page ESP3D 3.0](https://img.shields.io/badge/Project%20page-ESP3D%203.0-blue?style=plastic)](https://github.com/users/luc-github/projects/1/views/1) 

### Setup development tools

1 - Install current nodejs LTS (currently using v16.14.2)

```
node -v
v16.14.2

npm -v
8.5.0
```

2 - Download all necessary packages in ESP3D-WEBUI directory (repository root)

```
npm install
```

### Start dev server

in ESP3D-WEBUI directory (repository root)

```
npm run dev-<system>-<firmware>
```

-   where `<system>` is `cnc` (CNC system, laser, spindle..) , `printer` (3D printer), `sand` (Sand Table)
-   where `<firmware>` is :
    -   `grbl`, `grblhal` for `cnc`
    -   `marlin`, `marlin-embedded` (esp3dlib), `repetier`, `smoothieware` for `printer` 
    -   `grbl` for `sand`

will open http://localhost:8088 which display the webUI using a local test server

### Build index.html.gz to /dist folder

in ESP3D-WEBUI directory (repository root)

```
npm run buildall
```

Will generate production version for each target and firmware in dist directory

to build specific index.html.gz

```
npm run <system>-<firmware>
```

-   where `<system>` is `cnc` (CNC system, laser, spindle..) , `printer` (3D printer), `sand` (Sand Table)
-   where `<firmware>` is :
    -   `grbl`, `grblhal` for `cnc`
    -   `marlin`, `marlin-embedded` (esp3dlib), `repetier`, `smoothieware` for `printer` 
    -   `grbl` for `sand`

# Chat

ESP3D is now on discord https://discord.gg/Z4ujTwE
