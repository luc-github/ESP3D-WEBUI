import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { MoreVertical as MoreVerticalIcon } from 'preact-feather';
import {
	ChevronDown,
	MessageSquare,
	AlertCircle,
	CheckCircle,
	Circle,
	PauseCircle,
} from "preact-feather";

// NOT YET IMPLEMENTED
const PanelContainer = ({ children, className, ...props }) => (
	<div className={`panel-container container ${className}`} {...props}>
		<div className="columns">
			{children}
		</div>
	</div>
);

// NOT YET IMPLEMENTED
const Panel = ({ children, className, ...props }) => (
	<div className={`column col-3 col-xl-6 col-md-12  ${className}`} {...props}>
		<div className="panel">
			{children}
		</div>
	</div>
);

// NOT YET IMPLEMENTED
Panel.header = ({ children, className, ...props }) => (
	<div className={`${className}`} {...props} style={{ display: "flex", padding: "0.25rem", backgroundColor: "#DDD" }}>
		{children}
	</div>
);

// NOT YET IMPLEMENTED
Panel.content = ({ children, className, ...props }) => (
	<div className={`panel-content ${className}`} {...props}>
		{children}
	</div>
);

// NOT YET IMPLEMENTED
Panel.footer = ({ children, className, ...props }) => (
	<div className={`panel-footer ${className}`} {...props}>
		{children}
	</div>
);

// NOT YET IMPLEMENTED
Panel.menu = ({ items, children, className, ...props }) => (
	<div class="dropdown dropdown-right">
		<button
			class="dropdown-toggle btn btn-xs btn-header m-1"
			tabindex="0"
		>
			<MoreVerticalIcon size="0.8rem" />

		</button>
		<ul class="menu">
			{items && items.map(item => (
				<li class="menu-item">
					<div class="menu-entry">
						<div class="menu-panel-item">
							<span class="text-menu-item">{item.name}</span>
							<span class="btn btn-clear" aria-label="Close" />
						</div>
					</div>
				</li>
			))}
		</ul>
	</div>)

// NOT YET IMPLEMENTED
const PanelComponent = ({ title, icon, children, handleClose, menu, className, ...props }) => {
	return (
		<Panel style={{ marginBottom: "1rem" }}>
			<Panel.header style={{ padding: "0.5rem" }}>
				{icon && <div style={{ flex: "none", backgroundColor: "red" }}>{icon}</div>}
				<div style={{ flex: "1 1 0%" }} >{title}</div>
				<div style={{ flex: "none", display: "flex" }} >
					{menu && <Panel.menu items={menu} />}
					{handleClose && <div className="column col-auto panel-header-close"><button className="btn btn-clear" onClick={handleClose} /></div>}
				</div>
			</Panel.header>
			<Panel.content>
				{children}
			</Panel.content>
			<Panel.footer>
			</Panel.footer>
		</Panel >
	)
}

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
									{(item.displayToggle)
										? item.displayToggle()
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