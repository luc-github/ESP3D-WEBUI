# ESP3D-WEBUI 3.0 ![ESP3D-WEBUI](https://img.shields.io/badge/dynamic/json?label=Version&query=$.version&url=https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/refs/heads/3.0/info.json)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

using Preact per @aganov suggestion  
Rewrite per @alxblog suggestion to use proper Preactjs API and lighter css code: use spectre.css instead of bootstrap 4.x

Only compatible with [ESP3DLib 3.0](https://github.com/luc-github/ESP3DLib/tree/3.0) , [ESP3D 3.0](https://github.com/luc-github/ESP3D/tree/3.0), [grblHAL](https://github.com/grblHAL), [ESP3D_TFT 1.0](https://github.com/luc-github/ESP3D-TFT/tree/main)   

![ESP3D-WEBUI](https://img.shields.io/badge/dynamic/json?label=Development&query=$.devt&color=green&style=plastic&url=https://raw.githubusercontent.com/luc-github/ESP3D-WEBUI/refs/heads/3.0/info.json)
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/luc-github/ESP3D-WEBUI/3.0?style=plastic) 
[![github-ci](https://github.com/luc-github/ESP3D-WeBUI/workflows/build-ci/badge.svg)](https://github.com/luc-github/ESP3D-WEBUI/actions/workflows/build-ci.yml)  

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


## Sponsors 
<div align="center">
   <div style="display:flex; flex-wrap:wrap; gap:20px; justify-content:center; margin-bottom:20px">
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/diamond-0.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/diamond-0.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/diamond-1.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/diamond-1.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/diamond-2.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/diamond-2.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/diamond-3.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/diamond-3.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/diamond-4.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/diamond-4.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/diamond-5.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/diamond-5.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/diamond-6.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/diamond-6.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/diamond-7.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/diamond-7.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/diamond-8.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/diamond-8.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/diamond-9.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/diamond-9.svg" style="max-width:400px; width:auto; height:auto"></a>
   </div>
   <div style="display:flex; flex-wrap:wrap; gap:20px; justify-content:center; margin-bottom:20px">
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/platinum-0.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/platinum-0.svg?v=1" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/platinum-1.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/platinum-1.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/platinum-2.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/platinum-2.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/platinum-3.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/platinum-3.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/platinum-4.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/platinum-4.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/platinum-5.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/platinum-5.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/platinum-6.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/platinum-6.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/platinum-7.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/platinum-7.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/platinum-8.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/platinum-8.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/platinum-9.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/platinum-9.svg" style="max-width:400px; width:auto; height:auto"></a>
   </div>
   <div style="display:flex; flex-wrap:wrap; gap:20px; justify-content:center; margin-bottom:20px">
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/gold-0.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/gold-0.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/gold-11.html?1" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/gold-11.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/gold-2.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/gold-2.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/gold-3.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/gold-3.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/gold-4.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/gold-4.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/gold-5.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/gold-5.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/gold-6.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/gold-6.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/gold-7.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/gold-7.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/gold-8.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/gold-8.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/gold-9.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/gold-9.svg" style="max-width:400px; width:auto; height:auto"></a>
   </div>
   <div style="display:flex; flex-wrap:wrap; gap:20px; justify-content:center; margin-bottom:20px">
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/silver-0.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/silver-0.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/silver-1.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/silver-1.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/silver-2.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/silver-2.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/silver-3.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/silver-3.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/silver-4.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/silver-4.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/silver-5.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/silver-5.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/silver-6.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/silver-6.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/silver-7.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/silver-7.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/silver-8.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/silver-8.svg" style="max-width:400px; width:auto; height:auto"></a>
       <a href="https://luc-github.github.io/sponsors/esp3d-webui/silver-9.html" target="_blank" rel="noopener noreferrer"><img src="https://luc-github.github.io/sponsors/esp3d-webui/silver-9.svg" style="max-width:400px; width:auto; height:auto"></a>
   </div>
   Support ESP3D Webui Development - <a href="https://esp3d.io/sponsoring" target="_blank" rel="noopener noreferrer">Become a Sponsor</a>
</div>

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/1001Rem"><img src="https://avatars.githubusercontent.com/u/146172724?v=4?s=100" width="100px;" alt="1001Rem"/><br /><sub><b>1001Rem</b></sub></a><br /><a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=1001Rem" title="Code">💻</a> <a href="https://github.com/luc-github/ESP3D-WEBUI/issues?q=author%3A1001Rem" title="Bug reports">🐛</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

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
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/rondlh"><img src="https://avatars.githubusercontent.com/u/77279634?v=4?s=100" width="100px;" alt="rondlh"/><br /><sub><b>rondlh</b></sub></a><br /><a href="https://github.com/luc-github/ESP3D-WEBUI/commits?author=rondlh" title="Code">💻</a> <a href="https://github.com/luc-github/ESP3D-WEBUI/pulls?q=is%3Apr+reviewed-by%3Arondlh" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jeyeager65"><img src="https://avatars.githubusercontent.com/u/28162926?v=4?s=100" width="100px;" alt="Jason Yeager"/><br /><sub><b>Jason Yeager</b></sub></a><br /><a href="#financial-jeyeager65" title="Financial">💵</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://discord.gg/yNwksQvZmQ"><img src="https://avatars.githubusercontent.com/u/12979070?v=4?s=100" width="100px;" alt="makerbase"/><br /><sub><b>makerbase</b></sub></a><br /><a href="#financial-makerbase-mks" title="Financial">💵</a> <a href="#platform-makerbase-mks" title="Packaging/porting to new platform">📦</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/abcpibot"><img src="https://avatars.githubusercontent.com/u/5948988?v=4?s=100" width="100px;" alt="abcpibot"/><br /><sub><b>abcpibot</b></sub></a><br /><a href="#financial-abcpibot" title="Financial">💵</a> <a href="#platform-abcpibot" title="Packaging/porting to new platform">📦</a></td>

</tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->


