# ESP3D [ESP410] format

This command list all AP available, limited to 30 by API, if signal is too low, AP is not listed to avoid connection problems.

WebUI need use json format to get propelry formated answer
As described in Commands.md:

Example
`[ESP410]json`
you will get the following if ok

```
{
 "cmd": "410",
 "status": "ok",
 "data": [
  {
   "SSID": "GRBL",
   "SIGNAL": "100",
   "IS_PROTECTED": "1"
  },
  {
   "SSID": "luc-ext1",
   "SIGNAL": "64",
   "IS_PROTECTED": "1"
  },
  {
   "SSID": "TP-Link_Luc",
   "SIGNAL": "62",
   "IS_PROTECTED": "1"
  }
 ]
}
```
