export default store => {
    store.on("@init", () => ({
        printstatus: "",
        msgstatus: "",
    }))

    store.on("status/msg", ({ msgstatus }, msg) => {
        return { msgstatus: msg }
    })

    store.on("status/print", ({ printstatus }, newstatus) => {
        return { printstatus: newstatus }
    })
}
