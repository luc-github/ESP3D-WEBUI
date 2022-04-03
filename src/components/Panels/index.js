const Menu = ({ items }) => {
	return (
		<div class="dropdown dropdown-right">
			<span class="dropdown-toggle btn btn-xs btn-header m-1" tabindex="0">
				<ChevronDown size="0.8rem" />
			</span>
			<ul class="menu">
				{items && items.map((item, i) => {
					if (item.divider) { return (<li class="divider" key={i}></li>) };
					return (
						<li class="menu-item" key={i}>
							<div className="menu-entry">
								<div class="menu-panel-item" onclick={item.onClick}>
									<span class="text-menu-item">{item.label}</span>
									{(item.toggleDisplay)
										? item.toggleDisplay()
										: item.icon}
								</div>
							</div>
						</li>
					)
				})}
			</ul>
		</div>
	)
}

export default { Menu }
export { Menu }