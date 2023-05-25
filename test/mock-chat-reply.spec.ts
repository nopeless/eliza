import { ChannelType } from "discord.js";
import { client } from "./fixtures";

describe(`translate`, () => {
  test(`tl syntax`, async () => {
    const m = await client.sendExpect(
      `eliza japan translate poco loco`,
      /translated.+spanish/i
    );

    expect(m).to.matchSnapshot();
  });
  test(`natural syntax`, async () => {
    const m = await client.sendExpect(
      `eliza translate to japanese: poco loco`,
      /translated/i
    );

    expect(m).to.matchSnapshot();
  });
  test(`no colon required`, async () => {
    const m = await client.sendExpect(
      `eliza translate poco loco`,
      /translated/i
    );

    expect(m).to.matchSnapshot();
  });
  test(`forgot colon`, async () => {
    const m = await client.sendExpect(
      `eliza translate japanese poco loco`,
      /forg[eo]t/i
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
