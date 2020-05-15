export default store => {
    store.on("@init", () => ({
        content: [],
        showTerminal: false,
        showFiles: false,
    }))

    store.on("monitor/set", ({ content }, newcontent) => {
        return { content: newcontent }
    })
    store.on("monitor/showterminal", ({ showTerminal }, newstate) => {
        return { showTerminal: newstate }
    })
    store.on("monitor/showfiles", ({ showFiles }, newstate) => {
        return { showFiles: newstate }
    })
}
