import { h } from "preact"
import { ChevronDown } from "preact-feather"
import { useUiContextFn } from "../../contexts"

const Menu = ({ items }) => {
    return (
        <div
            class="dropdown dropdown-right"
            onClick={(e) => {
                useUiContextFn.haptic()
            }}
        >
            <span
                class="dropdown-toggle btn btn-xs btn-header m-1"
                tabindex="0"
            >
                <ChevronDown size="0.8rem" />
            </span>
            <ul class="menu">
                {items &&
                    items.map((item, i) => {
                        if (item.divider) {
                            return <li class="divider" key={i}></li>
                        }
                        return (
                            <li class="menu-item" key={i}>
                                <div
                                    className="menu-entry"
                                    onclick={item.onClick}
                                >
                                    <div class="menu-panel-item">
                                        <span class="text-menu-item">
                                            {item.label}
                                        </span>
                                        {item.displayToggle
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
