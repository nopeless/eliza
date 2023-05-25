import { createChatReply } from "../../event";
import { legacyGoogleTranslate } from "../../lib";
import natural from "natural";
import { toWordList } from "../../lib/nlp";
import { sortByKey } from "../../lib/util";
// import compromise from "compromise";
import { langFile, reverseLangFile } from "@/lib/langfile";

export default createChatReply({
  // wild card
  name: `translate`,
  async exec(message) {
    // eslint-disable-next-line prefer-const
    let [_, to, ctx] =
      message.prefixlessContent.match(
        /^(?:([A-Za-z]+)\s+)?(?:translate|tl)(?:\s+(.*))?/
      ) ?? [];

    to = to?.toLowerCase();

    if (!_) {
      if (message.content.match(/translate|trans/)) {
        return `If you are trying to translate, ask help translate`;
      }
      // TODO check mention of language
      // const nlpMatch = compromise(message.content).match(``)
      // if ()
      // probably not a translate command
      return;
    }

    if (!ctx) {
      return `missing translation context. example: "tl こんにちは世界"`;
    }

    if (to) {
      // check if the language translating to is
      // a valid language code
      if (to.length === 2) {
        // user is trying to supply a language code
        if (!langFile[to]) {
          return `invalid language code ${to}. refer https://en.wikipedia.org/wiki/ISO_639-1`;
        }
      }

      // user is attempting to supply a language name
      // check if it's a valid language name

      const temp = reverseLangFile[to];
      if (!temp) {
        // sort keys by similarity to the language name
        const keys = sortByKey(Object.keys(reverseLangFile), (k) =>
          k.includes(to)
            ? (k.length - to.length) / k.length
            : natural.LevenshteinDistance(to, k, {
                insertion_cost: 0.5,
                deletion_cost: 1,
                substitution_cost: 1,
              }) * 1
        );

        console.log(
          natural.LevenshteinDistance(`japan`, `akan`, {
            insertion_cost: 0.5,
            deletion_cost: 1,
            substitution_cost: 1,
          })
        );

        // get top 3 suggestions
        const suggestions = keys
          .slice(0, 3)
          .map((k) => `${k} (${langFile[reverseLangFile[k]]})`);

        return `language ${to} was not found. maybe try ${toWordList(
          suggestions,
          `or`
        )}. try finding the 2 letter language code from https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes`;
      }
      to = temp;
    }

    const { detectedLanguage, translated } = await legacyGoogleTranslate(
      ctx,
      to
    );

    message.reply(
      `translated from ${detectedLanguage[1]} to ${
        langFile[to ?? `en`]
      }:\n${translated}`
    );
  },
});
