"use client"

import React, { useContext, useEffect, useState } from "react";
import metaFile from "../../floro_modules/meta.floro";
import { LocalizedPhrases, PhraseKeys } from "../../floro_modules/text-generator";
import defaultText from "../../floro_modules/text-generator/default.text";
import { getJSON } from "@floro/text-generator";
import { useWatchFloroState } from "../../hooks/watch";

const FloroTextContext = React.createContext(defaultText as unknown as LocalizedPhrases);

interface Props {
  children: React.ReactElement;
  text: LocalizedPhrases;
  cdnHost: string;
  localeLoads: {[key: string]: string}
}

export const FloroTextProvider = (props: Props) => {
  const [text, setText] = useState<LocalizedPhrases>(props.text as unknown as LocalizedPhrases);

  useEffect(() => {
    (async () => {
      const promises: Promise<null|{localeCode: keyof LocalizedPhrases["localizedPhraseKeys"], phraseKeys: PhraseKeys}>[] = [];
      for (const localeCode in props.localeLoads) {
        promises.push(
          (async () => {
            const phraseKeysRequest = await fetch(`${props?.cdnHost ?? ""}/locales/${props.localeLoads[localeCode]}`);
            if (!phraseKeysRequest.ok) {
              return null;
            }
            const phraseKeys = await phraseKeysRequest.json() as PhraseKeys;
            text.localizedPhraseKeys[localeCode as keyof typeof text.localizedPhraseKeys] = phraseKeys;
            return {
              localeCode: localeCode as keyof LocalizedPhrases["localizedPhraseKeys"],
              phraseKeys
            }
          })()
        )
      }
      const result = await Promise.all(promises)
      const nextText = result.reduce((text, localeInfo) => {
        if (!localeInfo){
          return text;
        }
        text.localizedPhraseKeys[localeInfo.localeCode] = localeInfo?.phraseKeys;
        return text;
      }, text)
      setText({...nextText});
    })()
  }, []);

  const watchedText = useWatchFloroState(metaFile.repositoryId, text, getJSON);
  return (
    <FloroTextContext.Provider value={watchedText}>
      {props.children}
    </FloroTextContext.Provider>
  );
};

export const useFloroText = () => {
  return useContext(FloroTextContext);
};
