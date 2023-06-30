import { createChatReply } from "../../event.js";
import { doc } from "../../lib/doc.js";

export default createChatReply({
  name: `natural`,
  description: `automated replies for a lot of things`,
  async exec(message) {
    if (!message.content.match(/eliza/i)) return;

    const r = await doc(message.content);

    if (r.answer) {
      return r.answer;
    }
  },
});
