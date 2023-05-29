import { createChatReply } from "../../event";
import { defineWord } from "../../lib/apis";

const nonWords = Object.fromEntries(
  [
    `a`,
    `an`,
    `the`,
    `what`,
    `is`,
    `are`,
    `am`,
    `i`,
    `you`,
    `he`,
    `she`,
    `it`,
    `we`,
    `they`,
    `me`,
    `him`,
    `her`,
    `us`,
    `them`,
    `my`,
    `your`,
    `his`,
    `her`,
    `our`,
    `their`,
    `mine`,
    `yours`,
    `his`,
    `hers`,
    `ours`,
    `theirs`,
    `this`,
    `that`,
    `these`,
    `those`,
    `here`,
    `there`,
    `who`,
    `whom`,
    `whose`,
    `which`,
    `what`,
    `whatever`,
    `whoever`,
    `whomever`,
    `whichever`,
    `when`,
    `where`,
    `why`,
    `how`,
    `however`,
    `whenever`,
    `wherever`,
    `however`,
    `no`,
    `not`,
    `none`,
    `nobody`,
    `nothing`,
    `nowhere`,
    `never`,
    `neither`,
    `nor`,
    `none`,
    `nobody`,
    `nothing`,
    `nowhere`,
  ].map((word) => [word, true])
);

function anyMatch(words: string[], triggers: Record<string, unknown>) {
  return words
    .map((w) => w.toLowerCase())
    .some((word) => Object.hasOwnProperty.call(triggers, word));
}

export default createChatReply({
  name: `define`,
  aliases: [`def`, `what is`, `what's`],
  description: `Look up a word in the dictionary e.g. define photosynthesis`,
  async exec(message) {
    const [_, word] =
      message.prefixlessContent.match(
        /^(?:def(?:ine)|what(?: i|'?)s)?(?:\s(?:(?:a|an|the)\s)?(.+))?$/
      ) ?? [];

    if (!_) return;

    if (!process.env.RAPID_API_KEY) {
      await message.reply(
        `Sorry, I can't define words right now because I'm missing the api key. Please try again later.`
      );
      return;
    }

    if (!word) {
      return `Please specify a word to define. ex) define hello`;
    }

    if (anyMatch(word.split(/\s+/), nonWords)) {
      // this doesn't seem like a definition question
      return;
    }

    let definition: string;
    try {
      definition = ((await defineWord(word)) ?? {}).definition;
    } catch {
      await message.reply(
        `Sorry, I can't define words right now because the api is down. Please try again later.`
      );
      return;
    }
    if (definition) {
      await message.reply(`Here is the definition of '${word}'\n${definition}`);
    } else {
      await message.reply(`No definitions were found for ${word}`);
    }
  },
});
