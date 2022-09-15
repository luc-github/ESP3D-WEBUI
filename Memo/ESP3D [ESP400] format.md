# ESP3D [ESP400] format

Only sent in JSON format

```
{"Settings":[
{"F":"network/network","P":"130","T":"S","V":"esp3d","H":"hostname","S":"32","M":"1"},
{"F":"network/network","P":"0","T":"B","V":"1","H":"radio mode","O":[{"none":"0"},
{"sta":"1"},
{"ap":"2"}]},
{"F":"network/sta","P":"1","T":"S","V":"WIFI_OFFICE_B2G","S":"32","H":"SSID","M":"1"},
{"F":"network/sta","P":"34","T":"S","N":"1","V":"********","S":"64","H":"pwd","M":"8"},
{"F":"network/sta","P":"99","T":"B","V":"1","H":"ip mode","O":[{"dhcp":"1"},
{"static":"0"}]},
{"F":"network/sta","P":"100","T":"A","V":"192.168.0.1","H":"ip"},
{"F":"network/sta","P":"108","T":"A","V":"192.168.0.1","H":"gw"},
{"F":"network/sta","P":"104","T":"A","V":"255.255.255.0","H":"msk"},
{"F":"network/ap","P":"218","T":"S","V":"ESP3D","S":"32","H":"SSID","M":"1"},
{"F":"network/ap","P":"251","T":"S","N":"1","V":"********","S":"64","H":"pwd","M":"8"},
{"F":"network/ap","P":"316","T":"A","V":"192.168.0.1","H":"ip"},
{"F":"network/ap","P":"118","T":"B","V":"11","H":"channel","O":[{"1":"1"},
{"2":"2"},
{"3":"3"},
{"4":"4"},
{"5":"5"},
{"6":"6"},
{"7":"7"},
{"8":"8"},
{"9":"9"},
{"10":"10"},
{"11":"11"},
{"12":"12"},
{"13":"13"},
{"14":"14"}]},
{"F":"service/http","P":"328","T":"B","V":"1","H":"enable","O":[{"no":"0"},
{"yes":"1"}]},
{"F":"service/http","P":"121","T":"I","V":"80","H":"port","S":"65001","M":"1"},
{"F":"service/telnetp","P":"329","T":"B","V":"1","H":"enable","O":[{"no":"0"},
{"yes":"1"}]},
{"F":"service/telnetp","P":"125","T":"I","V":"23","H":"port","S":"65001","M":"1"},
{"F":"service/ftp","P":"1021","T":"B","V":"1","H":"enable","O":[{"no":"0"},
{"yes":"1"}]},
{"F":"service/ftp","P":"1009","T":"I","V":"21","H":"control port","S":"65001","M":"1"},
{"F":"service/ftp","P":"1013","T":"I","V":"20","H":"active port","S":"65001","M":"1"},
{"F":"service/ftp","P":"1017","T":"I","V":"55600","H":"passive port","S":"65001","M":"1"},
{"F":"service/notification","P":"1004","T":"B","V":"1","H":"auto notif","O":[{"no":"0"},
{"yes":"1"}]},
{"F":"service/notification","P":"116","T":"B","V":"0","H":"notification","O":[{"none":"0"},
{"pushover":"1"},
{"email":"2"},
{"line":"3"}]},
{"F":"service/notification","P":"332","T":"S","V":"********","S":"63","H":"t1","M":"0"},
{"F":"service/notification","P":"396","T":"S","V":"********","S":"63","H":"t2","M":"0"},
{"F":"service/notification","P":"855","T":"S","V":" ","S":"127","H":"ts","M":"0"},
{"F":"system/system","P":"461","T":"B","V":"40","H":"targetfw","O":[{"repetier":"50"},
{"marlin":"20"},
{"smoothieware":"40"},
{"grbl":"10"},
{"unknown":"0"}]},
{"F":"system/system","P":"112","T":"I","V":"115200","H":"baud","O":[{"9600":"9600"},
{"19200":"19200"},
{"38400":"38400"},
{"57600":"57600"},
{"74880":"74880"},
{"115200":"115200"},
{"230400":"230400"},
{"250000":"250000"},
{"500000":"500000"},
{"921600":"921600"}]},
{"F":"system/system","P":"320","T":"I","V":"10000","H":"bootdelay","S":"40000","M":"0"},
]}
```

1 - key : `Settings`  
2 - value: array of data formated like this  
{"F":"network/network","P":"130","T":"S","V":"esp3d","H":"hostname","S":"32","M":"1"}  
or  
{"F":"service/notification","P":"1004","T":"B","V":"1","H":"auto notif","O":[{"no":"0"},{"yes":"1"}]}

    -   F: is filter formated as section/sub-section, if section is same as sub-section, it means no sub-section
    -   P: is id (also position reference so it is unique)
    -   T: is type of data which can be:
        -   S: for string
        -   I: for integer
        -   B: for Byte
        -   A: for IP address / Mask
        -   F: for float (only grblHAL)
        -   M: for bits mask (only grblHAL)
        -   X: for exclusive bitsfield (only grblHAL)
    -   V: is current value, if type is string and value is `********`, (8 stars) then it is a password
    -   E: is integer for exactess / precision of float/double value (only grblHAL)
    -   U: is text unit of value (only grblHAL)
    -   H: is text label of value
    -   S: is max size if type is string, and max possible value if value is number (byte, integer)
    -   M: is min size if type is string, and min possible value if value is number (byte, integer)
    -   MS: is additionnal min size if type is string (e.g for password can be 0 or 8, so need additional min size), M should be the more minimal value
        so MS value must be between M and S
    -   O: is an array of {label:value} used for possible values in selection or bits labels list
    -   R: need restart to be applied

Note: if Type `M` and `X` use `O` entry to define the label / position, if `O` is `[]` then axis label are used according need `X`, `Y`, `Z`, `A`, `B`, `C`  
Note2 : the 2.1 Flag type is no more used, several entries are used instead grouped by sub-section
