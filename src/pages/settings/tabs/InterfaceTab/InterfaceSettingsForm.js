import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks'
import { Field } from '../../../../components/Form/Field'
import { mergeFlatPrefToNestedSchema } from '../../../../utils'

const calledChildrenComp = {
    macro: (() => { return (<p>Custom child component Macro</p>) })(),
    panels: (() => { return (<p>Custom child component Panel</p>) })()
}

const SettingsForm = (props) => {
    const [fields, setFields] = useState(props.fields)
    const [preferences, setPreferences] = useState(props.preferences)

    const handleInternalStates = (e) => {
        const name = e.target.name
        const value = (e.target.type === 'checkbox') ? e.target.checked : e.target.value
        setPreferences({ ...preferences, [name]: value })
    }

    return (
        preferences && Object.keys(fields).map(fieldId => {
            if (fields[fieldId].fields)
                return (
                    <SubSettingsForm
                        controllerField={{ id: fieldId, ...fields[fieldId] }}
                        fields={fields[fieldId].fields}
                        changeHandler={props.handleChange}
                        preferences={preferences}
                    />)
            return (
                <Field
                    type={fields[fieldId].type}
                    id={fieldId}
                    label={fieldId}
                    value={preferences[fieldId]}
                    onChange={e => { props.handleChange(fieldId, e); handleInternalStates(e) }}
                />)
        })
    )
}

const SubSettingsForm = ({ controllerField, changeHandler, preferences }) => {
    const [fieldsState, setFieldsState] = useState(controllerField.fields)
    const [isOpen, setIsOpen] = useState(controllerField.value)
    const [controllerFieldState, setControllerFieldState] = useState(controllerField)

    const handleInternalStates = (e) => {
        const value = (e.target.type === 'checkbox') ? e.target.checked : e.target.value
        setControllerFieldState({ ...controllerFieldState, value })
    }
    if ('type' in controllerFieldState) return (
        <div>
            <Field
                type={controllerFieldState.type}
                id={controllerFieldState.id}
                label={controllerFieldState.id}
                value={isOpen}
                onChange={e => { changeHandler(controllerFieldState.id, e); handleInternalStates(e); setIsOpen(!isOpen) }} />
            {isOpen && <div class="subForm" style={{ padding: '0 2em 1em 2em', borderLeft: '2px solid grey' }} >
                <SettingsForm fields={fieldsState} preferences={preferences} handleChange={changeHandler} />
                {calledChildrenComp[controllerFieldState.children]}
            </div>}
        </div>)
    return (<div>
        <strong>{controllerFieldState.id}</strong>
        <SettingsForm fields={fieldsState} preferences={preferences} handleChange={changeHandler} />
    </div>)
}

export const InterfaceSettingsForm = ({ preferences, schema }) => {
    const [settings, setSettings] = useState(mergeFlatPrefToNestedSchema(preferences, schema.fields))
    const [preferencesState, setPreferencesState] = useState(preferences)
    const [updatableSettings, setUpdatableSettings] = useState({})
    const handleChange = (key, e) => {
        // console.log('changed field : ', e.target.name)
        const name = e.target.name
        const value = (e.target.type === 'checkbox') ? e.target.checked : e.target.value
        setPreferencesState({ ...preferencesState, [name]: value })
        setSettings(mergeFlatPrefToNestedSchema({ ...preferencesState, [name]: value }, schema.fields))
        setUpdatableSettings({ ...updatableSettings, [name]: value })
    }

    useEffect(() => {
        console.log(updatableSettings)
    }, [updatableSettings])

    useEffect(() => {
    }, [preferencesState, settings])

    return (
        <form className="form-horizontal">
            <div className="panel">
                <div className="panel-body">
                    {preferencesState && settings && <SettingsForm fields={settings} preferences={preferencesState} handleChange={handleChange} />}
                </div>
            </div>
        </form>
    )
}