import { h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks'


const parseLocation = () => { if (typeof window !== "undefined") { return location.hash.slice(1).toLowerCase() || '/' } }

const Router = ({ children, routes }) => {
    const [ActiveRoute, setActiveRoute] = useState(parseLocation)
    const [ActiveComponent, setActiveComponent] = useState(routes.HOME.component)

    const handleHashChange = useCallback(() => {
        const location = parseLocation()
        getActiveRoute()
    }, [])

    const getActiveRoute = () => {
        for (const key in routes) {
            if (routes.hasOwnProperty(key)) {
                const element = routes[key]
                if (element.path === parseLocation()) {
                    setActiveRoute(element.path)
                    setActiveComponent(element.component)
                }
            }
        }
    }


    useEffect(() => {
        getActiveRoute()
        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [handleHashChange])

    return (
        <div>
            <p>ActiveRoute : {ActiveRoute}</p>
            {ActiveComponent}
            {children}
        </div>
    )
}

const Link = ({ activeClassName = '', children, href, ...rest }) => {
    return <a href={`#${href}`} {...rest}> {children}</a>
}

export { Router, Link }