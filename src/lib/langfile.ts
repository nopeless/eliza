import { readFileSync } from "fs";
import { join } from "path";
import dirname from "./dirname";
import { capitalize } from "./util";

export const langFile: Record<string, string> = JSON.parse(
  readFileSync(join(dirname(import.meta), `./langcode.json`), {
    encoding: `utf8`,
  })
);

export const reverseLangFile: Record<string, string> = Object.create(null);

for (let [key, value] of Object.entries(langFile)) {
  value = value.toLowerCase();

  const parts = value.split(/\W+/g);

  // use space joined parts
  for (let i = 0; i < Math.min(parts.length, 4); i++) {
    const firstPart = parts.slice(0, i + 1).join(` `);

    reverseLangFile[firstPart] = key;

    // extra work
    const p = parts[i]!;
    const r = (() => {
      if (p.match(/i$/)) {
        return p.replace(/i$/, ``);
      }
      if (p.match(/ese$/)) {
        return p.replace(/ese$/, ``);
      }
      if (p.match(/an$/)) {
        return p.replace(/n$/, ``);
      }
      if (p.match(/ian$/)) {
        return p.replace(/ian$/, `y`);
      }
    })();

    if (r) {
      reverseLangFile[r] = key;
    }
  }
}

/**
 * helps the bot detect proper nouns
 */
export function detectLanguageReferenceAndAutocorrect(context: string) {
  return context.replace(/\b\w+\b/, (m) => {
    const lang = reverseLangFile[m.toLowerCase()];
    if (lang) {
      return capitalize(lang);
    }
    return m;
  });
}
