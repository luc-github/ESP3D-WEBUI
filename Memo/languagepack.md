# Language packs

## Generate template files

Use the script `npm run template` to geenrate up todate template files for all packs

Currently:

-   CNC GRBL in `languages/cncgrblpack`
-   CNC grblHAL `languages/cncgrblhalpack`
-   3D Printers (all) `languages/printerpack`
-   Sand Table (all) `languages/sandtablepack`

## Generate language pack files

-   Rename the template file according the language code http://www.lingoes.net/en/translator/langcode.htm using `_` instead of `-` and add `lang-` in from of name.
    so for example :

    -   for french language pack, `en.json` file would be renamed to `lang-fr.json`
    -   for simplified chinese language pack, `en.json` file would be renamed to `lang-zh_cn.json`
    -   for simplified chinese language pack, `en.json` file would be renamed to `lang-zh_cn.json`
    -   for german language pack, `en.json` file would be renamed to `lang-de.json`

-   Modify the language pack file according to the language and test it against the WebUI

-   Compress the final pack
    use the following command to compress the final pack targeting the file :  
    `npm run package target=languages/<target pack>/lang-<target language>.json`

    so for French language pack for example:
    `npm run package target=languages/printerpack/lang-fr.json`

## Compare template pack with language pack file

This script is used to compare current language pack content against the template language pack to see if the language pack need to be updated.

`npm run check reference=<template path file> target=<not compressed language pack>`

```
npm run check target=languages/printerpack/lang-fr.json reference=languages/printerpack/en.json

> ESP3D-WEBUI@3.0.0 check
> node ./config/checkpack.js "target=languages/printerpack/lang-fr.json" "reference=languages/printerpack/en.json"

Comparing files

Checking extra entries...
S724 : Fermer l'application
...done, found  1 extra entries

Checking missing entries...
S14 : Settings
S24 : Close
...done, found  2 missing entries

Comparaison done
```

## Propose / update language pack files

Please do a PR to webUI 3.0 github branch or submit ticket with compressed and clear version of the language pack file  
if submitting PR please keep the clear version in `languages/<target pack>` and compressed version in `dist/<target pack>`
