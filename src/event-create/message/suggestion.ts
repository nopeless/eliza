import { createChatReply } from "../../event.js";
import { er } from "../../lib/regex-expander.js";
import {
  indentTrailing,
  mergeRegex,
  promiseAllMap,
  swappableRegex,
} from "../../lib/util.js";

export default createChatReply({
  name: `suggestion`,
  aliases: [`suggest`, `bug`, `error`, `feature`],
  description: `Create a new suggestion e.g. suggest Bug when using suggestion command`,
  async exec(message) {
    if (
      message.prefixlessContent.match(
        swappableRegex(/view|list|show|open/, /suggestions?/)
      ) ||
      message.prefixlessContent.match(/^suggestions$/)
    ) {
      if (this.data.suggestions.length === 0) {
        return message.reply(`There are no suggestions yet.`);
      }
      return message.reply(
        `Here are the suggestions:\n${(
          await promiseAllMap(this.data.suggestions, async (s) => {
            const user = this.isReady()
              ? await this.users.fetch(s.author)
              : null;
            const username = user?.username ?? `Unknown User`;
            return indentTrailing(`${username}: ${s.content}`);
          })
        ).join(`\n`)}`
      );
    }

    const [deleteCommand, deleteMessage] =
      message.prefixlessContent.match(
        mergeRegex(swappableRegex(/delete|remove/, /suggestions?/), /\s+(.+)/)
      ) ?? [];

    if (deleteCommand) {
      if (!this.hell.can(message.author, `saveFile`))
        return `You don't have permissions`;
      if (!deleteMessage) {
        return message.reply(`Please specify a suggestion to delete.`);
      }

      const newSuggestions = this.data.suggestions.filter(
        (s) => !s.content.includes(deleteMessage)
      );

      if (this.data.suggestions.length === newSuggestions.length) {
        await message.reply(
          `No suggestions were found matching ${deleteMessage}.`
        );
        return;
      }

      if (this.data.suggestions.length !== newSuggestions.length + 1) {
        return message.reply(
          `Multiple suggestions were found matching ${deleteMessage}. Please be more specific.`
        );
      }
      this.data.suggestions = newSuggestions;
      return `✅`;
    }

    if (
      message.prefixlessContent.match(
        swappableRegex(/clear|delete|remove/, /suggestions?/)
      )
    ) {
      if (!this.hell.can(message.author, `saveFile`))
        return `You don't have permissions`;
      this.data.suggestions = [];
      return `✅`;
    }

    const [_, cmd, suggestion] =
      message.prefixlessContent.match(
        /^((?:(?:add|create|submit|register) )?suggestion|suggest)(?:\s(.+))?$/is
      ) ?? [];

    if (!_) return;

    if (
      this.data.suggestions.filter((v) => v.author === message.author.id)
        .length >= 3
    ) {
      return message.reply(
        `You have reached the suggestion limit. Please wait for your suggestions to be reviewed.`
      );
    }

    if (!suggestion) {
      return `Please specify a suggestion. ex) ${cmd} add a way to view someone's minecraft skin`;
    }

    this.data.suggestions.push({
      author: message.author.id,
      content: suggestion,
    });

    return message.reply(
      er`Thanks, (I'll let the devs know|your suggestion has been recorded)`
    );
  },
});
