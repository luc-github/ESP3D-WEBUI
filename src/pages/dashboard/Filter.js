import { h } from 'preact';
import { useEffect, useCallback, useRef, useState } from 'preact/hooks';


export const Filter = ({ items, children }) => {
    const dropdownRef = useRef(null);
    const [isActive, setIsActive] = useState(false);
    const toggleDropdown = () => setIsActive(!isActive);

    return (
        <div className={`dropdown ${isActive ? "active" : ''}`} ref={dropdownRef}>
            <button className="btn  btn-primary dropdown-toggle" onClick={toggleDropdown}>
                dropdown menu <i className="icon icon-caret" />
            </button>
            {isActive && (
                <ul className="menu">
                    {Object.keys(items).map(item => (
                        <li className="menu-item">
                            <label className="form-checkbox">
                                <input type="checkbox" />
                                <i className="form-icon" /> {item}
                            </label>
                        </li>))}
                    {[...children].map(child => (<li className="menu-item">{child}</li>))}
                </ul>
            )}
        </div>
    )
}