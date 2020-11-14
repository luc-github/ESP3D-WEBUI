export const getColClasses = ({ col, ...responsive }) => {
    const responsiveClasses =
        Object
            .keys(responsive)
            .reduce((acc, key, i) => i == 0 ? acc : `${acc} col-${key}-${responsive[key]}`, '')
    return `col-${col} ${responsiveClasses}`
}

/*
export const flattenNestedObjSchema = (arr) => {
    return Object.keys(arr).reduce((acc, cur) => {
        const element = arr[cur]
        if ('fields' in element) {
            const { fields, ...rest } = element
            return { ...acc, [cur]: { ...rest }, ...flattenNestedObjSchema(fields) }
        }
        return { ...acc, [cur]: { ...element } }
    }, {})
}
*/

export const mergeFlatPrefToNestedSchema = (settings, schema) => {
    // console.log('mergeFlatPrefToNestedSchema', JSON.stringify(settings))
    // console.log('mergeFlatPrefToNestedSchema schema', JSON.stringify(schema))
    return Object.keys(schema).reduce((acc, key) => {
        if ('fields' in schema[key]) return {
            ...acc, [key]: {
                ...schema[key],
                value: settings[key],
                fields: mergeFlatPrefToNestedSchema(settings, schema[key].fields)
            }
        }
        return { ...acc, [key]: { ...schema[key], value: settings[key] } }
    }, { ...schema })
}