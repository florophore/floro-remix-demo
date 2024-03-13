import { LocalizedPhrases } from "~/floro_infra/floro_modules/text-generator";

declare interface Window {
    __CDN_HOST__: string;
    __FLORO_TEXT__: LocalizedPhrases;
    __FLORO_LOCALE_LOADS__: { [key: string]: string };
}

declare global {
    interface Window {
        __CDN_HOST__: string;
        __FLORO_TEXT__: LocalizedPhrases;
        __FLORO_LOCALE_LOADS__: { [key: string]: string };
    }
  }