import { createChatReply } from "../../event.js";
import { getRandomQuote } from "../../lib/apis.js";

export default createChatReply({
  name: `quote`,
  aliases: [`word`, `motivation`],
  async exec(message) {
    const [_] =
      message.prefixlessContent.match(
        /^(?:random quote|give me a (?:random )?quote)$/
      ) ?? [];

    if (!_) return;

    const quote = await getRandomQuote();

    return message.reply(
      `${quote.content.toLocaleLowerCase()} - ${quote.author}`
    );
  },
});
