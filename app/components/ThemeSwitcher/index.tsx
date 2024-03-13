import React, { useMemo, useCallback } from "react";
import { useThemePreference } from "../../floro_infra/contexts/themes/ThemePreferenceProvider";
import { useIcon } from "../../floro_infra/contexts/icons/FloroIconsProvider";
import { useFloroPalette } from "../../floro_infra/contexts/palette/FloroPaletteProvider";

const ThemeSwitcher = () => {
  const { currentTheme, selectColorTheme } = useThemePreference();

  const sunIcon = useIcon("front-page.sun");
  const moonIcon = useIcon("front-page.moon");
  const palette = useFloroPalette();

  const isLight = useMemo(() => {
    return currentTheme == "light";
  }, [currentTheme]);

  const onToggle = useCallback(() => {
    if (currentTheme == "light") {
      selectColorTheme("dark");
    } else {
      selectColorTheme("light");
    }
  }, [currentTheme]);

  return (
    <div className={"theme-wrapper"}>
      <div className={"toggle-wrapper"} onClick={onToggle}>
        <div
          className={"switch-toggle"}
          style={{
            left: isLight ? 2 : 26,
            background: isLight
              ? palette.white.regular ?? ""
              : palette.black.regular ?? "",
          }}
        >
          <img className={"theme-icon"} src={isLight ? sunIcon : moonIcon} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ThemeSwitcher);
