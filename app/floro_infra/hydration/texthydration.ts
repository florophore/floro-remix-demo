import { LocalizedPhrases } from "../floro_modules/text-generator";

export const combineHydratedTextWithDefault = (
  hydrationLocaleCode: keyof LocalizedPhrases["locales"] & string,
  hyrationText: LocalizedPhrases,
  defaultText: LocalizedPhrases
): LocalizedPhrases => {
  if (!hyrationText) {
    return defaultText;
  }
  if (
    defaultText?.localizedPhraseKeys?.[hydrationLocaleCode] &&
    hyrationText?.localizedPhraseKeys?.[hydrationLocaleCode]
  ) {
    return {
      ...hyrationText,
      localizedPhraseKeys: {
        ...defaultText.localizedPhraseKeys,
        ...hyrationText.localizedPhraseKeys,
        [hydrationLocaleCode]: {
          ...defaultText.localizedPhraseKeys[hydrationLocaleCode],
          ...hyrationText.localizedPhraseKeys[hydrationLocaleCode],
        },
      },
      phraseKeyDebugInfo: {
        ...defaultText.phraseKeyDebugInfo,
        ...hyrationText.phraseKeyDebugInfo,
      },
    };
  }
  return {
    ...hyrationText,
    localizedPhraseKeys: {
      ...defaultText.localizedPhraseKeys,
      ...hyrationText.localizedPhraseKeys,
    },
    phraseKeyDebugInfo: {
      ...defaultText.phraseKeyDebugInfo,
      ...hyrationText.phraseKeyDebugInfo,
    },
  };
};