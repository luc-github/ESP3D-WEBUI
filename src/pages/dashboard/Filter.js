import { h } from 'preact';
import { useRef } from 'preact/hooks'
export const Filter = ({ items, activePanels, children, action }) => {
    const dropdownRef = useRef(null)
    const toggleDropdown = () => dropdownRef.current.focus()
    return (
        <div className="dropdown" >
            <button className="btn btn-primary dropdown-toggle" onClick={toggleDropdown} ref={dropdownRef}>
                Panels settings <i className="icon icon-caret" />
            </button>
            <ul className="menu">
                {Object.keys(items).map((item) => {
                    return (
                        <li className="menu-item">
                            <label className="form-checkbox">
                                <input type="checkbox"
                                    value={item}
                                    checked={activePanels.includes(item)}
                                    onChange={(e) => { action(e) }} />
                                <i className="form-icon" /> {item}
                            </label>
                        </li>)
                })}
                {children && [...children].map(child => (<li className="menu-item">{child}</li>))}
            </ul>

        </div>
    )
}