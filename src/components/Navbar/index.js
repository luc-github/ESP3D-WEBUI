import { h } from 'preact';
import { Link } from '../Router'


const Navbar = () => (
	<header class="navbar">
		<section class="navbar-section">
			<span className="navbar-brand mr-2">ESP<strong>3D</strong></span>
			<Link className="btn btn-link" activeClassName="active" href="/about">About</Link>
			<Link className="btn btn-link" activeClassName="active" href="/dashboard">Dashboard</Link>
			<Link className="btn btn-link" activeClassName="active" href="/settings">Settings</Link>
		</section>
	</header>
);

export default Navbar;
