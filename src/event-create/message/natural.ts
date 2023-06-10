import { createChatReply } from "../../event";
import { doc } from "../../lib/doc";

export default createChatReply({
  name: `natural`,
  description: `automated replies for a lot of things`,
  async exec(message) {
    const r = await doc(message.prefixlessContent);

    if (r.answer) {
      return message.reply(r.answer);
    }
  },
});
