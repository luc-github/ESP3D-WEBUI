export default store => {
    store.on("@init", () => ({
        content: [],
        showTerminal: false,
        showFiles: false,
    }))

    store.on("monitor/set", ({ content }, newcontent) => {
        return { content: newcontent }
    })
    store.on("panel/showterminal", ({ showTerminal }, newstate) => {
        return { showTerminal: newstate }
    })
    store.on("panel/showfiles", ({ showFiles }, newstate) => {
        return { showFiles: newstate }
    })
}
