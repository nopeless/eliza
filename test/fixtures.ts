import { ElizaClient } from "@/bot";
import { MockMessage } from "./mock";

const client = new ElizaClient({
  prefix: `eliza `,
  intents: [],
}) as ElizaClient & {
  send(message: MockMessage | string): Promise<MockMessage>;
  sendExpect(message: MockMessage | string, expected: RegExp): Promise<string>;
};

client.send = async (message: MockMessage | string) => {
  message = typeof message === `string` ? new MockMessage(message) : message;

  // get event handlers
  const handlers = client.listeners(`messageCreate`);
  // call each handler, wrap in promise all
  await Promise.all(handlers.map((handler) => handler(message)));

  return message;
};

client.sendExpect = async (message: MockMessage | string, expected: RegExp) => {
  const m = await client.send(message);

  expect(m.replies).to.have.length(1);

  expect(m.replies[0]).to.match(expected);

  return m.replies[0];
};

export { client };
