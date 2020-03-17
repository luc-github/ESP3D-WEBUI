# ESP3D-WEBUI 3.0
using Preact per @aganov suggestion

## Not started in alpha stage - be patient...

 [Latest development version ![Development Version](https://img.shields.io/badge/Devt-v3.0-yellow?style=plastic)](https://github.com/luc-github/ESP3D-WEBUI/tree/3.0)  ![GitHub last commit (branch)](https://img.shields.io/github/last-commit/luc-github/ESP3D-WEBUI/3.0?style=plastic)  ![Travis (.org) branch](https://img.shields.io/travis/luc-github/ESP3D-WEBUI/3.0?style=plastic)
   
### Setup development tools

1 - Install current nodejs LTS (currently using v10.15.3)
2 - Download all necessary packages
```
npm install
```

### Start dev server
http://localhost:8080

```
npm run start
```

### Build index.html.gz to /dist folder

```
npm run build
```

### Code beautify with prettier
use pluggin or cli   

```
npm install --global prettier
```

the config file is .prettierrc  
a batch is available if you need : prettyfiles.bat, it is just automating the following commands:  
prettier --config .prettierrc --write "{src/**/,webpack/**/}*.js"
prettier --config .prettierrc --write src/**/*.html"



 
