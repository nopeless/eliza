import { getPropLowercase, sortBySimilarity } from "../../lib/util";
import { createChatReply } from "../../event";
import natural from "natural";

const LevenshteinDistance = natural.LevenshteinDistance;

export default createChatReply({
  name: `help`,
  description: `usage: help <command name>`,
  async exec(message) {
    const commands = (await import(`./index`)).default;

    const [_, commandName] =
      message.prefixlessContent.match(/^help(?:\s+(.*))?/) ?? [];

    let hint = ``;

    if (!commandName) {
      await message.reply(
        `What do you need help with? If you are asking for a command, try "help <command name>"`
      );
      return;
    }

    const prop = getPropLowercase(commands, commandName);

    if (prop) {
      const command = commands[prop];
      if (command.description) {
        await message.reply(`Here is the description\n${command.description}`);
      } else {
        await message.reply(
          `I'm sorry but there seems to be no description found for command '${prop}'`
        );
      }
      return;
    }

    // its not a direct command. perhaps a typo?
    // try to find closest match
    const closestMatch = sortBySimilarity(
      commandName,
      Object.keys(commands)
    )[0];

    if (closestMatch) {
      // calculate string similarity again
      const difference =
        Math.abs(LevenshteinDistance(commandName, closestMatch)) /
        closestMatch.length;

      if (difference < 0.5) {
        await message.reply(
          `Did you mean '${closestMatch}'? Try "help ${closestMatch}"`
        );
        return;
      } else {
        hint = `P.S. if you are trying to get help for a command, try "help <command name>"`;
      }
    }

    await message.reply(
      `I would love to help to my capabilities` + (hint ? `\n> ${hint}` : ``)
    );

    return;
  },
});
