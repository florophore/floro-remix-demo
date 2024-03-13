"use client"

import { MouseEvent, useCallback, useMemo, useState } from "react";
import { DebugInfo, PhraseKeys } from "../floro_modules/text-generator";
import { RichTextProps, TextRenderers } from "../renderers/RichTextRenderer";
import metaFloro from "../floro_modules/meta.floro";

export declare type ARGS_DEF<K extends keyof PhraseKeys> = {
  [KV in keyof PhraseKeys[K]["variables"]]: PhraseKeys[K]["variables"][KV];
} & {
  [KCV in keyof PhraseKeys[K]["contentVariables"]]: React.ReactElement;
} & {
  [KSC in keyof PhraseKeys[K]["styleClasses"]]: (
    content: React.ReactElement,
    styledContentName: keyof PhraseKeys[K]["styledContents"] & string,
    plainText?: string
  ) => React.ReactElement;
};

export declare type ARGS_COND<K extends keyof PhraseKeys> =
  keyof ARGS_DEF<K> extends {
    length: 0;
  }
    ? never
    : ARGS_DEF<K>;

interface RTProps<K extends keyof PhraseKeys> {
  callback: (
    args: ARGS_DEF<K>,
    renderers: TextRenderers<keyof PhraseKeys[K]["styledContents"] & string>,
    richTextOptions?: RichTextProps<K>
  ) => React.ReactElement;
  isDebugMode: boolean;
  debugInfo: DebugInfo;
  phraseKey: string;
  renders: TextRenderers<keyof PhraseKeys[K]["styledContents"] & string>;
  args: ARGS_COND<K>;
  debugHex?: string;
  debugTextColorHex?: string;
  richTextOptions?: RichTextProps<K>;
}

const RichTextComponent = <K extends keyof PhraseKeys>(props: RTProps<K>) => {
  const debugHex = props.debugHex ?? "#FF0000";
  const debugTextColorHex = props.debugTextColorHex ?? "white";

  const [isHovering, setIsHovering] = useState(false);
  const [forceHide, setForceHide] = useState(false);
  const textContent = useMemo(() => {
    return props.callback(
      props.args,
      props.renders,
      props.richTextOptions
    );
  }, [props.callback, props.isDebugMode, props.args, props.renders, props.richTextOptions]);

  const onShow = useCallback((e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    setIsHovering(true);
  }, [])

  const onHide = useCallback((e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    setIsHovering(false);
    setForceHide(false);
  }, [isHovering])

  const onClose = useCallback((e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    setForceHide(true);
  }, []);

  const onOpenAgain = useCallback((e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    setForceHide(false);
  }, []);

  const showDebugWindow = useMemo(() => {
    if (forceHide) {
      return false;
    }
    return isHovering;
  }, [isHovering, forceHide]);

  if (props.isDebugMode) {
    return (
      <span
        onMouseEnter={onShow}
        onMouseLeave={onHide}
        onClick={onOpenAgain}
        style={{
          position: "relative",
          boxShadow: `inset 0px 0px 0px 1px ${debugHex}`,
          display: "inherit",
          fontFamily: "inherit",
        }}
      >
        {textContent}
        {showDebugWindow && (
          <span
            style={{
              position: "absolute",
              top: 0,
              background: `${debugHex}CC`,
              padding: 8,
              color: debugTextColorHex,
              fontWeight: 500,
              fontSize: "1.2rem",
              fontFamily: "inherit",
              zIndex: 1000
            }}
          >
            <span
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <span style={{ display: "block" }}>
                <span style={{ display: "block" }}>
                  {"Phrase Group: "}
                  <b>{props.debugInfo.groupName}</b>
                </span>
                <span style={{ display: "block" }}>
                  {"Phrase Key: "}
                  <b>{props.debugInfo.phraseKey}</b>
                </span>
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    const channel = new BroadcastChannel(
                      "floro:plugin:message"
                    );
                    channel.postMessage({
                      repositoryId: metaFloro.repositoryId,
                      plugin: "text",
                      eventName: "open:phrase",
                      message: {
                        ...props.debugInfo,
                      },
                    });
                  }}
                  style={{
                    display: "block",
                    textDecoration: "underline",
                    marginTop: 4,
                    cursor: "pointer",
                  }}
                >
                  <b>{"OPEN"}</b>
                </span>
              </span>
              <span style={{ marginLeft: 24, display: "block" }}>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={onClose}
                >
                  {"X"}
                </span>
              </span>
            </span>
          </span>
        )}
      </span>
    );
  }
  return textContent;
};

export default RichTextComponent;
