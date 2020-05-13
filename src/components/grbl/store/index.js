import { createStoreon } from "storeon"

import positions from "./positions"
import monitor from "../../store/monitor"
import error from "../../store/error"

const store = createStoreon([positions, monitor, error])

export { store }
