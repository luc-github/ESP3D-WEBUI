const getFieldTypeName = ({ label, type, options }) => {
    if (options !== undefined) return 'select' //boolean
    if (type === "B") return 'select' //boolean
    if (type === "I") return 'number' //integer
    if (type === "F") return 'select' // float
    if (type === "S" && label === 'pwd') return 'password'
    if (type === "S") return 'text'
    return 'text'
}

const generateFormattedSelectOptionList = (rawOpt) => {
    return [...rawOpt].map((opt) => {
        const key = Object.keys(opt)[0]
        return ({ label: key, value: opt[key] })
    })
}

const formatSettingItem = (settingItem) => {
    const { F, P: id, T, V, H, O: options } = settingItem
    let settingFieldProps = {
        id: `${id}`,
        label: H,
        type: T,
        value: V
    }
    if (Array.isArray(options) && options !== undefined) settingFieldProps.options = generateFormattedSelectOptionList(options)
    settingFieldProps.type = getFieldTypeName(settingFieldProps)
    return settingFieldProps
}

export const settingsState = (settings) => settings.reduce((acc, curVal) => {
    const settingField = formatSettingItem(curVal)
    return ({ ...acc, [settingField.id]: settingField })
}, {})

export const settingsFormatter = (settings) => settings.reduce((acc, curVal) => {
    const { F } = curVal
    const settingField = formatSettingItem(curVal)
    const [section, subSection] = F.split('/')
    if (Object.prototype.hasOwnProperty.call(acc, section)) { //if section exist
        if (Object.prototype.hasOwnProperty.call(acc[section], subSection)) { // if subsection exist
            const fields = [...acc[section][subSection], settingField.id]
            return { ...acc, [section]: { ...acc[section], [subSection]: [...fields] } }
        }
        //else
        return { ...acc, [section]: { ...acc[section], [subSection]: [settingField.id] } }

    }
    return { ...acc, [section]: { [subSection]: [settingField.id] } }
}, {})