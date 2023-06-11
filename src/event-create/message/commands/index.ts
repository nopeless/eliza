import { createChatReply } from "../../../event";
import { train } from "../../../lib/doc";

export default {
  exit: createChatReply({
    name: `exit`,
    aliases: [`quit`, `stop`, `shutdown`],
    description: `gracefully exit the application`,
    async exec(message) {
      if (!message.prefixlessContent.match(/exit|shut[\s-]?down/i)) return;

      if (!this.hell.can(message.author, `exitApplication`))
        return `You don't have permissions`;

      await message.reply(`bye!`);
      await this.destroy();
      console.log(`gracefully exited`);
    },
  }),
  train: createChatReply({
    name: `train`,
    description: `trains the nlp model`,
    async exec(message) {
      if (!message.prefixlessContent.match(/^train$/i)) return;

      if (!this.hell.can(message.author, `exitApplication`))
        return `You don't have permissions`;

      await train();

      return `🎉`;
    },
  }),
} as const;
