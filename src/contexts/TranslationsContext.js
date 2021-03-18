/*
 TranslationsContext.js - ESP3D WebUI context file
 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
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
import LangRessourceBase from "../components/Translations/en.json";
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
    baseLangRessource,
  };
  return (
    <TranslationsContext.Provider value={store}>
      {children}
    </TranslationsContext.Provider>
  );
};

export { TranslationsContextProvider, useTranslationsContext };
