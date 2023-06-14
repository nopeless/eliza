import { ChannelType } from "discord.js";

// @ts-ignore
export class MockMessage {
  mockReplies: string[] = [];
  mockReactions: string[] = [];
  public channel: {
    type: ChannelType;
  };
  public author = {
    id: `nopeless`,
  };
  public mentions = {
    users: new Map(),
    has: () => false,
  };
  constructor(public content: string, options: { type?: ChannelType } = {}) {
    this.channel = {
      type: options.type ?? ChannelType.GuildText,
    };
  }

  async reply(message: string | { content: string }) {
    if (this.mockReplies.length > 0) {
      throw new Error(`Message already replied to`);
    }
    this.mockReplies.push(
      typeof message === `string` ? message : message.content
    );
  }

  async react(emoji: string) {
    this.mockReactions.push(emoji);
  }

  async fetchReference() {
    return undefined;
  }
}
