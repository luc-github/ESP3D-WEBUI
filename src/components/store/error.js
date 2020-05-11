export default store => {
    store.on("@init", () => ({
        preferences_error: false,
    }))

    store.on("error/set", ({ preferences_error }, newstate) => {
        return { preferences_error: newstate }
    })
}
