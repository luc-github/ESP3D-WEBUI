import TemperaturesPanel from './TemperaturesPanel'
import PositionsPanel from './PositionsPanel'
import SpeedPanel from './SpeedPanel'
import FlowratePanel from './FlowratePanel'
import FanPanel from './FanPanel'
import ExtrusionPanel from './ExtrusionPanel'
import TerminalPanel from './TerminalPanel'
import FilesPanel from './FilesPanel'

const panelList = {
    temperatures: {
        comp: TemperaturesPanel,
    },
    positions: {
        comp: PositionsPanel,
    },
    speed: {
        comp: SpeedPanel,
    },
    flowrate: {
        comp: FlowratePanel,
    },
    fan: {
        comp: FanPanel,
    },
    extrusion: {
        comp: ExtrusionPanel,
    },
    terminal: {
        comp: TerminalPanel,
    },
    files: {
        comp: FilesPanel,
    },
}

export default panelList
export { }