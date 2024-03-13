import React, { useCallback, useMemo } from "react";
import {
  Locales,
  PhraseKeys,
  getDebugInfo,
  getPhraseValue,
} from "../floro_modules/text-generator";
import {
  RichTextProps,
  TextRenderers,
  richTextRenderers,
} from "../renderers/RichTextRenderer";
import {
  PlainTextRenderers,
  plainTextRenderers,
} from "../renderers/PlainTextRenderer";
import { useFloroText } from "../contexts/text/FloroTextContext";
import { useFloroLocales } from "../contexts/text/FloroLocalesContext";
import { useIsDebugMode } from "../contexts/FloroDebugProvider";
import RichTextComponent, {
  ARGS_COND,
  ARGS_DEF,
} from "../components/RichTextComponent";
import { useSSRPhraseKeyMemo } from "../contexts/FloroSSRPhraseKeyMemoProvider";

export interface TextDebugOptions {
  debugHex: `#${string}`;
  debugTextColorHex: string;
}

export type RTCallbackProps<K extends keyof PhraseKeys> = {
  renders?: TextRenderers<keyof PhraseKeys[K]["styledContents"] & string>;
  debugHex?: `#${string}`;
  debugTextColorHex?: `#${string}`;
  richTextOptions?: RichTextProps<K>;
} & ARGS_DEF<K>;

export const useRichText = <K extends keyof PhraseKeys>(phraseKey: K) => {
  const floroText = useFloroText();
  const isDebugMode = useIsDebugMode();
  const { selectedLocaleCode } = useFloroLocales();
  const debugInfo = useMemo(
    () => getDebugInfo(floroText.phraseKeyDebugInfo, phraseKey),
    [phraseKey, floroText.phraseKeyDebugInfo, floroText]
  );

  const ssrSet = useSSRPhraseKeyMemo();
  if (ssrSet && !ssrSet.has(phraseKey)) {
    ssrSet.add(phraseKey);
  }

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

export const usePlainText = <
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
) => {
  const args = opts[0] ?? ({} as ARGS);
  const renderers = opts?.[1] ?? plainTextRenderers;
  const floroText = useFloroText();
  const { selectedLocaleCode } = useFloroLocales();
  const debugInfo = useMemo(
    () => getDebugInfo(floroText.phraseKeyDebugInfo, phraseKey),
    [phraseKey, floroText.phraseKeyDebugInfo, floroText]
  );
  const ssrSet = useSSRPhraseKeyMemo();
  if (ssrSet && !ssrSet.has(phraseKey)) {
    ssrSet.add(phraseKey);
  }
  return useMemo(() => {
    const nodes = getPhraseValue<string, keyof Locales, K>(
      floroText,
      selectedLocaleCode,
      phraseKey,
      args
    );
    return renderers.render(
      nodes,
      renderers,
      debugInfo?.groupName,
      debugInfo?.phraseKey,
      selectedLocaleCode
    );
  }, [
    richTextRenderers,
    renderers,
    selectedLocaleCode,
    args,
    debugInfo?.groupName,
    debugInfo?.phraseKey,
  ]);
};
