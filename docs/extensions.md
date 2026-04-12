# Creating Extensions

An extension is a single HTML file that runs inside the ESP3D WebUI as an iframe. It gets the WebUI's CSS/theme automatically and communicates with the WebUI via `postMessage`.

---

## File format and naming

```
esp3dext-<name>.html          plain HTML
esp3dext-<name>.html.gz       gzip-compressed (same content, smaller on flash)
```

The file must start with `esp3dext-`. Upload it to the `extensions/` subdirectory of the device filesystem, or to the root as a fallback.

---

## Minimal skeleton

```html
<script type="application/json" id="esp3dext-manifest">
{
  "name": "My Extension",
  "owner": "MyName",
  "version": "1.0.0",
  "github": "https://github.com/...",
  "description": "What this extension does.",
  "icon": "Tool",
  "target": "panel",
  "refreshtime": "0",
  "supportedVersion": "3.*",
  "targetSystem": "*"
}
</script>

<script type="text/javascript">
  // Send a message to the WebUI
  function sendMessage(msg) {
    window.parent.postMessage(msg, '*');
  }

  // Receive messages from the WebUI
  function processMessage(eventMsg) {
    // handle eventMsg.data
  }

  window.onload = () => {
    window.addEventListener("message", processMessage, false);
  };
</script>

<div class="container">
  <!-- Your HTML here. WebUI CSS classes (btn, form-input, etc.) are available. -->
</div>
```

The WebUI injects its CSS and active theme into the iframe automatically — no stylesheet link needed.

---

## Manifest fields

The manifest is a `<script type="application/json" id="esp3dext-manifest">` block at the top of the file.

| Field | Required | Description |
|---|---|---|
| `name` | yes | Display name shown in the extensions list |
| `target` | yes | Placement: `panel`, `page`, or `content` |
| `supportedVersion` | yes | WebUI version pattern, e.g. `3.*`, `3.1.*` |
| `targetSystem` | yes | Target filter — see table below |
| `owner` | no | Author name |
| `version` | no | Extension version (semver) |
| `github` | no | Repository or homepage URL |
| `description` | no | Short description |
| `icon` | no | Feather icon name (e.g. `Tool`, `Terminal`, `Camera`) — see icon list below |
| `refreshtime` | no | Auto-refresh interval in ms for `camera`/`image` types (`0` = disabled) |

### `target` values

| Value | Effect |
|---|---|
| `panel` | Added as a collapsible panel in the main area |
| `page` | Added as a full-page tab |
| `content` | Embedded as extra content |

### `supportedVersion` patterns

| Pattern | Matches |
|---|---|
| `*` | Any version |
| `3.*` | Any 3.x version |
| `3.1.*` | Any 3.1.x version |

### `targetSystem` values

| Value | Target |
|---|---|
| `*` | All targets |
| `3d printer` | All 3D printer firmwares |
| `cnc` | All CNC firmwares |
| `sand table` | Sand table |
| `marlin` | Marlin specifically |
| `grbl` | GRBL specifically |
| `grblhal` | grblHAL specifically |

Multiple values: `"3d printer, cnc"`.

### Available icons

Common icons (from Feather Icons):

`Activity` `AlertCircle` `Anchor` `Aperture` `Award` `BarChart` `Bell` `BellOff` `Bluetooth` `Bookmark` `Box` `Camera` `Cast` `Clipboard` `Clock` `Cpu` `Crosshair` `Database` `Delete` `Download` `Droplet` `Edit` `Eye` `EyeOff` `File` `Filter` `Flag` `Globe` `Grid` `HardDrive` `Hash` `Heart` `HelpCircle` `Home` `Image` `Info` `Layers` `LifeBuoy` `List` `Loader` `Lock` `LogIn` `LogOut` `Mail` `MapPin` `Menu` `MessageSquare` `MinusCircle` `Monitor` `Moon` `Move` `PauseCircle` `Percent` `PlayCircle` `PlusCircle` `Power` `Printer` `Radio` `RefreshCw` `Repeat` `RotateCcw` `Save` `Scissors` `Send` `Server` `Settings` `Share` `Slash` `Sliders` `Smile` `Star` `StopCircle` `Sun` `Tag` `Target` `Terminal` `Thermometer` `Tool` `Trash2` `Upload` `Video` `VideoOff` `Volume` `VolumeX` `Wifi` `WifiOff` `Wind` `XCircle` `Zap` `ZapOff`

Additional icons for 3D printers and CNC: `Fan` `FeedRate` `FlowRate` `Extruder`

---

## Communication

All communication goes through `postMessage`. Every message sent **to** the WebUI follows this base structure:

```js
{
  type: '<message type>',   // mandatory — defines the action
  target: 'webui',          // mandatory — always 'webui'
  id: '<my-id>',            // optional  — used to match responses back to this extension
  noDispatch: true,         // optional  — suppress the WebUI's reply if you don't need it
  // ... type-specific fields
}
```

Messages received **from** the WebUI follow this structure:

```js
{
  type: '<message type>',
  id: '<id you sent>',
  content: {
    response: <result>,
    initiator: { /* original message */ }
  }
}
```

Filter incoming messages by `eventMsg.data.id` to only process replies meant for your extension.

---

## Messages received from the WebUI (no request needed)

The WebUI automatically sends these messages to your extension:

### Connection and visibility notification

Sent when the iframe loads, and again whenever the extension is shown or hidden.

```js
{
  type: 'notification',
  content: {
    isConnected: true,   // whether the device is connected
    isVisible: true      // whether this panel is currently visible
  },
  id: '<your extension id>'
}
```

Use `isVisible` to pause/resume expensive work (polling, animations) when the panel is hidden.

---

## Sending commands to the device

### GCode / ESP command

```js
sendMessage({ type: 'cmd', target: 'webui', id: 'myext', content: '[ESP111]' })
```

Response:
```js
// success
{ type: 'cmd', id: 'myext', content: { status: 'success', response: '192.168.1.111', initiator: {...} } }
// error
{ type: 'cmd', id: 'myext', content: { status: 'error', error: 'Cannot connect', initiator: {...} } }
```

---

## HTTP requests through the WebUI

### Query (GET)

```js
sendMessage({
  type: 'query', target: 'webui', id: 'myext',
  url: 'files',
  args: { action: 'list', path: '/' }
})
// → GET /files?action=list&path=/
```

### Upload (POST)

```js
sendMessage({
  type: 'upload', target: 'webui', id: 'myext',
  url: 'files',
  content: [...],      // file as array
  size: 512,
  path: '/',
  filename: 'file.txt'
})
```

Progress messages arrive with `content.status === 'progress'` and `content.progress` (0–100).

### Download

```js
sendMessage({ type: 'download', target: 'webui', id: 'myext', url: 'preferences.json' })
// response.content.response is a blob — read with FileReader
```

---

## UI helpers

### Toast notification

```js
sendMessage({ type: 'toast', target: 'webui', content: { text: 'Done!', type: 'success' } })
sendMessage({ type: 'toast', target: 'webui', content: { text: 'Failed', type: 'error' } })
sendMessage({ type: 'toast', target: 'webui', content: { text: 'Info', type: 'default' } })
```

No response.

### Sound notification

```js
sendMessage({ type: 'sound', target: 'webui', content: 'beep' })
sendMessage({ type: 'sound', target: 'webui', content: 'error' })
// Custom sequence: f = frequency (Hz), d = duration (ms)
sendMessage({ type: 'sound', target: 'webui', content: 'seq', seq: [{ f: 1046, d: 200 }, { f: 1318, d: 100 }] })
```

### Modal dialog

Four styles: `default` (message), `confirmation` (yes/no), `input` (one field), `fields` (multiple fields).

**Simple message:**
```js
sendMessage({
  type: 'modal', target: 'webui', id: 'modalpanel',
  content: {
    style: 'default', id: 'my_modal',
    title: 'Info', text: 'Operation complete.',
    bt1Txt: 'OK', response1: 'ok'
  }
})
```

**Confirmation (yes/no):**
```js
sendMessage({
  type: 'modal', target: 'webui', id: 'modalpanel',
  content: {
    style: 'confirmation', id: 'confirm_modal',
    title: 'Delete?', text: 'This cannot be undone.',
    bt1Txt: 'Delete', response1: 'delete',
    bt2Txt: 'Cancel', response2: 'cancel',
    hideclose: true
  }
})
// Response: eventMsg.data.content.response === 'delete' or 'cancel'
```

**Input (single text field):**
```js
sendMessage({
  type: 'modal', target: 'webui', id: 'modalpanel',
  content: {
    style: 'input', id: 'input_modal',
    title: 'New name', text: 'Enter a name:',
    bt1Txt: 'OK', response1: 'ok',
    bt2Txt: 'Cancel', response2: 'cancel'
  }
})
// Response: eventMsg.data.content.response === 'ok', eventMsg.data.content.inputData = typed value
```

**Fields (multiple inputs):**
```js
sendMessage({
  type: 'modal', target: 'webui', id: 'modalpanel',
  content: {
    style: 'fields', id: 'fields_modal',
    title: 'Settings',
    validation: 'bt1',
    bt1Txt: 'Save', response1: 'save',
    bt2Txt: 'Cancel', response2: 'cancel',
    fields: [
      { id: 'speed',   type: 'number', label: 'Speed',  value: 100, min: '0', max: '200', append: 'mm/s' },
      { id: 'enabled', type: 'boolean', label: 'Enabled', value: true },
      { id: 'mode',    type: 'select',  label: 'Mode', value: 'fast', options: ['fast', 'slow', 'auto'] },
      { id: 'name',    type: 'text',    label: 'Name',  value: '', placeholder: 'My name' },
      { id: 'dims', type: 'group', label: 'Dimensions', value: [
          { id: 'w', type: 'number', label: 'Width',  value: 0 },
          { id: 'h', type: 'number', label: 'Height', value: 0 }
      ]}
    ]
  }
})
// Response: eventMsg.data.content.response === 'save', eventMsg.data.content.fields = { speed: 150, enabled: false, ... }
```

Field types supported in modal: `text`, `number`, `boolean`, `select`, `group`.

---

## WebUI information

### Capabilities

Read connection info, features, settings, or data from another extension:

```js
sendMessage({ type: 'capabilities', target: 'webui', id: 'connection' })
sendMessage({ type: 'capabilities', target: 'webui', id: 'features' })
sendMessage({ type: 'capabilities', target: 'webui', id: 'interface' })
sendMessage({ type: 'capabilities', target: 'webui', id: 'settings' })
sendMessage({ type: 'capabilities', target: 'webui', id: 'extensions', name: 'my-other-ext' })
```

Response: `eventMsg.data.content.response` is a JSON string — parse with `JSON.parse()`.

### Translation

```js
// Single key
sendMessage({ type: 'translate', target: 'webui', id: 'transpanel', content: 'S153' })
// All translations
sendMessage({ type: 'translate', target: 'webui', id: 'transpanel', all: 'true' })
```

### Icon

```js
sendMessage({ type: 'icon', target: 'webui', id: 'Activity' })
// Response: eventMsg.data.content.response = '<svg ...>...</svg>'
```

---

## Persistent settings

Save and restore extension settings across sessions via `preferences.json`:

```js
// Save
sendMessage({
  type: 'extensionsData', target: 'webui', id: 'myextension',
  content: JSON.stringify({ speed: 150, mode: 'auto' })
})

// Read back — use capabilities
sendMessage({ type: 'capabilities', target: 'webui', id: 'extensions', name: 'myextension' })
```

---

## Communication between extensions

Broadcast a message to all extensions that share the same `id`, or to a specific `targetid`:

```js
// Broadcast to all extensions with id 'panel'
sendMessage({ type: 'dispatch', target: 'webui', id: 'panel', targetid: 'panel', content: 'hello' })
```

Receiving extension:
```js
function processMessage(eventMsg) {
  if (eventMsg.data.type === 'dispatch') {
    console.log('from', eventMsg.data.content.initiator.id, ':', eventMsg.data.content.response)
  }
}
```

---

## Installing an extension

1. Upload the `.html` (or `.html.gz`) file to the device filesystem — preferably into an `extensions/` subdirectory.
2. In the WebUI, go to **Settings → Interface → Extra content**.
3. Click **Extensions list** — the WebUI scans for `esp3dext-*` files and shows compatibility status.
4. Check the extensions you want and click **Add selected**.
5. Save settings.

---

## Practical example — query the file list

```html
<script type="application/json" id="esp3dext-manifest">
{
  "name": "File Browser",
  "owner": "Me",
  "version": "1.0.0",
  "icon": "HardDrive",
  "target": "panel",
  "refreshtime": "0",
  "supportedVersion": "3.*",
  "targetSystem": "*"
}
</script>

<script type="text/javascript">
  function sendMessage(msg) { window.parent.postMessage(msg, '*'); }

  function listFiles() {
    sendMessage({ type: 'query', target: 'webui', id: 'filebrowser', url: 'files', args: { action: 'list', path: '/' } });
  }

  function processMessage(eventMsg) {
    const d = eventMsg.data;
    if (d.type === 'query' && d.id === 'filebrowser') {
      if (d.response.status === 'success') {
        const files = JSON.parse(d.response.response).files;
        document.getElementById('output').innerHTML = files.map(f => `<p>${f.name} (${f.size})</p>`).join('');
      } else {
        sendMessage({ type: 'toast', target: 'webui', content: { text: d.response.error, type: 'error' } });
      }
    }
    if (d.type === 'notification') {
      if (d.content.isVisible) listFiles(); // refresh when panel becomes visible
    }
  }

  window.onload = () => { window.addEventListener('message', processMessage, false); };
</script>

<div class="container">
  <button class="btn m-1" onclick="listFiles()">Refresh</button>
  <div id="output"></div>
</div>
```

---

## Using WebUI CSS components in an extension

The WebUI injects its full CSS (including the active theme) into every extension iframe. This means all Spectre CSS components — buttons, inputs, dropdowns, menus — are available without any extra stylesheet.

### Example: WebUI-style dropdown instead of native `<select>`

A native `<select>` works but looks like a system widget. Using `.dropdown` + `.menu` from Spectre CSS matches the WebUI look exactly and responds to the active theme.

```html
<script type="application/json" id="esp3dext-manifest">
{
  "name": "Capabilities",
  "icon": "Activity",
  "target": "panel",
  "supportedVersion": "3.*",
  "targetSystem": "*"
}
</script>

<script type="text/javascript">
  var currentId = 'connection';

  function sendMessage(msg) { window.parent.postMessage(msg, '*'); }

  function selectOption(value) {
    currentId = value;
    document.getElementById('selected_label').textContent = value;
    document.getElementById('dropdown_toggle').blur(); // close the menu
    document.getElementById('extensionNameInput').classList.toggle('d-none', value !== 'extensions');
  }

  function getCapabilities() {
    const name = document.getElementById('extension_name').value;
    sendMessage({ type: 'capabilities', target: 'webui', id: currentId, name });
  }

  function processMessage(eventMsg) {
    if (eventMsg.data.type === 'capabilities') {
      document.getElementById('output').textContent =
        JSON.stringify(eventMsg.data.content.response, null, 2);
    }
  }

  window.onload = () => { window.addEventListener('message', processMessage, false); };
</script>

<div class="container">
  <div class="form-group">
    <div class="dropdown">
      <a id="dropdown_toggle" class="btn dropdown-toggle" tabindex="0">
        <span id="selected_label">connection</span>
        <i class="icon icon-caret"></i>
      </a>
      <ul class="menu">
        <li class="menu-item"><a href="#" onclick="selectOption('connection'); return false;">connection</a></li>
        <li class="menu-item"><a href="#" onclick="selectOption('features');   return false;">features</a></li>
        <li class="menu-item"><a href="#" onclick="selectOption('interface');  return false;">interface</a></li>
        <li class="menu-item"><a href="#" onclick="selectOption('settings');   return false;">settings</a></li>
        <li class="menu-item"><a href="#" onclick="selectOption('extensions'); return false;">extensions</a></li>
      </ul>
    </div>
  </div>

  <div class="form-group d-none" id="extensionNameInput">
    <label class="form-label">Extension Name:</label>
    <input class="form-input" id="extension_name" type="text" value="my-ext">
  </div>

  <button class="btn m-1" onclick="getCapabilities()">Get Capabilities</button>
  <pre class="container m-2" id="output"></pre>
</div>
```

Key points:
- `tabindex="0"` on the toggle makes it focusable — Spectre CSS shows the menu on `:focus-within`
- `dropdown_toggle.blur()` on selection closes the menu without JS state management
- `d-none` / `classList.toggle` use the same Spectre utility class as the rest of the WebUI
- No stylesheet link needed — CSS is already injected by the WebUI
