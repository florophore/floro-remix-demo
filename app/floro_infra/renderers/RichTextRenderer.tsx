import React, { MouseEvent } from 'react';
import {
  StaticNode,
  StaticOrderedListNode,
  StaticUnOrderedListNode,
  StaticListNode,
  StaticLinkNode,
  StaticTextNode,
  StaticContentVariable,
  StaticStyledTextNode,
  PhraseKeys,
} from '../floro_modules/text-generator';
import { plainTextRenderers } from './PlainTextRenderer';

export interface RichTextProps<T extends keyof PhraseKeys | unknown> {
  onClickLink?: (
    linkName: T extends keyof PhraseKeys
      ? keyof PhraseKeys[T]["links"]
      : string,
    linkHref: string
  ) => void;
  linkColor?: string;
  styledContent?: {
    [Property in keyof (T extends keyof PhraseKeys
      ? PhraseKeys[T]["styleClasses"]
      : string)]?: string | undefined;
  };
}

export interface TextRenderers<N extends string> {
  render: (
    nodes: (
      | StaticNode<React.ReactElement>
      | StaticListNode<React.ReactElement>
    )[],
    renderers: TextRenderers<N>,
    phraseGroup: string,
    phraseKey: string,
    localeCode: string,
    richTextProps?: RichTextProps<unknown>,
  ) => React.ReactElement;
  renderStaticNodes: (
    nodes: (StaticNode<React.ReactElement> | StaticListNode<React.ReactElement>)[],
    renderers: TextRenderers<N>,
    richTextProps?: RichTextProps<unknown>,
  ) => React.ReactElement;
  renderText: (
    node: StaticTextNode<React.ReactElement>,
    renderers: TextRenderers<N>,
    richTextProps?: RichTextProps<unknown>,
  ) => React.ReactElement;
  renderLinkNode: (
    node: StaticLinkNode<React.ReactElement>,
    renderers: TextRenderers<N>,
    richTextProps?: RichTextProps<unknown>,
  ) => React.ReactElement;
  renderListNode: (
    node: StaticListNode<React.ReactElement>,
    renderers: TextRenderers<N>,
    richTextProps?: RichTextProps<unknown>,
  ) => React.ReactElement;
  renderUnOrderedListNode: (
    node: StaticUnOrderedListNode<React.ReactElement>,
    renderers: TextRenderers<N>,
    richTextProps?: RichTextProps<unknown>,
  ) => React.ReactElement;
  renderOrderedListNode: (
    node: StaticOrderedListNode<React.ReactElement>,
    renderers: TextRenderers<N>,
    richTextProps?: RichTextProps<unknown>,
  ) => React.ReactElement;
  renderStyledContentNode: (
    node: StaticStyledTextNode<React.ReactElement, N>,
    renderers: TextRenderers<N>,
    richTextProps?: RichTextProps<unknown>,
  ) => React.ReactElement;
  renderContentVariable: (
    node: StaticContentVariable<React.ReactElement>
  ) => React.ReactElement;
}

const renderStaticNodes = <N extends string>(
  nodes: (
    | StaticNode<React.ReactElement>
    | StaticListNode<React.ReactElement>
    | StaticContentVariable<React.ReactElement>
    | StaticStyledTextNode<React.ReactElement, N>
  )[],
  renderers: TextRenderers<N>,
  richTextProps?: RichTextProps<unknown>
): React.ReactElement => {
  return (
    <>
      {nodes?.map((staticNode, index) => {
        return (
          <React.Fragment key={index}>
            {staticNode.type == 'text' &&
              renderers.renderText(staticNode, renderers, richTextProps)}
            {staticNode.type == 'link' &&
              renderers.renderLinkNode(staticNode, renderers, richTextProps)}
            {staticNode.type == 'li' &&
              renderers.renderListNode(staticNode, renderers, richTextProps)}
            {staticNode.type == 'ul' &&
              renderers.renderUnOrderedListNode(
                staticNode,
                renderers,
                richTextProps
              )}
            {staticNode.type == 'ol' &&
              renderers.renderOrderedListNode(
                staticNode,
                renderers,
                richTextProps
              )}
            {staticNode.type == 'styled-content' &&
              renderers.renderStyledContentNode(staticNode, renderers, richTextProps)}
            {staticNode.type == 'content' &&
              renderers.renderContentVariable(staticNode)}
          </React.Fragment>
        );
      })}
    </>
  );
};

const renderText = <N extends string>(
  node: StaticTextNode<React.ReactElement>,
  renderers: TextRenderers<N>,
  richTextProps?: RichTextProps<unknown>,
) => {
  let children = renderers.renderStaticNodes(node.children, renderers, richTextProps);
  const lineBreaks = node?.content?.split?.("\n") ?? [];
  const breakContent = lineBreaks.map((c, i) => (
    <React.Fragment key={i}>
      {c}
      {lineBreaks.length -1 != i && (
        <br/>
      )}
    </React.Fragment>
  ));
  let content = (
    <>
      {breakContent}
      {children}
    </>
  );
  if (node.styles.isBold) {
    content = <b>{content}</b>;
  }
  if (node.styles.isItalic) {
    content = <i>{content}</i>;
  }
  if (node.styles.isUnderlined) {
    content = <u>{content}</u>;
  }
  if (node.styles.isStrikethrough) {
    content = <s>{content}</s>;
  }
  if (node.styles.isSuperscript) {
    content = <sup>{content}</sup>;
  }
  if (node.styles.isSubscript) {
    content = <sub>{content}</sub>;
  }
  return content;
};

const renderLinkNode = <N extends string>(
  node: StaticLinkNode<React.ReactElement>,
  renderers: TextRenderers<N>,
  richTextProps?: RichTextProps<unknown>,
): React.ReactElement => {
  let children = renderers.renderStaticNodes(node.children, renderers, richTextProps);

  if (richTextProps?.onClickLink) {
    const onPress = (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      richTextProps?.onClickLink?.(node.linkName, node.href);
    };
    return <a style={richTextProps?.linkColor ? {color: richTextProps.linkColor} : {}} href={node.href} onClick={onPress}>{children}</a>;
  }
  return <a style={richTextProps?.linkColor ? {color: richTextProps.linkColor} : {}} href={node.href}>{children}</a>;
};

const renderListNode = <N extends string>(
  node: StaticListNode<React.ReactElement>,
  renderers: TextRenderers<N>,
  richTextProps?: RichTextProps<unknown>,
): React.ReactElement => {
  let children = renderers.renderStaticNodes(node.children, renderers, richTextProps);
  return <li>{children}</li>;
};

const renderUnOrderedListNode = <N extends string,>(
  node: StaticUnOrderedListNode<React.ReactElement>,
  renderers: TextRenderers<N>,
  richTextProps?: RichTextProps<unknown>,
): React.ReactElement => {
  let children = renderers.renderStaticNodes(node.children, renderers, richTextProps);
  return <ul>{children}</ul>;
};

const renderOrderedListNode = <N extends string,>(
  node: StaticOrderedListNode<React.ReactElement>,
  renderers: TextRenderers<N>,
  richTextProps?: RichTextProps<unknown>,
): React.ReactElement => {
  let children = renderers.renderStaticNodes(node.children, renderers, richTextProps);
  return <ol>{children}</ol>;
};

const renderStyledContentNode = <N extends string,>(
  node: StaticStyledTextNode<React.ReactElement, N>,
  renderers: TextRenderers<N>,
  richTextProps?: RichTextProps<unknown>,
): React.ReactElement => {
  const ptNode: StaticStyledTextNode<string, string> = {
    ...node,
    styleClassFunction: (str) => {
      return str;
    }
  } as StaticStyledTextNode<string, string>;
  let plainTextChildren = plainTextRenderers.renderStyledContentNode(
    ptNode,
    plainTextRenderers
  );
  let children = renderers.renderStaticNodes(node.children, renderers, richTextProps);
  const content =
    node?.styleClassFunction?.(
      children,
      node.styledContentName,
      plainTextChildren
    ) ?? null;
  if (content) {
    if (
      richTextProps?.styledContent?.[
        node.styleClass as keyof typeof richTextProps.styledContent
      ]
    ) {
      return (
        <span
          className={
            richTextProps?.styledContent?.[
              node.styleClass as keyof typeof richTextProps.styledContent
            ]
          }
        >
          {content}
        </span>
      );
    }
    return content;
  }
  if (
    richTextProps?.styledContent?.[
      node.styleClass as keyof typeof richTextProps.styledContent
    ]
  ) {
    return (
      <span
        className={
          richTextProps?.styledContent?.[
            node.styleClass as keyof typeof richTextProps.styledContent
          ]
        }
      >
        {children}
      </span>
    );
  }
  return <>{children}</>;
};

const renderContentVariable = (
  node: StaticContentVariable<React.ReactElement>
): React.ReactElement => {
  return node.data ?? <></>;
};

const render = <N extends string>(
  nodes: (
    | StaticNode<React.ReactElement>
    | StaticListNode<React.ReactElement>
  )[],
  renderers: TextRenderers<N>,
  phraseGroup: string,
  phraseKey: string,
  localeCode: string,
  richTextProps?: RichTextProps<unknown>,
): React.ReactElement => {
  try {
    return renderers.renderStaticNodes(nodes, renderers, richTextProps);
  } catch(e) {
    console.log(
      "Rich Text Error",
      `Phrase Group: ${phraseGroup}, Phrase Key: ${phraseKey}, Locale Code: ${localeCode}`,
      "Error:",
      e
    );
    return <></>;
  }
};

export const richTextRenderers = {
  render,
  renderStaticNodes,
  renderText,
  renderLinkNode,
  renderListNode,
  renderUnOrderedListNode,
  renderOrderedListNode,
  renderStyledContentNode,
  renderContentVariable,
};
