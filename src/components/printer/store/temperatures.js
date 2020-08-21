const DATAMAX = 400

export default store => {
    store.on("@init", () => ({
        TT: [],
        TB: [],
        TC: [],
        TP: [],
        TR: [],
        TList: [],
    }))

    store.on("temperatures/addT", ({ TList }, temperatures) => {
        if (TList.length > DATAMAX) {
            TList = TList.slice(-DATAMAX)
        }
        return { TList: TList.concat([temperatures]) }
    })

    store.on("temperatures/clear", ({ TList }) => {
        return { TList: [] }
    })

    store.on("temperatures/updateTT", ({ TT }, newvalue) => {
        return {
            TT: [
                ...TT.filter(element => element.index !== newvalue.index),
                newvalue,
            ],
        }
    })
    store.on("temperatures/updateTB", ({ TB }, newvalue) => {
        return {
            TB: [
                ...TB.filter(element => element.index !== newvalue.index),
                newvalue,
            ],
        }
    })
    store.on("temperatures/updateTR", ({ TR }, newvalue) => {
        return {
            TR: [
                ...TR.filter(element => element.index !== newvalue.index),
                newvalue,
            ],
        }
    })
    store.on("temperatures/updateTP", ({ TP }, newvalue) => {
        return {
            TP: [
                ...TP.filter(element => element.index !== newvalue.index),
                newvalue,
            ],
        }
    })
    store.on("temperatures/updateTC", ({ TC }, newvalue) => {
        return {
            TC: [
                ...TC.filter(element => element.index !== newvalue.index),
                newvalue,
            ],
        }
    })
}
