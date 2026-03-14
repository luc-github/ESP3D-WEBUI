# preferences.json

There are 2 kind of preferences.json file:

- one that only save the values of the settings and which is stored in flash user space, the user one
- one that that define the parameters of each settings and which is part of the code, the application one

## User preferences.json

It is stored in flash user space, and it is used to store user preferences.
It is a json file but with specific format. 
```json
{
"custom": {
    "logo": "....",
    "help":"https://...",
    "information":"https://...",
},
 "settings": {
  "language": "default",
  "theme": "default",
  "autoload": true,
  "mobileview": false,
  "audio": false,
  "hapticfeedback": false,
  "audiofeedback": false,
  "showinformationpage": true,
  "showmachinesettings": true,
  "enableautorepeat": false,
  "enableshortcuts": false,
  "autorepeatdelay": "500",
  "emergencystop": "M112",
  "fixedpanels": false,
  "panelsorder": [
   {
    "id": "Files",
    "name": "files"
   },
   {
    "id": "Terminal",
    "name": "terminal"
   },
   {
    "id": "Jog",
    "name": "jog",
    "value": "jog"
   },
   {
    "id": "Extruders",
    "name": "extruders"
   },
   {
    "id": "Temperatures",
    "name": "temperatures"
   },
   {
    "id": "Charts",
    "name": "charts"
   },
   {
    "id": "Status",
    "name": "status"
   },
   {
    "id": "Controls",
    "name": "controls"
   },
   {
    "id": "Notifications",
    "name": "notification"
   },
   {
    "id": "Macros",
    "name": "macros"
   },
   {
    "id": "Extracontents",
    "name": "extracontents"
   }
  ],
  "enablepolling": false,
  "pollingcmds": [
   {
    "id": "samplepolling",
    "name": "3s",
    "cmds": "M105",
    "refreshtime": "5000"
   }
  ],
  "showterminalpanel": true,
  "openterminalonstart": true,
  "verbose": true,
  "autoscroll": true,
  "showfilespanel": true,
  "openfilesonstart": true,
  "filesfilter": "g;G;gco;GCO;gcode;GCODE",
  "flashfs": true,
  "sort_flashfs_files": true,
  "tftfs": "none",
  "tftsd": false,
  "tftbttsdlistcmd": "M20 SD:#",
  "tftbttsdplaycmd": "M23 SD:#;M24",
  "tftbttsddeletecmd": "M30 SD:#",
  "tftmkssdlistcmd": "M998 1;M20 1:#",
  "tftmkssdplaycmd": "M998 1;M23 1:#;M24",
  "sort_tftsd_files": true,
  "tftusb": false,
  "tftbttusblistcmd": "M20 U:#",
  "tftmksusblistcmd": "M998 0;M23 0:#;M24",
  "tftbttusbplaycmd": "M23 U:#;M24",
  "tftbttusbdeletecmd": "M30 U:#",
  "tftmskusbplaycmd": "M998 0;M23 0:#;M24",
  "sort_tftusb_files": true,
  "sd": false,
  "sdlistcmd": "M21;M20",
  "sdplaycmd": "M21;M23 #;M24",
  "sddeletecmd": "M21;M30 #",
  "sort_sd_files": true,
  "sdext": false,
  "sdextlistcmd": "M21;M20",
  "sdextplaycmd": "M21;M23 #;M24",
  "sdextdeletecmd": "M21;M30 #",
  "sort_sdext_files": true,
  "default_filesystem": "FLASH",
  "showjogpanel": false,
  "openjogonstart": true,
  "swap_x_y": false,
  "invert_x": false,
  "invert_y": false,
  "invert_z": false,
  "xyfeedrate": "1000",
  "zfeedrate": "1000",
  "xpos": "100",
  "ypos": "100",
  "zpos": "100",
  "homecmd": "G28 $",
  "motoroff": "M84",
  "keymap": [
   {
    "id": "btn+X",
    "name": "btn+X",
    "key": "ArrowRight"
   },
   {
    "id": "btn-X",
    "name": "btn-X",
    "key": "ArrowLeft"
   },
   {
    "id": "btnHX",
    "name": "btnHX",
    "key": "X"
   },
   {
    "id": "btn+Y",
    "name": "btn+Y",
    "key": "ArrowUp"
   },
   {
    "id": "btn-Y",
    "name": "btn-Y",
    "key": "ArrowDown"
   },
   {
    "id": "btnHY",
    "name": "btnHY",
    "key": "Y"
   },
   {
    "id": "btn+Z",
    "name": "btn+Z",
    "key": "PageUp"
   },
   {
    "id": "btn-Z",
    "name": "btn-Z",
    "key": "PageDown"
   },
   {
    "id": "btnHZ",
    "name": "btnHZ",
    "key": "Z"
   },
   {
    "id": "btnHXYZ",
    "name": "btnHXYZ",
    "key": "Home"
   },
   {
    "id": "btnMoveXY",
    "name": "btnMoveXY",
    "key": "P"
   },
   {
    "id": "btnMoveZ",
    "name": "btnMoveZ",
    "key": "End"
   },
   {
    "id": "btnMotorOff",
    "name": "btnMotorOff",
    "key": "M"
   },
   {
    "id": "move_100",
    "name": "move_100",
    "key": "1"
   },
   {
    "id": "move_10",
    "name": "move_10",
    "key": "2"
   },
   {
    "id": "move_1",
    "name": "move_1",
    "key": "3"
   },
   {
    "id": "move_0_1",
    "name": "move_0_1",
    "key": "4"
   },
   {
    "id": "btnEStop",
    "name": "btnEStop",
    "key": "Delete"
   }
  ],
  "shownotificationspanel": false,
  "opennotificationsonstart": false,
  "notifautoscroll": true,
  "showmacrospanel": false,
  "openmacrosonstart": false,
  "macros": [],
  "showextracontents": true,
  "openextrapanelsonstart": true,
  "extracontents": [
   {
    "id": "3jmbcy72o",
    "name": "click2go",
    "icon": "Move",
    "target": "panel",
    "source": "click2go.html",
    "type": "extension",
    "refreshtime": "0"
   },
   {
    "id": "2dlh96qn2",
    "name": "Image",
    "icon": "Meh",
    "target": "panel",
    "source": "luc.png",
    "type": "image",
    "refreshtime": "0"
   },
   {
    "id": "y1ci9xeca",
    "name": "gcodeViewer",
    "icon": "Box",
    "target": "panel",
    "source": "gcodeViewer.html",
    "type": "extension",
    "refreshtime": "0"
   }
  ],
  "showstatuspanel": false,
  "openstatusonstart": true,
  "sdpausecmd": "M25",
  "sdresumecmd": "M24",
  "sdstopcmd": "M524",
  "tftsdpausecmd": "M25",
  "tftsdresumecmd": "M24",
  "tftsdstopcmd": "M524",
  "tftusbpausecmd": "M25",
  "tftusbresumecmd": "M24",
  "tftusbstopcmd": "M524",
  "showtemperaturespanel": false,
  "opentemperaturesonstart": true,
  "showextruderctrls": true,
  "extrudermax": "280",
  "extruderpreheat": "190;220;230",
  "heatextruder": "M104 S$ T#",
  "showbedctrls": true,
  "bedmax": "140",
  "bedpreheat": "50;90;110",
  "heatbed": "M140 S$",
  "showchamberctrls": true,
  "chambermax": "140",
  "chamberpreheat": "50;90;110",
  "heatchamber": "M141 S$",
  "showprobectrls": true,
  "showredundantctrls": true,
  "showboardctrls": true,
  "showchartspanel": false,
  "openchartsonstart": true,
  "showextruderchart": true,
  "showredundantchart": true,
  "showbedchart": true,
  "showchamberchart": true,
  "showprobechart": true,
  "showboardchart": true,
  "showsensorchart": true,
  "showextruderspanel": false,
  "openextrudersonstart": true,
  "efeedrate": "400",
  "extruderdistance": "5;10;100",
  "ismixedextruder": false,
  "enumber": "1",
  "ecolors": "blue;red;green;#FF00FF;cyan;black",
  "showextracontrolspanel": false,
  "openextracontrolsonstart": true,
  "showfanctrls": true,
  "fanpresets": "0;20;50;75;100",
  "fancmd": "M106 S$ P#",
  "showspeedctrls": true,
  "speedpresets": "20;50;75;100;125;150;175;200;250;300",
  "speedcmd": "M220 S$",
  "showflowratectrls": true,
  "flowratepresets": "20;50;75;100;125;150;175;200;250;300",
  "flowratecmd": "M221 S$ T#",
  "showsensorctrls": true
 },
 "extensions": {
  "gcodeViewer": {
   "showTravels": false,
   "invertXY": false,
   "invertFrontBack": false,
   "enableSmartZoom": false,
   "invertWheelDirection": false,
   "controlRendering": true
  }
 }
}
```

### The custom section

The custom section is used to define the custom logo, help and information links.
The logo is a svg file. where the height and the color and the background color are replaced by the following variables to be replaced in the svg file:

- {height}
- {color}
- {bgcolor}

The help and information links are urls displayed in the about page.


```json
{
    "custom": {
        "logo": "....",
        "help":"https://...",
        "information":"https://...",
    },
    ...
```

### The settings section

This section is used to define the settings of the web UI.
only settingsd id and values are stored and used.

```json 
{
"settings": {
  "language": "default",
  "theme": "default",
  "autoload": true,
  "mobileview": false,
  "audio": false,
  "hapticfeedback": false,
  "audiofeedback": false,
  "showinformationpage": true,
  "showmachinesettings": true,
  "enableautorepeat": false,
  "enableshortcuts": false,
  "autorepeatdelay": "500",
  "emergencystop": "M112",
  "fixedpanels": false,
  "panelsorder": [
   {
    "id": "Files",
    "name": "files"
   },
   {
    "id": "Terminal",
    "name": "terminal"
...
}
```

### The extensions section

This section is used to store the settings used by the extensions.

```json
{
    "extensions": {
        "gcodeViewer": {
            "showTravels": false,
            "invertXY": false,
            "invertFrontBack": false,
            "enableSmartZoom": false,
            "invertWheelDirection": false,
            "controlRendering": true
        }
    }
...
```

## Application preferences.json

Storted in webUI code it is used to know how to display and handle each setting.
The settings definition depend of the target firmware( Marlin, Grbl, etc...) and system group (CNC, 3DPrinter, etc...).

So the json is splited  in several part that are merged at compile time.

The json has same number of sections as the WebUI has panels.

```
{
    "settings": {
        "status": [
            {
                "id": "showstatuspanel",
                "type": "boolean",
                "label": "S63",
                "value": true
            },
            {
                "id": "openstatusonstart",
                "type": "boolean",
                "label": "S93",
                "value": true
            }
        ],
        "temperatures": [
            {
                "id": "showtemperaturespanel",
                "type": "boolean",
                "label": "S63",
                "value": true
            },
            {
                "id": "opentemperaturesonstart",
                "type": "boolean",
                "label": "S93",
                "value": true
            },
            {
                "id": "showextruderctrls",
                "type": "boolean",
                "label": "P82",
                "value": true
            },
            {
                "id": "extrudercontrolsgroup",
                "type": "group",
                "label": "",
                "depend": [{ "id": "showextruderctrls", "value": true }],
                "value": [
                    {
                        "id": "extrudermax",
                        "type": "number",
                        "label": "P48",
                        "value": "280",
                        "append": "P72"
                    },
                    {
                        "id": "extruderpreheat",
                        "type": "text",
                        "label": "P104",
                        "value": "190;220;230",
                        "append": "P72",
                        "help": "S97"
                    },
                    {
                        "id": "heatextruder",
                        "type": "text",
                        "label": "P106",
                        "value": "M104 S$ T#",
                        "help": "P94"
                    }
                ]
            },
            {
                "id": "showbedctrls",
                "type": "boolean",
                "label": "P83",
                "value": true
            },
            {
                "id": "bedcontrolsgroup",
                "type": "group",
                "label": "",
                "depend": [{ "id": "showbedctrls", "value": true }],
                "value": [
                    {
                        "id": "bedmax",
                        "type": "number",
                        "label": "P48",
                        "value": "140",
                        "append": "P72",
                        "min": "1"
                    },
                    {
                        "id": "bedpreheat",
                        "type": "text",
                        "label": "P104",
                        "value": "50;90;110",
                        "append": "P72",
                        "help": "S97"
                    },
                    {
                        "id": "heatbed",
                        "type": "text",
                        "label": "P106",
                        "value": "M140 S$",
                        "help": "P94"
                    }
                ]
            },
            {
                "id": "showchamberctrls",
                "type": "boolean",
                "label": "P84",
                "value": true
            },
            {
                "id": "chambercontrolsgroup",
                "type": "group",
                "label": "",
                "depend": [{ "id": "showchamberctrls", "value": true }],
                "value": [
                    {
                        "id": "chambermax",
                        "type": "number",
                        "label": "P48",
                        "value": "140",
                        "append": "P72"
                    },
                    {
                        "id": "chamberpreheat",
                        "type": "text",
                        "label": "P104",
                        "append": "P72",
                        "value": "50;90;110",
                        "help": "S97"
                    },
                    {
                        "id": "heatchamber",
                        "type": "text",
                        "label": "P106",
                        "value": "M141 S$",
                        "help": "P94"
                    }
                ]
            },
            {
                "id": "showprobectrls",
                "type": "boolean",
                "label": "P85",
                "value": true
            },
            {
                "id": "showredundantctrls",
                "type": "boolean",
                "label": "P86",
                "value": true
            },
            {
                "id": "showboardctrls",
                "type": "boolean",
                "label": "P87",
                "value": true
            }
        ],
        "charts": [
            {
                "id": "showchartspanel",
                "type": "boolean",
                "label": "S63",
                "value": true
            },
            {
                "id": "openchartsonstart",
                "type": "boolean",
                "label": "S93",
                "value": true
            },
            {
                "id": "showextruderchart",
                "type": "boolean",
                "label": "P82",
                "value": true
            },
            {
                "id": "showredundantchart",
                "type": "boolean",
                "label": "P86",
                "value": true
            },
            {
                "id": "showbedchart",
                "type": "boolean",
                "label": "P83",
                "value": true
            },
            {
                "id": "showchamberchart",
                "type": "boolean",
                "label": "P84",
                "value": true
            },
            {
                "id": "showprobechart",
                "type": "boolean",
                "label": "P85",
                "value": true
            },
            {
                "id": "showboardchart",
                "type": "boolean",
                "label": "P87",
                "value": true
            },
            {
                "id": "showsensorchart",
                "type": "boolean",
                "label": "P88",
                "value": true,
                "depend": [{ "id": "showsensorctrls", "value": true }]
            }
        ],
 ...
```
### Format of each setting
Each setting is composed of id, type, label, value
Where id must be unique in whole json file, value is the default value, label can be the text or the reference of translated id.
the type can be one of the following, each one can have also extra entries described as below:

1. "pickup":
It is used in interface tab to select language or theme
   - "id" (mandatory)
   - "type" (mandatory)
   - "label" (mandatory)
   - "value" (mandatory) a string with the selected value  

2. "boolean":
It is used to select a boolean value like for a checkbox or a switch
   - "id" (mandatory)
   - "type" (mandatory)
   - "label" (mandatory)   
   - "value" (mandatory) a boolean value
   - "help" (optionnal) a string with a help text in tooltip
   - "depend" (optionnal) to show or hide a field based on the value of another field

3. "group":
It is used to group fields together, it may contain any type of fields but not another group
   - "id" (mandatory)
   - "type" (mandatory)
   - "label" (optional)
   - "value" (mandatory) an array of fields
   - "depend" (optionnal) to show or hide a field based on the value of another field

4. "number":
It is used to select a number value float or integer
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
   - "depend" (optionnal)  to show or hide a field based on the value of another field

5. "text":
It is used to select a text value
   - "id" (mandatory)
   - "type" (mandatory)
   - "label" (mandatory)
   - "value" (mandatory) a string with the selected value
   - "help" (optionnal) a string with a help text in tooltip
   - "placeholder" (optionnal) a string with a placeholder text
   - "depend" (optionnal) to show or hide a field based on the value of another field
   - "min" (optionnal) minimum length of the text
   - "max" (optionnal) maximum length of the text
   - "regexpattern" (optionnal) a string with a regex to validate the text
   - "append" (optionnal) a string to append to the value input like a unit

6. "list":
It is used in interface tab to select a value from a list (macros, extracontent, panels order, shorkeys)
   - "id" (mandatory)
   - "depend" (optionnal) to show or hide a field based on the value of another field
   - "fixed" (optionnal) 
   - "sorted" (optionnal)
   - "type" (mandatory)
   - "label" (mandatory)
   - "value" (mandatory)
   - "nodelete" (optionnal)
   - "editable" (optionnal)

7. "select":
This one is used to select a value from a drop list
   - "id" (mandatory)
   - "type" (mandatory)     
   - "label" (optional)
   - "value" (mandatory) a string with the selected value
   - "options" (mandatory) an array of objects with the options
   - "help" (optionnal) a string with a help text in tooltip
   - "depend" (optionnal) to show or hide a field based on the value of another field

### The depend parameter

The depend parameter is used to show or hide a field based on the value of another field or another setting
you can refer to an id that is present in current json or some extra id available in [ESP800] response in that case use connection_id, and test against the value or against the not value like :
like :
```json 
"depend": [{ "id": "showextruderctrls", "value": true }],
```
or 

```json
 "depend": [{ "connection_id": "Screen", "value": "=='none'" }]
 ```

 ```json
 "depend": [{"id": "tftfs", "notvalue": "none"}]
 ```

 You can combine different depend conditions:
 
 1 - And
 If in same section it means all the conditions must be true (AND)

 ```

  "depend": [
                { "connection_id": "Screen", "value": "=='none'" },
                { "connection_id": "FWTargetID", "value": "!='30'" },
                { "id": "showfilespanel", "value": true }
            ]
```

2 - Or
If only one condition must be true use `orGroups`
```
"depend": [
            {
                "orGroups": [
                    [{
                        "id": "sd",
                        "value": true
                    }],
                    [{
                        "id": "flashfs",
                        "value": true
                    }],
                    [{ "id": "sdext", "value": true }]
                ]
            }
        ]
```

3 - Or & And Combination
If you need to combine 2 or more conditions it is also possible

```json
"depend": [
    {
        "id": "showfilespanel",
        "value": true
    },
    {
        "orGroups": [
            [{
                "id": "sd",
                "value": true
            }],
            [{
                "id": "flashfs",
                "value": true
            }],
            [{ "id": "sdext", "value": true }],
            [{"id": "tftfs", "notvalue": "none"},{ "id": "tftsd", "value": true }],
            [{"id": "tftfs", "notvalue": "none"},{ "id": "tftusb", "value": true }]
        ]
    }
],
```


