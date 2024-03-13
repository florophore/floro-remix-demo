import metaFile from "../floro_infra/meta.floro.json";
import {
  Locales,
  LocalizedPhraseKeys,
  LocalizedPhrases,
  PhraseKeyDebugInfo,
  PhraseKeys,
  getDebugInfo,
  getPhraseValue,
} from "../floro_infra/floro_modules/text-generator";
import initText from "../floro_infra/floro_modules/text-generator/server-text.json";
import initLocaleLoads from "../floro_infra/floro_modules/text-generator/locale.loads.json";
import staticStructure from "../floro_infra/floro_modules/text-generator/static-structure.json";
import InMemoryKVAndPubSub from "./InMemoryKVAndPubSub";
import { PlainTextRenderers, plainTextRenderers } from "../floro_infra/renderers/PlainTextRenderer";
import { getRichText } from "../floro_infra/serverhelpers/text";

const FLORO_TEXT_PREFIX = `floro_text_repo:${staticStructure.hash}`;

export default class FloroTextStore {
  public buildText: LocalizedPhrases = initText as unknown as LocalizedPhrases;
  public currentText: LocalizedPhrases =
    initText as unknown as LocalizedPhrases;
  public currentTextString: string = JSON.stringify(initText);
  public currentLocaleLoads: { [key: string]: string } =
    initLocaleLoads as unknown as { [key: string]: string };
  public currentLocaleLoadsString: string = JSON.stringify(
    initLocaleLoads,
    null,
    2
  );
  public buildSha: string = metaFile.sha;
  public currentSha: string = metaFile.sha;
  public buildRepoId: string = metaFile.repositoryId;
  public buildBranch: string = "main";
  private static _instance?: FloroTextStore;

  public static getInstance(): FloroTextStore {
    if (!this._instance) {
        this._instance = new FloroTextStore();
        this._instance.onReady();
    }
    return this._instance;
  }

  public onReady() {
    // setup subscriber
    InMemoryKVAndPubSub.subscribe(
      `${FLORO_TEXT_PREFIX}:current_sha_changed:${metaFile.repositoryId}:${this.buildSha}`,
      async (sha: string) => {
        if (sha && this.currentSha != sha) {
          const textString = InMemoryKVAndPubSub?.get(
            `${FLORO_TEXT_PREFIX}:text:${metaFile.repositoryId}:${this.buildSha}`
          );
          if (textString) {
            const text = JSON.parse(textString) as LocalizedPhrases;
            this.currentText = text;
            this.currentSha = sha;
            this.currentTextString = JSON.stringify(text);
          }
          const localeLoadsString = InMemoryKVAndPubSub.get(
            `${FLORO_TEXT_PREFIX}:locale_loads:${metaFile.repositoryId}:${this.buildSha}`
          );
          if (localeLoadsString) {
            const localeLoads = JSON.parse(localeLoadsString) as {
              [key: string]: string;
            };
            this.currentLocaleLoads = localeLoads;
            this.currentLocaleLoadsString = localeLoadsString;
          }
        }
      }
    );

    // hydrate persisted state
    const currSha = InMemoryKVAndPubSub?.get(
      `${FLORO_TEXT_PREFIX}:current_sha:${metaFile.repositoryId}:${this.buildSha}`
    );
    if (currSha && this.currentSha != currSha) {
      const textString = InMemoryKVAndPubSub?.get(
        `${FLORO_TEXT_PREFIX}:text:${metaFile.repositoryId}:${this.buildSha}`
      );
      if (textString) {
        const text = JSON.parse(textString) as LocalizedPhrases;
        this.currentText = text;
        this.currentSha = currSha;
        this.currentTextString = textString;
      }

      const localeLoadsString = InMemoryKVAndPubSub?.get(
        `${FLORO_TEXT_PREFIX}:locale_loads:${metaFile.repositoryId}:${this.buildSha}`
      );
      if (localeLoadsString) {
        const localeLoads = JSON.parse(localeLoadsString) as {
          [key: string]: string;
        };
        this.currentLocaleLoads = localeLoads;
        this.currentLocaleLoadsString = localeLoadsString;
      }
    }
  }

  public async setText(
    newSha: string,
    text: LocalizedPhrases,
    localeLoads: { [key: string]: string }
  ) {
    // setting should be performed as a transaction
    await InMemoryKVAndPubSub.set(
      `${FLORO_TEXT_PREFIX}:current_sha:${metaFile.repositoryId}:${this.buildSha}`,
      newSha
    );
    await InMemoryKVAndPubSub.set(
      `${FLORO_TEXT_PREFIX}:text:${metaFile.repositoryId}:${this.buildSha}`,
      JSON.stringify(text)
    );
    await InMemoryKVAndPubSub.set(
      `${FLORO_TEXT_PREFIX}:locale_loads:${metaFile.repositoryId}:${this.buildSha}`,
      JSON.stringify(localeLoads, null, 2)
    );
    InMemoryKVAndPubSub.publish(
      `${FLORO_TEXT_PREFIX}:current_sha_changed:${metaFile.repositoryId}:${this.buildSha}`,
      newSha
    );
  }

  public getText(): LocalizedPhrases {
    return this.currentText;
  }
  public getTextString(): string {
    return this.currentTextString;
  }
  public getLocaleLoads(): { [key: string]: string } {
    return this.currentLocaleLoads;
  }
  public getLocaleLoadsString(): string {
    return this.currentLocaleLoadsString;
  }

  public getTextSubSet(localeCode: string, phraseKeys: Set<string>): string {
    const localizedPhraseKeys = {} as Record<
      keyof PhraseKeys,
      PhraseKeys[keyof PhraseKeys]
    >;
    const phraseKeyDebugInfo = {} as Record<
      keyof PhraseKeys,
      PhraseKeyDebugInfo[keyof PhraseKeys]
    >;
    for (const phraseKey of Array.from(phraseKeys) as Array<keyof PhraseKeys>) {
      localizedPhraseKeys[phraseKey] =
        this.currentText?.localizedPhraseKeys?.[
          localeCode as keyof LocalizedPhraseKeys
        ]?.[phraseKey];
      phraseKeyDebugInfo[phraseKey] =
        this.currentText?.phraseKeyDebugInfo?.[phraseKey];
    }
    return JSON.stringify({
      locales: this.currentText.locales,
      localizedPhraseKeys: {
        [localeCode]: localizedPhraseKeys,
      },
      phraseKeyDebugInfo,
    });
  }
}

export const getText = <
  K extends keyof PhraseKeys,
  ARGS extends {
    [KV in keyof PhraseKeys[K]["variables"]]: PhraseKeys[K]["variables"][KV];
  } & {
    [KCV in keyof PhraseKeys[K]["contentVariables"]]: string;
  } & {
    [KSC in keyof PhraseKeys[K]["styleClasses"]]: (
      content: string,
      styledContentName: keyof PhraseKeys[K]["styledContents"] & string
    ) => string;
  }
>(
  selectedLocaleCode: keyof LocalizedPhrases["locales"] & string,
  phraseKey: K,
  ...opts: keyof ARGS extends { length: 0 }
    ? [
        ARGS?,
        PlainTextRenderers<keyof PhraseKeys[K]["styledContents"] & string>?
      ]
    : [
        ARGS,
        PlainTextRenderers<keyof PhraseKeys[K]["styledContents"] & string>?
      ]
): string => {
  const textStore = FloroTextStore.getInstance();
  const floroText = textStore.getText();
  const args = opts[0] ?? ({} as ARGS);
  const renderers = opts?.[1] ?? plainTextRenderers;
  const debugInfo = getDebugInfo(initText.phraseKeyDebugInfo as PhraseKeyDebugInfo, phraseKey);
  const nodes = getPhraseValue<string, keyof Locales, K>(
    floroText,
    selectedLocaleCode,
    phraseKey,
    args
  );
  return renderers.render(nodes, renderers, debugInfo?.groupName, debugInfo?.phraseKey, selectedLocaleCode);
};

export const getRichTextComponent = <K extends keyof PhraseKeys>(
  selectedLocaleCode: keyof LocalizedPhrases["locales"] & string,
  phraseKey: K,
) => {
  const textStore = FloroTextStore.getInstance();
  const floroText = textStore.getText();
  return getRichText(floroText, selectedLocaleCode, phraseKey);
};


const pluckPhraseKeys = (
  phraseKeys: PhraseKeys,
) => {
  return (Object.keys(staticStructure.structure) as Array<keyof PhraseKeys>).reduce((acc, key) => {
    return {
      ...acc,
      [key]: phraseKeys[key]
    }
  }, {});
}

export const getFilteredText = (
  text: LocalizedPhrases,
  localeCode: keyof LocalizedPhrases["locales"]
): LocalizedPhrases => {
  if (text.localizedPhraseKeys[localeCode] && localeCode != "EN") {
    const localePhrases = pluckPhraseKeys(text.localizedPhraseKeys[localeCode]) as PhraseKeys;
    const enLocalePhrases = pluckPhraseKeys(text.localizedPhraseKeys["EN"]) as PhraseKeys;
    return {
      ...text,
      localizedPhraseKeys: {
        EN: enLocalePhrases,
        [localeCode]: localePhrases,
      } as unknown as LocalizedPhrases["localizedPhraseKeys"],
    };
  }

  const localePhrases = pluckPhraseKeys(text.localizedPhraseKeys["EN"]);
  return {
    ...text,
    localizedPhraseKeys: {
      EN: localePhrases,
    } as unknown as LocalizedPhrases["localizedPhraseKeys"],
  };
};