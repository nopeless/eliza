import { GatewayIntentBits, Partials } from "discord.js";

import * as dotenv from "dotenv";
dotenv.config();

import { ElizaClient } from "./bot";

const client = new ElizaClient({
  dev: process.env.NODE_ENV !== `production`,
  ownerID: process.env.OWNER_ID ?? ``,
  prefix: `eliza `,
  status: `you playing over there`,
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Message, Partials.Channel],
});

if (!process.env.DISCORD_TOKEN) {
  console.error(`DISCORD_TOKEN is not defined`);
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN).then(() => {
  console.log(`Logged in as ${client.user?.tag ?? `unknown`}`);
});
