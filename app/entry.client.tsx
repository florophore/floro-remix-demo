import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import FloroMount from "./floro_infra/contexts/FloroMount";
import { LocalizedPhrases } from "./floro_infra/floro_modules/text-generator";
import defaultText from "./floro_infra/floro_modules/text-generator/default.text";
import { getCookie } from "./client_helpers/cookie";
import { combineHydratedTextWithDefault } from "./floro_infra/hydration/texthydration";
import { ThemeSet } from "./floro_infra/floro_modules/themes-generator";

startTransition(() => {
  const initLocaleCode =
    (getCookie("LOCALE") as keyof LocalizedPhrases["locales"] & string) ??
    "EN";
  const text = combineHydratedTextWithDefault(
    initLocaleCode,
    window.__FLORO_TEXT__,
    defaultText as unknown as LocalizedPhrases
  );
  const initThemePreference =
    (getCookie("THEME_PREFERENCE") as keyof ThemeSet & string) ??
    "light";
  hydrateRoot(
    document,
    <StrictMode>
      <FloroMount
        cdnHost={window.__CDN_HOST__}
        text={text}
        initLocaleCode={initLocaleCode}
        localeLoads={window?.__FLORO_LOCALE_LOADS__ ?? {}}
        initThemePreference={initThemePreference}
      >
        <RemixBrowser />
      </FloroMount>
    </StrictMode>
  );
});
