import { useStoreon } from "storeon/preact"

export default store => {
    store.on("@init", () => ({
        showTemperatures: false,
    }))
    store.on("panel/showtemperatures", ({ showTemperatures }, newstate) => {
        const { dispatch } = useStoreon()
        if (newstate) dispatch("panel/add", "temperatures")
        else dispatch("panel/remove", "temperatures")
        return { showTemperatures: newstate }
    })
}
