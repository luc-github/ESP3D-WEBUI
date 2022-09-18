# Real time commands variables

## grbl

-   0x18 (ctrl-x) : Soft-Reset : #SOFTRESET#
-   0x84 : Safety Door #SAFETYDOOR#
-   0x85 : Jog Cancel #JOGCANCEL#

Feed Overrides

-   0x90 : Set 100% of programmed rate. #FO100#
-   0x91 : Increase 10% #FO+10#
-   0x92 : Decrease 10% #FO-10#
-   0x93 : Increase 1% #FO+1#
-   0x94 : Decrease 1% #FO-1#

Rapid Overrides

-   0x95 : Set to 100% full rapid rate. #RO100#
-   0x96 : Set to 50% of rapid rate. #RO50#
-   0x97 : Set to 25% of rapid rate. #RO25#

Spindle Speed Overrides 10%->200%

-   0x99 : Set 100% of programmed spindle speed #SSO100#
-   0x9A : Increase 10% #SSO+10#
-   0x9B : Decrease 10% #SSO-10#
-   0x9C : Increase 1% #SSO+1#
-   0x9D : Decrease 1% #SSO-1#

Toggle commands

-   0x9E : Toggle Spindle Stop #T-SPINDLESTOP#
-   0xA0 : Toggle Flood Coolant #T-FLOODCOOLANT#
-   0xA1 : Toggle Mist Coolant #T-MISTCOOLANT#

```
[{name:"#SOFTRESET#", value:"\x18"},
{name:"#SAFETYDOOR#", value:"\x84"},
{name:"#JOGCANCEL#", value:"\x85"},
{name:"#FO100#", value:"\x90"},
{name:"#FO+10#", value:"\x91"},
{name:"#FO-10#", value:"\x92"},
{name:"#FO+1#", value:"\x93"},
{name:"#FO-1#", value:"\x94"},
{name:"#RO100#", value:"\x95"},
{name:"#RO50#", value:"\x96"},
{name:"#RO25#", value:"\x97"},
{name:"#SSO100#", value:"\x99"},
{name:"#SSO+10#", value:"\x9A"},
{name:"#SSO-10#", value:"\x9B"},
{name:"#SSO+1#", value:"\x9C"},
{name:"#SSO-1#", value:"\x9D"},
{name:"#T-SPINDLESTOP#", value:"\x9E"},
{name:"#T-FLOODCOOLANT#", value:"\xA0"},
{name:"#T-MISTCOOLANT#", value:"\xA1"}
]
```

## grblHAL

-   0x18 (ctrl-x) : Soft-Reset : #SOFTRESET#
-   0x80 : Instead of ? for requesting a real-time report #STATUSREPORT#
-   0x81 : Instead of ~ for requesting cycle start #CYCLESTART#
-   0x82 : Instead of ! for requesting feed hold "#FEEDHOLD#
-   0x83 : Request parser state report #PARSERREPORT#
-   0x84 : Safety Door #SAFETYDOOR#
-   0x85 : Jog Cancel #JOGCANCEL#
-   0x87 : Request a complete real-time report #COMPLETEREPORT#
-   0x88 : Toggle the virtual optional stop switch #T-STOPSWITCH#

Feed Overrides

-   0x90 : Set 100% of programmed rate. #FO100#
-   0x91 : Increase 10% #FO+10#
-   0x92 : Decrease 10% #FO-10#
-   0x93 : Increase 1% #FO+1#
-   0x94 : Decrease 1% #FO-1#

Rapid Overrides

-   0x95 : Set to 100% full rapid rate. #RO100#
-   0x96 : Set to 50% of rapid rate. #RO50#
-   0x97 : Set to 25% of rapid rate. #RO25#

Spindle Speed Overrides 10%->200%

-   0x99 : Set 100% of programmed spindle speed #SSO100#
-   0x9A : Increase 10% #SSO+10#
-   0x9B : Decrease 10% #SSO-10#
-   0x9C : Increase 1% #SSO+1#
-   0x9D : Decrease 1% #SSO-1#

Toggles and extras

-   0x9E : Toggle Spindle Stop #T-SPINDLESTOP#
-   0xA0 : Toggle Flood Coolant #T-FLOODCOOLANT#
-   0xA1 : Toggle Mist Coolant #T-MISTCOOLANT#
-   0xA2 : Request a PID report #PIDREPORT#
-   0xA3 : Acknowledge a tool change request #TOOLCHANGE#
-   0xA4 : Toggle the virtual optional probe connected switch #T-PROBE#

```
{ name: "#SOFTRESET#", value: "\x18" },
{ name: "#STATUSREPORT#", value: "\x80"},
{ name: "#CYCLESTART#", value: "\x81" },
{ name: "#FEEDHOLD#", value: "\x82" },
{ name: "#PARSERREPORT#", value: "\x83" },
{ name: "#SAFETYDOOR#", value: "\x84" },
{ name: "#JOGCANCEL#", value: "\x85" },
{ name: "#COMPLETEREPORT#", value: "\x87" },
{ name: "#T-STOPSWITCH#", value: "\x88" },
{ name: "#FO100#", value: "\x90" },
{ name: "#FO+10#", value: "\x91" },
{ name: "#FO-10#", value: "\x92" },
{ name: "#FO+1#", value: "\x93" },
{ name: "#FO-1#", value: "\x94" },
{ name: "#RO100#", value: "\x95" },
{ name: "#RO50#", value: "\x96" },
{ name: "#RO25#", value: "\x97" },
{ name: "#SSO100#", value: "\x99" },
{ name: "#SSO+10#", value: "\x9A" },
{ name: "#SSO-10#", value: "\x9B" },
{ name: "#SSO+1#", value: "\x9C" },
{ name: "#SSO-1#", value: "\x9D" },
{ name: "#T-SPINDLESTOP#", value: "\x9E" },
{ name: "#T-FLOODCOOLANT#", value: "\xA0" },
{ name: "#T-MISTCOOLANT#", value: "\xA1" },
{ name: "#PIDREPORT#", value: "\xA2" },
{ name: "#TOOLCHANGE#", value: "\xA3" },
{ name: "#T-PROBE#", value: "\xA4" },
];
```
