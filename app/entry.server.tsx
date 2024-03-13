// app/entry.server.tsx

import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import FloroTextStore from "./backend/FloroTextStore";
import { LocalizedPhrases } from "./floro_infra/floro_modules/text-generator";
import cookie from 'cookie';
import { ThemeSet } from "./floro_infra/floro_modules/themes-generator";
import FloroMount from "./floro_infra/contexts/FloroMount";
export default async function handleRequest(
  request: Request, // Request type from the Fetch API
  responseStatusCode: number,
  responseHeaders: Headers, // Headers type from the Fetch API
  remixContext: EntryContext
) {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookie.parse(cookieHeader ?? "{}");
  const localeCode = (cookies?.["LOCALE"] ??
    "EN") as keyof LocalizedPhrases["locales"] & string;
  const themePreference = cookies?.["THEME_PREFERENCE"] as
    | undefined
    | (keyof ThemeSet & string);
  const localeLoads = FloroTextStore.getInstance().getLocaleLoads();
  const text = FloroTextStore.getInstance().getText();
  const ssrPhraseKeySet = new Set<string>();
  const cdnHost = "";

  const App = (
    <FloroMount
      text={text}
      initLocaleCode={localeCode}
      cdnHost={""}
      localeLoads={localeLoads}
      initThemePreference={themePreference}
      ssrPhraseKeySet={ssrPhraseKeySet}
    >
      <RemixServer context={remixContext} url={request.url} />
    </FloroMount>
  );

  const fullText = JSON.stringify(text).replace(/</g, "\\u003c");

  const markup = renderToString(
    <>
      {App}
      <script
        dangerouslySetInnerHTML={{
          __html: `
        window.__CDN_HOST__="${cdnHost}";
        window.__FLORO_TEXT__=${fullText};
        window.__FLORO_LOCALE_LOADS__=${JSON.stringify(localeLoads).replace(
          /</g,
          "\\u003c"
        )};
        `,
        }}
      />
    </>
  );
  responseHeaders.set("Content-Type", "text/html");
  const abbreviatedText = FloroTextStore.getInstance()
    .getTextSubSet(localeCode, ssrPhraseKeySet)
    .replace(/</g, "\\u003c");
  const responseHtml = markup.replace(fullText, abbreviatedText)

  return new Response("<!DOCTYPE html>" + responseHtml, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}