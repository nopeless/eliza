import { Guild } from "discord.js";
import { createChatReply } from "../../event";
import {
  CultUser,
  calculateCults,
  calculateSegments,
} from "../../lib/cult-identifier";
import { Cache } from "spica-node/cache";

const cultCache = new Cache<string, Map<string, number>>({
  capacity: 1000,
  // 1 hour
  age: 1000 * 60 * 60,
});

async function getCultUsers(guild: Guild) {
  return [...(await guild.members.fetch()!).entries()].map(([k, v]) => ({
    name: v.displayName,
    id: k,
    numeralDiscriminator: null,
  })) as CultUser[];
}

export default createChatReply({
  name: `hello`,
  scope: [`GuildText`],
  aliases: [`hi`, `hey`, `greetings`],
  async exec(message) {
    const [_, query] =
      message.prefixlessContent.match(
        /(?:(?:search|view|find|show) )?cult(?:s|(?: (.+))?)/i
      ) ?? [];

    if (!_) return;

    const guild = await this.guilds.fetch(`493173110799859713`); // message.guild!;

    let segments = cultCache.get(guild.id);

    const cultUsers = await getCultUsers(guild);

    if (!segments) {
      segments = await calculateSegments(cultUsers);
      cultCache.set(guild.id, segments);
    }

    const cults = await calculateCults(segments, cultUsers);

    if (query) {
      const cult = cults.find((v) => v.identifier === query.toLowerCase());

      if (cult) {
        const msg = `**${cult.name}**\n${cult.associates
          .map((v) => `<@${v.id}>`)
          .map((v) => `> ${v}`)
          .join(`\n`)}`;

        return message.reply({
          content: msg,
          allowedMentions: {
            users: [],
          },
        });
      }

      return message.reply(
        `I couldn't find a cult with that name. This guild has [${cults.map(
          (v) => v.name
        )}]`
      );
    }

    return message.reply(
      `This guild has ${cults.length} cults: ${cults.map((v) => v.name)}`
    );
  },
});
