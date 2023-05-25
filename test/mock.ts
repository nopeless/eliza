import { ChannelType } from "discord.js";

// @ts-ignore
export class MockMessage {
  replies: string[] = [];
  public channel = {
    type: ChannelType.GuildText,
  };
  constructor(public content: string) {}

  async reply(content: string) {
    this.replies.push(content);
    return;
  }
}
