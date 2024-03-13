"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import initThemes from "../../floro_modules/themes-generator/themes.json";
import { ThemeSet } from "../../floro_modules/themes-generator";
import { setCookie } from "~/client_helpers/cookie";

const defaultTheme: keyof ThemeSet = "light";

const ThemePreferenceContext = createContext<{
  selectColorTheme: (themePreference: "system" | keyof ThemeSet) => void;
  themePreference: "system" | keyof ThemeSet;
  currentTheme: keyof ThemeSet;
}>({
  themePreference: "system",
  selectColorTheme: (_themePreference: "system" | keyof ThemeSet) => {},
  currentTheme:
    (Object.keys(initThemes?.themeDefinitions)?.[0] as keyof ThemeSet) ??
    defaultTheme,
});

interface Props {
  children: React.ReactElement;
  initTheme?: keyof ThemeSet;
}

const useSystemThemePreference = () => {
  const [colorTheme, setColorTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setColorTheme("dark");
    } else {
      setColorTheme("light");
    }
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        const colorScheme = event.matches ? "dark" : "light";
        if (colorScheme == "dark") {
          setColorTheme("dark");
        } else {
          setColorTheme("light");
        }
      });
  }, []);
  return colorTheme;
};

export const ThemePreferenceProvider = (props: Props): React.ReactElement => {
  const [themePreference, setThemePreference] = useState<
    "system" | keyof ThemeSet
  >(props.initTheme ?? "system");

  const selectColorTheme = useCallback(
    (themePreference: "system" | keyof ThemeSet) => {
      setThemePreference(themePreference);
      setCookie("THEME_PREFERENCE", themePreference);
    },
    []
  );

  const systemColorTheme = useSystemThemePreference();
  const currentTheme = useMemo(() => {
    if (themePreference == "system") {
      if (!systemColorTheme) {
        return (
          (
            Object.keys(initThemes.themeDefinitions) as Array<keyof ThemeSet>
          )?.[0] ?? initThemes.themeDefinitions[defaultTheme]
        );
      }
      return initThemes.themeDefinitions[systemColorTheme as keyof ThemeSet]
        ?.name as keyof ThemeSet;
    }
    return themePreference as keyof ThemeSet;
  }, [themePreference, systemColorTheme]);

  return (
    <ThemePreferenceContext.Provider
      value={{
        themePreference,
        selectColorTheme,
        currentTheme,
      }}
    >
      {props.children}
    </ThemePreferenceContext.Provider>
  );
};

export const useThemePreference = () => {
  return useContext(ThemePreferenceContext);
};
