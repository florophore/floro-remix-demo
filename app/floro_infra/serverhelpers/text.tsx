import { useCallback, useMemo } from "react";
import RichTextComponent, { ARGS_COND, ARGS_DEF } from "../components/RichTextComponent";
import { useIsDebugMode } from "../contexts/FloroDebugProvider";
import {
  Locales,
  LocalizedPhraseKeys,
  LocalizedPhrases,
  PhraseKeyDebugInfo,
  PhraseKeys,
  getDebugInfo,
  getPhraseValue,
} from "../floro_modules/text-generator";
import {
  PlainTextRenderers,
  plainTextRenderers,
} from "../renderers/PlainTextRenderer";
import { RichTextProps, TextRenderers, richTextRenderers } from "../renderers/RichTextRenderer";
import { RTCallbackProps } from "../hooks/text";
import staticStructure from "~/floro_infra/floro_modules/text-generator/static-structure.json";
import initText from "~/floro_infra/floro_modules/text-generator/server-text.json";

export const getPlainTextValue = <
  K extends keyof PhraseKeys,
  ARGS extends {
    [KV in keyof PhraseKeys[K]["variables"]]: PhraseKeys[K]["variables"][KV];
  } & {
    [KCV in keyof PhraseKeys[K]["contentVariables"]]: string;
  } & {
    [KSC in keyof PhraseKeys[K]["styleClasses"]]: (
      content: string,
      styledContentName: keyof PhraseKeys[K]["styledContents"] & string
    ) => string;
  }
>(
  floroText: LocalizedPhrases,
  selectedLocaleCode: keyof LocalizedPhrases["locales"] & string,
  phraseKey: K,
  ...opts: keyof ARGS extends { length: 0 }
    ? [
        ARGS?,
        PlainTextRenderers<keyof PhraseKeys[K]["styledContents"] & string>?
      ]
    : [
        ARGS,
        PlainTextRenderers<keyof PhraseKeys[K]["styledContents"] & string>?
      ]
): string => {
  const args = opts[0] ?? ({} as ARGS);
  const renderers = opts?.[1] ?? plainTextRenderers;
  const nodes = getPhraseValue<string, keyof Locales, K>(
    floroText,
    selectedLocaleCode,
    phraseKey,
    args
  );
  const debugInfo = getDebugInfo(floroText.phraseKeyDebugInfo, phraseKey);
  return renderers.render(
    nodes,
    renderers,
    debugInfo.groupName,
    debugInfo.phraseKey,
    selectedLocaleCode
  );
};

export const getRichText = <K extends keyof PhraseKeys>(
  floroText: LocalizedPhrases,
  selectedLocaleCode: keyof LocalizedPhrases["locales"] & string,
  phraseKey: K,
  ) => {
  const isDebugMode = useIsDebugMode();
  const debugInfo = useMemo(
    () => getDebugInfo(floroText.phraseKeyDebugInfo, phraseKey),
    [phraseKey, floroText.phraseKeyDebugInfo, floroText]
  );

  const callback = useCallback(
    (
      args: ARGS_DEF<K>,
      renderers: TextRenderers<keyof PhraseKeys[K]["styledContents"] & string>,
      richTextOptions?: RichTextProps<K>
    ) => {
      const nodes = getPhraseValue<React.ReactElement, keyof Locales, K>(
        floroText,
        selectedLocaleCode,
        phraseKey,
        args
      );
      const _renderers: TextRenderers<
        keyof PhraseKeys[K]["styledContents"] & string
      > = {
        ...(richTextRenderers ?? {}),
        ...(renderers ?? {}),
      };
      return _renderers.render(
        nodes,
        _renderers,
        debugInfo?.groupName,
        debugInfo?.phraseKey,
        selectedLocaleCode,
        richTextOptions
      );
    },
    [floroText, selectedLocaleCode, debugInfo, phraseKey]
  );
  return useCallback(
    (props: RTCallbackProps<K>) => {
      const { renders, richTextOptions, ...args } = props;
      return (
        <RichTextComponent
          isDebugMode={isDebugMode}
          callback={callback}
          phraseKey={phraseKey}
          renders={
            renders as TextRenderers<
              keyof PhraseKeys[K]["styledContents"] & string
            >
          }
          debugInfo={debugInfo}
          args={args as ARGS_COND<K>}
          debugHex={props.debugHex}
          debugTextColorHex={props.debugTextColorHex}
          richTextOptions={richTextOptions}
        />
      );
    },
    [isDebugMode, callback, phraseKey, selectedLocaleCode]
  );
};

const argsAreSame = (
  existingArgs: { [key: string]: string | number | boolean },
  incomingArgs: { [key: string]: string | number | boolean }
): boolean => {
  if (Object.keys(existingArgs).length != Object.keys(incomingArgs).length) {
    return false;
  }
  for (const key in existingArgs) {
    if (incomingArgs?.[key] != existingArgs[key]) {
      return false;
    }
  }
  return true;
};

export const getUpdatedText = (localesJSON: LocalizedPhrases): LocalizedPhrases => {
  for (const localeCode in localesJSON.locales) {
    const localesJSONPhraseKeys =
      (localesJSON.localizedPhraseKeys?.[
        localeCode as string & keyof typeof localesJSON.localizedPhraseKeys
      ]) as unknown as LocalizedPhraseKeys ?? ({} as LocalizedPhraseKeys);
    const initJSONPhraseKeys =
      (initText.localizedPhraseKeys?.[
        localeCode as string & keyof typeof localesJSON.localizedPhraseKeys
      ] as unknown as LocalizedPhraseKeys) ?? {} as LocalizedPhraseKeys;
    for (let phraseKey in staticStructure.structure) {
      if (
        !localesJSONPhraseKeys?.[
          phraseKey as keyof typeof localesJSONPhraseKeys
        ]
      ) {
        localesJSONPhraseKeys[phraseKey as keyof typeof localesJSONPhraseKeys] =
          initJSONPhraseKeys[phraseKey as keyof typeof localesJSONPhraseKeys];
      } else {
        if (
          !argsAreSame(
            (
              staticStructure?.structure as {
                [key: string]: { [key: string]: string | number | boolean };
              }
            )?.[phraseKey as string] as {
              [key: string]: string | number | boolean;
            },
            localesJSONPhraseKeys[
              phraseKey as keyof typeof localesJSONPhraseKeys & keyof PhraseKeys
            ]?.["args"] as {
              [key: string]: string | number | boolean;
            }
          )
        ) {
          localesJSONPhraseKeys[
            phraseKey as keyof typeof localesJSONPhraseKeys
          ] =
            initJSONPhraseKeys[phraseKey as keyof typeof localesJSONPhraseKeys];
        }
      }
    }
    for (let phraseKey in localesJSONPhraseKeys) {
      if (
        !staticStructure.structure[
          phraseKey as keyof typeof staticStructure.structure
        ] as boolean
      ) {
        const partialLocalesJSON = localesJSONPhraseKeys as Partial<PhraseKeys>;
        const partialDebugInfo =
          localesJSON.phraseKeyDebugInfo as Partial<PhraseKeyDebugInfo>;
        delete partialLocalesJSON[phraseKey as keyof PhraseKeys];
        delete partialDebugInfo[phraseKey as keyof PhraseKeys];
      }
    }
  }
  return localesJSON;
};


export const shortHash = (str: string) => {
  let hash = 0;
  str = str.padEnd(8, "0");
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }
  return new Uint32Array([hash])[0].toString(16);
};