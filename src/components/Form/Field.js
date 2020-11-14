import { h } from 'preact';
import { FormGroup, Input, Select, Boolean } from './Fields'

export const Field = (props) => {
    const { type } = props;
    if (type === 'select') return <FormGroup {...props}><Select {...props} /></FormGroup>
    if (type === 'password') return <FormGroup {...props}><Input {...props} /></FormGroup>
    if (type === 'boolean') return <Boolean {...props} />
    return <FormGroup {...props}><Input {...props} /></FormGroup>
}
