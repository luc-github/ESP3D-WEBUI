import { h, createContext } from "preact"
import "../stylesheets/application.scss"
import { useEffect } from "preact/hooks"
import { Esp3dVersion } from "./version"
export function App() {
    useEffect(() => {
        console.log("Page loaded")
    }, [])

    return (
        <center>
            ESP3D v<Esp3dVersion />
        </center>
    )
}
