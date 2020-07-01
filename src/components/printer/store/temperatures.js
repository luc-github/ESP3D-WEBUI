const DATAMAX = 400

export default store => {
    store.on("@init", () => ({
        T: "none",
        Tt: 0,
        T1: "none",
        T1t: 0,
        B: "none",
        Bt: 0,
        TList: [
        ],
        T1List: [
        ],
        BList: [
        ],
    }))

    store.on("temperatures/addT", ({ TList }, temperature) => {
        TList = TList.slice(-DATAMAX)
        return { TList: TList.concat([temperature]) }
    })
    store.on("temperatures/addT1", ({ T1List }, temperature) => {
        T1List = T1List.slice(-DATAMAX)
        return { T1List: T1List.concat([temperature]) }
    })
    store.on("temperatures/addB", ({ BList }, temperature) => {
        BList = BList.slice(-DATAMAX)
        return { BList: BList.concat([temperature]) }
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
