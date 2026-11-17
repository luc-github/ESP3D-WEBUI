/*
 stub-helpers.js - test-only replacement for src/components/Helpers/index.js

 The real barrel pulls the whole UI dependency graph (contexts,
 translations, target aliases...). The preferences code under test only
 needs the pure settings helpers, re-exported here from their concrete
 modules so the real implementations are exercised.
*/
export { clone, reindexList, scanFlag, settingsStatus } from "../src/components/Helpers/settings/model"
export { fieldMeta } from "../src/components/Helpers/settings/listKinds"
