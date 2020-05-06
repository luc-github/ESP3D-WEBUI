export default store => {
    store.on("@init", () => ({
        x: 0.0,
        y: 0.0,
        z: 0.0,
    }))

    store.on("positions/updateX", ({ x }, distance) => {
        return { x: x + parseFloat(distance) }
    })

    store.on("positions/updateY", ({ y }, distance) => {
        return { y: y + parseFloat(distance) }
    })

    store.on("positions/updateZ", ({ z }, distance) => {
        return { z: z + parseFloat(distance) }
    })
}
