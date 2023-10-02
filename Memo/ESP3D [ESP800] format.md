# ESP3D [ESP800] format

can be in JSON or plain text

## Input

`[ESP800]<time=YYYY-MM-DDTHH:mm:ss> <version=3.0.0-a11> <setup=0/1> json=<no> pwd=<admin password>`

    * json=yes
    the output format
    * time=
    to set ESP3D time using ISO 8601 format : `YYYY`-`MM`-`DD`T`HH`-`minutes`-`seconds`
    * version
    version of webUI
    * setup flag
    Enable / Disable the setup flag

## Output

-   In json format

```
{
   "cmd":"800",
   "status":"ok",
   "data":{
           "FWVersion":"bugfix-2.0.x-3.0.0.a200",
           "FWTarget":"marlin",
           "FWTargetID":"30",
           "Setup":"Enabled",
           "SDConnection":"shared",
           "SerialProtocol":"Socket",
           "Authentication":"Disabled",
           "WebCommunication":"Synchronous",
           "WebSocketIP":"192.168.2.117",
           "WebSocketPort":"81",
           "Hostname":"esp3d",
           "WiFiMode":"STA",
           "WebUpdate":"Enabled",
           "FlashFileSystem":"LittleFS",
           "HostPath":"www",
           "Time":"none"
           }
}
```

    * `cmd`
    Id of requested command, should be `800`

    * `status`
    status of command, should be `ok`

    * `data`
    content of response:
        * `FWVersion`
        Version  of ESP3D firmware or targeted FW (Marlin with ESP3DLib / grblHal)
        * `FWTarget`
        name of targeted  Firmware
        * `FWTargetID`
        numerical ID of targeted FW as same name can have several Ids
        * `Setup`
        Should be `Enabled` or `Disabled` according flag in EEPROM/Preferences, this allows to WedUI to start wizard automaticaly (or not)

        * `SDConnection`
        This is SD capability, SD can be
            * `shared`
            ESP does share access to SD card reader with main board or Firmware (Marlin with ESP3Dlib, ESP3D with hardware SD share solution)
            * `direct`
            ESP does have direct access to SD card reader (e.g: ESP3D, grblHal)
            * `none`
            ESP does not have direct access to SD card reader, (e.g: ESP3D with only serial connection)
        * `SerialProtocol`
        It define how ESP3D FW communicate with main FW
          * `Socket`
            ESP and main FW use same FW (e.g: Marlin with ESP3DLib, grblHal)
          * `Raw`
            Classic serial connection
          * `MKS`
            Serial connection using MKS protocol
        * `Authentication`
        Can be `Enabled` or `Disabled`
        * `WebCommunication`
          currently only `Synchronous`, because `Asychronous` has been put in hold
        * `WebSocketIP`
        Ip address for the websocket terminal `192.168.2.117`
        * `WebSocketPort`
        Port for the web socket terminal `81`
        * `Hostname`
         Hostname of ESP3D or main Baord `esp3d`
        * `WiFiMode`
        Current wiFi mode in use can be `AP` or `STA`
        * `WebUpdate`
        Inform webUI the feature is available or not, can be `Enabled` or `Disabled`
        * `FlashFileSystem` (currently `FileSystem`, to be updated soon )
        The file system used by ESP board can be `LittleFS`, `SPIFFS`, `Fat`, `none`
        * `HostPath`
        Path where the preferences.json and index.html.gz are stored and can be updated (e.g: `www`)
        * `Time`
        Type of time support
           * `none`
            Time is not supported
           * `Auto`
           Board use internet to sync time and it is successful
           * `Failed to set`
           Board use internet to sync time and it is failed
           * `Manual`
           Board use time of ESP800 to set the time and it is successful
            * `Not set`
           Board use time of ESP800 to set the time and command did not sent it (time may have been set by previous command)
        * `CameraID`
        if ESP has camera it contain the camera ID
        * `CameraName`
        if  ESP has camera it contain the camera name
        * `Axisletters`
        Currently only used for grbHAL
        can be :
          - XYZABC
          - XYZUVZ (supported soon)
          - XYZABCUVZ (supported soon)
