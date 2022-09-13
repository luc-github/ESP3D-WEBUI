# Websocket

there are 2

-   terminal websocket
    used to stream data to webUIand exchange internal data

-   data websocket
    used to exchange data

## Terminal websocket

use subprotocol `webui-v3`

### <u>text mode</u>

Reserved
messages between webui / ESP
Format: `<label>:<message>`

-   from ESP to WebUI

    -   `currentID:<id>`
        Sent when client is connecting, it is the last ID used and become the active ID

    -   `activeID:<id>`
        Broadcast current active ID, when new client is connecting, client without this is <id> should close, ESP WS Server close all open WS connections but this one also

    -   `PING:<time left>:<time out>`
        It is a response to PING from client to inform the time left if no activity (see below)

    -   `ERROR:<code>:<message>`
        If an error raise when doing upload, it informs client it must stop uploading because sometimes the http answer is not possible,
        or cannot cancel the upload, this is a workaround as there is no API in current webserver to cancel active upload

    -   `NOTIFICATION:<message>`
        Forward the message sent by [ESP600] to webUI toast system

    -   `SENSOR: <value>[<unit>] <value2>[<unit2>] ...`
        The sensor connected to ESP like DHT22

-   from WebUI to ESP
    -   `PING:<current cookiesessionID / none >` if any, or "none" if none

### <u>binary mode</u>

Reserved

-   from ESP to WebUI
    stream data from ESP to WebUI

-   from WEBUI to ESP  
    [-> File transfert from WebUI to ESP : not implemented yet]

## Data websocket

use sub protocol `arduino`

### <u>text mode</u>

Free to use

### <u>binary mode</u>

Free to use
