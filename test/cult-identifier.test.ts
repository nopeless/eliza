import { identifyCults } from "@/lib/cult-identifier";
import { readFileLines } from "@/lib/util";

it(`identifyCults`, async () => {
  const names = readFileLines(`./test/resources/nicknames.txt`);

  const { cults } = await identifyCults(
    names.map((name) => ({
      id: name,
      name,
    }))
  );

  expect(cults).to.matchSnapshot();
});
