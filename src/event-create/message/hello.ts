import { createChatReply } from "../../event";

export default createChatReply({
  name: `hello`,
  scope: [`DM`],
  exec(message) {
    if (message.author.id !== this.ownerID) return;
    message.reply(`hi!, command was ${message.prefixlessContent}`);
  },
});
