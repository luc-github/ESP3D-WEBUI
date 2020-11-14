import { h } from 'preact';
import { Router } from '../Router'
import { UiContextProvider } from '../UiContext'
import Navbar from '../Navbar';
import { Toast } from '../Toast';
import { Modal } from '../Modal';
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

const App = () => {
    return (
        <div id="app">
            <UiContextProvider>
                <Toast />
                <Modal />
                <Navbar />
                <div id="main-container">
                    <Router routes={routes} />
                </div>
            </UiContextProvider>
        </div>
    )
}

export { App }
