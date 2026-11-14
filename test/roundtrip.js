/*
 roundtrip.js - offline test of the preferences import/export round-trip

 Covers the single-representation refactor (palier C / R3):
 - load flow: flat defaults -> formatPreferences -> formatted lists
 - export -> import into already-formatted settings -> formatPreferences
   -> export again: must be identical (UI import flow)
 - export -> import into raw defaults -> formatPreferences -> export:
   must be identical (ESP load flow with a saved preferences.json)
 - re-running formatPreferences on formatted settings must NOT wipe
   runtime flags (hasmodified / editionMode) nor corrupt values
 - export shapes for verbosefilters / panelsorder / extracontents
 - formatItem: openonstart injection and newItem flags

 Run: npm run test:roundtrip
*/
import "./shim"
import {
    formatPreferences,
    importPreferencesSection,
    formatItem,
} from "../src/tabs/interface/importHelper"
import { exportPreferencesSection } from "../src/tabs/interface/exportHelper"
import { defaultPreferences } from "./stub-targets"

const clone = (o) => JSON.parse(JSON.stringify(o))

//order-insensitive deep equality
const canon = (o) => {
    if (Array.isArray(o)) return o.map(canon)
    if (o && typeof o === "object") {
        const r = {}
        Object.keys(o)
            .sort()
            .forEach((k) => {
                r[k] = canon(o[k])
            })
        return r
    }
    return o
}
const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b))

let failures = 0
const check = (name, cond, detail) => {
    if (cond) {
        console.log("ok   - " + name)
    } else {
        failures++
        console.log("FAIL - " + name + (detail ? " :: " + detail : ""))
    }
}

//collect every { listEl, listId } in a settings section tree
const collectLists = (settings) => {
    const lists = []
    for (const key in settings) {
        const arr = settings[key]
        if (!Array.isArray(arr)) continue
        arr.forEach((el) => {
            if (!el || !el.id) return
            if (el.type === "list") lists.push({ listEl: el, listId: el.id })
            if (el.type === "group" && Array.isArray(el.value)) {
                el.value.forEach((child) => {
                    if (child && child.type === "list")
                        lists.push({ listEl: child, listId: child.id })
                })
            }
        })
    }
    return lists
}

const isFormattedItem = (item) =>
    item &&
    Array.isArray(item.value) &&
    item.value.length > 0 &&
    typeof item.value[0] === "object" &&
    item.value[0] !== null &&
    item.value[0].name !== undefined

//------------------------------------------------------------------
// 1 - Load flow: formatPreferences expands flat defaults
//------------------------------------------------------------------
const settings = clone(defaultPreferences.settings)
formatPreferences(settings)

const lists = collectLists(settings)
check("found editable lists in defaults", lists.length >= 4, "nb=" + lists.length)

let allFormatted = true
let badNb = false
lists.forEach(({ listEl }) => {
    if (listEl.nb !== listEl.value.length) badNb = true
    listEl.value.forEach((item) => {
        if (!isFormattedItem(item)) allFormatted = false
    })
})
check("all list items formatted after load", allFormatted)
check("list nb matches item count", !badNb)

//every sub-field carries editor metadata
let metaOk = true
lists.forEach(({ listEl }) => {
    listEl.value.forEach((item) => {
        item.value.forEach((sf) => {
            if (typeof sf.name !== "string" || !sf.type || sf.label === undefined)
                metaOk = false
        })
    })
})
check("every sub-field has name/type/label", metaOk)

//extracontents: openonstart injected even when absent from defaults
const extraList = lists.find((l) => l.listId === "extracontents")
if (extraList) {
    const missing = extraList.listEl.value.filter(
        (item) => !item.value.some((sf) => sf.name === "openonstart")
    )
    check("extracontents items all have openonstart", missing.length === 0)
} else {
    check("extracontents list exists", false)
}

//------------------------------------------------------------------
// 2 - Export A (reference)
//------------------------------------------------------------------
const exportA = exportPreferencesSection(settings, true)
check("export A has settings keys", Object.keys(exportA).length > 10)

//export shapes per list kind
if (Array.isArray(exportA.verbosefilters)) {
    const ok = exportA.verbosefilters.every((f) =>
        Object.keys(f).every((k) => k === "type" || k === "value")
    )
    check("verbosefilters export is {type,value} only", ok)
}
if (Array.isArray(exportA.panelsorder)) {
    const ok = exportA.panelsorder.every((p) =>
        Object.keys(p).every((k) => k === "id" || k === "name")
    )
    check("panelsorder export is {id,name} only", ok)
}
if (Array.isArray(exportA.extracontents)) {
    const metadata = ["owner", "version", "github", "description", "supportedVersion", "targetSystem"]
    const ok = exportA.extracontents.every(
        (p) => !metadata.some((k) => k in p)
    )
    check("extracontents export strips extension metadata", ok)
}

//------------------------------------------------------------------
// 3 - UI import flow: import exportA into the formatted settings
//------------------------------------------------------------------
const [afterImport, importErrors] = importPreferencesSection(settings, exportA)
check("UI import reports no error", importErrors === false)
formatPreferences(afterImport)
const exportB = exportPreferencesSection(afterImport, true)
check("round-trip UI import/export is stable", same(exportA, exportB))

//------------------------------------------------------------------
// 4 - Re-format must preserve runtime flags and not corrupt values
//------------------------------------------------------------------
const anyList = collectLists(afterImport).find(
    (l) => l.listEl.value.length > 0
)
if (anyList) {
    const item = anyList.listEl.value[0]
    const field = item.value[0]
    field.hasmodified = true
    item.editionMode = true
    formatPreferences(afterImport)
    check(
        "re-format keeps hasmodified flag",
        anyList.listEl.value[0].value[0].hasmodified === true
    )
    check(
        "re-format keeps editionMode flag",
        anyList.listEl.value[0].editionMode === true
    )
    check(
        "re-format keeps formatted shape (no double-nesting)",
        isFormattedItem(anyList.listEl.value[0]) &&
            typeof anyList.listEl.value[0].value[0].value !== "object"
    )
} else {
    check("non-empty list available for flag test", false)
}

//------------------------------------------------------------------
// 5 - ESP load flow: import exportA into raw defaults
//------------------------------------------------------------------
const rawDefaults = clone(defaultPreferences.settings)
const [merged, loadErrors] = importPreferencesSection(rawDefaults, exportA)
check("ESP load import reports no error", loadErrors === false)
formatPreferences(merged)
const exportC = exportPreferencesSection(merged, true)
check("round-trip ESP load/export is stable", same(exportA, exportC))

//------------------------------------------------------------------
// 6 - formatItem: new item flags and openonstart injection
//------------------------------------------------------------------
const newPanel = formatItem(
    {
        id: "x1",
        name: "Test panel",
        icon: "Star",
        target: "panel",
        source: "/test",
        type: "content",
        refreshtime: "0",
    },
    -1,
    "extracontents"
)
check(
    "openonstart injected on legacy extracontents item",
    newPanel.value.some((sf) => sf.name === "openonstart" && sf.value === true)
)
check(
    "newItem flag set on every sub-field",
    //use an item that already has openonstart: no injection, all fields flagged
    formatItem(
        { id: "x3", name: "p", icon: "Star", target: "panel", source: "/t", type: "content", refreshtime: "0", openonstart: true },
        -1,
        "extracontents"
    ).value.every((sf) => sf.newItem === true)
)
check(
    "openonstart not duplicated when already present",
    formatItem(
        { id: "x2", name: "p", icon: "Star", target: "panel", source: "/t", type: "content", refreshtime: "0", openonstart: false },
        -1,
        "extracontents"
    ).value.filter((sf) => sf.name === "openonstart").length === 1
)

const newMacro = formatItem(
    { id: "m1", name: "Macro 1", icon: "Star", type: "CMD", cmds: "G28" },
    -1,
    "macros"
)
const macroType = newMacro.value.find((sf) => sf.name === "type")
check(
    "macro type has 4 options",
    macroType && Array.isArray(macroType.options) && macroType.options.length === 4
)
check(
    "macro FS option keeps its depend block",
    macroType &&
        macroType.options.some(
            (o) => o.value === "FS" && Array.isArray(o.depend) && o.depend.length === 3
        )
)

//------------------------------------------------------------------
console.log(
    failures === 0
        ? "\nAll round-trip tests passed"
        : "\n" + failures + " test(s) FAILED"
)
process.exit(failures === 0 ? 0 : 1)
