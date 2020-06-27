export default store => {
    store.on("@init", () => ({
        feedrate: "none",
    }))

    store.on("updateFeedRate", ({ feedrate }, newvalue) => {
        return { feedrate: newvalue }
    })
}
