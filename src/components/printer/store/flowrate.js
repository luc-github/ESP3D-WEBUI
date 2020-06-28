export default store => {
    store.on("@init", () => ({
        flowrate: "none",
    }))

    store.on("updateFlowRate", ({ flowrate }, newvalue) => {
        return { flowrate: newvalue }
    })
}
