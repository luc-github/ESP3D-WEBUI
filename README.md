# ESP3D-WEBUI 3.0

using Preact per @aganov suggestion  
Rewrite per @alxblog suggestion to use proper Preactjs API and lighter css code: use spectre.css instead of bootstrap 4.x

## In development / alpha stage / Ready to test

Only compatible with [ESP3DLib 3.0](https://github.com/luc-github/ESP3DLib/tree/3.0) , [ESP3D 3.0](https://github.com/luc-github/ESP3D/tree/3.0), [grblHAL](https://github.com/grblHAL), [ESP3D_TFT 1.0](https://github.com/luc-github/ESP3D-TFT/tree/main)   

[Latest development version ![Development Version](https://img.shields.io/badge/Devt-v3.0-yellow?style=plastic)](https://github.com/luc-github/ESP3D-WEBUI/tree/3.0) ![GitHub last commit (branch)](https://img.shields.io/github/last-commit/luc-github/ESP3D-WEBUI/3.0?style=plastic) [![github-ci](https://github.com/luc-github/ESP3D-WeBUI/workflows/build-ci/badge.svg)](https://github.com/luc-github/ESP3D-WEBUI/actions/workflows/build-ci.yml)  [![Project Page ESP3D 3.0](https://img.shields.io/badge/Project%20page-ESP3D%203.0-blue?style=plastic)](https://github.com/users/luc-github/projects/1/views/1) 

> [!WARNING]
>### Disclaimer
> The software is provided 'as is,' without any warranty of any kind, expressed or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.
>It is essential that you carefully read and understand this disclaimer before using this software and its components. If you do not agree with any part of this disclaimer, please refrain from using the software.

### Setup development tools

1 - Install current nodejs LTS (currently using v20.8.0)

```
node -v
v20.8.0

npm -v
10.2.0
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

# Need more information ESP3D-WEBUI and ESP3D related projects ?

Go to https://esp3d.io
