import natural, { DamerauLevenshteinDistanceOptions } from "natural";

const LevenshteinDistance = natural.LevenshteinDistance;

export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function sortByKey<T>(arr: T[], key: (o: T) => number) {
  // create cache
  const cache: Map<T, number> = new Map();

  for (const item of arr) {
    cache.set(item, key(item));
  }

  // sort
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return arr.sort((a, b) => cache.get(a)! - cache.get(b)!);
}

export function sortBySimilarity(
  key: string,
  strings: string[],
  optionsOverride: DamerauLevenshteinDistanceOptions = {}
) {
  const options = {
    insertion_cost: 0.5,
    deletion_cost: 1,
    substitution_cost: 1,
    ...optionsOverride,
  };

  return sortByKey(strings, (k) =>
    k.includes(key)
      ? (k.length - key.length) / k.length
      : LevenshteinDistance(key, k, options) * 1
  );
}

export function reverse(s: string) {
  return s.split(``).reverse().join(``);
}

export function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

export function getPropLowercase<T extends Record<string, unknown>>(
  obj: T,
  prop: string
) {
  for (const key in obj) {
    if (key.toLowerCase() === prop.toLowerCase()) {
      return key;
    }
  }
}

export async function promiseAllMap<
  T,
  F extends (arg: T, index: number) => unknown
>(arr: T[], fn: F): Promise<Awaited<ReturnType<F>>[]> {
  const promises = arr.map(fn) as ReturnType<F>[];
  const results = await Promise.all(promises);
  return results;
}

export const fakeTime = {
  readText: async function (text: string, speed = 100) {
    await sleep((text.length * 1000 * 0.2 * 60) / speed);
  },
  thinkText: async function (text: string, multiplier = 1) {
    // for now im going to assume that it takes 0.2 seconds to think 1 word
    await sleep(text.split(` `).length * 0.2 * 1000 * multiplier);
  },
  writeText: async function (text: string, wpm = 60) {
    // for now im going to assume that all characters take the same amount of time to type
    await sleep((text.length * 1000 * 0.2 * 60) / wpm);
  },
};
