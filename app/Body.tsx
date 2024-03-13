import { useMemo } from "react";
import { ColorTheme, useColorTheme } from "./floro_infra/contexts/themes/ColorThemeProvider";
import { useFloroThemes } from "./floro_infra/contexts/themes/FloroThemesProvider";
import { useThemePreference } from "./floro_infra/contexts/themes/ThemePreferenceProvider";
import { useFloroPalette } from "./floro_infra/contexts/palette/FloroPaletteProvider";
import { Palette, Shade } from "./floro_infra/floro_modules/palette-generator";

const Body = ({ children }: { children: React.ReactNode }) => {
  const colorTheme = useColorTheme();
  const palette = useFloroPalette();
  const themes = useFloroThemes();
  const {currentTheme} = useThemePreference();
  const rootThemes = useMemo(() => {
    return Object.keys(colorTheme).reduce((s, key) => {
      const defaultColor = `${s}  --${key}: ${
        colorTheme[key as keyof ColorTheme].default
      };\n`;
      return Object.keys(colorTheme[key as keyof ColorTheme].variants).reduce(
        (str, variantKey) => {
          return `${str}  --${key}-${variantKey}: ${
            colorTheme[key as keyof ColorTheme].variants[variantKey] ??
            colorTheme[key as keyof ColorTheme].default
          };\n`;
        },
        defaultColor
      );
    }, `  --background:${themes.themeDefinitions[currentTheme].background};\n`);
  }, [colorTheme, currentTheme, themes.themeDefinitions]);

  const paletteDefs = useMemo(() => {
    return Object.keys(palette).reduce((s, colorKey) => {
        return Object.keys(palette[colorKey as keyof typeof palette]).reduce((str, shadeKey) => {
            return `${str}  --palette-${colorKey}-${shadeKey}: ${palette[colorKey as keyof Palette][shadeKey as keyof Shade] ?? 'transparent'};\n`
        }, s);
    }, '');
  }, [palette])
  const themeCSS = `:root {\n${rootThemes}\n${paletteDefs}}`;
  return (
    <body>
      <style dangerouslySetInnerHTML={{ __html: themeCSS }}></style>
      {children}
    </body>
  );
};

export default Body;