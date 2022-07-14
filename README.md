# ESP3D-WEBUI 3.0

using Preact per @aganov suggestion  
Rewrite per @alxblog suggestion to use proper Preactjs API and lighter code: use spectre.css instead of bootstrap 4.x

## In development / pre-alpha stage - NOT ready to test...

Only compatible with [ESP3DLib v2](https://github.com/luc-github/ESP3DLib/tree/2-0) - which will be merged to [ESP3D 3.0](https://github.com/luc-github/ESP3D/tree/3.0) later

[Latest development version ![Development Version](https://img.shields.io/badge/Devt-v3.0-yellow?style=plastic)](https://github.com/luc-github/ESP3D-WEBUI/tree/3.0) ![GitHub last commit (branch)](https://img.shields.io/github/last-commit/luc-github/ESP3D-WEBUI/3.0?style=plastic) [![Travis (.org) branch](https://img.shields.io/travis/luc-github/ESP3D-WEBUI/3.0?style=plastic)](https://travis-ci.org/github/luc-github/ESP3D-WEBUI)

### Setup development tools

1 - Install current nodejs LTS (currently using v14.16.1)

```
node -v
v14.16.1

npm -v
6.14.12
```

2 - Download all necessary packages in ESP3D-WEBUI directory (repository root)

```
npm install
```

### Start dev server

in ESP3D-WEBUI directory (repository root)

```
npm run dev
```

will open http://localhost:8088

Back end query server is localhost:8080, websocket server is localhost:81

### Build index.html.gz to /dist folder

in ESP3D-WEBUI directory (repository root)

```
npm run build
```

Will generate production version

# Chat

ESP3D is now on discord https://discord.gg/Z4ujTwE
