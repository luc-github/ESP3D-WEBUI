export default store => {
    store.on("@init", () => ({
        preferences_error: false,
        controls_error: false,
    }))

    store.on("errorprefs/set", ({ preferences_error }, newstate) => {
        return { preferences_error: newstate }
    })
    store.on("errorcontrols/set", ({ controls_error }, newstate) => {
        return { controls_error: newstate }
    })
}
