import { h } from 'preact';
import { useEffect, useState } from "preact/hooks";
import Loader from '../../components/Loader'
import { Filter } from './Filter'

import panelList from './Panels'

const Dashboard = () => {
	const [activePanels, setActivePanels] = useState({ ...panelList })
	const [isLoading, setIsLoading] = useState(true)

	const handleCheck = (a) => {
		if (a.target.checked === false) removePanel(a.target.value)
		else { addPanel(a.target.value) }
	}

	const addPanel = (id) => {
		setActivePanels({ ...activePanels, [id]: panelList[id] })
	}

	const removePanel = (id) => {
		const { [id]: value, ...rest } = activePanels
		setActivePanels({ ...rest })
	}

	useEffect(() => {
		setIsLoading(false)
	}, [activePanels])

	return (
		<div id="dashboard" className="container">
			<h2>Dashboard</h2>
			{isLoading && <Loader />}
			{!isLoading && <div className="filter-wrapper mb-2">
				<Filter
					items={panelList}
					activePanels={Object.keys(activePanels)}
					action={handleCheck} />
			</div>}
			{!isLoading && <div className="columns">
				{activePanels && Object.keys(activePanels).map(panelKey => {
					const { comp } = activePanels[panelKey]
					const Panel = comp
					return <div key={panelKey} className="column col-xs-12 cold-md-6 col-4"><Panel title={panelKey} /></div>
				})}
			</div>}
		</div>
	)
};

export default Dashboard;
