import { ChannelType } from "discord.js";
import { client } from "./fixtures";

describe(`translate`, () => {
  test(`translate syntax`, async () => {
    const m = await client.sendExpect(
      `eliza japan translate poco loco`,
      /translated.+spanish/i
    );

    expect(m).to.matchSnapshot();
  });
  test(`tl shorthand`, async () => {
    const m = await client.sendExpect(
      `Eliza en tl bonjour, monsieur`,
      /hello|good|morning/i
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

    console.log(m);
  });
});

describe(`help`, () => {
  test(`help nothing`, async () => {
    const m = await client.sendExpect(`eliza help`, /help with/i, {
      type: ChannelType.DM,
    });

    console.log(m);
  });
  test(`help correct match`, async () => {
    const m = await client.sendExpect(`eliza help translate`, /language/i, {
      type: ChannelType.DM,
    });

    expect(m).to.matchSnapshot();
  });
  test(`help vague match`, async () => {
    const m = await client.sendExpect(`eliza help translte it`, /mean/i, {
      type: ChannelType.DM,
    });

    expect(m).to.matchSnapshot();
  });
  test(`help not a command help`, async () => {
    const m = await client.sendExpect(
      `eliza help I need some guava juice but I can't find them in my store`,
      /I would/i,
      {
        type: ChannelType.DM,
      }
    );

    console.log(m);
  });
});
