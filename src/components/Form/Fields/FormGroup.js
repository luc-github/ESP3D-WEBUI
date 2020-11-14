import { h, Fragment } from 'preact';
import { getColClasses } from '../../../utils'

export const FormGroup = ({ horizontal, validation = null, children, label, id }) => {

    const fieldColwidth = { col: 9, lg: 12, md: 12, sm: 12, xs: 12 }
    const labelColwidth = Object.keys(fieldColwidth).reduce((acc, key) => ({ ...acc, [key]: fieldColwidth[key] == 12 ? 12 : 12 - fieldColwidth[key] }), {})

    const getValidationClass = (validation) => {
        if (validation !== null && validation.valid) return `form-group has-success`
        if (validation !== null && !validation.valid) return `form-group has-error`
        return `form-group`
    }
    return (
        <div class={getValidationClass(validation)}>
            {
                horizontal ?
                    <Fragment>
                        <div class={`${getColClasses(labelColwidth)} `}>
                            <label class="form-label" htmlFor={id}>{label}</label>
                        </div>
                        <div class={`${getColClasses(fieldColwidth)} `}>
                            {children}
                        </div>
                        {validation && <p className={`col-ml-auto ${getColClasses(fieldColwidth)} form-input-hint`}>{validation.message}</p>}
                    </Fragment>
                    :
                    <Fragment>
                        <label class="form-label" htmlFor={id}>{label}</label>
                        {children}
                        {validation && <p className="form-input-hint">{validation.message}</p>}
                    </Fragment>
            }
        </div>
    )

}