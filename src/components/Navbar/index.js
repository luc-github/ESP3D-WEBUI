import { h } from 'preact';
// import { Link } from 'preact-router/match';
import { Link } from '../Router'


const Navbar = () => (
	<header class="navbar">
		<section class="navbar-section">
			<span className="navbar-brand mr-2">ESP<strong>3D</strong></span>
			<Link className="btn btn-link" activeClassName="active" href="/about">About</Link>
			<Link className="btn btn-link" activeClassName="active" href="/dashboard">Dashboard</Link>
			<Link className="btn btn-link" activeClassName="active" href="/settings">Settings</Link>
			{/* <Link className="btn btn-link" activeClassName="active" href="/kitchensink">kitchensink 2</Link> */}
			{/* <Link className="btn btn-link" activeClassName={null} href="/profile">Me</Link> */}
			{/* <Link className="btn btn-link" activeClassName={null} href="/profile/john">John</Link> */}
		</section>
	</header>
);

export default Navbar;
