"use client"

import React, { useContext, useMemo, useState, useCallback } from "react";
import {
  LocalizedPhrases,
} from "../../floro_modules/text-generator";
import defaultText from "../../floro_modules/text-generator/default.text";
import { useFloroText } from "./FloroTextContext";
import { setCookie } from "~/client_helpers/cookie";

const FloroLocalesContext = React.createContext({
  localeCodes: Object.keys(defaultText.locales),
  locales: Object.values(defaultText.locales),
  selectedLocaleCode: Object.keys(defaultText.locales).find(
    (localeCode: string) => defaultText.locales[localeCode as keyof typeof defaultText.locales]?.isGlobalDefault
  ) as keyof LocalizedPhrases["locales"] & string,
  setSelectedLocaleCode: (_: keyof LocalizedPhrases["locales"] & string) => {},
});
export interface Props {
  children: React.ReactNode;
  initLocaleCode?: keyof LocalizedPhrases["locales"] & string;
}

export const FloroLocalesProvider = (props: Props) => {
  const floroText = useFloroText();
  const localeCodes = useMemo(() => {
    return Object.keys(floroText?.locales) as Array<
      keyof LocalizedPhrases["locales"] & string
    >;
  }, [floroText?.locales]);

  const locales = useMemo(() => {
    return Object.values(floroText?.locales) as Array<{
      name: string;
      localeCode: keyof LocalizedPhrases["locales"] & string;
      defaultFallbackCode: (keyof LocalizedPhrases["locales"] & string) | null;
      isGlobalDefault: boolean;
    }>;
  }, [floroText?.locales]);

  const defaultLocaleCode = useMemo(() => {
    return Object.keys(floroText?.locales)?.find((localeCode) => {
      if (floroText.locales[localeCode as keyof typeof floroText.locales]?.isGlobalDefault) {
        return true;
      }
      return false;
    }) as keyof LocalizedPhrases["locales"] & string;
  }, [floroText?.locales]);

  const [selectedLocaleCode, _setSelectedLocaleCode] = useState<
    keyof LocalizedPhrases["locales"] & string
  >(
    props?.initLocaleCode && !!floroText.locales?.[props?.initLocaleCode]
      ? props.initLocaleCode
      : defaultLocaleCode
  );

  const setSelectedLocaleCode = useCallback(
    (localeCode: keyof LocalizedPhrases["locales"] & string) => {
      _setSelectedLocaleCode(localeCode);
      setCookie("LOCALE", localeCode)
    },
    []
  );

  return (
    <FloroLocalesContext.Provider
      value={{
        locales,
        localeCodes,
        selectedLocaleCode,
        setSelectedLocaleCode,
      }}
    >
      {props.children}
    </FloroLocalesContext.Provider>
  );
};

export const useFloroLocales = () => {
  return useContext(FloroLocalesContext);
};