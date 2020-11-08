import { h } from 'preact';
import { useEffect, useState } from "preact/hooks";
import { Link } from 'preact-router/match';
import { Router } from 'preact-router';
import FeaturesTab from './tabs/FeaturesTab'
import InterfaceTab from './tabs/InterfaceTab'
import MarlinTab from './tabs/MarlinTab'

const Settings = () => (
    <div className="container">
        <h2>Settings</h2>
        <ul class="tab tab-block">
            <li class="tab-item"><Link className="btn btn-link" activeClassName="active" href="/settings/features">Features</Link></li>
            <li class="tab-item"><Link className="btn btn-link" activeClassName="active" href="/settings/interface">Interface</Link></li>
            <li class="tab-item"><Link className="btn btn-link" activeClassName="active" href="/settings/marlin">Marlin</Link></li>
            <li class="tab-item"><span className="btn btn-link">Setup</span></li>
        </ul>
        <Router>
            <FeaturesTab path="/settings/features" />
            <InterfaceTab path="/settings/interface" />
            <MarlinTab path="/settings/marlin" />
        </Router>
    </div>
);

export default Settings;
