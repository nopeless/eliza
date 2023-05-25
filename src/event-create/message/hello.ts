import { createChatReply } from "../../event";

export default createChatReply({
  name: `hello`,
  scope: [`DM`],
  async exec(message) {
    if (message.prefixlessContent !== `hello`) return;
    // TODO add variety
    await message.reply(`hi there!`);
  },
});
