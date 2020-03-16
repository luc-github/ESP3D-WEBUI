# customized ESP3D-BOXUI (WEBUI) 
This is a customized Version of the WebUi from the ESP3D Project from Luc. I have changed the Menu and Design for a better optic and added a note-function called "Safe-Memo" and Printprogress function. The Note Function works with localStorage, that means it works only on one PC/Phone/Tablet and lose the data if some other device is used. That's because the localStorage is written on every device. So keep it in mind - Your data are not lost, you must go to the device where you have added the Note in SafeMemo-Tab. The Printprogress Function works with the Gcode M27 Command. With Marlin Firmware it works really nice, but i don't know how other Firmwares will handle it. 

## What is that ?
A web configuration tool for ESP3D 2.1
Originaly based on great UI from Jarek Szczepanski (imrahil): [smoothieware-webui](http://imrahil.github.io/smoothieware-webui/) to get a multi firmware support for [Repetier](https://github.com/repetier/Repetier-Firmware), [Repetier for Davinci printer](https://github.com/luc-github/Repetier-Firmware-0.92), (Marlin)[https://github.com/MarlinFirmware], [Marlin Kimbra](https://github.com/MagoKimbra/MarlinKimbra) and of course [Smoothieware](https://github.com/Smoothieware/Smoothieware)

## Features
- support several firmwares based on Marlin, Repetier and Smoothieware.
- Print Progress Bar showing print progress (Marlin firmware)
- SafeMemo allow to to safe Notes
- customized Menu for 1, 2, 3 and 4 Colum
- integrated Clock in Header
- fully configure ESP wifi
- macro support to add custom commands in UI by adding buttons launching some GCODE files from SD or ESP 
- supports currently English, French, German (thanks @leseaw) and Spanish languages
- display a web camera in UI or detached
- edit the Repetier EEPROM, Smoothieware config file, Marlin and GRBL settings
- update the ESP3D by uploading the FW
- control and monitor your 3D printer in every aspect (position, temperature, print, SD card content, custom command

Please look at screenshots:
responsive menu with hamburger menu on 1 colum:  
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/1-colum.JPG'/> 

for 2, 3 and 4 colum the menu is attached to the bottom
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/2-colum-better.JPG'/> 
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/3-colum.JPG'/>
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/4-colum.JPG'/>

Print Progress, Main tab and menu:   
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/print-progress.JPG'/>      

Safe Memo:  
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/esp3d-safe-memo.JPG'/> 

Camera Tab:   
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/esp3d-camera.JPG'/>

Temperatures panel:   
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/esp3d-temperatur.JPG'/>  

SD card panel:   
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/esp3d-sd-card.JPG'/>   

Printer config Editor:  
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/esp3d-printer-settings2.JPG'/> 

Command Panel for Printer: 
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/esp3d-command-panel.JPG'/>

ESP3D settings:  
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/esp3d-settings-programm.JPG'/>
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/esp3d-settings.JPG'/> 

ESP3D Status:   
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/esp3d-status.JPG'/>   

ESP3D SPIFFS:   
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/esp3d-SPIFFS.JPG'/> 

Macro Popup dialog:   
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/esp3d-makros.JPG'/>   

ESP3D Setup Guide:   
<img src='https://raw.githubusercontent.com/jayjojayson/ESP3D-WEBUI/2.1/images/esp3d-setup.JPG'/> 


## Installation
Use the index.html.gz File from the root directory of this repository and upload it to your ESP3D with any Webbrowser. Go the ESP3D Settings Tab in the WebUI and upload the File.

If you want change back to the index.html.gz from the original WebUi, copy the index File from the root of ESP3D or better ESP3D WebUI and copy the index.html.gz file on root of SPIFFS. latest [ESP3D firmware](https://github.com/luc-github/ESP3D/tree/2.1) 

## Contribution / development
Check wiki section [Contribution/Development](https://github.com/luc-github/ESP3D-WEBUI/wiki/Compilation---Development)
