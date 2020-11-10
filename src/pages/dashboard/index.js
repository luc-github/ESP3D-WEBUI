import { h } from 'preact';
import { useEffect, useState } from "preact/hooks";
import Loader from '../../components/Loader'
import { Filter } from './Filter'

import panelList from './Panels'

const Dashboard = () => {
	const [userPrefActivePanels, setUserPrefActivePanels] = useState(Object.keys(panelList))
	const [activePanels, setActivePanels] = useState()
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		filterActivePanels()
	}, [activePanels, userPrefActivePanels])

	const getUserPrefActivePanels = () => {
		//logic to get pref from localStorage or preferences.json
		return userPrefActivePanels //fake
	}

	const filterActivePanels = () => {
		let filteredPanelList = {}, key
		const userPrefActivePanels = getUserPrefActivePanels()
		for (key in panelList) {
			if (Object.prototype.hasOwnProperty.call(panelList, key) && userPrefActivePanels.includes(key)) {
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

			{isLoading && <Loader />}
			{!isLoading && <div className="filter-wrapper mb-2"><Filter items={panelList}><button className='btn btn-primary' onClick={() => { setUserPrefActivePanels(["positions", "speed", "flowrate"]) }}>Filter </button></Filter></div>}
			{!isLoading && <div className="columns">
				{activePanels && Object.keys(activePanels).map(panelKey => {
					const { comp } = activePanels[panelKey]
					const Panel = comp
					return (<div key={panelKey} className="column col-xs-12 cold-md-6 col-4"><Panel title={panelKey} /></div>)
				})}
			</div>}
		</div>
	)
};

export default Dashboard;
