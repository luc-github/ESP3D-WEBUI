/**
 * @todo Handle languages field options exception
 * @todo Add validation
 * @todo Add data fetch
 * @todo Add data submitting
 * @todo Handle schema changing (print vs cnc)
 */

import { h } from 'preact'
import { useState } from 'preact/hooks'
import printerSchema from '../../../../constants/printer-schema.json'
import { settings as preferences } from '../../../../constants/preferences.json'
import { InterfaceSettingsForm } from './InterfaceSettingsForm.js'

const InterfaceTab = () => {
    const [activeSchema, setActiveSchema] = useState(printerSchema)

    return (
        <div>
            {activeSchema.settings &&
                <InterfaceSettingsForm
                    preferences={preferences}
                    schema={printerSchema.settings} />}
        </div>
    )
}
export default InterfaceTab