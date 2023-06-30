import { langFile } from "./langfile.js";

export async function legacyGoogleTranslate(content: string, lang = `en`) {
  const res = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q="${encodeURI(
      content
    )}"`
  ).then((r) => r.json());
  return {
    translated: res[0][0][0] as string,
    /**
     * [language code, language name]
     */
    detectedLanguage: [res[2] as string, langFile[res[2]] as string],
  };
}
