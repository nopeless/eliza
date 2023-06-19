import { identifyCults } from "@/lib/cult-identifier";
import { indentTrailing, readFileLines } from "@/lib/util";

it(`identifyCults`, async () => {
  const names = readFileLines(`./test/resources/nicknames.txt`);

  const cults = await identifyCults(
    names.map((name) => ({
      id: name,
      name,
    }))
  );

  for (const cult of cults) {
    const s =
      `${cult.name} (${cult.associates.length})\n` +
      indentTrailing(cult.associates.map((m) => m.name).join(`\n`), `  `, {
        indentFirstLine: true,
      });

    console.log(s);

    expect(cults).to.matchSnapshot();
  }
});
