import { createChatReply } from "../../event";
import { promiseAllMap } from "../../lib/util";

export default createChatReply({
  name: `suggestion`,
  async exec(message) {
    if (
      message.prefixlessContent.match(
        /^(?:(?:view|list|show|open) suggestions?|(?:view|list|show|open) suggestions?)/
      )
    ) {
      if (this.data.suggestions.length === 0) {
        await message.reply(`There are no suggestions yet.`);
        return;
      }
      await message.reply(
        `Here are the suggestions:\n${(
          await promiseAllMap(this.data.suggestions, async (s) => {
            const user = await this.users.fetch(s.author);
            const username = user ? user.username : `Unknown User`;
            return `${username}: ${s.content}`;
          })
        ).join(`\n`)}`
      );
      return;
    }

    const [deleteCommand, deleteMessage] =
      message.prefixlessContent.match(
        /^(?:suggestion delete|delete suggestion) (.+)/
      ) ?? [];

    if (deleteCommand) {
      if (!this.hell.can(message.author, `saveFile`))
        return `You don't have permissions`;
      if (!deleteMessage) {
        await message.reply(`Please specify a suggestion to delete.`);
        return;
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
        await message.reply(
          `Multiple suggestions were found matching ${deleteMessage}. Please be more specific.`
        );
        return;
      }
      this.data.suggestions = newSuggestions;
      return `✅`;
    }

    if (
      message.prefixlessContent.match(
        /^(?:clear suggestions?|suggestions? clear)/
      )
    ) {
      if (!this.hell.can(message.author, `saveFile`))
        return `You don't have permissions`;
      this.data.suggestions = [];
      return `✅`;
    }

    const [_, suggestion] =
      message.prefixlessContent.match(/^suggestion(?:\s(.+))?$/) ?? [];

    if (!_) return;

    if (
      this.data.suggestions.filter((v) => v.author === message.author.id)
        .length >= 3
    ) {
      await message.reply(
        `You have reached the suggestion limit. Please wait for your suggestions to be reviewed.`
      );
      return;
    }

    if (!suggestion) {
      return `Please specify a suggestion. ex) suggestion add a way to view someone's minecraft skin`;
    }

    this.data.suggestions.push({
      author: message.author.id,
      content: suggestion,
    });

    await message.reply(
      `Thank you for your suggestion! It has been recorded and will be reviewed by the developers.`
    );
  },
});
