/*
 shim.js - minimal browser globals so the Helper modules can be
 imported under Node (they may touch document/localStorage at load time).
 Imported first by roundtrip.js, before any application module.
*/
const safe = (fn) => {
    try {
        fn()
    } catch (e) {
        //global already exists and is read-only: keep it
    }
}

safe(() => {
    if (typeof globalThis.window === "undefined")
        globalThis.window = globalThis
})
safe(() => {
    if (typeof globalThis.document === "undefined")
        globalThis.document = {
            documentElement: {},
            head: {},
            body: { appendChild() {}, removeChild() {} },
            createElement: () => ({ style: {} }),
            getElementById: () => null,
            querySelector: () => null,
            addEventListener() {},
        }
})
safe(() => {
    if (typeof globalThis.localStorage === "undefined")
        globalThis.localStorage = {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
        }
})
safe(() => {
    if (typeof globalThis.location === "undefined")
        globalThis.location = {
            protocol: "http:",
            hostname: "localhost",
            host: "localhost",
            port: "",
            pathname: "/",
            href: "http://localhost/",
        }
})
