import { h } from 'preact';
import { Router } from 'preact-router';

import Navbar from '../Navbar';

// Code-splitting is automated for `routes` directory
import Home from '../../routes/home';
// import Profile from '../../routes/profile';


import About from '../../routes/about';
import Dashboard from '../../routes/dashboard';
import Settings from '../../routes/settings';
// import Kitchensink from '../../routes/Kitchensink';


const App = () => (
    <div id="app">
        <Navbar />
        <Router>
            <Home path="/" />
            <About path="/about" />
            <Settings path="/settings" />
            <Settings path="/settings/:tab" />
            <Dashboard path="/dashboard" />
            {/* <Kitchensink path="/kitchensink" /> */}
            {/* <Profile path="/profile/" user="me" /> */}
            {/* <Profile path="/profile/:user" /> */}
        </Router>
    </div>
)

export default App;
