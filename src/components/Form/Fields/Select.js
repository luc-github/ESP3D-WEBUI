import { h } from 'preact';
import { FormGroup } from './FormGroup'

const Option = ({ label, ...props }) => <option {...props} >{label}</option>

export const Select = ({ label = '', id = '', options = [], horizontal, value, ...rest }) => {

    const optionList = options.map(option => <Option {...option} />)
    const props = {
        id,
        name: id,
    }
    const isValid = null
    return (
        <select class="form-select" {...props} {...rest} value={value}>
            {optionList}
        </select>
    )
}

