export default store => {
    store.on("@init", () => ({
        T: "none",
        Tt: 0,
        T1: "none",
        T1t: 0,
        B: "none",
        Bt: 0,
        temperatures: [
            { key: "T", value: "0" },
            { key: "T1", value: "0" },
            { key: "B", value: "0" },
        ],
    }))

    store.on("temperatures/add", ({ temperatures }, temperature) => {
        return { temperatures: temperatures.concat([temperature]) }
    })

    store.on("temperatures/updateT", ({ T }, newvalue) => {
        return { T: newvalue }
    })
    store.on("temperatures/updateTt", ({ Tt }, newvalue) => {
        return { Tt: newvalue }
    })
    store.on("temperatures/updateT1", ({ T1 }, newvalue) => {
        return { T1: newvalue }
    })
    store.on("temperatures/updateT1t", ({ T1t }, newvalue) => {
        return { T1t: newvalue }
    })
    store.on("temperatures/updateB", ({ B }, newvalue) => {
        return { B: newvalue }
    })
    store.on("temperatures/updateBt", ({ Bt }, newvalue) => {
        return { Bt: newvalue }
    })
}
