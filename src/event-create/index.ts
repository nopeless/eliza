import { ClientEvents } from "discord.js";

import { createMessageCreateHandler } from "../event.js";

import message from "./message/index.js";

export default {
  // interactionCreate: interaction,
  messageCreate: createMessageCreateHandler(message),
} satisfies Partial<Record<keyof ClientEvents, unknown>>;
