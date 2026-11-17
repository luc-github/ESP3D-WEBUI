/*
 stub-targets.js - test-only replacement for src/targets/index.js

 The real module pulls the whole target UI (via TargetDir/SubTargetDir
 webpack aliases). The round-trip test only needs defaultPreferences,
 rebuilt here exactly like src/targets/index.js does (base + target +
 subtarget, short keys expanded), for the CNC/grblHAL target.
*/
import { mergeJSON } from "../src/components/Helpers/arrays"
import { expandShortKeys } from "../src/components/Helpers/preferencesKeys"
import defaultPreferencesBase from "../src/targets/preferences.json"
import defaultPreferencesTarget from "../src/targets/CNC/preferences.json"
import defaultPreferencesSubTarget from "../src/targets/CNC/grblHAL/preferences.json"

//Note: in this test bundle the shrink-preferences-loader is NOT applied,
//so keys are already long and expandShortKeys is an identity pass.
const defaultPreferences = mergeJSON(
    mergeJSON(
        expandShortKeys(defaultPreferencesBase),
        expandShortKeys(defaultPreferencesTarget)
    ),
    expandShortKeys(defaultPreferencesSubTarget)
)

export { defaultPreferences }
