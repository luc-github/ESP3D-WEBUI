/*
 buildlanguage.js - ESP3D WebUI language file builder

 Copyright (c) 2021 Luc Lebosse. All rights reserved.
 
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
const chalk = require("chalk")
const path = require("path")
const fs = require("fs")
const { Compress } = require("gzipper")

// Vérification des arguments
if (process.argv.length !== 3) {
    console.log(chalk.red("Usage: node buildlanguage.js <translation-file.json>"))
    process.exit(1)
}

const languageFile = process.argv[2]
const languagesPath = path.normalize(__dirname + "/../languages/")

// Liste des packs à traiter
const targetPacks = ["printerpack", "cncgrblpack", "cncgrblhalpack", "sandtablepack"]

// Lecture du fichier de traduction source
let translations
try {
    const translationPath = path.join(languagesPath, languageFile)
    const translationContent = fs.readFileSync(translationPath, "UTF-8")
    translations = JSON.parse(translationContent)
    console.log(chalk.green(`Loaded translations from ${languageFile}`))
} catch (error) {
    console.log(chalk.red(`Error loading translation file: ${error.message}`))
    process.exit(1)
}

// Fonction pour compresser un fichier
async function compressFile(filePath) {
    try {
        const sourceDir = path.dirname(filePath)
        const gzipper = new Compress(filePath, sourceDir, { verbose: false })
        await gzipper.run()
        
        // Renommer le fichier .gz pour correspondre au nom original
        fs.renameSync(`${filePath}.gz`, `${filePath}.gz`)
        
        const originalSize = fs.statSync(filePath).size
        const compressedSize = fs.statSync(`${filePath}.gz`).size
        
        // Afficher le message de génération du fichier gz
        console.log(chalk.green(`Generated ${path.basename(filePath)}.gz for ${path.basename(path.dirname(filePath))}`))
        
        console.log(chalk.blue(`Compression for ${path.basename(filePath)}:`))
        console.log(
            chalk.blue(
                `- Original: ${originalSize} Bytes => Compressed: ${compressedSize} Bytes`,
                `(${(100 - 100 * (compressedSize / originalSize)).toFixed(2)}% reduction)`
            )
        )
    } catch (error) {
        console.log(chalk.red(`Error compressing ${filePath}: ${error.message}`))
    }
}

// Traitement de chaque pack
const processAllPacks = async () => {
    for (const packName of targetPacks) {
        try {
            // Lecture du fichier en.json de référence pour ce pack
            const referenceFile = path.join(languagesPath, packName, "en.json")
            const referenceContent = fs.readFileSync(referenceFile, "UTF-8")
            const reference = JSON.parse(referenceContent)
            
            // Création du nouveau fichier de traduction
            const newTranslations = {}
            
            // Ajout de l'identifiant de la target
            newTranslations["target_lang"] = packName
            
            // Copy all reference keys; use "" when translation is missing or empty (for later translation/report)
            Object.keys(reference).forEach(key => {
                if (reference[key] === null) {
                    console.log(chalk.yellow(`Skipping key "${key}" in ${packName} - null value in reference`))
                    return
                }
                const translationValue = translations[key]
                newTranslations[key] =
                    translationValue != null && translationValue !== "" ? translationValue : ""
            })
            
            // Création du répertoire si nécessaire
            const outputDir = path.join(languagesPath, packName)
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true })
            }
            
            // Sauvegarde du nouveau fichier
            const outputFile = path.join(outputDir, languageFile)
            fs.writeFileSync(outputFile, JSON.stringify(newTranslations, null, 1), "UTF-8")
            
            console.log(chalk.green(`Generated ${languageFile} for ${packName}`))
            
            // Compression du fichier généré
            await compressFile(outputFile)
            
            // Affichage des statistiques
            const totalKeys = Object.keys(reference).filter((k) => reference[k] != null && reference[k] !== "").length
            const translatedKeys = Object.keys(newTranslations).filter(
                (k) => k !== "target_lang" && newTranslations[k] != null && newTranslations[k] !== ""
            ).length
            console.log(chalk.blue(`Statistics for ${packName}:`))
            console.log(chalk.blue(`- Total keys: ${totalKeys}`))
            console.log(chalk.blue(`- Translated keys: ${translatedKeys}`))
            console.log(chalk.blue(`- Translation completion: ${totalKeys ? ((translatedKeys / totalKeys) * 100).toFixed(2) : 0}%`))
            
        } catch (error) {
            console.log(chalk.red(`Error processing ${packName}: ${error.message}`))
        }
    }
}

// Exécution du script
processAllPacks().then(() => {
    console.log(chalk.green("Translation processing and compression completed"))
})