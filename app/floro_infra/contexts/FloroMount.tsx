import React from "react";

import { LocalizedPhrases } from "../floro_modules/text-generator";

import { FloroDebugProvider } from "./FloroDebugProvider";
import { FloroTextProvider } from "./text/FloroTextContext";
import { FloroLocalesProvider } from "./text/FloroLocalesContext";
import { FloroPaletteProvider } from "./palette/FloroPaletteProvider";
import ThemeMount from "./themes/ThemeMount";
import { FloroIconsProvider } from "./icons/FloroIconsProvider";
import { ThemeSet } from "../floro_modules/themes-generator";
import { FloroSSRPhraseKeyMemoProvider } from "./FloroSSRPhraseKeyMemoProvider";

interface Props {
  children: React.ReactElement;
  text: LocalizedPhrases;
  initLocaleCode: keyof LocalizedPhrases["locales"] & string;
  initThemePreference?: keyof ThemeSet & string;
  cdnHost: string;
  localeLoads: { [key: string]: string };
  ssrPhraseKeySet?: Set<string>;
}

const FloroMount = (props: Props) => {
  return (
    <FloroDebugProvider>
      <FloroSSRPhraseKeyMemoProvider ssrPhraseKeySet={props.ssrPhraseKeySet}>
        <FloroPaletteProvider>
          <ThemeMount initTheme={props.initThemePreference}>
            <FloroIconsProvider>
              <FloroTextProvider
                text={props.text}
                cdnHost={props.cdnHost}
                localeLoads={props.localeLoads}
              >
                <FloroLocalesProvider initLocaleCode={props.initLocaleCode}>
                  {props.children}
                </FloroLocalesProvider>
              </FloroTextProvider>
            </FloroIconsProvider>
          </ThemeMount>
        </FloroPaletteProvider>
      </FloroSSRPhraseKeyMemoProvider>
    </FloroDebugProvider>
  );
};

export default FloroMount;
