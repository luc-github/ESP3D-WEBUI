export default store => {
    store.on("@init", () => ({
        axis: "Z",
    }))

    store.on("axis/set", ({ axis }, newaxis) => {
        return { axis: newaxis }
    })
}
