import { sortByKey } from "@/lib/util";

describe(`util`, () => {
  test(`sortby`, () => {
    const r = sortByKey([1, 2, 3], (o) => o);
    expect(r).to.deep.equal([1, 2, 3]);
  });
});

import { getRandomQuote } from "@/lib/apis";

describe(`apis`, () => {
  test(`getRandomQuote`, async () => {
    const r = await getRandomQuote();
    expect(r).to.have.property(`_id`);
    expect(r).to.have.property(`content`);
    expect(r).to.have.property(`author`);
    expect(r).to.have.property(`tags`);
    expect(r).to.have.property(`authorSlug`);
    expect(r).to.have.property(`length`);
    expect(r).to.have.property(`dateAdded`);
    expect(r).to.have.property(`dateModified`);
  });
});
