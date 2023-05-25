import { createChatReply } from "../../event";
import { defineWord } from "../../lib/apis";

export default createChatReply({
  name: `define`,
  description: `usage: define <word>`,
  async exec(message) {
    const [_, word] =
      message.prefixlessContent.match(/^def(?:ine)?(?: (.+))?$/) ?? [];

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

    const { definition } = (await defineWord(word)) ?? {};

    if (definition) {
      await message.reply(`Here is the definition of '${word}'\n${definition}`);
    } else {
      await message.reply(`Something went wrong, sorry!`);
    }
  },
});
