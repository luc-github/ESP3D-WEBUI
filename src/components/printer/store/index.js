import { createStoreon } from "storeon"

import positions from "./positions"
import temperatures from "./temperatures"
import monitor from "../../store"

const store = createStoreon([positions, temperatures, monitor])

export { store }
