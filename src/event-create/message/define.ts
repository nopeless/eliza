import { createChatReply } from "../../event";
import { defineWord } from "../../lib/apis";

export default createChatReply({
  name: `define`,
  description: `usage: define <word>`,
  async exec(message) {
    const [_, word] =
      message.prefixlessContent.match(/^def(?:ine)?(?: (.+))?$/) ?? [];

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
