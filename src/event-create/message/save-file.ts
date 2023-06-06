import { createChatReply } from "../../event";

export default createChatReply({
  name: `save file`,
  description: `internal command`,
  async exec(message) {
    if (!message.prefixlessContent.match(/^save[\s-]?file/i)) return;

    if (!this.hell.can(message.author, `saveFile`)) return `no permission`;

    await this.saveFile();

    return message.reply(`wrote save file`);
  },
});
