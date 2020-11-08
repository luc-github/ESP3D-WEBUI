import { h } from 'preact';
import { useEffect, useState } from "preact/hooks";
import Loader from '../../components/Loader'

const About = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [props, setProps] = useState([])

    useEffect(() => {
        setIsLoading(false)
        setProps(props)

    }, [props])

    const getProps = () => {
        setIsLoading(false)
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