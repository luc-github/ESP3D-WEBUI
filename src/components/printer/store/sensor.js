const DATAMAX = 400

export default store => {
    store.on("@init", () => ({
        SData: [],
        SList: [],
    }))

    store.on("sensors/add", ({ SList }, data) => {
        if (SList.length > DATAMAX) {
            SList = SList.slice(-DATAMAX)
        }
        return { SList: SList.concat([data]) }
    })

    store.on("sensors/clear", ({ SList }) => {
        return { SList: [] }
    })

    store.on("sensors/setData", ({ SData }, newvalue) => {
        return {
            SData: [
                ...SData.filter(element => element.index !== newvalue.index),
                newvalue,
            ],
        }
    })
}
