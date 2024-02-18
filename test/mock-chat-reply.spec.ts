import { client } from "./fixtures.js";
import { readFileLines } from "@/lib/util.js";

describe(`translate`, () => {
  test(`eliza tl|translate`, async () => {
    const m = await client.sendExpect(
      `eliza tl`,
      /missing translation context/i
    );

    expect(m).to.matchSnapshot();
  });
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

describe.skipIf(!process.env.RAPID_API_KEY)(`define`, () => {
  test(`missing word`, async () => {
    const m = await client.sendExpect(`eliza define`, /specify/i);

    expect(m).to.matchSnapshot();
  });
  test(`proper`, async () => {
    const m = await client.sendExpect(`eliza define air`, /definition/i);

    expect(m).to.matchSnapshot();
  });
});

describe(`hi`, () => {
  test(`hi`, async () => {
    await client.sendExpect(`eliza hello`, /hello|hi|up|doing|good|hru|how/i);
  });
});

describe(`url unshorten`, () => {
  test(`rickroll`, async () => {
    client.sendExpect(`http://tiny.cc/mtd7vz`, /dQw4w9WgXcQ/);
  });
});

describe(`help`, () => {
  test(`help nothing`, async () => {
    client.sendExpect(`eliza help`, /help with/i);
  });
  test(`help correct match`, async () => {
    client.sendExpect(`eliza help translate`, /language/i);
  });
  test(`help vague match`, async () => {
    const m = await client.sendExpect(`eliza help translte it`, /mean/i);

    expect(m).to.matchSnapshot();
  });
  test(`help not a command help`, async () => {
    await client.sendExpect(
      `eliza help I need some guava juice but I can't find them in my store`,
      /I would/i
    );
  });
});

describe(`should not reply`, async () => {
  const messages = await readFileLines('test/resources/mock-comments.txt')
  for (const message of messages) {
    test(message, async () => {
      const m = await client.send(message);

      expect(m.mockReplies[0]).to.be.undefined;
    });
  }
});
