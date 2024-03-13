import React from 'react';
import {ThemePreferenceProvider} from './ThemePreferenceProvider';
import {FloroThemesProvider} from './FloroThemesProvider';
import {ColorThemeProvider} from './ColorThemeProvider';
import { ThemeSet } from '../../floro_modules/themes-generator';

interface Props {
  children: React.ReactElement;
  initTheme?: keyof ThemeSet;
}

const ThemeMount = (props: Props) => {
  return (
    <FloroThemesProvider>
      <ThemePreferenceProvider initTheme={props.initTheme}>
        <ColorThemeProvider>{props.children}</ColorThemeProvider>
      </ThemePreferenceProvider>
    </FloroThemesProvider>
  );
};

export default React.memo(ThemeMount);
