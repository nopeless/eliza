import { ClientEvents } from "discord.js";

import { createMessageCreateHandler } from "../event";

import message from "./message";

export default {
  // interactionCreate: interaction,
  messageCreate: createMessageCreateHandler(message),
} satisfies Partial<Record<keyof ClientEvents, unknown>>;
