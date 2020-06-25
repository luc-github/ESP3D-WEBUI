export default store => {
    store.on("@init", () => ({
        showTerminal: false,
        showFiles: false,
        showJog: false,
        activePage: 2,
        activeSetting: 1,
        showPage: false,
        showDialog: false,
    }))
    store.on("panel/showterminal", ({ showTerminal }, newstate) => {
        return { showTerminal: newstate }
    })
    store.on("panel/showfiles", ({ showFiles }, newstate) => {
        return { showFiles: newstate }
    })
    store.on("panel/showjog", ({ showJog }, newstate) => {
        return { showJog: newstate }
    })
    store.on("displayPage", ({ showPage }, newstate) => {
        return { showPage: newstate }
    })
    store.on("displayDialog", ({ showDialog }, newstate) => {
        return { showDialog: newstate }
    })
    store.on("setPage", ({ activePage }, newstate) => {
        return { activePage: newstate }
    })
    store.on("setSettingTab", ({ activeSetting }, newstate) => {
        return { activeSetting: newstate }
    })
}
