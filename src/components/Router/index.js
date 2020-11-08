import { h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks'


const parseLocation = () => { if (typeof window !== "undefined") { return location.hash.slice(1).toLowerCase() || '/' } }

const Router = ({ children, routes }) => {
    const [ActiveRoute, setActiveRoute] = useState(parseLocation)
    const [ActiveComponent, setActiveComponent] = useState(routes.DEFAULT.component)

    const handleHashChange = useCallback(() => {
        getActiveRoute()
    }, [])

    const getActiveRoute = () => {
        const location = parseLocation().split('/')
        for (let i = 0; i < location.length; i++) {
            const subLocation = location.slice(0, i + 1).join('/')
            for (const key in routes) {
                if (Object.prototype.hasOwnProperty.call(routes, key)) {
                    const element = routes[key]
                    if (element.path === subLocation) {
                        setActiveRoute(element.path)
                        setActiveComponent(element.component)
                        break
                    }
                }
            }
        }
    }

    useEffect(() => {
        getActiveRoute()
        console.log(ActiveRoute)
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);

    }, [handleHashChange, ActiveRoute])

    return (
        <div>
            {ActiveComponent}
            {children}
        </div>
    )
}

/**
 * @todo handle activeClassName
 **/
const Link = ({ activeClassName = '', className = '', href, children, ...rest }) => {
    return <a href={`#${href}`} className={className} {...rest}> {children}</a>
}

export { Router, Link }