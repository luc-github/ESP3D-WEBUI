export default store => {
    store.on("@init", () => ({
        x: "none",
        y: "none",
        z: "none",
    }))

    store.on("positions/updateX", ({ x }, newposition) => {
        return { x: newposition }
    })

    store.on("positions/updateY", ({ y }, newposition) => {
        return { y: newposition }
    })

    store.on("positions/updateZ", ({ z }, newposition) => {
        return { z: newposition }
    })
}
