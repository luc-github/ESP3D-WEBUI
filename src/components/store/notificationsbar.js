export default store => {
    store.on("@init", () => ({
        notifificationBottom: "50px",
    }))

    store.on("setNotificationBottom", ({ notifificationBottom }, newvalue) => {
        return { notifificationBottom: newvalue }
    })
}
