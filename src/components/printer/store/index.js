import { createStoreon } from "storeon"

import positions from "./positions"
import temperatures from "./temperatures"
import monitor from "../../store/monitor"
import error from "../../store/error"

const store = createStoreon([positions, temperatures, monitor, error])

export { store }
