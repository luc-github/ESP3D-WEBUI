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
import { h, createContext } from "preact";
import LangRessourceSubTarget from "TranslateSubTargetPath/en.json";
import LangRessourceTarget from "TranslateTargetPath/en.json";
import LangRessourceBase from "./en.json";
import { useContext, useState } from "preact/hooks";

/*
 * Local const
 *
 */
const baseLangRessource = {
  ...LangRessourceBase,
  ...LangRessourceTarget,
  ...LangRessourceSubTarget,
};
const TranslationsContext = createContext("TranslationsContext");
const useTranslationsContext = () => useContext(TranslationsContext);
const TranslationsContextProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(baseLangRessource);
  const store = {
    currentLanguage,
    setCurrentLanguage,
  };
  return (
    <TranslationsContext.Provider value={store}>
      {children}
    </TranslationsContext.Provider>
  );
};

/*
 * Give text from id according language selection
 * give languag base text if no corresponding id
 */
function T(id) {
  const { currentLanguage } = useTranslationsContext();
  let translatedText = currentLanguage[id];
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

export {
  useTranslationsContext,
  TranslationsContextProvider,
  T,
  baseLangRessource,
};
