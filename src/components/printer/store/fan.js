export default store => {
    store.on("@init", () => ({
        fanpercent: "none",
    }))

    store.on("updateFanPercent", ({ fanpercent }, newvalue) => {
        return { fanpercent: newvalue }
    })
}
