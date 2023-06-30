import { createChatReply } from "../../event.js";
import { er } from "../../lib/regex-expander.js";

export default createChatReply({
  name: `hello`,
  aliases: [`hi`, `hey`, `greetings`],
  async exec(message) {
    let m;
    if (
      (m = message.prefixlessContent.match(
        /^(?:hi|hello|(?:(?:wh?as?)?sup|(?:what'?s)\s+(?:good|up)))(\s+?:dog|g|bro(?:ther)?)?$/i
      ))
    ) {
      // TODO add variety
      await message.reply(
        m[0].match(/\b(?:s?up|whats?|good|dog)\b/)
          ? er`(sup|sup bro|whaddup|what's up|what's good|what's good bro|what's good broski)`
          : er`hi!?|hello!?|how are you doing\\?|what'?s up\\??`
      );
    }

    // why not use nlp here?
    else if (message.prefixlessContent.match(/^how are you$/i)) {
      await message.reply(
        er`(I'm|I am) (doing well|having a good (time|day)), thanks for asking!( (owo|uwu|-w-))?`
      );
    }

    // bye
    else if (message.prefixlessContent.match(/^(?:bye|goodbye)$/i)) {
      await message.reply(er`bye!|bye bye <3|see you later!`);
    }
  },
});
