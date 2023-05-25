import { createChatReply } from "../../event";

export default createChatReply({
  name: `exit`,
  description: `gracefully exit the application`,
  async exec(message) {
    if (message.prefixlessContent !== `exit`) return;
    if (!this.hell.can(message.author, `exitApplication`))
      return `You don't have permissions`;
    await message.reply(`bye!`);
    await this.destroy();
  },
});
