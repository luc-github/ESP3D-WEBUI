import { h } from 'preact';
import { useEffect, useState } from "preact/hooks";
import Loader from '../../components/Loader'
// import './dashboard.scss'

import panelList from './Panels'

const Dashboard = () => {
	const [userPrefActivePanels, setUserPrefActivePanels] = useState(['temperatures', 'positions', 'fan', 'flowrate'])
	const [activePanels, setActivePanels] = useState()
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		filterActivePanels()
	}, [activePanels, userPrefActivePanels])

	const getUserPrefActivePanels = () => {
		//logic to get pref from localStorage or other
		return userPrefActivePanels //fake
	}

	const filterActivePanels = () => {
		let filteredPanelList = {}, key
		const userPrefActivePanels = getUserPrefActivePanels()
		for (key in panelList) {
			if (panelList.hasOwnProperty(key) && userPrefActivePanels.includes(key)) {
				const element = panelList[key]
				filteredPanelList[key] = element
			}
		}
		setActivePanels(filteredPanelList)
		setIsLoading(false)
	}

	return (
		<div id="dashboard" className="container">
			<h2>Dashboard</h2>
			<p>This is the component.</p>
			<button className='btn btn-primary' onClick={() => { setUserPrefActivePanels(["positions", "speed", "flowrate"]) }}>Filter </button>
			{isLoading && <Loader />}
			{!isLoading && <div className="columns">
				{activePanels && Object.keys(activePanels).map(panelKey => {
					const { comp, ...rest } = activePanels[panelKey]
					const Panel = comp
					return (<div key={panelKey} className="column col-xs-12 cold-md-6 col-4"><Panel title={panelKey} /></div>)
				})}
			</div>}
		</div>
	)
};

export default Dashboard;
