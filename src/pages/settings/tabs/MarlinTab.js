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

/* const RenderForm = ({ src, handleChange }) => {
    const [settings, setSettings] = useState(src)

    const handleSubChanges = (e) => {
        const { name, checked } = e.target
        setSettings({ ...src, [name]: checked })
        console.log('subchange', settings)
    }

    useEffect(() => {
        console.log('settings state', settings)

    }, [settings])


    return Object.keys(settings).map(field => {
        const element = settings[field]
        // if (Object.prototype.hasOwnProperty.call(element, 'fields')) return (
        if ('fields' in element) return (
            <div className="panel">
                <p> {JSON.stringify(element)} </p>
                <RenderInput id={field} onChange={(e) => { handleChange(e); handleSubChanges(e) }} />
                <RenderForm src={element.fields} handleChange={(e) => { handleChange(e); handleSubChanges(e) }} />
            </div>)
        return <RenderInput id={field} onChange={(e) => { handleChange(e) }} />
    })

} */

const MyForm = (props) => {
    const [fields, setFields] = useState(props.fields)
    const [flattendFields, setFlattendFields] = useState(flattenSchema(props.fields))

    const handleChange = (key, e) => {
        const name = e.target.name
        const checked = e.target.checked
        console.log(key, name, e.target.checked)
        setFlattendFields({ ...flattendFields, [name]: { checked } })
    }

    useEffect(() => {
        console.log('fields', fields)
        console.log('flattendFields', flattendFields)
    }, [fields, flattendFields])

    return (
        Object.keys(fields).map(fieldId => {
            if (fields[fieldId].fields) return <SubForm controllerFieldId={fieldId} fields={fields[fieldId].fields} changeHandler={handleChange} />
            return <RenderInput id={fieldId} onChange={e => handleChange(fieldId, e)} />
        })
    )
}

const SubForm = ({ controllerFieldId, fields, changeHandler }) => {
    const [fieldsState, setFieldsState] = useState(fields)
    const [isOpen, setIsOpen] = useState(false)
    return (<div>
        <RenderInput id={controllerFieldId} onChange={e => { changeHandler(controllerFieldId, e); setIsOpen(e.target.checked) }} />
        <div class="panel" style={{ marginLeft: '1em' }} >
            {isOpen && <MyForm fields={fieldsState} />}
        </div></div>)
}

const MarlinTab = () => {
    const [settings, setSettings] = useState(monSchema.fields)

    useEffect(() => {
        console.log('settings Marlin Tab', settings)
        console.log('flatten', flattenSchema(settings))
    }, [settings])

    // const handleChange = (e) => {
    //     const { name, checked } = e.target
    //     console.log('handleChange', { name, checked })
    // }

    return (
        <div>
            <p>Marlin Tab Content</p>
            <MyForm fields={monSchema.fields} />
            {/* <RenderForm src={monSchema.fields} handleChange={handleChange} /> */}
        </div>
    )
}
export default MarlinTab