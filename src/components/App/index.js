import { h } from 'preact';
import { Router } from '../Router'
import Navbar from '../Navbar';

import Home from '../../pages/home';
import About from '../../pages/about';
import Dashboard from '../../pages/dashboard';
import Settings from '../../pages/settings';

const routes = {
    DEFAULT: {
        component: <Home />,
        path: '/',
    },
    HOME: {
        component: <Home />,
        path: '/',
    },
    DASHBOARD: {
        component: <Dashboard />,
        path: '/dashboard',
    },
    ABOUT: {
        component: <About />,
        path: '/about',
    },
    SETTINGS: {
        component: <Settings />,
        path: '/settings',
    },
}

const App = () => (
    <div id="app">
        <Navbar />
        <Router routes={routes} />
    </div>
)

export default App;
