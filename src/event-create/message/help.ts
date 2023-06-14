import { sortBySimilarity, swappableRegex } from "../../lib/util";
import { createChatReply, createChatReplyExec } from "../../event";
import natural from "natural";

const LevenshteinDistance = natural.LevenshteinDistance;

// apparently you can do circular imports, nice
import commands from "./index";
import { Message } from "discord.js";

const listCommands = createChatReplyExec(async function (message) {
  if (message.prefixlessContent.match(swappableRegex(/list/, /commands?/))) {
    return message.reply(
      `Here are the commands:\n${Object.entries(commands)
        .map(([key, command]) => {
          return `${key} - ${command.name}`;
        })
        .join(`\n`)}`
    );
  }
});

const commandHelp = createChatReplyExec(async function (message) {
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

      if ([key.toLowerCase(), commands[key].name.toLowerCase()].includes(cn)) {
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
    }
    return `I'm sorry but there seems to be no description found for command '${prop}'`;
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
    }
    hint = `P.S. if you are trying to get help for a command, try "help <command name>"`;
  }

  return (
    `I would love to help to my capabilities` + (hint ? `\n> ${hint}` : ``)
  );
});

export default createChatReply({
  name: `help`,
  aliases: [`?`, `h`, `info`, `command`, `commands`, `list`],
  description: `shows information about a command e.g. help <command name>`,
  async exec(message): // typedefs only needed for this module
  Promise<string | string[] | Message | undefined> {
    return (
      (await listCommands.bind(this)(message)) ??
      (await commandHelp.bind(this)(message))
    );
  },
});
