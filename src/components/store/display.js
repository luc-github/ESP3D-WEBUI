import { useStoreon } from "storeon/preact"

export default store => {
    store.on("@init", () => ({
        showTerminal: false,
        showFiles: false,
        showJog: false,
        activePage: 2,
        activeSetting: 1,
        showPage: false,
        showDialog: false,
        extraPanels: [],
        panelsOrder: [],
    }))

    store.on("panel/add", ({ panelsOrder }, element) => {
        return {
            panelsOrder: [element, ...panelsOrder.filter(e => e !== element)],
        }
    })
    store.on("panel/remove", ({ panelsOrder }, element) => {
        return { panelsOrder: [...panelsOrder.filter(e => e !== element)] }
    })
    store.on("panel/showextra", ({ extraPanels }, newstate) => {
        const { dispatch } = useStoreon()
        if (newstate.visible) dispatch("panel/add", newstate.name)
        else dispatch("panel/remove", newstate.name)
        return {
            extraPanels: [
                newstate,
                ...extraPanels.filter(e => e.name !== newstate.name),
            ],
        }
    })
    store.on("panel/showterminal", ({ showTerminal }, newstate) => {
        const { dispatch } = useStoreon()
        if (newstate) dispatch("panel/add", "terminal")
        else dispatch("panel/remove", "terminal")
        return { showTerminal: newstate }
    })
    store.on("panel/showfiles", ({ showFiles }, newstate) => {
        const { dispatch } = useStoreon()
        if (newstate) dispatch("panel/add", "files")
        else dispatch("panel/remove", "files")
        return { showFiles: newstate }
    })
    store.on("panel/showjog", ({ showJog }, newstate) => {
        const { dispatch } = useStoreon()
        if (newstate) dispatch("panel/add", "jog")
        else dispatch("panel/remove", "jog")
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
