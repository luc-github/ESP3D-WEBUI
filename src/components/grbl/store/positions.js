export default store => {
    store.on("@init", () => ({
        x: 0.0,
        y: 0.0,
        z: 0.0,
        a: 0.0,
        b: 0.0,
        c: 0.0,
    }))

    store.on("positions/setX", ({ x }, newposition) => {
        return { x: newposition }
    })

    store.on("positions/setY", ({ y }, newposition) => {
        return { y: newposition }
    })

    store.on("positions/setZ", ({ z }, newposition) => {
        return { z: newposition }
    })
    store.on("positions/setA", ({ a }, newposition) => {
        return { a: newposition }
    })
    store.on("positions/setB", ({ b }, newposition) => {
        return { b: newposition }
    })
    store.on("positions/setC", ({ c }, newposition) => {
        return { c: newposition }
    })
}
