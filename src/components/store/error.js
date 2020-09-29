export default store => {
    store.on("@init", () => ({
        preferences_error: false,
        macros_error: false,
    }))

    store.on("errorprefs/set", ({ preferences_error }, newstate) => {
        return { preferences_error: newstate }
    })
    store.on("errormacros/set", ({ macros_error }, newstate) => {
        return { macros_error: newstate }
    })
}
