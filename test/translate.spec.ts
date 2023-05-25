import { client } from "./fixtures";

test(`incorrect usage`, async () => {
  const m = await client.sendExpect(
    `eliza japan translate poco loco`,
    /translated.+spanish/i
  );

  expect(m).to.matchSnapshot();
});
