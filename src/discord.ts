import { Message } from "discord.js";

export type ProcessedMessage = Message & {
  replied: boolean;
  prefixlessContent: string;
  prefixMatch: RegExpExecArray | null;
};
