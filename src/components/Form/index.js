import { h } from 'preact';
import { Field } from './Field'

const Form = ({ formData }) => {
    return (
        <form className="form-horizontal">
            {
                Object.keys(formData).map(sectionId => {
                    const section = formData[sectionId]
                    return (
                        <section id={sectionId} key={sectionId}>
                            <h5>{section.title}</h5>
                            <div class="panel pb-2 pt-2 mb-2">
                                <div class="panel-body">
                                    {Object.keys(section.fields).map(
                                        fieldId =>
                                            <Field
                                                {...section.fields[fieldId]}
                                                id={fieldId}
                                                horizontal
                                            />
                                    )}
                                </div>
                            </div>
                        </section>
                    )
                })
            }
        </form>
    )
}

export default Form
export { Form }