import { ChannelType } from "discord.js";

// @ts-ignore
export class MockMessage {
  replies: string[] = [];
  public channel: {
    type: ChannelType;
  };
  constructor(public content: string, options: { type?: ChannelType } = {}) {
    this.channel = {
      type: options.type ?? ChannelType.GuildText,
    };
  }

  async reply(content: string) {
    this.replies.push(content);
    return;
  }
}
