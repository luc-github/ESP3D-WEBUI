/*
 index.js - ESP3D WebUI translations engine
 Copyright (c) 2020 Luc Lebosse. All rights reserved.
 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.
 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.
 You should have received a copy of the GNU Lesser General Public
 License along with This code; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
import { h } from "preact";
import { useTranslationsReferences } from "../../contexts";
import listLanguagePacks from "./languages.json";

/*
 * Give text from id according language selection
 * give language base text if no corresponding id
 */
function T(id, base = false, ressourcelanguage = null) {
  const { currentLanguage, baseLangRessource } = useTranslationsReferences;
  let translatedText = base
    ? baseLangRessource[id]
    : ressourcelanguage
    ? ressourcelanguage[id]
    : currentLanguage[id];
  if (!id || typeof id == "object" || !isNaN(id) || !isNaN(id.charAt(0)))
    return id;
  if (typeof translatedText === "undefined") {
    translatedText = baseLangRessource[id];
    if (typeof translatedText === "undefined") {
      translatedText = id;
    }
  }
  return translatedText;
}

function getLanguageName(languagePack) {
  const id = languagePack.replace("lang-", "").replace(".json", "");
  let lang = listLanguagePacks[id];
  if (!id || typeof id == "object" || !isNaN(id) || !isNaN(id.charAt(0)))
    return id;
  if (typeof lang === "undefined") return languagePack;
  return lang;
}

export { T, getLanguageName };
