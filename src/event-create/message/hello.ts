import { createChatReply } from "../../event";
import { er } from "../../lib/regex-expander";

export default createChatReply({
  name: `hello`,
  aliases: [`hi`, `hey`, `greetings`],
  async exec(message) {
    let m;
    if (
      (m = message.prefixlessContent.match(
        /^(?:hi|hello|(?:wh?as?)?sup|(?:what'?s)\s+(?:good|up))$/i
      ))
    ) {
      // TODO add variety
      await message.reply(
        m[0].match(/\bs?up|whats?|good\b/)
          ? `(sup|sup bro|whaddup|what's up|what's good|what's good bro|what's good broski)`
          : er`hi!?|hello!?|how are you doing\\?|what'?s up\\??`
      );
    }

    // why not use nlp here?
    if (message.prefixlessContent.match(/^how are you$/i)) {
      await message.reply(
        er`(I'm|I am) (doing well|having a good (time|day)), thanks for asking!( (owo|uwu|-w-))?`
      );
    }

    // bye
    if (message.prefixlessContent.match(/^bye|goodbye$/i)) {
      await message.reply(er`bye!|bye bye <3|see you later!`);
    }
  },
});
