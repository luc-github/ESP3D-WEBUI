export default store => {
    store.on("@init", () => ({
        filesList: [],
        filesStatus: "",
    }))
    store.on("setFilesList", ({ filesList }, newcontent) => {
        return { filesList: newcontent }
    })
    store.on("setFilesStatus", ({ filesStatus }, newcontent) => {
        return { filesStatus: newcontent }
    })
}
