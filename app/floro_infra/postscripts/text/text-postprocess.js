require("./phrase-static-analysis");

const fs = require('fs');
const path = require('path');
const localesStatic = require('../../floro_modules/text-generator/locales.static.json');
const localesSet = new Set(localesStatic);
const textJSON = require('../../floro_modules/text-generator/text.json');

const localesStaticStructure = {};

for (const localeCode in textJSON.locales) {
  for (let phraseKey in textJSON.localizedPhraseKeys[localeCode]) {
    if (!localesSet.has(phraseKey)) {
      delete textJSON.localizedPhraseKeys[localeCode][phraseKey]
      delete textJSON.phraseKeyDebugInfo[phraseKey]
    } else {
      const argKeys = Object.keys(textJSON.localizedPhraseKeys[localeCode][phraseKey].args).sort();
      const args = {};
      for (const key of argKeys) {
        args[key] = textJSON.localizedPhraseKeys[localeCode][phraseKey].args[key];
      }
      localesStaticStructure[phraseKey] = args;
    }
  }
}

const shortHash = (str) => {
    let hash = 0;
    str = str.padEnd(8, "0");
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }
    return new Uint32Array([hash])[0].toString(16);
  };

const globalDefaultLocale = Object.values(textJSON.locales).find(l => l.isGlobalDefault);

const localizedPhraseKeysGlobalDefault = textJSON.localizedPhraseKeys[globalDefaultLocale.localeCode];

const defaultJSON = {
    locales: textJSON.locales,
    localizedPhraseKeys: {
        [globalDefaultLocale.localeCode]: localizedPhraseKeysGlobalDefault
    },
    phraseKeyDebugInfo: textJSON.phraseKeyDebugInfo
}

fs.writeFileSync(
  path.join(__dirname, "../../floro_modules/text-generator/server-text.json"),
  JSON.stringify(textJSON),
  "utf-8"
);

// write default locale json
fs.writeFileSync(
  path.join(__dirname, "../../floro_modules/text-generator/default.text.js"),
  "export default " + JSON.stringify(defaultJSON, null, 2),
  "utf-8"
);

const localesDirPath = path.join(__dirname, "../../../../public/locales");
const localesDirExists = fs.existsSync(localesDirPath);
if (localesDirExists) {
    fs.rmSync(localesDirPath, {recursive: true});
}
fs.mkdirSync(localesDirPath);

const localeJSONs = {};

for (const localeCode in textJSON.locales) {
    const locale = textJSON.locales[localeCode];
  if (locale.isGlobalDefault) {
    continue;
  }
  const jsonString = JSON.stringify(textJSON.localizedPhraseKeys[locale.localeCode]);
  const sha = shortHash(jsonString);
  const fileName = `${locale.localeCode}.${sha}.json`;
  const filePath = path.join(localesDirPath, fileName)
    fs.writeFileSync(
    filePath,
    jsonString,
    "utf-8"
    );
  localeJSONs[locale.localeCode] = fileName;
}

fs.writeFileSync(
  path.join(__dirname, "../../floro_modules/text-generator/locale.loads.json"),
  JSON.stringify(localeJSONs),
  "utf-8"
);

const hash = shortHash(JSON.stringify(localesStaticStructure, null, 2));

const staticStructure = {
  structure: localesStaticStructure,
  hash
}

fs.writeFileSync(
  path.join(__dirname, "../../floro_modules/text-generator/static-structure.json"),
  JSON.stringify(staticStructure),
  "utf-8"
);