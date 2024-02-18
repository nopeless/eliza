import {
  CultUser,
  calculateCults,
  calculateSegments,
  cultCacheExport,
  cultCacheImport,
  segmenter,
} from "@/lib/cult-identifier.js";
import { readFileLines } from "@/lib/util.js";

function u(id: string) {
  return {
    id,
    name: id,
    numeralDiscriminator: null,
  } as CultUser;
}

it(`segmenter`, async () => {
  expect(segmenter(`jacob_loves_stem`)).to.deep.equal([
    `Jacob`,
    `Loves`,
    `Stem`,
  ]);
});
it(`identifyCults`, async () => {
  const names = await readFileLines(`./test/resources/nicknames.txt`);

  // takes around 190ms
  const segments = await calculateSegments(names.map(u));

  // takes around 1ms
  const segmentsCopy = cultCacheImport(cultCacheExport(segments));

  // takes around
  // 138ms
  const cults = await calculateCults(segments, names.map(u));

  expect(cults).to.matchSnapshot();

  // takes around 4ms
  const myCult = await calculateCults(
    segmentsCopy,
    [u(`M2A FunkyCat`), u(`Morbing FunkyCow`)],
    {
      skipCultPopulationValidation: true,
    }
  );

  expect(myCult).to.matchSnapshot();
});
