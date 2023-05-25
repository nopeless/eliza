import { GatewayIntentBits } from "discord.js";

import * as dotenv from "dotenv";
dotenv.config();

import { ElizaClient } from "./bot";

const client = new ElizaClient({
  dev: process.env.NODE_ENV !== `production`,
  ownerID: process.env.OWNER_ID ?? ``,
  prefix: `eliza `,
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

if (!process.env.DISCORD_TOKEN) {
  console.error(`DISCORD_TOKEN is not defined`);
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN).then(() => {
  console.log(`Logged in as ${client.user?.tag ?? `unknown`}`);
});
