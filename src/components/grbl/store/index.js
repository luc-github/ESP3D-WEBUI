import { createStoreon } from "storeon"

import positions from "./positions"
import axis from "./axis"
import monitor from "../../store/monitor"
import error from "../../store/error"

const store = createStoreon([positions, axis, monitor, error])

export { store }
