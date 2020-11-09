import { h } from 'preact';
import { useContext } from 'preact/hooks'
import { UiContext } from '../../components/UiContext'

const Home = () => {
	const store = useContext(UiContext)
	const { addModal } = store.modals
	const { addToast } = store.toasts
	return (
		<div className="container">
			<h2>Home</h2>
			<p>This is the Home component.</p>
			<button onClick={() => { addModal({ size: 'sm', title: 'Title', content: 'Content', footer: <p>Mon composant footer</p> }) }}>Change modal</button>
			<button onClick={() => { addToast({ content: Date.now(), type: '' }) }}>Open Toast</button>
		</div>
	)
}

export default Home
