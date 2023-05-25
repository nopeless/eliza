import { createChatReply } from "../../event";

export default createChatReply({
  name: `save file`,
  async exec(message) {
    if (!message.prefixlessContent.match(/^save[\s-]?file/)) return;

    if (!this.hell.can(message.author, `saveFile`)) return `no permission`;

    await this.saveFile();

    message.reply(`wrote save file`);
  },
});
