import { createChatReply } from "../../event";

export default createChatReply({
  name: `hello`,
  async exec(message) {
    if (message.prefixlessContent.match(/^hi|hello$/)) {
      // TODO add variety
      await message.reply(`hi there!`);
    }

    // why not use nlp here?
    if (message.prefixlessContent.match(/^how are you$/)) {
      await message.reply(`I'm doing well, thanks for asking!`);
    }

    // bye
    if (message.prefixlessContent.match(/^bye|goodbye$/)) {
      await message.reply(`bye!`);
    }
  },
});
