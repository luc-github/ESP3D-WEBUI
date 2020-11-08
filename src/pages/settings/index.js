import { h } from 'preact';
import { Router, Link } from '../../components/Router';
import FeaturesTab from './tabs/FeaturesTab'
import InterfaceTab from './tabs/InterfaceTab'
import MarlinTab from './tabs/MarlinTab'

const routes = {
    DEFAULT: {
        component: <FeaturesTab />,
        path: '/settings',
    },
    FEATURES: {
        component: <FeaturesTab />,
        path: '/settings/features',
    },
    INTERFACE: {
        component: <InterfaceTab />,
        path: '/settings/interface',
    },
    MARLIN: {
        component: <MarlinTab />,
        path: '/settings/marlin',
    },
}

const Settings = () => (
    <div className="container">
        <h2>Settings</h2>
        <ul class="tab tab-block">
            <li class="tab-item"><Link className="btn btn-link" activeClassName="active" href={routes.FEATURES.path}>Features</Link></li>
            <li class="tab-item"><Link className="btn btn-link" activeClassName="active" href={routes.INTERFACE.path}>Interface</Link></li>
            <li class="tab-item"><Link className="btn btn-link" activeClassName="active" href={routes.MARLIN.path}>Marlin</Link></li>
            <li class="tab-item"><span className="btn btn-link">Setup</span></li>
        </ul>
        <Router routes={routes} />
    </div>
)

export default Settings;
