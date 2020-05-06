import { createStoreon } from "storeon"

import positions from "./positions"
import temperatures from "./temperatures"

export default createStoreon([positions, temperatures])
