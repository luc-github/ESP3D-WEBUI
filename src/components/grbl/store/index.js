import { createStoreon } from "storeon"
import positions from "./positions"
import axis from "./axis"
import monitor from "../../store/monitor"
import error from "../../store/error"
import display from "../../store/display"
import notificationsbar from "../../store/notificationsbar"
import filespanel from "../../store/filespanel"
import dialogcontent from "../../store/dialogcontent"

const store = createStoreon([
    positions,
    axis,
    monitor,
    error,
    display,
    notificationsbar,
    filespanel,
    dialogcontent,
])

export { store }
