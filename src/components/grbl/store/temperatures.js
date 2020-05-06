export default store => {
    store.on("@init", () => ({
        temperatures: [
            { key: "T1", value: "0" },
            { key: "B", value: "0" },
        ],
    }))

    store.on("temperatures/add", ({ temperatures }, temperature) => {
        return { temperatures: temperatures.concat([temperature]) }
    })

    store.on("temperatures/update", ({ temperatures }, temperature) => {
        return {
            temperatures: [
                ...temperatures.filter(
                    element => element.key !== temperature.key
                ),
                temperature,
            ],
        }
    })
}
