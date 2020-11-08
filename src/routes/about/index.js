import { h } from 'preact';
import { useEffect, useState } from "preact/hooks";
import Loader from '../../components/Loader'
import fakeProps from './fakeProps.json'

//simule un appel asynchrone qui dure 3 sec
const getAsyncPropsFromApi = async () => {
    return new Promise((resolve) => {
        resolve(fakeProps)
    })
}

const About = () => {
    const [isLoading, setIsLoading] = useState(true) // par défaut on charge
    const [props, setProps] = useState()

    useEffect(() => {
        const clearSideEffect = getProps()
        return () => { clearSideEffect() }
    }, [props])

    const getProps = () => {
        console.log("trig")
        setIsLoading(true)
        const timer = setTimeout(() => { //Fake Async delay
            getAsyncPropsFromApi().then(
                (loadedProps) => {
                    setProps(loadedProps)
                    setIsLoading(false)
                }
            )
        }, 1500)
        return () => { clearTimeout(timer) } //prevent side effect 
    }

    return (
        <div id="about" className="container">
            <h2>About</h2>
            <p>This is the About .</p>
            {isLoading && <Loader />}
            {!isLoading && props &&
                <ul>
                    {props.map((prop, key) =>
                        <li key={key}>{prop.prop} : {prop.value}</li>
                    )}
                </ul>}
            <button className="btn" onClick={() => { getProps() }}>Refresh</button>
        </div>
    )
};

export default About;
