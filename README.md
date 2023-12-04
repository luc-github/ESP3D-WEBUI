# ESP3D-WEBUI [<img src="https://img.shields.io/liberapay/patrons/ESP3D.svg?logo=liberapay">](https://liberapay.com/ESP3D)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-30-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

[Latest stable release ![Release Version](https://img.shields.io/github/v/release/luc-github/ESP3D-WEBUI?color=green&include_prereleases&style=plastic) ![Release Date](https://img.shields.io/github/release-date/luc-github/ESP3D-WEBUI.svg?style=plastic)](https://github.com/luc-github/ESP3D-WEBUI/releases/latest/) [![Travis (.org) branch](https://img.shields.io/travis/luc-github/ESP3D-WEBUI/2.1?style=plastic)](https://travis-ci.org/github/luc-github/ESP3D-WEBUI)   

[Latest development version ![Development Version](https://img.shields.io/badge/Devt-v3.0-yellow?style=plastic) ![GitHub last commit (branch)](https://img.shields.io/github/last-commit/luc-github/ESP3D-WEBUI/3.0?style=plastic)](https://github.com/luc-github/ESP3D-WEBUI/tree/3.0) [![github-ci](https://github.com/luc-github/ESP3D-WeBUI/workflows/build-ci/badge.svg)](https://github.com/luc-github/ESP3D-WEBUI/actions/workflows/build-ci.yml) [![Project Page ESP3D 3.0](https://img.shields.io/badge/Project%20page-ESP3D%203.0-blue?style=plastic)](https://github.com/users/luc-github/projects/1/views/1)    
 
[Project board](https://github.com/users/luc-github/projects/1/views/1)

## What is that ?
A web configuration tool for ESP3D 2.1
Originaly based on great UI from Jarek Szczepanski (imrahil): [smoothieware-webui](http://imrahil.github.io/smoothieware-webui/) to get a multi firmware support for [Repetier](https://github.com/repetier/Repetier-Firmware), [Repetier for Davinci printer](https://github.com/luc-github/Repetier-Firmware-0.92), (Marlin)[https://github.com/MarlinFirmware], [Marlin Kimbra](https://github.com/MagoKimbra/MarlinKimbra) and of course [Smoothieware](https://github.com/Smoothieware/Smoothieware)

## Why doing it ?
Original I ported [smoothieware-webui](http://imrahil.github.io/smoothieware-webui/) to support [ESP3D firmware](https://github.com/luc-github/ESP3D) and it was working pretty well and gave :[smoothieware-webui-for-ESP3D](https://github.com/luc-github/smoothieware-webui-for-ESP3D) 
But this UI has a 2 big limitations:    
1 - you need internet access to get all libraries available to download, which may not happen when ESP is in AP mode for configuration if you do not have all js/css in your browser cache, or if you want to use in local environement, in that case not only ESP AP mode is not displaying UI properly but also STA mode - so it make the ESP useless

2 - it rely on server availability and certificat check, I got several certificat failure for unknown reason that made the UI not working

So the solution was to make all resources available - easy no ?

Yes but!  ESP webserver is a convenient but it is also a very light webserver, allowing no more than 5 active connections at once and with a pretty limited filesystem space, so even concatenated all resources like bootstrap icon, angular and others libraries do not work as expected and do not fit the available space.

So I came with a full rewrite using pure javascript and resized resources:    
1 - a compressed css based on [bootstrap](http://getbootstrap.com/css/)   
2 - a local limited version of svg based of [Glyphicons Halflings](http://glyphicons.com/) to get a small footprint.    
3 - a customized version of [smoothiecharts](http://smoothiecharts.org/) is used to display temperatures charts, it is simple and perfectly sized for the current purpose   

The result is a monolitic file with a minimal size allowing almost full control of ESP3D board and your 3D printer

## Sponsors 
[<img width="200px" src="https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/2.1/images/sponsors-supporters/MKS/mksmakerbase.jpg" title="MKS Makerbase">](https://github.com/makerbase-mks)&nbsp;&nbsp;

## Supporters


## Become a sponsor or a supporter
 * A sponsor is a recurent donator    
If your tier is `10 US$/month` or more, to thank you for your support, your logo / avatar will be added to the readme page with eventually with a link to your site.    
 * A supporter is per time donator 
 If your donation is over `120 US$` per year, to thank you for your support, your logo / avatar will be added to the readme page with eventually with a link to your site.  

 Every support is welcome, indeed helping users / developing new features need time and devices, donations contribute a lot to make things happen, thank you.

* liberapay <a href="https://liberapay.com/ESP3D/donate"><img alt="Donate using Liberapay" src="https://liberapay.com/assets/widgets/donate.svg"></a> 
* Paypal [<img src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG_global.gif" border="0" alt="PayPal – The safer, easier way to pay online.">](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=FQL59C749A78L)
* ko-fi [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/G2G0C0QT7)

## Features
- It supports several firmwares based on Repetier, Marlin, Smoothieware and GRBL.
- It allows to fully configure ESP wifi
- It has a macro support to add custom commands in UI by adding buttons launching some GCODE files from SD or ESP 
- It supports several languages, check list [here](https://github.com/luc-github/ESP3D-WEBUI/wiki/Translation-support)
- It allows to display a web camera in UI or detached
- It allows to edit the Repetier EEPROM, Smoothieware config file, Marlin and GRBL settings
- It allows to update the ESP3D by uploading the FW
- it allows to control and monitor your 3D printer in every aspect (position, temperature, print, SD card content, custom command

Please look at screenshots:
Main tab and menu:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/Full1.PNG'/>   
Control panel:  
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/controls.PNG'/>  
Macro dialog:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/Macro.PNG'/>   
Temperatures panel:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/temperatures.PNG'/>   
Extruder panel:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/esxtruders.PNG'/>  
SD card panel:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/SD1.PNG'/>  
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/SD1.5.PNG'/>   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/SD2.PNG'/>  
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/SD-Dir.PNG'/>  
Camera Tab:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/Camera.PNG'/>  
Repetier EEPROM Editor tab:  
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/Repetier.PNG'/>  
Smoothieware config Editor tab:  
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/smoothieware.PNG'/>  
Marlin config Editor tab:  
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/Marlin.PNG'/>  
GRBL config Editor tab: 
<img src='https://user-images.githubusercontent.com/8822552/37540735-60bada08-2958-11e8-92ee-69aee4b83e7a.png'/> 
ESP3D settings Editor:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/ESP3D1.PNG'/>  
ESP3D Status:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/status.PNG'/>   
ESP3D SPIFFS:   
<img src='https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/master/images/SPIFFS.PNG'/>   


## Installation
Please use the latest [ESP3D firmware](https://github.com/luc-github/ESP3D/tree/2.1.x) and copy the index.html.gz file on root of SPIFFS, in theory ESP3D have a version of web-ui but it may not be the latest one

## Contribution / development
Check wiki section [Contribution/Development](https://github.com/luc-github/ESP3D-WEBUI/wiki/Compilation---Development)

## Issues / Questions
You can submit ticket [here](https://github.com/luc-github/ESP3D-WEBUI/issues) or open discussion if it is not an issue [here](https://github.com/luc-github/ESP3D-WEBUI/discussions) or Join the chat at [![Discord server](https://img.shields.io/discord/752822148795596940?color=blue&label=discord&logo=discord)](https://discord.gg/Z4ujTwE)   


 

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/alxblog"><img src="https://avatars.githubusercontent.com/u/3979539?v=4?s=100" width="100px;" alt=" Alexandre "/><br /><sub><b> Alexandre </b></sub></a><br /><a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=alxblog" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/MonoAnji"><img src="https://avatars.githubusercontent.com/u/16881074?v=4?s=100" width="100px;" alt="René Pasold"/><br /><sub><b>René Pasold</b></sub></a><br /><a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=MonoAnji" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aaronse"><img src="https://avatars.githubusercontent.com/u/16479976?v=4?s=100" width="100px;" alt="aaron GitHub"/><br /><sub><b>aaron GitHub</b></sub></a><br /><a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=aaronse" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Pavulon87"><img src="https://avatars.githubusercontent.com/u/23641103?v=4?s=100" width="100px;" alt="Pavulon87"/><br /><sub><b>Pavulon87</b></sub></a><br /><a href="https://github.com/luc-github/ESP3D-WEBUI/issues?q=author%3APavulon87" title="Bug reports">🐛</a> <a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=Pavulon87" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://honuputters.com"><img src="https://avatars.githubusercontent.com/u/4861133?v=4?s=100" width="100px;" alt="Mitch Bradley"/><br /><sub><b>Mitch Bradley</b></sub></a><br /><a href="#ideas-MitchBradley" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=MitchBradley" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.facebook.com/Patricecotemusique/"><img src="https://avatars.githubusercontent.com/u/29361809?v=4?s=100" width="100px;" alt="Patrice Côté"/><br /><sub><b>Patrice Côté</b></sub></a><br /><a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=cotepat" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://engineer2designer.blogspot.com"><img src="https://avatars.githubusercontent.com/u/25747949?v=4?s=100" width="100px;" alt="E2D"/><br /><sub><b>E2D</b></sub></a><br /><a href="#translation-Engineer2Designer" title="Translation">🌍</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://cedrik-theesen.de"><img src="https://avatars.githubusercontent.com/u/24916321?v=4?s=100" width="100px;" alt="Cedrik Theesen"/><br /><sub><b>Cedrik Theesen</b></sub></a><br /><a href="#translation-duramson" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/royfocker19"><img src="https://avatars.githubusercontent.com/u/39307144?v=4?s=100" width="100px;" alt="royfocker19"/><br /><sub><b>royfocker19</b></sub></a><br /><a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=royfocker19" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/BToersche"><img src="https://avatars.githubusercontent.com/u/16536432?v=4?s=100" width="100px;" alt="Bart Toersche"/><br /><sub><b>Bart Toersche</b></sub></a><br /><a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=BToersche" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/vivian-ng"><img src="https://avatars.githubusercontent.com/u/24537694?v=4?s=100" width="100px;" alt="vivian-ng"/><br /><sub><b>vivian-ng</b></sub></a><br /><a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=vivian-ng" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/drzejkopf"><img src="https://avatars.githubusercontent.com/u/41212609?v=4?s=100" width="100px;" alt="drzejkopf"/><br /><sub><b>drzejkopf</b></sub></a><br /><a href="#translation-drzejkopf" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.gtmax.com.br"><img src="https://avatars.githubusercontent.com/u/6072702?v=4?s=100" width="100px;" alt="Luciano Charles Moda"/><br /><sub><b>Luciano Charles Moda</b></sub></a><br /><a href="#translation-lucmoda" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://youprintin3d.de"><img src="https://avatars.githubusercontent.com/u/8026764?v=4?s=100" width="100px;" alt="AxelB"/><br /><sub><b>AxelB</b></sub></a><br /><a href="#translation-leseaw" title="Translation">🌍</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Zefram88"><img src="https://avatars.githubusercontent.com/u/40454706?v=4?s=100" width="100px;" alt="Zefram88"/><br /><sub><b>Zefram88</b></sub></a><br /><a href="#translation-Zefram88" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/3d-gussner"><img src="https://avatars.githubusercontent.com/u/25530011?v=4?s=100" width="100px;" alt="3d-gussner"/><br /><sub><b>3d-gussner</b></sub></a><br /><a href="#translation-3d-gussner" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://aganov.github.io"><img src="https://avatars.githubusercontent.com/u/176610?v=4?s=100" width="100px;" alt="Alex Ganov"/><br /><sub><b>Alex Ganov</b></sub></a><br /><a href="#ideas-aganov" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=aganov" title="Code">💻</a> <a href="#mentoring-aganov" title="Mentoring">🧑‍🏫</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bdring"><img src="https://avatars.githubusercontent.com/u/189677?v=4?s=100" width="100px;" alt="bdring"/><br /><sub><b>bdring</b></sub></a><br /><a href="#financial-bdring" title="Financial">💵</a> <a href="https://github.com/luc-github/ESP3D-WEBUI/issues?q=author%3Abdring" title="Bug reports">🐛</a> <a href="#platform-bdring" title="Packaging/porting to new platform">📦</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ArturNadolski"><img src="https://avatars.githubusercontent.com/u/20038314?v=4?s=100" width="100px;" alt="n4d01"/><br /><sub><b>n4d01</b></sub></a><br /><a href="#translation-ArturNadolski" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.civade.com"><img src="https://avatars.githubusercontent.com/u/2135006?v=4?s=100" width="100px;" alt="Jean-Philippe CIVADE"/><br /><sub><b>Jean-Philippe CIVADE</b></sub></a><br /><a href="#translation-ewidance" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kondorzs"><img src="https://avatars.githubusercontent.com/u/15940476?v=4?s=100" width="100px;" alt="kondorzs"/><br /><sub><b>kondorzs</b></sub></a><br /><a href="#translation-kondorzs" title="Translation">🌍</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/onekk"><img src="https://avatars.githubusercontent.com/u/7129964?v=4?s=100" width="100px;" alt="Carlo"/><br /><sub><b>Carlo</b></sub></a><br /><a href="#translation-onekk" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/zrwd01"><img src="https://avatars.githubusercontent.com/u/33946060?v=4?s=100" width="100px;" alt="zrwd01"/><br /><sub><b>zrwd01</b></sub></a><br /><a href="#translation-zrwd01" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Wesie"><img src="https://avatars.githubusercontent.com/u/9315139?v=4?s=100" width="100px;" alt="Wesie"/><br /><sub><b>Wesie</b></sub></a><br /><a href="#translation-Wesie" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/DusDus"><img src="https://avatars.githubusercontent.com/u/69902032?v=4?s=100" width="100px;" alt="DusDus"/><br /><sub><b>DusDus</b></sub></a><br /><a href="#translation-DusDus" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nyarurato"><img src="https://avatars.githubusercontent.com/u/8384007?v=4?s=100" width="100px;" alt="nyarurato"/><br /><sub><b>nyarurato</b></sub></a><br /><a href="#translation-nyarurato" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/terjeio"><img src="https://avatars.githubusercontent.com/u/20260062?v=4?s=100" width="100px;" alt="Terje Io"/><br /><sub><b>Terje Io</b></sub></a><br /><a href="#ideas-terjeio" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=terjeio" title="Code">💻</a> <a href="#translation-terjeio" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.v1engineering.com/"><img src="https://avatars.githubusercontent.com/u/55478432?v=4?s=100" width="100px;" alt="Ryan V1"/><br /><sub><b>Ryan V1</b></sub></a><br /><a href="#financial-V1EngineeringInc" title="Financial">💵</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jamespearson04"><img src="https://avatars.githubusercontent.com/u/26628667?v=4?s=100" width="100px;" alt="James Pearson"/><br /><sub><b>James Pearson</b></sub></a><br /><a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=jamespearson04" title="Code">💻</a> <a href="#ideas-jamespearson04" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dbuezas"><img src="https://avatars.githubusercontent.com/u/777196?v=4?s=100" width="100px;" alt="David Buezas"/><br /><sub><b>David Buezas</b></sub></a><br /><a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=dbuezas" title="Code">💻</a> <a href="https://github.com/luc-github/ESP3D-WEBUI/issues?q=author%3Adbuezas" title="Bug reports">🐛</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!