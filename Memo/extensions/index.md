---
description : "Description and sample code"
archetype : "section"
title : "Extensions API"
weight : 10
---
- [Basic code](#basic-code)
- [Send message](#send-message)
- [Send GCODE command or ESP command](#send-gcode-command-or-esp-command)
- [Send web query](#send-web-query)
- [Send web upload](#send-web-upload)
- [Send webdownload request](#send-webdownload-request)
- [Send sound notification](#send-sound-notification)
- [Send toast notification](#send-toast-notification)
- [Send translation request](#send-translation-request)
- [Send capabilities request](#send-capabilities-request)
- [Save extension settings to preferences.json](#save-extension-settings-to-preferencesjson)
- [Send icon request](#send-icon-request)
- [Dispatch message to other extensions](#dispatch-message-to-other-extensions)
- [Modal Dialog Documentation](#modal-dialog-documentation)
  - [Modal Types](#modal-types)
  - [Sending Messages](#sending-messages)
  - [Modal Content](#modal-content)
  - [Fields types and options](#fields-types-and-options)
  - [Handling Messages](#handling-messages)
- [Sample codes](#sample-codes)

## Basic code
Here is a basic code for extension to communicate with Web UI

```
<script type="text/javascript">

//Send message to web ui
function sendMessage(msg){
    window.parent.postMessage(msg, '*');
}

//Process Message coming from webUI
function processMessage(eventMsg){
    //now process eventMsg.data
}

//Setup message listener from webUI
window.onload = (event) => {
  window.addEventListener("message", processMessage, false);
};

</script>

<div class="container">
Display your HTML here
</div>

```

As you can see, code is minimal - it will fit a panel or a page, webui css / theme will be added by webUI after loaded, so you do not need to add any, you can use any of existing class available in webUI.

Communication between frame and main window is done by messages using objects (string / array based), do not use any object that could not be cloned, or loading will fail.

One typical use case is when WebUI send notification to extension to inform it that is visible or not, so extension can adjust its own behavior according to this information.

The notification message (eventMsg.data) has the following structure:
```
{
    type: 'notification',
    content: {
      isVisible: true | false,
    },
    id: 'extra_content_XXXXX'
}
```

The id  is the id of the node that contain the iframe, which means unlike others messages, notification with specific id are addressed to the iframe of the node and not broadcasted to all iframes, if not the id will be `all`.
Currently notifications are limited to isVisible and isConnected, but it is possible to add more notifications in the future.

Here an example of extension that display all notifications in a list:
```html
<script type="text/javascript">
let output = ""
//Process Message coming from webUI
function processMessage(eventMsg){
    //now process eventMsg.data
    if (eventMsg.data.type && eventMsg.data.type == "notification"){
        if (eventMsg.data.content){
            if (typeof eventMsg.data.content.isVisible != 'undefined'){
                output+="Visible:" + eventMsg.data.content.isVisible + "\n";
                }
            if (typeof eventMsg.data.content.isConnected != 'undefined'){
                output+="Connected:" + eventMsg.data.content.isConnected + "\n";
                }
            document.getElementById("notificationsApi").innerHTML=  output;
        }
    }
}
//Setup message listener from webUI
window.onload = (event) => {
  window.addEventListener("message", processMessage, false);
};
</script>

<div class="container">
<pre id="notificationsApi"></pre>
</div>
```

![image](test_extension.png)

---

## Send message
message structure used by `window.parent.postMessage(msg, '*');` has a defined format, some parameters are madatories, some are optionals and some depend on message type:   
`{type:'<message type>', target:'webui', id:'[origin]', noDispatch:[true], XXX:YYY}`   
`<message type>` is mandatory, it define the purpose of the message  
`target:'webui'` is mandatory, it help to screen the message    
`id:'[origin]'` is optionnal, it define which id must read the response if any, if present it can be used by extension to filter message, no id means the message is for everyone   
`noDispatch:[true]` is optionnal, if true it will prevent to send answer if any, if not or set to false, it will send answer message if any   
`XXX:YYY` are optionals/mandatories according message type   

---

### Send GCODE command or ESP command
Example: `{type:'cmd', target:'webui',id:'terminal', content:'[ESP111]'}`   
**type** is `cmd` (mandatory)  
**target** is `webui` (mandatory)  
**id** is `terminal` (optional)  
**content** is the command that need to be sent, in our case `[ESP111]` (mandatory)

Note: there is no `noDispatch:true` so answer, if any from ESP firmware, will be sent   
Note 2: there is no way to prevent the answer to be spread if it come from external board from serial, even if `id` and `noDispatch` are set

* Answer format: check the `eventMsg.data`    

  - if success
    ```
    {
        "type": "cmd",
        "content": {
            "status": "success"
            "response": "192.168.1.111",
            "initiator": {  
                            "content":"[ESP111]",
                            "id":"terminal",
                            "target":"webui", 
                            "type":"cmd", 
                        }
        },
        "id": "terminal"
    }  
    ```
    **type** is `cmd`   
    **id** is the id set in command message to help to screen    
    **content** has the response's **status** which is `success`, the response it self **response**, in our case `192.168.1.111`  and also the  **initiator** is the initial command for reference   
  - if error  
  
    ```
    { 
        "type": "cmd", 
        "content": { 
            "status": "error", 
            "error":"Cannot connect", 
            "initiator": {  
                            "content":"[ESP111]",
                            "id":"terminal",
                            "target":"webui", 
                            "type":"cmd", 
                        }
        }, 
        "id":"terminal"
    }
    ```

    **type** is `error` for any error command   
    **id** is the id set in command message to help to screen    
    **content** has the response's **status** which is `error`, and the error it self **error**, in our case `Cannot connect` and also the  **initiator** is the initial command for reference

---

### Send web query
Example: `{type:'query', target:'webui', id:'filemanager', url:'files', args:{action:'list', path:'/'}}`   
**type** is `query` (mandatory)    
**target** is `webui` (mandatory)    
**id** is `terminal` (optional)    
**url** is the base url in our case `files` for `/files` (mandatory)     
**args** is the set of arguments url in our case `{action:'list', path:'/'}` for `/files?action=list&path=/` (optional for query)     

Note:  `noDispatch:true` and `id:'term'` are applicable in this case if needed     


* Answer format: check the `eventMsg.data`   
  - if success   
  
    ```
    {
        "type": "query",
        "response": {
            "status": "success",
            "response": "{\"files\":[{\"name\":\"config.yaml\",\"size\":\"1.55 KB\"}],\"path\":\"/\",\"occupation\":\"35\",\"status\":\"ok\",\"total\":\"1.31 MB\",\"used\":\"470.08 KB\"}",
            "initiator": {
                            "type": "query", 
                            "target": "webui", 
                            "id": "filemanager", 
                            "url": "files", 
                            "args": {
                                        "action": "list", 
                                        "path": "/"
                                    }
                        }
        },
        "id": "filemanager"
    }
    ```
    
    **type** is `query`   
    **id** is the id set in output message to help to screen      
    **content** has the response's **status** which is `success`, the response it self **response**, in our case a JSON,  and also the **initiator** is the initial command for reference   
    
  - if error   
  
    ```
    {
        "type": "query",
        "response": {
            "status": "error",
            "error": "Cannot connect",
            "initiator": {
                            "type": "query", 
                            "target": "webui", 
                            "id": "filemanager", 
                            "url": "files", 
                            "args": {
                                        "action": "list", 
                                        "path": "/"
                                    }
                        }
        },
        "id": "filemanager"
    }
    ```
        
    **type** is `query`   
    **id** is the id set in output message to help to screen      
    **content** has the response's **status** which is `error`, and the error it self **error**, in our case `Cannot connect` and also the  **initiator** is the initial command for reference

---

### Send web upload
Example: 
`{type:'upload', target:'webui', id:'filemanager', url:'files', content:[...],size:500, path:"/", filename:'file.txt'}`

**type** is `upload` (mandatory)    
**target** is `webui` (mandatory)    
**id** is `filemanager` (optional)    
**url** is the base url in our case `files` for `/files` (mandatory for upload)     
**content** is the file in an array object (mandatory)   
**size** is the file size (mandatory)     
**path** is the file target path (not including name) (mandatory)   
**size** is the filename (not including path) (mandatory)   
**args** is an object with optional arguments like for query, they are no used in post but in url itself   

Note:  `noDispatch:true` and `id:'filemanager'` are applicable in this case if needed    


* Answer format: check the `eventMsg.data`   
    for upload the initiator does not contain the file content
  - if success   
  
    ```
    {
        "type": "upload",
        "response": {
            "status": "success",
            "response": "{\"files\":[{\"name\":\"config.yaml\",\"size\":\"1.55 KB\"},{\"name\":\"file.txt\",\"size\":\"500B\"}],\"path\":\"/\",\"occupation\":\"35\",\"status\":\"ok\",\"total\":\"1.31 MB\",\"used\":\"470.08 KB\"}",
            "initiator": {
                            "type":"upload", 
                            "target":"webui", 
                            "id":"filemanager", 
                            "url":"files",
                            "size":500, 
                            "path":"/", 
                            "filename":"file.txt"
                        }
        },
        "id": "filemanager"
    }
    ```
    
    **type** is `upload`    
    **id** is the id set in output message to help to screen      
    **content** has the response's **status** which is `success`, the response it self **response**, in our case a JSON,  and also the  **initiator** is the initial command for reference but without the file content   
    
  - progression message  
  
    ```
    {
        "type": "upload",
        "response": {
            "status": "progress",
            "progress": "100",
            "initiator": {
                            "type":"upload", 
                            "target":"webui", 
                            "id":"filemanager", 
                            "url":"files",
                            "size":500, 
                            "path":"/", 
                            "filename":"file.txt"
                        }
        },
        "id": "filemanager"
    }
    ```
    
    **type** is `upload`    
    **id** is the id set in output message to help to screen      
    **content** has the response's **status** which is `progress`, and the progression it self   **progress**, in our case `100` = 100% and also the  **initiator** is the initial command for reference but without the file content  


  - if error   
  
    ```
    {
        "type": "upload",
        "response": {
            "status": "error",
            "error": "Cannot connect",
            "initiator": {
                            "type":"upload", 
                            "target":"webui", 
                            "id":"filemanager", 
                            "url":"files",
                            "size":500, 
                            "path":"/", 
                            "filename":"file.txt"
                        }
        },
        "id": "filemanager"
    }
    ```
    
    **type** is `upload`    
    **id** is the id set in output message to help to screen      
    **content** has the response's **status** which is `error`, and the error it self **error**, in our case `Cannot connect` and also the  **initiator** is the initial command for reference but without the file content   

---
### Send webdownload request   
Example:   
`{type:'download', target:'webui', id:'filemanager', url:'preferences.json'}`   

**type** is `download` (mandatory)    
**target** is `webui` (mandatory)    
**id** is `filemanager` (optional)    
**url** is the url of the file in our case `preferences.json` for `/preferences.json` (mandatory)     
**args** is an object with optional arguments like for query   

Note:  `id:'filemanager'` is applicable in this case if needed, but not  `noDispatch:true` as the purpose is to get response   


* Answer format: check the `eventMsg.data`     
  - if success   
  
    ```
    {
        "type": "download",
        "response": {
            "status": "success",
            "response": [...],
            "initiator": {
                            "type":"download", 
                            "target":"webui", 
                            "id":"filemanager", 
                            "url":"preferences.json",
                        }
        },
        "id": "filemanager"
    }
    ```
    
    **type** is `upload`    
    **id** is the id set in output message to help to screen       
    **content** has the response's **status** which is `success`, the response it self **response**, in our case a blob  which is the file that need to be read properly, and also the  **initiator** is the initial command for reference    
    
  - progression message  
  
    ```
    {
        "type": "upload",
        "response": {
            "status": "progress",
            "progress": "100",
            "initiator": {
                            "type":"upload", 
                            "target":"webui", 
                            "id":"filemanager", 
                            "url":"preferences.json",
                        }
        },
        "id": "filemanager"
    }
    ```
    
    **type** is `download`    
    **id** is the id set in output message to help to screen      
    **content** has the response's **status** which is `progress`, and the progression it self **progress**, in our case `100` = 100% and also the  **initiator** is the initial command for reference   


  - if error   
  
    ```
    {
        "type": "download",
        "response": {
            "status": "error",
            "error": "404",
            "initiator": {
                            "type":"upload", 
                            "target":"webui", 
                            "id":"filemanager", 
                            "url":"preferences.json",
                        }
        },
        "id": "filemanager"
    }
    ```
    
    **type** is `download`    
    **id** is the id set in output message to help to screen       
    **content** has the response's **status** which is `error`, and the error it self **error**, in our case `404` (file not found) and also the  **initiator** is the initial command for reference

---
### Send sound notification
There is no answer for this message, so `id` is not necessary  

  - Generate a beep notification    
    Example:    
    `{type:'sound', target:'webui', content:'beep'}`   

    **type** is `` (mandatory)    
    **target** is `webui` (mandatory)    
    **sound** is the sound type, in our case `beep` (mandatory)      

  - Generate a beep error notification     
    Example:    
    `{type:'sound', target:'webui', content:'error'}`    

    **type** is `` (mandatory)     
    **target** is `webui` (mandatory)     
    **sound** is the sound type, in our case `error` (mandatory)     

  - Generate a beep sequence notification    
    Example:    
    `{type:'sound', target:'webui', content:'beep', seq:[{ f: 1046, d: 200 },{ f: 1318, d: 100 }]}`    

    **type** is `sound` (mandatory)     
    **target** is `webui` (mandatory)     
    **sound** is the sound type, in our case `seq` (mandatory)     
    **seq** is an array of sequence of beep, in our case `[{ f: 1046, d: 200 },{ f: 1318, d: 100 }]` (mandatory),  `f` is frequency and `d` is duration of the beep   

---
### Send toast notification

There is no answer for this message, so `id` is not necessary     

  - Generate a success toast notification   
    Example:    
    `{type:'toast', target:'webui', content:{text:'This is a success', type:'success'}}`   

    **type** is `toast` (mandatory)    
    **target** is `webui` (mandatory)    
    **content** has the toast **type**, in our case `success`, and the **text** to display, in ou case `This is a success` (mandatory)     

- Generate an error toast notification   
    Example:    
    `{type:'toast', target:'webui', content:{text:'This is an error', type:'error'}}`    

    **type** is `toast` (mandatory)     
    **target** is `webui` (mandatory)    
    **content** has the toast **type**, in our case `error`, and the **text** to display, in ou case `This is an error` (mandatory)     
  
- Generate a normal toast notification     
    Example:    
    `{type:'toast', target:'webui', content:{text:'This is a toast', type:'default'}}`   
    **type** is `toast` (mandatory)     
    **target** is `webui` (mandatory)    
    **content** has the toast **type**, in our case `default`, and the **text** to display, in ou case `This is a toast` (mandatory)   

---
### Send translation request
- simple translation
    Example:    
    `{type:'translate', target:'webui', id:'transpanel', content:'S153'}`   

    **type** is `translate` (mandatory)     
    **target** is `webui` (mandatory)      
    **id** is `transpanel` (optional)     
    **content** is the text that need to be translated, in our case `S153` (mandatory)    

    * Answer format: check the `eventMsg.data`   

        ```
        {
            "type": "translate",
            "content": {
                "response": "Your session will end soon, do you want to stay connected ?",
                "initiator": {
                                "type":"translate", 
                                "target":"webui", 
                                "id":"transpanel", 
                                "content":"S153"
                            }
            },
            "id": "transpanel"
        }  
        ```

        **type** is `translate`     
        **id** is the id set in command message to help to screen    
        **content** has the response it self **response**, in our case `Your session will end soon, do you want to stay connected ?` and also the  **initiator** is the initial command for reference   

 - full dump of translations  
    Example:    
    `{type:'translate', target:'webui', id:'transpanel', all:'true'}`    

    **type** is `translate` (mandatory)     
    **target** is `webui` (mandatory)     
    **id** is `transpanel` (optional)     
    **all** to take all translations (mandatory)    

    * Answer format: check the `eventMsg.data`   

        ```
        {
            "type": "translate",
            "content": {
                "response": "Your session will end soon, do you want to stay connected ?",
                "initiator": {
                                "type":"translate", 
                                "target":"webui", 
                                "id":"transpanel", 
                                "content":[....]
                            }
            },
            "id": "transpanel"
        }  
        ```
        **type** is `translate`     
        **id** is the id set in command message to help to screen      
        **content** has the response it self **response**, in our case an array of all translations and also the  **initiator** is the initial command for reference      

---
### Send capabilities request   

This allow to collect all capabilities for specific topic:   

* if id is `connection` you will get the json of [ESP800] response jsonified   
* if id is `features` you will get the [ESP400] response jsonified   
* if id is `interface` you will get the settings from preferences.json jsonified   
* if id is `settings` you will get specific settings from target fw in json format   
* if id is `extensions` you will get the extensions from preferences.json jsonified of the `name` extensions   

Be noted this API only collect existing data, so for `features`,`interface`, `extensions`and `settings` you may get empty response if corresponding query has not be done.   

About settings the format may differ from one firmware to another, so you need to check the response to know how to use it, response is always a variable named machineSettings and important content may usualy located in `machineSettings.cache`    

Example:    
`{type:'capabilities', target:'webui', id:'connection'}`     

**type** is `capabilities` (mandatory)     
**target** is `webui` (mandatory)    
**id** is `connection` (mandatory)     

* Answer format: check the `eventMsg.data`     

    ```
    {
        "type": "capabilities",
        "content": {
            "response": "{
				"FWVersion": "3.0.0.a111",
				"FWTarget": "marlin",
				"FWTargetID": "40",
				"Setup": "Enabled",
				"Screen": "HMI V3",
				"Streaming": "Enabled",
				"SDConnection": "direct",
				"SerialProtocol": "Raw",
				"Authentication": "Disabled",
				"WebCommunication": "Asynchronous",
				"WebSocketIP": "localhost",
				"WebSocketPort": "81",
				"Hostname": "esp3d",
				"WiFiMode": "STA",
				"WebUpdate": "Enabled",
				"FlashFileSystem": "LittleFS",
				"HostPath": "/",
				"Time": "none",
				"HostTarget": "files",
				"HostUploadPath": "/",
				"HostDownloadPath": "/",
				"wsID": "0"
			}",
            "initiator": {
                            "type":"capabilities", 
                            "target":"webui", 
                            "id":"connection"
                        }
        },
        "id": "connection"
    }  
    ```

    **type** is `capabilities`     
    **id** is the id of requested capability    
    **content** has the response it self **response**, in our case a JSON and also the  **initiator** is the initial command for reference   

---
### Save extension settings to preferences.json

This allow to save extension settings to preferences.json, it is a way to store settings for extension that need to be saved for next session:   


Example:     
`{type:'extensionsData', target:'webui', id:'myextension', content:'{"setting1":"value1","setting2":"value2"}'}`      

**type** is `extensionsData` (mandatory)    
**target** is `webui` (mandatory)     
**id** is `myextension` (mandatory)     
**content** is the settings to save, in stringified JSON format, in our case `{"setting1":"value1","setting2":"value2"}` (mandatory)   

* Answer format: check the `eventMsg.data`    

    ```
    {
        "type": "extensionsData",
        "content": {
            "response": "{
				"status": "success"
			}",
            "initiator": {
                            "type":"extensionsData", 
                            "target":"webui", 
                            "id":"myextension",
                            "content":"{"setting1":"value1","setting2":"value2"}"
                        }
        },
        "id": "myextension"
    }  
    ```

    **type** is `extensionsData`     
    **id** is the id of extension that saved settings   
    **content** has the response which is the status and also the  **initiator** is the initial command for reference    

---
### Send icon request

The WebUI already a set of icons, so no need to bother with new icons, you can request a specific one if needed

Be noted some icons may be specific to a system, so it may not be available in all systems, the svg icon will be returned in response use quote into the svg tag so be sure to use it properly.

Main icons are :
```
None: null,
Activity: <Activity />,
AlertCircle: <AlertCircle />,
Anchor: <Anchor />,
Aperture: <Aperture />,
Award: <Award />,
BarChart: <BarChart />,
BellOff: <BellOff />,
Bell: <Bell />,
Bluetooth: <Bluetooth />,
Bookmark: <Bookmark />,
Box: <Box />,
Camera: <Camera />,
Cast: <Cast />,
ChevronDown: <ChevronDown />,
ChevronLeft: <ChevronLeft />,
ChevronRight: <ChevronRight />,
ChevronUp: <ChevronUp />,
ChevronsDown: <ChevronsDown />,
ChevronsLeft: <ChevronsLeft />,
ChevronsRight: <ChevronsRight />,
ChevronsUp: <ChevronsUp />,
Clipboard: <Clipboard />,
Clock: <Clock />,
Cpu: <Cpu />,
Crosshair: <Crosshair />,
Database: <Database />,
Delete: <Delete />,
Download: <Download />,
Droplet: <Droplet />,
Edit: <Edit />,
EyeOff: <EyeOff />,
Eye: <Eye />,
File: <File />,
Filter: <Filter />,
Flag: <Flag />,
Frown: <Frown />,
GitCommit: <GitCommit />,
Globe: <Globe />,
Grid: <Grid />,
HardDrive: <HardDrive />,
Hash: <Hash />,
Heart: <Heart />,
HelpCircle: <HelpCircle />,
Home: <Home />,
Image: <Image />,
Info: <Info />,
Layers: <Layers />,
LifeBuoy: <LifeBuoy />,
List: <List />,
Loader: <Loader />,
Lock: <Lock />,
LogIn: <LogIn />,
LogOut: <LogOut />,
Mail: <Mail />,
MapPin: <MapPin />,
Meh: <Meh />,
Menu: <Menu />,
MessageSquare: <MessageSquare />,
MinusCircle: <MinusCircle />,
Monitor: <Monitor />,
Moon: <Moon />,
MoreHorizontal: <MoreHorizontal />,
MoreVertical: <MoreVertical />,
Move: <Move />,
PauseCircle: <PauseCircle />,
Percent: <Percent />,
PlayCircle: <PlayCircle />,
PlusCircle: <PlusCircle />,
Power: <Power />,
Printer: <Printer />,
Radio: <Radio />,
RefreshCw: <RefreshCw />,
Repeat: <Repeat />,
RotateCcw: <RotateCcw />,
Save: <Save />,
Scissors: <Scissors />,
Send: <Send />,
Server: <Server />,
Settings: <Settings />,
Share: <Share />,
Slash: <Slash />,
Sliders: <Sliders />,
Smile: <Smile />,
Star: <Star />,
StopCircle: <StopCircle />,
Sun: <Sun />,
Sunrise: <Sunrise />,
Sunset: <Sunset />,
Tag: <Tag />,
Target: <Target />,
Terminal: <Terminal />,
Thermometer: <Thermometer />,
Tool: <Tool />,
Trash2: <Trash2 />,
Underline: <Underline />,
Upload: <Upload />,
VideoOff: <VideoOff />,
Video: <Video />,
VolumeX: <VolumeX />,
Volume: <Volume />,
WifiOff: <WifiOff />,
Wifi: <Wifi />,
Wind: <Wind />,
XCircle: <XCircle />,
ZapOff: <ZapOff />,
Zap: <Zap />,
```

3D printers have in addition:

```
Fan, 
FeedRate, 
FlowRate, 
Extruder
```

CNC has in addition :

```
Fan, 
FeedRate, 
FlowRate,
```

Example:     
`{type:'icon', target:'webui', id:'Activity'}`    

**type** is `icon` (mandatory)     
**target** is `webui` (mandatory)     
**id** is `Activity` (mandatory)     

* Answer format: check the `eventMsg.data`   

    ```json
    {
    "type": "icon",
    "content": {
        "response": "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z'></path><polyline points='13 2 13 9 20 9'></polyline></svg>",
        "initiator": {
            "type": "icon",
            "target": "webui",
            "id": "Activity"
        }
    },
    "id": "Activity"
    }
    ```

    **type** is `icon`    
    **id** is the id of requested "Activity"    
    **content** has the response it self **response**, in our case svg using quote , also the **initiator** is the initial command for reference     

---
### Dispatch message to other extensions

Example: 
```json
{
    type:'dispatch', 
    target:'webui', 
    id:'senderpanel', 
    content:'any message' , 
    targetid:'receiverpanel'
}
```   

**type** is `dispatch` (mandatory)    
**target** is `webui` (mandatory)    
**id** is `senderpanel` (optional)    
**content** the message to dispatch     

Note: there no answer as the purpose of this is to send answer

---

### Modal Dialog Documentation

This documentation describes how to use the modal dialog functionality. The modal dialog is a pop-up window that displays a message to the user and requires the user to respond before they can continue. The modal dialog can be used to display simple messages, confirmations, input fields, and multiple input fields.   

#### Modal Types

The code supports four types of modal dialogs:   

1. Simple Modal: Displays a basic modal with a title, text, and a single button.  
2. Confirmation Modal: Displays a modal with a title, text, and two buttons for confirmation.  
3. Input Modal: Displays a modal with a title, text, an input field, and two buttons.   
4. Fields Modal: Displays a modal with a title, multiple input fields, and two buttons.  

#### Sending Messages

To open a modal dialog, you need to send a message to the parent window using the `sendMessage` function. The message should have the following structure:   

```javascript
sendMessage({
  type: 'modal',
  target: 'webui',
  id: 'modalpanel',
  content: {
    // Modal-specific content
  }
});
```

* type: Always set to 'modal'.   
* target: Always set to 'webui'.   
* id: Set to 'modalpanel' for all modal types.   
* content: An object containing the modal-specific content.   

#### Modal Content
Each modal type has its own specific content structure:   

1. Simple Modal   
   Example:    
```json
{
    type:'modal', 
    target:'webui', 
    id:'modalpanel', 
    content:
        {
            title:'This is title', 
            id:'simple_modal', 
            style:'default', 
            bt1Txt:'S126', 
            response1:'ok', 
            text:'some text', 
            overlay:true
        }
}
```   

   - **type** (mandatory): 'modal'     
   - **target** (mandatory): 'webui'   
   - **id** (optional): 'modalpanel'   
   - **content** (mandatory): Modal description   
     - **title** (mandatory): Title of the modal. Use predefined text for translation.   
     - **id** (mandatory): Modal ID. Example: 'simple_modal'  
     - **style** (mandatory): Modal style. For simple modal, use 'default'.   
     - **bt1Txt** (optional): Text for button 1. 'S126' will be translated as 'Ok'. If not defined, the button won't be displayed.   
     - **response1** (optional): Message sent if button 1 is clicked. Example: 'ok'. The click closes the modal.   
     - **bt2Txt** (optional): Text for button 2. If not defined, the button won't be displayed.   
     - **response2** (optional): Message sent if button 2 is clicked. The click closes the modal.   
     - **hideclose** (optional): If set to true, it hides the close button of the modal.   
     - **overlay** (optional): If set to true, it automatically closes the modal if it loses focus.   
     - **text** (optional): Text to display in the modal. If it's a predefined text, it will be translated.   

   Note: The close button and overlay feature won't send any notification when the modal is closed.

   Answer format: Check `eventMsg.data`
   ```json
   {
     "type": "modal",
     "content": {
       "response": "ok",
       "initiator": {
         "type": "modal",
         "target": "webui",
         "id": "modalpanel",
         "content": {
           "title": "This is title",
           "id": "simple_modal",
           "style": "default",
           "bt1Txt": "S126",
           "response1": "ok",
           "text": "some text",
           "overlay": true
         }
       }
     },
     "id": "modalpanel"
   }
   ```

   - **type**: 'modal'   
   - **id**: ID set in the command message to help with screening   
   - **content**: Contains the response itself (**response**) and the initiator (initial command for reference)   

2. Confirmation Modal
   Example: 
```json
{
    type:'modal', 
    target:'webui', 
    id:'modalpanel', 
    content:
        {
            title:'S26', 
            id:'confirm_modal', 
            style:'question', 
            bt1Txt:'S27', 
            response1:'yes', 
            bt2Txt:'S28', 
            response2:'cancel', 
            text:'S30', 
            hideclose:true
        }
}
```
   - **type** (mandatory): 'modal'   
   - **target** (mandatory): 'webui'   
   - **id** (optional): 'modalpanel'   
   - **content** (mandatory): Modal description   
     - **title** (mandatory): Title of the modal. 'S26' will be translated as 'Please Confirm'.  
     - **id** (mandatory): Modal ID. Example: 'confirm_modal'  
     - **style** (mandatory): Modal style. For confirmation modal, use 'question'.  
     - **bt1Txt** (optional): Text for button 1. 'S27' will be translated as 'Yes'. If not defined, the button won't be displayed.   
     - **response1** (optional): Message sent if button 1 is clicked. Example: 'yes'. The click closes the modal.  
     - **bt2Txt** (optional): Text for button 2. 'S28' will be translated as 'Cancel'. If not defined, the button won't be displayed.   
     - **response2** (optional): Message sent if button 2 is clicked. Example: 'cancel'. The click closes the modal.   
     - **hideclose** (optional): If set to true, it hides the close button of the modal.   
     - **overlay** (optional): If set to true, it automatically closes the modal if it loses focus.  
     - **text** (optional): Text to display in the modal. 'S30' will be translated as 'Do you want to update?'.  

   Note: The close button and overlay feature won't send any notification when the modal is closed.   

   Answer format: Check `eventMsg.data`
   ```json
   {
     "type": "modal",
     "content": {
       "response": "yes",
       "initiator": {
         "type": "modal",
         "target": "webui",
         "id": "modalpanel",
         "content": {
           "title": "S26",
           "id": "confirm_modal",
           "style": "question",
           "bt1Txt": "S27",
           "response1": "yes",
           "bt2Txt": "S28",
           "response2": "cancel",
           "text": "S30",
           "hideclose": true
         }
       }
     },
     "id": "modalpanel"
   }
   ```

   - **type**: 'modal'   
   - **id**: ID set in the command message to help with screening   
   - **content**: Contains the response itself (**response**) and the initiator (initial command for reference)   

3. Input Modal
   Example: 
```json
{
    type:'modal', 
    target:'webui', 
    id:'modalpanel', 
    content:
        {
            title:'S90', 
            id:'input_modal', 
            style:'input',
            validation:'bt1', 
            bt1Txt:'S106', 
            response1:'create', 
            bt2Txt:'S28', 
            response2:'cancel', 
            text:'S104', 
            hideclose:true
        }
}
```
   - **type** (mandatory): 'modal'   
   - **target** (mandatory): 'webui'   
   - **id** (optional): 'modalpanel'   
   - **content** (mandatory): Modal description   
     - **title** (mandatory): Title of the modal. 'S90' will be translated as 'Create Directory'.   
     - **id** (mandatory): Modal ID. Example: 'input_modal'   
     - **style** (mandatory): Modal style. For input modal, use 'input'.   
     - **bt1Txt** (optional): Text for button 1. 'S106' will be translated as 'Create'. If not defined, the button won't be displayed.   
     - **response1** (optional): Message sent if button 1 is clicked. Example: 'create'. The click closes the modal.   
     - **bt2Txt** (optional): Text for button 2. 'S28' will be translated as 'Cancel'. If not defined, the button won't be displayed.   
     - **response2** (optional): Message sent if button 2 is clicked. Example: 'cancel'. The click closes the modal.   
     - **hideclose** (optional): If set to true, it hides the close button of the modal.   
     - **overlay** (optional): If set to true, it automatically closes the modal if it loses focus.   
     - **text** (optional): Text to display in the modal. 'S104' will be translated as 'Please type directory name'.   

   Note: The close button and overlay feature won't send any notification when the modal is closed.

   Answer format: Check `eventMsg.data`
   ```json
   {
     "type": "modal",
     "content": {
       "response": "create",
       "inputData": "mydir",
       "initiator": {
         "type": "modal",
         "target": "webui",
         "id": "modalpanel",
         "content": {
           "title": "S90",
           "id": "input_modal",
           "style": "input",
           "bt1Txt": "S106",
           "response1": "create",
           "bt2Txt": "S28",
           "response2": "cancel",
           "text": "S104",
           "hideclose": true
         }
       }
     },
     "id": "modalpanel"
   }
   ```

   - **type**: 'modal'   
   - **id**: ID set in the command message to help with screening  
   - **content**: Contains the response itself  


4. Fields Modal   
   Example:   
```json
{
    type:'modal', 
    target:'webui', 
    id:'modalpanel', 
    content:
        {
            title:'S90', 
            id:'fields_modal',
            validation:'bt1', 
            style:'fields', 
            bt1Txt:'S106', 
            response1:'create',
            bt2Txt:'S28', 
            response2:'cancel', 
            hideclose:true, 
            fields:
                [
                      {
                        id: "area",
                        label: "Area",
                        type: "group",
                        value: [
                            {
                            id: "xmin",
                            type: "number",
                            label: "Xmin",
                            value: 0
                            },
                            {
                            id: "xmax",
                            type: "number",
                            label: "Xmax",
                            value: 0
                            }
                        ]
                        },
                        {
                        id: "precision",
                        type: "number",
                        label: "Precision",
                        value: 0,
                        min: "0",
                        max: "5"
                        }
                ]
        }
    }
```

   - **type** (mandatory): 'modal'   
   - **target** (mandatory): 'webui'   
   - **id** (optional): 'modalpanel'  
   - **content** (mandatory): Modal description   
     - **title** (mandatory): Title of the modal. 'S90' will be translated as 'Create Item'.   
     - **id** (mandatory): Modal ID. Example: 'fields_modal'   
     - **style** (mandatory): Modal style. For fields modal, use 'fields'.    
     - **validation** (mandatory): Define which button is performing the validation and send back the modified values: 'bt1' or 'bt2'.   
     - **bt1Txt** (optional): Text for button 1. 'S106' will be translated as 'Create'. If not defined, the button won't be displayed.   
     - **response1** (optional): Message sent if button 1 is clicked. Example: 'create'. The click closes the modal.   
     - **bt2Txt** (optional): Text for button 2. 'S28' will be translated as 'Cancel'. If not defined, the button won't be displayed.   
     - **response2** (optional): Message sent if button 2 is clicked. Example: 'cancel'. The click closes the modal.   
     - **hideclose** (optional): If set to true, it hides the close button of the modal.   
     - **overlay** (optional): If set to true, it automatically closes the modal if it loses focus.   
     - **fields** (mandatory): An array of field definitions for the modal.   
       - **id** (mandatory): ID of the field.   
       - **label** (mandatory): Label for the field.   
       - **type** (mandatory): Type of the field. Supported types: 'text', 'select', 'boolean', group.   
       - **value** (optional): Default value for the field.   

   Note: The close button and overlay feature won't send any notification when the modal is closed.  

   Answer format: Check `eventMsg.data`    

```json
{
  "type": "modal",
  "content": {
    "response": "create",
    "fields": {
      "field1": "Value 1",
      "field2": "Option 2"
    },
    "initiator": {
      "type": "modal",
      "target": "webui",
      "id": "modalpanel",
      "content": {
        "title": "S90",
        "id": "fields_modal",
        "validation": "bt1",
        "style": "fields",
        "bt1Txt": "S106",
        "response1": "create",
        "bt2Txt": "S28",
        "response2": "cancel",
        "hideclose": true,
        "fields": [
          {
            "id": "field1",
            "label": "Field 1",
            "type": "text"
          },
          {
            "id": "field2",
            "label": "Field 2",
            "type": "select",
            "options": [
              "Option 1",
              "Option 2"
            ]
          }
        ]
      }
    }
  },
  "id": "modalpanel"
}
```

   * type: 'modal'  
   * id: ID set in the command message to help with screening   
   * content: Contains the response itself (response), the field values entered by the user (fields), and the initiator (initial command for reference)  

#### Fields types and options  
The fields modal supports the same as the interface fields but with some limitations, each type may support different options.    
The existing types and options are:     

1. "pickup":   
Currently not supported in the modal dialog it is used in interface tab to select language or theme
      - "id" (mandatory)  
      - "type" (mandatory)  
      - "label" (mandatory)  
      - "value" (mandatory) a string with the selected value    
 
2. "boolean":  
Supported in the modal dialog is used to select a boolean value like for a checkbox or a switch  
      - "id" (mandatory)  
      - "type" (mandatory)  
      - "label" (mandatory)     
      - "value" (mandatory) a boolean value  
      - "help" (optionnal) a string with a help text in tooltip  
      - "depend" (optionnal) this is not supported in the modal dialog, but used in interface tab to show or hide a field based on the value of another field  

3. "group":  
Supported in the modal dialog is used to group fields together, it may contain any type of fields but not another group  
      - "id" (mandatory)   
      - "type" (mandatory)  
      - "label" (optional)  
      - "value" (mandatory) an array of fields   
      - "depend" (optionnal) this is not supported in the modal dialog, but used in interface tab to show or hide a field based on the value of another field   

4. "number":   
Supported in the modal dialog is used to select a number value float or integer  
      - "id" (mandatory)  
      - "type" (mandatory)  
      - "label" (mandatory)  
      - "min" (optional) a string with the minimum value   
      - "max" (optional) a string with the maximum value  
      - "help" (optionnal) a string with a help text in tooltip  
      - "step" (optionnal) a string with the step value for the input, can be a float  
      - "placeholder" (optionnal) a string with a placeholder text   
      - "append" (optionnal) a string to append to the value input like a unit   
      - "value" (mandatory) a number value   
      - "depend" (optionnal) this is not supported in the modal dialog, but used in interface tab to show or hide a field based on the value of another field   

5. "text":   
  Supported in the modal dialog is used to select a text value   

      - "id" (mandatory)   
      - "type" (mandatory)   
      - "label" (mandatory)   
      - "value" (mandatory) a string with the selected value   
      - "help" (optionnal) a string with a help text in tooltip   
      - "placeholder" (optionnal) a string with a placeholder text   
      - "depend" (optionnal) this is not supported in the modal dialog, but used in interface tab to show or hide a field based on the value of another field   
      - "min" (optionnal) minimum length of the text   
      - "max" (optionnal) maximum length of the text   
      - "regexpattern" (optionnal) a string with a regex to validate the text   
      - "append" (optionnal) a string to append to the value input like a unit   

6. "list":
Currently not supported in the modal dialog it is used in interface tab to select a value from a list (macros, extracontent, panels order, shorkeys)
      - "id" (mandatory)
      - "depend" (optionnal) this is not supported in the modal dialog, but used in interface tab to show or hide a field based on the value of another field
      - "fixed" (optionnal) 
      - "sorted" (optionnal)
      - "type" (mandatory)
      - "label" (mandatory)
      - "value" (mandatory)
      - "nodelete" (optionnal)
      - "editable" (optionnal)

7. "select":
Supported in the modal dialog is used to select a value from a drop list
      - "id" (mandatory)
      - "type" (mandatory)     
      - "label" (optional)
      - "value" (mandatory) a string with the selected value
      - "options" (mandatory) an array of objects with the options
      - "help" (optionnal) a string with a help text in tooltip
      - "depend" (optionnal) this is not supported in the modal dialog, but used in interface tab to show or hide a field based on the value of another field



#### Handling Messages
The code listens for messages from the parent window using the handleMessage function. When a message is received, it checks the type and id properties to determine if it's a modal-related message.

If the message is a modal response, it logs the clicked button (line.response) and performs specific actions based on the modal type and response.

For the Fields Modal, if the response is 'create' (response1 because validation is bt1), it updates the defaultSettings object with the values entered in the fields (line.inputData).
For the Input Modal, if the response is 'create' (response1 because validation is bt1), it displays the entered input value (line.inputData).


## Sample codes   
{{ attachments() }} 
