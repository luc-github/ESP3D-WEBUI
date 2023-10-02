# ESP3D [ESP401] format

WebUI need use json format to get propelry formated answer
As described in Commands.md:

## Conventions

1 - add space to separate parameters
2 - if parameter has space add \\ in front of space to not be seen as separator
3 - json json=YES json=TRUE json=1 are paremeters to switch output to json
By default output is plain text, to get json formated output
add json or json=yes after main parameters  
The json format is {
cmd:"<401>", //the id of requested command
status:"<ok/error>" //give if it is success or an failure
data:"the position of setting"
}

Example
`[ESP401]P=1 T=S V=My\ SSID json`
you will get the following if ok
`{"cmd":"401","status":"ok","data":"1"}`
