import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'

const flattenSchema = (arr) => {
    return Object.keys(arr).reduce((acc, cur) => {
        const element = arr[cur]
        if ('fields' in element) {
            const { fields, ...rest } = element
            return { ...acc, [cur]: { ...rest }, ...flattenSchema(fields) }
        }
        return { ...acc, [cur]: { ...element } }
    }, {})
}

const monSchema = {
    fields: {
        champ1: { checked: false, },
        champ2: {
            checked: false,
            fields: {
                champ20: { checked: false, },
                champ21: { checked: false, },
                champ22: {
                    checked: false,
                    fields: {
                        champ220: { checked: false, },
                        champ221: { checked: false, },
                    }

                },
            }
        },
        champ3: { checked: false, },
        champ4: {
            checked: false,
            fields: {
                champ40: { checked: false, },
                champ41: { checked: false, },
            }

        },
    }
}

const RenderInput = ({ id, ...props }) => <p><label htmlFor=""><input type='checkbox' name={id} {...props} /> {id}</label></p>

const SettingsForm = (props) => {
    const [fields, setFields] = useState(props.fields)

    useEffect(() => {
        console.log('fields', fields)
    }, [fields])

    return (
        Object.keys(fields).map(fieldId => {
            if (fields[fieldId].fields) return <SubSettingsForm controllerFieldId={fieldId} fields={fields[fieldId].fields} changeHandler={props.handleChange} />
            return <RenderInput id={fieldId} onChange={e => props.handleChange(fieldId, e)} />
        })
    )
}

const SubSettingsForm = ({ controllerFieldId, fields, changeHandler }) => {
    const [fieldsState, setFieldsState] = useState(fields)
    const [isOpen, setIsOpen] = useState(false)
    return (<div>
        <RenderInput id={controllerFieldId} onChange={e => { changeHandler(controllerFieldId, e); setIsOpen(e.target.checked) }} />
        <div class="panel" style={{ marginLeft: '1em' }} >
            {isOpen && <SettingsForm fields={fieldsState} handleChange={changeHandler} />}
        </div></div>)
}

const MarlinTab = () => {
    const [settings, setSettings] = useState(monSchema.fields)
    const [flattendFields, setFlattendFields] = useState(flattenSchema(monSchema.fields))

    const handleChange = (key, e) => {
        const name = e.target.name
        const checked = e.target.checked
        console.log(key, name, e.target.checked)
        setFlattendFields({ ...flattendFields, [name]: { checked } })
    }

    useEffect(() => {
        console.log('flattendFields', flattendFields)
    }, [flattendFields])

    return (
        <div>
            <p>Marlin Tab Content</p>
            <SettingsForm fields={monSchema.fields} handleChange={handleChange} />
            {/* <RenderForm src={monSchema.fields} handleChange={handleChange} /> */}
        </div>
    )
}
export default MarlinTab