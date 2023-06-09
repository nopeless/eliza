import { createChatReply } from "../../event.js";
import { legacyGoogleTranslate } from "../../lib/legacy-google-translate.js";
import { toWordList } from "../../lib/nlp.js";
import { sortBySimilarity } from "../../lib/util.js";
// import compromise from "compromise";
import { langFile, reverseLangFile } from "../../lib/langfile.js";
import { MessageType } from "discord.js";

export default createChatReply({
  // wild card
  name: `translate`,
  aliases: [`tl`],
  description: `translate text to another language`,
  async exec(message) {
    let [_, to, ctx] =
      message.prefixlessContent.match(
        /^(?:translate\s+(?:(?:in)?to\s+)?(\w+[\w\s]+?):)(?:\s+(.*))?/i
      ) ??
      message.prefixlessContent.match(
        /^(?:([A-Za-z]+)\s+)?(?:translate|tl)(?::?\s+(.*))?/i
      ) ??
      [];

    let hint = ``;

    to = to?.toLowerCase();

    if (!_) {
      // attempt to use different regex
      [_, ctx, to] =
        message.prefixlessContent.match(
          /^(?:translate|what(?:'?| i)s) (.+?) (?:(?:in|to)(\s+\w+)){1,3}/i
        ) ?? [];
    }

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
      // check for mentions
      const mid = await message.fetchReference();

      if (mid?.type === MessageType.Reply) {
        const replyMsg = await message.channel.messages.fetch(mid);

        if (replyMsg) {
          ctx = replyMsg.content;
        } else {
          throw new Error(`failed to fetch reply message. Report this bug`);
        }
      } else {
        return `missing translation context. example: "tl こんにちは世界"`;
      }
    }

    // do a quick ctx check
    const toLang = ctx.match(/^(\w+)/)?.[1];
    if (toLang) {
      if (toLang.length === 2) {
        // user is trying to supply a language code
        if (!langFile[toLang]) {
          hint = `'${toLang}' seems like a language code. Did you forget a colon? ex) translate ja: poco loco`;
        }
      } else {
        // is it a language?
        const temp = reverseLangFile[toLang];
        if (temp) {
          hint = `'${toLang}' seems like a language name. Did you forget a colon? ex) translate japanese: poco loco`;
        }
      }
    }

    if (to) {
      // check if the language translating to is
      // a valid language code
      if (to.length === 2) {
        // user is trying to supply a language code
        if (!langFile[to]) {
          return `invalid language code ${to}. refer https://en.wikipedia.org/wiki/ISO_639-1`;
        }
      } else {
        // user is attempting to supply a language name
        // check if it's a valid language name

        const temp = reverseLangFile[to];
        if (!temp) {
          // sort keys by similarity to the language name
          const keys = sortBySimilarity(to, Object.keys(reverseLangFile));

          // get top 3 suggestions
          const suggestions = keys
            .slice(0, 3)
            .map((k) => `${k} (${langFile[reverseLangFile[k]!]})`);

          return `language ${to} was not found. maybe try ${toWordList(
            suggestions,
            `or`
          )}. try finding the 2 letter language code from https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes`;
        }
        to = temp;
      }
    }

    const { detectedLanguage, translated } = await legacyGoogleTranslate(
      ctx,
      to
    );

    return message.reply(
      `translated from ${detectedLanguage[1]} to ${
        langFile[to ?? `en`]
      }:\n${translated}` + (hint ? `\n> ${hint}` : ``)
    );
  },
});
