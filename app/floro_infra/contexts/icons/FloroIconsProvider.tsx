"use client"

import React, {useContext, useMemo} from 'react';
import metaFile from '../../meta.floro.json';
import initIcons from '../../floro_modules/icon-generator/index';
import {getJSON} from '@floro/icon-generator';
import { useWatchFloroState} from '../../hooks/watch';
import {Icons} from '../../floro_modules/icon-generator/types';
import { useThemePreference } from '../themes/ThemePreferenceProvider';

const FloroIconsContext = React.createContext(initIcons);
export interface Props {
  children: React.ReactElement;
}

export const FloroIconsProvider = (props: Props) => {
  const icons = useWatchFloroState(metaFile.repositoryId, initIcons, getJSON);

  return (
    <FloroIconsContext.Provider value={icons}>
      {props.children}
    </FloroIconsContext.Provider>
  );
};

export const useFloroIcons = () => {
    return useContext(FloroIconsContext);
}

export const useIcon = <
  T extends keyof Icons,
  K extends Icons[T],
  V extends K["variants"]
>(
  key: T,
  variant?: string & keyof V
): string => {
  const { currentTheme } = useThemePreference();
  const icons = useFloroIcons();
  return useMemo(() => {
    const icon = icons[key] as Icons[T];
    if (variant && icon?.variants && icon.variants[variant as keyof typeof icon.variants]) {
      const variantValues = icon.variants[variant as keyof typeof icon.variants];
      if (variantValues[currentTheme]?.['src']) {
        return variantValues[currentTheme]?.['src'];
      }
      return variantValues[currentTheme];
    }
    if ((icons[key].default?.[currentTheme] as unknown as {src: string})?.['src']) {
      return (icons[key].default?.[currentTheme] as unknown as {src: string})?.['src'];
    }
    return icons[key].default?.[currentTheme];
  }, [icons, currentTheme, variant, key]);
};
