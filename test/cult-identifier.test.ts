import {
  calculateCults,
  calculateSegments,
  cultCacheExport,
  cultCacheImport,
} from "@/lib/cult-identifier";
import { readFileLines } from "@/lib/util";

function u(id: string) {
  return {
    id,
    name: id,
  };
}

it(`identifyCults`, async () => {
  const names = readFileLines(`./test/resources/nicknames.txt`);

  const segments = await calculateSegments(names.map(u));

  const segmentsCopy = cultCacheImport(cultCacheExport(segments));

  const cults = await calculateCults(segments, names.map(u));

  expect(cults).to.matchSnapshot();

  const myCult = await calculateCults(
    segmentsCopy,
    [u(`M2A FunkyCat`), u(`Morbing FunkyCow`)],
    {
      skipCultPopulationValidation: true,
    }
  );

  expect(myCult).to.matchSnapshot();
});
