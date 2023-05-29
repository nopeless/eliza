import { sortBySimilarity } from "../../lib/util";
import { createChatReply } from "../../event";
import natural from "natural";

const LevenshteinDistance = natural.LevenshteinDistance;

export default createChatReply({
  name: `help`,
  aliases: [`?`, `h`, `info`, `command`, `commands`],
  description: `shows information about a command e.g. help <command name>`,
  async exec(message): Promise<void | string> {
    const commands = (await import(`./index`)).default;

    const [_, commandName] =
      message.prefixlessContent.match(/^help(?:\s+(.*))?/) ?? [];

    if (!_) return;

    if (
      message.mentions.users.size > 0 &&
      !message.mentions.has(message.client.user)
    ) {
      // definitely talking about others
      return;
    }

    let hint = ``;

    if (!commandName) {
      return `What do you need help with? If you are asking for a command, try "help <command name>"`;
    }

    const prop = (() => {
      for (const key of Object.keys(commands) as (keyof typeof commands)[]) {
        const aliases = commands[key]?.aliases ?? [];
        const cn = commandName.toLowerCase();

        if (
          [key.toLowerCase(), commands[key].name.toLowerCase()].includes(cn)
        ) {
          return key;
        }
        if (aliases.some((alias) => alias.toLowerCase() === cn)) {
          return key;
        }
      }
    })();

    if (prop) {
      const command = commands[prop];
      if (command.description) {
        await message.reply(`Here is the description\n${command.description}`);
        return;
      } else {
        return `I'm sorry but there seems to be no description found for command '${prop}'`;
      }
    }

    // its not a direct command. perhaps a typo?
    // try to find closest match
    const closestMatch = sortBySimilarity(
      commandName,
      Object.entries(commands).flatMap(([k, command]) => [
        k,
        command.name,
        ...(command.aliases ?? []),
      ])
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

    return (
      `I would love to help to my capabilities` + (hint ? `\n> ${hint}` : ``)
    );
  },
});
