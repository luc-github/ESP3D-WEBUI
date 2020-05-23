import { createStoreon } from "storeon"

import positions from "./positions"
import temperatures from "./temperatures"
import monitor from "../../store/monitor"
import error from "../../store/error"
import display from "../../store/display"
import notificationsbar from "../../store/notificationsbar"
import filespanel from "../../store/filespanel"
import dialogcontent from "../../store/dialogcontent"

const store = createStoreon([
    positions,
    temperatures,
    monitor,
    error,
    display,
    notificationsbar,
    filespanel,
    dialogcontent,
])

export { store }
