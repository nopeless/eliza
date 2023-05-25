import { ElizaClient } from "@/bot";
import { MockMessage } from "./mock";

const client = new ElizaClient({
  prefix: `eliza `,
  intents: [],
}) as ElizaClient & {
  send(
    message: MockMessage | string,
    options?: ConstructorParameters<typeof MockMessage>[1]
  ): Promise<MockMessage>;
  sendExpect(
    message: MockMessage | string,
    expected: RegExp,
    options?: ConstructorParameters<typeof MockMessage>[1]
  ): Promise<string>;
};

client.send = async (
  message: MockMessage | string,
  options?: ConstructorParameters<typeof MockMessage>[1]
) => {
  message =
    typeof message === `string` ? new MockMessage(message, options) : message;

  // get event handlers
  const handlers = client.listeners(`messageCreate`);
  // call each handler, wrap in promise all
  await Promise.all(handlers.map((handler) => handler(message)));

  return message;
};

client.sendExpect = async (
  message: MockMessage | string,
  expected: RegExp,
  options?: ConstructorParameters<typeof MockMessage>[1]
) => {
  const m = await client.send(message, options);

  expect(m.mockReplies).to.have.length(1);

  expect(m.mockReplies[0]).to.match(expected);

  return m.mockReplies[0];
};

export { client };
