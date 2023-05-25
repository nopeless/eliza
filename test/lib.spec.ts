import { sortByKey } from "@/lib/util";

describe(`util`, () => {
  test(`sortby`, () => {
    const r = sortByKey([1, 2, 3], (o) => o);
    expect(r).to.deep.equal([1, 2, 3]);
  });
});
