import { ChannelType } from "discord.js";
import { client } from "./fixtures";

describe(`translate`, () => {
  test(`incorrect usage`, async () => {
    const m = await client.sendExpect(
      `eliza japan translate poco loco`,
      /translated.+spanish/i
    );

    expect(m).to.matchSnapshot();
  });
});

describe(`hi`, () => {
  test(`hi`, async () => {
    const m = await client.sendExpect(`eliza hello`, /hello|hi/i, {
      type: ChannelType.DM,
    });

    expect(m).to.matchSnapshot();
  });
});
