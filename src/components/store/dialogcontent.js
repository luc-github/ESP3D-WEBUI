export default store => {
    store.on("@init", () => ({
        dialogData: [],
    }))
    store.on("setDialog", ({ dialogData }, newdata) => {
        return { dialogData: newdata }
    })
}
