/*
 verboseFilters.js - ESP3D WebUI helper file

 Copyright (c) 2026 Luc Lebosse. All rights reserved.
*/

import { h } from "preact"

const matchVerboseFilter = (line, rule, semanticMatchers = {}) => {
    if (!rule || !rule.match) return false

    const text = typeof rule.text === "string" ? rule.text : ""

    switch (rule.match) {
        case "startswith":
            return line.startsWith(text)
        case "endswith":
            return line.endsWith(text)
        case "contain":
            return line.includes(text)
        case "regex":
            try {
                return new RegExp(text).test(line)
            } catch (error) {
                return false
            }
        default:
            if (typeof semanticMatchers[rule.match] === "function") {
                return semanticMatchers[rule.match](line, rule)
            }
            return false
    }
}

const normalizeVerboseFilters = (rules) => {
    if (!Array.isArray(rules)) return []

    return rules.map((rule) => {
        if (rule && Array.isArray(rule.value)) {
            return rule.value.reduce(
                (acc, field) => {
                    acc[field.name] = field.value
                    return acc
                },
                { id: rule.id }
            )
        }

        return rule
    })
}

const hasMatchingVerboseFilter = (line, rules, semanticMatchers = {}) => {
    const normalizedRules = normalizeVerboseFilters(rules)
    if (normalizedRules.length === 0) return false

    return normalizedRules.some((rule) =>
        matchVerboseFilter(line, rule, semanticMatchers)
    )
}

export { matchVerboseFilter, hasMatchingVerboseFilter, normalizeVerboseFilters }
