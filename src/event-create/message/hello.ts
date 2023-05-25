import { createChatReply } from "../../event";

export default createChatReply({
  name: `hello`,
  async exec(message) {
    let m;
    if (
      (m = message.prefixlessContent.match(
        /^(?:hi|hello|(?:wh?as?)?sup|(?:what'?s)\s+(?:good|up))$/
      ))
    ) {
      // TODO add variety
      await message.reply(
        m[0].match(/\bup|whats?|good\b/) ? `sup` : `hi there!`
      );
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
