/**
 * @todo Add validation
 * @todo Add data fetch
 * @todo Add data submitting
 */

import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Field } from '../../../../components/Form/Field'
import { settingsFormatter, settingsState } from './settingsFormatter'
import { Settings } from '../../../../constants/esp400.json'

const FeaturesTab = () => {
    const [formState, setFormState] = useState(settingsState(Settings))
    const [updatableSettingsState, setUpdatableSettingsState] = useState({})
    const sectionsStructure = settingsFormatter(Settings)

    const handleValidation = (id, value) => { }

    const handleSubmit = (values) => { }

    const handleChange = (e) => {
        const { name, value } = e.target
        const isValid = true //for dev purpose, handeValidation todo
        const validation = { valid: isValid, message: 'test message' }
        const newValue = { [name]: { ...formState[name], value: value, validation } }
        setFormState({ ...formState, ...newValue })
        if (isValid.valid) setUpdatableSettingsState({ ...updatableSettingsState, [name]: value })
    }

    useEffect(() => {
        // console.log('State', formState) //for debug purpose 
        // console.log('Structure', sectionsStructure) //for debug purpose
        // console.log('updatableSettingsState', updatableSettingsState) //for dev purpose, handeValidation todo
    }, [formState])

    return (
        <div id="featuresSettingsPanel">
            <form className="form-horizontal ">
                {
                    Object.keys(sectionsStructure).map(sectionId => {
                        const section = sectionsStructure[sectionId]
                        return (
                            <div id={sectionId} key={sectionId} class="">
                                <h3>{sectionId}</h3>
                                <div class="columns">
                                    {Object.keys(section).map(subsectionId => {
                                        const subSection = section[subsectionId]
                                        return (
                                            <div className="column col-sm-12 col-md-6 col-4 mb-2">
                                                <div class="panel p-2 mb-2 ">
                                                    <div class="panel-header">
                                                        <div class="panel-title">
                                                            <h4>{subsectionId}</h4>
                                                        </div>
                                                    </div>
                                                    <div class="panel-body">
                                                        {subSection.map(
                                                            fieldId => {
                                                                {/* console.log({ ...formState[fieldId] }) */ }
                                                                return (<Field
                                                                    {...formState[fieldId]}
                                                                    horizontal
                                                                    onChange={(e) => { handleChange(e) }}
                                                                />)
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )

                                    })}</div>

                            </div>
                        )
                    })
                }
            </form>
        </div>
    )
}

export default FeaturesTab