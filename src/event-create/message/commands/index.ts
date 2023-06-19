// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { inspect } from "util";
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
  // eval: createChatReply({
  //   name: `eval`,
  //   description: `evaluates javascript code`,
  //   async exec(message) {
  //     if (!message.prefixlessContent.match(/^eval/i)) return;
  //     if (!this.hell.can(message.author, `exitApplication`))
  //       return `You don't have permissions`;

  //     // double safety
  //     if (this.ownerID !== message.author.id)
  //       return `You don't have permissions`;

  //     // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unused-vars
  //     const client = this; // @ts-ignore

  //     let result: unknown = await eval?.(message.prefixlessContent.slice(4));

  //     if (typeof result !== `string`) result = inspect(result);

  //     return `\`\`\`js\n${result}\n\`\`\``;
  //   },
  // }),
} as const;
