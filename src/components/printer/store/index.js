import { createStoreon } from "storeon"

import positions from "./positions"
import temperatures from "./temperatures"

const store = createStoreon([positions, temperatures])

export { store }
