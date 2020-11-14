import { h } from 'preact';
import { FormGroup } from './FormGroup'


export const Boolean = ({
    id,
    label,
    validation,
    value = false,
    type,
    // horizontal, 
    fields,
    ...rest }) => {
    const horizontal = false
    const formGroupProps = { label, name: id, id, validation, horizontal }
    const inputCheckboxProps = {
        name: id,
        id,
        checked: value,
        ...rest
    }
    return (
        horizontal ?
            <FormGroup name={id} {...formGroupProps} >
                <div class="form-switch">
                    <input type="checkbox" {...inputCheckboxProps} />
                    <i class="form-icon" />
                </div>
            </FormGroup>
            :
            <label class="form-switch">
                <input type="checkbox" {...inputCheckboxProps} />
                <i class="form-icon" /> {label}
            </label>
    )
}