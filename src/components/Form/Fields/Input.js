import { h } from 'preact';


export const Input = ({ label = '', type = 'text', id = '', value = '', horizontal, ...rest }) => {
    const props = {
        type,
        id,
        name: id,
        value
    }
    return <input class="form-input" {...props} placeholder="" {...rest} />

}