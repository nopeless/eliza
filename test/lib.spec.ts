import { groupby, sortByKey } from "@/lib/util";
import { getRandomQuote } from "@/lib/apis";
import { er } from "@/lib/regex-expander";

describe(`util`, () => {
  test(`sortby`, () => {
    const r = sortByKey([1, 2, 3], (o) => o);
    expect(r).to.deep.equal([1, 2, 3]);
  });
});

describe(`groupby`, () => {
  it(`should group an empty array into an empty array`, () => {
    const arr: number[] = [];
    const result = groupby(arr, (x) => x);
    expect(result).toEqual([]);
  });

  it(`should group an array of one element into a single group`, () => {
    const arr = [1];
    const result = groupby(arr, (x) => x);
    expect(result).toEqual([[1, [1]]]);
  });

  it(`should group an array of identical elements into a single group`, () => {
    const arr = [1, 1, 1, 1];
    const result = groupby(arr, (x) => x);
    expect(result).toEqual([[1, [1, 1, 1, 1]]]);
  });

  it(`should group an array of distinct elements into multiple groups`, () => {
    const arr = [1, 2, 3, 4];
    const result = groupby(arr, (x) => x % 2);
    expect(result).toEqual([
      [1, [1]],
      [0, [2]],
      [1, [3]],
      [0, [4]],
    ]);
  });

  it(`should group an array of objects by a property`, () => {
    const arr = [
      { name: `Alice`, age: 25 },
      { name: `Bob`, age: 30 },
      { name: `Charlie`, age: 25 },
    ];
    const result = groupby(arr, (x) => x.age);
    expect(result).toEqual([
      [25, [{ name: `Alice`, age: 25 }]],
      [30, [{ name: `Bob`, age: 30 }]],
      [25, [{ name: `Charlie`, age: 25 }]],
    ]);
  });

  it(`should group an array of strings by length`, () => {
    const arr = [`a`, `bb`, `ccc`, `dddd`];
    const result = groupby(arr, (x) => x.length);
    expect(result).toEqual([
      [1, [`a`]],
      [2, [`bb`]],
      [3, [`ccc`]],
      [4, [`dddd`]],
    ]);
  });
});

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

describe(`RegexExpander`, () => {
  test(`should work`, () => {
    expect(er(`a`)).to.equal(`a`);

    expect(er(`a|b`)).to.match(/^a|b$/);
    expect(er(`a|b|c`)).to.match(/^a|b|c$/);
    expect(er(`a+b`)).to.match(/^a+b$/);
  });

  test(`should throw`, () => {
    function s(content: string) {
      expect(() => er(content), `Regex was "${content}"`).to.throw();
    }

    // all of these are invalid regexes
    s(`(?`);
    s(`(?:`);
    s(`(?:)`);
    s(`(?=)`);
    s(`(?!)`);
    s(`{`);
    s(`{1`);
    s(`(`);
    s(`)`);
    s(`[`);
    s(`]`);
    s(`{1,0}`);
    s(`{a}`);
    s(`{1,a}`);
    s(`{a,1}`);
    s(`{1,2,3}`);
  });
});
