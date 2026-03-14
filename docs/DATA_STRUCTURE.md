# Data structure (development reference)

This document describes the general structure of main objects used in the WebUI (preferences, settings, connection state, etc.). It is intended as a development reference.

**Last aligned with code:** Context tree and contexts summary were verified against `src/components/App/index.js`, `src/contexts/*.js`, and `src/targets/` (no TranslationsContextProvider; ContainerHelper wraps Modal + Toasts).

**Source:** The reference is **datastructure.txt** (converted from data structure.odt), now in plain text and readable. Place it in **docs/** (e.g. `docs/datastructure.txt`) and keep this .md in sync when the structure evolves.

## Main structures (overview)

- **User preferences** — Stored in flash; see **docs/preferences.md** for the format (custom, settings, extensions).
- **Application preferences** — In code; define how each setting is displayed and validated (see `src/targets/*/preferences.json` and **docs/preferences.md**).
- **Connection / capabilities** — ESP800 and related responses; structure may vary by firmware (reference: esp3d.io or firmware docs).

*(Add sections below from datastructure.txt when needed: e.g. connection object, panel state, file list format.)*

---

## Context provider tree (aligned with code — `src/components/App/index.js`)

There is **no** `TranslationsContextProvider` in the tree; translations are provided by the `src/components/Translations` module (e.g. `T()`, `currentLanguage`, `setCurrentLanguage`, `baseLangRessource`).

```
<DatasContextProvider>
    <TargetContextProvider>
        <RouterContextProvider>
            <UiContextProvider>
                <HttpQueueContextProvider>
                    <SettingsContextProvider>
                        <WsContextProvider>
                            <ContainerHelper id="top_container" />
                            <ElementsCache />
                            <ContentContainer />
                        </WsContextProvider>
                    </SettingsContextProvider>
                </HttpQueueContextProvider>
            </UiContextProvider>
        </RouterContextProvider>
    </TargetContextProvider>
</DatasContextProvider>
```

`ContainerHelper` renders **ModalContainer** and **ToastsContainer** when active.

**Contexts (summary, from current code):**

- **DatasContextProvider:** terminal (input, content, add, clear, inputHistory, addInputHistory, isAutoScroll, isVerbose, isAutoScrollPaused). No `about` in context.
- **TargetContextProvider:** target-specific state and processData (per subtarget: Marlin, GRBL, grblHAL, etc.).
- **RouterContextProvider:** activeRoute, setActiveRoute, routes, setRoutes, defaultRoute, activeTab.
- **UiContextProvider:** uisettings, modals, toasts, connection, dialogs.
- **HttpQueueContextProvider:** addInQueue, addInTopQueue, removeRequests, getCurrentRequest, removeAllRequests, processRequests.
- **SettingsContextProvider:** interfaceSettings, connectionSettings, featuresSettings, activity (startPolling, stopPolling).
- **WsContextProvider:** ws, setIsPingPaused, Disconnect.

**Hooks:** useHttpQueue (createNewRequest, processRequestsNow, …), useSettings (getInterfaceSettings, getConnectionSettings).

**Targets in code (as of this update):** `src/targets/` — Printer3D (Marlin, Marlin-embedded, Repetier, Smoothieware), CNC (GRBL, grblHAL), SandTable (GRBL). No GRBL_ESP32 or RepRap subtarget in the tree.
