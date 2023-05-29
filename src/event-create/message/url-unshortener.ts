import { createChatReply } from "../../event";
// @ts-ignore
import U from "url-unshort";
const uu = new U() as { expand: (url: string) => Promise<string | undefined> };

const urlRegex =
  /https?:\/\/((?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.([a-zA-Z0-9()]{1,6}))\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/g;

export default createChatReply({
  name: `url unshortener`,
  description: `this is a passive module that will automatically unshorten URLs that are sent in the chat`,
  async exec(message) {
    const pool = [];

    for (const url of message.content.matchAll(urlRegex)) {
      const newUrl = await uu.expand(url[0]);
      if (!newUrl) continue;
      pool.push({ url, newUrl });
    }

    if (pool.length === 0) return;

    await message.reply({
      allowedMentions: {
        repliedUser: false,
      },
      content:
        pool.length === 1
          ? `Unshortened URL: <${pool[0]!.newUrl}>`
          : `Unshortened URLs:\n${pool
              .map((x) => `<${x.url[0]}> ➤ <${x.newUrl}>`)
              .join(`\n`)}`,
    });
  },
});
