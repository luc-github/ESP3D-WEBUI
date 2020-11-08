import { h } from 'preact';
import { Router } from '../Router'
import Navbar from '../Navbar';

// Code-splitting is automated for `routes` directory
import Home from '../../pages/home';
// import Profile from '../../pages/profile';


import About from '../../pages/about';
import Dashboard from '../../pages/dashboard';
import Settings from '../../pages/settings';
// import Kitchensink from '../../pages/Kitchensink';
const routes = {
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
        <Router routes={routes}>
            <div></div>
        </Router>
    </div>
)

export default App;
