export default store => {
    store.on("@init", () => ({
        content: [],
    }))

    store.on("monitor/set", ({ content }, newcontent) => {
        return { content: newcontent }
    })
}
